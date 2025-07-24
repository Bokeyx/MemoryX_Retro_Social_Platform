import React, { useState, useEffect } from 'react';
import profileIcon from '@public/icon/man.png'; 
import textIcon from '@public/icon/text.png'; 
import cateGory from '@public/icon/category.png'; 
import axios from 'axios'; 
import apiClient from '../../../api/apiService'; 
import styles from './FriendPageTitle.module.css';

const FriendPageTitle = ({
  className = '',
  friendName,
  friendProfileImg,
  friendStatus,
  friendIntroduction,
  setFriendStatus,
  friendUserId,
  currentUserId,
  handleDeleteFriend = () => {},
  onF2FListClick = () => {},
  onViewModeChange = () => {},
  todayCount = 0, // 오늘 방문자수 prop 추가
  totalVisitCount = 0 // 총 방문자수 prop 추가
}) => {
  const [selectedView, setSelectedView] = useState('grid');
  const [displayProfileImage, setDisplayProfileImage] = useState(friendProfileImg || profileIcon);
  const [displayName, setDisplayName] = useState(friendName || '친구');

  useEffect(() => {
    setDisplayProfileImage(friendProfileImg || '/image/default_profile.png');
    setDisplayName(friendName || '친구');
  }, [friendProfileImg, friendName]);

  const handleGridClick = () => {
    setSelectedView('grid');
    onViewModeChange('grid');
    console.log('피드 보기 클릭');
  };

  const handleListClick = () => {
    setSelectedView('list');
    onViewModeChange('list');
    console.log('일촌평 보기 클릭');
  };

  const handleSendFriendRequest = async () => {
    try {
      await apiClient.post("/api/friends/request", null, {
        params: {
          requesterId: currentUserId,
          targetId: friendUserId,
        },
      });
      setFriendStatus("PENDING");
      alert("친구 요청을 보냈습니다.");
    } catch (error) {
      console.error("친구 요청 실패:", error);
      alert("친구 요청에 실패했습니다.");
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
    <hr className="mb-1 border-gray-300" />

          <div className={styles.box}>
            <img
              src={displayProfileImage}
              alt="프로필"
              className={styles.friendprofileimg}
            />
            <div className={styles.friendprofile}>
              <span className='font-singleday text-gray-500'>TODAY {todayCount} | TOTAL {totalVisitCount}</span>
              <span className='font-singleday text-lg'>{displayName}</span>
              <span className='font-singleday'>{friendIntroduction}</span>

              <div className={styles.buttonbox}>
                <button
                    onClick={onF2FListClick}
                    className={styles.greenbutton}
                  >
                    친구 목록
                </button>

                {friendStatus === "ACCEPTED" ? (
                  <button
                    onClick={handleDeleteFriend}
                    className={styles.greenbutton}
                    style={{ backgroundColor: '#56B7CF' }}>친구 끊기</button>)
                  : friendStatus === "PENDING" ? (
                  <button
                    className={styles.greenbutton}
                    style={{ backgroundColor: '#56B7CF' }}>요청 중</button>)    
                  : ( <button
                    onClick={handleSendFriendRequest}
                    className={styles.greenbutton}
                    style={{ backgroundColor: '#56B7CF' }}>친구 요청</button>)
                }
              </div>
            </div>
          </div>

          <hr className="mb-4 border-gray-300" />

          <div className={styles.switcherContainer}>

            <div 
              className={`${styles.viewOption} ${selectedView === 'grid' ? styles.selectedOption : ''}`}
              onClick={handleGridClick}
            >
              <img
                src={cateGory}
                alt="피드 보기"
                className={styles.viewIcon}
              />
              <span className={styles.viewText}>피드</span>
            </div>

            <div 
              className={`${styles.viewOption} ${selectedView === 'list' ? styles.selectedOption : ''}`}
              onClick={handleListClick}
            >
              <img
                src={textIcon}
                alt="일촌평 보기"
                className={styles.viewIcon}
              />
              <span className={styles.viewText}>방명록</span>
            </div>
          </div>
    </div>
  );
};

export default FriendPageTitle;