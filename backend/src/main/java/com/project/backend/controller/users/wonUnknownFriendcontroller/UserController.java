package com.project.backend.controller.users.wonUnknownFriendcontroller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired; // ✅ 올바른 서비스 클래스 import
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.backend.dto.users.FriendProfileDto;
import com.project.backend.dto.users.UserSearchDto;
import com.project.backend.service.users.UserUnKnownService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserUnKnownService userUnKnownService; // ✅ 타입과 변수명 변경: UserUnKnownService로 주입

    /**
     * 자동 완성/제안을 위해 이름 또는 ID로 사용자를 검색하는 엔드포인트입니다.
     * UserSearchDto 목록을 반환합니다.
     */
    @GetMapping("/search2")
    public ResponseEntity<List<UserSearchDto>> searchUsers(@RequestParam String query, @RequestParam(required = false) String excludeUserId) {
        List<UserSearchDto> searchResults = userUnKnownService.searchUsers(query, excludeUserId); // ✅ 서비스 호출 시 변수명 변경
        if (searchResults.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(searchResults, HttpStatus.OK);
    }

    /**
     * userId로 친구의 프로필 세부 정보를 가져옵니다.
     * FriendProfileDto를 반환합니다.
     */
    @GetMapping("/friend-profile/{userId}")
    public ResponseEntity<FriendProfileDto> getFriendProfile(@PathVariable String userId) {
        Optional<FriendProfileDto> friendProfile = userUnKnownService.getFriendProfile(userId); // ✅ 서비스 호출 시 변수명 변경
        return friendProfile.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}