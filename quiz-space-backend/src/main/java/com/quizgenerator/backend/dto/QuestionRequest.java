package com.quizgenerator.backend.dto;

import com.quizgenerator.backend.model.QuestionType;
import lombok.Data;
import java.util.List;

@Data
public class QuestionRequest {
    private String text;
    private QuestionType type;
    private Integer marks;
    private Integer questionOrder;
    private List<OptionRequest> options;
    private String correctAnswer;
}
