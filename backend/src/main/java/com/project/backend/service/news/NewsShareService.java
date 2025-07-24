package com.project.backend.service.news;

import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.project.backend.dto.diaries.DiaryNewsShareDto;
import com.project.backend.model.Diaries;
import com.project.backend.repository.DiariesRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NewsShareService {
    private final DiariesRepository diariesRepository;

    public DiaryNewsShareDto getShareNews(Integer diaryId){
        Diaries diary = diariesRepository.findById(diaryId)
            .orElseThrow(() -> new EntityNotFoundException("해당 다이어리를 찾을 수 없습니다. id=" + diaryId));
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");
        
        return DiaryNewsShareDto.builder()
            .diaryId(diary.getDiaryId())
            .originalText(diary.getOriginalText())
            .retroText(diary.getRetroText())
            .createdAt(diary.getCreatedAt().format(formatter))
            .build();
    }
}
