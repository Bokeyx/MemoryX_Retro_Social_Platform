package com.project.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Diaries;
import com.project.backend.model.Users;

@Repository
public interface DiariesRepository extends JpaRepository<Diaries, Integer> {
    // 특정 한 명의 사용자 게시글 조회
    List<Diaries> findByUserOrderByCreatedAtDesc(Users user);
    List<Diaries> findByDiaryId(Integer diaryId);

    // where user In (friends) order by createdAt desc;
    List<Diaries> findByUserInOrderByCreatedAtDesc(List<Users> users);

    // 뉴스 매일 00시01분 자동생성
    boolean existsByUser_UserIdAndCreatedAt(String userId, LocalDateTime createdAt);
        
    // userId 글 최신순 정렬 -> 가장 첫번째 값
    Optional<Diaries> findTopByUser_UserIdOrderByCreatedAtDesc(String userId);
}