package com.quizgenerator.backend.dto;

import lombok.Data;
import java.util.Map;

@Data
public class SubmitAnswerRequest {
    private Long attemptId;
    private Map<Long, String> answers;
    private Integer tabSwitchCount;
    private Integer fullscreenExitCount;
    private Integer devtoolsCount;
}