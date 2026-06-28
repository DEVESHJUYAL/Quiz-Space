package com.quizgenerator.backend.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttemptResultResponse {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Integer score;
    private Integer totalMarks;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private LocalDateTime submittedAt;
    private List<AnswerResultDTO> answers;
    private Integer tabSwitchCount;
    private Integer fullscreenExitCount;
    private Integer devtoolsCount;
    private String status;
    private Integer browserCrashCount;
}