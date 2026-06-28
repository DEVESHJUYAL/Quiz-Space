package com.quizgenerator.backend.repository;

import com.quizgenerator.backend.model.Quiz;
import com.quizgenerator.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByTeacher(User teacher);
    List<Quiz> findByIsPublishedTrue();
    Optional<Quiz> findByQuizCode(String quizCode);
}
