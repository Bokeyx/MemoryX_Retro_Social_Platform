package com.project.backend.model;

import java.time.LocalDateTime;

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
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name="COMMUNITY_MATCHES")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@ToString(exclude = {"communityMatchUser", "communityMatchedUser"})
public class CommunityMatches {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="CM_ID")
    private Integer communityMatchId;
    
    // 사용자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CM_USER", referencedColumnName = "USER_ID", nullable = false)
    @JsonBackReference
    private Users communityMatchUser;

    // 사용자와 매치 될 사용자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MATCHED_USER", referencedColumnName = "USER_ID", nullable = false)
    @JsonBackReference
    private Users communityMatchedUser;

    @Column(name="EMOTION_COMMON", length=255)
    private String emotionCommon;

    @Column(name="CREATED_AT", nullable=false)
    private LocalDateTime createdAt;
}
