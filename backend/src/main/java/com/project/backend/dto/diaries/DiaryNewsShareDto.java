package com.project.backend.dto.diaries;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DiaryNewsShareDto {
    private Integer diaryId;
    private String originalText;
    private String retroText;
    private String createdAt;
}
