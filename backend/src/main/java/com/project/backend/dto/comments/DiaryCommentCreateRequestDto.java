package com.project.backend.dto.comments;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DiaryCommentCreateRequestDto {
    private Integer contentId;
    private String content;
    private String userId;
}
