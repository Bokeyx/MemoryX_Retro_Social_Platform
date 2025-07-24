import React, { useState, useContext } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { AuthContext } from '../../pages/user/AuthContext';
import SuicideWarningOverlay from "../../components/SuicideWarningOverlay"; // SuicideWarningOverlay 임포트

import styles from './DiaryResult.module.css';
import RecoSong from "../../components/contents_reco/RecoSong";
import RecoMovieTV from "../../components/contents_reco/RecoMovieTV";

const DiaryResult = () => {
    const location = useLocation();
    console.log("Location state in DiaryResult:", location.state);
    const navigate = useNavigate();

    const { retro_sentence, emotion, original_text } = location.state || {};

    const retroText = retro_sentence || ""; // retro_sentence가 undefined일 경우 빈 문자열로 초기화
    const emotionLabel = emotion ? emotion.label : "";
    const originalTextToSend = original_text || ""; // original_text가 undefined일 경우 빈 문자열로 초기화

    const [showSong, setShowSong] = useState(false);
    const [showMovieTV, setShowMovieTV] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [selectedMovieTV, setSelectedMovieTV] = useState(null);
    const [apiResponse, setApiResponse] = useState(null); // API 응답을 저장할 상태 추가

    const { user } = useContext(AuthContext);
    const userId = user ? user.userId : null;

    if (!userId) {
        navigate("/login");
        return null;
    }

    const handleSelectSong = (song) => {
        setSelectedSong(song);
        setShowSong(false);
    };

    const handleSelectMovieTV = (movieTV) => {
        setSelectedMovieTV(movieTV);
        setShowMovieTV(false); 
    };

    const handleSaveDiary = async () => {
        console.log("게시글 등록하기 버튼 클릭됨");
        try {
            // FastAPI 백엔드 API 호출로 변경
            const response = await axios.post("http://localhost:8000/api/diary/result", // FastAPI 주소로 변경
                {
                    diary_user : userId,
                    original_text : originalTextToSend,
                    retro_text : retroText,
                    emotion_label: emotionLabel,
                    reco_song : selectedSong ? String(selectedSong.songId) : null,
                    reco_content : selectedMovieTV ? String(selectedMovieTV.content_id) : null
                });
                
                setApiResponse(response.data); // API 응답 저장

                if (response.status === 200) { // FastAPI는 200 OK를 반환
                    setApiResponse(response.data); // API 응답 저장

                    // suicide_warning 필드가 없으면 기존처럼 알림 후 메인으로 이동
                    if (!response.data.suicide_warning) {
                        alert("일기가 성공적으로 등록되었습니다!");
                        navigate("/main");
                    }
                }
        } catch (error) {
            console.error("일기 등록 실패 :  ", error)
            alert("등록 중 오류가 발생했습니다.")
        }       
    }

    const emotionMap = {
        '긍정': '긍정😊',
        '부정': '부정😢',
        '중립': '중립😗',
    };

    return (
        <MainLayout>
            <hr className={styles.divider} />
            <div className={styles.contentWrapper}>
                <div>
                    <section>
                        <h2 className={styles.sectionTitle}>변환된 나의 일기 (☞゚ヮ゚)☞</h2>
                        <div className={styles.diaryBox}>
                            {retroText}
                                <p className={styles.diaryEmotion}>오늘의 기분 : {emotionMap[emotionLabel] || '분석 결과가 없어요😎'}
                                </p>
                            {selectedSong && (<span className={styles.selectedReco}>{selectedSong.title} ({selectedSong.year}.{selectedSong.month})
                                {selectedMovieTV && (<span className={styles.selectedReco}>/{selectedMovieTV.title} ({selectedMovieTV.releaseDate})</span>)}

                            </span>)}
                            
                        </div>
                    </section>

                    <section>
                        <RecoSong onSelectSong={handleSelectSong}/>
                    </section>

                    <section>
                        <RecoMovieTV onSelectMovieTV={handleSelectMovieTV} />
                    </section>

                    <div className={styles.buttonContainer}>
                        <button type="button" onClick={handleSaveDiary} className={styles.saveButton}>게시글 등록하기</button>
                    </div>
                </div>
            </div>
            {/* SuicideWarningOverlay 컴포넌트 렌더링 */}
            {apiResponse && apiResponse.suicide_warning && (
                <SuicideWarningOverlay suicideWarning={apiResponse.suicide_warning} />
            )}
        </MainLayout>
    );
};

export default DiaryResult;