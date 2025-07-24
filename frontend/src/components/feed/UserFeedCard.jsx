import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaHeart, FaCommentDots } from "react-icons/fa";
import { AuthContext } from "../../pages/user/AuthContext";
import styles from './UserFeedCard.module.css';

const UserFeedCard = ({ feed }) => {
  const { user } = useContext(AuthContext);
  const CURRENT_USER_ID = user ? user.userId : null;

  // 댓글 관련 state는 자체적으로 관리
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // 댓글 데이터 로딩 함수
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
  
  // 좋아요 관련 상태
  const [isLiked, setIsLiked] = useState(feed.liked || false); // 초기 좋아요 상태는 feed.liked로 설정
  const [likeCnt, setLikeCnt] = useState(feed.likeCnt || 0); // 초기 좋아요 수는 feed.likeCnt로 설정

  // 좋아요 상태를 불러오는 함수 (useCallback으로 최적화)
  const fetchLikeStatus = useCallback(async () => {
    console.log("UserFeedCard: fetchLikeStatus called for diaryId:", feed.diaryId, "userId:", CURRENT_USER_ID);
    if (!CURRENT_USER_ID) {
      console.log("UserFeedCard: CURRENT_USER_ID가 없어 좋아요 상태를 불러오지 않습니다.");
      return;
    }
    try {
      const response = await axios.get(`/api/diary/like/status/${feed.diaryId}/${CURRENT_USER_ID}`);
      console.log("UserFeedCard: Like status fetched successfully:", response.data);
      setIsLiked(response.data.isLiked);
      setLikeCnt(response.data.likeCnt); // likeCnt도 업데이트
    } catch (error) {
      console.error("UserFeedCard: 좋아요 상태 로드 실패:", error);
    }
  }, [feed.diaryId, CURRENT_USER_ID]); // feed.diaryId 또는 CURRENT_USER_ID가 변경될 때마다 함수 재생성

  // 컴포넌트 마운트 시 또는 CURRENT_USER_ID, feed.diaryId 변경 시 좋아요 상태 불러오기
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

    console.log("UserFeedCard: 좋아요 토글 요청. diaryId:", feed.diaryId, "isLiked:", !originalIsLiked);
    try {
      const response = await axios.post(`/api/diary/like/${feed.diaryId}`, { userId: CURRENT_USER_ID });
      console.log("UserFeedCard: 백엔드에 좋아요 상태가 업데이트되었습니다.", response.data);
      setLikeCnt(response.data.likeCnt); // 백엔드에서 받은 likeCnt로 업데이트
    } catch (error) {
      console.error("UserFeedCard: 좋아요 처리 실패:", error);
      // 에러 발생 시 UI 상태를 원래대로 되돌림
      setIsLiked(originalIsLiked);
      setLikeCnt(originalLikeCnt);
    }
  };

  // '좋아요' 버튼 클릭 시 부모가 내려준 함수 호출
  const handleLikeClick = () => toggleLike();

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
            <div className={styles.flexbox}>
              <div className={styles.authorName}>{feed.userName}</div>
              <div className={styles.createdAt}>{feed.createdAt}</div>
            </div>
            <div className={styles.emotionLabel}>
              {emotionMap[feed.emotionLabel] || '분석 결과가 없어요😎'}
          </div>
          </div>
        </div>
      </div>

      <div className={styles.retroText}>{feed.retroText}</div>
      {feed.bgm && <div className={styles.recommendation}>BGM - {feed.recoSong}</div>}
      {feed.drama && <div className={styles.recommendation}>콘텐츠 - {feed.recoContent}</div>}
      <div className={styles.divider} />

      <div className={styles.actions}>
        <div className={styles.actionItem} onClick={handleLikeClick}>
          <FaHeart className={isLiked ? styles.likeIconLiked : styles.likeIcon} />
          <span>{likeCnt}</span>
        </div>
        <div className={styles.actionItem} onClick={() => setIsExpanded(true)}>
          <FaCommentDots />
          <span>{comments.length}</span>
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

export default UserFeedCard;