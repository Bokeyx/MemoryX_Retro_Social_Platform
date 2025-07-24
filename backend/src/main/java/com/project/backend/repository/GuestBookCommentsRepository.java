package com.project.backend.repository;

import com.project.backend.model.Comments; // Comments 모델 임포트

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuestBookCommentsRepository extends JpaRepository<Comments, Integer> {
    // GuestBookCommentsRepository는 Comments 엔티티와 Integer 타입의 ID를 다룹니다.
    // 필요에 따라 여기에 추가적인 쿼리 메서드를 정의할 수 있습니다.
    // 예: 특정 Guestbook에 달린 댓글 조회 등 (이는 CommentRepository에 이미 정의됨)
}
