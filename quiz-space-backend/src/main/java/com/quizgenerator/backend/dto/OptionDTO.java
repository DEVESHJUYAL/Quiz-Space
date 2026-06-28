package com.quizgenerator.backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OptionDTO {
    private Long id;
    private String text;
}
