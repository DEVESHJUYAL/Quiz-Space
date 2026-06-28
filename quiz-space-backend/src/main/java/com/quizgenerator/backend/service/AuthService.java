package com.quizgenerator.backend.service;

import com.quizgenerator.backend.dto.*;
import com.quizgenerator.backend.exception.*;
import com.quizgenerator.backend.model.User;
import com.quizgenerator.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email already registered");
        User user = User.builder()
                .name(request.getName()).email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole()).build();
        userRepository.save(user);
        return AuthResponse.builder()
                .token(jwtService.generateToken(user.getEmail()))
                .name(user.getName()).email(user.getEmail())
                .role(user.getRole().name()).build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new BadRequestException("Invalid password");
        return AuthResponse.builder()
                .token(jwtService.generateToken(user.getEmail()))
                .name(user.getName()).email(user.getEmail())
                .role(user.getRole().name()).build();
    }
}
