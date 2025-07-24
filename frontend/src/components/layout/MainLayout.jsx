import React, { useState, useEffect, useContext } from "react";
import MemoryXTitle from "../memoryx/Memoryx";
import DM from "../dm/DM";
import Footer from "../footer/Footer";
import styles from "./MainLayout.module.css";
import axios from "axios";
import { AuthContext } from "../../pages/user/AuthContext";

const MainLayout = ({ children, pageTitle }) => {
  const { user } = useContext(AuthContext);
  const currentUserId = user ? user.userId : null;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (!currentUserId) return;
      try {
        // 친구 알림만 필터링하여 가져오도록 type=FRIEND_REQUEST 추가
        const response = await axios.get(`/api/notifications/unread_count/${currentUserId}?type=FRIEND_REQUEST`);
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error("읽지 않은 친구 알림 수를 가져오는 중 오류 발생:", error);
      }
    };

    fetchUnreadNotifications();
    // 주기적으로 알림 수를 업데이트하려면 setInterval 사용
    const intervalId = setInterval(fetchUnreadNotifications, 60000); // 1분마다 업데이트
    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 정리
  }, [currentUserId]);

  return (
    <div className={styles.mainLayoutContainer}>
      <div className={styles.fixedHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleWrapper}>
            <MemoryXTitle className={styles.memoryxTitle} title={pageTitle} />
          </div>
          <div className={styles.dmWrapper}>
            <DM className={styles.dmIcon} />
            {unreadCount > 0 && (
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            )}
          </div>
        </div>
      </div>

      <main className={styles.mainContent}>{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;