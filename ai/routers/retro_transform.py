# ai/routers/retro_transform.py

from fastapi import APIRouter, HTTPException, status
from openai import OpenAI # OpenAI 임포트
import os
import re
import numpy as np
import tensorflow as tf
from transformers import BertTokenizer, TFBertForSequenceClassification
from typing import List, Any
import torch

from ai.schemas import retro_transform as retro_transform_schema
from ai.services import model_loader

# APIRouter 인스턴스를 생성합니다.
router = APIRouter()

# OpenAI 클라이언트 초기화
API_KEY = os.getenv("OPENAI_API_KEY")

# !!! 중요: OpenAI 클라이언트 초기화 시 'proxies' 인자를 완전히 제거합니다. !!!
# client = OpenAI(api_key=API_KEY, proxies={}) # <--- 이 라인에서 ', proxies={}'를 제거합니다.
client = OpenAI(api_key=API_KEY) # <--- 이 형태만 남아야 합니다.

# --- 감정 분석을 위한 상수 ---
MAX_LEN = 64
LABEL_MAP = {0: "부정", 1: "중립", 2: "긍정"} # 모델의 출력 레이블 순서에 맞춰야 합니다.

# --- 텍스트 전처리 함수 ---
def preprocess_text(text):
    text = re.sub(r"[^ㄱ-ㅎㅏ-ㅣ가-힣 ]", "", text)
    text = re.sub(r"^ +", "", text)
    return text.strip()

# --- 감정 분석 함수 ---
async def predict_emotion_from_model(text: str, model_name: str) -> tuple[np.ndarray, str]:
    model = model_loader.get_model(model_name)
    tokenizer = model_loader.get_tokenizer(model_name)

    if not model or not tokenizer:
        raise HTTPException(status_code=500, detail=f"Emotion model '{model_name}' or tokenizer not loaded.")

    cleaned_text = preprocess_text(text)
    if not cleaned_text:
        return np.array([0.0, 1.0, 0.0]), "중립" # 유효한 문장이 없으면 중립 (중립 확률 1.0) 반환

    try:
        inputs = tokenizer(
            cleaned_text,
            return_tensors="tf" if isinstance(model, tf.keras.Model) else "pt", # 모델 타입에 따라 텐서 반환 타입 결정
            padding="max_length",
            truncation=True,
            max_length=MAX_LEN
        )
        
        probs = np.array([0.0, 0.0, 0.0]) # 초기화
        predicted_label = "중립"

        if isinstance(model, TFBertForSequenceClassification): # TensorFlow/Keras 모델
            outputs = model(inputs)
            logits = outputs.logits.numpy()[0]
            probs = tf.nn.softmax(logits).numpy()
            pred_idx = np.argmax(probs)
            predicted_label = LABEL_MAP[pred_idx]
            
        elif isinstance(model, torch.nn.Module): # PyTorch 모델
            with torch.no_grad(): # 추론 시에는 그래디언트 계산 비활성화
                outputs = model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1).numpy()[0]
            pred_idx = np.argmax(probs)
            predicted_label = LABEL_MAP[pred_idx] # 현재는 동일한 LABEL_MAP 사용 가정
        else:
            raise ValueError("Unsupported model type for emotion analysis.")

        return probs, predicted_label # 실제 모델 예측 결과 반환

    except Exception as e:
        print(f"감정 예측 중 오류 발생 (모델 '{model_name}'): {e}")
        raise HTTPException(status_code=500, detail=f"감정 예측 중 오류 발생: {e}")


