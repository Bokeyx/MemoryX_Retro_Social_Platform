package com.project.backend.controller.users;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.backend.dto.users.JwtResponseDTO;
import com.project.backend.dto.users.UsersLoginDTO;
import com.project.backend.service.users.UsersService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UsersLoginController {

    private final UsersService usersService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UsersLoginDTO loginDTO) {
        try {
            JwtResponseDTO response = usersService.loginUserAndGetToken(loginDTO.getUserId(), loginDTO.getPassword());
               System.out.println("✅ JWT 토큰: " + response.getToken()); // 👉 이거 추가해봐
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("로그인 실패: " + e.getMessage());
        }
    }
}
