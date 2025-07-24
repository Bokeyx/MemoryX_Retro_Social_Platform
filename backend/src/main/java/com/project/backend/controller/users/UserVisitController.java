package com.project.backend.controller.users;

import com.project.backend.dto.users.UserVisitDto;
import com.project.backend.service.users.UserVisitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/visits") // 방문자수 관련 API를 위한 새로운 경로
@RequiredArgsConstructor
public class UserVisitController {
    
    private final UserVisitService userVisitService;

    /**
     * 특정 페이지 주인의 Today 및 Total 방문자 수를 증가시키는 API
     * 방문자가 페이지 주인과 다를경우에만 증가
     * 
     * @param pageOwnerId 방문 페이지의 주인 ID
     * @param requestBody 방문자의 ID를 포함하는 맵 ({"visitorId": "actualVisitorId"})
     * @return 업데이트된 Today 및 Total 방문자 수를 담은 DTO (UserVisitCountDto)
     */

    // POST /api/visits/{pageOwnerId}
    @PostMapping("/{pageOwnerId}")
    public ResponseEntity<UserVisitDto> incrementTodayAndTotalCount(
            @PathVariable String pageOwnerId,
            @RequestBody Map<String, String> requestBody){
        String visitorId = requestBody.get("visitorId");
        if (visitorId == null || visitorId.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        UserVisitDto counts = userVisitService.incrementTodayAndTotalCount(pageOwnerId, visitorId);
        return ResponseEntity.ok(counts);
        }
        
    /**
     * 특정 유저의 Today 및 Total 방문자 수를 조회하는 API.
     * 조회 시점에 마지막 방문 날짜가 오늘이 아니면 Today 방문자 수는 0으로 간주합니다.
     *
     * @param userId 방문자 수를 조회할 사용자 ID
     * @return Today 및 Total 방문자 수를 담은 DTO (UserVisitCountDto)
     */
    @GetMapping("/{userId}") // GET /api/visits/{userId}
    public ResponseEntity<UserVisitDto> getTodayAndTotalCount(@PathVariable String userId) {
        UserVisitDto counts = userVisitService.getTodayAndTotalCount(userId);
        return ResponseEntity.ok(counts);
    }
}
