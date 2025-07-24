package com.project.backend.dto.comments;

import java.time.format.DateTimeFormatter;

import com.project.backend.model.Comments; // Comments 모델 임포트
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GuestbooksCommentDto {
    private Integer commentId; // 댓글의 ID
    
    @Builder.Default
    private String contentType = "Guest_Book"; // 일촌평에 달릴 댓글
    private Integer contentId; // Guest_Book_ID
    private String commentUser; // 댓글을 작성한 USER_ID
    private String content; // 댓글 내용
    private String createdAt; // 댓글 작성일자

    private String userName; // 댓글작성한 사람의 이름
    private String userProfileImage; // 댓글 작성한 사람의 프로필사진

    // Comments 엔티티를 DTO로 변환하는 정적 팩토리 메서드
    // Comments 엔티티의 필드명과 GuestbooksCommentDto의 필드명을 매핑
    public static GuestbooksCommentDto fromEntity(Comments comment) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");
        return GuestbooksCommentDto.builder() // 빌더 이름 변경
                .commentId(comment.getCommentId())
                .contentType("Guest_Book") // 항상 "Guest_Book"으로 설정
                .contentId(comment.getContentId()) // 👈 Comments 엔티티의 contentId 필드 사용
                .commentUser(comment.getCommentUser().getUserId()) // Comments 엔티티의 User 관계에서 ID 가져오기
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt().format(formatter))
                .userName(comment.getCommentUser().getName()) // Comments 엔티티의 User 관계에서 이름 가져오기
                .userProfileImage(comment.getCommentUser().getProfileImage()) // Comments 엔티티의 User 관계에서 프로필 이미지 가져오기
                .build();
    }
}
