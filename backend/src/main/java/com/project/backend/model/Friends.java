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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name="FRIENDS") // 대문자 테이블명
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString(exclude = {"friendUser", "friendMatchedUser"}) // 순환 참조 방지
@Builder
public class Friends {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT
    @Column(name="FRIENDS_ID")
    private Integer friendsId;

    @Column(name = "STATUS", nullable = false)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY) // Users 엔티티에서 EAGER 로딩하므로 여기는 LAZY 유지
    @JoinColumn(name = "FRIEND_USER", referencedColumnName = "USER_ID", nullable = false)
    @JsonBackReference
    private Users friendUser;

    @ManyToOne(fetch = FetchType.LAZY) // Users 엔티티에서 EAGER 로딩하므로 여기는 LAZY 유지
    @JoinColumn(name = "MATCHED_USER", referencedColumnName = "USER_ID", nullable = false)
    @JsonBackReference
    private Users friendMatchedUser;

    @Column(name="EMOTION_COMMON", length = 255)
    private String emotionCommon;

    @Column(name="CREATED_AT", nullable = false)
    private LocalDateTime createdAt;
}