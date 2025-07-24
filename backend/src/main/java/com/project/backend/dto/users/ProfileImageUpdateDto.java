package com.project.backend.dto.users;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileImageUpdateDto {
    private String profileImageUrl;
}