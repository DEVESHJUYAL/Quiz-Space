package com.quizgenerator.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "quizzes")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Quiz {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String title;
    private String description;
    @Column(nullable = false) private Integer durationMinutes;
    private LocalDateTime openAt;
    private LocalDateTime closeAt;
    @Column(unique = true) private String quizCode;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions;
    @Column(nullable = false) private Boolean isPublished = false;

    // Emails of students allowed to take this quiz. Empty/null means "open to all students" —
    // this keeps existing quizzes (created before this feature existed) working unchanged.
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "quiz_allowed_students", joinColumns = @JoinColumn(name = "quiz_id"))
    @Column(name = "email")
    @Builder.Default
    private Set<String> allowedStudentEmails = new HashSet<>();

    /**
     * Whether the given student email is permitted to attempt this quiz.
     * An empty allow-list means the quiz is open to every student.
     * Comparison is case-insensitive since emails are stored normalized to lowercase.
     */
    public boolean isAllowedFor(String studentEmail) {
        if (allowedStudentEmails == null || allowedStudentEmails.isEmpty()) return true;
        return studentEmail != null && allowedStudentEmails.contains(studentEmail.trim().toLowerCase());
    }
}