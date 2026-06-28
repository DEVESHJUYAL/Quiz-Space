package com.quizgenerator.backend.service;

import com.quizgenerator.backend.dto.*;
import com.quizgenerator.backend.exception.*;
import com.quizgenerator.backend.model.*;
import com.quizgenerator.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;

    public QuizResponse createQuiz(QuizRequest request, String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        String code = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Quiz quiz = Quiz.builder()
                .title(request.getTitle()).description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .openAt(request.getOpenAt()).closeAt(request.getCloseAt())
                .teacher(teacher).isPublished(false).quizCode(code)
                .allowedStudentEmails(normalizeEmails(request.getAllowedStudentEmails()))
                .build();
        if (request.getQuestions() != null) {
            List<Question> questions = request.getQuestions().stream()
                    .map(q -> buildQuestion(q, quiz)).collect(Collectors.toList());
            quiz.setQuestions(questions);
        }
        return toResponse(quizRepository.save(quiz));
    }

    /**
     * Edits an existing quiz. Only the teacher who owns it can edit it, and only while it's
     * still a draft — once published, students may rely on its content (and may have already
     * started attempts), so changing questions or answers underneath them is not allowed.
     */
    public QuizResponse updateQuiz(Long id, QuizRequest request, String teacherEmail) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        if (!quiz.getTeacher().getEmail().equalsIgnoreCase(teacherEmail))
            throw new UnauthorizedException("You don't have permission to edit this quiz");
        if (Boolean.TRUE.equals(quiz.getIsPublished()))
            throw new BadRequestException("This quiz is already published and can no longer be edited");

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setDurationMinutes(request.getDurationMinutes());
        quiz.setOpenAt(request.getOpenAt());
        quiz.setCloseAt(request.getCloseAt());
        quiz.setAllowedStudentEmails(normalizeEmails(request.getAllowedStudentEmails()));

        // Replace the question list IN PLACE (mutate the existing managed collection) rather
        // than swapping in a brand new List via setQuestions(). With orphanRemoval = true,
        // Hibernate only detects removed children correctly when it's the same collection
        // instance being cleared and refilled — otherwise old question/option rows can be
        // left behind as orphans instead of actually being deleted.
        List<Question> existing = quiz.getQuestions();
        if (existing == null) {
            existing = new ArrayList<>();
            quiz.setQuestions(existing);
        }
        existing.clear();
        if (request.getQuestions() != null) {
            request.getQuestions().stream().map(q -> buildQuestion(q, quiz)).forEach(existing::add);
        }

        return toResponse(quizRepository.save(quiz));
    }

    /** Full quiz detail including answer keys — for the owning teacher's edit screen only. */
    public QuizEditResponse getQuizForEdit(Long id, String teacherEmail) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        if (!quiz.getTeacher().getEmail().equalsIgnoreCase(teacherEmail))
            throw new UnauthorizedException("You don't have permission to view this quiz");

        List<QuestionEditDTO> questions = quiz.getQuestions() == null ? List.of() :
                quiz.getQuestions().stream()
                        .sorted(Comparator.comparingInt(Question::getQuestionOrder))
                        .map(this::toQuestionEditDTO)
                        .collect(Collectors.toList());

        return QuizEditResponse.builder()
                .id(quiz.getId()).title(quiz.getTitle()).description(quiz.getDescription())
                .durationMinutes(quiz.getDurationMinutes()).openAt(quiz.getOpenAt()).closeAt(quiz.getCloseAt())
                .isPublished(quiz.getIsPublished()).quizCode(quiz.getQuizCode())
                .allowedStudentEmails(quiz.getAllowedStudentEmails() == null
                        ? List.of() : new ArrayList<>(quiz.getAllowedStudentEmails()))
                .questions(questions)
                .build();
    }

    public List<QuizResponse> getTeacherQuizzes(String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        return quizRepository.findByTeacher(teacher).stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Only quizzes the given student is actually allowed to take are returned. */
    public List<QuizResponse> getPublishedQuizzes(String studentEmail) {
        return quizRepository.findByIsPublishedTrue().stream()
                .filter(quiz -> quiz.isAllowedFor(studentEmail))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public QuizResponse getQuizById(Long id) {
        return toResponse(quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found")));
    }

    public QuizResponse getQuizByCode(String code, String studentEmail) {
        Quiz quiz = quizRepository.findByQuizCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid quiz code"));
        if (!quiz.getIsPublished()) throw new BadRequestException("Quiz is not available");
        if (!quiz.isAllowedFor(studentEmail))
            throw new UnauthorizedException("You are not authorized to take this quiz");
        return toResponse(quiz);
    }

    public QuizResponse publishQuiz(Long id, String teacherEmail) {
        Quiz quiz = quizRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        if (!quiz.getTeacher().getEmail().equalsIgnoreCase(teacherEmail))
            throw new UnauthorizedException("You don't have permission to publish this quiz");
        quiz.setIsPublished(true);
        return toResponse(quizRepository.save(quiz));
    }

    public void deleteQuiz(Long id, String teacherEmail) {
        Quiz quiz = quizRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        if (!quiz.getTeacher().getEmail().equalsIgnoreCase(teacherEmail))
            throw new UnauthorizedException("You don't have permission to delete this quiz");
        quizRepository.deleteById(id);
    }

    /** Trims, lowercases, and drops blanks/duplicates so comparisons are reliable later. */
    private Set<String> normalizeEmails(List<String> emails) {
        if (emails == null) return new HashSet<>();
        return emails.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(e -> !e.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }

    private Question buildQuestion(QuestionRequest req, Quiz quiz) {
        Question q = Question.builder()
                .text(req.getText()).type(req.getType()).marks(req.getMarks())
                .questionOrder(req.getQuestionOrder()).correctAnswer(req.getCorrectAnswer()).quiz(quiz).build();
        if (req.getOptions() != null) {
            q.setOptions(req.getOptions().stream()
                    .map(o -> Option.builder().text(o.getText()).isCorrect(o.getIsCorrect()).question(q).build())
                    .collect(Collectors.toList()));
        }
        return q;
    }

    private QuestionEditDTO toQuestionEditDTO(Question q) {
        List<OptionEditDTO> options = q.getOptions() == null ? List.of() :
                q.getOptions().stream()
                        .map(o -> OptionEditDTO.builder().id(o.getId()).text(o.getText())
                                .isCorrect(o.getIsCorrect()).build())
                        .collect(Collectors.toList());
        return QuestionEditDTO.builder().id(q.getId()).text(q.getText()).type(q.getType())
                .marks(q.getMarks()).questionOrder(q.getQuestionOrder()).correctAnswer(q.getCorrectAnswer())
                .options(options).build();
    }

    private QuizResponse toResponse(Quiz quiz) {
        int totalMarks = quiz.getQuestions() == null ? 0 :
                quiz.getQuestions().stream().mapToInt(Question::getMarks).sum();
        return QuizResponse.builder()
                .id(quiz.getId()).title(quiz.getTitle()).description(quiz.getDescription())
                .durationMinutes(quiz.getDurationMinutes()).openAt(quiz.getOpenAt()).closeAt(quiz.getCloseAt())
                .isPublished(quiz.getIsPublished()).teacherName(quiz.getTeacher().getName())
                .totalQuestions(quiz.getQuestions() == null ? 0 : quiz.getQuestions().size())
                .totalMarks(totalMarks).quizCode(quiz.getQuizCode())
                .allowedStudentEmails(quiz.getAllowedStudentEmails() == null
                        ? List.of() : new ArrayList<>(quiz.getAllowedStudentEmails()))
                .build();
    }
}