# --- OpenAI 프롬프트 기본 틀 정의 ---
def make_retro_transform_prompt(user_input: str) -> str:
    """
    현대어 문장을 2000년대 초반 레트로 감성 문체와 유행어로 변환하기 위한 프롬프트.
    GPT에 어떤 역할을 수행해야 하는지 구체적으로 지시합니다.
    """
    return f"""
너는 2000년대 초반 (1995년 ~ 2010년) 온라인 커뮤니티(싸이월드, MSN, 버디버디 등)에서 주로 사용되던 유행어와 문체를 잘 알고 있는 작가야.
사용자의 현대어 문장을 그 시절의 자연스러운 레트로 감성 문체와 유행어로 변환해 줘.
다음 규칙을 반드시 지켜줘:
1. 문장의 의미는 유지하되, 단어나 어미를 레트로 유행어 또는 그 시절 문체로 변경해.
2. '즐', '뷁', '넘사벽', '지못미', '쌩얼', '떡실신', '득템', '개간지', '킹왕짱', 'O.T.L', 'ㅠㅠ', 'ㅋㅋ', 'ㅎㅎ', 'ㄷㄷ', '~셈', '~삼', '~임', '~하삼', '~하셈' 등의 유행어, 초성체, 줄임말을 적절하게 활용해줘.
3. 가끔은 (*・ω・)ﾉ, (￣▽￣)ノ,(^０^)ノ,(✧∀✧)/,⊂(￣▽￣)⊃,(^_<),｢(⑅◔ω◔「)三,✿◕ ‿ ◕✿しΗ口占○Ι○よ,ળવળવ?,પ દાન નવપ? 등등 이런 형태의 이모티콘도 조금씩 넣어줘
4. 너무 과하게 사용하지 않고, 자연스럽게 문장 속에 녹아내야 해.
5. 문장의 전체적인 어조와 감성은 입력 문장의 것을 유지해야 해 (억지로 우울하게 바꾸지 마).
6. '오늘', '요즘', '어제', '내일' 등 현대에도 통용되는 시간 표현은 어색하게 변형하지 말고 그대로 사용하거나, 2000년대에 자연스러웠던 유사 표현('요새' 등)을 사용해.

예시:
입력: 오늘 점심에 친구랑 맛있는 파스타 먹었어. 너무 좋았어.
레트로어 변환 출력: 오늘 점심에 친구랑 맛난 파스타 득템했삼. 킹왕짱 좋았삼ㅋㅋ

입력: {user_input}
레트로어 변환 출력:"""

# --- GPT 모델을 호출하여 레트로 일기 문장 생성 ---
async def generate_retro_diary_style(input_text: str) -> str:
    """
    OpenAI GPT 모델을 호출하여 현대어 일기를 레트로어로 변환합니다.
    비동기(async) 함수로 정의하여 I/O 작업(네트워크 통신) 시 다른 작업을 블록하지 않도록 합니다.
    """
    if not API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API Key is not configured.")

    prompt = make_retro_transform_prompt(input_text)

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo", # 더 좋은 품질을 원하면 "gpt-4o" 또는 "gpt-4" 고려
            messages=[
                {"role": "system", "content": "너는 2000년대 레트로 감성 문장 변환 전문가야."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5, # 창의성 조절, 0.7~0.9 사이에서 테스트. 일관된 변환을 위해 너무 높지 않게.
            max_tokens=1000, # 일기 내용은 댓글보다 길 수 있으므로 max_tokens를 넉넉하게 설정
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0.6
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI API 호출 중 오류 발생: {type(e).__name__} - {e.args}")
        raise HTTPException(status_code=500, detail=f"AI 변환 중 오류 발생: {e}")

# --- API 엔드포인트 정의 ---
@router.post("/transform-diary", response_model=retro_transform_schema.RetroDiaryOutput)
async def transform_diary(input: retro_transform_schema.DiaryInput):
    """
    현대어 일기 문장을 받아 2000년대 레트로 감성으로 변환하고 감정을 분석하여 반환하는 API 엔드포인트.
    사용자가 emotion_model_name을 지정하여 사용할 감정 분석 모델을 선택할 수 있습니다.
    """
    # 1. 레트로어 변환
    retro_sentence = await generate_retro_diary_style(input.modern_sentence)

    # 2. 감정 분석
    # 사용자가 emotion_model_name을 지정하지 않으면 기본값 'bert' 사용
    model_name_to_use = input.emotion_model_name if input.emotion_model_name else 'kcbert_shopping_emotion'
    probs, predicted_label = await predict_emotion_from_model(input.modern_sentence, model_name_to_use)

    emotion_analysis = retro_transform_schema.EmotionOutput(
        label=predicted_label,
        negative=float(probs[0]), # 부정 확률
        neutral=float(probs[1]),  # 중립 확률
        positive=float(probs[2])  # 긍정 확률
    )

    return retro_transform_schema.RetroDiaryOutput(
        original_sentence=input.modern_sentence,
        retro_sentence=retro_sentence,
        emotion=emotion_analysis # 감정 분석 결과 포함
    )
