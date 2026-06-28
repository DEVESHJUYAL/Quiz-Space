package com.quizgenerator.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts", uniqueConstraints = @UniqueConstraint(columnNames = {"quiz_id", "student_id"}))
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuizAttempt {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    @Column(nullable = false) private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer score;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private AttemptStatus status;
    private Integer tabSwitchCount;
    private Integer fullscreenExitCount;
    private Integer devtoolsCount;
    private Integer browserCrashCount;
}