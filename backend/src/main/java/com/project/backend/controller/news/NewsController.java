package com.project.backend.controller.news;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.backend.dto.diaries.DiaryNewsDto;
import com.project.backend.service.news.NewsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {
    private final NewsService newsService;

    @GetMapping("/latest")
    public ResponseEntity<DiaryNewsDto> getLatestNews() {
        return newsService.getLatestNewsDiary()
                .map(dto -> ResponseEntity.ok(dto))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/test")
    public String getNewsHello(){
        return "news Hello!!";
    }

    @PostMapping("/todaynews")
    public ResponseEntity<DiaryNewsDto> createDiaryFromNews() {
        String fixedAIUserId = "newsAi";

        Optional<DiaryNewsDto> savedDiaryOptional = newsService.createTodayDiaryNews(fixedAIUserId);

        return savedDiaryOptional
                .map(diary -> {
                    return new ResponseEntity<>(diary, HttpStatus.CREATED);
                })
                .orElseGet(() -> {
                    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                });
    }

    @GetMapping("/getnews/{diaryId}")
    public ResponseEntity<DiaryNewsDto> getDiaryById(@PathVariable Integer diaryId) {
        return newsService.getDiaryNews(diaryId)
            .map(diaryDto -> ResponseEntity.ok(diaryDto))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
}
