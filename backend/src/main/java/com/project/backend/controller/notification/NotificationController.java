package com.project.backend.controller.notification;

import com.project.backend.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/unread_count/{userId}")
    public ResponseEntity<Map<String, Long>> getUnreadNotificationCount(
            @PathVariable String userId,
            @RequestParam(required = false) String type) {
        long count;
        if (type != null && !type.isEmpty()) {
            count = notificationService.getUnreadNotificationCountByType(userId, type);
        } else {
            count = notificationService.getUnreadNotificationCount(userId);
        }
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PostMapping("/mark_all_as_read/{userId}")
    public ResponseEntity<Void> markAllAsRead(
            @PathVariable String userId,
            @RequestParam(required = false) String type) {
        notificationService.markAllAsRead(userId, type);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}