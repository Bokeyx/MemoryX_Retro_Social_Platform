package com.project.backend.controller.comments;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.backend.dto.comments.DiariesCommentDto;
import com.project.backend.dto.comments.DiaryCommentCreateRequestDto;
import com.project.backend.service.comments.CommentsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comment")
@RequiredArgsConstructor
public class CommentsController {
    private final CommentsService commentsService;

    @PostMapping("/diary/create")
    public ResponseEntity<DiariesCommentDto> createComment(
        @RequestBody DiaryCommentCreateRequestDto requestDto){
            String userId = requestDto.getUserId();
            DiariesCommentDto createdComment = commentsService.createComment(requestDto, userId);

            return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
        }

    @GetMapping("/diary/{diaryId}")
    public ResponseEntity<List<DiariesCommentDto>> getDiaryComments(@PathVariable Integer diaryId){
        List<DiariesCommentDto> diariesComments = commentsService.getDiaryComments(diaryId);
        return ResponseEntity.ok(diariesComments);
    }

    @DeleteMapping("/diary/delete/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Integer commentId,
            @RequestBody Map<String, String> payload) {
        
        String userId = payload.get("userId");
                commentsService.deleteComment(commentId, userId);
            return ResponseEntity.noContent().build();
        }
}
