from pydantic import BaseModel
from typing import Optional

class DiaryEntry(BaseModel):
    diary_user: str
    original_text: str
    retro_text: str
    emotion_label: str
    reco_song: Optional[str] = None
    reco_content: Optional[str] = None
