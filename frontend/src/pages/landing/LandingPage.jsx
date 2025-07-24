import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SplashScreen from '../../components/landing/SpalshScreen';   // ✅ 타이포
import MemoryXTitle from '../../components/memoryx/Memoryx';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });   // 2초 뒤 로그인
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <SplashScreen />
      <MemoryXTitle className="text-4xl" />
      <hr className="w-64 mt-2 border-t border-black" />
    </div>
  );
};

export default LandingPage;
