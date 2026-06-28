package com.quizgenerator.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuizRequest {
    @NotBlank(message = "Title is required") private String title;
    private String description;
    @NotNull(message = "Duration is required") private Integer durationMinutes;
    private LocalDateTime openAt;
    private LocalDateTime closeAt;
    private List<QuestionRequest> questions;

    // Optional. Empty/null = open to all students. Otherwise only these emails can attempt the quiz.
    private List<String> allowedStudentEmails;
}