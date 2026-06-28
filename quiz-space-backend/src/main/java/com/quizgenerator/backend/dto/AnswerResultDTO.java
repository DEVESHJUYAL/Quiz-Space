package com.quizgenerator.backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AnswerResultDTO {
    private Long questionId;
    private String questionText;
    private String studentResponse;
    private String correctAnswer;
    private Boolean isCorrect;
    private Integer marksAwarded;
    private Integer totalMarks;
}
