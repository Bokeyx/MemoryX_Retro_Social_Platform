package com.project.backend.dto.friends;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendsStatusDto {

    private String userId;         // 친구의 userId
    private String name;           // 친구의 이름
    private String profileImage;   // 친구의 프로필 이미지
    private String status;         // 나와의 친구 관계 상태 (PENDING, MATCHED, NONE 등)
}
