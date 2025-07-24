// Diarylanding.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation 훅 추가
// import './DiaryPage.css'; // 외부 CSS 파일 제거 (Tailwind CSS 사용)
import MemoryXTitle from '@/components/memoryx/Memoryx'; // ✅ default export 확인 필요

const Diarylanding = () => {
  const navigate = useNavigate();
  const location = useLocation(); // useLocation 훅 사용
  const { retro_sentence, emotion, original_text } = location.state || {}; // 이전 페이지에서 전달된 state 받기

  // 타이핑 효과를 위한 텍스트와 현재 타이핑된 길이 상태 *********
  const fullText = "✨Analyzing your vibe.. Please wait! ✨";
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    // 텍스트 타이핑 애니메이션 로직 *********
    if (charIndex < fullText.length) {
      const typingTimer = setTimeout(() => {
        setDisplayedText(fullText.substring(0, charIndex + 1));
        setCharIndex(prevIndex => prevIndex + 1);
      }, 70); // 각 글자가 나타나는 속도 (ms)
      return () => clearTimeout(typingTimer);
    } else {
      // 타이핑이 완료되면 일정 시간 후 페이지 이동 *********
      const navigateTimer = setTimeout(() => {
        navigate('/main/diary/result', { state: { retro_sentence, emotion, original_text } }); // state 전달
      }, 1500); // 타이핑 완료 후 1.5초 뒤 페이지 이동
      return () => clearTimeout(navigateTimer);
    }
  }, [charIndex, fullText, navigate, retro_sentence, emotion]); // 의존성 배열에 retro_sentence, emotion 추가

  return (
    // Tailwind CSS를 사용하여 중앙 정렬 및 배경색 설정
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f9ff] p-4">
      <div className="text-center">
        <MemoryXTitle className="mb-6" /> {/* 마진 추가 */}
        
        {/* AI 분석 로딩 애니메이션 - 타이핑 효과 ********* */}
        <div className="flex justify-center items-center h-10"> {/* 높이 고정으로 레이아웃 흔들림 방지 ********* */}
          <p className="loading-text text-gray-700 text-lg whitespace-nowrap overflow-hidden"> {/* 텍스트 색상 및 크기 조정, 줄바꿈 방지 ********* */}
            {displayedText}
            {/* 깜빡이는 커서 ********* */}
            <span className="animate-blink-cursor inline-block ml-0.5">|</span>
          </p>
        </div>
      </div>

      {/* Tailwind CSS @layer utilities에 커스텀 애니메이션 추가 (이 코드는 CSS 파일에 추가해야 합니다) *********
          <style>
            @keyframes blink-cursor {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
            .animate-blink-cursor {
              animation: blink-cursor 1s step-end infinite;
            }
          </style>
      */}
    </div>
  );
};

export default Diarylanding;
