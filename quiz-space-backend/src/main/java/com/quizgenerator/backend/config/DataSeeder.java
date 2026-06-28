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

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        // Retry up to 10 times with 2-second intervals.
        // On a fresh database, ddl-auto=update may still be creating tables
        // when ApplicationReadyEvent fires. Retrying guarantees we catch the
        // window between "tables created" and "first request".
        int maxAttempts = 10;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
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
                return;
            } catch (Exception e) {
                if (attempt == maxAttempts) {
                    log.error("DataSeeder failed after {} attempts: {}", maxAttempts, e.getMessage());
                } else {
                    log.warn("DataSeeder attempt {}/{} failed, retrying in 2s...", attempt, maxAttempts);
                    try { Thread.sleep(2000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); return; }
                }
            }
        }
    }
}