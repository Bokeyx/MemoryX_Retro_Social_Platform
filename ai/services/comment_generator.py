import os
from openai import OpenAI

# --- API 키 설정 ---
# Docker 환경 변수 (docker-compose.yml에 설정된)에서 API 키를 가져옵니다.
# os.getenv("OPENAI_API_KEY")는 "OPENAI_API_KEY"라는 이름의 환경 변수를 읽어옵니다.
# 만약 환경 변수가 없다면 None이 반환됩니다.
API_KEY = os.getenv("OPENAI_API_KEY")

# OpenAI 클라이언트 생성
# API 키가 정상적으로 로드되었을 때만 클라이언트를 생성합니다.
if API_KEY:
    client = OpenAI(api_key=API_KEY)
else:
    # API 키가 없는 경우, 서버 시작 시 오류를 명확히 알리거나
    # 해당 기능을 비활성화 처리할 수 있습니다. 여기서는 None으로 초기화합니다.
    client = None
    print("경고: OPENAI_API_KEY 환경 변수가 설정되지 않았습니다. AI 댓글 생성 기능이 작동하지 않을 수 있습니다.")


# --- [Placeholder] 일기 감정 분석 함수 ---
def analyze_emotion(text: str) -> str:
    """
    일기 텍스트를 분석하여 주된 감정을 "긍정", "중립", "부정" 중 하나로 반환하는 임시 함수.
    """
    text_lower = text.lower()
    positive_keywords = ["행복", "기분 좋아", "즐거워", "좋았어", "신나", "재미있", "기쁘"]
    negative_keywords = ["슬퍼", "힘들어", "우울", "지쳐", "화나", "짜증", "열받", "나빠", "최악"]

    is_positive = any(keyword in text_lower for keyword in positive_keywords)
    is_negative = any(keyword in text_lower for keyword in negative_keywords)

    if is_positive and not is_negative:
        return "긍정"
    elif is_negative and not is_positive:
        return "부정"
    else:
        return "중립"

# --- 감정 분석 기반 AI 댓글 생성 프롬프트 ---
def make_ai_comment_prompt(diary_text: str, emotion: str) -> str:
    """
    일기 내용과 분석된 감정을 기반으로 2000년대 스타일 댓글을 생성하기 위한 프롬프트.
    """
    return f"""
너는 2000년대 초반 (1995년 ~ 2010년) 싸이월드 미니홈피의 친한 일촌이 작성한 댓글처럼 자연스럽게 반응해줘.
사용자가 작성한 일기의 내용은 다음과 같아:
"{diary_text}"

일기에서 느껴지는 주된 감정은 **'{emotion}'** 이야.

이 감정에 공감하고, 그 시절 친구들이 남기던 댓글처럼 친근하고 짧게 반응해줘.
다음 규칙을 반드시 지켜줘:
1. 2000년대 유행어 ('즐', 'ㅋㅋ', 'ㅠㅠ', 'OTL', '완전', '겁나', '대박', '킹왕짱' 등)와 이모티콘을 적절히 사용해.
2. 너무 길게 작성하지 말고, 1~2문장 정도로 짧게 마무리해.
3. 사용자의 감정에 진심으로 공감하고 위로/축하/격려 등 적절한 반응을 보여줘.
4. 가끔은 (*・ω・)ﾉ, (￣▽￣)ノ,(^０^)ノ,(✧∀✧)/,⊂(￣▽￣)⊃,(^_<),｢(⑅◔ω◔「)三,✿◕ ‿ ◕✿しΗ口占○Ι○よ,ળવળવ?,પ દાન નવપ? 이런 형태의 이모티콘도 조금씩 넣어줘
5. 다소 감성적이거나 오글거리는 표현이 있어도 괜찮아.

댓글 출력:"""

# --- GPT-3.5-turbo를 호출하여 AI 댓글 생성 ---
def generate_ai_comment(diary_text: str) -> str:
    """
    일기 내용을 받아 감정을 분석하고, 최종 AI 댓글을 생성하여 반환하는 메인 함수.
    """
    # client가 초기화되지 않았다면 오류 메시지를 반환합니다.
    if not client:
        return "AI 댓글 기능이 현재 비활성화되어 있습니다. (API 키 미설정)"
        
    # 1. 일기 감정 분석
    detected_emotion = analyze_emotion(diary_text)
    
    # 2. 프롬프트 생성
    prompt = make_ai_comment_prompt(diary_text, detected_emotion)

    # 3. OpenAI API 호출
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "너는 2000년대 싸이월드 댓글 감성을 완벽하게 재현하는 AI야."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=80,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0.6
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        # API 호출 중 오류가 발생하면 로그를 남기고 사용자에게 알릴 수 있습니다.
        print(f"OpenAI API 호출 오류: {e}")
        return "댓글을 다는 중에 잠시 문제가 생겼나봐.. OTL"