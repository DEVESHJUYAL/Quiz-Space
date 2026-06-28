package com.quizgenerator.backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String name;
    private String email;
    private String role;
}
