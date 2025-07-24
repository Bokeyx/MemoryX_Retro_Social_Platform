package com.project.backend.dto.users;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JwtResponseDTO {
    private String token;
    private String userId;
    private String name;
    private String email;

     // ✅ OauthController에서 넘겨주려는 모든 필드를 여기에 선언!
    private String profileImage;
    private String authProvider;
    private String sex;
    private String phone;
    private String bloodType;
    private String introduction;
    private LocalDate birth; // LocalDate 타입
    private Integer visited;
    private Integer reportCnt;
    private String userStatus;
    private LocalDateTime createdAt; // LocalDateTime 타입
    private boolean isNew; // isNew는 boolean 타입

    
}

