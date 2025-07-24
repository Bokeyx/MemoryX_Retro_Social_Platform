from pydantic import BaseModel, Field
from typing import List, Dict, Optional

# 감정 프로필 모델 (emotion_profile)
class EmotionProfile(BaseModel):
    positive: float = Field(..., ge=0.0, le=1.0) # 0.0 ~ 1.0 사이의 값
    negative: float = Field(..., ge=0.0, le=1.0)
    neutral: float = Field(..., ge=0.0, le=1.0)

# 매칭 요청을 위한 사용자 프로필 모델
class UserProfileForMatching(BaseModel):
    user_id: str
    emotion_profile: EmotionProfile
    interests: List[str]
    # '친구의 친구'를 찾기 위해 현재 사용자의 친구 목록(user_id 리스트)이 필요합니다.
    # Optional[List[str]] = []는 이 필드가 없거나 비어있을 수 있음을 의미합니다.
    friends: Optional[List[str]] = []

# 매칭 결과 항목 모델
class MatchedUser(BaseModel):
    user_id: str
    nickname: str
    score: float = Field(..., ge=0.0, le=1.0) # 0.0 ~ 1.0 사이의 유사도 점수
    # (추가) 이 사용자가 나와의 관계에서 몇 촌인지 표시하는 필드 (예: 2촌, 3촌)
    connection_degree: Optional[int] = None 

# 매칭 API 응답 모델
class MatchingResult(BaseModel):
    target_user_id: str
    top_matches: List[MatchedUser]
    message: str = "매칭이 성공적으로 완료되었습니다."

# 테스트용 사용자 데이터 모델 (load_users에서 사용)
class SampleUser(BaseModel):
    user_id: str
    nickname: str
    emotion_profile: EmotionProfile
    interests: List[str]
    # 샘플 데이터에도 친구 목록을 포함시킵니다.
    friends: Optional[List[str]] = []