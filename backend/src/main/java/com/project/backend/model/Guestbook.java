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
@Table(name="GUEST_BOOK") // 일촌평 테이블
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@ToString(exclude = {"masterUser", "writedUser"}) // 순환 참조 방지
public class Guestbook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="GB_ID")
    private Integer guestBookId;

    // 방명록 주인 유저
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "GB_USER", referencedColumnName = "USER_ID", nullable = false)
    @JsonBackReference
    private Users masterUser;

    // 방명록 작성 유저
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WRITER_ID", referencedColumnName = "USER_ID", nullable = false)
    @JsonBackReference
    private Users writedUser;

    @Column(name="CONTENT", length=255, nullable=false)
    private String content;

    @Column(name="CREATED_AT", nullable=false)
    private LocalDateTime createdAt;
}
