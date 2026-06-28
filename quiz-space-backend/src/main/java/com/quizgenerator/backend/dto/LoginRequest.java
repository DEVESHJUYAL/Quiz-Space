package com.quizgenerator.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LoginRequest {
    @Email(message = "Please enter a valid email address")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}