import React, { useState, useEffect, useMemo, useCallback,useContext } from 'react';
// 이미지 경로 그대로 사용
import DeleteIcon from '@public/icon/delete.png';
import Alter from '@public/icon/119.png'; // This is used for the Report/119 icon
import ManProfile from '@public/icon/man.png'; // Default profile for male
import GirlProfile from '@public/icon/girl.png'; // Default profile for female
import BGMIcon from '@public/icon/bgm.png';

// MainLayout 컴포넌트 import (경로 확인)
import MainLayout from '../../components/layout/MainLayout';
// SearchBar 컴포넌트 import
import SearchBar from '../../components/search/SearchBar';
import axios from 'axios';
import { AuthContext } from '../../pages/user/AuthContext';
import apiClient from '../../api/apiService';

// 기존 mockComments는 더 이상 사용되지 않습니다.
// const mockComments = [ ... ];

const ITEMS_PER_PAGE = 5; // For comments pagination

// FriendCard 컴포넌트는 변경 사항이 없습니다.
const FriendCard = React.memo(({ friendRequest, onAcceptFriend, onRejectFriend }) => {
    const { requestId, inviterName, inviterProfileImage, inviterSongId, requestedAt } = friendRequest;
    const defaultProfile = inviterProfileImage && inviterProfileImage.includes('man.png') ? ManProfile : GirlProfile;
    const profileImageSrc = inviterProfileImage || defaultProfile;

    return (
        <div className="bg-[#e0f2fe] rounded-lg shadow-md overflow-hidden flex flex-col items-center p-4 w-[260px] border border-[#a6e2ff]">
            <div className="relative mb-3 flex flex-col items-center">
                <img
                    src={profileImageSrc}
                    alt="프로필"
                    className="w-20 h-20 object-cover rounded-full mb-1"
                />
                <img
                    src={BGMIcon}
                    alt="CD 아이콘"
                    className="absolute bottom-0 right-0 w-6 h-6 object-contain transform translate-x-2 translate-y-2"
                />
                <span className="font-singleday text-lg font-bold text-gray-800">
                    {inviterName}
                </span>
            </div>
            <div className="text-center text-gray-600 text-sm mb-3">
                <p className="mb-1">BGM - {inviterSongId || "설정된 BGM 없음"}</p>
                <p className="mb-1">요청 시간: {requestedAt ? new Date(requestedAt).toLocaleString() : 'N/A'}</p>
            </div>
            <button
                onClick={() => onAcceptFriend(requestId)}
                className="bg-[#56B7CF] text-white px-6 py-2 rounded-full text-sm hover:brightness-110 transition mt-auto shadow-md"
            >
                친구 수락
            </button>
            <button
                onClick={() => onRejectFriend(requestId)}
                className="bg-red-500 text-white px-6 py-2 rounded-full text-sm hover:brightness-110 transition mt-2 shadow-md"
            >
                친구 거절
            </button>
        </div>
    );
});

