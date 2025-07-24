package com.project.backend.dto.friends;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class FriendsDto {
    private final Integer friendsId;
    private final String friendUser;
    private final String friendMatchedUser;
    private final String emotionCommon;
}
