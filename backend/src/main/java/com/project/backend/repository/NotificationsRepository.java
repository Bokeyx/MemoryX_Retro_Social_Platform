package com.project.backend.repository;

import com.project.backend.model.Notifications;
import com.project.backend.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationsRepository extends JpaRepository<Notifications, Long> {
    List<Notifications> findByRecipientOrderByCreatedAtDesc(Users recipient);
    long countByRecipientAndIsRead(Users recipient, String isRead);
    long countByRecipientAndIsReadAndType(Users recipient, String isRead, String type);
    List<Notifications> findByRecipientAndIsReadAndType(Users recipient, String isRead, String type);
}