package com.project.backend.dto.comments;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GuestbooksCommentCreateRequestDto {
    private Integer contentId; // gust_book_ID 테이블에 존재하고 있어야됨
    private String content; // 댓글의 내용
    private String userId; // 댓글 작성한 USER_ID
}
