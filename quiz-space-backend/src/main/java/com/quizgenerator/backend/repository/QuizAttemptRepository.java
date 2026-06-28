package com.quizgenerator.backend.repository;

import com.quizgenerator.backend.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    Optional<QuizAttempt> findByQuizAndStudentAndStatus(Quiz quiz, User student, AttemptStatus status);
    Optional<QuizAttempt> findByQuizAndStudent(Quiz quiz, User student);
    List<QuizAttempt> findByStudent(User student);
    List<QuizAttempt> findByQuiz(Quiz quiz);
    boolean existsByQuizAndStudent(Quiz quiz, User student);

    // Eagerly fetch quiz to avoid LazyInitializationException in scheduled task
    @Query("SELECT a FROM QuizAttempt a JOIN FETCH a.quiz WHERE a.status = 'IN_PROGRESS'")
    List<QuizAttempt> findActiveAttemptsWithQuiz();
}