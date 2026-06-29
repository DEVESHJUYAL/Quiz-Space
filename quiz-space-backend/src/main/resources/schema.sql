package com.quizgenerator.backend.config;

import com.quizgenerator.backend.model.Role;
import com.quizgenerator.backend.model.User;
import com.quizgenerator.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
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
    @Order(1) // run after TimerService (which has no Order = lowest priority)
    public void seed() {
        // Small delay to ensure ddl-auto=update has finished creating/altering tables.
        // Hibernate's schema update runs on the main thread before ApplicationReadyEvent
        // but on a slow remote DB it can still be in-flight. 3 seconds is safe.
        try { Thread.sleep(3000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

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
        } catch (Exception e) {
            log.error("DataSeeder failed — admin account not created: {}", e.getMessage());
        }
    }
}
