package com.quizgenerator.backend.controller;

import com.quizgenerator.backend.dto.*;
import com.quizgenerator.backend.service.AttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class AttemptController {
    private final AttemptService attemptService;

    @PostMapping("/start/{quizId}")
    public ResponseEntity<AttemptStartResponse> startAttempt(@PathVariable Long quizId, Principal principal) {
        return ResponseEntity.ok(attemptService.startAttempt(quizId, principal.getName()));
    }

    @PostMapping("/submit")
    public ResponseEntity<AttemptResultResponse> submitAttempt(@RequestBody SubmitAnswerRequest request, Principal principal) {
        return ResponseEntity.ok(attemptService.submitAttempt(request, principal.getName()));
    }

    @GetMapping("/result/{attemptId}")
    public ResponseEntity<AttemptResultResponse> getResult(@PathVariable Long attemptId, Principal principal) {
        return ResponseEntity.ok(attemptService.getResult(attemptId, principal.getName()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<AttemptResultResponse>> getMyAttempts(Principal principal) {
        return ResponseEntity.ok(attemptService.getStudentAttempts(principal.getName()));
    }

    @GetMapping("/quiz/{quizId}/submissions")
    public ResponseEntity<List<AttemptResultResponse>> getSubmissions(@PathVariable Long quizId, Principal principal) {
        return ResponseEntity.ok(attemptService.getQuizSubmissions(quizId, principal.getName()));
    }
}
