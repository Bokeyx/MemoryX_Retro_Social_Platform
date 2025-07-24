// src/main/java/com/project/backend/repository/UserRecomfriendRepository.java
package com.project.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Users; // Users 엔티티를 import 합니다.

@Repository // 이 인터페이스가 Spring의 Repository 계층임을 나타냅니다.
public interface UserRecomfriendRepository extends JpaRepository<Users, String> {
    // JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.

    // userId로 정확히 일치하는 사용자를 찾습니다. (ID는 고유하므로 Optional<Users>를 반환)
    Optional<Users> findByUserId(String userId);

    // userId 또는 name에 특정 문자열이 포함된 모든 사용자를 찾습니다 (대소문자 무시).
    // Spring Data JPA의 쿼리 메서드 기능을 활용하여 OR 조건과 대소문자 무시 검색을 정의합니다.
    List<Users> findByUserIdContainingIgnoreCaseOrNameContainingIgnoreCase(String userIdKeyword, String nameKeyword);
}