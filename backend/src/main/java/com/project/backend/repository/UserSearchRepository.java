package com.project.backend.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Users;

@Repository
public interface UserSearchRepository extends JpaRepository<Users, String> { // ✅ UsersRepository -> UserSearchRepository
    // 이름 또는 userId로 사용자를 찾는 메서드 (이름은 대소문자 구분 없이 검색)
    List<Users> findByNameContainingIgnoreCaseOrUserIdContainingIgnoreCase(String nameQuery, String userIdQuery);

    Optional<Users> findByUserId(String userId); // userId로 찾는 명시적 메서드
}