package com.project.backend.service.comments;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.project.backend.dto.comments.DiariesCommentDto;
import com.project.backend.dto.comments.DiaryCommentCreateRequestDto;
import com.project.backend.model.Comments;
import com.project.backend.model.Users;
import com.project.backend.repository.CommentsRepository;
import com.project.backend.repository.DiariesRepository;
import com.project.backend.repository.UsersRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentsService {

    private final CommentsRepository commentsRepository;
    private final DiariesRepository diariesRepository;
    private final UsersRepository usersRepository;

    // 댓글 생성
    @Transactional
    public DiariesCommentDto createComment(DiaryCommentCreateRequestDto requestsDto, String userId){
        Users user = usersRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없음 id=" + userId));
        
        diariesRepository.findById(requestsDto.getContentId())
            .orElseThrow(() -> new IllegalArgumentException("게시글(일기) 찾을 수 없음 id=" + requestsDto.getContentId()));

        Comments newComment = Comments.builder()
            .contentType("Diary")
            .contentId(requestsDto.getContentId())
            .commentUser(user)
            .content(requestsDto.getContent())
            .build();
        
        Comments savedComment = commentsRepository.save(newComment);

        return convertToDto(savedComment);
    }

    // 댓글 목록 가져오기
    public List<DiariesCommentDto> getDiaryComments(Integer contentId) {
        diariesRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글 없음. id=" + contentId));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");

        return commentsRepository.findByContentIdWithUser(contentId)
                .stream()
                .map(comment -> {
                    Users commentAuthor = comment.getCommentUser();
                    return DiariesCommentDto.builder()
                            .commentId(comment.getCommentId())
                            .contentId(contentId)
                            .commentUser(commentAuthor.getUserId())
                            .content(comment.getContent())
                            .createdAt(comment.getCreatedAt().format(formatter))
                            .userName(commentAuthor.getName())
                            .userProfileImage(commentAuthor.getProfileImage())
                            .build();
                })
                .collect(Collectors.toUnmodifiableList());
    }

    // 댓글 삭제
    @Transactional
    public void deleteComment(Integer commentId, String userId) throws AccessDeniedException {
        System.out.println("Deleting comment with ID: " + commentId + " by user ID: " + userId);

        Comments comment = commentsRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("해당 댓글을 찾을 수 없습니다. id=" + commentId));

        System.out.println("Comment author ID: " + comment.getCommentUser().getUserId());

        if (!comment.getCommentUser().getUserId().equals(userId)) {
            System.out.println("Access denied: User " + userId + " is not the author of comment " + commentId);
            throw new AccessDeniedException("댓글 삭제 권한 xxx");
        }

        commentsRepository.delete(comment);
        System.out.println("Comment " + commentId + " deleted successfully.");
    }

    // DTO 변환
    private DiariesCommentDto convertToDto(Comments comment) {
        if (comment.getCommentUser() == null) {
            return null; 
        }

        return DiariesCommentDto.builder()
                .commentId(comment.getCommentId())
                .contentType(comment.getContentType())
                .contentId(comment.getContentId())
                .commentUser(comment.getCommentUser().getUserId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")))
                .userName(comment.getCommentUser().getName())
                .userProfileImage(comment.getCommentUser().getProfileImage())
                .build();
    }
}
