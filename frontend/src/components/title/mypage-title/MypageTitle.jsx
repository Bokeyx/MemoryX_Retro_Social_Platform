import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import profileIcon from './man-Photoroom.png';
import textIcon from './text.png';
import cateGory from './category.png';
import axios from 'axios';
import styles from './MypageTitle.module.css';

const MypageTitle = ({ className = '', todayCount = 0, totalVisitCount = 0, onFriendListClick = () => {}, onViewModeChange = () => {}, 
                      currentUserName, currentUserIntroduction, currentUserProfileImage, onProfileImageUpload }) => {
  // 피드 아이콘의 페이지와 일촌평 아이콘의 페이지를 나눠주기 위한 onViewModeChange
  // 현재 선택된 아이콘을 사용자에게 시각적으로 알려주는 상태관리
  const [selectedView, setSelectedView] = useState('grid');
  const navigate = useNavigate(); // useNavigate 훅 초기화

  // Ref for the hidden file input
  const fileInputRef = useRef(null);

  // Function to trigger the hidden file input click
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // Function to handle file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Call the upload function
      await uploadProfileImage(file);
    }
  };

  // Function to upload image to Cloudinary
  const uploadProfileImage = async (file) => {
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }

    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/despgicej/image/upload`;
    const CLOUDINARY_UPLOAD_PRESET = 'memoryx_unsigned_preset'; // Your unsigned upload preset

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const downloadURL = response.data.secure_url;
      console.log("Uploaded image URL (Cloudinary):", downloadURL);

      // Update local state
      setDisplayProfileImage(downloadURL);

      // Send URL to parent component (MyPage.jsx)
      if (onProfileImageUpload) {
        onProfileImageUpload(downloadURL);
      }
      alert("프로필 이미지가 성공적으로 업로드되었습니다.");
    } catch (error) {
      console.error("Error uploading profile image to Cloudinary:", error);
      alert("프로필 이미지 업로드에 실패했습니다.");
    }
  };

  // AuthContext에서 가져온 프로필 이미지와 이름을 표시할 상태
  // prop으로 받은 값을 초기값으로 설정하고, prop이 변경될 때마다 업데이트합니다.
  const [displayProfileImage, setDisplayProfileImage] = useState(currentUserProfileImage || profileIcon);
  const [displayName, setDisplayName] = useState(currentUserName || '사용자');
  const [displayIntroduction, setDisplayIntroduction] = useState(currentUserIntroduction);

  // prop이 변경될 때마다 내부 상태를 업데이트합니다.
  useEffect(() => {
    console.log("MypageTitle: currentUserProfileImage changed to:", currentUserProfileImage); // Add this
    setDisplayProfileImage(currentUserProfileImage || '../../../../public/image/man_profile.png');
    setDisplayName(currentUserName || '사용자');
    setDisplayIntroduction(currentUserIntroduction);
  }, [currentUserProfileImage, currentUserName]);


  const handleGridClick = () => {
    setSelectedView('grid'); // 그리드 아이콘 클릭 시 'grid'로 상태 업데이트
    onViewModeChange('grid'); // 부모 컴포넌트로 'grid' 상태 전달
    console.log('피드 보기 클릭');
  }

  const handleListClick = () => {
    setSelectedView('list'); // 목록 아이콘 클릭 시 'list'로 상태 업데이트
    onViewModeChange('list'); // 부모 컴포넌트로 'list' 상태 전달
    console.log('일촌평 보기 클릭');
  }; // handleListClick 함수 닫는 괄호는 여기에 있습니다.

  // 정보수정 버튼 클릭 핸들러는 handleListClick 함수 밖에 정의되어 있습니다.
  const handleEditInfoClick = () => {
    navigate('/main/mypage/reverse'); // 회원정보 수정 페이지로 바로 이동
  };

  return (
    <div className={`mb-4 ${className}`}>
      <hr className="mb-1 border-gray-300" />

      {/* 프로필 정보 */}
      <div className={styles.box}>
        <img
          src={displayProfileImage}
          alt="프로필"
          className={styles.myprofileimg}
          onClick={handleImageClick}
        />
        <div className={styles.myprofile}>
          <span className='font-singleday text-gray-500'>TODAY {todayCount} | TOTAL {totalVisitCount}</span>
          <span className='font-singleday text-lg'>{displayName}</span>
          <span className='font-singleday'>{displayIntroduction}</span>

          <div className={styles.buttonbox}>
            <button
              onClick={onFriendListClick}
              className={styles.greenbutton}
            >
              친구 목록
          </button>
            <button
              onClick={handleEditInfoClick}
              className={styles.greenbutton}
            >
              정보 수정
          </button>
          </div>
        </div>
      </div>

      {/* 게시글 / 방명록 */}
      <hr className="mb-4 border-gray-300" />

      <div className={styles.switcherContainer}>
        {/* 피드 보기 버튼 */}
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

        {/* 일촌평 보기 버튼 */}
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

export default MypageTitle;