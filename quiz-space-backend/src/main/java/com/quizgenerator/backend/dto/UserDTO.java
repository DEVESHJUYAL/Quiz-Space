package com.quizgenerator.backend.dto;

import com.quizgenerator.backend.model.Role;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;
}
