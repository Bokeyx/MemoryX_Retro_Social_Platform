// src/main/java/com/project/backend/dto/users/UserRecommendFriendDto.java
package com.project.backend.dto.users;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter // 모든 필드에 대한 getter 메서드를 자동으로 생성합니다.
@Setter // 모든 필드에 대한 setter 메서드를 자동으로 생성합니다.
@NoArgsConstructor // 인자 없는 기본 생성자를 자동으로 생성합니다.
@AllArgsConstructor // 모든 필드를 인자로 받는 생성자를 자동으로 생성합니다. (@Builder와 함께 사용 권장)
@Builder // 빌더 패턴을 사용하여 객체를 생성할 수 있게 해줍니다. (예: UserRecommendFriendDto.builder().userId("...").build())
@ToString // toString() 메서드를 자동으로 오버라이드하여 객체 정보를 쉽게 출력할 수 있게 합니다.
public class UserRecommendFriendDto {
    private String userId;        // 사용자 ID
    private String name;          // 사용자 이름
    private String profileImage;  // 사용자 프로필 이미지 URL
    // 필요하다면 introduction 등 다른 필드도 추가 가능합니다.
}