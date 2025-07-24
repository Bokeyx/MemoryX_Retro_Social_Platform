# ai/schemas/user.py

from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime

# 사용자 생성을 위한 요청 모델
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str # 비밀번호는 실제 앱에서는 해싱되어야 합니다.

# 사용자 응답을 위한 모델 (데이터베이스에서 조회 후 반환)
class UserResponse(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    introduction: Optional[str] = None
    created_at: Optional[datetime.datetime] = None # DB에서 가져올 경우

    class Config:
        orm_mode = True # SQLAlchemy ORM 모델과 호환되도록 설정 (나중에 DB 연동 시 필요)
        # alias_generator = to_camel # 필드명을 camelCase로 변환하는 설정 (선택 사항)
        # allow_population_by_field_name = True
        