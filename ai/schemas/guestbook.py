from pydantic import BaseModel, Field

class GuestbookEntry(BaseModel):
    """방명록 댓글 생성 요청을 위한 모델"""
    # API에 방명록 글의 내용을 전달하기 위한 필드
    content: str = Field(..., min_length=10, description="사용자가 작성한 방명록 내용 (최소 10자 이상)")

class AIComment(BaseModel):
    """AI가 생성한 댓글 응답을 위한 모델"""
    # AI가 생성한 댓글 텍스트
    comment: str
    # 참고용: 어떤 감정으로 분석되었는지
    analyzed_emotion: str