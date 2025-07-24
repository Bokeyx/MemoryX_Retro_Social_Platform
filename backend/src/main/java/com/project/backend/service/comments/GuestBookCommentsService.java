package com.project.backend.service.comments;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;
import org.springframework.security.access.AccessDeniedException; // AccessDeniedException 임포트 추가

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend.dto.comments.GuestbooksCommentDto; 
import com.project.backend.dto.comments.GuestbooksCommentCreateRequestDto; // 👈 이 DTO를 createComment에서 사용
import com.project.backend.model.Comments; 

import com.project.backend.model.Guestbook; 
import com.project.backend.model.Users; 
import com.project.backend.repository.CommentsRepository; 

import com.project.backend.repository.GuestbookRepository; 
import com.project.backend.repository.UsersRepository; 

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GuestBookCommentsService { 

    private final CommentsRepository commentsRepository; 
    private final GuestbookRepository guestbookRepository;
    private final UsersRepository usersRepository;
    
    // 특정 일촌평에 달린 댓글 목록 조회
    @Transactional(readOnly = true) 
    public List<GuestbooksCommentDto> getCommentsForGuestbook(Integer guestbookId) {
        // 일촌평 ID로 Guestbook 엔티티를 찾습니다. (유효성 검사 및 필요시 정보 추출)
        guestbookRepository.findById(guestbookId) 
                .orElseThrow(() -> new IllegalArgumentException("일촌평을 찾을 수 없습니다. guestbookId: " + guestbookId));

        // CommentsRepository에 정의된 findByContentIdWithUser를 사용하여 댓글을 조회합니다.
        // 이 메서드는 contentType으로 필터링하지 않으므로, 조회 후 필터링합니다.
        List<Comments> comments = commentsRepository.findByContentIdWithUser(guestbookId); 

        // 'GUEST_BOOK' 타입의 댓글만 필터링하고 DTO로 변환합니다.
        return comments.stream()
                .filter(comment -> "GUEST_BOOK".equals(comment.getContentType())) 
                .map(GuestbooksCommentDto::fromEntity) 
                .collect(Collectors.toList());
    }

    // 새로운 댓글 작성
    @Transactional
    public GuestbooksCommentDto createComment(GuestbooksCommentCreateRequestDto requestDto) { // 👈 파라미터 DTO 타입 변경
        // requestDto의 contentId로 Guestbook 엔티티를 찾습니다. (유효성 검사용)
        Guestbook guestbook = guestbookRepository.findById(requestDto.getContentId()) // 👈 guestbookRepository 사용
                .orElseThrow(() -> new IllegalArgumentException("일촌평을 찾을 수 없습니다. guestbookId: " + requestDto.getContentId()));
        
        // requestDto의 userId로 댓글 작성자(User) 엔티티를 찾습니다.
        Users user = usersRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("댓글 작성자(User)를 찾을 수 없습니다. userId: " + requestDto.getUserId()));

        // Comments 엔티티를 빌더 패턴을 사용하여 생성합니다.
        Comments comment = Comments.builder()
                .contentId(requestDto.getContentId()) 
                .contentType("GUEST_BOOK") // 👈 contentType을 "GUEST_BOOK"으로 설정
                .commentUser(user) 
                .content(requestDto.getContent()) 
                .createdAt(LocalDateTime.now()) 
                .build();

        // 생성된 댓글 엔티티를 저장합니다.
        Comments savedComment = commentsRepository.save(comment); 
        // 저장된 엔티티를 GuestbooksCommentDto로 변환하여 반환합니다.
        return GuestbooksCommentDto.fromEntity(savedComment); 
    }

    // 댓글 삭제 (권한 확인 로직 제거)
    @Transactional
    public boolean deleteComment(Integer commentId) { 
        // 댓글 ID로 댓글 엔티티의 존재 여부를 확인합니다.
        Optional<Comments> commentOptional = commentsRepository.findById(commentId); 
        if (commentOptional.isPresent()) {
            // 댓글이 존재하면 삭제합니다.
            commentsRepository.deleteById(commentId); 
            // 삭제 후 다시 조회하여 실제로 삭제되었는지 확인합니다.
            return !commentsRepository.existsById(commentId); 
        } else {
            // 댓글을 찾을 수 없을 때 콘솔에 메시지를 출력합니다.
            System.out.println("댓글을 찾을 수 없습니다. commentId: " + commentId); 
            return false;
        }
    }
}
