package com.project.backend.dto.guestbooks;

import com.project.backend.model.Guestbook;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestbookCreateRequestDto {
    private String masterUserId; // 일촌평을 주인의 ID
    private String writerId; // 일촌평을 작성하는 사용자의 ID
    private String content; // 일촌평 내용

}
