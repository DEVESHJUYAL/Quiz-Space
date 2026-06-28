package com.quizgenerator.backend.repository;

import com.quizgenerator.backend.model.SolutionUpload;
import com.quizgenerator.backend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SolutionUploadRepository extends JpaRepository<SolutionUpload, Long> {
    List<SolutionUpload> findByQuizOrderByUploadedAtAsc(Quiz quiz);
}
