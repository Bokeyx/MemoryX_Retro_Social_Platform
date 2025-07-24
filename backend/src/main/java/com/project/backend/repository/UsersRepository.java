package com.project.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.backend.model.Users;

public interface UsersRepository extends JpaRepository<Users, String> {

    boolean existsByUserId(String userId);

    Optional<Users> findByAuthProviderAndUserId(String authProvider, String userId);

    Optional<Users> findByUserIdAndPhone(String userId, String phone);

    Optional<Users> findByPhone(String phone);
    
    Optional<Users> findByUserId(String userId);
}
