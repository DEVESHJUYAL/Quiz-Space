package com.quizgenerator.backend.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuizResponse {
    private Long id;
    private String title;
    private String description;
    private Integer durationMinutes;
    private LocalDateTime openAt;
    private LocalDateTime closeAt;
    private Boolean isPublished;
    private String teacherName;
    private int totalQuestions;
    private int totalMarks;
    private String quizCode;
    private List<String> allowedStudentEmails;
}