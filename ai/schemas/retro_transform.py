# ai/schemas/retro_transform.py

from pydantic import BaseModel
from typing import Optional, Literal, List

# 사용자가 API로 보낼 JSON 데이터의 구조와 타입을 정의합니다.
class DiaryInput(BaseModel):
    modern_sentence: str # 현대어 일기 문장
    # 사용할 감정 분석 모델을 선택하는 필드 업데이트
    emotion_model_name: Literal["kcbert_music_emotion", "kcbert_shopping_emotion"] = "kcbert_shopping_emotion" # 기본 모델 설정 (성능 좋은 h5 모델)

# 감정 분석 결과를 위한 모델
class EmotionOutput(BaseModel):
    label: str           # 감정 레이블 (예: "부정", "긍정", "중립")
    positive: float      # 긍정 점수
    negative: float      # 부정 점수
    neutral: float       # 중립 점수

# API가 사용자에게 반환할 JSON 데이터의 구조와 타입을 정의합니다.
# 감정 분석 결과 필드를 추가합니다.
class RetroDiaryOutput(BaseModel):
    original_sentence: str
    retro_sentence: str
    emotion: EmotionOutput # 감정 분석 결과 필드 추가

# AI의 코멘트를 위한 모델 (선택 사항, 필요시 추가)
class AiReplyOutput(BaseModel):
    comment: str
    style: str

# 추천 항목을 위한 모델 (선택 사항, 필요시 추가)
class RecommendationItem(BaseModel):
    type: str
    title: str
    reason: str

# 커뮤니티 링크를 위한 모델 (선택 사항, 필요시 추가)
class CommunityLink(BaseModel):
    room: str
    members: int
    matched_users: List[dict] # 상세 스키마는 필요에 따라 정의

# 최종 종합 응답 모델 (선택 사항, Spring Boot에서 조립할 경우 FastAPI에서는 필요 없음)
# class FullDiaryAnalysisOutput(BaseModel):
#     diary_entry: RetroDiaryOutput
#     ai_reply: AiReplyOutput
#     recommendations: List[RecommendationItem]
#     community_links: List[CommunityLink]
#     session: dict
#     _errors: List[str]
