package com.quizgenerator.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_answers")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StudentAnswer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
    private String response;
    private Boolean isCorrect;
    private Integer marksAwarded;
}
