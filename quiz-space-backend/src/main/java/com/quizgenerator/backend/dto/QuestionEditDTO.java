package com.quizgenerator.backend.dto;

import com.quizgenerator.backend.model.QuestionType;
import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuestionEditDTO {
    private Long id;
    private String text;
    private QuestionType type;
    private Integer marks;
    private Integer questionOrder;
    private String correctAnswer;
    private List<OptionEditDTO> options;
}