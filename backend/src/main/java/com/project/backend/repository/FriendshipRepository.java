package com.project.backend.repository;
import java.util.List; // 엔티티 이름은 그대로 유지
import java.util.Optional; // 엔티티 이름은 그대로 유지

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Friends;
import com.project.backend.model.Users;

@Repository
public interface FriendshipRepository extends JpaRepository<Friends, Integer> { // 변경된 Repository 이름

    List<Friends> findByFriendUserAndStatus(Users friendUser, String status);
    List<Friends> findByFriendMatchedUserAndStatus(Users friendMatchedUser, String status);

    Optional<Friends> findByFriendsIdAndFriendMatchedUserAndStatus(Integer friendsId, Users friendMatchedUser, String status);
}
