package com.project.backend.dto.users;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsersUpdateDto {
    private String name;
    private String email;
    private String phone;
    private String sex;
    private String introduction;
    private String password; // 비밀번호는 선택적으로 업데이트
    private String profileImage;
}