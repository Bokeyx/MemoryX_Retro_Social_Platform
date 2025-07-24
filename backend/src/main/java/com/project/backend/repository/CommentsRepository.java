package com.project.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Comments;

@Repository
public interface CommentsRepository extends JpaRepository<Comments, Integer>{
    // 특정 한 게시글의 댓글 조회
    @Query("SELECT c FROM Comments c JOIN FETCH c.commentUser u WHERE c.contentId = :contentId")
    List<Comments> findByContentIdWithUser(@Param("contentId") Integer contentId);
}
