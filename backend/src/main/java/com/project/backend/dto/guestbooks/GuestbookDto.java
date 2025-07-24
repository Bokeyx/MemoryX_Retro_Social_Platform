package com.project.backend.dto.guestbooks;

import java.time.format.DateTimeFormatter;
import java.util.List; 
import java.util.ArrayList; 
import com.project.backend.dto.comments.GuestbooksCommentDto; 
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.project.backend.model.Guestbook;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestbookDto {
    private Integer guestBookId; // 방명록의 고유 ID
    private String masterUserId; // 방명록 주인의 ID
    private String masterUserName; // 방명록 주인 이름
    private String writerId; // 작성자 ID
    private String writerName; // 작성자 이름
    private String content; // 일촌평 내용
    private String createdAt; // 작성일자 (포맷된 문자열)
    private String profileImage;
    @Builder.Default 
    private List<GuestbooksCommentDto> replies = new ArrayList<>(); // 답글 목록 추가

    // GuestBook 엔티티를 DTO로 변환하는 정적 팩토리 메서드
    public static GuestbookDto fromEntity(Guestbook guestbook){
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");
        return GuestbookDto.builder()
                .guestBookId(guestbook.getGuestBookId())
                .masterUserId(guestbook.getMasterUser().getUserId())
                .masterUserName(guestbook.getMasterUser().getName())
                .writerId(guestbook.getWritedUser().getUserId())
                .writerName(guestbook.getWritedUser().getName())
                .content(guestbook.getContent())
                .createdAt(guestbook.getCreatedAt().format(formatter))
                .profileImage(guestbook.getWritedUser().getProfileImage())
                .build();
    }
}
