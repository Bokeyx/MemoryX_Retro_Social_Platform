package com.project.backend.controller.comments;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody; // 👈 올바른 RequestBody 임포트

import com.project.backend.dto.comments.GuestbooksCommentDto;
import com.project.backend.dto.comments.GuestbooksCommentCreateRequestDto; // 👈 GuestbooksCommentCreateRequestDto 임포트
import com.project.backend.service.comments.GuestBookCommentsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class GuestbookCommentController { // 클래스 이름은 GuestbookCommentController로 유지

    private final GuestBookCommentsService guestBookCommentsService; // GuestBookCommentsService 주입

    /**
     * 특정 일촌평에 달린 댓글 목록 조회
     * GET /api/comments/guestbook/{guestbookId}
     */
    @GetMapping("/guestbook/{guestbookId}")
    public ResponseEntity<List<GuestbooksCommentDto>> getCommentsByGuestBookId(@PathVariable Integer guestbookId) {
        List<GuestbooksCommentDto> comments = guestBookCommentsService.getCommentsForGuestbook(guestbookId);
        return ResponseEntity.ok(comments);
    }

    /**
     * 새로운 댓글 작성 (일촌평 댓글용으로 변경)
     * POST /api/comments
     */
    @PostMapping
    public ResponseEntity<GuestbooksCommentDto> createComment(@RequestBody GuestbooksCommentCreateRequestDto requestDto) { // 👈 DTO 타입 변경
        GuestbooksCommentDto createdComment = guestBookCommentsService.createComment(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment); // 201 Created
    }

    /**
     * 댓글 삭제 (권한 확인 로직 제거)
     * DELETE /api/comments/{commentId}
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer commentId) { // 👈 Principal 파라미터 제거
        // 권한 확인 로직 제거
        // try-catch 블록도 제거하고 서비스의 반환 값만 처리합니다.
        boolean isDeleted = guestBookCommentsService.deleteComment(commentId); 
        if (isDeleted) {
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found (댓글을 찾을 수 없음)
        }
    }
}
