package com.project.backend.controller.oauth;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.project.backend.model.Users;
import com.project.backend.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class OauthController {

    private final UsersRepository usersRepository;

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String accessToken = body.get("accessToken");

        String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.exchange(
                    userInfoUrl, HttpMethod.GET, entity, Map.class);

            Map<String, Object> userInfo = response.getBody();
            String sub = (String) userInfo.get("sub");
            String email = (String) userInfo.get("email");
            String userId = sub.substring(0, Math.min(sub.length(), 20)); // ✅ sub를 userId로 사용하고 20자로 자름
            String password = sub.substring(0, 10); // ✅ 비밀번호는 sub 앞 10자리
            String name = (String) userInfo.get("name");
            String profileImage = (String) userInfo.get("picture"); // Google 프로필 이미지 URL

            Optional<Users> optionalUser = usersRepository.findByAuthProviderAndUserId("google", userId);

            Users user;  
            boolean isNew;

            if (optionalUser.isPresent()) {
                user = optionalUser.get();
                isNew = false;
            } else {
                // 여기선 DB 저장은 하지 않고, 회원가입 시점에 저장됨
                user = Users.builder()
                        .userId(userId)
                        .password(password)
                        .name(name)
                        .email(email)
                        .authProvider("google")
                        .profileImage(profileImage) // 프로필 이미지 추가
                        .sex("UNKNOWN") // 기본값 설정
                        .bloodType("UNKNOWN") // 기본값 설정
                        .introduction("") // 기본값 설정
                        .visited(0) // 기본값 설정
                        .totalVisitCount(0) // 기본값 설정
                        .reportCnt(0) // 기본값 설정
                        .userStatus("ACTIVE") // 기본값 설정
                        .createdAt(LocalDateTime.now()) // 기본값 설정
                        .build();
                isNew = true;
            }

            // 응답으로 내려줄 모든 사용자 정보
            Map<String, Object> result = new HashMap<>();
            result.put("userId", user.getUserId());
            result.put("password", user.getPassword());
            result.put("name", user.getName());
            result.put("birth", user.getBirth());
            result.put("phone", user.getPhone());
            result.put("email", user.getEmail());
            result.put("sex", user.getSex());
            result.put("authProvider", user.getAuthProvider());
            result.put("bloodType", user.getBloodType());
            result.put("introduction", user.getIntroduction());
            result.put("profileImage", user.getProfileImage());
            result.put("visited", user.getVisited());
            result.put("totalVisitCount", user.getTotalVisitCount());
            result.put("lastVisitDate", user.getLastVisitDate());
            result.put("reportCnt", user.getReportCnt());
            result.put("userStatus", user.getUserStatus());
            result.put("createdAt", user.getCreatedAt());
            result.put("isNew", isNew);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("구글 로그인 실패: " + e.getMessage());
        }
    }

    @PostMapping("/kakao")
    public ResponseEntity<?> kakaoLogin(@RequestBody Map<String, String> body) {
        String kakaoUserId = body.get("userId"); // 카카오에서 받은 원본 userId
        String username = body.get("username"); // 카카오에서 받은 username

        // userId는 최대 20자로 제한
        String userId = kakaoUserId;
        if (userId != null && userId.length() > 20) {
            userId = userId.substring(0, 20);
        }

        // password는 id에서 절반으로 자르고
        String password = userId; // 일단 userId로 초기화
        if (password != null && password.length() > 0) {
            password = password.substring(0, Math.max(1, password.length() / 2)); // 최소 1자
        } else {
            password = "default_kakao_password"; // userId가 null이거나 비어있을 경우 대비
        }

        // email은 password + @kakao.com
        String email = password + "@kakao.com";

        Optional<Users> optionalUser = usersRepository.findByAuthProviderAndUserId("kakao", userId);

        Users user;
        boolean isNew;

        if (optionalUser.isPresent()) {
            user = optionalUser.get();
            isNew = false;
        } else {
            user = Users.builder()
                    .userId(userId)
                    .password(password)
                    .name(username) // 카카오에서는 username을 name으로 사용
                    .email(userId + "@kakao.com") // 임시 이메일 생성
                    .authProvider("kakao")
                    .profileImage(null) // 카카오 프로필 이미지는 추후 추가
                    .sex("UNKNOWN")
                    .bloodType("UNKNOWN")
                    .introduction("")
                    .visited(0)
                    .totalVisitCount(0)
                    .reportCnt(0)
                    .userStatus("ACTIVE")
                    .createdAt(LocalDateTime.now())
                    .build();
            isNew = true;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getUserId());
        result.put("password", user.getPassword());
        result.put("name", user.getName());
        result.put("birth", user.getBirth());
        result.put("phone", user.getPhone());
        result.put("email", user.getEmail());
        result.put("sex", user.getSex());
        result.put("authProvider", user.getAuthProvider());
        result.put("bloodType", user.getBloodType());
        result.put("introduction", user.getIntroduction());
        result.put("profileImage", user.getProfileImage());
        result.put("visited", user.getVisited());
        result.put("totalVisitCount", user.getTotalVisitCount());
        result.put("lastVisitDate", user.getLastVisitDate());
        result.put("reportCnt", user.getReportCnt());
        result.put("userStatus", user.getUserStatus());
        result.put("createdAt", user.getCreatedAt());
        result.put("isNew", isNew);

        return ResponseEntity.ok(result);
    }
}