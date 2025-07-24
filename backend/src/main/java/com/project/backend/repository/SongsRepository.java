package com.project.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Songs;

@Repository
public interface SongsRepository extends JpaRepository<Songs, Integer> {
    Optional<Songs> findByTitle(String title);
}
