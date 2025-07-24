from fastapi import APIRouter, HTTPException
from ai.schemas import guestbook as guestbook_schema
from ai.services import comment_generator

# APIRouter 인스턴스를 생성합니다.
router = APIRouter()

@router.post("/generate-comment", response_model=guestbook_schema.AIComment)
async def create_ai_guestbook_comment(entry: guestbook_schema.GuestbookEntry):
    """
    사용자가 작성한 방명록 내용을 받아,
    AI가 2000년대 감성으로 댓글을 생성하여 반환합니다.
    """
    try:
        # 1. 서비스 레이어의 함수를 호출하여 AI 댓글을 생성합니다.
        #    이 함수는 내부적으로 감정 분석과 OpenAI API 호출을 모두 처리합니다.
        ai_comment_text = comment_generator.generate_ai_comment(entry.content)
        
        # 2. (참고용) 어떤 감정으로 분석되었는지 다시 한번 확인합니다.
        detected_emotion = comment_generator.analyze_emotion(entry.content)
        
        # 3. Pydantic 모델에 맞춰 응답 데이터를 구성하여 반환합니다.
        return guestbook_schema.AIComment(
            comment=ai_comment_text,
            analyzed_emotion=detected_emotion
        )
    except Exception as e:
        # 예측하지 못한 서버 오류 발생 시 500 에러를 반환합니다.
        raise HTTPException(status_code=500, detail=f"AI 댓글 생성 중 서버 오류 발생: {e}")