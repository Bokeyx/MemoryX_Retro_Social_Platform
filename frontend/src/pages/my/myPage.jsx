import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from './item/calendar';
import MyFeedList from './feed/MyFeedList';
import MyCommentPage from './feed/MyCommentPage';
import MyGuestBookPage from './feed/MyGuestBookPage'
import { AuthContext } from '../user/AuthContext';
import axios from 'axios';
import defaultProfileImage from '../../../public/image/man_profile.png';
import MypageTitle from '../../components/title/mypage-title/MypageTitle';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, updateUserProfile } = useContext(AuthContext);

  console.log("마이페이지 user: ", user)
  const currentUserId = user ? user.userId : "user001";
  const currentUserName = user ? user.name : "memoryx";
  const currentUserProfileImage = user ? user.profileImage : defaultProfileImage;
  const currentUserIntroduction = user ? user.introduction : "자기소개가 없습니다."

  // 방문자 수 상태
  const [todayCount, setTodayCount] = useState(0);
  const [totalVisitCount, setTotalVisitCount] = useState(0);
  // 🚨 방문자 수 로딩/에러 상태는 이름 변경으로 명확화
  const [visitInfoLoading, setVisitInfoLoading] = useState(true);
  const [visitInfoError, setVisitInfoError] = useState(null);

  useEffect(() => {
    const fetchVisitCounts = async () => {
      if (!isLoggedIn || !currentUserId) {
        setVisitInfoLoading(false);
        return;
      }

      try {
        setVisitInfoLoading(true);
        setVisitInfoError(null);
        const response = await axios.get(`/api/visits/${currentUserId}`);
        console.log("data: ", response.data)
        setTodayCount(response.data.todayCount);
        setTotalVisitCount(response.data.totalVisitCount);
      } catch (err) {
        console.error("방문자 수를 가져오는 중 오류 발생:", err);
        // 🚨 에러가 발생해도 전체 페이지를 막지 않고, 에러 상태만 설정합니다.
        // 방문자 수 표시는 0 또는 '--'으로 유지됩니다.
        setVisitInfoError("방문자 정보를 불러오는데 실패했습니다.");
        setTodayCount(0); // 에러 시 기본값 설정
        setTotalVisitCount(0); // 에러 시 기본값 설정
      } finally {
        setVisitInfoLoading(false);
      }
    };
    fetchVisitCounts();
  }, [currentUserId, isLoggedIn]);

  const [currentViewMode, setCurrentViewMode] = useState('grid');
  const [selectedDate, setSelectedDate] = useState(null);
  const [datesWithDiaries, setDatesWithDiaries] = useState([]);

  const handleFriendListclick = () => navigate('/main/mypage/friendlist');
  const handleViewModeChange = (mode) => setCurrentViewMode(mode);

  const handleDateSelect = (date) => {
    if (selectedDate && selectedDate.toDateString() === date.toDateString()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  const handleDatesWithDiariesLoaded = useCallback((dates) => {
    setDatesWithDiaries(dates);
  }, []);

  const handleProfileImageUpload = async (downloadURL) => {
    if (!user || !user.userId) return;
    try {
      const response = await axios.put(`/api/users/${user.userId}/profile-image`, {
        profileImageUrl: downloadURL,
      });
      if (response.status === 200) {
        alert("프로필 이미지가 성공적으로 업데이트되었습니다.");
        updateUserProfile({ profileImage: downloadURL });
      }
    } catch (error) {
      console.error("프로필 이미지 업데이트 실패:", error);
      alert("프로필 이미지 업데이트에 실패했습니다.");
    }
  };

  // 🚨 로그인하지 않은 경우에만 페이지 접근을 막습니다.
  if (!isLoggedIn) {
    // 실무에서는 AuthContext나 라우터 차원에서 리다이렉트 처리하는 것이 더 좋습니다.
    return <div className="p-4 text-center text-red-500">로그인이 필요합니다.</div>;
  }

  // 🚨 return 문을 하나로 통합하여 기본 레이아웃이 항상 렌더링되게 합니다.
  return (
    <div>
      <MypageTitle
        onFriendListClick={handleFriendListclick}
        onViewModeChange={handleViewModeChange}
        className="mb-4 text-center"
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserIntroduction={currentUserIntroduction}
        currentUserProfileImage={currentUserProfileImage}
        onProfileImageUpload={handleProfileImageUpload}
        todayCount={todayCount}
        totalVisitCount={totalVisitCount}
        isLoading={visitInfoLoading}
      />

      <div className="p-5 bg-white rounded-lg">
        {currentViewMode === 'grid' ? (
          <div>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              datesWithDiaries={datesWithDiaries}
            />
            {/* MyFeedList 자체의 로딩/에러 처리는 해당 컴포넌트 내에서 관리 */}
            <MyFeedList
              selectedDate={selectedDate}
              onDatesWithDiariesLoaded={handleDatesWithDiariesLoaded}
              currentUserProfileImage={currentUserProfileImage}
            />
          </div>
        ) : (
          // <MyCommentPage />
          <MyGuestBookPage />
        )}

        {/* 🚨 에러 발생 시, 콘텐츠 영역 하단에 에러 메시지를 표시 */}
        {visitInfoError && (
          <div className="p-4 mt-4 text-center text-red-500 bg-red-100 rounded-lg">
            {visitInfoError}
          </div>
        )}
      </div>
      {/* Footer는 MainLayout에서 관리하므로 제거합니다. */}
    </div>
  );
};

export default MyPage;