// src/pages/user/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MemoryXTitle from '../../components/memoryx/Memoryx';

const ResetPasswordPage = () => {
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPw !== confirmPw) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // ✅ 실제로는 여기서 백엔드에 변경 요청 보내야 함
    alert('비밀번호가 성공적으로 변경되었습니다!');
    navigate('/login'); // 로그인 페이지로 이동
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9ff]">
      <div className="w-[320px]">
       {/* 타이틀 + 선 묶음 */}
      <div className="flex flex-col items-center mb-6">
        <MemoryXTitle className="text-4xl" />
        <hr className="w-64 mt-2 border-t border-black" />
      </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center px-3 py-2 bg-white border rounded-lg bg-opacity-90">
            <span className="mr-2">🔐</span>
            <input
              type="password"
              placeholder="새 비밀번호"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="flex items-center px-3 py-2 bg-white border rounded-lg bg-opacity-90">
            <span className="mr-2">🔐</span>
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              className="w-full bg-transparent outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-2 font-bold tracking-widest text-white rounded-lg bg-sky-400 hover:bg-sky-500 font-retro"
          >
            SAVE
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
