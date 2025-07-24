package com.project.backend.dto.comments;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class DiariesCommentDto {
    private Integer commentId;
    
    @Builder.Default
    private String contentType = "Diary";;
    private Integer contentId;
    private String commentUser;
    private String content;
    private String createdAt;

    private String userName;
    private String userProfileImage;
}
