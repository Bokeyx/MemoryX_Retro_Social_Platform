package com.project.backend.dto.diaries; // Changed package to diaries

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendDiaryDto {
    private Integer diaryId; // Original diaryId from Diaries entity
    private String retroText; // Corresponds to RETRO_TEXT
    private LocalDateTime createdAt; // Corresponds to CREATED_AT
    private String emotionLabel; // Corresponds to EMOTION_LABEL
}