package com.project.backend.service.diaries;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.backend.dto.diaries.FriendDiaryDto;
import com.project.backend.model.Diaries;
import com.project.backend.repository.FriendDiariesRepository;

@Service
public class DiaryService {

    private final FriendDiariesRepository friendDiariesRepository;

    @Autowired
    public DiaryService(FriendDiariesRepository friendDiariesRepository) {
        this.friendDiariesRepository = friendDiariesRepository;
    }

    /**
     * userId로 친구의 다이어리 목록을 가져옵니다.
     * @param userId 친구의 ID.
     * @return 해당 친구의 다이어리 목록.
     */
    public List<FriendDiaryDto> getFriendDiaries(String userId) {
        List<Diaries> diaries = friendDiariesRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);

        return diaries.stream()
                .map(diary -> FriendDiaryDto.builder()
                        .diaryId(diary.getDiaryId())
                        .retroText(diary.getRetroText())
                        .createdAt(diary.getCreatedAt())
                        .emotionLabel(diary.getEmotionLabel())
                        .build())
                .collect(Collectors.toList());
    }
}