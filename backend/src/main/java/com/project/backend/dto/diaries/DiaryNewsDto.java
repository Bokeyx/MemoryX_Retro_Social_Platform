package com.project.backend.dto.diaries;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class DiaryNewsDto {
    private final Integer diaryId;
    private final String diaryUser;
    private final String originalText;
    private final String retroText;
    private final String createdAt;
    private final String likeCnt;
}
