package com.project.backend.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.ColumnDefault;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name="USERS")
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"diaries", "friendUser", "friendMatchedUser", "masterUser", "writedUser", "commentUser", "communityMatchUser", "communityMatchedUser", "receivedNotifications", "sentNotifications" })
@Builder
@Getter
@Setter
public class Users {

    @Id
    @Column(name="USER_ID", length = 20)
    private String userId;

    @Column(name="PASSWORD", length = 100, nullable = false)
    private String password;

    @Column(name="NAME", length = 50, nullable = false)
    private String name;

    @Column(name="BIRTH")
    private LocalDate birth;

    @Column(name="PHONE", length = 20)
    private String phone;

    @Column(name="EMAIL", length = 50, nullable = false)
    private String email;

    @Column(name="SEX", columnDefinition = "CHAR(1)", nullable = false)
    private String sex;

    @Column(name="AUTH_PROVIDER", length = 50)
    private String authProvider;

    @Column(name="BLOOD_TYPE", length = 2)
    private String bloodType;

    @Lob
    @Column(name="INTRODUCTION", columnDefinition = "LONGTEXT")
    private String introduction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MYSONG", referencedColumnName = "SONG_ID")
    @JsonBackReference
    private Songs mysong;

    @Column(name="PROFILE_IMAGE")
    private String profileImage;

    @Column(name="VISITED", nullable = false)
    @ColumnDefault("0")
    private Integer visited;

    @Column(name = "TOTAL_VISIT_COUNT")
    @ColumnDefault("0")
    private Integer totalVisitCount;

    @Column(name = "LAST_VISIT_DATE")
    private LocalDateTime lastVisitDate;

    @Column(name="REPORT_CNT", nullable = false)
    private Integer reportCnt;

    @Column(name="USER_STATUS", length = 20, nullable = false)
    private String userStatus;

    @Column(name="CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy="user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Diaries> diaries = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "friendUser", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Friends> friendUser = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "friendMatchedUser", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Friends> friendMatchedUser = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "masterUser", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Guestbook> masterUser = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "writedUser", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Guestbook> writedUser = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "commentUser", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Comments> commentUser = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "communityMatchUser", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<CommunityMatches> communityMatchUser = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "communityMatchedUser", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<CommunityMatches> communityMatchedUser = new ArrayList<>();

     // --- Notifications 관련 매핑 수정 ---

    @OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL, orphanRemoval = true)
    // @JsonManagedReference("received-notifications") // 필요하다면 추가
    @Builder.Default // 빌더 사용 시 기본값 설정
    private List<Notifications> receivedNotifications = new ArrayList<>(); // 이 사용자가 받은 알림들

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    // @JsonManagedReference("sent-notifications") // 필요하다면 추가
    @Builder.Default // 빌더 사용 시 기본값 설정
    private List<Notifications> sentNotifications = new ArrayList<>(); // 이 사용자가 보낸 알림들

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (userStatus == null) {
            userStatus = "ACTIVE";
        }
        if (reportCnt == null) {
            reportCnt = 0;
        }
        if (totalVisitCount == null) {
            totalVisitCount = 0;
        }
        if (visited == null) {
            visited = 0;
        }
    }

    public void incrementTodayCount() {
        this.visited = (this.visited == null ? 1 : this.visited + 1);
    }

    public void resetTodayCount() {
        this.visited = 0;
    }

    public void incrementTotalVisitCount() {
        this.totalVisitCount = (this.totalVisitCount == null ? 1 : this.totalVisitCount + 1);
    }

    public void updateLastVisitDate() {
        this.lastVisitDate = LocalDateTime.now();
    }

    public Integer getTodayCount() {
        return this.visited;
    }

    public void setTodayCount(Integer todayCount) {
        this.visited = todayCount;
    }
}
