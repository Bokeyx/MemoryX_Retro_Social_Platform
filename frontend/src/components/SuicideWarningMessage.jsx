import React from 'react';

const SuicideWarningMessage = ({ suicideWarning }) => {
  if (!suicideWarning) {
    return null; // suicideWarning prop이 없으면 아무것도 렌더링하지 않음
  }

  return (
    <div className="suicide-warning-container" style={{
      backgroundColor: '#ffebee', // 예시: 연한 빨간색 배경
      border: '1px solid #ef9a9a', // 예시: 테두리
      borderRadius: '8px',
      padding: '16px',
      margin: '20px 0',
      textAlign: 'center',
      fontFamily: 'sans-serif', // 예시 폰트
      color: '#c62828' // 예시: 진한 빨간색 텍스트
    }}>
      <p style={{ fontSize: '1.1em', fontWeight: 'bold', marginBottom: '10px' }}>
        {suicideWarning.message}
      </p>
      <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
        {suicideWarning.contact}
      </p>
      {/* 여기에 디자인에 맞는 추가적인 아이콘이나 이미지 등을 넣을 수 있습니다. */}
      {/* 예: <img src="/path/to/your/design/icon.png" alt="Warning Icon" style={{ width: '50px', height: '50px', marginTop: '10px' }} /> */}
    </div>
  );
};

export default SuicideWarningMessage;
