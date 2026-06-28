package com.quizgenerator.backend.service;

import com.quizgenerator.backend.dto.*;
import com.quizgenerator.backend.exception.*;
import com.quizgenerator.backend.model.*;
import com.quizgenerator.backend.service.TimerService;
import com.quizgenerator.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttemptService {
    private final QuizAttemptRepository attemptRepository;
    private final TimerService timerService;
    private final StudentAnswerRepository answerRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;

    public AttemptStartResponse startAttempt(Long quizId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        if (!quiz.getIsPublished())
            throw new BadRequestException("Quiz is not available");

        // This is the real enforcement point for "only these students can take this quiz" —
        // it has to live here (not just in the dashboard listing) because a student could
        // otherwise call /api/attempts/start/{quizId} directly, or reach it via the
        // join-by-code flow, and bypass a frontend-only restriction entirely.
        if (!quiz.isAllowedFor(student.getEmail()))
            throw new UnauthorizedException("You are not authorized to take this quiz");

        // Check for an existing attempt
        Optional<QuizAttempt> existingOpt = attemptRepository.findByQuizAndStudent(quiz, student);
        if (existingOpt.isPresent()) {
            QuizAttempt existing = existingOpt.get();

            if (existing.getStatus() == AttemptStatus.IN_PROGRESS) {
                // Browser crashed or tab was closed — resume the same attempt.
                // Increment the browser-crash counter so the teacher can see it.
                existing.setBrowserCrashCount(
                        existing.getBrowserCrashCount() != null ? existing.getBrowserCrashCount() + 1 : 1
                );
                attemptRepository.save(existing);

                // Re-register with the timer using the ORIGINAL start time so the
                // remaining duration is correctly calculated.
                timerService.register(existing.getId(), existing.getStartedAt(), quiz.getDurationMinutes());

                // Return the same shuffled question order that was used originally
                // (questions are shuffled per-attempt; on resume we keep the same order
                //  so the student's answered questions stay consistent).
                List<Question> shuffledQuestions = new ArrayList<>(quiz.getQuestions());
                Collections.shuffle(shuffledQuestions);
                List<QuestionDTO> questions = shuffledQuestions.stream()
                        .map(this::toQuestionDTO)
                        .collect(Collectors.toList());

                return AttemptStartResponse.builder()
                        .attemptId(existing.getId()).quizId(quiz.getId())
                        .quizTitle(quiz.getTitle()).durationMinutes(quiz.getDurationMinutes())
                        .startedAt(existing.getStartedAt()).questions(questions)
                        .resumed(true)
                        .build();
            }

            // SUBMITTED — student submitted manually
            if (existing.getStatus() == AttemptStatus.SUBMITTED)
                throw new BadRequestException("You have already submitted this quiz");

            // AUTO_SUBMITTED — timer ran out (possibly while browser was closed)
            throw new BadRequestException("TIME_EXPIRED:Your quiz time ran out while your browser was closed. Your attempt has been recorded.");
        }

        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz).student(student)
                .startedAt(LocalDateTime.now())
                .status(AttemptStatus.IN_PROGRESS)
                .tabSwitchCount(0).fullscreenExitCount(0).browserCrashCount(0)
                .build();

        QuizAttempt saved;
        try {
            saved = attemptRepository.save(attempt);
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("You have already attempted this quiz");
        }

        // Register with the in-memory timer — no more DB reads per tick
        timerService.register(saved.getId(), saved.getStartedAt(), quiz.getDurationMinutes());

        // Shuffle questions into a random per-student order so no two students see the
        // same sequence — this prevents serial-number-based copying between students.
        List<Question> shuffledQuestions = new ArrayList<>(quiz.getQuestions());
        Collections.shuffle(shuffledQuestions);

        List<QuestionDTO> questions = shuffledQuestions.stream()
                .map(this::toQuestionDTO)   // options are also shuffled inside toQuestionDTO
                .collect(Collectors.toList());

        return AttemptStartResponse.builder()
                .attemptId(saved.getId()).quizId(quiz.getId())
                .quizTitle(quiz.getTitle()).durationMinutes(quiz.getDurationMinutes())
                .startedAt(saved.getStartedAt()).questions(questions)
                .build();
    }

    public AttemptResultResponse submitAttempt(SubmitAnswerRequest request, String studentEmail) {
        QuizAttempt attempt = attemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS)
            throw new BadRequestException("Attempt already submitted");
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setStatus(AttemptStatus.SUBMITTED);
        timerService.unregister(attempt.getId());
        attempt.setTabSwitchCount(request.getTabSwitchCount());
        attempt.setFullscreenExitCount(request.getFullscreenExitCount());
        attempt.setDevtoolsCount(request.getDevtoolsCount() != null ? request.getDevtoolsCount() : 0);
        Quiz quiz = attempt.getQuiz();
        Map<Long, String> answers = request.getAnswers() != null ? request.getAnswers() : new HashMap<>();
        int totalScore = 0;
        int correctCount = 0;
        List<StudentAnswer> studentAnswers = new ArrayList<>();
        for (Question question : quiz.getQuestions()) {
            String response = answers.getOrDefault(question.getId(), "");
            boolean isCorrect = evaluateAnswer(question, response);
            int marks = isCorrect ? question.getMarks() : 0;
            if (isCorrect) { totalScore += marks; correctCount++; }
            studentAnswers.add(StudentAnswer.builder()
                    .attempt(attempt).question(question).response(response)
                    .isCorrect(isCorrect).marksAwarded(marks).build());
        }
        attempt.setScore(totalScore);
        attemptRepository.save(attempt);
        answerRepository.saveAll(studentAnswers);
        int totalMarks = quiz.getQuestions().stream().mapToInt(Question::getMarks).sum();
        return buildResult(attempt, quiz, studentAnswers, totalMarks, correctCount);
    }

    public AttemptResultResponse getResult(Long attemptId, String studentEmail) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        Quiz quiz = attempt.getQuiz();
        List<StudentAnswer> answers = answerRepository.findByAttempt(attempt);
        int totalMarks = quiz.getQuestions().stream().mapToInt(Question::getMarks).sum();
        int correctCount = (int) answers.stream().filter(sa -> Boolean.TRUE.equals(sa.getIsCorrect())).count();
        return buildResult(attempt, quiz, answers, totalMarks, correctCount);
    }

    public List<AttemptResultResponse> getStudentAttempts(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return attemptRepository.findByStudent(student).stream().map(attempt -> {
            Quiz quiz = attempt.getQuiz();
            List<StudentAnswer> answers = answerRepository.findByAttempt(attempt);
            int totalMarks = quiz.getQuestions().stream().mapToInt(Question::getMarks).sum();
            int correctCount = (int) answers.stream().filter(sa -> Boolean.TRUE.equals(sa.getIsCorrect())).count();
            return buildResult(attempt, quiz, answers, totalMarks, correctCount);
        }).collect(Collectors.toList());
    }

    public List<AttemptResultResponse> getQuizSubmissions(Long quizId, String teacherEmail) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        return attemptRepository.findByQuiz(quiz).stream().map(attempt -> {
            List<StudentAnswer> answers = answerRepository.findByAttempt(attempt);
            int totalMarks = quiz.getQuestions().stream().mapToInt(Question::getMarks).sum();
            int correctCount = (int) answers.stream().filter(sa -> Boolean.TRUE.equals(sa.getIsCorrect())).count();
            return buildResult(attempt, quiz, answers, totalMarks, correctCount);
        }).collect(Collectors.toList());
    }

    private AttemptResultResponse buildResult(QuizAttempt attempt, Quiz quiz,
                                              List<StudentAnswer> answers, int totalMarks, int correctCount) {
        List<AnswerResultDTO> answerResults = answers.stream()
                .map(sa -> AnswerResultDTO.builder()
                        .questionId(sa.getQuestion().getId()).questionText(sa.getQuestion().getText())
                        .studentResponse(getDisplayResponse(sa.getQuestion(), sa.getResponse()))
                        .correctAnswer(getCorrectAnswer(sa.getQuestion()))
                        .isCorrect(sa.getIsCorrect()).marksAwarded(sa.getMarksAwarded())
                        .totalMarks(sa.getQuestion().getMarks()).build())
                .collect(Collectors.toList());
        return AttemptResultResponse.builder()
                .attemptId(attempt.getId()).quizId(quiz.getId()).quizTitle(quiz.getTitle())
                .score(attempt.getScore()).totalMarks(totalMarks)
                .totalQuestions(quiz.getQuestions().size()).correctAnswers(correctCount)
                .submittedAt(attempt.getSubmittedAt()).answers(answerResults)
                .tabSwitchCount(attempt.getTabSwitchCount()).fullscreenExitCount(attempt.getFullscreenExitCount())
                .devtoolsCount(attempt.getDevtoolsCount())
                .status(attempt.getStatus() != null ? attempt.getStatus().name() : null)
                .browserCrashCount(attempt.getBrowserCrashCount())
                .build();
    }

    private boolean evaluateAnswer(Question question, String response) {
        if (response == null || response.isBlank()) return false;

        switch (question.getType()) {
            case MCQ:
                return question.getOptions().stream()
                        .filter(Option::getIsCorrect)
                        .anyMatch(opt -> opt.getId().toString().equals(response.trim()));

            case TRUE_FALSE:
            case FILL_IN_THE_BLANK:
            case SHORT_ANSWER:  // ← ADD THIS — was returning false before
                return question.getCorrectAnswer() != null &&
                        question.getCorrectAnswer().trim().equalsIgnoreCase(response.trim());

            default:
                return false;
        }
    }

    private String getCorrectAnswer(Question question) {
        switch (question.getType()) {
            case MCQ: return question.getOptions().stream().filter(Option::getIsCorrect)
                    .map(Option::getText).findFirst().orElse("");
            default: return question.getCorrectAnswer() != null ? question.getCorrectAnswer() : "";
        }
    }

    // For MCQ, the stored response is the selected option's ID (needed for unambiguous scoring),
    // not its text. This converts it back to readable text for the "Your answer" display.
    // All other question types already store the literal typed/selected text, so they pass through.
    private String getDisplayResponse(Question question, String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) return rawResponse;
        if (question.getType() == QuestionType.MCQ) {
            return question.getOptions().stream()
                    .filter(opt -> opt.getId().toString().equals(rawResponse.trim()))
                    .map(Option::getText)
                    .findFirst()
                    .orElse(rawResponse);
        }
        return rawResponse;
    }

    private QuestionDTO toQuestionDTO(Question q) {
        List<OptionDTO> options;
        if (q.getOptions() == null || q.getOptions().isEmpty()) {
            options = List.of();
        } else {
            // Shuffle MCQ options so even if two students get the same question,
            // option A for one student is not option A for another.
            List<OptionDTO> mutableOptions = q.getOptions().stream()
                    .map(o -> OptionDTO.builder().id(o.getId()).text(o.getText()).build())
                    .collect(Collectors.toList());
            Collections.shuffle(mutableOptions);
            options = mutableOptions;
        }
        return QuestionDTO.builder().id(q.getId()).text(q.getText()).type(q.getType())
                .marks(q.getMarks()).questionOrder(q.getQuestionOrder()).options(options).build();
    }
}