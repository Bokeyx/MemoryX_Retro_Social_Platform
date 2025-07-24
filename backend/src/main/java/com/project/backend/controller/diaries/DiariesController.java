package com.project.backend.controller.diaries;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.backend.dto.diaries.DiaryDto;
import com.project.backend.service.diaries.DiariesService;

import com.project.backend.model.Diaries; // 추가
import com.project.backend.repository.DiariesRepository; // 추가

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
public class DiariesController {

    private final DiariesService diariesService;
    private final DiariesRepository diariesRepository; // 추가
    
    /**
     * 특정 사용자의 다이어리 목록 조회
     * GET /api/diary/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DiaryDto>> getUserDiaries(@PathVariable String userId) {
        List<DiaryDto> diaries = diariesService.getUserDairies(userId);
        return ResponseEntity.ok(diaries);
    }

    /**
     * 친구 포함 홈 피드 다이어리 목록 조회
     * GET /api/diary/feed/{userId}
     */
    @GetMapping("/feed/{userId}")
    public ResponseEntity<List<DiaryDto>> getFeedDiaries(@PathVariable String userId){
        List<DiaryDto> homeFeedDiaries = diariesService.getFeedDiaries(userId);
        return ResponseEntity.ok(homeFeedDiaries);
    }

    /**
     * 다이어리 생성
     * POST /api/diary
     */
    @PostMapping
    public ResponseEntity<DiaryDto> createDiary(@RequestBody DiaryDto diaryDto) {
        DiaryDto createdDiary = diariesService.createDiary(diaryDto);
        return ResponseEntity.status(201).body(createdDiary); // HTTP 201 Created
    }

    /*
     * 마이 페이지 일기 삭제하기
     * DELETE /api/diary/delete/{diaryId}
     * 성공시 HTTP 204 No Content 반환(삭제 성공시 본문이 없을것임)
     */
    @DeleteMapping("/delete/{diaryId}") // DELETE 메서드와 diaryId를 PathVariable로 받음
    public ResponseEntity<Void> deleteDiary(@PathVariable Integer diaryId) {
        // 서비스 계층에서 삭제 로직 호출
        boolean isDeleted = diariesService.deleteDiary(diaryId);

        if (isDeleted) {
            return ResponseEntity.noContent().build(); //204 No Content (성공적으로 삭제되었지만 응답 본문 없음)
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found (삭제할 일기를 찾을 수 없음)
        }
    }

    // 게시글 좋아요
    @PostMapping("/like/{diaryId}")
    public ResponseEntity<Map<String, Integer>> toggleDiaryLike(
        @PathVariable Integer diaryId,
        @RequestBody Map<String, String> payload){
            String userId = payload.get("userId");

            diariesService.toggleLike(diaryId, userId);
            Diaries updatedDiary = diariesRepository.findById(diaryId)
                .orElseThrow(() -> new IllegalArgumentException("게시글 X"));

            return ResponseEntity.ok(Map.of("likeCnt", updatedDiary.getLikeCnt()));
        }

    // 게시글 좋아요 상태 확인
    @GetMapping("/like/status/{diaryId}/{userId}")
    public ResponseEntity<Map<String, Object>> getDiaryLikeStatus(
        @PathVariable Integer diaryId,
        @PathVariable String userId) {
        boolean isLiked = diariesService.isLiked(diaryId, userId);
        Diaries diary = diariesRepository.findById(diaryId)
            .orElseThrow(() -> new IllegalArgumentException("게시글 X"));
        return ResponseEntity.ok(Map.of("isLiked", isLiked, "likeCnt", diary.getLikeCnt()));
    }
}
