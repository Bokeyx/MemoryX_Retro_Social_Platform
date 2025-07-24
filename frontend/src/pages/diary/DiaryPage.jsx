import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import styles from './DiaryPage.module.css';

const Diary = () => {
  const [diary, setDiary] = useState('');
  //const [emotion, setEmotion] = useState(null);
  const navigate = useNavigate();

  //테스트 위함
  // const result = "나는 눈물을 흘린다... 왜그럴까..."

  const handleConvert = async () => {
    try {
      const response = await fetch('http://memory-x.duckdns.org/retro/transform-diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          modern_sentence: diary,
          emotion_model_name: "kcbert_shopping_emotion" // 또는 다른 모델 이름 선택
        }),
      });

      const result = await response.json();

      if (result.error) {
        alert(result.error);
        return;
      }
      
      console.log('변환 및 감정 분석 결과:', result);

      navigate('/main/diary/loading', {state: {
        retro_sentence: result.retro_sentence,
        emotion: result.emotion,
        original_text: diary
      }});
    } catch (error) {
      console.error('서버 오류:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <MainLayout>
        {/* <hr className={styles.topline}/> */}
          <div className={styles.diaryContainer}>

            <div className={styles.diaryHeader}>
              <h2 className={styles.headingTitle}>오늘의 일기 ✨</h2>

              <div className={styles.diaryGuide}>
                오늘의 일기를 작성한 후 2000년대로 떠나볼까요? <br/>
                Y2K 음악, 영화, TV 콘텐츠를 추천받아보세요
              </div>
            </div>
      
            <textarea
              className={styles.inputBox}
              placeholder="일기를 작성해주세요 (☞゚ヮ゚)☞"
              value={diary}
              onChange={(e) => setDiary(e.target.value)}
            ></textarea>

            <div className={styles.submitBox}>
              {/* <p>⬇️ 여기에 약간 멘트 넣고 싶은데</p> */}
              <button className={styles.convertButton} 
                onClick={handleConvert}>
                  작성 완료
              </button>
            </div>

        
      </div>
    </MainLayout>
  );
};

export default Diary;