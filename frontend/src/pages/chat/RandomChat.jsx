import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp, setLogLevel } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInAnonymously,
    signInWithCustomToken
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import EmotionSelector from './EmotionSelector';


// --- Firebase 설정 함수 ---
const getFirebaseConfig = () => {
    try {
        if (import.meta.env.VITE_FIREBASE_CONFIG) {
            console.log("VITE_FIREBASE_CONFIG detected.");
            return JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
        }

        if (typeof __firebase_config !== 'undefined') {
            console.log("__firebase_config detected (Canvas environment).");
            return JSON.parse(__firebase_config);
        }
    } catch (e) {
        console.error("Firebase 설정 정보를 파싱하는 데 실패했습니다. .env 파일의 JSON 형식을 확인하세요.", e);
        return null;
    }
    
    console.warn("Firebase 설정이 없습니다. .env 파일을 생성하거나 Canvas 환경에서 실행하세요.");
    return {
        apiKey: "YOUR_API_KEY_IS_MISSING",
        authDomain: "your-project-id.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project-id.appspot.com",
        messagingSenderId: "000000000000",
        appId: "1:000000000000:web:0000000000000000000000",
    };
};

const firebaseConfig = getFirebaseConfig();

export default function RandomChat() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [db, setDb] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        console.log("Firebase config loaded:", firebaseConfig);
        if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_API_KEY_IS_MISSING")) {
            console.error("Firebase 설정이 유효하지 않습니다. API 키가 누락되었거나 플레이스홀더입니다.");
            setIsAuthReady(true); 
            return;
        }
        
        setLogLevel('debug');
        try {
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const firestore = getFirestore(app);
            setDb(firestore); // db 인스턴스 설정

            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    setUser(currentUser);
                    console.log("User authenticated:", currentUser.uid);
                } else {
                    console.log("No user, attempting anonymous sign-in...");
                    try {
                        const initialToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                        if (initialToken) {
                            await signInWithCustomToken(auth, initialToken);
                            console.log("Signed in with custom token.");
                        } else {
                            await signInAnonymously(auth);
                            console.log("Signed in anonymously.");
                        }
                    } catch (error) {
                        console.error("익명 로그인 실패:", error);
                    }
                }
                setIsAuthReady(true);
            });
            
            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase 초기화 중 오류 발생:", error);
            setIsAuthReady(true);
        }
    }, []);

    const handleEmotionSelect = (emotion) => {
        console.log("Navigating to chat room for:", emotion.name);
        navigate(`/chat/${emotion.id}`, { state: { emotion } });
    };


    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-transparent">
                <div className="text-2xl font-retro text-outline">연결 중...</div>
            </div>
        );
    }
    
    if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_API_KEY_IS_MISSING")) {
        return (
            <div className="w-full max-w-md mx-auto p-8 bg-red-100 border-2 border-red-500 rounded-2xl shadow-lg text-center font-singleday">
                <h1 className="text-3xl font-bold mb-4 text-red-700">Firebase 설정 오류!</h1>
                <p className="text-red-600">
                    localhost에서 테스트하려면<br />
                    프로젝트 루트에 <strong>.env</strong> 파일을 만들고<br />
                    Firebase 설정을 추가해야 합니다.
                </p>
                <div className="mt-4 text-left bg-gray-100 p-2 rounded text-xs text-gray-700 overflow-x-auto">
                    <pre><code>
                        {`VITE_FIREBASE_CONFIG='{
                        "apiKey": "...",
                        "authDomain": "...",
                        "projectId": "...",
                        "storageBucket": "...",
                        "messagingSenderId": "...",
                        "appId": "..."
                        }'`}
                    </code></pre>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-transparent">
            <EmotionSelector onSelect={handleEmotionSelect} />
        </div>
    );
}