import React, {useState, useCallback, useEffect} from "react";
import { FaHeart, FaCommentDots, FaShareAlt, FaTrash } from "react-icons/fa";
import axios from "axios";
import styles from './FriendFeedCard.module.css'

const FriendFeedCard = ({ feed, currentUserId }) => {
  console.log(feed)
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [comments, setComments] = useState([]);

  const [isLiked, setIsLiked] = useState(feed.liked || false);
  const [likeCnt, setLikeCnt] = useState(() => {
    console.log("FriendFeedCard: Initial feed.likeCnt:", feed.likeCnt);
    return feed.likeCnt || 0;
  });

  const fetchComments = useCallback(async () => {
    console.log("FriendFeedCard: fetchComments called for id:", feed.id);
    try {
      const response = await axios.get(`/api/comment/diary/${feed.id}`);
      console.log("FriendFeedCard: Comments fetched successfully:", response.data);
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("FriendFeedCard: 댓글 로드 실패:", error);
      setComments([]);
    }
  }, [feed.id]);

  const fetchLikeStatus = useCallback(async () => {
    console.log("FriendFeedCard: fetchLikeStatus called for id:", feed.id, "userId:", currentUserId);
    if (!currentUserId) {
      console.log("FriendFeedCard: currentUserId가 없어 좋아요 상태를 불러오지 않습니다.");
      return;
    }
    try {
      const response = await axios.get(`/api/diary/like/status/${feed.id}/${currentUserId}`);
      console.log("FriendFeedCard: Like status fetched successfully:", response.data);
      setIsLiked(response.data.isLiked);
      setLikeCnt(response.data.likeCnt);
    } catch (error) {
      console.error("FriendFeedCard: 좋아요 상태 로드 실패:", error);
    }
  }, [feed.id, currentUserId]);

  useEffect(() => {
    fetchLikeStatus();
    fetchComments();
  }, [fetchLikeStatus, fetchComments]);

  useEffect(() => {
    if (showComments) {
    }
  }, [showComments]);

  const toggleComments = () => {
    console.log("FriendFeedCard: toggleComments called. Current showComments:", showComments);
    setShowComments(prev => !prev);
  };

  const handleCommentChange = (e) => {
    setNewCommentText(e.target.value);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    console.log("FriendFeedCard: 새로운 댓글 제출. 페이로드:", { contentId: feed.id, content: newCommentText.trim(), userId: currentUserId });
    try {
      const payload = {
        contentId: feed.id,
        content: newCommentText.trim(),
        userId: currentUserId,
      };
      await axios.post("/api/comment/diary/create", payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setNewCommentText('');
      console.log("FriendFeedCard: 댓글이 성공적으로 작성되었습니다. 댓글 목록을 새로고침합니다...");
      await fetchComments();
      setShowComments(true);
    } catch (error) {
      console.error("FriendFeedCard: 댓글 작성 실패:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    console.log("FriendFeedCard: 댓글 삭제 요청. ID:", commentId, "by userId:", currentUserId);
    if (window.confirm("정말 이 댓글을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`/api/comment/diary/delete/${commentId}`, { data: { userId: currentUserId } });
        console.log("FriendFeedCard: 댓글이 성공적으로 삭제되었습니다. 댓글 목록을 새로고침합니다...");
        await fetchComments();
      } catch (error) {
        console.error("FriendFeedCard: 댓글 삭제 실패:", error);
      }
    } else {
      console.log("FriendFeedCard: 댓글 삭제 취소됨.");
    }
  };

  const toggleLike = async () => {
    const originalIsLiked = isLiked;
    const originalLikeCnt = likeCnt;
    console.log("FriendFeedCard: toggleLike - Before UI update. originalIsLiked:", originalIsLiked, "originalLikeCnt:", originalLikeCnt);
    setIsLiked(prev => !prev);
    setLikeCnt(prev => {
      const newLikeCnt = originalIsLiked ? prev - 1 : prev + 1;
      console.log("FriendFeedCard: toggleLike - After UI update. newLikeCnt:", newLikeCnt);
      return newLikeCnt;
    });

    console.log("FriendFeedCard: 좋아요 토글 요청. id:", feed.id, "isLiked:", !originalIsLiked);
    try {
      const response = await axios.post(`/api/diary/like/${feed.id}`, { userId: currentUserId });
      console.log("FriendFeedCard: 백엔드에 좋아요 상태가 업데이트되었습니다.", response.data);
      setLikeCnt(response.data.likeCnt);
    } catch (error) {
      console.error("FriendFeedCard: 좋아요 처리 실패:", error);
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
              src={feed.profileImg || `https://placehold.co/48x48/E2E8F0/A0AEC0?text=${feed.username}`}
              alt="프로필"
              className={styles.profileImg}
            />
            <div className={styles.authorText}>
              <div className={styles.authorName}>{feed.username}</div>
              <div className={styles.emotionLabel}>
                {emotionMap[feed.emotionLabel] || '분석 결과가 없어요😎'}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.retroText}>
          {feed.content}
        </div>

        <div className="mb-2 space-y-1 text-xs leading-snug">
          <div>작성일자 {feed.date}</div>
          {feed.bgm && <div className={styles.recommendation}>BGM - {feed.bgm}</div>}
          {feed.drama && <div className={styles.recommendation}>콘텐츠 - {feed.drama}</div>}
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

export default FriendFeedCard;