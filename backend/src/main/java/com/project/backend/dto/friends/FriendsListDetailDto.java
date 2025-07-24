package com.project.backend.dto.friends;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class FriendsListDetailDto {
    private final String userId;
    private final String name;
    private final String sex;
    private final String profileImage;
    private final String status;
}
