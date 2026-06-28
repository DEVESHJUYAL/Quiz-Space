package com.quizgenerator.backend.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuizAnalyticsDTO {
    private Long quizId;
    private String quizTitle;
    private int totalAttempts;
    private double averageScore;
    private double averagePercentage;
    private int highestScore;
    private int lowestScore;
    private int passCount;
    private int failCount;
    private List<QuestionAnalyticsDTO> questionAnalytics;
}
