import json
from collections import deque # 너비 우선 탐색(BFS)에 효율적인 큐 자료구조를 사용하기 위해 임포트합니다.

# ai.services 패키지 내의 matching_utils 모듈에서 함수를 가져옵니다.
from ai.services.matching_utils import emotion_similarity, interest_similarity 

def load_users(json_path: str) -> list:
    # (기존 코드와 동일)
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

# --- 새로운 함수: 친구 관계망 탐색 ---
def find_friend_candidates(
    target_user_id: str, 
    all_users: dict, 
    max_depth: int = 3
) -> dict:
    """
    너비 우선 탐색(BFS)을 사용하여 특정 사용자로부터 N촌 이내의 사용자들을 찾는 함수.

    Args:
        target_user_id (str): 탐색을 시작할 사용자의 ID.
        all_users (dict): user_id를 키로, 사용자 정보 딕셔너리를 값으로 갖는 전체 사용자 맵.
        max_depth (int, optional): 탐색할 최대 촌수(깊이). 기본값은 3.

    Returns:
        dict: 추천 후보 user_id를 키로, 촌수(degree)를 값으로 갖는 딕셔너리.
              (예: {'user_004': 2, 'user_005': 2, 'user_006': 3})
              나 자신(0촌)과 직접적인 친구(1촌)는 결과에서 제외됩니다.
    """
    # BFS 탐색을 위한 큐. (user_id, 현재 깊이)를 튜플로 저장합니다.
    queue = deque([(target_user_id, 0)]) 
    # 이미 방문한 사용자를 추적하여 무한 루프를 방지합니다.
    visited = {target_user_id}
    # 추천 후보와 그들의 촌수를 저장할 딕셔너리입니다.
    candidates = {}

    while queue:
        current_user_id, current_depth = queue.popleft() # 큐의 맨 앞에서부터 탐색

        # 현재 깊이가 최대 탐색 깊이를 초과하면 더 이상 탐색하지 않습니다.
        if current_depth >= max_depth:
            continue

        # 현재 사용자의 친구 목록을 가져옵니다. 친구가 없으면 빈 리스트를 사용합니다.
        # all_users.get(current_user_id, {})는 사용자가 없을 경우 에러를 방지합니다.
        friend_ids = all_users.get(current_user_id, {}).get("friends", [])

        for friend_id in friend_ids:
            if friend_id not in visited:
                visited.add(friend_id) # 방문 처리
                new_depth = current_depth + 1
                queue.append((friend_id, new_depth))

                # 2촌 이상의 관계부터 추천 후보에 추가합니다 (1촌은 이미 친구이므로 제외).
                if new_depth > 1:
                    candidates[friend_id] = new_depth
    
    return candidates


# --- 기존 함수 수정: 관계망 탐색과 유사도 계산 결합 ---
def match_user(
    target_user: dict, 
    user_list: list, 
    top_n: int = 5, 
    emotion_weight: float = 0.4, 
    interest_weight: float = 0.6
) -> list:
    """
    친구 관계망(최대 3촌)과 프로필 유사도를 종합하여 Top-N명의 친구 후보를 추천하는 함수.
    """
    # 1. 효율적인 조회를 위해 사용자 리스트를 딕셔너리(맵) 형태로 변환합니다.
    #    (Key: user_id, Value: user_profile 딕셔너리)
    all_users_map = {user["user_id"]: user for user in user_list}
    
    # 2. '친구의 친구의 친구'까지 탐색하여 추천 후보 목록을 가져옵니다.
    #    결과: {'user_id_A': 2, 'user_id_B': 3, ...}
    friend_candidates = find_friend_candidates(target_user["user_id"], all_users_map, max_depth=3)

    matches = [] # 추천 결과를 담을 빈 리스트를 초기화합니다.
    
    # 3. 전체 사용자가 아닌, 탐색된 후보군에 대해서만 유사도 점수를 계산합니다.
    #    friend_candidates.items()는 (user_id, 촌수) 쌍을 반복합니다.
    for user_id, degree in friend_candidates.items():
        # 후보 사용자(user)의 전체 프로필 정보를 맵에서 가져옵니다.
        user = all_users_map.get(user_id)
        if not user:
            continue # 혹시 모를 경우를 대비해, 사용자 정보가 없으면 건너뜁니다.

        # (기존 로직과 동일) 유사도 점수 계산
        e_sim = emotion_similarity(target_user["emotion_profile"], user["emotion_profile"])
        i_sim = interest_similarity(target_user["interests"], user["interests"])
        total_score = emotion_weight * e_sim + interest_weight * i_sim

        # 4. 결과에 '촌수(connection_degree)' 정보를 추가하여 저장합니다.
        matches.append({
            "user_id": user["user_id"],
            "nickname": user.get("nickname", "알 수 없음"),
            "score": round(total_score, 3),
            "connection_degree": degree # 몇 촌 관계인지 추가
        })

    # 'score' 키의 값을 기준으로 내림차순으로 정렬하여 상위 top_n명만 반환합니다.
    return sorted(matches, key=lambda x: x["score"], reverse=True)[:top_n]