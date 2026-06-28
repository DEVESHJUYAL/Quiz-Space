package com.quizgenerator.backend.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttemptStartResponse {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Integer durationMinutes;
    private LocalDateTime startedAt;
    private boolean resumed;
    private List<QuestionDTO> questions;
}