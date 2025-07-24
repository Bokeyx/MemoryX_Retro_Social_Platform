package com.project.backend.service.users;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service; // LocalDate를 사용하므로 이 import는 유지
import org.springframework.transaction.annotation.Transactional; // LocalDateTime은 이제 사용하지 않으므로 삭제해도 됨 (아니면 주석 처리)

import com.project.backend.dto.users.UserVisitDto;
import com.project.backend.model.Users;
import com.project.backend.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserVisitService {
    private final UsersRepository usersRepository;

    /**
     * 특정 페이지 주인의 Today 및 방문자수를 증가시킴
     * 방문자가 현재 MyPage의 UserID가 아닐 경우에만 증가됨
     * 매일 자정 기준으로 Today는 초기화 됨
     *
     * @param pageOwnerID 방문 페이지의 주인 ID
     * @param visitorId 현재 방문자의 ID
     * @return 업데이트된 Today 및 Total 방문자 수를 담은 Map (todayCount, totalVisitCount)
     * @throws IllegalArgumentException 페이지 주인을 찾을 수 없을 경우 발생
     */

     @Transactional
     public UserVisitDto incrementTodayAndTotalCount(String pageOwnerID, String visitorId) {
         Users pageOwner = usersRepository.findById(pageOwnerID)
                                 .orElseThrow(() -> new IllegalArgumentException("페이지 주인을 찾을 수 없습니다. ID :" + pageOwnerID));

         // 페이지 주인과 방문자가 같으면 카운트 X
         if (pageOwnerID.equals(visitorId)){
             //Users 엔티티의 Visited 필드가 todayCount 역할을 하므로, 이를 todayCount로 매핑
             return UserVisitDto.fromEntity(pageOwner);
         }

         // ✅ 중복 방문 방지 로직 (최근 5초 이내 방문이면 카운트 증가 X)
         if (pageOwner.getLastVisitDate() != null) {
            Duration duration = Duration.between(pageOwner.getLastVisitDate(), LocalDateTime.now());
            if (duration.getSeconds() < 5) {
                return UserVisitDto.fromEntity(pageOwner);
            }
    }

         // ✅ 매일 자정 기준으로 visited(todayCount) 초기화
        // 날짜가 다르면 새로운 날로 간주하고 초기화
        if (pageOwner.getLastVisitDate() != null && !pageOwner.getLastVisitDate().toLocalDate().isEqual(LocalDate.now())) {
            pageOwner.resetTodayCount(); // visited = 0
        }

         pageOwner.incrementTodayCount(); // visited 필드 (todayCount) 증가
         pageOwner.incrementTotalVisitCount(); // totalVisitCount 증가
         pageOwner.updateLastVisitDate(); // 마지막 방문 날짜 업데이트
         usersRepository.save(pageOwner); // 변경사항 저장

         // 업데이트된 엔티티로부터 DTO 생성 및 반환
         return UserVisitDto.fromEntity(pageOwner);

     }

     /**
      * 특정 유저의 Today 및 Total 방문자 수를 조회합니다.
      * 조회 시점에 마지막 방문 날짜가 오늘이 아니면 Today 방문자 수는 0으로 간주
      *
      * @param userId 방문자 수를 조회할 사용자 ID
      * @return Today 및 Total 방문자 수를 담은 Map(todayCoutn, totalVisitCount)
      * @throws IllegalArgumentException 사용자를 찾을 수 없을 경우 발생
      */
      @Transactional(readOnly = true)
      public UserVisitDto getTodayAndTotalCount(String userId){
         Users user = usersRepository.findById(userId)
                 .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId));

        

      // ⭐ 그냥 현재 값을 그대로 보여준다. 리셋은 increment 메서드에서만 함
    return UserVisitDto.builder()
            .todayCount(user.getVisited() != null ? user.getVisited() : 0)
            .totalVisitCount(user.getTotalVisitCount() != null ? user.getTotalVisitCount() : 0)
            .build();
      }
}