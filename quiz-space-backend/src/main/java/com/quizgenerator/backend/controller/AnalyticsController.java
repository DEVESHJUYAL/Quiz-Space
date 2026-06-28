package com.quizgenerator.backend.controller;

import com.quizgenerator.backend.dto.QuizAnalyticsDTO;
import com.quizgenerator.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<QuizAnalyticsDTO> getQuizAnalytics(@PathVariable Long quizId) {
        return ResponseEntity.ok(analyticsService.getQuizAnalytics(quizId));
    }
}
