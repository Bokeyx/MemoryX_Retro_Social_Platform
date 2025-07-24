// src/main/java/com/project/backend/service/users/UserRecomFriendService.java
package com.project.backend.service.users;

import com.project.backend.dto.users.UserRecommendFriendDto; // DTO import
import com.project.backend.model.Users;                      // Users 엔티티 import
import com.project.backend.repository.UserRecomfriendRepository; // Repository import
import org.springframework.beans.factory.annotation.Autowired; // 이 어노테이션은 단일 생성자 주입 시 생략 가능 (IDE 경고는 뜰 수 있음)
import org.springframework.stereotype.Service;

import java.time.LocalDateTime; // Users 엔티티의 createdAt 타입에 맞춰 추가
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors; // 컬렉션 스트림 처리를 위한 import

@Service // 이 클래스가 Spring의 서비스 계층임을 나타내며, Spring 컨테이너에 의해 관리됩니다.
public class UserRecomFriendService {

    // final 키워드를 사용하여 userRepository가 한 번만 초기화되도록 합니다 (불변성).
    private final UserRecomfriendRepository userRepository;

    // 생성자 주입 (Constructor Injection): Spring이 이 생성자를 통해 UserRecomfriendRepository 인스턴스를 주입합니다.
    // @Autowired는 단일 생성자에서는 생략 가능하지만, 명시적으로 유지할 수도 있습니다.
    // @Autowired
    public UserRecomFriendService(UserRecomfriendRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 사용자 ID 또는 이름으로 검색합니다.
     * 먼저 정확한 userId로 검색하고, 없으면 userId 또는 name을 포함하는 사용자를 찾습니다.
     * @param query 검색어 (userId 또는 name)
     * @return 검색된 UserRecommendFriendDto 목록
     */
    public List<UserRecommendFriendDto> searchUsers(String query) {
        List<Users> users;

        // 1. userId로 정확히 일치하는 사용자가 있는지 시도합니다.
        // ID는 고유하므로, ID로 정확히 일치하는 사용자가 있다면 그 사용자만 반환하여 효율성을 높입니다.
        Optional<Users> userById = userRepository.findByUserId(query);
        if (userById.isPresent()) {
            users = List.of(userById.get()); // Optional에서 Users 객체를 가져와 리스트로 만듭니다.
        } else {
            // 2. userId로 정확히 일치하는 사용자가 없으면,
            // userId 또는 name에 query 문자열이 포함된 모든 사용자를 찾습니다. (대소문자 구분 없이)
            users = userRepository.findByUserIdContainingIgnoreCaseOrNameContainingIgnoreCase(query, query);
        }

        // 검색된 Users 엔티티 리스트를 UserRecommendFriendDto 리스트로 변환합니다.
        // .stream() : 리스트를 스트림으로 변환하여 함수형 프로그래밍을 가능하게 합니다.
        // .map() : 스트림의 각 요소를 다른 형태로 변환합니다. 여기서는 Users 객체를 UserRecommendFriendDto로 변환합니다.
        // .collect(Collectors.toList()) : 변환된 요소들을 다시 List로 수집합니다.
        return users.stream()
                .map(user -> UserRecommendFriendDto.builder() // Lombok @Builder를 사용하여 DTO 객체를 깔끔하게 생성합니다.
                        .userId(user.getUserId())
                        .name(user.getName())
                        .profileImage(user.getProfileImage())
                        .build())
                .collect(Collectors.toUnmodifiableList());
    }

    /**
     * 테스트를 위한 더미 사용자 생성 메서드. 실제 애플리케이션에서는 회원가입 로직이 대체합니다.
     * (이 메서드는 필요시에만 UserController에서 호출하여 데이터를 미리 생성할 수 있습니다)
     * @param userId 생성할 사용자의 ID
     * @param password 사용자 비밀번호 (실제 운영 환경에서는 반드시 암호화 필요)
     * @param name 사용자 이름
     * @param email 사용자 이메일
     * @param profileImage 프로필 이미지 URL
     * @return 생성된 사용자의 UserRecommendFriendDto 또는 중복 시 null
     */
    public UserRecommendFriendDto createTestUser(String userId, String password, String name, String email, String profileImage) {
        // 중복 userId 체크 (선택 사항): 동일한 userId를 가진 사용자가 이미 있는지 확인합니다.
        if (userRepository.findByUserId(userId).isPresent()) {
            System.out.println("User with userId " + userId + " already exists.");
            return null; // 이미 존재하면 null 반환 (실제 앱에서는 예외를 던지거나 다른 처리가 필요)
        }

        // Users 엔티티를 Lombok @Builder를 사용하여 생성하고 필요한 필드를 설정합니다.
        Users newUser = Users.builder()
                .userId(userId)
                .password(password) // **주의: 실제 환경에서는 비밀번호 암호화(예: BCrypt) 필수**
                .name(name)
                .email(email)
                .sex("M") // 예시 값 (필요에 따라 동적으로 설정)
                .visited(0) // 예시 값
                .reportCnt(0) // 예시 값
                .userStatus("ACTIVE") // 예시 값
                .createdAt(LocalDateTime.now()) // 현재 시간으로 설정
                .profileImage(profileImage)
                .build();
        
        // 생성된 Users 엔티티를 데이터베이스에 저장합니다.
        Users savedUser = userRepository.save(newUser);

        // 저장된 Users 엔티티를 UserRecommendFriendDto로 변환하여 반환합니다.
        return UserRecommendFriendDto.builder()
                .userId(savedUser.getUserId())
                .name(savedUser.getName())
                .profileImage(savedUser.getProfileImage())
                .build();
    }
}