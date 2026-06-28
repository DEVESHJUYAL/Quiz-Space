package com.quizgenerator.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "questions")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Question {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String text;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private QuestionType type;
    @Column(nullable = false) private Integer marks;
    @Column(nullable = false) private Integer questionOrder;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Option> options;
    private String correctAnswer;
}
