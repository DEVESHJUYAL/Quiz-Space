package com.quizgenerator.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "solution_uploads")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SolutionUpload {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;
    @Column(nullable = false) private String imageUrl;
    @Column(nullable = false) private String publicId;
    private String caption;
    @Column(nullable = false) private LocalDateTime uploadedAt;
}
