package com.quizgenerator.backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OptionEditDTO {
    private Long id;
    private String text;
    private Boolean isCorrect;
}