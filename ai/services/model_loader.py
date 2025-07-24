# 파일 경로: ai/services/model_loader.py
import os
import torch
import tensorflow as tf
from transformers import AutoTokenizer, BertForSequenceClassification, TFBertForSequenceClassification
from typing import Dict, Any

# --- 전역 변수 정의 ---

# 모델 파일이 위치한 디렉토리 경로
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "models")

# 로드된 모델과 토크나이저를 저장할 딕셔너리
loaded_models: Dict[str, Any] = {}
loaded_tokenizers: Dict[str, Any] = {}

# --- 모델 로드 함수 ---

def _load_model(model_name: str, file_path: str, num_labels: int):
    """
    지정된 모델 파일과 레이블 수에 따라 PyTorch 또는 TensorFlow 모델을 로드하는 헬퍼 함수.
    """
    try:
        full_model_path = os.path.join(MODELS_DIR, file_path)
        
        # 공통 토크나이저 로드
        tokenizer = AutoTokenizer.from_pretrained("beomi/kcbert-base")
        loaded_tokenizers[model_name] = tokenizer
        
        model = None
        if file_path.endswith(".pth"):
            # PyTorch 모델 로드
            model = BertForSequenceClassification.from_pretrained("beomi/kcbert-base", num_labels=num_labels)
            model.load_state_dict(torch.load(full_model_path, map_location=torch.device('cpu')))
            model.eval() # 평가 모드로 설정
            print(f"PyTorch 모델 '{model_name}' 로딩 성공.")
        
        elif file_path.endswith(".h5"):
            # TensorFlow/Keras 모델 로드
            model = TFBertForSequenceClassification.from_pretrained("beomi/kcbert-base", num_labels=num_labels)
            model.load_weights(full_model_path)
            print(f"TensorFlow 모델 '{model_name}' 로딩 성공.")
        
        else:
            raise ValueError(f"지원하지 않는 모델 파일 형식입니다: {file_path}")
            
        loaded_models[model_name] = model

    except Exception as e:
        print(f"모델 '{model_name}' 로드 중 오류 발생: {e}")
        # 로드 실패 시에도 서버가 중단되지 않도록 None으로 설정
        loaded_models[model_name] = None
        loaded_tokenizers[model_name] = None


def load_all_models():
    """
    프로젝트에서 사용하는 모든 AI 모델을 로드하는 메인 함수.
    FastAPI 서버 시작 시 lifespan에서 호출됩니다.
    """
    print("="*30)
    print("AI 모델 전체 로딩을 시작합니다...")
    
    # 로드할 모델 목록: { "모델 별칭": ("모델 파일명", 출력 레이블 수) }
    models_to_load = {
        "kcbert_music_emotion": ("../models/kcbert_music_emotion.pth", 3),      # 음악 감정 분석 (부정, 중립, 긍정)
        "kcbert_shopping_emotion": ("../models/kcbert_shopping_emotion.h5", 3), # 쇼핑 감정 분석 (부정, 중립, 긍정)
        "suicide_warning": ("../models/kcbert_shopping_emotion.h5", 3),                # 자살 위험 예측 (부정, 중립, 긍정 - 임시)
    }

    for model_name, (file_path, num_labels) in models_to_load.items():
        _load_model(model_name, file_path, num_labels)
    
    print("AI 모델 전체 로딩 완료.")
    print("="*30)

# --- 로드된 모델 및 토크나이저를 가져오는 함수 ---

def get_model(model_name: str):
    """로드된 모델을 반환합니다."""
    return loaded_models.get(model_name)

def get_tokenizer(model_name: str):
    """로드된 토크나이저를 반환합니다."""
    return loaded_tokenizers.get(model_name)
