package com.project.backend.dto.users;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class UsersListDetailDto {
    private final String userId;
    private final String name;
    private final String sex;
    private final String profileImage;
    private final LocalDate birth;
    private final String bloodType;
    private final String email;
    private final String phone;
    private final String introduction;
    private final String authProvider;
}
