import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { AuthContext } from '../user/AuthContext';
import axios from 'axios';

const ITEMS_PER_LOAD = 6;

const F2FListPage = () => {
    const { id: friendUserId } = useParams();
    const { user } = useContext(AuthContext);
    const currentUserId = user?.userId;

    const [friends, setFriends] = useState([]);
    const [visibleFriendsCount, setVisibleFriendsCount] = useState(ITEMS_PER_LOAD);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchFriendsList = () => {
      if (!currentUserId || !friendUserId) return;

      setLoading(true);
      axios.get(`http://localhost:8080/api/friends/f2f-statuslist/${friendUserId}`, {
        params: { viewerId: currentUserId }
      })
        .then(response => {
          setFriends(response.data);
          setLoading(false);
        })
        .catch(err => {
          setError(err);
          setLoading(false);
        });
    };

    useEffect(() => {
      fetchFriendsList();
    }, [currentUserId, friendUserId]);

    const sendFriendRequest = (e, targetUserId) => {
      e.stopPropagation(); // 이벤트 버블링 중단

      if (!currentUserId) {
        alert("로그인이 필요합니다.");
        return;
      }

      axios.post('http://memory-x.duckdns.org:8080/api/friends/request', null, {
        params: {
          requesterId: currentUserId,
          targetId: targetUserId
        }
      })
      .then(() => {
        alert("친구 요청이 전송되었습니다.");
        // 상태를 즉시 업데이트하여 UI 변경
        setFriends(prevFriends => 
          prevFriends.map(friend => 
            friend.userId === targetUserId ? { ...friend, status: 'PENDING' } : friend
          )
        );
      })
      .catch(err => {
        console.error("친구 요청 실패:", err);
        // 서버에서 보낸 구체적인 에러 메시지 표시
        const errorMessage = err.response?.data || "친구 요청에 실패했습니다.";
        alert(errorMessage);
      });
    };

    const handleLoadMore = () => {
      setVisibleFriendsCount(prevCount => prevCount + ITEMS_PER_LOAD);
    };

    const allFriendsLoaded = visibleFriendsCount >= friends.length;

    return (
      <MainLayout>
        <hr className="border-gray-300 mb-1" />
      <div className="font-singleday min-h-screen bg-[#f0f9ff] p-4">
        <h1 className="text-3xl tracking-widest text-outline text-center mb-6">
          친구 목록
        </h1>

        {loading ? (<div className="text-center text-gray-500 text-lg mt-10">친구 목록을 불러오는 중...</div>
        ) : friends.length === 0 ? (
          <div className="text-center text-gray-500 text-lg mt-10">
            등록된 친구가 없어요 ㅠㅠ
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {friends.slice(0, visibleFriendsCount).map(friend => (
                  <div key={friend.userId} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-center p-4" onClick={() => friend.status === "MYSELF" ? navigate("/main/mypage") : navigate(`/main/friendpage/${friend.userId}`)}>                  <div className="relative mb-3">
                    <img
                      src={friend.profileImage}
                      alt="프로필"
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  
                  <span className="font-singleday text-lg font-bold text-gray-800 mb-2">
                    {friend.name}
                  </span>

                  {friend.status === "MYSELF" ? (
                    <button
                    className="bg-gray-400 text-white px-6 py-2 rounded-full text-sm transition mt-auto">나</button>
                  ) : friend.status === "ACCEPTED" ? (
                    <button
                    className="bg-[#959F9F] text-white px-6 py-2 rounded-full text-sm transition mt-auto">나의 친구</button>)
                  : friend.status === "PENDING" ? (
                    <button
                    className="bg-[#959F9F] text-white px-6 py-2 rounded-full text-sm hover:brightness-110 transition mt-auto">요청 중</button>
                  ) : (
                    <button
                    className="bg-[#56B7CF] text-white px-6 py-2 rounded-full text-sm hover:brightness-110 transition mt-auto"
                    onClick={(e)=> sendFriendRequest(e, friend.userId)}>친구 요청</button>
                  )}
                </div>
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
      </MainLayout>
    );
};

export default F2FListPage;