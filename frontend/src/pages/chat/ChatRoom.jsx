import React, { useState, useEffect, useRef } from 'react';
import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot,
    serverTimestamp,
    limit,
    getDocs,
    deleteDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import styles from "./ChatRoom.module.css";

const ChatRoom = ({ db, user, emotion, onLeave }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!db || !emotion) return;

        const roomId = emotion.id;
        const messagesCollectionPath = `emotionChatRooms/${roomId}/messages`;
        const q = query(collection(db, messagesCollectionPath), orderBy("createdAt"), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(fetchedMessages);
        }, (error) => {
            console.error("메시지 실시간 업데이트 오류:", error);
        });

        return () => unsubscribe();
    }, [db, emotion]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !db || !user?.uid) {
            console.warn("메시지 전송 실패: 메시지 내용, DB 인스턴스 또는 사용자 UID가 없습니다.");
            return;
        }

        const MESSAGE_LIMIT = 50;

        try {
            const roomId = emotion.id;
            const messagesCollectionPath = `emotionChatRooms/${roomId}/messages`;

            await addDoc(collection(db, messagesCollectionPath), {
                text: newMessage,
                createdAt: serverTimestamp(),
                userId: user.uid,
                nickname: `${emotion.name} 익명 ${emotion.emoji}`,
                emoji: emotion.emoji
            });
            setNewMessage('');

            // 메시지 한도 초과 시 오래된 메시지 삭제
            const q = query(collection(db, messagesCollectionPath), orderBy("createdAt"), limit(MESSAGE_LIMIT + 1));
            const querySnapshot = await getDocs(q); 
            if (querySnapshot.size > MESSAGE_LIMIT) {
                const messagesToDelete = querySnapshot.docs.slice(0, querySnapshot.size - MESSAGE_LIMIT);
                for (const doc of messagesToDelete) {
                    await deleteDoc(doc.ref); 
                }
            }
        } catch (error) {
            console.error("메시지 전송 또는 삭제 오류:", error);
        }
    };

    return (
        <div className={styles.chatContainer}>
            {/* 채팅방 헤더 */}
            <div className={styles.chatHeader}>
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-2 left-4 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                    <img src="/icon/backblack.png" alt="Back" className="w-6 h-6" />
                </button>
                <h2 className={styles.chatTitle}>{emotion.name} {emotion.emoji}</h2>
            </div>

            {/* 메시지 영역 */}
            <div className={styles.messageList}>
                {messages.length === 0 ? (
                    <div className={styles.noMessagePrompt}>아직 메시지가 없습니다. 첫 메시지를 보내보세요!</div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={msg.id}
                            className={`${styles.messageBubble} ${msg.userId === user.uid ? styles.myMessage : styles.otherMessage}`}
                        >
                            <div>
                                {msg.userId !== user.uid && (
                                    <div className={styles.messageSender}>
                                        {msg.nickname}
                                    </div>
                                )}
                                <div className={styles.messageContent}>
                                    
                                    <p className={styles.messageText}>{msg.text}</p>
                                </div>
                            </div>
                            <div className={styles.messageTime}>
                                {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 메시지 전송 */}
            <form onSubmit={handleSendMessage} className={styles.messageInputForm}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="채팅을 입력하세요"
                    className={styles.messageInput}
                />
                <button type="submit" className={styles.sendButton}>
                    전송
                </button>
            </form>
        </div>
    );
};

export default ChatRoom;