import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import NewsFeedCard from "./NewsFeedCard";
import UserFeedCard from "./UserFeedCard";
import FeedButton from "./FeedButton";
import SkeletonCard from "./SkeletonCard";
import { AuthContext } from "../../pages/user/AuthContext";

// 새로고침 아이콘
const RefreshIcon = () => (
    <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const FeedList = () => {
    const { user } = useContext(AuthContext);
    
    const [visibleCount, setVisibleCount] = useState(5);
    const [feedData, setFeedData] = useState([]);
    const [todayNews, setTodayNews] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const userID = user ? user.userId : null;

    // fetchAllData 함수를 useCallback으로 감싸고, 중복 정의된 부분을 수정
    const fetchAllData = useCallback(async () => {
        if (!userID) {
            setIsLoading(false);
            return;
        }
        // 첫 로딩이 아닐 때만 새로고침 상태로 설정
        if (!isLoading) setIsRefreshing(true);

        const FEED_API_URL = `/api/diary/feed/${userID}`;
        const NEWS_API_URL = `/api/news/latest`;

        try {
            // Promise.all을 사용하여 두 API를 동시에(병렬로) 요청
            const [newsResponse, userResponse] = await Promise.all([
                axios.get(NEWS_API_URL),
                axios.get(FEED_API_URL),
            ]);
            setTodayNews(newsResponse.data);
            setFeedData(userResponse.data);
        } catch (error) {
            console.error("피드 또는 뉴스 데이터를 불러오는 데 실패했습니다.", error);
            // 에러 발생 시에도 로딩 상태를 해제해야 함
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            console.log(user)
        }
    }, [userID, isLoading]); // userID와 isLoading을 의존성 배열에 추가

    useEffect(() => {
        // 컴포넌트 마운트 시 초기 데이터 로드
        fetchAllData();
    }, [fetchAllData]); // fetchAllData가 변경될 때마다 다시 실행 (userID 변경 시)

    // 당겨서 새로고침 (Pull-to-Refresh) 로직
    useEffect(() => {
        let touchStartY = 0;
        const handleTouchStart = (e) => {
            // 스크롤이 맨 위에 있을 때만 시작
            if (window.scrollY === 0) {
                touchStartY = e.touches[0].clientY;
            }
        };
        const handleTouchMove = (e) => {
            if (touchStartY === 0) return; // 터치 시작점이 없으면 무시

            const currentY = e.touches[0].clientY;
            const pullDistance = currentY - touchStartY;

            // 충분히 당겨졌고, 새로고침 중이 아닐 때
            if (pullDistance > 50 && !isRefreshing) {
                touchStartY = 0; // 초기화
                fetchAllData(); // 데이터 새로고침
            }
        };
        const handleTouchEnd = () => {
            touchStartY = 0; // 터치 끝날 때 초기화
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isRefreshing, fetchAllData]); // isRefreshing과 fetchAllData를 의존성 배열에 추가

    // '좋아요' 상태를 변경하는 함수 (제거)

    // '더 보기' 버튼 클릭 시
    const handleLoadMore = () => setVisibleCount((prev) => prev + 5);

    // 로딩 중일 때 스켈레톤 UI 표시
    if (isLoading) {
        return (
            <div className="flex flex-col items-center mt-4 space-y-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

    // 데이터가 없을 때 메시지 표시
    if (!todayNews && feedData.length === 0) {
        return (
            <div className="text-center mt-10 text-gray-500">
                <p>피드에 표시할 내용이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center mt-4 space-y-6">
            {/* 새로고침 중일 때 아이콘 표시 */}
            {isRefreshing && <div className="py-3"><RefreshIcon /></div>}
            {/* 오늘의 뉴스 카드 */}
            {todayNews && <NewsFeedCard key={todayNews.diaryId || 'news-feed'} feed={todayNews} />}
            {/* 사용자 피드 카드 목록 */}
            {feedData.slice(0, visibleCount).map((feed) =>
                <UserFeedCard
                    key={feed.diaryId}
                    feed={feed}
                    currentUserId={userID}
                />
            )}
            {/* 더 보기 버튼 */}
            {visibleCount < feedData.length && <FeedButton onClick={handleLoadMore} />}
        </div>
    );
};

export default FeedList;
