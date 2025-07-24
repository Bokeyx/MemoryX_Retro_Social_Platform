import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../user/AuthContext';
import { FaTrash } from 'react-icons/fa';

import styles from './MyGuestBookPage.module.css';

import ManProfile from '@public/icon/man.png';
import DeleteIcon from '@public/icon/delete.png';

const ITEMS_PER_PAGE = 5;

const MyCommentPage = () => {
    const { user, isLoggedIn } = useContext(AuthContext);
    const currentUserId = user ? user.userId : null;
    const currentUserName = user ? user.name : "익명";

    const [guestbookEntries, setGuestbookEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [commentsData, setCommentsData] = useState({});
    const [newCommentInputs, setNewCommentInputs] = useState({});

    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

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

                const sortedEntries = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                const transformedEntries = sortedEntries.map((entry, index) => ({
                    id: entry.guestBookId,
                    authorName: entry.writerName,
                    authorId: entry.writerId,
                    masterUserId: entry.masterUserId,
                    // profileImg: ManProfile,
                    date: entry.createdAt,
                    comment: entry.content,
                    hasReply: false,
                    reply: null,
                }));

                setGuestbookEntries(transformedEntries);
                console.log("받은 일촌평 데이터:", transformedEntries);

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

    const handleNewCommentInputChange = (guestbookId, value) => {
        setNewCommentInputs(prev => ({
            ...prev,
            [guestbookId]: value,
        }));
    };

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
                contentId: guestbookId,
                userId: currentUserId,
                content: commentText.trim(),
            });

            if (response.status === 201) {
                const newComment = response.data;
                setCommentsData(prev => ({
                    ...prev,
                    [guestbookId]: [newComment]
                }));
                setNewCommentInputs(prev => ({ ...prev, [guestbookId]: '' }));
                console.log("댓글 작성 성공:", newComment);
            }
        } catch (err) {
            console.error("댓글 작성 중 오류 발생:", err);
            setError("댓글 작성에 실패했습니다.");
        }
    };

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

    const handleDeleteComment = async (commentId, guestbookId) => {
        if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            try {
                const response = await axios.delete(`/api/comments/${commentId}`);
                if (response.status === 204) {
                    setCommentsData(prev => ({
                        ...prev,
                        [guestbookId]: []
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

    const handleReportComment = (commentId) => {
        const commentToReport = guestbookEntries.find(entry => entry.id === commentId);
        if (commentToReport) {
            navigate('/main/mypage/report', { state: { comment: commentToReport } });
        } else {
            console.error(`신고할 일촌평 ID ${commentId}를 찾을 수 없습니다.`);
        }
    };

    const totalPages = Math.ceil(guestbookEntries.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentGuestbookEntries = guestbookEntries.slice(startIndex, endIndex);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

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
        <div className={styles.container}>

            {guestbookEntries.length === 0 ? (
                <div className={styles.noEntries}>
                    등록된 일촌평이 없어요 ㅠㅠ
                </div>
            ) : (
                <div className={styles.guestbookList}>
                    {currentGuestbookEntries.map(entry => {
                        const entryComments = commentsData[entry.id] || [];
                        const hasExistingComment = entryComments.length > 0;
                        const firstComment = hasExistingComment ? entryComments[0] : null;

                        return (
                            <div key={entry.id} className={styles.guestbookItem}>
                                <div className={styles.itemHeader}>
                                    <span className={styles.mainContent}>
                                        {entry.comment} ({entry.authorName})
                                        <span className={styles.mainDate}>
                                            {' '}{entry.date}
                                        </span>
                                        {/* {entry.masterUserId === currentUserId && (
                                            <FaTrash
                                                className={styles.deleteIcon}
                                                onClick={() => handleDeleteGuestbookEntry(entry.id)}
                                            />
                                        )} */}
                                    </span>

                                    <span
                                        className={styles.deleteX} 
                                        onClick={() => handleDeleteGuestbookEntry(entry.id)}>{' '}X</span>
                                    
                                    
                                    {/* 신고 아이콘*/}
                                    {/* <img src={Alter} alt="신고" className={styles.deleteIcon} onClick={() => handleReportComment(entry.id)}/> */}
                                </div>

                                {/* 답글 */}
                                {hasExistingComment ? (
                                    <div className={styles.replySection}>
                                        <span className={styles.replyText}>
                                            <span className={styles.replyAuthor}>↳ {firstComment.userName}:</span> {firstComment.content}
                                            <span className={styles.replyDate}>{firstComment.createdAt}</span>
                                        </span>
                                        {firstComment.userId === currentUserId && (
                                            <FaTrash
                                                className={styles.replyDeleteButton}
                                                onClick={() => handleDeleteComment(firstComment.commentId, entry.id)}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    // 댓글이 없을 때만 댓글 입력 폼 표시
                                    <form onSubmit={(e) => { e.preventDefault(); handleCreateComment(entry.id); }} className={styles.commentForm}>
                                        <input
                                            type="text"
                                            placeholder="댓글을 남겨주세요..."
                                            className={styles.commentInput}
                                            value={newCommentInputs[entry.id] || ""}
                                            onChange={(e) => handleNewCommentInputChange(entry.id, e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            className={styles.submitButton}
                                        >
                                            등록
                                        </button>
                                    </form>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {guestbookEntries.length > 0 && (
                <div className={styles.paginationContainer}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                    >
                        &lt;
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`${styles.paginationButton} ${
                                currentPage === index + 1 ? styles.active : ''
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyCommentPage;