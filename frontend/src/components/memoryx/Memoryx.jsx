import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Memoryx.module.css'
import DM from '../dm/DM';

const MemoryXTitle = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로가 '/main'인지 확인합니다.
  const isMainPage = location.pathname === '/main';

  // 알림O 뒤로가기 X
  const isMainPagesList = ['/','/main', '/main/diary','/chat', '/main/mypage', '/login', '/login', '/main/diary/loading', '/oauth/callback/kakao', '/signup', '/forgot-password', '/reset-password'];

  // 알림X 뒤로가기X
  const isAlterPagesList = ['/', '/login', '/main/diary/loading', '/oauth/callback/kakao', '/signup', '/forgot-password', '/reset-password']
  const shouldShowBackButton = !isMainPagesList.includes(location.pathname);
  const shouldShowAlterButton = !isAlterPagesList.includes(location.pathname)

  return (
    <div className="tracking-widest font-retro text-outline">
      <div className={styles.titleContainer}>
      {shouldShowBackButton  ? (
          <button
            onClick={() => navigate(-1)}
            className={styles.backButton}
          >
            ◀
          </button>
        ) : (
          <div className={styles.nullDiv}></div>
        )}

      <p className="tracking-widest font-retro text-outline text-2xl">
        MEMORY&nbsp;X</p>
      {/* 알림 아이콘은 MainLayout에서 렌더링되므로 여기서 제거 */}
      <div className={styles.nullDiv}></div>
      
      </div>
    </div>
  );
};

export default MemoryXTitle;