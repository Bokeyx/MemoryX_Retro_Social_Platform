package com.project.backend.controller.users;

import java.util.Collections;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.backend.dto.users.UsersSignupDTO;
import com.project.backend.model.Users;
import com.project.backend.service.users.UsersService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UsersSignupController {

    private final UsersService usersService;

    // ✅ 회원가입
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UsersSignupDTO signupDTO) {
        try {
            Users user = usersService.registerUser(signupDTO);
            return ResponseEntity.ok(user);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // 스택 트레이스 출력
            return ResponseEntity.status(500).body("서버 오류 발생: " + e.getMessage());
        }
    }

    // ✅ 아이디 중복 확인
    @GetMapping("/check-duplicate/{userId}")
public ResponseEntity<?> checkDuplicateUserId(@PathVariable String userId) {
    try {
        boolean isDuplicate = usersService.checkUserIdExists(userId);
        return ResponseEntity.ok(Collections.singletonMap("isDuplicate", isDuplicate));
    } catch (IllegalArgumentException e) {
        e.printStackTrace(); // 콘솔에 찍힘
        return ResponseEntity.badRequest().body("잘못된 요청: " + e.getMessage());
    } catch (Exception e) {
        e.printStackTrace(); // ⭐️ 반드시 추가
        return ResponseEntity.status(500).body("서버 오류 발생: " + e.getMessage());
    }
}
}
