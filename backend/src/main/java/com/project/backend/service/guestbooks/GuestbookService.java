package com.project.backend.service.guestbooks;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend.dto.guestbooks.GuestbookCreateRequestDto;
import com.project.backend.dto.guestbooks.GuestbookDto;
import com.project.backend.dto.comments.GuestbooksCommentDto; 
import com.project.backend.model.Comments; 
import com.project.backend.model.Guestbook;
import com.project.backend.model.Users;
import com.project.backend.repository.CommentsRepository; 
import com.project.backend.repository.GuestbookRepository;
import com.project.backend.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GuestbookService {
    private final GuestbookRepository guestbookRepository;
    private final UsersRepository usersRepository;
    private final CommentsRepository commentsRepository; 

    /**
     * 일촌평을 생성합니다.
     * @param requestDto 일촌평 생성 요청 DTO
     * @return 생성된 일촌평 DTO
     * @throws IllegalArgumentException 페이지 주인 또는 작성자를 찾을 수 없을 경우 발생
     */
    @Transactional
    public GuestbookDto createGuestbook(GuestbookCreateRequestDto requestDto) {
        Users masterUser = usersRepository.findById(requestDto.getMasterUserId())
                .orElseThrow(() -> new IllegalArgumentException("일촌평 페이지 주인을 찾을 수 없습니다. ID: " + requestDto.getMasterUserId()));

        Users writerUser = usersRepository.findById(requestDto.getWriterId())
                .orElseThrow(() -> new IllegalArgumentException("일촌평 작성자를 찾을 수 없습니다. ID: " + requestDto.getWriterId()));

        Guestbook newGuestbook = Guestbook.builder()
                .masterUser(masterUser)
                .writedUser(writerUser)
                .content(requestDto.getContent())
                .createdAt(LocalDateTime.now())
                .build();

        Guestbook savedGuestbook = guestbookRepository.save(newGuestbook);
        return GuestbookDto.fromEntity(savedGuestbook);
    }

    // 특정 사용자의 일촌평 목록조회
    @Transactional(readOnly = true) // 읽기전용 트랜잭션
    public List<GuestbookDto> getGuestbookEntriesForUser(String userId){

        //방명록 주인이 되는 Users 엔티티를 조회
        Users masterUser = usersRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("방명록 주인을 찾을 수 없습니다. userId: " + userId));

        // 해당 주인의 일촌평 목록을 최신순으로 조회
        List<Guestbook> guestbookEntries = guestbookRepository.findByMasterUserOrderByCreatedAtDesc(masterUser);

        // 엔티티 목록을 DTO 목록으로 변환하고 답글을 추가
        return guestbookEntries.stream()
                .map(guestbook -> {
                    GuestbookDto guestbookDto = GuestbookDto.fromEntity(guestbook);
                    // 해당 방명록에 대한 답글 조회
                    List<Comments> replies = commentsRepository.findByContentIdWithUser(guestbook.getGuestBookId())
                                            .stream()
                                            .filter(comment -> "GUEST_BOOK".equals(comment.getContentType())) 
                                            .collect(Collectors.toList());

                    // 답글을 DTO로 변환하여 GuestbookDto에 추가
                    List<GuestbooksCommentDto> replyDtos = replies.stream()
                                                            .map(GuestbooksCommentDto::fromEntity)
                                                            .collect(Collectors.toList());
                    guestbookDto.setReplies(replyDtos);
                    return guestbookDto;
                })
                .collect(Collectors.toList());
    }

    // 일촌평 삭제
    @Transactional
    public boolean deleteGuestbookEntry(Integer guestBookId) {
        Optional<Guestbook> guestbookOptional = guestbookRepository.findById(guestBookId); 
        if (guestbookOptional.isPresent()) {
            guestbookRepository.deleteById(guestBookId);
            return !guestbookRepository.existsById(guestBookId); 
        } else {
            System.out.println("일촌평을 찾을 수 없습니다. guestBookId: " + guestBookId);
            return false;
        }
    }
}
