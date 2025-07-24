// src/pages/my/feed/MyCommentPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios'; // axios 임포트
import { useNavigate } from 'react-router-dom'; // useNavigate 훅 임포트
import { AuthContext } from '../../user/AuthContext'; // AuthContext 임포트
import { FaTrash } from 'react-icons/fa'; // 삭제 아이콘 임포트 (FaCommentDots는 이제 필요 없습니다)

// 아이콘 이미지 경로 (jsconfig.json 및 vite.config.js 설정 후 사용 가능)
import ManProfile from '@public/icon/man.png'; // 기본 프로필 이미지
// import GirlProfile from '@public/icon/girl.png'; // 추후 여성사용자일 경우 사용 (현재 사용 안 함)
import DeleteIcon from '@public/icon/delete.png'; // 일촌평 삭제 아이콘
import Alter from '@public/icon/119.png'; // 신고 아이콘

const ITEMS_PER_PAGE = 5; // 한 페이지당 보여줄 일촌평 개수

const MyCommentPage = () => {
  // AuthContext에서 user 객체와 isLoggedIn 상태를 가져옵니다.
  const { user, isLoggedIn } = useContext(AuthContext);
  // 로그인된 사용자 ID (이 ID의 방명록을 조회할 것입니다)
  const currentUserId = user ? user.userId : null;
  // 로그인된 사용자 이름 (댓글 작성자로 사용)
  const currentUserName = user ? user.name : "익명"; 
  // 로그인된 사용자 프로필 이미지 (댓글 작성자로 사용)
  const currentUserProfileImage = user ? user.profileImage : ManProfile; // 기본 이미지

  const [guestbookEntries, setGuestbookEntries] = useState([]); // 백엔드에서 불러온 일촌평 데이터
  const [loading, setLoading] = useState(true); // 일촌평 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  // 각 일촌평의 댓글 데이터 관리 { guestBookId: CommentDto[] }
  const [commentsData, setCommentsData] = useState({});
  // 각 일촌평의 새 댓글 입력 값 관리 { guestBookId: string }
  const [newCommentInputs, setNewCommentInputs] = useState({});

  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const navigate = useNavigate(); // useNavigate 훅 초기화

  // --- 일촌평 데이터 불러오기 (초기 로딩) ---
  useEffect(() => {
    const fetchGuestbookEntries = async () => {
      if (!isLoggedIn || !currentUserId) {
        console.log("🚨 MyCommentPage: 로그인되지 않았거나 currentUserId가 유효하지 않습니다:", currentUserId);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("✅✅ MyCommentPage: 일촌평 Axios 요청 URL:", `/api/guestbook/user/${currentUserId}`);
        const response = await axios.get(`/api/guestbook/user/${currentUserId}`);
        
        const transformedEntries = response.data.map((entry, index) => ({
          id: entry.guestBookId,
          authorNo: index + 1,
          authorName: entry.writerName,
          authorId: entry.writerId, // 일촌평 작성자 ID
          masterUserId: entry.masterUserId, // 일촌평 주인 ID
          profileImg: ManProfile, // 현재 GuestbookDto에 프로필 이미지 필드가 없으므로 임시로 기본 이미지 사용
          date: entry.createdAt,
          comment: entry.content,
          hasReply: false, 
          reply: null,
        }));

        setGuestbookEntries(transformedEntries);
        console.log("받은 일촌평 데이터:", transformedEntries);

        // 🚨 모든 일촌평의 댓글을 초기 로딩 시 불러오기
        const initialCommentsPromises = transformedEntries.map(entry => 
          axios.get(`/api/comments/guestbook/${entry.id}`).then(res => ({ id: entry.id, comments: res.data }))
        );
        const allInitialComments = await Promise.all(initialCommentsPromises);
        const initialCommentsMap = allInitialComments.reduce((acc, curr) => {
          acc[curr.id] = curr.comments;
          return acc;
        }, {});
        setCommentsData(initialCommentsMap);


      } catch (err) {
        console.error("일촌평 데이터를 가져오는 중 오류 발생:", err);
        setError("일촌평 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchGuestbookEntries();
    }
  }, [currentUserId, isLoggedIn]);

  // --- 댓글 데이터 불러오기 (이제 초기 로딩 시 모두 불러오므로 이 함수는 필요 없을 수 있습니다) ---
  // const fetchCommentsForEntry = async (guestbookId) => {
  //   try {
  //     const response = await axios.get(`/api/comments/guestbook/${guestbookId}`);
  //     setCommentsData(prev => ({
  //       ...prev,
  //       [guestbookId]: response.data 
  //     }));
  //     console.log(`일촌평 (ID: ${guestbookId}) 댓글 데이터:`, response.data);
  //   } catch (err) {
  //     console.error(`일촌평 (ID: ${guestbookId}) 댓글을 가져오는 중 오류 발생:`, err);
  //   }
  // };

  // --- 댓글 섹션 토글 핸들러 (이제 필요 없습니다) ---
  // const toggleCommentsSection = (guestbookId) => {
  //   setShowCommentsSection(prev => {
  //     const newState = { ...prev, [guestbookId]: !prev[guestbookId] };
  //     if (newState[guestbookId] && !commentsData[guestbookId]) {
  //       fetchCommentsForEntry(guestbookId);
  //     }
  //     return newState;
  //   });
  // };

  // --- 새 댓글 입력 변경 핸들러 ---
  const handleNewCommentInputChange = (guestbookId, value) => {
    setNewCommentInputs(prev => ({
      ...prev,
      [guestbookId]: value,
    }));
  };

  // --- 새 댓글 전송 핸들러 ---
  const handleCreateComment = async (guestbookId) => {
    const commentText = newCommentInputs[guestbookId];
    if (!commentText || commentText.trim() === "") {
      console.log("댓글 내용을 입력해주세요!");
      return;
    }

    if (!currentUserId) {
      console.error("댓글을 작성하려면 로그인해야 합니다.");
      return;
    }

    try {
      const response = await axios.post('/api/comments', {
        contentId: guestbookId, // 일촌평 ID
        userId: currentUserId, // 댓글 작성자 ID
        content: commentText.trim(), // 댓글 내용
      });

      if (response.status === 201) { // 201 Created
        const newComment = response.data; // 백엔드에서 반환된 새 댓글 DTO
        // 댓글은 이제 하나만 허용되므로, 기존 배열을 새 댓글로 대체합니다.
        setCommentsData(prev => ({
          ...prev,
          [guestbookId]: [newComment] // 👈 배열에 새 댓글 하나만 넣음
        }));
        setNewCommentInputs(prev => ({ ...prev, [guestbookId]: '' })); // 입력 필드 초기화
        console.log("댓글 작성 성공:", newComment);
      }
    } catch (err) {
      console.error("댓글 작성 중 오류 발생:", err);
      setError("댓글 작성에 실패했습니다.");
    }
  };

  // --- 일촌평 삭제 핸들러 ---
  const handleDeleteGuestbookEntry = async (guestbookId) => {
    if (window.confirm("정말로 일촌평을 삭제하시겠습니까?")) {
      try {
        const response = await axios.delete(`/api/guestbook/${guestbookId}`);
        if (response.status === 204) {
          const updatedEntries = guestbookEntries.filter(entry => entry.id !== guestbookId);
          setGuestbookEntries(updatedEntries);
          console.log(`일촌평 (ID: ${guestbookId}) 삭제 성공!`);
          
          const newTotalPages = Math.ceil(updatedEntries.length / ITEMS_PER_PAGE);
          if (updatedEntries.length > 0 && currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
          } else if (updatedEntries.length === 0 && currentPage > 1) {
            setCurrentPage(1);
          }

        } else {
          console.warn(`일촌평 삭제 요청 성공했으나 예상치 못한 상태 코드: ${response.status}`);
        }
      } catch (err) {
        console.error(`일촌평 (ID: ${guestbookId}) 삭제 중 오류 발생:`, err);
        setError("일촌평 삭제에 실패했습니다.");
      }
    }
  };

  // --- 댓글 삭제 핸들러 ---
  const handleDeleteComment = async (commentId, guestbookId) => {
    if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      try {
        const response = await axios.delete(`/api/comments/${commentId}`);
        if (response.status === 204) {
          // 댓글이 삭제되면 해당 일촌평의 댓글 목록을 비웁니다.
          setCommentsData(prev => ({
            ...prev,
            [guestbookId]: [] // 👈 댓글 삭제 시 빈 배열로 설정
          }));
          console.log(`댓글 (ID: ${commentId}) 삭제 성공!`);
        } else {
          console.warn(`댓글 삭제 요청 성공했으나 예상치 못한 상태 코드: ${response.status}`);
        }
      } catch (err) {
        console.error(`댓글 (ID: ${commentId}) 삭제 중 오류 발생:`, err);
        setError("댓글 삭제에 실패했습니다.");
      }
    }
  };

  // --- 일촌평 신고 핸들러 ---
  const handleReportComment = (commentId) => { 
    const commentToReport = guestbookEntries.find(entry => entry.id === commentId);
    if (commentToReport) {
      navigate('/main/mypage/report', { state: { comment: commentToReport } }); 
    } else {
      console.error(`신고할 일촌평 ID ${commentId}를 찾을 수 없습니다.`);
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(guestbookEntries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGuestbookEntries = guestbookEntries.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // 로그인되지 않았거나 사용자 ID가 없을 경우 로딩/에러 메시지 표시
  if (!isLoggedIn || !currentUserId) {
    return <div className="text-center p-4 text-red-500">로그인이 필요합니다.</div>;
  }

  if (loading) {
    return <div className="text-center p-4">일촌평 로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="font-singleday min-h-screen bg-[#f0f9ff] px-0 py-3 sm:px-4">
      <h1 className="font-singleday text-3xl tracking-widest text-outline text-center mb-6">
        일촌평
      </h1>

      {guestbookEntries.length === 0 ? (
        <div className="text-center text-gray-500 text-lg mt-10">
          등록된 일촌평이 없어요 ㅠㅠ
        </div>
      ) : (
        <div className="space-y-6">
          {currentGuestbookEntries.map(entry => {
            const entryComments = commentsData[entry.id] || []; // 해당 일촌평의 댓글 목록
            const hasExistingComment = entryComments.length > 0; // 댓글이 이미 있는지
            const firstComment = hasExistingComment ? entryComments[0] : null; // 첫 번째 (유일한) 댓글

            return (
              <div key={entry.id} className="bg-white p-4 rounded-lg shadow-md">
                {/* 일촌평 헤더 (번호, 이름, 날짜, 아이콘) */}
                <div className="flex justify-between items-center mb-3">
                  <span className="font-singleday text-sm text-gray-700">
                    NO. {entry.authorNo} {entry.authorName} ({entry.date})
                  </span>
                  <div className="flex gap-2">
                    {/* 일촌평 삭제 버튼 (방명록 주인에게만 보이도록) */}
                    {entry.masterUserId === currentUserId && (
                      <img
                        src={DeleteIcon}
                        alt="삭제"
                        className="w-4 h-4 cursor-pointer"
                        onClick={() => handleDeleteGuestbookEntry(entry.id)}
                      />
                    )}
                    {/* 일촌평 신고 버튼 */}
                    <img
                      src={Alter}
                      alt="신고"
                      className="w-4 h-4 cursor-pointer"
                      onClick={() => handleReportComment(entry.id)}
                    />
                  </div>
                </div>

                {/* 일촌평 내용 */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={entry.profileImg || ManProfile}
                    alt="프로필"
                    className="w-12 h-12 object-contain border border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="text-gray-800 text-base mb-1">{entry.comment}</p>
                    
                    {/* 댓글 표시 또는 입력 폼 */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-md shadow-inner">
                      {hasExistingComment ? ( // 댓글이 이미 있으면 댓글 표시
                        <div key={firstComment.commentId} className="text-xs flex justify-between items-start">
                          <div>
                            <span className="font-semibold">{firstComment.userName} ({firstComment.userId}):</span> {firstComment.content}
                            <span className="text-gray-400 ml-2">{firstComment.createdAt}</span>
                          </div>
                          {/* 댓글 삭제 버튼 (댓글 작성자에게만 보이도록) */}
                          {firstComment.userId === currentUserId && (
                            <FaTrash 
                              className="w-3 h-3 text-blue-500 cursor-pointer hover:text-blue-700 ml-2" 
                              onClick={() => handleDeleteComment(firstComment.commentId, entry.id)}
                            />
                          )}
                        </div>
                      ) : ( // 댓글이 없으면 입력 폼 표시
                        <form onSubmit={(e) => { e.preventDefault(); handleCreateComment(entry.id); }} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="댓글을 남겨주세요..."
                            className="flex-grow p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                            value={newCommentInputs[entry.id] || ""}
                            onChange={(e) => handleNewCommentInputChange(entry.id, e.target.value)}
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            등록
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 페이지네이션 컨트롤: 일촌평 목록이 0개보다 많을 때만 표시 */}
      {guestbookEntries.length > 0 && (
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
  );
};

export default MyCommentPage;
