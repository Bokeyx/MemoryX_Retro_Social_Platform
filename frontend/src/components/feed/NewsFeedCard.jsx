import React, { useContext, useEffect, useState, useCallback } from "react";
import { FaHeart, FaCommentDots, FaShareAlt } from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../../pages/user/AuthContext";
import styles from './NewsFeedCard.module.css';

const NewsFeedCard = ({ feed }) => {
  const { user } = useContext(AuthContext);
  const CURRENT_USER_ID = user ? user.userId : null;

  const [likeCnt, setLikeCnt] = useState(feed.likeCnt || 0);
  const [isLiked, setIsLiked] = useState(false);

  const newsId = feed.diaryId;

  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchCommentsData = useCallback(async () => {
    if (!feed.diaryId) return;
    try {
      const response = await axios.get(`api/comment/diary/${feed.diaryId}`);
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("댓글 데이터 로드 실패", error);
      setComments([]);
    }
  }, [feed.diaryId]);

  useEffect(() => {
    fetchCommentsData();
  }, [fetchCommentsData]);

  const visibleComments = isExpanded ? comments : comments.slice(0, 2);
  const handleCommentChange = (e) => setNewCommentText(e.target.value);

  const fetchLikeStatus = useCallback(async () => {
    if (!CURRENT_USER_ID) {
      setIsLiked(false);
      return;
    }
    try {
      const response = await axios.get(`/api/diary/like/status/${newsId}/${CURRENT_USER_ID}`);
      setIsLiked(response.data.isLiked);
      setLikeCnt(response.data.likeCnt);
    } catch (error) {
      console.error("NewsFeedCard: 좋아요 상태 로드 실패:", error);
      setIsLiked(false);
    }
  }, [newsId, CURRENT_USER_ID, feed.likeCnt]);

  useEffect(() => {
    fetchLikeStatus();
  }, [fetchLikeStatus]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      const payload = {
        contentId: feed.diaryId,
        content: newCommentText.trim(),
        userId: CURRENT_USER_ID,
      };
      await axios.post("/api/comment/diary/create", payload);
      setNewCommentText('');
      setIsExpanded(true);
      await fetchCommentsData(); 
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;
    try {
      const payload = { userId: CURRENT_USER_ID };
      await axios.delete(`api/comment/diary/delete/${commentId}`, { data: payload });
      await fetchCommentsData();
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
  };

  const toggleLike = async () => {
    const originalIsLiked = isLiked;
    const originalLikeCnt = likeCnt;
    setIsLiked(prev => !prev);
    setLikeCnt(prev => originalIsLiked ? prev - 1 : prev + 1);

    try {
      const response = await axios.post(`/api/diary/like/${feed.diaryId}`, { userId: CURRENT_USER_ID });
      setLikeCnt(response.data.likeCnt);
    } catch (error) {
      console.error("NewsFeedCard: 좋아요 처리 실패:", error);
      setIsLiked(originalIsLiked);
      setLikeCnt(originalLikeCnt);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/diary/${feed.diaryId}`;
    console.log("복사할 URL:", shareUrl);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("링크가 복사되었습니다!");
      } catch (error) {
        console.error("클립보드 복사 실패:", error);
        alert("링크 복사에 실패했습니다.");
      }
    } else {
      // Fallback for browsers that do not support the Clipboard API
      // You might want to implement a different copy mechanism here,
      // e.g., creating a temporary textarea and using document.execCommand('copy')
      console.warn("클립보드 API를 지원하지 않는 브라우저입니다. 수동 복사를 시도합니다.");
      alert("자동 복사를 지원하지 않는 브라우저입니다. URL을 직접 복사해주세요: " + shareUrl);
    }
  };

  const topicsArray = feed.retroText
    ? feed.retroText.split(',').map(topic => topic.trim()).filter(topic => topic !== '')
    : [];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.profile}>
          <img src="/icon/newsIcon.png" alt="프로필" className={styles.profileImage} />
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>오늘의 뉴스 봇</div>
            <div className={styles.timestamp}>{feed.createdAt}</div>
          </div>
        </div>
      </div>

      <div className={styles.content}>{feed.originalText}</div>

      {topicsArray.length > 0 && (
        <div className={styles.tags}>
          {topicsArray.map((topic, i) => (
            <span key={i} className={styles.tagItem}>#{topic}</span>
          ))}
        </div>
      )}

      <div className={styles.divider} />

      <div className={styles.actions}>
        <div className={styles.actionButton} onClick={toggleLike}>
          <FaHeart className={isLiked ? styles.likedIcon : styles.unlikedIcon} />
          <span>{likeCnt}</span>
        </div>
        <div className={styles.actionButton} onClick={() => setIsExpanded(true)}>
          <FaCommentDots /> <span>{comments.length}</span>
        </div>
        <div className={styles.actionButton} onClick={handleShare}>
          <FaShareAlt /> <span>공유하기</span>
        </div>
      </div>

      <div className={styles.commentsSection}>
        {comments.length > 0 && (
          <div className={styles.commentsListWrapper}>
            <div className={styles.commentsList}>
              {visibleComments.map(comment => {
                const isMyComment = CURRENT_USER_ID === comment.commentUser;
                return (
                  <div key={comment.commentId} className={styles.comment}>
                    <div>
                      <span className={styles.commentAuthor}>{comment.userName}:</span> {comment.content}
                      <span className={styles.commentTimestamp}>{comment.createdAt}</span>
                    </div>
                    {isMyComment && (
                      <button onClick={() => handleDeleteComment(comment.commentId)} className={styles.deleteButton}>
                        삭제
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          <input
            type="text"
            value={newCommentText}
            onChange={handleCommentChange}
            placeholder="댓글 작성..."
            className={styles.commentInput}
          />
          <button type="submit" className={styles.submitButton}>SEND</button>
        </form>
      </div>
    </div>
  );
};

export default NewsFeedCard;