// CommentItem 컴포넌트 - 백엔드에서 받은 데이터 형식에 맞게 수정
const CommentItem = React.memo(({ comment, replyInput, onReplyChange, onSendReply, onDelete, onReport }) => {
    // 백엔드에서 받은 profileImage 사용, 없으면 임시로 남성/여성 이미지 사용
    // 백엔드 DTO에 writerGender 필드가 없으므로, writerId의 마지막 문자에 따라 임시로 성별을 추론합니다.
    // 더 정확한 방법은 백엔드 GuestbookEntryView DTO에 writerGender 필드를 추가하는 것입니다.
    const profileImage = comment.profileImage 
        ? comment.profileImage 
        : (comment.writerId && (comment.writerId.charCodeAt(comment.writerId.length - 1) % 2 === 0) ? ManProfile : GirlProfile);

    return (
        <div key={comment.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <span className="font-singleday text-sm text-gray-700">
                    NO. {comment.id} {comment.writerName} ({comment.createdAt})
                </span>
                <div className="flex gap-2">
                    <img
                        src={DeleteIcon}
                        alt="삭제"
                        className="w-4 h-4 cursor-pointer"
                        onClick={() => onDelete(comment.id)}
                    />
                    <img
                        src={Alter}
                        alt="신고"
                        className="w-4 h-4 cursor-pointer"
                        onClick={() => onReport(comment.id)}
                    />
                </div>
            </div>

            <div className="flex items-start gap-3 mb-3">
                <img
                    src={profileImage}
                    alt="프로필"
                    className="w-12 h-12 object-contain border border-gray-200 p-1 rounded-md"
                />
                <div className="flex-1">
                    <p className="text-gray-800 text-base mb-1">{comment.content}</p>
                    {/* 답글 기능은 백엔드 연동이 필요하므로 현재는 목업 상태 유지 */}
                    {comment.hasReply ? (
                        <div className="bg-[#f0f9ff] p-2 rounded-md border border-[#cce7ff] mt-2">
                            <p className="text-gray-600 text-sm">
                                답글 &gt;&gt; {comment.reply}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mt-2">
                            
                           
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

// PaginationControls 컴포넌트 (변화 없음)
const PaginationControls = React.memo(({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-center items-center mt-6 space-x-1.5">
        <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 text-sm"
        >
            &lt;
        </button>
        {[...Array(totalPages)].map((_, index) => (
            <button
                key={index + 1}
                onClick={() => onPageChange(index + 1)}
                className={`px-2 py-1 rounded-md text-sm ${
                    currentPage === index + 1
                        ? "bg-[#56B7CF] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
                {index + 1}
            </button>
        ))}
        <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 text-sm"
        >
            &gt;
        </button>
    </div>
));

const Notifications = () => {
    const { user } = useContext(AuthContext);
    const currentUserId = user?.userId; // user 객체에서 userId 필드를 사용자 ID로 사용

    const [pendingFriendRequests, setPendingFriendRequests] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [errorFriends, setErrorFriends] = useState(null);
    const [currentFriendIndex, setCurrentFriendIndex] = useState(0);

    const [comments, setComments] = useState([]);
    const [replyInputs, setReplyInputs] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    // 친구 요청 데이터 불러오기
    useEffect(() => {
        const fetchPendingFriendRequests = async () => {
            if (!currentUserId) return; // currentUserId가 없으면 API 호출 안 함

            setLoadingFriends(true);
            setErrorFriends(null);
            try {
                const response = await apiClient.get(`/api/friendships/requests/pending/${currentUserId}`);
                setPendingFriendRequests(response.data);
                // 친구 요청 알림 읽음 처리
                await apiClient.post(`/api/notifications/mark_all_as_read/${currentUserId}?type=FRIEND_REQUEST`);
            } catch (error) {
                console.error("Error fetching pending friend requests:", error);
                setErrorFriends("친구 요청을 불러오는데 실패했습니다.");
            } finally {
                setLoadingFriends(false);
            }
        };
        fetchPendingFriendRequests();
    }, [currentUserId]);

    // 일촌평 데이터 불러오기 - 새로운 URL과 데이터 매핑 적용
    useEffect(() => {
        const fetchGuestbookEntries = async () => {
            if (!currentUserId) return; // currentUserId가 없으면 API 호출 안 함

            try {
                const response = await apiClient.get(`/api/guestbook/user/${currentUserId}`); 
                const guestbookData = response.data.map(entry => ({
                    id: entry.guestBookId,
                    masterUserId: entry.masterUserId,
                    masterUserName: entry.masterUserName,
                    writerId: entry.writerId,
                    writerName: entry.writerName,
                    content: entry.content,
                    createdAt: entry.createdAt, // 문자열 "YYYY.MM.DD HH:MM" 그대로 사용
                    profileImage: entry.profileImage, // 백엔드에서 제공하는 profileImage 사용
                    hasReply: false, // 백엔드 DTO에 답글 정보가 없으므로 false로 고정 (추후 확장 가능)
                    reply: '', // 백엔드 DTO에 답글 정보가 없으므로 빈 문자열 (추후 확장 가능)
                }));
                setComments(guestbookData);
                // 일촌평 알림 읽음 처리
                await apiClient.post(`/api/notifications/mark_all_as_read/${currentUserId}?type=GUESTBOOK_COMMENT`);
            } catch (error) {
                console.error("일촌평 불러오기 오류:", error);
                setComments([]); // 에러 발생 시 빈 배열로 설정하여 "등록된 일촌평이 없어요 ㅠㅠ" 표시
            }
        };
        fetchGuestbookEntries();
    }, [currentUserId]);

    const sortedPendingFriendRequests = useMemo(() => {
        return [...pendingFriendRequests].sort((a, b) => a.inviterName.localeCompare(b.inviterName, 'ko-KR'));
    }, [pendingFriendRequests]);

    const totalPages = Math.ceil(comments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentComments = comments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    const handleReportComment = useCallback((id) => {
        console.log(`댓글 ${id}이(가) 신고되었습니다.`);
        // 실제 앱에서는 여기에 신고 API 호출 로직 추가
    }, []);

    const handleDeleteComment = useCallback(async (commentId) => {
        if (!window.confirm("정말로 이 일촌평을 삭제하시겠습니까?")) {
            return;
        }
        try {
            await apiClient.delete(`/api/guestbook/user/${commentId}`); 
            setComments(prevComments => {
                const updatedComments = prevComments.filter(comment => comment.id !== commentId);
                const newTotalPages = Math.ceil(updatedComments.length / ITEMS_PER_PAGE);
                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(newTotalPages);
                } else if (newTotalPages === 0) {
                    setCurrentPage(1);
                }
                return updatedComments;
            });
            console.log(`일촌평 ${commentId} 삭제 성공`);
            alert("일촌평이 성공적으로 삭제되었습니다.");
        } catch (error) {
            console.error("일촌평 삭제 오류:", error);
            alert(`일촌평 삭제에 실패했습니다: ${error.message || error.response?.data?.message || '알 수 없는 오류'}`);
        }
    }, [currentPage]);

    const handleReplyInputChange = useCallback((id, value) => {
        setReplyInputs((prev) => ({ ...prev, [id]: value }));
    }, []);

    const handleSendReply = useCallback((id) => {
        console.log(`일촌평 ${id}에 답글 전송 기능은 아직 구현되지 않았습니다.`);
    }, []);

    const handlePrevFriend = useCallback(() => {
        setCurrentFriendIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    const handleNextFriend = useCallback(() => {
        setCurrentFriendIndex((prev) =>
            Math.min(prev + 1, sortedPendingFriendRequests.length - 1)
        );
    }, [sortedPendingFriendRequests?.length]);

    const handleAcceptFriend = useCallback(async (requestId) => {
        try {
            const response = await apiClient.post('/api/friendships/respond', {
                requestId: requestId,
                responseAction: 'accept',
                targetUserId: currentUserId,
            });
            if (response.status === 200) { 
                console.log('Friend request accepted successfully');
                setPendingFriendRequests(prevRequests =>
                    prevRequests.filter(req => req.requestId !== requestId)
                );
                setCurrentFriendIndex(prevIndex =>
                    Math.min(prevIndex, sortedPendingFriendRequests.length - 2)
                );
                if (sortedPendingFriendRequests.length - 1 === 0) {
                    setCurrentFriendIndex(0);
                }
            } else {
                const errorData = response.data; 
                console.error('Failed to accept friend request:', errorData);
                alert(`친구 요청 수락 실패: ${errorData.message || JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
            alert(`친구 요청 수락 중 오류 발생: ${error.message}`);
        }
    }, [currentUserId, sortedPendingFriendRequests.length]);

    const handleRejectFriend = useCallback(async (requestId) => {
        try {
            const response = await apiClient.post('/api/friendships/respond', {
                requestId: requestId,
                responseAction: 'reject',
                targetUserId: currentUserId,
            });
            if (response.status === 200) { 
                console.log('Friend request rejected successfully');
                setPendingFriendRequests(prevRequests =>
                    prevRequests.filter(req => req.requestId !== requestId)
                );
                setCurrentFriendIndex(prevIndex =>
                    Math.min(prevIndex, sortedPendingFriendRequests.length - 2)
                );
                if (sortedPendingFriendRequests.length - 1 === 0) {
                    setCurrentFriendIndex(0);
                }
            } else {
                const errorData = response.data; 
                console.error('Failed to reject friend request:', errorData);
                alert(`친구 요청 거절 실패: ${errorData.message || JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            alert(`친구 요청 거절 중 오류 발생: ${error.message}`);
        }
    }, [currentUserId, sortedPendingFriendRequests.length]);

    return (
        <MainLayout>
            <SearchBar />
            <hr className="border-t-2 border-gray-300 my-4" />

            {/* Friend Request Section */}
            <h2 className="text-2xl text-gray-800 text-center mb-4">친구 요청</h2>
            {loadingFriends ? (
                <div className="text-center text-gray-500 text-lg mt-4">
                    친구 요청을 불러오는 중...
                </div>
            ) : errorFriends ? (
                <div className="text-center text-red-500 text-lg mt-4">
                    {errorFriends}
                </div>
            ) : sortedPendingFriendRequests.length === 0 ? (
                <div className="text-center text-gray-500 text-lg mt-4">
                    새로운 친구 요청이 없습니다.
                </div>
            ) : (
                <div className="flex flex-col items-center mb-8">
                    <div className="flex justify-between items-center w-full max-w-xs mb-4 px-2">
                        <button
                            onClick={handlePrevFriend}
                            disabled={currentFriendIndex === 0}
                            className="text-gray-500 text-2xl font-bold p-1 rounded-full disabled:opacity-30 focus:outline-none"
                        >
                            &lt;
                        </button>
                        {sortedPendingFriendRequests.length > 0 && (
                            <FriendCard
                                friendRequest={sortedPendingFriendRequests[currentFriendIndex]}
                                onAcceptFriend={handleAcceptFriend}
                                onRejectFriend={handleRejectFriend}
                            />
                        )}
                        <button
                            onClick={handleNextFriend}
                            disabled={currentFriendIndex === sortedPendingFriendRequests.length - 1}
                            className="text-gray-500 text-2xl font-bold p-1 rounded-full disabled:opacity-30 focus:outline-none"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            )}

            <hr className="border-t-2 border-gray-300 my-4" />

            {/* 일촌평 알림 Section */}
            <h2 className="text-2xl text-gray-800 text-center mb-4">일촌평 알림</h2>
            {comments.length === 0 ? (
                <div className="text-center text-gray-500 text-lg mt-10">
                    등록된 일촌평이 없어요 ㅠㅠ
                </div>
            ) : (
                <div className="space-y-4">
                    {currentComments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            replyInput={replyInputs[comment.id]}
                            onReplyChange={handleReplyInputChange}
                            onSendReply={handleSendReply}
                            onDelete={handleDeleteComment}
                            onReport={handleReportComment}
                        />
                    ))}
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </MainLayout>
    );
};

export default Notifications;