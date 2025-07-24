import React, { useState, useEffect, useContext } from "react"; // useContext 훅 임포트
import axios from "axios"; // backend 연결
import MyFeedCard from "./MyFeedCard";
import MyFeedButton from "./MyFeedButton";
import NullImage from "@public/icon/man.png"; // 실제 경로에 따라 수정 필요할 수 있음
import { AuthContext } from "../../user/AuthContext";

// 한 페이지당 보여줄 일기 개수 (상수 선언)
const ITEMS_PER_PAGE = 5;

// 날짜 문자열을 'YYYY.MM.DD' 형식으로 포맷하는 헬퍼 함수
const formatJavaDateToYYYYMMDD = (dateString) => {
  try {
    // '2025.07.08' 또는 '2025-07-08 11:42:58' 등 다양한 형태를 처리
    const dateParts = dateString.split(/[.\- :]/); // '.', '-', ' ', ':' 기준으로 분리
    let year = parseInt(dateParts[0]);
    let month = parseInt(dateParts[1]) - 1; // 월은 0부터 시작
    let day = parseInt(dateParts[2]);

    const date = new Date(year, month, day);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0-11이므로 +1
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  } catch (e) {
    console.error("날짜 포맷팅 오류:", dateString, e);
    return dateString; // 오류 발생 시 원본 문자열 반환
  }
};

