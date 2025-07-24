package com.project.backend.service.friends;

import java.util.Optional; // For Optional
import com.project.backend.dto.friends.FriendshipResponseCommand; // For your DTO
import org.springframework.transaction.annotation.Transactional;
import com.project.backend.dto.friends.PendingFriendshipRequest;
import com.project.backend.dto.friends.FriendshipResponseCommand; // 추가: FriendshipResponseCommand DTO 임포트
import com.project.backend.model.Friends;
import com.project.backend.model.Users;
import com.project.backend.repository.FriendshipRepository;
import com.project.backend.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 추가: @Transactional 임포트

import java.util.List;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UsersRepository userRepository;

    public List<PendingFriendshipRequest> getPendingFriendshipRequests(String targetUserId) {
        Users targetUser = userRepository.findByUserId(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + targetUserId));

        // targetUser가 friendMatchedUser인 PENDING 요청을 찾습니다.
        List<Friends> pendingRequests = friendshipRepository.findByFriendMatchedUserAndStatus(targetUser, "PENDING");

        return pendingRequests.stream()
                .map(request -> PendingFriendshipRequest.builder()
                        .requestId(request.getFriendsId())
                        .inviterName(request.getFriendUser().getName()) // 요청을 보낸 사람의 이름
                        .inviterProfileImage(request.getFriendUser().getProfileImage()) // 요청을 보낸 사람의 프로필 이미지
                        .inviterSongId(request.getFriendUser().getMysong() != null ?
                                String.valueOf(request.getFriendUser().getMysong().getSongId()) : null)
                        .requestedAt(request.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    
    @Transactional
    public boolean processFriendshipResponse(FriendshipResponseCommand command) {
        Users targetUser = userRepository.findByUserId(command.getTargetUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + command.getTargetUserId()));

        Optional<Friends> optionalFriendRequest = friendshipRepository.findByFriendsIdAndFriendMatchedUserAndStatus(
                command.getRequestId(), targetUser, "PENDING");

        if (optionalFriendRequest.isPresent()) {
            Friends friendRequest = optionalFriendRequest.get();
            if ("accept".equalsIgnoreCase(command.getResponseAction())) {
                friendRequest.setStatus("ACCEPTED");
            } else if ("reject".equalsIgnoreCase(command.getResponseAction())) {
                friendRequest.setStatus("NONE");
            } else {
                throw new IllegalArgumentException("유효하지 않은 응답 액션입니다: " + command.getResponseAction());
            }
            friendshipRepository.save(friendRequest);
            return true;
        } else {
            return false;
        }
    }
}