package com.project.backend.service.users;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.backend.dto.users.FriendProfileDto;
import com.project.backend.dto.users.UserSearchDto;
import com.project.backend.model.Users;
import com.project.backend.repository.UserSearchRepository;

@Service
public class UserUnKnownService {
    private final UserSearchRepository userSearchRepository;

    @Autowired
    public UserUnKnownService(UserSearchRepository userSearchRepository) {
        this.userSearchRepository = userSearchRepository;
    }

    /**
     * 이름 또는 userId로 사용자를 검색합니다.
     * @param query 검색 쿼리 문자열.
     * @param excludeUserId 검색 결과에서 제외할 사용자 ID (선택 사항).
     * @return 쿼리와 일치하는 UserSearchDto 목록.
     */
    public List<UserSearchDto> searchUsers(String query, String excludeUserId) {
        List<Users> users = userSearchRepository.findByNameContainingIgnoreCaseOrUserIdContainingIgnoreCase(query, query);

        return users.stream()
                .filter(user -> excludeUserId == null || !user.getUserId().equalsIgnoreCase(excludeUserId)) // excludeUserId가 null이 아니면 해당 사용자 제외 (대소문자 무시)
                .map(user -> UserSearchDto.builder()
                        .userId(user.getUserId())
                        .name(user.getName())
                        .profileImage(user.getProfileImage())
                        .build())
                .collect(Collectors.toUnmodifiableList());
    }

    /**
     * userId로 친구의 프로필 세부 정보를 가져옵니다.
     * @param userId 친구의 ID.
     * @return 발견되면 FriendProfileDto를 포함하는 Optional, 그렇지 않으면 비어 있습니다.
     */
    public Optional<FriendProfileDto> getFriendProfile(String userId) {
        return userSearchRepository.findByUserId(userId)
                .map(user -> FriendProfileDto.builder()
                        .userId(user.getUserId())
                        .name(user.getName())
                        .sex(user.getSex())
                        .profileImage(user.getProfileImage())
                        .introduction(user.getIntroduction())
                        .build());
    }
}