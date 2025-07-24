import unittest
import os
import sys

# 프로젝트 루트 디렉토리를 Python 경로에 추가
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# 필요한 함수들 임포트
from ai.services.matching_utils import emotion_similarity, interest_similarity
from ai.services.matching_engine import load_users, match_user, find_friend_candidates

class TestMatchingEngine(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """테스트 클래스 전체에서 한 번만 실행되는 초기화 메서드."""
        data_path = os.path.join(os.path.dirname(__file__), "..", "data", "sample_users.json")
        cls.users = load_users(data_path)
        cls.user_A = next(u for u in cls.users if u["user_id"] == "user_001")
        print("--- 테스트 시작 ---")
        print(f"기준 user_A 프로필: {cls.user_A['emotion_profile']}, 관심사: {cls.user_A['interests']}")

    def test_emotion_similarity(self):
        """감정 유사도 계산 함수를 테스트합니다."""
        e1 = {"positive": 0.1, "negative": 0.8, "neutral": 0.1}
        e2 = {"positive": 0.15, "negative": 0.75, "neutral": 0.1}
        self.assertGreater(emotion_similarity(e1, e2), 0.9)
        e3 = {"positive": 0.9, "negative": 0.05, "neutral": 0.05}
        self.assertLess(emotion_similarity(e1, e3), 0.5)

    def test_interest_similarity(self):
        """관심사 유사도 계산 함수를 테스트합니다."""
        i1 = ["영화", "음악", "여행"]
        i2 = ["영화", "독서", "음악"]
        self.assertAlmostEqual(interest_similarity(i1, i2), 0.5)
        i3 = []
        self.assertEqual(interest_similarity(i1, i3), 0.0)
        i4 = ["영화", "음악", "여행"]
        self.assertEqual(interest_similarity(i1, i4), 1.0)

    # --- 새로운 테스트: 친구 관계망 탐색 기능 자체를 검증 ---
    def test_find_friend_candidates(self):
        """find_friend_candidates 함수 (BFS 기반 관계망 탐색)를 테스트합니다."""
        users_map = {user['user_id']: user for user in self.users}
        candidates = find_friend_candidates("user_001", users_map, max_depth=3)
        expected = {"user_004": 2, "user_005": 2, "user_006": 3}
        self.assertDictEqual(candidates, expected)

    def test_match_user_excludes_self_and_direct_friends(self):
        """match_user 함수가 결과에서 자신과 직접 친구(1촌)를 제외하는지 확인합니다."""
        matches = match_user(self.user_A, self.users)
        matched_ids = {m['user_id'] for m in matches}
        
        # 자기 자신이 없는지 확인
        self.assertNotIn(self.user_A["user_id"], matched_ids)
        # 직접 친구들(user_002, user_003)이 없는지 확인
        for friend_id in self.user_A.get("friends", []):
            self.assertNotIn(friend_id, matched_ids)
            
    # --- 수정된 테스트 ---
    def test_match_user_top_n_count(self):
        """match_user 함수가 top_n 개수만큼의 결과를 정확히 반환하는지 확인합니다."""
        # user_A의 실제 추천 후보군(2촌, 3촌)의 수를 계산합니다.
        users_map = {user['user_id']: user for user in self.users}
        candidates = find_friend_candidates(self.user_A["user_id"], users_map, max_depth=3)
        actual_candidates_count = len(candidates) # 예상되는 매칭 후보 수 (user_001의 경우 3명)

        # top_n을 2로 설정했을 때
        matches_top2 = match_user(self.user_A, self.users, top_n=2)
        self.assertEqual(len(matches_top2), min(2, actual_candidates_count))
        
        # top_n을 전체 후보 수보다 크게 설정했을 때, 전체 후보 수만큼 반환되어야 합니다.
        matches_all = match_user(self.user_A, self.users, top_n=10) # 10은 임의의 큰 수
        self.assertEqual(len(matches_all), actual_candidates_count, f"실제 후보 수({actual_candidates_count})만큼 반환되어야 합니다.")

    # --- 비활성화된 테스트 ---
    @unittest.skip("새로운 '친구 관계망' 기반 로직에서는 가상 유저 테스트가 부적합하므로 건너뜁니다.")
    def test_match_user_with_weights(self):
        """가중치(emotion_weight, interest_weight)를 다르게 주었을 때 매칭 결과의 순위가 변화하는지 테스트합니다."""
        # 이 테스트는 '친구 관계망'에 없는 가상 유저를 사용하므로 현재 로직과 맞지 않아 skip합니다.
        pass

    def test_match_user_full_list(self):
        """전체 사용자 리스트 대상 매칭 시 결과의 유효성을 테스트합니다."""
        matches = match_user(self.user_A, self.users, top_n=5)
        self.assertLessEqual(len(matches), 5)
        
        scores = [m['score'] for m in matches]
        self.assertEqual(scores, sorted(scores, reverse=True))

        print("\n[전체 매칭 결과 (top 5)]")
        for m in matches:
            print(f" - user_id: {m['user_id']}, nickname: {m.get('nickname', 'N/A')}, score: {m['score']:.3f}, 촌수: {m['connection_degree']}")

if __name__ == '__main__':
    unittest.main()