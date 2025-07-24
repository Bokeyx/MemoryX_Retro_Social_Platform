package com.project.backend.dto.friends;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingFriendshipRequest { // 변경된 DTO 이름
    private Integer requestId; // Friends 테이블의 PK, friendsId 대신 requestId
    private String inviterName; // 요청을 보낸 사용자의 이름, matchedUserName 대신 inviterName
    private String inviterProfileImage; // 요청을 보낸 사용자의 프로필 이미지, matchedUserProfileImage 대신 inviterProfileImage
    private String inviterSongId; // 요청을 보낸 사용자의 MYSONG (Song ID), matchedUserMysong 대신 inviterSongId
    private LocalDateTime requestedAt; // 친구 요청 생성 시간, createdAt 대신 requestedAt
}