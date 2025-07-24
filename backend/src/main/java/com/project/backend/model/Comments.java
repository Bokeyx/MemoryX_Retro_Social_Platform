package com.project.backend.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.Getter; // ✅ 이 줄 추가
import lombok.Setter; // ✅ 이 줄 추가

@Entity
@Table(name="COMMENTS")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@ToString(exclude = {"commentUser"}) // 순환 참조 방지
public class Comments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="COMMENT_ID")
    private Integer commentId;

    @Column(name="CONTENT_TYPE", length=20, nullable=false) // (DIARY, GUEST_BOOK) 구분
    private String contentType;

    @Column(name="CONTENT_ID", nullable=false) // 댓글 단 게시글의 ID(다이어리 or 일촌평) (FK 참조가 아닌 직접 게시글 ID 삽입 필요)
    private Integer contentId;

    // 댓글 작성 유저
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COMMENT_USER", referencedColumnName = "USER_ID", nullable = false)
    @JsonBackReference
    private Users commentUser;

    @Column(name="CONTENT", length=255, nullable = false)
    private String content;

    @CreationTimestamp
    @Column(name="CREATED_AT", nullable=false)
    private LocalDateTime createdAt;
}
