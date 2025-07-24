package com.project.backend.dto.users;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserForgotPasswordRequestDto {
    private String userId;
    private String phoneNumber;
}
