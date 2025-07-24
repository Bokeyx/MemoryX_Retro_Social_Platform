package com.project.backend.controller.users.wonUnknownFriendcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired; // 올바른 import 확인
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.backend.dto.diaries.FriendDiaryDto;
import com.project.backend.service.diaries.DiaryService;

@RestController
@RequestMapping("/api/diaries") // /api/diaries 아래로 통합
public class DiaryController {

    @Autowired
    private DiaryService diaryService;

    /**
     * 특정 친구의 일기를 가져오는 엔드포인트입니다.
     * FriendDiaryDto 목록을 반환합니다.
     */
    @GetMapping("/friend/{userId}") // 친구의 일기를 위한 새 엔드포인트
    public ResponseEntity<List<FriendDiaryDto>> getFriendDiaries(@PathVariable String userId) {
        List<FriendDiaryDto> diaries = diaryService.getFriendDiaries(userId);
        if (diaries.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        }
        return new ResponseEntity<>(diaries, HttpStatus.OK); // 200 OK
    }
}