package com.project.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Likes;
import com.project.backend.model.Users;

@Repository
public interface LikesRepository extends JpaRepository<Likes, Integer>{
    /*
     * select c1 from Likes l
     *  : <- 쿼리문 안에서 사용하는 파라미터 (user, contentType, contendId)
     */
    @Query("SELECT l FROM Likes l WHERE l.user = :user AND l.contentType = :contentType AND l.contentId = :contentId")
    Optional<Likes> findByUserAndContentTypeAndContentId(
            @Param("user") Users user,
            @Param("contentType") String contentType,
            @Param("contentId") Integer contentId
    );
}
