package com.project.backend.dto.friends;

// 친구 요청 수락/거절 시 요청 본문으로 사용


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FriendshipResponseCommand { // 변경된 DTO 이름
    private Integer requestId; // 변경할 Friends 레코드의 ID, friendsId 대신 requestId
    private String responseAction; // "accept" 또는 "reject", action 대신 responseAction
    private String targetUserId; // 요청을 받은 FRIEND_USER (현재 로그인한 사용자 ID), friendUserId 대신 targetUserId
}