package com.quizgenerator.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SolutionDTO {
    private Long id;
    private String imageUrl;
    private String caption;
    private LocalDateTime uploadedAt;
}
