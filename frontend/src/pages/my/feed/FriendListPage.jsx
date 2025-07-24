// src/pages/my/feed/FriendListPage.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../user/AuthContext';

const ITEMS_PER_LOAD = 6; // 한 번에 불러올 친구 수

const FriendListPage = () => {
  const { user } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [visibleFriendsCount, setVisibleFriendsCount] = useState(ITEMS_PER_LOAD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log("userId : ", user)

  useEffect(() => {
    if (user && user.userId) {
      setLoading(true);
      axios.get(`http://memory-x.duckdns.org:8080/api/friends/listdetail/${user.userId}`)
        .then(response => {
          console.log("response.data : ", response.data)
          setFriends(response.data);
          setLoading(false);
        })
        .catch(err => {
          setError(err);
          setLoading(false);
          console.error("Failed to fetch friends list:", err);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
  }, [friends]);

  const handleLoadMore = () => {
    setVisibleFriendsCount(prevCount => prevCount + ITEMS_PER_LOAD);
  };

  const allFriendsLoaded = visibleFriendsCount >= sortedFriends.length;

  if (loading) {
    return <div className="text-center py-10">친구 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">친구 목록을 불러오는데 실패했습니다.</div>;
  }

  return (
    <div className="font-singleday min-h-screen bg-[#f0f9ff] p-4">
      <h1 className="text-3xl tracking-widest text-outline text-center mb-6">
        나의 친구 목록
      </h1>

      {sortedFriends.length === 0 ? (
        <div className="text-center text-gray-500 text-lg mt-10">
          등록된 친구가 없어요 ㅠㅠ
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {sortedFriends.slice(0, visibleFriendsCount).map(friend => (
              <Link to={`/main/friendpage/${friend.userId}`} key={friend.userId} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-center p-4 no-underline">
                <div className="relative mb-3">
                  <img
                    src={friend.profileImage}
                    alt="프로필"
                    className="w-20 h-20 object-contain"
                  />
                </div>
                
                <span className="font-singleday text-lg font-bold text-gray-800 mb-2">
                  {friend.name}
                </span>

                <button
                  className="bg-[#56B7CF] text-white px-6 py-2 rounded-full text-sm hover:brightness-110 transition mt-auto"
                  onClick={(e) => e.preventDefault()} // Link 이동을 막기 위해
                >
                  {friend.status === 'PENDING' ? '요청 중' : '나의 친구'}
                </button>
              </Link>
            ))}
          </div>

          {!allFriendsLoaded && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-bold hover:bg-gray-300 transition-colors"
              >
                더보기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FriendListPage;