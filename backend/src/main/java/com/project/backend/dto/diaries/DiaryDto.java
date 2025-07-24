package com.project.backend.dto.diaries;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@AllArgsConstructor
@Getter
@Setter
@Builder
public class DiaryDto {
    private Integer diaryId;
    private String diaryUser;
    private String originalText;
    private String retroText;
    private String emotionLabel;
    private Integer recoSong;
    private Integer recoContent;
    private String createdAt;
    private Integer likeCnt;
    private String recoSongTitle;
    private String recoContentTitle;

    // 각 게시글 별 유저 정보
    private String userName;
    private String userSex;
    private String userProfileImage;
}
