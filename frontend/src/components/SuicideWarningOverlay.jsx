import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuicideWarningOverlay = ({ suicideWarning }) => {
  const navigate = useNavigate();

  if (!suicideWarning) {
    return null; // suicideWarning prop이 없으면 아무것도 렌더링하지 않음
  }

  const handleGoHome = () => {
    navigate('/main');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // 반투명 검은색 배경
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000, // 다른 요소 위에 표시
      backdropFilter: 'blur(5px)' // 뒷부분이 흐려지게 (선택 사항, CSS 지원 여부 확인 필요)
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '10px',
        textAlign: 'center',
        maxWidth: '500px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        color: '#333'
      }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '15px' }}>경고</h2>
        <p style={{ fontSize: '1.1em', marginBottom: '10px' }}>          {suicideWarning.message.split('\n').map((line, index) => (            <React.Fragment key={index}>              {line}              {index < suicideWarning.message.split('\n').length - 1 && <br />}            </React.Fragment>          ))}</p>
        <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#d32f2f', marginBottom: '20px' }}>
          {suicideWarning.contact}
        </p>
        <button
          onClick={handleGoHome}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em'
          }}
        >
          홈으로 가기
        </button>
      </div>
    </div>
  );
};

export default SuicideWarningOverlay;
