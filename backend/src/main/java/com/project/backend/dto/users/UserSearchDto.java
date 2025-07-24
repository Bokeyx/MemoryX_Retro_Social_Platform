package com.project.backend.dto.users;

import lombok.AllArgsConstructor;
import lombok.Builder; // 이 부분을 추가했는지 확인
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder // 이 어노테이션을 추가
public class UserSearchDto {
    private String userId;
    private String name;
    private String profileImage;
}