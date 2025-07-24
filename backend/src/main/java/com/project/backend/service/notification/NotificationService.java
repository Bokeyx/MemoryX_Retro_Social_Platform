package com.project.backend.service.notification;

import com.project.backend.dto.notification.NotificationDto;
import com.project.backend.model.Notifications;
import com.project.backend.model.Users;
import com.project.backend.repository.NotificationsRepository;
import com.project.backend.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {
    private final NotificationsRepository notificationsRepository;
    private final UsersRepository usersRepository;

    public void createNotification(String recipientId, String senderId, String type, String message, String relatedUrl) {
        Users recipient = usersRepository.findById(recipientId).orElseThrow(() -> new IllegalArgumentException("Recipient not found"));
        Users sender = senderId != null ? usersRepository.findById(senderId).orElse(null) : null;

        Notifications notification = Notifications.builder()
                .recipient(recipient)
                .sender(sender)
                .type(type)
                .message(message)
                .relatedUrl(relatedUrl)
                .isRead("N") // isRead 필드를 String "N"으로 초기화
                .build();
        notificationsRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(String userId) {
        Users user = usersRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return notificationsRepository.findByRecipientOrderByCreatedAtDesc(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void markAsRead(Long notificationId) {
        Notifications notification = notificationsRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setIsRead("Y");
        notificationsRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public long getUnreadNotificationCount(String userId) {
        Users user = usersRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return notificationsRepository.countByRecipientAndIsRead(user, "N");
    }

    @Transactional(readOnly = true)
    public long getUnreadNotificationCountByType(String userId, String type) {
        Users user = usersRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return notificationsRepository.countByRecipientAndIsReadAndType(user, "N", type);
    }

    @Transactional // 이 메소드는 데이터를 변경하므로 readOnly = false (기본값)
    public void markAllAsRead(String userId, String type) {
        Users user = usersRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        List<Notifications> notificationsToMark = notificationsRepository.findByRecipientAndIsReadAndType(user, "N", type);
        notificationsToMark.forEach(notification -> notification.setIsRead("Y"));
        notificationsRepository.saveAll(notificationsToMark);
    }

    private NotificationDto convertToDto(Notifications notification) {
        Users sender = notification.getSender();
        return NotificationDto.builder()
                .id(notification.getId())
                .recipientId(notification.getRecipient().getUserId())
                .senderId(sender != null ? sender.getUserId() : null)
                .senderName(sender != null ? sender.getName() : "System")
                .senderProfileImage(sender != null ? sender.getProfileImage() : null)
                .type(notification.getType())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .relatedUrl(notification.getRelatedUrl())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
