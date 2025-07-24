package com.project.backend.controller.friends;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.backend.dto.friends.FriendsListDetailDto;
import com.project.backend.dto.friends.FriendsListDto;
import com.project.backend.dto.friends.FriendsStatusDto;
import com.project.backend.service.friends.FriendsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/friends")
public class FriendsController {
    private final FriendsService friendsService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FriendsListDto>> getFriendsByUserId(@PathVariable String userId){
        List<FriendsListDto> friends = friendsService.getUserFriends(userId);

        return ResponseEntity.ok(friends);
    }

    @GetMapping("/listdetail/{userId}")
    public ResponseEntity<List<FriendsListDetailDto>> getFriendsListByUserId(@PathVariable String userId){
        List<FriendsListDetailDto> friends = friendsService.getFriendsListDetails(userId);

        return ResponseEntity.ok(friends);
    }

    @PostMapping("/accept")
    public ResponseEntity<?> acceptFriendRequest(@RequestParam String requesterId, @RequestParam String targetId) {
        try {
            friendsService.acceptFriendRequest(requesterId, targetId);
            return ResponseEntity.ok("Friend request accepted");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Friend request acceptance failed: " + e.getMessage());
        }
    }

    @PostMapping("/reject")
    public ResponseEntity<?> rejectFriendRequest(@RequestParam String requesterId, @RequestParam String targetId) {
        try {
            friendsService.rejectFriendRequest(requesterId, targetId);
            return ResponseEntity.ok("Friend request rejected");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Friend request rejection failed: " + e.getMessage());
        }
    }

    @GetMapping("/f2f-statuslist/{friendUserId}")
    public ResponseEntity<List<FriendsStatusDto>> getFriendsOfFriendWithStatus(
            @PathVariable String friendUserId,
            @RequestParam String viewerId) {

        List<FriendsStatusDto> list = friendsService.getFriendsOfFriendWithStatus(friendUserId, viewerId);
        return ResponseEntity.ok(list);
    }


    @PostMapping("/request")
    public ResponseEntity<?> sendFriendRequest(@RequestParam String requesterId, @RequestParam String targetId) {
        try {
            friendsService.sendFriendRequest(requesterId, targetId);
            return ResponseEntity.ok("Friend request success");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("친구 요청 실패: " + e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("친구 요청 실패: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("친구 요청 실패: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteFriend(@RequestParam String userId1, @RequestParam String userId2) {
        friendsService.deleteFriendship(userId1, userId2);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/status")
    public ResponseEntity<FriendsStatusDto> getFriendStatus(@RequestParam String userA, @RequestParam String userB) {
        
        String status = friendsService.getFriendStatus(userA, userB);
        
        FriendsStatusDto dto = FriendsStatusDto.builder()
                .userId(userB)
                .status(status)
                .build();
        
        return ResponseEntity.ok(dto);
    }

    
    @GetMapping("/test")
    public String hello() {
        return "Hello!!";
    }
    
}