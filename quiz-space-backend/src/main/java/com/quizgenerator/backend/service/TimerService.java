package com.quizgenerator.backend.service;

import com.quizgenerator.backend.model.*;
import com.quizgenerator.backend.repository.QuizAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@EnableScheduling
@RequiredArgsConstructor
public class TimerService {

    private final QuizAttemptRepository attemptRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // attemptId → expiry instant (epoch seconds)
    // Populated on startup + whenever a new attempt starts.
    // Never queried again after that — zero DB reads per tick.
    private final ConcurrentHashMap<Long, Long> expiryMap = new ConcurrentHashMap<>();

    /**
     * On server start, reload any attempts that were IN_PROGRESS before the
     * restart so their timers resume correctly.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void restoreActiveAttempts() {
        // Retry loop: on a fresh database ddl-auto=update may still be creating
        // tables when ApplicationReadyEvent fires. We retry until tables exist.
        int maxAttempts = 10;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                List<QuizAttempt> active = attemptRepository.findActiveAttemptsWithQuiz();
                for (QuizAttempt a : active) {
                    long expiry = toEpochSeconds(a.getStartedAt())
                            + a.getQuiz().getDurationMinutes() * 60L;
                    expiryMap.put(a.getId(), expiry);
                }
                if (!active.isEmpty())
                    System.out.println("[TimerService] Restored " + active.size() + " in-progress attempt(s)");
                return;
            } catch (Exception e) {
                if (attempt == maxAttempts) {
                    System.out.println("[TimerService] Failed to restore after " + maxAttempts + " attempts: " + e.getMessage());
                } else {
                    System.out.println("[TimerService] Tables not ready, retrying in 2s (" + attempt + "/" + maxAttempts + ")...");
                    try { Thread.sleep(2000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); return; }
                }
            }
        }
    }

    /**
     * Called by AttemptService when a student starts a quiz.
     * Registers the attempt in the in-memory map — no further DB reads needed.
     */
    public void register(Long attemptId, LocalDateTime startedAt, int durationMinutes) {
        long expiry = toEpochSeconds(startedAt) + durationMinutes * 60L;
        expiryMap.put(attemptId, expiry);
    }

    /**
     * Called by AttemptService when a student submits manually or is force-submitted.
     * Removes the attempt so the scheduler stops ticking it.
     */
    public void unregister(Long attemptId) {
        expiryMap.remove(attemptId);
    }

    /**
     * Runs every second.
     * Reads ONLY from the in-memory map — zero database queries.
     * A DB write happens only when an attempt expires (rare event).
     */
    @Scheduled(fixedRate = 1000)
    @Transactional
    public void tick() {
        long nowSeconds = toEpochSeconds(LocalDateTime.now());

        for (Map.Entry<Long, Long> entry : expiryMap.entrySet()) {
            Long attemptId = entry.getKey();
            long expiry    = entry.getValue();
            long secondsLeft = expiry - nowSeconds;

            if (secondsLeft <= 0) {
                // Attempt has expired — write to DB once, then remove from map
                expiryMap.remove(attemptId);

                attemptRepository.findById(attemptId).ifPresent(attempt -> {
                    if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
                        attempt.setStatus(AttemptStatus.AUTO_SUBMITTED);
                        attempt.setSubmittedAt(LocalDateTime.now());
                        attempt.setScore(0);
                        attemptRepository.save(attempt);
                    }
                });

                messagingTemplate.convertAndSend(
                        "/topic/attempt/" + attemptId,
                        Map.of("event", "TIME_UP", "attemptId", attemptId)
                );
            } else {
                // Just a tick — pure in-memory, no DB
                messagingTemplate.convertAndSend(
                        "/topic/attempt/" + attemptId,
                        Map.of("event", "TICK", "secondsLeft", secondsLeft)
                );
            }
        }
    }

    // ── helper ──────────────────────────────────────────────────────
    // Use the system default zone — LocalDateTime.now() produces local time,
    // so we must convert using the same zone to get correct epoch seconds.
    // Using ZoneOffset.UTC here would cause a time-shift bug on non-UTC servers.
    private long toEpochSeconds(LocalDateTime ldt) {
        return ldt.atZone(java.time.ZoneId.systemDefault()).toEpochSecond();
    }
}