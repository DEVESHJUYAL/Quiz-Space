package com.quizgenerator.backend.service;

import com.quizgenerator.backend.dto.*;
import com.quizgenerator.backend.exception.ResourceNotFoundException;
import com.quizgenerator.backend.model.*;
import com.quizgenerator.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;
    private final StudentAnswerRepository answerRepository;

    public QuizAnalyticsDTO getQuizAnalytics(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        List<QuizAttempt> attempts = attemptRepository.findByQuiz(quiz).stream()
                .filter(a -> a.getStatus() != AttemptStatus.IN_PROGRESS).collect(Collectors.toList());
        if (attempts.isEmpty()) return QuizAnalyticsDTO.builder().quizId(quizId).quizTitle(quiz.getTitle()).build();
        int totalMarks = quiz.getQuestions().stream().mapToInt(Question::getMarks).sum();
        double avgScore = attempts.stream().mapToInt(a -> a.getScore() != null ? a.getScore() : 0).average().orElse(0);
        int highest = attempts.stream().mapToInt(a -> a.getScore() != null ? a.getScore() : 0).max().orElse(0);
        int lowest = attempts.stream().mapToInt(a -> a.getScore() != null ? a.getScore() : 0).min().orElse(0);
        int passCount = (int) attempts.stream().filter(a -> a.getScore() != null && totalMarks > 0 &&
                ((double) a.getScore() / totalMarks) >= 0.5).count();
        List<QuestionAnalyticsDTO> qAnalytics = quiz.getQuestions().stream().map(question -> {
            List<StudentAnswer> qAnswers = answerRepository.findAll().stream()
                    .filter(sa -> sa.getQuestion().getId().equals(question.getId())).collect(Collectors.toList());
            int correct = (int) qAnswers.stream().filter(sa -> Boolean.TRUE.equals(sa.getIsCorrect())).count();
            double pct = qAnswers.isEmpty() ? 0 : (correct * 100.0 / qAnswers.size());
            return QuestionAnalyticsDTO.builder().questionId(question.getId()).questionText(question.getText())
                    .totalAttempts(qAnswers.size()).correctCount(correct)
                    .correctPercentage(Math.round(pct * 10.0) / 10.0).build();
        }).collect(Collectors.toList());
        return QuizAnalyticsDTO.builder().quizId(quizId).quizTitle(quiz.getTitle())
                .totalAttempts(attempts.size()).averageScore(Math.round(avgScore * 10.0) / 10.0)
                .averagePercentage(Math.round((avgScore / totalMarks) * 1000.0) / 10.0)
                .highestScore(highest).lowestScore(lowest).passCount(passCount)
                .failCount(attempts.size() - passCount).questionAnalytics(qAnalytics).build();
    }
}
