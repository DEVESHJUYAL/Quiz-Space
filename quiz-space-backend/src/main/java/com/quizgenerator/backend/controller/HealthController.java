package com.quizgenerator.backend.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class HealthController {
    @GetMapping("/health")
    public String health() { return "Quiz Generator backend is running!"; }
}
