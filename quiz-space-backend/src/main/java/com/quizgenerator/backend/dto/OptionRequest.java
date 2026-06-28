package com.quizgenerator.backend.dto;

import lombok.Data;

@Data
public class OptionRequest {
    private String text;
    private Boolean isCorrect;
}
