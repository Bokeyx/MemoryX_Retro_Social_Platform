package com.project.backend.service.users;

import com.project.backend.model.Users;
import com.project.backend.repository.UsersRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class UserAuthService {

    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // 임시 인증 코드 저장소 (운영 환경에서는 Redis 등 사용 권장)
    private final Map<String, String> verificationCodes = new HashMap<>();
    private final Map<String, LocalDateTime> codeExpirations = new HashMap<>();

    public UserAuthService(UsersRepository usersRepository, BCryptPasswordEncoder passwordEncoder) {
        this.usersRepository = usersRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 비밀번호 찾기 - 인증 코드 발송
    public String sendVerificationCode(String userId, String phoneNumber) {
        System.out.println("UserAuthService: Attempting to send verification code for userId: " + userId + ", phoneNumber: " + phoneNumber);
        Optional<Users> userOptional = usersRepository.findByUserIdAndPhone(userId, phoneNumber);

        if (userOptional.isPresent()) {
            System.out.println("UserAuthService: User found in database. User ID: " + userOptional.get().getUserId());
            String code = generateVerificationCode();
            verificationCodes.put(userId, code);
            codeExpirations.put(userId, LocalDateTime.now().plusSeconds(10)); // 10초 유효
            System.out.println("UserAuthService: Generated verification code for " + userId + ": " + code);
            return code; // 생성된 코드를 반환
        } else {
            System.out.println("UserAuthService: User NOT found in database for userId: " + userId + ", phoneNumber: " + phoneNumber);
            return null; // 사용자를 찾지 못하면 null 반환
        }
    }

    // 아이디 찾기 - 인증 코드 발송
    public String sendVerificationCodeForFindId(String phoneNumber) {
        System.out.println("UserAuthService: Attempting to send verification code for phoneNumber: " + phoneNumber);
        Optional<Users> userOptional = usersRepository.findByPhone(phoneNumber);

        if (userOptional.isPresent()) {
            System.out.println("UserAuthService: User found for phone number: " + userOptional.get().getUserId());
            String code = generateVerificationCode();
            // 아이디 찾기의 경우, 휴대폰 번호를 키로 사용
            verificationCodes.put(phoneNumber, code);
            codeExpirations.put(phoneNumber, LocalDateTime.now().plusSeconds(10)); // 10초 유효
            System.out.println("UserAuthService: Generated verification code for phone: " + phoneNumber + ": " + code);
            return code;
        } else {
            System.out.println("UserAuthService: User NOT found for phone number: " + phoneNumber);
            return null;
        }
    }

    // 비밀번호 찾기 - 인증 코드 확인
    public boolean verifyCode(String userId, String code) {
        String storedCode = verificationCodes.get(userId);
        LocalDateTime expirationTime = codeExpirations.get(userId);

        if (storedCode != null && expirationTime != null && LocalDateTime.now().isBefore(expirationTime)) {
            if (storedCode.equals(code)) {
                verificationCodes.remove(userId); // 성공 시 코드 삭제
                codeExpirations.remove(userId);
                System.out.println("UserAuthService: Code verified successfully for userId: " + userId);
                return true;
            }
        }
        System.out.println("UserAuthService: Invalid or expired code for userId: " + userId);
        return false;
    }

    // 아이디 찾기 - 인증 코드 확인 및 아이디 반환
    public String verifyCodeForFindId(String phoneNumber, String code) {
        String storedCode = verificationCodes.get(phoneNumber);
        LocalDateTime expirationTime = codeExpirations.get(phoneNumber);

        if (storedCode != null && expirationTime != null && LocalDateTime.now().isBefore(expirationTime)) {
            if (storedCode.equals(code)) {
                verificationCodes.remove(phoneNumber); // 성공 시 코드 삭제
                codeExpirations.remove(phoneNumber);
                System.out.println("UserAuthService: Code verified successfully for phone: " + phoneNumber);
                // 휴대폰 번호로 사용자 아이디 조회
                Optional<Users> userOptional = usersRepository.findByPhone(phoneNumber);
                return userOptional.map(Users::getUserId).orElse(null);
            }
        }
        System.out.println("UserAuthService: Invalid or expired code for phone: " + phoneNumber);
        return null;
    }

    public boolean resetPassword(String userId, String newPassword) {
        Optional<Users> userOptional = usersRepository.findById(userId);
        if (userOptional.isPresent()) {
            Users user = userOptional.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            usersRepository.save(user);
            System.out.println("UserAuthService: Password reset successfully for userId: " + userId);
            return true;
        }
        System.out.println("UserAuthService: Failed to reset password for userId: " + userId + ". User not found.");
        return false;
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6자리 숫자
        return String.valueOf(code);
    }
}