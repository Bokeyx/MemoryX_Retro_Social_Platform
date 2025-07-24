package com.project.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Contents;

@Repository
public interface ContentsRepository extends JpaRepository<Contents, Integer> {
    Optional<Contents> findByTitle(String title);

    @Query(value = "SELECT * FROM CONTENTS ORDER BY RAND() LIMIT :count", nativeQuery = true)
    List<Contents> findRandomContents(int count);
}