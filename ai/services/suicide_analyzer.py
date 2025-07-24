# 파일 경로: ai/services/suicide_analyzer.py

import torch
import numpy as np
import re
import tensorflow as tf
from . import model_loader # model_loader에서 불러온 모델과 토크나이저를 사용

MAX_LEN = 64
LABEL_MAP = {0: "부정", 1: "중립", 2: "긍정"}

def preprocess_text(text):
    text = re.sub(r"[^ㄱ-ㅎㅏ-ㅣ가-힣 ]", "", text)
    text = re.sub(r"^ +", "", text)
    return text.strip()

def predict_single_sentence(text):
    # 모델이나 토크나이저가 로드되지 않았다면 분석 불가
    model = model_loader.get_model("suicide_warning")
    tokenizer = model_loader.get_tokenizer("suicide_warning")
    if not model or not tokenizer:
        return None, None

    cleaned = preprocess_text(text)
    if not cleaned:
        return None, None

    # Determine the framework of the loaded model
    is_tf_model = isinstance(model, tf.keras.Model) # TFBertForSequenceClassification inherits from tf.keras.Model

    if is_tf_model:
        inputs = tokenizer(
            cleaned,
            return_tensors="tf", # Use TensorFlow tensors
            padding="max_length",
            truncation=True,
            max_length=MAX_LEN
        )
        # For TF models, no need for torch.no_grad()
        outputs = model(inputs['input_ids'], attention_mask=inputs['attention_mask'])
        logits = outputs.logits.numpy()[0] # Get numpy array from TF tensor
        probs = tf.nn.softmax(logits).numpy() # Apply softmax using TF and convert to numpy
    else: # Assume PyTorch model
        inputs = tokenizer(
            cleaned,
            return_tensors="pt", # Use PyTorch tensors
            padding="max_length",
            truncation=True,
            max_length=MAX_LEN
        )
        with torch.no_grad():
            outputs = model(inputs['input_ids'], inputs['attention_mask'])
        logits = outputs.logits.cpu().numpy()[0]
        probs = torch.nn.functional.softmax(torch.tensor(logits), dim=-1).numpy()
    pred_idx = np.argmax(probs)
    
    return probs, LABEL_MAP[pred_idx]

def analyze_text_risk(text: str):
    """전체 텍스트를 받아 문장별로 분석하고 최종 라벨을 반환하는 메인 함수"""
    split_sentences = re.split(r'[.,?!]', text)
    valid_sentences = [s.strip() for s in split_sentences if s.strip()]

    if not valid_sentences:
        return "분석 불가"

    count, negative_score, positive_score = 0, 0.0, 0.0

    for sentence in valid_sentences:
        if len(sentence) > 1:
            count += 1
            probs, _ = predict_single_sentence(sentence)
            if probs is not None:
                negative_score += probs[0]
                positive_score += probs[1]

    if count == 0:
        return "분석 불가"

    avg_scores = {
        "부정": round(negative_score / count, 3),
        "긍정": round(positive_score / count, 3)
    }

    return max(avg_scores, key=avg_scores.get)
