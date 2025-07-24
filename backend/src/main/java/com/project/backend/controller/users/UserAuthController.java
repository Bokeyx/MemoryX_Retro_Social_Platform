package com.project.backend.controller.users;

import com.project.backend.dto.users.UserForgotPasswordRequestDto;
import com.project.backend.dto.users.UserVerifyCodeRequestDto;
import com.project.backend.dto.users.UserResetPasswordRequestDto;
import com.project.backend.dto.users.UserFindIdRequestDto;
import com.project.backend.dto.users.UserVerifyIdCodeRequestDto;
import com.project.backend.service.users.UserAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api") // 상위 경로 변경
public class UserAuthController {

    private final UserAuthService userAuthService;

    public UserAuthController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    // 비밀번호 찾기 - 인증 코드 발송
    @PostMapping("/forgot-password/send-code")
    public ResponseEntity<?> sendCode(@RequestBody UserForgotPasswordRequestDto request) {
        String verificationCode = userAuthService.sendVerificationCode(request.getUserId(), request.getPhoneNumber());
        if (verificationCode != null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Verification code sent.");
            response.put("code", verificationCode); // 인증 코드를 응답에 포함
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body("User not found or phone number mismatch.");
        }
    }

    // 비밀번호 찾기 - 인증 코드 확인
    @PostMapping("/forgot-password/verify-code")
    public ResponseEntity<String> verifyCode(@RequestBody UserVerifyCodeRequestDto request) {
        if (userAuthService.verifyCode(request.getUserId(), request.getCode())) {
            return ResponseEntity.ok("Code verified successfully.");
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired code.");
        }
    }

    // 비밀번호 찾기 - 비밀번호 재설정
    @PostMapping("/forgot-password/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody UserResetPasswordRequestDto request) {
        if (userAuthService.resetPassword(request.getUserId(), request.getNewPassword())) {
            return ResponseEntity.ok("Password reset successfully.");
        } else {
            return ResponseEntity.badRequest().body("Failed to reset password.");
        }
    }

    // 아이디 찾기 - 인증 코드 발송
    @PostMapping("/find-id/send-code")
    public ResponseEntity<?> sendCodeForFindId(@RequestBody UserFindIdRequestDto request) {
        String verificationCode = userAuthService.sendVerificationCodeForFindId(request.getPhoneNumber());
        if (verificationCode != null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Verification code sent.");
            response.put("code", verificationCode);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body("User not found for the provided phone number.");
        }
    }

    // 아이디 찾기 - 인증 코드 확인
    @PostMapping("/find-id/verify-code")
    public ResponseEntity<?> verifyCodeForFindId(@RequestBody UserVerifyIdCodeRequestDto request) {
        String foundUserId = userAuthService.verifyCodeForFindId(request.getPhoneNumber(), request.getCode());
        if (foundUserId != null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Code verified successfully.");
            response.put("userId", foundUserId); // 찾은 아이디를 응답에 포함
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired code, or user not found.");
        }
    }
}
