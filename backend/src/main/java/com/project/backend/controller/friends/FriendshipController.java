package com.project.backend.controller.friends;


import com.project.backend.dto.friends.FriendshipResponseCommand; // 변경된 DTO 이름
import com.project.backend.dto.friends.PendingFriendshipRequest; // 변경된 DTO 이름
import com.project.backend.service.friends.FriendshipService; // 변경된 Service 이름
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friendships") // 변경된 RequestMapping
@RequiredArgsConstructor
public class FriendshipController { // 변경된 Controller 이름

    private final FriendshipService friendshipService; // 변경된 Service 이름

    @GetMapping("/requests/pending/{targetUserId}") // 변경된 경로 (좀 더 명확하게)
    public ResponseEntity<List<PendingFriendshipRequest>> getPendingFriendshipRequests(@PathVariable String targetUserId) { // 변경된 메소드 이름 및 파라미터 이름
        List<PendingFriendshipRequest> requests = friendshipService.getPendingFriendshipRequests(targetUserId);
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/respond") // 변경된 경로 (동사형으로 좀 더 명확하게)
    public ResponseEntity<String> respondToFriendshipRequest(@RequestBody FriendshipResponseCommand command) { // 변경된 메소드 이름 및 파라미터 이름
        try {
            boolean success = friendshipService.processFriendshipResponse(command);
            if (success) {
                return ResponseEntity.ok("친구 요청 응답이 성공적으로 처리되었습니다.");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("처리할 친구 요청을 찾을 수 없거나 이미 처리되었습니다.");
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("친구 요청 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}