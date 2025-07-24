package com.project.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Guestbook;
import com.project.backend.model.Users; // Users 모델 임포트

@Repository
public interface GuestbookRepository extends JpaRepository<Guestbook, Integer> {
    
    // 특정 방명록 주인의 일촌평 목록을 최신순으로 조회
    List<Guestbook> findByMasterUserOrderByCreatedAtDesc(Users masterUser);
}