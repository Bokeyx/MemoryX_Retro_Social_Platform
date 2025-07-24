// src/components/dm/DM.jsx
import React from "react";
import { useNavigate } from 'react-router-dom'; // useNavigate 훅 임포트 *********

const DM = ({ className = '' }) => {
  const navigate = useNavigate(); // useNavigate 훅 초기화 *********

  const handleDmClick = () => {
    navigate('/main/alert'); // 클릭 시 /main/alert 경로로 이동 *********
  };

  return (
    // img 태그에 onClick 핸들러 추가 *********
    <img 
      src="/icon/alert.png" 
      alt="DM" 
      className={`cursor-pointer ${className}`} // 클릭 가능한 커서 스타일 추가 *********
      onClick={handleDmClick} // 클릭 이벤트 연결 *********
    />
  );
};

export default DM;
