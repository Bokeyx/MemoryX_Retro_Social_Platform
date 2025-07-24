import React, { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { AuthContext } from "../../pages/user/AuthContext";

/**
 * 좌/우 스크롤을 위한 화살표 버튼 컴포넌트
 */
const ArrowButton = ({ direction = "left", onClick, disabled }) => {
  const baseStyle = "w-0 h-0 border-y-[10px] border-y-transparent";
  const directionStyle = direction === "left" 
    ? "border-r-[14px] border-r-gray-400" 
    : "border-l-[14px] border-l-gray-400";
  const disabledStyle = disabled ? "opacity-30 cursor-not-allowed" : "hover:opacity-80";

  return (
    <button onClick={onClick} disabled={disabled} className={`flex items-center ${disabledStyle}`}>
      <div className={`${baseStyle} ${directionStyle}`} />
    </button>
  );
};

/**
 * 개별 친구 정보를 표시하는 카드 컴포넌트
 */
const FriendCard = ({ friend, onClick }) => {
  const getHighlightClass = (f) => {
    if (!f.highlight) return "border-blue-300 bg-white";
    return f.gender === "female" 
      ? "border-pink-400 bg-pink-100" 
      : "border-blue-400 bg-blue-100";
  };

  return (
    <div 
      className="flex flex-col items-center text-sm cursor-pointer w-20" // 너비를 고정하여 레이아웃 안정성 확보
      onClick={() => onClick(friend.friendMatchedUser)}
    >
      <div
        className={`w-16 h-16 rounded-lg border-4 shadow-md flex items-center justify-center ${getHighlightClass(friend)}`}
      >
        {friend.userProfileImage ? (
          <img
            src={friend.userProfileImage}
            alt={friend.userName}
            className="object-cover w-12 h-12"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold">
            {friend.userName ? friend.userName.charAt(0) : '?'} 
          </div>
        )}
      </div>
      <span className="mt-1 text-[13px] text-gray-700 truncate w-full text-center">{friend.userName}</span>
    </div>
  );
};


// --- 메인 친구 리스트 컴포넌트 ---

const FriendList = () => {
  // --- 상태(State) 및 훅(Hooks) 정의 ---
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startIndex, setStartIndex] = useState(0);

  const VISIBLE_COUNT = 3;
  const userId = user ? user.userId : null;

  // --- 데이터 로딩 ---
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchFriendsList = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://memory-x.duckdns.org:8080/api/friends/user/${userId}`);
        setFriends(response.data);
      } catch (err) {
        console.error("친구 목록 로드 실패:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsList();
  }, [userId]);

  // --- 데이터 가공 (Memoization) ---
  const sortedFriends = useMemo(() => {
    if (!friends || friends.length === 0) return [];
    return [...friends].sort((a, b) => new Date(b.lastFeedDate) - new Date(a.lastFeedDate));
  }, [friends]);

  // 현재 화면에 보여줄 친구 목록만 잘라냅니다.
  const visibleFriends = sortedFriends.slice(startIndex, startIndex + VISIBLE_COUNT);

  // --- 이벤트 핸들러 ---
  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(prev + 1, sortedFriends.length - VISIBLE_COUNT));
  };

  const handleFriendClick = (friendId) => {
    navigate(`/main/friendpage/${friendId}`);
  };

  // --- 렌더링 로직 ---
  if (loading) {
    return <div className="font-singleday text-center py-10 text-gray-600">친구 피드 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="font-singleday text-center py-10 text-red-500">오류가 발생했습니다. 잠시 후 다시 시도해주세요.</div>;
  }

  if (sortedFriends.length === 0) {
    return <div className="font-singleday text-center py-10 text-gray-500">아직 친구가 없어요 ㅠㅠ</div>;
  }

  return (
    <div className="font-singleday flex justify-center my-4">
      <div className="flex items-center space-x-3">
        {/* 왼쪽 화살표 */}
        <div className="flex items-center h-24">
          <ArrowButton 
            direction="left" 
            onClick={handlePrev} 
            disabled={startIndex === 0} 
          />
        </div>

        {/* 친구 카드 리스트 */}
        <div className="flex space-x-4 min-h-[6rem] items-center">
          {visibleFriends.map((friend) => (
            <FriendCard 
              key={friend.friendsId} 
              friend={friend} 
              onClick={handleFriendClick} 
            />
          ))}
        </div>

        {/* 오른쪽 화살표 */}
        <div className="flex items-center h-24">
          <ArrowButton
            direction="right"
            onClick={handleNext}
            disabled={startIndex + VISIBLE_COUNT >= sortedFriends.length}
          />
        </div>
      </div>
    </div>
  );
};

export default FriendList;
