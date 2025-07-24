import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ChatRoom from './ChatRoom.jsx';
import styles from "./ChatPage.module.css";

const getFirebaseConfig = () => {
    try {
         if (import.meta.env.VITE_FIREBASE_CONFIG) {
             return JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
         }
         if (typeof __firebase_config !== 'undefined') {
             return JSON.parse(__firebase_config);
         }
     } catch (e) {
         console.error("Firebase 설정 파싱 실패", e);
         return null;
     }
     console.warn("Firebase 설정이 없습니다.");
     return null;
};

const ChatPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { emotionId } = useParams();

    const emotion = location.state?.emotion;

    const [user, setUser] = useState(null);
    const [db, setDb] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        const firebaseConfig = getFirebaseConfig();
        if (!firebaseConfig) {
            console.error("Firebase 설정이 유효하지 않습니다.");
            setIsAuthReady(true);
            return;
        }

        try {
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const firestore = getFirestore(app);
            setDb(firestore);

            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    setUser(currentUser);
                } else {
                    await signInAnonymously(auth);
                }
                setIsAuthReady(true);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase 초기화 오류:", error);
            setIsAuthReady(true);
        }
    }, []);

    // 뒤로가기
    const handleLeaveRoom = () => {
        navigate('/chat');
    };

    // emotion 정보가 없거나 인증 준비가 안 된 경우 로딩 표시
    if (!emotion || !isAuthReady) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>연결 중...</div>;
    }

    return (
        <div style={{ height: '100vh', backgroundColor: '#1a202c' }}>
            <ChatRoom
                db={db}
                user={user}
                emotion={emotion}
                onLeave={handleLeaveRoom}
            />
        </div>
    );
};

export default ChatPage;