// MyFeedList 컴포넌트에 selectedDate와 onDatesWithDiariesLoaded prop을 추가합니다.
const MyFeedList = ({ selectedDate, onDatesWithDiariesLoaded, currentUserProfileImage}) => {
  // AuthContext에서 user 객체와 isLoggedIn 상태를 가져옵니다.
  const { user, isLoggedIn } = useContext(AuthContext);
  // 로그인된 사용자 ID를 user 객체에서 추출합니다.
  const currentUserId = user ? user.userId : null;

  const [allFeeds, setAllFeeds] = useState([]); // 모든 일기 데이터를 저장할 상태
  const [displayedFeeds, setDisplayedFeeds] = useState([]); // 현재 화면에 표시될 필터링된 일기 데이터
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [visibleCount, setVisibleCount] = useState(5); // 초기 표시 개수

  // 일기 데이터 불러오기 (selectedDate가 변경될 때마다 재실행)
  useEffect(() => {
    const fetchFeedDiaries = async () => {
      // 로그인되지 않았거나 userId가 없으면 API 호출하지 않음
      if (!isLoggedIn || !currentUserId) {
        console.log("🚨 MyFeedList: 로그인되지 않았거나 currentUserId가 유효하지 않습니다:", currentUserId);
        setLoading(false);
        return;
      }

      try {
        setLoading(true); // 데이터 로딩 시작
        setError(null); // 에러 초기화

        console.log("✅✅ MyFeedList: Axios 요청 직전 currentUserId:", currentUserId);
        console.log("✅✅ MyFeedList: Axios 요청 URL 구성:", `/api/diary/user/${currentUserId}`);

        // 백엔드 API 엔드포인트 호출 (Vite 프록시 설정 덕분에 상대 경로 사용)
        const response = await axios.get(`/api/diary/user/${currentUserId}`);

        // MyFeedCard가 예상하는 feed prop 구조에 맞춰 데이터 변환
        const transformedFeeds = response.data.map(diary => {
          console.log("받은 다이어리 데이터:", diary); // 백엔드에서 받은 데이터 확인용 로그
          return {
            diaryId: diary.diaryId, // MyFeedCard에서 예상하는 'diaryId'
            userName: diary.userName || diary.diaryUser || "알 수 없는 사용자", // 'username' 대신 'userName'
            userProfileImage: currentUserProfileImage || NullImage, // 'profileImg' 대신 'userProfileImage'
            emotionLabel: diary.emotionLabel || "감정상태 알수없음", // 'emotion' 대신 'emotionLabel'
            retroText: diary.retroText, // 'content' 대신 'retroText'
            createdAt: formatJavaDateToYYYYMMDD(diary.createdAt), // 'date' 대신 'createdAt'
            recoSong: diary.recoSong, // 'bgm' 대신 'recoSong'
            recoContent: diary.recoContent, // 'drama' 대신 'recoContent'
            recoSongTitle: diary.recoSongTitle,
            recoContentTitle: diary.recoContentTitle,
            likeCnt: diary.likeCnt || 0, // 'likes' 대신 'likeCnt'
            liked: diary.liked || false, // MyFeedCard에서 예상하는 'liked' (백엔드에서 제공되지 않으면 false)
            tags: [], // 필요에 따라 백엔드에서 태그 데이터 가져와서 채워야 함
            userId: diary.diaryUser // MyFeedCard에서 isAuthor 체크에 사용하는 'userId'
          };
        });

        setAllFeeds(transformedFeeds); // 모든 일기 저장

        // 일기가 있는 날짜들 추출하여 부모 컴포넌트로 전달
        const dates = transformedFeeds.map(feed => feed.createdAt); // 'yyyy.MM.dd' 형식
        if (onDatesWithDiariesLoaded) {
          onDatesWithDiariesLoaded([...new Set(dates)]); // 중복 제거 후 전달
        }

      } catch (err) {
        console.error("피드 다이어리 데이터를 가져오는 중 오류 발생:", err);
        setError("피드 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    // currentUserId가 유효할 때만 데이터를 가져오도록 합니다.
    if (currentUserId) {
      fetchFeedDiaries();
    }
  }, [currentUserId, isLoggedIn, onDatesWithDiariesLoaded]); // 의존성 배열에 onDatesWithDiariesLoaded 추가

  // selectedDate 또는 allFeeds가 변경될 때마다 표시될 일기 목록 필터링
  useEffect(() => {
    if (selectedDate) {
      // 선택된 날짜와 일기 작성일이 일치하는 일기만 필터링
      const formattedSelectedDate = selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, ''); // 'YYYY.MM.DD' 형식으로 변환 (예: 2025.07.08)
      console.log("필터링할 날짜:", formattedSelectedDate);
      const filtered = allFeeds.filter(feed => feed.createdAt === formattedSelectedDate);
      setDisplayedFeeds(filtered);
      setVisibleCount(ITEMS_PER_PAGE); // 필터링 후 다시 처음부터 보이도록
    } else {
      // 선택된 날짜가 없으면 모든 일기 표시
      setDisplayedFeeds(allFeeds);
      setVisibleCount(ITEMS_PER_PAGE); // 모든 일기 표시 시 다시 처음부터 보이도록
    }
  }, [selectedDate, allFeeds]);


  // 다이어리 삭제 핸들러
  const handleDeleteDiary = async (diaryIdToDelete) => {
    try {
      const response = await axios.delete(`/api/diary/delete/${diaryIdToDelete}`);

      if (response.status === 204) {
        setAllFeeds(prevFeeds => prevFeeds.filter(feed => feed.diaryId !== diaryIdToDelete)); // allFeeds에서 삭제
        console.log(`다이어리 (ID: ${diaryIdToDelete}) 삭제 성공!`);
      } else {
        console.warn(`다이어리 삭제 요청 성공했으나 예상치 못한 상태 코드: ${response.status}`);
      }
    } catch (err) {
      console.error(`다이어리 (ID: ${diaryIdToDelete}) 삭제 중 오류 발생:`, err);
      setError("다이어리 삭제에 실패했습니다.");
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // 로그인되지 않았거나 사용자 ID가 없을 경우 로딩/에러 메시지 표시
  if (!isLoggedIn || !currentUserId) {
    return <div className="text-center p-4 text-red-500">로그인이 필요합니다.</div>;
  }

  if (loading) {
    return <div className="text-center p-4">피드 로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center mt-3 space-y-4">
      {displayedFeeds.length === 0 && !loading && !error ? (
        <div className="text-center p-4 text-gray-500">
          {selectedDate ? `${selectedDate.toLocaleDateString()}에 작성된 일기가 없습니다.` : "아직 피드 다이어리가 없습니다."}
        </div>
      ) : (
        displayedFeeds.slice(0, visibleCount).map((feed) => {
          console.log("✅ 피드 감정:", feed.emotionLabel); // 'emotion' 대신 'emotionLabel'
          return (
            <MyFeedCard
              key={`${feed.diaryId}-${feed.userName}`} // key 속성도 diaryId와 userName으로 변경
              feed={feed}
              onDelete={handleDeleteDiary}
              currentUserId={currentUserId}
            />
          );
        })
      )}
      {visibleCount < displayedFeeds.length && <MyFeedButton onClick={handleLoadMore} />}
    </div>
  );
};

export default MyFeedList;
