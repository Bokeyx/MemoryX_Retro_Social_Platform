package com.project.backend.service.diaries;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend.dto.diaries.DiaryDto;
import com.project.backend.model.Contents;
import com.project.backend.model.Diaries;
import com.project.backend.model.Likes;
import com.project.backend.model.Songs;
import com.project.backend.model.Users;
import com.project.backend.repository.ContentsRepository;
import com.project.backend.repository.DiariesRepository;
import com.project.backend.repository.FriendsRepository;
import com.project.backend.repository.LikesRepository;
import com.project.backend.repository.SongsRepository;
import com.project.backend.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiariesService {
    private final DiariesRepository diariesRepository;
    private final UsersRepository usersRepository;
    private final FriendsRepository friendsRepository;
    private final SongsRepository songsRepository;
    private final ContentsRepository contentsRepository;
    private final LikesRepository likesRepository;

    @Transactional(readOnly = true)
    public List<DiaryDto> getUserDairies(String userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("userID 없음"));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");

        return diariesRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(diary -> {
                    String songTitle = Optional.ofNullable(diary.getRecoSong())
                                               .map(Songs::getTitle)
                                               .orElse(null);
                    String contentTitle = Optional.ofNullable(diary.getRecoContent())
                                                  .map(Contents::getTitle)
                                                  .orElse(null);

                    return DiaryDto.builder()
                            .diaryId(diary.getDiaryId())
                            .diaryUser(userId)
                            .retroText(diary.getRetroText())
                            .createdAt(diary.getCreatedAt().format(formatter))
                            .emotionLabel(diary.getEmotionLabel()) // emotionLabel 추가
                            .userName(diary.getUser().getName()) // userName 추가
                            .recoSongTitle(songTitle)
                            .recoContentTitle(contentTitle)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DiaryDto> getFeedDiaries(String userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("userID 없음"));

        List<String> friendIds = Stream.concat(
                friendsRepository.findByFriendUserAndStatus(user, "ACCEPTED").stream()
                        .map(friend -> friend.getFriendMatchedUser().getUserId()),
                friendsRepository.findByFriendMatchedUserAndStatus(user, "ACCEPTED").stream()
                        .map(friend -> friend.getFriendUser().getUserId())
        ).distinct().collect(Collectors.toList());

        List<String> allUserIds = new ArrayList<>(friendIds);
        allUserIds.add(userId);

        List<Users> usersToFetch = usersRepository.findAllById(allUserIds);

        List<Diaries> allDiaries = diariesRepository.findByUserInOrderByCreatedAtDesc(usersToFetch);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");
        return allDiaries.stream()
                .map(diary -> {
                Users diaryAuthor = diary.getUser();
                String songTitle = Optional.ofNullable(diary.getRecoSong())
                                           .map(Songs::getTitle)
                                           .orElse(null);
                String contentTitle = Optional.ofNullable(diary.getRecoContent())
                                              .map(Contents::getTitle)
                                              .orElse(null);

                return DiaryDto.builder()
                        .diaryId(diary.getDiaryId())
                        .diaryUser(diaryAuthor.getUserId()) // 작성자 ID
                        .retroText(diary.getRetroText())
                        .createdAt(diary.getCreatedAt().format(formatter))
                        .likeCnt(diary.getLikeCnt())
                        .emotionLabel(diary.getEmotionLabel()) // emotionLabel 추가
                        .userName(diaryAuthor.getName())
                        .userSex(diaryAuthor.getSex())
                        .userProfileImage(diaryAuthor.getProfileImage())
                        .recoSongTitle(songTitle)
                        .recoContentTitle(contentTitle)
                        .build();
            })
            .collect(Collectors.toUnmodifiableList());
    }

    @Transactional
    public DiaryDto createDiary(DiaryDto diaryDto) {
        Users user = usersRepository.findById(diaryDto.getDiaryUser())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + diaryDto.getDiaryUser()));

        Diaries diary = new Diaries();
        diary.setUser(user);
        System.out.println("Original Text from DTO: " + diaryDto.getOriginalText());
        diary.setOriginalText(diaryDto.getOriginalText());
        diary.setRetroText(diaryDto.getRetroText());
        diary.setEmotionLabel(diaryDto.getEmotionLabel());

        if (diaryDto.getRecoSong() != null) {
            Songs song = songsRepository.findById(diaryDto.getRecoSong()).orElse(null);
            diary.setRecoSong(song);
        }

        if (diaryDto.getRecoContent() != null) {
            Contents content = contentsRepository.findById(diaryDto.getRecoContent()).orElse(null);
            diary.setRecoContent(content);
        }

        diary.setPublicScope("Y");
        diary.setCreatedAt(LocalDateTime.now());

        Diaries savedDiary = diariesRepository.save(diary);

        String songTitle = Optional.ofNullable(savedDiary.getRecoSong())
                                   .map(Songs::getTitle)
                                   .orElse(null);
        String contentTitle = Optional.ofNullable(savedDiary.getRecoContent())
                                      .map(Contents::getTitle)
                                      .orElse(null);

        return DiaryDto.builder()
                .diaryId(savedDiary.getDiaryId())
                .diaryUser(savedDiary.getUser().getUserId())
                .retroText(savedDiary.getRetroText())
                .createdAt(savedDiary.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")))
                .recoSong(savedDiary.getRecoSong() != null ? savedDiary.getRecoSong().getSongId() : null)
                .recoContent(savedDiary.getRecoContent() != null ? savedDiary.getRecoContent().getContentId() : null)
                .recoSongTitle(songTitle)
                .recoContentTitle(contentTitle)
                .build();
    }

    @Transactional // 트랜잭션 처리를 위해 추가
    public boolean deleteDiary(Integer diaryId){
        //해당 diaryId를 가진 일기가 존재하는지 확인
    Optional<Diaries> diaryOptional = diariesRepository.findById(diaryId);

    if (diaryOptional.isPresent()) {
        // 일기가 존재한다면 삭제
        diariesRepository.deleteById(diaryId);

        //삭제 후 다시 조회하여 실제로 삭제되었는지 확인
        return !diariesRepository.existsById(diaryId);
    } else {

        // 일기를 찾을 수 없을 때
        System.out.println("일기를 찾을 수 없습니다. diaryId: " + diaryId);
        return false;
        }
    }

    @Transactional
    public void toggleLike(Integer diaryId, String userId){
        Diaries diary = diariesRepository.findById(diaryId)
            .orElseThrow(() -> new IllegalArgumentException("게시글 X"));
        
        Users user = usersRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자 xxxx"));

        // 좋아요 중복 확인
        Optional<Likes> existLike = likesRepository.findByUserAndContentTypeAndContentId(user, "DIARY", diaryId);

        if (existLike.isPresent()) {
            likesRepository.delete(existLike.get());
            diary.setLikeCnt(diary.getLikeCnt() -1);
        } else {
            Likes newLike = Likes.builder()
                .user(user)
                .contentType("DIARY")
                .contentId(diaryId)
                .build();
            likesRepository.save(newLike);
            diary.setLikeCnt(diary.getLikeCnt()+1);
        }
    }

    public boolean isLiked(Integer diaryId, String userId) {
        Users user = usersRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자 xxxx"));
        return likesRepository.findByUserAndContentTypeAndContentId(user, "DIARY", diaryId).isPresent();
    }
}