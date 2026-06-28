package com.quizgenerator.backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuestionAnalyticsDTO {
    private Long questionId;
    private String questionText;
    private int totalAttempts;
    private int correctCount;
    private double correctPercentage;
}
