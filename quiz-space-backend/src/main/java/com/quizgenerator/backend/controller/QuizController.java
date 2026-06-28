package com.quizgenerator.backend.controller;

import com.quizgenerator.backend.dto.*;
import com.quizgenerator.backend.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;

    @PostMapping
    public ResponseEntity<QuizResponse> createQuiz(@Valid @RequestBody QuizRequest request, Principal principal) {
        return ResponseEntity.ok(quizService.createQuiz(request, principal.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizResponse> updateQuiz(@PathVariable Long id, @Valid @RequestBody QuizRequest request, Principal principal) {
        return ResponseEntity.ok(quizService.updateQuiz(id, request, principal.getName()));
    }

    @GetMapping("/{id}/edit")
    public ResponseEntity<QuizEditResponse> getQuizForEdit(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(quizService.getQuizForEdit(id, principal.getName()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<QuizResponse>> getMyQuizzes(Principal principal) {
        return ResponseEntity.ok(quizService.getTeacherQuizzes(principal.getName()));
    }

    @GetMapping("/published")
    public ResponseEntity<List<QuizResponse>> getPublished(Principal principal) {
        return ResponseEntity.ok(quizService.getPublishedQuizzes(principal == null ? null : principal.getName()));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<QuizResponse> getByCode(@PathVariable String code, Principal principal) {
        return ResponseEntity.ok(quizService.getQuizByCode(code, principal == null ? null : principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<QuizResponse> publishQuiz(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(quizService.publishQuiz(id, principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id, Principal principal) {
        quizService.deleteQuiz(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}