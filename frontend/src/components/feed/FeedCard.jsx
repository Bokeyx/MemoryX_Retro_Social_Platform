import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaHeart, FaCommentDots, FaShareAlt } from "react-icons/fa";

const FeedCard = ({ feed, currentUserId }) => {
  // `feed.diaryId`가 없으면 댓글 및 좋아요 기능이 제대로 작동하지 않을 수 있으므로 확인
  if (!feed || !feed.diaryId) {
    console.error("FeedCard: feed 객체 또는 feed.diaryId가 유효하지 않습니다.", feed);
    return (
      <div className="bg-[#d2ecfd] rounded-[20px] border border-black p-5 w-full max-w-xl mx-auto text-black shadow-sm font-['Pretendard']">
        <p>피드 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 좋아요 관련 상태
  const [isLiked, setIsLiked] = useState(feed.liked || false); // 초기 좋아요 상태는 feed.liked로 설정
  const [likeCnt, setLikeCnt] = useState(feed.likeCnt || 0); // 초기 좋아요 수는 feed.likeCnt로 설정

  // 좋아요 상태를 불러오는 함수 (useCallback으로 최적화)
  const fetchLikeStatus = useCallback(async () => {
    console.log("FeedCard: fetchLikeStatus called for diaryId:", feed.diaryId, "userId:", currentUserId);
    if (!currentUserId) {
      console.log("FeedCard: currentUserId가 없어 좋아요 상태를 불러오지 않습니다.");
      return;
    }
    try {
      const response = await axios.get(`/api/diary/like/status/${feed.diaryId}/${currentUserId}`);
      console.log("FeedCard: Like status fetched successfully:", response.data);
      setIsLiked(response.data.isLiked);
      setLikeCnt(response.data.likeCnt); // likeCnt도 업데이트
    } catch (error) {
      console.error("FeedCard: 좋아요 상태 로드 실패:", error);
    }
  }, [feed.diaryId, currentUserId]); // feed.diaryId 또는 currentUserId가 변경될 때마다 함수 재생성

  // 컴포넌트 마운트 시 또는 currentUserId, feed.diaryId 변경 시 좋아요 상태 불러오기
  useEffect(() => {
    fetchLikeStatus();
  }, [fetchLikeStatus]); // fetchLikeStatus가 변경될 때마다 실행

  // 좋아요 토글 핸들러
  const toggleLike = async () => {
    const originalIsLiked = isLiked;
    const originalLikeCnt = likeCnt;
    // UI를 먼저 업데이트하여 즉각적인 피드백 제공
    setIsLiked(prev => !prev);
    setLikeCnt(prev => originalIsLiked ? prev - 1 : prev + 1);

    console.log("FeedCard: 좋아요 토글 요청. diaryId:", feed.diaryId, "isLiked:", !originalIsLiked);
    try {
      const response = await axios.post(`/api/diary/like/${feed.diaryId}`, { userId: currentUserId });
      console.log("FeedCard: 백엔드에 좋아요 상태가 업데이트되었습니다.", response.data);
      setLikeCnt(response.data.likeCnt); // 백엔드에서 받은 likeCnt로 업데이트
    } catch (error) {
      console.error("FeedCard: 좋아요 처리 실패:", error);
      // 에러 발생 시 UI 상태를 원래대로 되돌림
      setIsLiked(originalIsLiked);
      setLikeCnt(originalLikeCnt);
    }
  };

  return (
    <div className="bg-[#d2ecfd] rounded-[20px] border border-black p-5 w-full max-w-xl mx-auto text-black shadow-sm font-['Pretendard']">
      {/* 상단 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <img src={feed.profileImg} alt="프로필" className="w-8 h-8 rounded-md" />
          <div className="text-sm leading-tight">
            <div className="font-semibold">{feed.username}</div>
            <div className="text-[12px]">{feed.title}</div>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="text-[15px] font-bold leading-relaxed whitespace-pre-line mb-4">
        {feed.content}
      </div>

      {/* 메타정보 */}
      <div className="mb-2 space-y-1 text-xs leading-snug">
        <div>작성일자 {feed.date}</div>
        {feed.bgm && <div>BGM - {feed.bgm}</div>}
        {feed.drama && <div>드라마 - {feed.drama}</div>}
        {feed.tags && (
          <div className="text-sm text-[#1d4ed8] font-semibold">
            {feed.tags.map((tag, i) => (
              <span key={i} className="mr-1">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="my-2 border-t border-gray-300" />

      {/* 하단 아이콘 */}
      <div className="flex justify-between text-[13px] text-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 cursor-pointer" onClick={toggleLike}>
            <FaHeart className={isLiked ? "text-red-500" : "text-gray-500"} />
            <span>{likeCnt}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCommentDots /> <span>{feed.comments}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <FaShareAlt /> <span>공유하기</span>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
