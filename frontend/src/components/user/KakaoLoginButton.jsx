import React, { useEffect } from 'react';

const KakaoLoginButton = () => {
  const jsKey = import.meta.env.VITE_KAKAO_JS_KEY;
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(jsKey); // ✅ JavaScript 키로 초기화
    }
  }, [jsKey]);

  const handleKakaoLogin = () => {
    if (window.Kakao) {
      window.Kakao.Auth.authorize({
        redirectUri: redirectUri,
        throughTalk: false,
      });
    } else {
      console.error("❗ Kakao SDK가 로드되지 않았습니다.");
    }
  };

  return (
    <button onClick={handleKakaoLogin} className="w-14 h-14">
      <img
        src="/icon/kakao.png"
        alt="카카오 로그인"
        className="object-contain w-14 h-14"
      />
    </button>
  );
};

export default KakaoLoginButton;
