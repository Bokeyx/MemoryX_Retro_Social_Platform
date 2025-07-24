package com.project.backend.dto.users;

import com.project.backend.model.Users;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UserVisitDto {
    private Integer todayCount; // 오늘 방문자수
    private Integer totalVisitCount; // 총 방문자수

    //Users 엔티티로부터 DTO를 생성하는 정적 메서드
    public static UserVisitDto fromEntity(Users user){
        return UserVisitDto.builder()
                .todayCount(user.getVisited()) // visited -> todayCount로 사용
                .totalVisitCount(user.getTotalVisitCount())
                .build();
    }
    
}
