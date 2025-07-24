import React, { useState, useEffect, useCallback, useContext } from "react";
import axios from 'axios';
import FriendFeedCard from "./FriendFeedCard";
import MyFeedButton from "../my/feed/MyFeedButton";

import NullImage from "@public/icon/man.png";
import { AuthContext } from "../user/AuthContext";

const formatJavaDateToYYYYMMDD = (dateString) => {
  try {
    const dateParts = dateString.split(/[.\- :]/);
    let year = parseInt(dateParts[0]);
    let month = parseInt(dateParts[1]) - 1;
    let day = parseInt(dateParts[2]);

    const date = new Date(year, month, day);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  } catch (e) {
    console.error("날짜 포맷팅 오류:", dateString, e);
    return dateString;
  }
};

const FriendFeedList = ({ userId, selectedDate, onDatesWithDiariesLoaded }) => {
  const {user} = useContext(AuthContext);
  const currentUserId = user?.userId;

  const [diaries, setDiaries] = useState([]); // 일기 데이터 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [visibleCount, setVisibleCount] = useState(5); // 한 번에 보여줄 피드 개수

  // 일기 데이터 불러오기
  useEffect(() => {
    const fetchDiaries = async () => {
      if (!userId) {
        setLoading(false);
        setError({ message: "친구의 사용자 ID가 없습니다." });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let apiUrl = `/api/diary/user/${userId}`; // 기본 API URL (모든 일기)

        // 특정 날짜가 선택되었다면 해당 날짜의 일기만 가져옴
        if (selectedDate) {
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          apiUrl = `/api/diary/user/${userId}/date/${formattedDate}`; // 특정 날짜 API URL
        }

        const response = await axios.get(apiUrl);
        console.log(`친구 (ID: ${userId})의 일기 목록 (${selectedDate ? '특정 날짜' : '전체'}):`, response.data);

        // DiaryDto를 FriendFeedCard가 예상하는 형식으로 매핑
        const fetchedDiaries = response.data.map(diary => ({
          id: diary.diaryId,
                      username: diary.userName || diary.diaryUser || "알 수 없는 사용자", 
                      profileImg: diary.userProfileImage || NullImage, 
                      emotion: diary.emotionLabel || "감정상태 알수없음", 
                      content: diary.retroText,
                      date: formatJavaDateToYYYYMMDD(diary.createdAt), // 'yyyy.MM.dd' 형식
                      bgm: diary.recoSong, 
                      drama: diary.recoContent, 
                      likes: diary.likeCnt || 73, 
                      tags: [], 
                      comments: 0,
                      diaryUser: diary.diaryUser 
        }));
        setDiaries(fetchedDiaries);

        // 일기가 있는 날짜들을 부모 컴포넌트(FriendPage)로 전달
        if (onDatesWithDiariesLoaded) {
          const dates = response.data.map(diary => diary.createdAt); // 'yyyy.MM.dd' 형식 가정
          const uniqueDates = [...new Set(dates)]; // 중복 제거
          onDatesWithDiariesLoaded(uniqueDates);
        }

      } catch (err) {
        console.error(`친구 (ID: ${userId})의 일기를 불러오는 중 오류 발생:`, err);
        setError({ message: "일기를 불러오는데 실패했습니다." });
      } finally {
        setLoading(false);
      }
    };

    fetchDiaries();
  }, [userId, selectedDate, onDatesWithDiariesLoaded]); // userId, selectedDate, onDatesWithDiariesLoaded 변경 시 재실행

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  // 로딩, 에러 상태 UI
  if (loading) {
    return <div className="text-center py-10">일기를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">일기 로드 오류: {error.message}</div>;
  }

  return (
    <div className="flex flex-col items-center mt-3 space-y-4">
      {diaries.length === 0 ? (
        <div className="text-center text-gray-500 text-lg mt-10">
          등록된 일기가 없어요 ㅠㅠ
        </div>
      ) : (
        <>
          {diaries.slice(0, visibleCount).map((diary) => {
            console.log("✅ 피드 제목:", diary.id);
            return(
              <FriendFeedCard
                key={`${diary.id}-${diary.title}`}
                feed={diary}
                currentUserId={currentUserId}/>);
          })}
          {visibleCount < diaries.length && <MyFeedButton onClick={handleLoadMore} />}
        </>
      )}
    </div>
  );
};

export default FriendFeedList;