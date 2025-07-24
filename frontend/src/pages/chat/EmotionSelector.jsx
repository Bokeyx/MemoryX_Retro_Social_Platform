import React from 'react';
import styles from './EmotionSelector.module.css';

const EmotionSelector = ({ onSelect }) => {
    const emotions = [
        { name: '기쁨', emoji: '😄', color: 'bg-retroBg', hover: 'hover:bg-retroBg/80', id: 'joy', textColor: 'text-outline' },
        { name: '슬픔', emoji: '😢', color: 'bg-retroBg', hover: 'hover:bg-retroBg/80', id: 'sadness', textColor: 'text-outline' },
        { name: '화남', 'emoji': '😠', color: 'bg-retroBg', hover: 'hover:bg-retroBg/80', id: 'anger', textColor: 'text-outline' },
        { name: '평온', emoji: '😌', color: 'bg-retroBg', hover: 'hover:bg-retroBg/80', id: 'calm', textColor: 'text-outline' },
        { name: '설렘', emoji: '😍', color: 'bg-retroBg', hover: 'hover:bg-retroBg/80', id: 'excitement', textColor: 'text-outline' },
        { name: '놀람', emoji: '😮', color: 'bg-retroBg', hover: 'hover:bg-retroBg/80', id: 'surprise', textColor: 'text-outline' },
    ];

    return (
        <div className={styles.selectorContainer}>
            <div className={styles.selectorHeader}>
                <p className={styles.title}>지금 당신의 감정은?</p>
                <p className={styles.selectorGuide}>
                    같은 감정을 느끼는 사람들과 실시간으로 대화를 해보세요. <br/>
                    감정을 클릭하시면 대화가 시작됩니다!
                </p>
            </div>
            
            <div className={styles.emotionGrid}>
                {emotions.map((emotion) => (
                    <div key={emotion.id}
                        onClick={() => onSelect(emotion)}
                        className={styles.emotion}>
                        <span className={styles.emoji}>{emotion.emoji}</span>
                        <span className={styles.name}>{emotion.name}</span>

                        {/* <p>
                            채팅하러 가기
                        </p> */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmotionSelector;