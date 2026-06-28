package com.quizgenerator.backend.config;

import com.quizgenerator.backend.model.Role;
import com.quizgenerator.backend.model.User;
import com.quizgenerator.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:admin@quizspace.app}")
    private String adminEmail;

    @Value("${admin.password:Admin@123}")
    private String adminPassword;

    @Value("${admin.name:Quiz Space Admin}")
    private String adminName;

    // schema.sql runs before this — tables are guaranteed to exist
    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin account already exists: {}", adminEmail);
            return;
        }
        User admin = User.builder()
                .name(adminName)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.TEACHER)
                .build();
        userRepository.save(admin);
        log.info("===================================================");
        log.info("  Default admin account created");
        log.info("  Email    : {}", adminEmail);
        log.info("  Password : {}", adminPassword);
        log.info("  Role     : TEACHER");
        log.info("===================================================");
    }
}