// src/main/java/com/project/backend/controller/UserRecomfriendController.java
package com.project.backend.controller.users; // 올바른 패키지 선언
import com.project.backend.dto.users.*; // 올바른 DTO import
import com.project.backend.service.users.*; // 올바른 서비스 import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // 이 클래스가 RESTful 웹 서비스의 컨트롤러임을 나타냅니다.
@RequestMapping("/api/users") // 이 컨트롤러의 모든 핸들러 메서드에 대한 기본 URL 경로를 설정합니다.
@CrossOrigin(origins = "http://localhost:5173") // CORS (Cross-Origin Resource Sharing) 설정:
// React/Vite 개발 서버인 http://localhost:5173에서의 요청을 허용합니다.
// 실제 배포 시에는 프론트엔드의 실제 도메인으로 변경해야 합니다.
public class UserRecomfriendController { // 클래스 이름 통일성을 위해 UserRecomfriendController로 변경

    private final UserRecomFriendService userRecomFriendService; // Service 타입 및 변수명 변경

    // 생성자 주입: Spring이 UserRecomFriendService 인스턴스를 자동으로 주입합니다.
    @Autowired // 명시적으로 주입을 선언합니다. (생략 가능하나 유지해도 무방)
    public UserRecomfriendController(UserRecomFriendService userRecomFriendService) { // 생성자 이름 및 매개변수 타입/이름 수정
        this.userRecomFriendService = userRecomFriendService;
    }

    /**
     * 사용자 ID 또는 이름으로 검색합니다.
     * GET 요청: /api/users/search?query={검색어}
     * 예: /api/users/search?query=user123
     * 예: /api/users/search?query=김철수
     * @param query 검색어 (Request Parameter로 받습니다)
     * @return 검색된 UserRecommendFriendDto 목록 (없으면 HTTP 204 No Content, 있으면 200 OK)
     */
    @GetMapping("/search") // HTTP GET 요청을 처리하며, "/search" 경로에 매핑됩니다.
    public ResponseEntity<List<UserRecommendFriendDto>> searchUsers(@RequestParam String query) { // 반환 타입 및 DTO 타입 수정
        List<UserRecommendFriendDto> foundUsers = userRecomFriendService.searchUsers(query); // 서비스 호출
        if (foundUsers.isEmpty()) {
            return ResponseEntity.noContent().build(); // 검색 결과가 없으면 204 No Content 반환
        }
        return ResponseEntity.ok(foundUsers); // 검색 결과가 있으면 200 OK와 함께 목록 반환
    }

    /**
     * 테스트를 위한 더미 사용자 생성 엔드포인트.
     * HTTP POST 요청: /api/users/test-data
     * 애플리케이션 시작 후 브라우저에서 `http://localhost:8080/api/users/test-data` (POST 요청 도구 사용) 에
     * 요청을 보내 데이터를 미리 생성해두면 검색 테스트가 용이합니다.
     */
    @PostMapping("/test-data") // HTTP POST 요청을 처리하며, "/test-data" 경로에 매핑됩니다.
    public ResponseEntity<String> createTestUsers() {
        // userService.createTestUser 메서드를 호출하여 더미 사용자를 생성합니다.
        // 이미 존재하는 userId는 서비스 내부에서 null을 반환하도록 처리됩니다.
        userRecomFriendService.createTestUser("user1", "pass123", "김철수", "kimchulsu@example.com", "/profile_images/man.png");
        userRecomFriendService.createTestUser("user2", "pass456", "이영희", "leeyounghee@example.com", "/profile_images/girl.png");
        userRecomFriendService.createTestUser("testuser", "securepass", "테스트사용자", "test@example.com", "/profile_images/man.png");
        userRecomFriendService.createTestUser("friendId", "password", "친구아이디", "friend@example.com", "/profile_images/girl.png");
        userRecomFriendService.createTestUser("anotherone", "anotherpass", "또다른친구", "another@example.com", "/profile_images/man.png");
        return ResponseEntity.ok("Test users creation attempt completed. Check console for duplicates.");
    }
}