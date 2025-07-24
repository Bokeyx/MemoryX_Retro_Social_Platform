package com.project.backend.service.friends;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.TreeSet;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend.dto.friends.FriendsListDetailDto;
import com.project.backend.dto.friends.FriendsListDto;
import com.project.backend.dto.friends.FriendsStatusDto;
import com.project.backend.model.Friends;
import com.project.backend.model.Users;
import com.project.backend.repository.FriendsRepository;
import com.project.backend.repository.UsersRepository;
import com.project.backend.service.notification.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class FriendsService {
    private final FriendsRepository friendsRepository;
    private final UsersRepository usersRepository;
    private final NotificationService notificationService;

    public List<FriendsListDto> getUserFriends(String userId){
        Users currentUser = usersRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자 ID를 찾을 수 없습니다: " + userId));

        List<Friends> acceptedUserSide = friendsRepository.findByFriendUserAndStatus(currentUser, "ACCEPTED");
        List<Friends> acceptedMatchedSide = friendsRepository.findByFriendMatchedUserAndStatus(currentUser, "ACCEPTED");

        List<Friends> relationships = new ArrayList<>();
        relationships.addAll(acceptedUserSide);
        relationships.addAll(acceptedMatchedSide);


        List<FriendsListDto> friendsDtoList = relationships.stream()
            .map(friendship -> {
                Users friendInfo = friendship.getFriendUser().getUserId().equals(userId)
                                    ? friendship.getFriendMatchedUser()
                                    : friendship.getFriendUser();

                return FriendsListDto.builder()
                        .friendsId(friendship.getFriendsId())
                        .friendUser(currentUser.getUserId())
                        .friendMatchedUser(friendInfo.getUserId())
                        .emotionCommon(friendship.getEmotionCommon())
                        .userName(friendInfo.getName())
                        .userSex(friendInfo.getSex())
                        .userProfileImage(friendInfo.getProfileImage())
                        .build();
            })
            .collect(Collectors.collectingAndThen(
                Collectors.toCollection(() -> new TreeSet<>(Comparator.comparing(FriendsListDto::getFriendMatchedUser))),
                ArrayList::new
            ));
        
        return friendsDtoList;
    }

    
    public List<FriendsStatusDto> getFriendsOfFriendWithStatus(String friendUserId, String viewerId) {
        Users friendUser = usersRepository.findById(friendUserId)
            .orElseThrow(() -> new IllegalArgumentException("친구 ID를 찾을 수 없습니다: " + friendUserId));

        Users viewerUser = usersRepository.findById(viewerId)
            .orElseThrow(() -> new IllegalArgumentException("조회자 ID를 찾을 수 없습니다: " + viewerId));

        // 1. friendUser의 친구 목록 가져오기
        List<Friends> friendRelationships = friendsRepository.findByFriendUserOrFriendMatchedUser(friendUser, friendUser);
        List<Users> friendsOfFriend = friendRelationships.stream()
            .map(relation -> relation.getFriendUser().equals(friendUser)
                ? relation.getFriendMatchedUser()
                : relation.getFriendUser())
            .distinct()
            .collect(Collectors.toList());

        // 2. viewerUser와 각 친구 사이의 관계 조회
        return friendsOfFriend.stream().map(friend -> {
            String status;
            if (friend.getUserId().equals(viewerId)) {
                status = "MYSELF";
            } else {
                // viewerUser와 이 친구 사이의 관계 가져오기 (양방향 가능성 고려)
                Friends relationship = friendsRepository
                    .findByFriendUserAndFriendMatchedUser(viewerUser, friend)
                    .orElseGet(() -> friendsRepository
                        .findByFriendUserAndFriendMatchedUser(friend, viewerUser)
                        .orElse(null));
                status = relationship != null ? relationship.getStatus() : "NONE";
            }

            return FriendsStatusDto.builder()
                    .userId(friend.getUserId())
                    .name(friend.getName())
                    .profileImage(friend.getProfileImage())
                    .status(status)
                    .build();
            }).collect(Collectors.toList());
    }


    public void sendFriendRequest(String requesterId, String targetId) {
        Users requester = usersRepository.findById(requesterId)
            .orElseThrow(() -> new IllegalArgumentException("요청자 ID(" + requesterId + ")를 찾을 수 없습니다."));
        Users target = usersRepository.findById(targetId)
            .orElseThrow(() -> new IllegalArgumentException("대상자 ID(" + targetId + ")를 찾을 수 없습니다."));

        // 자기 자신에게 친구 요청 방지
        if (requesterId.equals(targetId)) {
            throw new IllegalStateException("자기 자신에게는 친구 요청을 보낼 수 없습니다.");
        }

        // 이미 친구 요청이 있거나 친구인 경우 검사
        // requester가 target에게 보낸 PENDING 요청이 이미 있는지 확인
        Optional<Friends> existingPendingRequest = friendsRepository.findByFriendUserAndFriendMatchedUserAndStatus(requester, target, "PENDING");
        // 이미 친구 관계인지 확인 (requester -> target 방향)
        Optional<Friends> existingAcceptedRequest1 = friendsRepository.findByFriendUserAndFriendMatchedUserAndStatus(requester, target, "ACCEPTED");
        // 이미 친구 관계인지 확인 (target -> requester 방향)
        Optional<Friends> existingAcceptedRequest2 = friendsRepository.findByFriendUserAndFriendMatchedUserAndStatus(target, requester, "ACCEPTED");

        if (existingPendingRequest.isPresent()) {
            throw new IllegalStateException("이미 해당 사용자에게 보류 중인 친구 요청을 보냈습니다.");
        }
        if (existingAcceptedRequest1.isPresent() || existingAcceptedRequest2.isPresent()) {
            throw new IllegalStateException("이미 친구 관계입니다.");
        }

        // 단방향 친구 요청 상태 생성 (requester가 보내는 사람, target이 받는 사람)
        Friends request = Friends.builder()
            .friendUser(requester) // 요청을 보내는 사람
            .friendMatchedUser(target) // 요청을 받는 사람
            .status("PENDING")
            .createdAt(LocalDateTime.now())
            .build();
            
        friendsRepository.save(request);

        // 친구 요청 알림 생성
        notificationService.createNotification(
            targetId, 
            requesterId, 
            "FRIEND_REQUEST", 
            requester.getName() + "님이 친구 요청을 보냈습니다.", 
            "/main/alert" // 알림 페이지로 이동하도록 설정
        );
    }

    public void acceptFriendRequest(String requesterId, String targetId) {
        Users requester = usersRepository.findById(requesterId)
            .orElseThrow(() -> new IllegalArgumentException("요청자 ID가 존재하지 않습니다."));
        Users target = usersRepository.findById(targetId)
            .orElseThrow(() -> new IllegalArgumentException("대상자 ID가 존재하지 않습니다."));

        // requester가 target에게 보낸 PENDING 요청 찾기
        Optional<Friends> pendingRequestOpt = friendsRepository.findByFriendUserAndFriendMatchedUserAndStatus(requester, target, "PENDING");

        if (pendingRequestOpt.isPresent()) {
            Friends pendingRequest = pendingRequestOpt.get();
            pendingRequest.setStatus("ACCEPTED");
            friendsRepository.save(pendingRequest);

            // 역방향 친구 관계 생성 (target -> requester)
            Friends acceptedReverseRequest = Friends.builder()
                .friendUser(target)
                .friendMatchedUser(requester)
                .status("ACCEPTED")
                .createdAt(LocalDateTime.now())
                .build();
            friendsRepository.save(acceptedReverseRequest);

            // 친구 요청 수락 알림 생성 (요청자에게)
            notificationService.createNotification(
                requesterId, 
                targetId, 
                "FRIEND_ACCEPTED", 
                target.getName() + "님이 친구 요청을 수락했습니다.", 
                "/main/mypage/friendlist" // 친구 목록 페이지로 이동하도록 설정
            );
        } else {
            throw new IllegalStateException("처리할 친구 요청이 존재하지 않거나 PENDING 상태가 아닙니다.");
        }
    }

    public void rejectFriendRequest(String requesterId, String targetId) {
        Users requester = usersRepository.findById(requesterId)
            .orElseThrow(() -> new IllegalArgumentException("요청자 ID가 존재하지 않습니다."));
        Users target = usersRepository.findById(targetId)
            .orElseThrow(() -> new IllegalArgumentException("대상자 ID가 존재하지 않습니다."));

        // requester가 target에게 보낸 PENDING 요청 찾기
        Optional<Friends> pendingRequestOpt = friendsRepository.findByFriendUserAndFriendMatchedUserAndStatus(requester, target, "PENDING");

        if (pendingRequestOpt.isPresent()) {
            friendsRepository.delete(pendingRequestOpt.get());

            // 친구 요청 거절 알림 생성 (요청자에게)
            notificationService.createNotification(
                requesterId, 
                targetId, 
                "FRIEND_REJECTED", 
                target.getName() + "님이 친구 요청을 거절했습니다.", 
                "/main/mypage/friendlist" // 친구 목록 페이지로 이동하도록 설정
            );
        } else {
            throw new IllegalStateException("처리할 친구 요청이 존재하지 않거나 PENDING 상태가 아닙니다.");
        }
    }

    public List<FriendsListDetailDto> getFriendsListDetails(String userId){
        Users user = usersRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("userID 없음"));

        List<FriendsListDetailDto> result = new ArrayList<>();

        // 1. ACCEPTED 상태의 친구 관계 추가
        friendsRepository.findByFriendUserAndStatus(user, "ACCEPTED").stream()
            .map(relation -> FriendsListDetailDto.builder()
                .userId(relation.getFriendMatchedUser().getUserId())
                .name(relation.getFriendMatchedUser().getName())
                .sex(relation.getFriendMatchedUser().getSex())
                .profileImage(relation.getFriendMatchedUser().getProfileImage())
                .status(relation.getStatus())
                .build())
            .forEach(result::add);

        friendsRepository.findByFriendMatchedUserAndStatus(user, "ACCEPTED").stream()
            .map(relation -> FriendsListDetailDto.builder()
                .userId(relation.getFriendUser().getUserId())
                .name(relation.getFriendUser().getName())
                .sex(relation.getFriendUser().getSex())
                .profileImage(relation.getFriendUser().getProfileImage())
                .status(relation.getStatus())
                .build())
            .forEach(result::add);

        // 2. 현재 사용자가 요청을 보낸 PENDING 상태의 친구 관계 추가
        friendsRepository.findByFriendUserAndStatus(user, "PENDING").stream()
            .map(relation -> FriendsListDetailDto.builder()
                .userId(relation.getFriendMatchedUser().getUserId())
                .name(relation.getFriendMatchedUser().getName())
                .sex(relation.getFriendMatchedUser().getSex())
                .profileImage(relation.getFriendMatchedUser().getProfileImage())
                .status(relation.getStatus()) // PENDING 상태
                .build())
            .forEach(result::add);

        // 중복 제거 (동일한 친구가 여러 관계에 포함될 수 있으므로)
        return result.stream()
            .collect(Collectors.collectingAndThen(
                Collectors.toCollection(() -> new TreeSet<>(Comparator.comparing(FriendsListDetailDto::getUserId))),
                ArrayList::new
            ));
    }


    @Transactional
    public void deleteFriendship(String userId1, String userId2) {
        friendsRepository.deleteByFriendUser_UserIdAndFriendMatchedUser_UserId(userId1, userId2);
        friendsRepository.deleteByFriendUser_UserIdAndFriendMatchedUser_UserId(userId2, userId1);
    }

    public String getFriendStatus(String userAId, String userBId) {
        // userId → Users 엔티티로 변환 (예: UsersRepository 사용)
        Users userA = usersRepository.findByUserId(userAId)
                .orElseThrow(() -> new IllegalArgumentException("UserA not found"));
        Users userB = usersRepository.findByUserId(userBId)
                .orElseThrow(() -> new IllegalArgumentException("UserB not found"));

        // 친구 상태 조회 (양방향 고려)
        Optional<Friends> forward = friendsRepository.findByFriendUserAndFriendMatchedUser(userA, userB);
        Optional<Friends> backward = friendsRepository.findByFriendUserAndFriendMatchedUser(userB, userA);

        if (forward.isPresent()) return forward.get().getStatus();
        if (backward.isPresent()) return backward.get().getStatus();

        return "NONE";
    }

}