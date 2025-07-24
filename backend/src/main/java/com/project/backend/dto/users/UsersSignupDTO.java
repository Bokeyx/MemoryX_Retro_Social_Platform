package com.project.backend.dto.users;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsersSignupDTO {
    private String userId;
    private String password;
    private String name;
    private String email;
    private String phone;
    private String sex;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birth; // ✔️ LocalDate로 변경 + 포맷 지정
    private String bloodType;
    private String introduction;
    private String profileImage;
    private String authProvider;
}
