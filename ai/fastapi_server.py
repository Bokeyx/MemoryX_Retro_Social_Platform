# 파일 경로: ai/fastapi_server.py

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager

# 새로운 라우터를 임포트합니다.
from ai.routers import retro_transform, diary, suicide_detection
from ai.services import model_loader

app = FastAPI(
    title="Memory X AI Backend API",
    description="Memory X 프로젝트의 AI 및 백엔드 API",
    version="0.0.1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://memory-x.duckdns.org", "http://localhost", "http://localhost:3000", "http://localhost:5173"], # 프론트엔드 Origin 추가
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("FastAPI 애플리케이션 시작: 모델 로딩 시작...")
    try:
        # 모든 모델을 로드하는 함수를 호출합니다.
        model_loader.load_all_models()
        print("FastAPI 애플리케이션 시작: 모델 로딩 완료.")
        yield
    finally:
        print("FastAPI 애플리케이션 종료.")

app.router.lifespan_context = lifespan

@app.exception_handler(Exception)
async def universal_exception_handler(request: Request, exc: Exception):
    print(f"[ERROR] Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
    )

# 라우터를 메인 애플리케이션에 포함시킵니다.
app.include_router(retro_transform.router, prefix="/retro", tags=["Retro Transformation"])
app.include_router(diary.router, prefix="/api", tags=["Diary"])
# 새로운 라우터를 등록합니다.
app.include_router(suicide_detection.router, prefix="/suicide", tags=["Suicide Detection"])


@app.get("/")
async def read_root():
    return {"message": "Hello World from FastAPI!"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("ai.fastapi_server:app", host="0.0.0.0", port=8000, reload=True)
