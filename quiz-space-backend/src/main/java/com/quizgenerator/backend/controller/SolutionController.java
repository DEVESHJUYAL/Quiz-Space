package com.quizgenerator.backend.controller;

import com.quizgenerator.backend.dto.SolutionDTO;
import com.quizgenerator.backend.service.SolutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/solutions")
@RequiredArgsConstructor
public class SolutionController {
    private final SolutionService solutionService;

    @PostMapping("/upload/{quizId}")
    public ResponseEntity<SolutionDTO> upload(@PathVariable Long quizId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption) throws IOException {
        return ResponseEntity.ok(solutionService.uploadSolution(quizId, file, caption));
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<List<SolutionDTO>> getSolutions(@PathVariable Long quizId) {
        return ResponseEntity.ok(solutionService.getSolutions(quizId));
    }

    @DeleteMapping("/{solutionId}")
    public ResponseEntity<Void> delete(@PathVariable Long solutionId) throws IOException {
        solutionService.deleteSolution(solutionId);
        return ResponseEntity.noContent().build();
    }
}
