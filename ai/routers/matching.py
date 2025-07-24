from fastapi import APIRouter, HTTPException, status
from typing import List
import os

from ai.schemas import matching as matching_schema # 매칭 스키마 임포트
from ai.services import matching_engine # 매칭 엔진 임포트

# APIRouter 인스턴스를 생성합니다.
router = APIRouter()

# 샘플 사용자 데이터 파일 경로 (컨테이너 내부 경로)
SAMPLE_USERS_JSON_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "sample_users.json")

# 매칭 API 엔드포인트
@router.post("/match", response_model=matching_schema.MatchingResult)
async def get_user_matches(
    target_user_profile: matching_schema.UserProfileForMatching,
    top_n: int = 5,
    emotion_weight: float = 0.4,
    interest_weight: float = 0.6
):
    """
    사용자의 프로필과 친구 관계망을 바탕으로 '친구의 친구' 또는
    '친구의 친구의 친구' 중에서 가장 잘 맞는 후보를 추천합니다.
    """
    try:
        # 모든 사용자 데이터 로드
        all_users = matching_engine.load_users(SAMPLE_USERS_JSON_PATH)
        
        # 수정된 매칭 엔진 호출
        # target_user_profile은 friends 목록을 포함하고 있으며,
        # match_user 함수 내부에서 이를 활용하여 관계망을 탐색합니다.
        matches = matching_engine.match_user(
            target_user_profile.dict(), # Pydantic 모델을 딕셔너리로 변환
            all_users,
            top_n=top_n,
            emotion_weight=emotion_weight,
            interest_weight=interest_weight
        )
        
        return matching_schema.MatchingResult(
            target_user_id=target_user_profile.user_id,
            top_matches=matches,
            message="친구 관계망 및 프로필 기반 매칭이 성공적으로 완료되었습니다."
        )
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"샘플 사용자 데이터 파일을 찾을 수 없습니다: {SAMPLE_USERS_JSON_PATH}")
    except Exception as e:
        # 디버깅 시 실제 오류를 확인하기 위해 f-string을 사용하는 것이 좋습니다.
        raise HTTPException(status_code=500, detail=f"매칭 중 오류 발생: {str(e)}")