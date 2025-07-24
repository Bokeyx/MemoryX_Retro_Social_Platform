package com.project.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Friends;
import com.project.backend.model.Users;

@Repository
public interface FriendsRepository extends JpaRepository<Friends, Integer>{
    // 사용자에 대한 친구 목록 조회
    List<Friends> findByFriendUserOrFriendMatchedUser(Users friendUser, Users friendMatchedUser);
    Optional<Friends> findByFriendUserAndFriendMatchedUserAndStatus(Users friendUser, Users friendMatchedUser, String status);
    Optional<Friends> findByFriendUserAndFriendMatchedUser(Users friendUser, Users friendMatchedUser);

    List<Friends> findByFriendUserAndStatus(Users friendUser, String status);
    List<Friends> findByFriendMatchedUserAndStatus(Users friendMatchedUser, String status);
    void deleteByFriendUser_UserIdAndFriendMatchedUser_UserId(String friendUserId, String matchedUserId);
}
