package com.project.backend.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue; // GeneratedValue 임포트
import jakarta.persistence.GenerationType; // GenerationType 임포트
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob; // Lob 임포트
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor; // Table 임포트
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name="DIARIES") // 대문자 테이블명
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString(exclude = {"user"}) // 순환 참조 방지
@Builder
public class Diaries {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT
    @Column(name="DIARY_ID")
    private Integer diaryId;

    // ManyToOne : N:1의 관계를 의미함(자식(Cart) : 부모(Member))
    // - FetchType.LAZY : 연관된 모델(엔티티)를 즉시 로딩(실행)하지 않고,
    //                  : 실제로 조인을 사용하는 시점에 로딩(실행)할 수 있도록 설정
    // - FetchType.EAGER : 연관된 모델(엔티티)를 서버 실행 시점에 즉시 로딩(실행) 한다는 의미
    //                   : 미리 연관된 모델(엔티티)들을 실행해 놓는 것을 의미함
    @ManyToOne(fetch = FetchType.LAZY) // User 엔티티에서 EAGER 로딩하므로 여기는 LAZY 유지
    // name : 현재 모델(엔티티), 즉 자식 테이블의 FK 컬럼명
    // referencedColumnName : 부모 테이블의 PK 컬럼명 강의
    @JoinColumn(name = "DIARY_USER", referencedColumnName = "USER_ID", nullable = false) // <--- name, referencedColumnName 대문자
    @JsonBackReference
    private Users user; // Users 엔티티의 "user" 필드와 mappedBy 일치

    @Lob
    @Column(name="ORIGINAL_TEXT", columnDefinition = "LONGTEXT", nullable = false)
    private String originalText;

    @Lob
    @Column(name="RETRO_TEXT", columnDefinition = "LONGTEXT", nullable = false)
    private String retroText;

    @Column(name="LIKE_CNT", nullable = false)
    @Builder.Default // ✅ 이 줄 추가
    private Integer likeCnt = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RECO_SONG", referencedColumnName = "SONG_ID")
    @JsonBackReference
    private Songs recoSong;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RECO_CONTENT", referencedColumnName = "CONTENT_ID")
    @JsonBackReference
    private Contents recoContent;

    @Column(name="EMOTION_LABEL", length = 20)
    private String emotionLabel;

    @Column(name="PUBLIC_SCOPE", columnDefinition = "CHAR(1)", nullable = false)
    private String publicScope;

    @Column(name="CREATED_AT", nullable = false)
    private LocalDateTime createdAt;
}