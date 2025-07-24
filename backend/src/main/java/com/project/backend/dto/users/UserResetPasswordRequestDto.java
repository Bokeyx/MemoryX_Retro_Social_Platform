package com.project.backend.dto.users;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResetPasswordRequestDto {
    private String userId;
    private String newPassword;
}
