package com.project.backend.model;

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
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name="LIKES")
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class Likes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="LIKE_ID")
    private Integer likeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private Users user;

    @Column(name = "CONTENT_TYPE", nullable = false)
    private String contentType;

    @Column(name = "CONTENT_ID", nullable = false)
    private Integer contentId;
    
    @Builder
    public Likes(Users user, String contentType, Integer contentId) {
        this.user = user;
        this.contentType = contentType;
        this.contentId = contentId;
    }
}
