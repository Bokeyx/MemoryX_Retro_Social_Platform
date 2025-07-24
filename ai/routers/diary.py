from fastapi import APIRouter, HTTPException, status
from ai.schemas.diary import DiaryEntry
from ai.services.diary_service import save_diary_entry_to_db
from ai.services import suicide_analyzer # suicide_analyzer 임포트

router = APIRouter()

@router.post("/diary/result")
async def save_diary_entry(entry: DiaryEntry):
    print(f"Received diary entry: {entry.dict()}")
    
    response_content = {"message": "일기 데이터 수신 및 저장 성공"}

    if entry.emotion_label == "부정":
        suicide_risk_label = suicide_analyzer.analyze_text_risk(entry.original_text)
        if suicide_risk_label == "부정":
            response_content["suicide_warning"] = {
                "message": """힘든 시간을 보내고 계시는군요.
당신은 혼자가 아닙니다.
도움이 필요하시면
언제든지 연락하세요.""",
                "contact": "자살예방 상담전화 1393"
            }

    if save_diary_entry_to_db(entry.dict()):
        return response_content
    else:
        raise HTTPException(status_code=500, detail="일기 데이터 저장 실패")