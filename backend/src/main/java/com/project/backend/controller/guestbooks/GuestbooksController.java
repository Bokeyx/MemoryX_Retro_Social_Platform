package com.project.backend.controller.guestbooks;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import com.project.backend.dto.guestbooks.GuestbookCreateRequestDto;
import com.project.backend.dto.guestbooks.GuestbookDto;
import com.project.backend.service.guestbooks.GuestbookService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/guestbook") // 일촌평 API 기본 경로
@RequiredArgsConstructor
public class GuestbooksController {

    private final GuestbookService guestbookService;

    /**
     * 일촌평 생성 API.
     * POST /api/guestbook
     * @param requestDto 일촌평 생성 요청 DTO (masterUserId, writerId, content 포함)
     * @return 생성된 일촌평 정보 (GuestbookDto)
     */
    @PostMapping // POST /api/guestbook
    public ResponseEntity<GuestbookDto> createGuestbook(@RequestBody GuestbookCreateRequestDto requestDto) {
        GuestbookDto createdGuestbook = guestbookService.createGuestbook(requestDto);
        return new ResponseEntity<>(createdGuestbook, HttpStatus.CREATED); // 201 Created 응답
    }
    
    /**
     * 특정 사용자의 일촌평 목록 조회
     * GET /api/guestbook/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GuestbookDto>> getGuestbookForUser(@PathVariable String userId) {
        List<GuestbookDto> guestbookEntries = guestbookService.getGuestbookEntriesForUser(userId);
        return ResponseEntity.ok(guestbookEntries);
    }

    /**
     * 일촌평 삭제
     * DELETE /api/guestbook/{guestBookId}
     */
    @DeleteMapping("/{guestBookId}") // guestBookId를 PathVariable로 받음
    public ResponseEntity<Void> deleteGuestbook(@PathVariable Integer guestBookId) {
        boolean isDeleted = guestbookService.deleteGuestbookEntry(guestBookId);
        if (isDeleted) {
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found (삭제할 일촌평을 찾을 수 없음)
        }
    }

}
