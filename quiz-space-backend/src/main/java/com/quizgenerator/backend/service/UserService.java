package com.quizgenerator.backend.service;

import com.quizgenerator.backend.dto.UserDTO;
import com.quizgenerator.backend.exception.ResourceNotFoundException;
import com.quizgenerator.backend.model.User;
import com.quizgenerator.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        return toDTO(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    private UserDTO toDTO(User u) {
        return UserDTO.builder().id(u.getId()).name(u.getName())
                .email(u.getEmail()).role(u.getRole()).build();
    }
}
