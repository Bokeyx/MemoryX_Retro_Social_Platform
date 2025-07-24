package com.project.backend.dto.friends;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class FriendsListDto {
    private final Integer friendsId;
    private final String friendUser;
    private final String friendMatchedUser;
    private final String emotionCommon;

    // 각 사용자 정보
    private final String userName;
    private final String userSex;
    private final String userProfileImage;
    private final String status;
}