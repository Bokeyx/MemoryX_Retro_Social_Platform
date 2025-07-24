package com.project.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "NOTIFICATIONS")
public class Notifications {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NOTI_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RECIPIENT_ID", nullable = false)
    @JsonBackReference("received-notifications")
    private Users recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SENDER_ID")
    @JsonBackReference("sent-notifications")
    private Users sender;

    @Column(name = "NOTIFICATION_TYPE", nullable = false)
    private String type;

    @Column(name = "MESSAGE", nullable = false)
    private String message;

    @Column(name = "IS_READ", nullable = false)
    @Builder.Default
    private String isRead = "N";

    @Column(name = "RELATED_URL")
    private String relatedUrl;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}