import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FriendPageTitle from '@/components/title/friend-title/FriendPageTitle.jsx';
import Footer from '@/components/footer/Footer';
import Calendar from '@/pages/my/item/calendar.jsx';
import FriendFeedList from '@/pages/friend/FriendFeedList.jsx';
import DM from '@/components/dm/DM';
import FriendCommentPage from '@/pages/friend/FriendCommentPage.jsx';
import { AuthContext } from '../user/AuthContext';
import axios from 'axios';

const FriendPage = () => {
  const navigate = useNavigate();
  const { id: friendUserId } = useParams(); // URL 파라미터에서 친구의 userId 가져오기

  const { user: currentUser, isLoggedIn } = useContext(AuthContext);
  const currentUserId = currentUser ? currentUser.userId : null; 
 
  const [friendInfo, setFriendInfo] = useState(null); 
  const [friendStatus, setFriendStatus] = useState("NONE");

  const [loadingFriendInfo, setLoadingFriendInfo] = useState(true);
  const [errorFriendInfo, setErrorFriendInfo] = useState(null); 

  const [currentViewMode, setCurrentViewMode] = useState('grid'); 

  // 방문자 수 상태 (MyPage와 동일)
  const [todayCount, setTodayCount] = useState(0);
  const [totalVisitCount, setTotalVisitCount] = useState(0);
  const [loadingVisitCounts, setLoadingVisitCounts] = useState(true); // 방문자 수 로딩 상태
  const [errorVisitCounts, setErrorVisitCounts] = useState(null); // 방문자 수 에러 상태

  // 캘린더 및 일기 조회 관련 상태 (MyPage와 동일)
  const [selectedDate, setSelectedDate] = useState(null); // 캘린더에서 선택된 날짜 (Date 객체)
  const [datesWithDiaries, setDatesWithDiaries] = useState([]); // 일기가 있는 날짜들 (문자열 'yyyy.MM.dd' 배열)

  const handleDeleteFriend = async () => {
    try {
      const response = await axios.delete(`http://memory-x.duckdns.org:8080/api/friends/delete`, {
        params: {
          userId1: currentUserId,  
          userId2: friendUserId   
        }
      });
      alert("친구 끊기가 완료되었습니다.");
      setFriendStatus("NONE");
    } catch (error) {
      console.error("친구 끊기 실패:", error);
      alert("친구 끊기 중 오류 발생");
    }
  };

  const handleFriendListClick = () => {
    navigate(`/main/friendpage/${friendUserId}/friendlist`);
  };

  const handleViewModeChange = (mode) => {
    setCurrentViewMode(mode);
    console.log(`현재 뷰 모드: ${mode}`);
  };

  const handleDateSelect = (date) => {
    if (selectedDate && selectedDate.toDateString() === date.toDateString()) {
      setSelectedDate(null);
      console.log("날짜 선택 해제:", date.toLocaleDateString());
    } else {
      setSelectedDate(date);
      console.log("날짜 선택:", date.toLocaleDateString());
    }
  };

  const handleDatesWithDiariesLoaded = useCallback((dates) => {
    setDatesWithDiaries(dates);
    console.log("일기가 있는 날짜들 (FriendPage):", dates);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!friendUserId) {
        setLoadingFriendInfo(false);
        setLoadingVisitCounts(false);
        setErrorFriendInfo({ message: "친구 ID가 URL에 없습니다." });
        return;
      }

      // 1. 친구 정보 가져오기 (MyPage의 본인 정보 가져오기와 유사)
      try {
        setLoadingFriendInfo(true);
        const friendResponse = await axios.get(`/api/users/listdetail/${friendUserId}`);
        setFriendInfo(friendResponse.data);
        if (currentUserId && friendUserId && currentUserId !== friendUserId) {
          const statusResponse = await axios.get(`/api/friends/status`, {
            params: {
              userA: currentUserId,
              userB: friendUserId
            }
          });
          setFriendStatus(statusResponse.data.status);
        }
        console.log("친구 정보 조회 성공:", friendResponse.data);
      } catch (err) {
        console.error("친구 정보를 가져오는 중 오류 발생:", err);
        setErrorFriendInfo({ message: "친구 정보를 불러오는데 실패했습니다." });
        setLoadingFriendInfo(false);
        return; // 친구 정보 로드 실패 시 방문자 수 로직 실행 안 함
      } finally {
        setLoadingFriendInfo(false);
      }

      // 2. 방문자 수 증가 및 조회 (MyPage의 본인 페이지 방문자 수 조회와 유사하지만, 다른 유저의 방문 시 증가 로직 포함)
      try {
        setLoadingVisitCounts(true);
        setErrorVisitCounts(null);

        // 페이지 주인과 방문자가 다를 경우에만 방문자 수 증가 API 호출
        if (currentUserId && friendUserId !== currentUserId) {
          console.log(`방문자 ${currentUserId}가 ${friendUserId} 페이지 방문`);
          await axios.post(`/api/visits/${friendUserId}`, { visitorId: currentUserId });
        } else {
          console.log(`페이지 주인(${friendUserId})이 본인 페이지 방문 또는 비로그인 상태. 방문자 수 증가 스킵.`);
        }

        // 업데이트된 방문자 수 조회
        const visitCountsResponse = await axios.get(`/api/visits/${friendUserId}`);
        setTodayCount(visitCountsResponse.data.todayCount);
        setTotalVisitCount(visitCountsResponse.data.totalVisitCount);
        console.log("방문자 수 조회 성공:", visitCountsResponse.data);

      } catch (err) {
        console.error("방문자 수를 가져오거나 증가시키는 중 오류 발생:", err);
        setErrorVisitCounts({ message: "방문자 정보를 불러오는데 실패했습니다." });
      } finally {
        setLoadingVisitCounts(false);
      }
    };

    fetchData();
  }, [friendUserId, currentUserId]); // friendUserId 또는 currentUserId가 변경될 때마다 실행

  // 로딩, 에러, 친구 정보 없음 상태 처리 (MyPage와 유사)
  if (loadingFriendInfo || loadingVisitCounts) {
    return <div className="text-center py-10">친구 정보 및 방문자 수를 불러오는 중...</div>;
  }
  if (errorFriendInfo) {
    return <div className="text-center py-10 text-red-500">친구 정보 로드 오류: {errorFriendInfo.message}</div>;
  }
  if (errorVisitCounts) {
    return <div className="text-center py-10 text-red-500">방문자 수 로드 오류: {errorVisitCounts.message}</div>;
  }
  if (!friendInfo) {
    return <div className="text-center py-10 text-gray-500">친구 정보를 찾을 수 없습니다.</div>;
  }

  console.log(friendInfo)

  return (
    <div>
      <FriendPageTitle
        handleDeleteFriend={handleDeleteFriend}
        onF2FListClick={handleFriendListClick}
        onViewModeChange={handleViewModeChange}
        className="mb-4 text-center"
        friendName={friendInfo.name}
        friendProfileImg={friendInfo.profileImage}
        friendIntroduction={friendInfo.introduction}
        todayCount={todayCount}
        totalVisitCount={totalVisitCount}
        friendStatus={friendStatus} 
        friendUserId={friendUserId}
        setFriendStatus={setFriendStatus}
        currentUserId={currentUserId}
      />

      <div className="p-5 bg-white rounded-lg">
        {currentViewMode === 'grid' ? (
          <div>
            {/* Calendar에 친구의 userId 전달 */}
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              datesWithDiaries={datesWithDiaries}
              userId={friendUserId}
            />
            {/* FriendFeedList에 친구의 userId 전달 */}
            <FriendFeedList
              userId={friendUserId}
              selectedDate={selectedDate}
              onDatesWithDiariesLoaded={handleDatesWithDiariesLoaded}
            />
          </div>
        ) : (
          // FriendCommentPage에 친구의 userId 전달
          <FriendCommentPage
            userId={friendUserId}
          />
        )}
      </div>
    </div>
  );
};

export default FriendPage;