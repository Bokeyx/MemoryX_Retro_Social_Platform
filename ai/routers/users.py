# ai/routers/users.py

from fastapi import APIRouter, HTTPException, status
from typing import List
from ai.schemas import user as user_schema # <--- 'ai.schemas'로 절대 경로 임포트

# APIRouter 인스턴스를 생성합니다.
router = APIRouter()

# 임시 사용자 데이터 (나중에 데이터베이스에서 가져올 것입니다)
fake_users_db = [
    {"user_id": "user001", "name": "김철수", "email": "kim@example.com"},
    {"user_id": "user002", "name": "이영희", "email": "lee@example.com"},
]

@router.get("/", response_model=List[user_schema.UserResponse])
async def get_all_users():
    """
    모든 사용자 목록을 반환합니다.
    """
    return fake_users_db

@router.get("/{user_id}", response_model=user_schema.UserResponse)
async def get_user_by_id(user_id: str):
    """
    특정 사용자 ID로 사용자 정보를 반환합니다.
    """
    for user in fake_users_db:
        if user["user_id"] == user_id:
            return user
    raise HTTPException(status_code=404, detail="User not found")

@router.post("/", response_model=user_schema.UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: user_schema.UserCreate):
    """
    새로운 사용자를 생성합니다.
    """
    new_user = user.dict()
    new_user["user_id"] = f"user{len(fake_users_db) + 1:03d}" # 임시 ID 생성
    fake_users_db.append(new_user)
    return new_user
