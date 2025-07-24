// src/pages/main/FriendCommentPage.jsx
import React, { useState, useEffect, useContext } from 'react'; // useContext 추가
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // axios 임포트 추가
import { AuthContext } from '../user/AuthContext';

// 아이콘 이미지 경로 (jsconfig.json 및 vite.config.js 설정 후 사용 가능)
import ManProfile from '@public/icon/man.png'; // 기본 프로필 이미지
import GirlProfile from '@public/icon/girl.png'; // 추후 여성사용자일 경우 사용
import DeleteIcon from '@public/icon/delete.png';
import styles from './FriendCommentPage.module.css';

const ITEMS_PER_PAGE = 5; // 한 페이지당 보여줄 일촌평 개수

// userId prop을 받도록 수정
const FriendCommentPage = ({ userId }) => {
  const [comments, setComments] = useState([]); // 초기 일촌평 데이터를 빈 배열로 설정
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const navigate = useNavigate();

  // AuthContext에서 현재 로그인된 사용자 정보를 가져옵니다.
  const { user: currentUser, isLoggedIn } = useContext(AuthContext);
  const currentUserId = currentUser ? currentUser.userId : null; // 현재 로그인된 사용자 ID
  const currentUserName = currentUser ? currentUser.name : "익명"; // 현재 로그인된 사용자 이름
  const currentUserProfileImage = currentUser ? currentUser.profileImage : ManProfile; // 현재 로그인된 사용자 프로필 이미지

  // 새 댓글 입력 값 관리
  const [newCommentInput, setNewCommentInput] = useState('');
  const [commentsData, setCommentsData] = useState({});

  // 일촌평 데이터 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      if (!userId) {
        setLoading(false);
        setError({ message: "친구의 사용자 ID가 없습니다." });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // 백엔드 API 호출: 특정 유저의 일촌평 목록을 가져옵니다.
        const response = await axios.get(`/api/guestbook/user/${userId}`); // 일촌평은 guestbook 엔드포인트에서 가져와야 함
        console.log(`친구 (ID: ${userId})의 일촌평 목록:`, response.data);

        // 백엔드 응답 데이터를 프론트엔드 형식에 맞게 매핑
        // 이제 백엔드에서 replies 필드를 직접 제공하므로, 별도의 API 호출이 필요 없습니다.
        const fetchedComments = response.data.map(entry => ({
          id: entry.guestBookId, // 일촌평 ID
          authorNo: entry.guestBookId, // 임시로 ID 사용
          authorName: entry.writerName, // 일촌평 작성자 이름
          authorId: entry.writerId, // 일촌평 작성자 ID
          masterUserId: entry.masterUserId, // 일촌평 주인 ID
          date: entry.createdAt, // 작성 날짜
          comment: entry.content, // 일촌평 내용
          hasReply: entry.replies && entry.replies.length > 0, // 백엔드에서 받은 replies 배열의 존재 여부로 설정
          replies: entry.replies || [], // 백엔드에서 받은 replies 배열 사용
          profileImg: entry.profileImage || ManProfile, // 작성자 프로필 이미지
        }));
        setComments(fetchedComments);

      } catch (err) {
        console.error(`친구 (ID: ${userId})의 일촌평을 불러오는 중 오류 발생:`, err);
        setError({ message: "일촌평을 불러오는데 실패했습니다." });
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [userId]); // userId가 변경될 때마다 실행

  

  // 새 댓글 입력 필드 변경 핸들러
  const handleNewCommentInputChange = (e) => {
    setNewCommentInput(e.target.value);
  };

  // 새 댓글 전송 핸들러
  const handleCreateComment = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    if (!isLoggedIn || !currentUserId) {
      alert("로그인해야 일촌평을 작성할 수 있습니다.");
      return;
    }

    if (newCommentInput.trim() === "") {
      alert("일촌평 내용을 입력해주세요!");
      return;
    }

    try {
      // POST /api/guestbook 엔드포인트 호출
      const response = await axios.post('/api/guestbook', {
        masterUserId: userId, // 일촌평을 남길 친구의 ID (페이지 주인)
        writerId: currentUserId, // 일촌평을 작성하는 나의 ID
        content: newCommentInput.trim(), // 일촌평 내용
      });

      if (response.status === 201) { // 201 Created
        const newGuestbookEntry = response.data; // 백엔드에서 반환된 새 일촌평 DTO
        // UI에 새 일촌평 추가 (필요한 필드를 맞춰서 추가)
        const newCommentForUI = {
          id: newGuestbookEntry.guestBookId,
          authorNo: newGuestbookEntry.guestBookId,
          authorName: newGuestbookEntry.writerName,
          authorId: newGuestbookEntry.writerId,
          masterUserId: newGuestbookEntry.masterUserId,
          date: newGuestbookEntry.createdAt,
          comment: newGuestbookEntry.content,
          hasReply: false,
          reply: null,
          profileImg: newGuestbookEntry.profileImage || ManProfile, // 백엔드에서 프로필 이미지도 함께 반환해야 함
        };
        setComments(prevComments => [newCommentForUI, ...prevComments]); // 최신 댓글이 위에 오도록
        setNewCommentInput(''); // 입력 필드 초기화
        console.log("일촌평 작성 성공:", newGuestbookEntry);
      }
    } catch (err) {
      console.error("일촌평 작성 중 오류 발생:", err);
      alert("일촌평 작성에 실패했습니다.");
    }
  };


  // 일촌평 삭제 핸들러
  const handleDeleteComment = async (guestbookId, authorId) => {
    // 현재 로그인된 사용자가 일촌평 작성자이거나, 일촌평 페이지의 주인일 경우에만 삭제 가능
    if (currentUserId !== authorId && currentUserId !== userId) { // userId는 페이지 주인 (친구)
        alert("일촌평을 삭제할 권한이 없습니다.");
        return;
    }

    if (window.confirm("정말로 이 일촌평을 삭제하시겠습니까?")) {
      try {
        // DELETE /api/guestbook/{guestbookId} 엔드포인트 호출
        const response = await axios.delete(`/api/guestbook/${guestbookId}`);
        if (response.status === 204) { // 204 No Content
          setComments(prevComments => prevComments.filter(comment => comment.id !== guestbookId));
          console.log(`일촌평 (ID: ${guestbookId}) 삭제 성공!`);
          // 페이지네이션 조정 (선택 사항)
          const newTotalPages = Math.ceil((comments.length - 1) / ITEMS_PER_PAGE);
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
          } else if (comments.length - 1 === 0 && currentPage > 1) {
            setCurrentPage(1);
          }
        } else {
          console.warn(`일촌평 삭제 요청 성공했으나 예상치 못한 상태 코드: ${response.status}`);
        }
      } catch (err) {
        console.error(`일촌평 (ID: ${guestbookId}) 삭제 중 오류 발생:`, err);
        alert("일촌평 삭제에 실패했습니다.");
      }
    }
  };

  // 일촌평 신고 핸들러
  const handleReportComment = (commentId) => {
    const commentToReport = comments.find(comment => comment.id === commentId);
    if (commentToReport) {
      navigate('/main/mypage/report', { state: { comment: commentToReport } });
    } else {
      console.error(`신고할 일촌평 ID ${commentId}를 찾을 수 없습니다.`);
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(comments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentComments = comments.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // 로딩 또는 에러 상태 UI
  if (loading) {
    return <div className="text-center py-10">일촌평을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">일촌평 로드 오류: {error.message}</div>;
  }

  return (
    <div>
    <div className={styles.container}>
      {isLoggedIn && (
        <form onSubmit={handleCreateComment} className={styles.submitForm}>
          <input
            type="text"
            placeholder={`${currentUserName}님, 방명록에 한마디를 남겨보세요~!`}
            value={newCommentInput}
            onChange={handleNewCommentInputChange}
            className={styles.commentInput}
          />
          <button
            type="submit"
            className={styles.submitButton}
          >
            등록
          </button>
        </form>
      )}

      {comments.length === 0 ? (
        <div className={styles.noEntries}>
          등록된 방명록이 없어요 ㅠㅠ
        </div>
      ) : (
        <div className={styles.guestbookList}>
          {currentComments.map(comment => (
            <div key={comment.id} className={styles.guestbookItem}>
              <div className={styles.itemHeader}>
                <span className={styles.mainContent}>
                  {comment.comment}({comment.authorName})
                  <span className={styles.mainDate}>
                    {comment.date}
                  </span>
                </span>
                <div className="flex gap-2">
                  {(currentUserId === comment.authorId || currentUserId === userId) && (
                    <img
                      src={DeleteIcon}
                      alt="삭제"
                      className="w-4 h-4 cursor-pointer"
                      onClick={() => handleDeleteComment(comment.id, comment.authorId)}
                    />
                  )}
                </div>
              </div>

              {comment.hasReply && comment.replies.map(reply => (
                  <div key={reply.commentId} className="flex items-start gap-2 mb-2 pl-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-600 text-xs break-words">
                        └ **{reply.userName}**: {reply.content} ({reply.createdAt})
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}

      {comments.length > 0 && (
        <div className="flex justify-center items-center mt-6 space-x-1.5">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 text-sm"
          >
            &lt;
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-2 py-1 rounded-md text-sm ${
                currentPage === index + 1 ? 'bg-[#56B7CF] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 text-sm"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
    </div>
  );
};

export default FriendCommentPage;