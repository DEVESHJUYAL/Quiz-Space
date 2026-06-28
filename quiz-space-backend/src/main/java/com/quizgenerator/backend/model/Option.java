package com.quizgenerator.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "options")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Option {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String text;
    @Column(nullable = false) private Boolean isCorrect = false;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
}
