package com.project.backend.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Diaries;

@Repository
public interface FriendDiariesRepository extends JpaRepository<Diaries, Integer> {
    // 사용자 ID로 일기를 찾고, 생성 날짜 내림차순으로 정렬
    // 'user'가 Diaries 엔티티에서 Users에 매핑되는 정확한 필드 이름인지 확인하세요.
    List<Diaries> findByUser_UserIdOrderByCreatedAtDesc(String userId);
}