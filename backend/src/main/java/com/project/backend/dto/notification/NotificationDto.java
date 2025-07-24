package com.project.backend.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String recipientId;
    private String senderId;
    private String senderName;
    private String senderProfileImage;
    private String type;
    private String message;
    private String isRead;
    private String relatedUrl;
    private LocalDateTime createdAt;
}
