# 파일 경로: ai/routers/suicide_detection.py

from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import JSONResponse
from ai.services import suicide_analyzer

router = APIRouter()

@router.post("/") # prefix가 /suicide 이므로, 이 경로는 POST /suicide 가 됩니다.
async def analyze(text: str = Form(...)):
    try:
        final_label = suicide_analyzer.analyze_text_risk(text)
        return JSONResponse(content={"final_label": final_label})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
