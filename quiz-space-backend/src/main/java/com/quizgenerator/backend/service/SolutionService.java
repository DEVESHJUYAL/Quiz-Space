package com.quizgenerator.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.quizgenerator.backend.dto.SolutionDTO;
import com.quizgenerator.backend.exception.ResourceNotFoundException;
import com.quizgenerator.backend.model.*;
import com.quizgenerator.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SolutionService {
    private final SolutionUploadRepository solutionRepository;
    private final QuizRepository quizRepository;
    private final Cloudinary cloudinary;

    public SolutionDTO uploadSolution(Long quizId, MultipartFile file, String caption) throws IOException {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("folder", "quiz-generator/solutions", "resource_type", "image"));
        SolutionUpload solution = SolutionUpload.builder()
                .quiz(quiz).imageUrl((String) uploadResult.get("secure_url"))
                .publicId((String) uploadResult.get("public_id"))
                .caption(caption).uploadedAt(LocalDateTime.now()).build();
        return toDTO(solutionRepository.save(solution));
    }

    public List<SolutionDTO> getSolutions(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        return solutionRepository.findByQuizOrderByUploadedAtAsc(quiz).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public void deleteSolution(Long solutionId) throws IOException {
        SolutionUpload solution = solutionRepository.findById(solutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Solution not found"));
        cloudinary.uploader().destroy(solution.getPublicId(), ObjectUtils.emptyMap());
        solutionRepository.deleteById(solutionId);
    }

    private SolutionDTO toDTO(SolutionUpload s) {
        return SolutionDTO.builder().id(s.getId()).imageUrl(s.getImageUrl())
                .caption(s.getCaption()).uploadedAt(s.getUploadedAt()).build();
    }
}
