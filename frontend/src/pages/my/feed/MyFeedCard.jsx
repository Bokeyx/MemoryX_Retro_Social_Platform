import React, { useState, useEffect, useCallback } from "react";
import { FaHeart, FaCommentDots, FaTrash } from "react-icons/fa";
import axios from "axios";

import styles from '../../../components/feed/UserFeedCard.module.css';

const MyFeedCard = ({ feed, onDelete, currentUserId }) => {
  if (!feed || !feed.diaryId) {
    console.error("MyFeedCard: feed 객체 또는 feed.diaryId가 유효하지 않습니다.", feed);
    return (
      <div className={styles.card}>
        <p>피드 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const isAuthor = currentUserId && feed.userId === currentUserId;

  // 댓글 관련 상태
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [comments, setComments] = useState([]);

  const [isLiked, setIsLiked] = useState(feed.liked || false);
  const [likeCnt, setLikeCnt] = useState(() => {
    console.log("MyFeedCard: Initial feed.likeCnt:", feed.likeCnt);
    return feed.likeCnt || 0;
  });

  const fetchComments = useCallback(async () => {
    console.log("MyFeedCard: fetchComments called for diaryId:", feed.diaryId);
    try {
      const response = await axios.get(`/api/comment/diary/${feed.diaryId}`);
      console.log("MyFeedCard: Comments fetched successfully:", response.data);
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("MyFeedCard: 댓글 로드 실패:", error);
      setComments([]);
    }
  }, [feed.diaryId]);

  const fetchLikeStatus = useCallback(async () => {
    console.log("MyFeedCard: fetchLikeStatus called for diaryId:", feed.diaryId, "userId:", currentUserId);
    if (!currentUserId) {
      console.log("MyFeedCard: currentUserId가 없어 좋아요 상태를 불러오지 않습니다.");
      return;
    }
    try {
      const response = await axios.get(`/api/diary/like/status/${feed.diaryId}/${currentUserId}`);
      console.log("MyFeedCard: Like status fetched successfully:", response.data);
      setIsLiked(response.data.isLiked);
      setLikeCnt(response.data.likeCnt);
    } catch (error) {
      console.error("MyFeedCard: 좋아요 상태 로드 실패:", error);
    }
  }, [feed.diaryId, currentUserId]);

  // 컴포넌트 마운트 시 또는 currentUserId, feed.diaryId 변경 시 좋아요 상태 불러오기
  useEffect(() => {
    fetchLikeStatus();
    fetchComments(); // 컴포넌트 마운트 시 댓글 데이터도 불러오기
  }, [fetchLikeStatus, fetchComments]);

  // showComments 상태가 true가 될 때 댓글 불러오기 (기존 로직 유지, 필요시)
  useEffect(() => {
    if (showComments) {
      // fetchComments(); // 이미 위에서 불러오므로 중복 호출 방지
    }
  }, [showComments]);

  // 다이어리 삭제 핸들러
  const handleDeleteClick = () => {
    console.log("MyFeedCard: 다이어리 삭제 요청. ID:", feed.diaryId);
    if (window.confirm("정말 이 다이어리를 삭제하시겠습니까?")) {
      onDelete(feed.diaryId);
    } else {
      console.log("MyFeedCard: 다이어리 삭제 취소됨.");
    }
  };

  // 댓글 섹션 토글 핸들러
  const toggleComments = () => {
    console.log("MyFeedCard: toggleComments called. Current showComments:", showComments);
    setShowComments(prev => !prev);
  };

  // 새 댓글 입력 변경 핸들러
  const handleCommentChange = (e) => {
    setNewCommentText(e.target.value);
  };

  // 댓글 제출 핸들러
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    console.log("MyFeedCard: 새로운 댓글 제출. 페이로드:", { contentId: feed.diaryId, content: newCommentText.trim(), userId: currentUserId });
    try {
      const payload = {
        contentId: feed.diaryId,
        content: newCommentText.trim(),
        userId: currentUserId,
      };
      await axios.post("/api/comment/diary/create", payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setNewCommentText('');
      console.log("MyFeedCard: 댓글이 성공적으로 작성되었습니다. 댓글 목록을 새로고침합니다...");
      await fetchComments();
      setShowComments(true);
    } catch (error) {
      console.error("MyFeedCard: 댓글 작성 실패:", error);
    }
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = async (commentId) => {
    console.log("MyFeedCard: 댓글 삭제 요청. ID:", commentId, "by userId:", currentUserId);
    if (window.confirm("정말 이 댓글을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`api/comment/diary/delete/${commentId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          data: { userId: currentUserId }
        });
        console.log("MyFeedCard: 댓글이 성공적으로 삭제되었습니다. 댓글 목록을 새로고침합니다...");
        await fetchComments();
      } catch (error) {
        console.error("MyFeedCard: 댓글 삭제 실패:", error);
      }
    } else {
      console.log("MyFeedCard: 댓글 삭제 취소됨.");
    }
  };

  // 좋아요 토글 핸들러
  const toggleLike = async () => {
    const originalIsLiked = isLiked;
    const originalLikeCnt = likeCnt;
    console.log("MyFeedCard: toggleLike - Before UI update. originalIsLiked:", originalIsLiked, "originalLikeCnt:", originalLikeCnt);
    setIsLiked(prev => !prev);
    setLikeCnt(prev => {
      const newLikeCnt = originalIsLiked ? prev - 1 : prev + 1;
      console.log("MyFeedCard: toggleLike - After UI update. newLikeCnt:", newLikeCnt);
      return newLikeCnt;
    });

    console.log("MyFeedCard: 좋아요 토글 요청. diaryId:", feed.diaryId, "isLiked:", !originalIsLiked);
    try {
      const response = await axios.post(`/api/diary/like/${feed.diaryId}`, { userId: currentUserId });
      console.log("MyFeedCard: 백엔드에 좋아요 상태가 업데이트되었습니다.", response.data);
      setLikeCnt(response.data.likeCnt);
    } catch (error) {
      console.error("MyFeedCard: 좋아요 처리 실패:", error);
      // 에러 발생 시 UI 상태를 원래대로 되돌림
      setIsLiked(originalIsLiked);
      setLikeCnt(originalLikeCnt);
    }
  };

  const emotionMap = {
    '긍정': '긍정😊',
    '부정': '부정😢',
    '중립': '중립😗',
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          <img
            src={feed.userProfileImage || `https://placehold.co/48x48/E2E8F0/A0AEC0?text=${feed.userName}`}
            alt="프로필"
            className={styles.profileImg}
          />
          <div className={styles.authorText}>
            <div className={styles.authorName}>{feed.userName}</div>
            <div className={styles.emotionLabel}>
              {emotionMap[feed.emotionLabel] || '분석 결과가 없어요😎'}
            </div>
          </div>
        </div>
        {isAuthor && (
          <button
            onClick={handleDeleteClick}
            className={styles.deleteButton}
          >
            <FaTrash className="inline-block mr-1" /> 삭제
          </button>
        )}
      </div>

      <div className={styles.retroText}>
        {feed.retroText}
      </div>

      <div className="mb-2 space-y-1 text-xs leading-snug">
        <div>작성일자 {feed.createdAt}</div>
        {feed.recoSongTitle && <div className={styles.recommendation}>BGM - {feed.recoSongTitle}</div>}
        {feed.recoContentTitle && <div className={styles.recommendation}>콘텐츠 - {feed.recoContentTitle}</div>}
        {feed.tags && (
          <div className="text-sm text-[#1d4ed8] font-semibold">
            {feed.tags.map((tag, i) => (
              <span key={i} className="mr-1">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.divider} />

      <div className={styles.actions}>
        <div className={styles.actionItem} onClick={toggleLike}>
          <FaHeart className={isLiked ? styles.likeIconLiked : styles.likeIcon} />
          <span>{likeCnt}</span>
        </div>
        <div className={styles.actionItem} onClick={toggleComments}>
          <FaCommentDots /> <span>{comments.length}</span>
        </div>
      </div>
      {showComments && (
        <div className={styles.commentsSection}>
          <h4 className="text-sm font-bold mb-2">댓글</h4>
          {comments.length === 0 ? (
            <p className={styles.noComments}>아직 댓글이 없습니다.</p>
          ) : (
            <div className={styles.commentsListWrapper}>
              <div className={styles.commentsList}>
                {comments.map(comment => (
                  <div key={comment.commentId} className={styles.comment}>
                    <div>
                      <span className={styles.commentAuthor}>{comment.userName}:</span> {comment.content}
                      <span className={styles.commentTimestamp}>{comment.createdAt}</span>
                    </div>
                    {currentUserId === comment.commentUser && (
                      <button onClick={() => handleDeleteComment(comment.commentId)} className={styles.deleteButton}>
                        삭제
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <input
              type="text"
              value={newCommentText}
              onChange={handleCommentChange}
              placeholder="댓글을 입력하세요..."
              className={styles.commentInput}
            />
            <button
              type="submit"
              className={styles.submitButton}
            >
              등록
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyFeedCard;