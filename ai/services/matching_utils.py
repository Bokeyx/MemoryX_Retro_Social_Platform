# ai/services/matching_utils.py

import math  # 수학 계산용 모듈 (유클리디안 거리의 제곱근 계산에 사용)

def emotion_similarity(e1: dict, e2: dict, debug: bool = False) -> float:
    """
    두 감정 프로필 간의 유사도를 계산하는 함수.
    감정 점수(positive, negative, neutral) 간의 유클리디안 거리를 계산한 후,
    이를 0~1 사이의 유사도 값으로 정규화하여 변환합니다.
    거리가 0이면 유사도는 1 (완벽 일치), 거리가 최대이면 유사도는 0 (완벽 불일치)이 됩니다.

    Args:
        e1 (dict): 첫 번째 사용자의 감정 프로필.
                   예: {"positive": 0.2, "negative": 0.7, "neutral": 0.1}.
                   각 값은 0.0 ~ 1.0 사이이며, 세 값의 합은 1.0에 가까운 것이 이상적입니다 (확률 분포).
        e2 (dict): 두 번째 사용자의 감정 프로필.

    Returns:
        float: 두 감정 프로필 간의 유사도 (0.0 ~ 1.0).
               유클리디안 거리가 가까울수록 1에 가까워지고, 멀수록 0에 가까워집니다.
    """
    # 감정 점수(positive, negative, neutral)를 3차원 공간의 좌표로 보고,
    # 두 점(e1, e2) 사이의 유클리디안 거리를 계산합니다.
    # 유클리디안 거리 공식: sqrt((x1-x2)^2 + (y1-y2)^2 + (z1-z2)^2)
    dist = math.sqrt(
        (e1["positive"] - e2["positive"])**2 +
        (e1["negative"] - e2["negative"])**2 +
        (e1["neutral"] - e2["neutral"])**2
    )

    # 감정 프로필의 각 요소가 0에서 1 사이의 값을 가질 때,
    # 두 감정 프로필이 가질 수 있는 최대 유클리디안 거리는 sqrt( (1-0)^2 + (1-0)^2 + (1-0)^2 ) = sqrt(3) 입니다.
    # (예: e1 = {1,0,0}, e2 = {0,1,1} 인 경우)
    max_dist = math.sqrt(3) 
    
    # 계산된 거리를 최대 거리로 나누어 0~1 사이로 정규화합니다.
    # normalized_dist가 0이면 두 프로필이 동일하고, 1이면 가장 멀리 떨어져 있습니다.
    normalized_dist = dist / max_dist
    
    # 정규화된 거리를 1에서 빼서 유사도 값으로 변환합니다.
    # 거리가 0이면 유사도 1 (최대), 거리가 1 (최대 정규화 거리)이면 유사도 0 (최소)이 됩니다.
    similarity = 1 - normalized_dist 

    # debug 모드가 True일 경우, 계산 과정과 중간 결과를 상세히 출력합니다.
    if debug:
        print("[DEBUG] 감정 유사도 계산")
        print(f" - 입력값 e1: {e1}")
        print(f" - 입력값 e2: {e2}")
        print(f" - 유클리디안 거리 (raw): {dist:.4f}")      # 정규화 전 거리
        print(f" - 정규화된 거리: {normalized_dist:.4f}")  # 정규화된 거리
        print(f" - 유사도: {similarity:.4f}\n")           # 최종 유사도

    return similarity


def interest_similarity(i1: list, i2: list) -> float:
    """
    두 관심사 리스트 간의 유사도를 자카드 유사도(Jaccard Similarity) 기반으로 계산하는 함수.
    자카드 유사도 = (교집합 크기) / (합집합 크기).

    Args:
        i1 (list): 첫 번째 사용자의 관심사 리스트. 예: ["영화", "음악", "여행"].
        i2 (list): 두 번째 사용자의 관심사 리스트. 예: ["영화", "독서", "음악"].

    Returns:
        float: 두 관심사 리스트 간의 유사도 (0.0 ~ 1.0).
               0은 공통 관심사가 전혀 없음을, 1은 모든 관심사가 동일함을 의미합니다.
               만약 두 리스트 중 하나라도 비어있으면 (비교 대상이 없으므로) 유사도는 0.0을 반환합니다.
    """
    # 리스트를 set(집합)으로 변환하여 교집합 및 합집합 연산을 효율적으로 수행합니다.
    # 집합은 중복을 허용하지 않으며, 순서에 상관없이 요소를 저장합니다.
    set1, set2 = set(i1), set(i2)

    # 두 집합 중 하나라도 비어있으면 공통 관심사를 찾을 수 없으므로 유사도를 0.0으로 반환합니다.
    # 이는 빈 리스트와의 비교에서 ZeroDivisionError를 방지하는 역할도 합니다 (합집합 크기가 0이 될 수 있음).
    if not set1 or not set2:
        return 0.0
        
    # 교집합(intersection)의 크기: `set1 & set2` 연산은 두 집합 모두에 존재하는 요소들로 구성된 새 집합을 반환합니다.
    # 합집합(union)의 크기: `set1 | set2` 연산은 두 집합의 모든 고유한 요소들로 구성된 새 집합을 반환합니다.
    # 자카드 유사도 공식에 따라 '교집합 크기 / 합집합 크기'를 계산하여 반환합니다.
    return len(set1 & set2) / len(set1 | set2)
