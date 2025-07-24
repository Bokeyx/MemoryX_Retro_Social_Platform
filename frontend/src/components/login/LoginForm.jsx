import React, { useState } from "react";
import MemoryXTitle from "../memoryx/Memoryx";
import KakaoLoginButton from "../user/KakaoLoginButton";
import GoogleLoginButton from "../user/GoogleLoginButton";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ onLogin, error }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center w-72 animate-fade-in mt-[12vh]">
      {/* 타이틀 + 선 묶음 */}
      <div className="flex flex-col items-center mb-6">
        <MemoryXTitle className="text-4xl" />
        <hr className="w-64 mt-2 border-t border-black" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onLogin(userId, password, false); // 일반 로그인
        }}
        className="w-full"
      >
        {/* 아이디 입력 */}
        <input
          type="text"
          placeholder="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-4 py-3 mt-5 font-retro border border-gray-300 rounded-md focus:outline-none"
        />
        {error && (
          <p className="mb-2 ml-1 text-sm font-bold text-red-500"> {error}</p>
        )}

        {/* 비밀번호 입력 */}
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 mb-1 font-retro border border-gray-300 mt-5 rounded-md focus:outline-none"
        />
        {error && (
          <p className="mb-4 ml-1 text-sm font-bold text-red-500"> {error}</p>
        )}

        <button
          type="submit"
          className="w-full py-3 tracking-widest text-white transition-colors mt-10 rounded-md bg-[#56B7CF] font-retro hover:bg-sky-500"
        >
          LOG&nbsp;IN
        </button>

        <div className="flex flex-col items-center mt-4 text-xs tracking-widest text-gray-800 font-retro">
          <button
            type="button"
            className="mb-2 hover:underline"
            onClick={() => navigate("/forgot-password")}
          >
            FORGOT&nbsp;PASSWORD?
          </button>
          <button
            type="button"
            onClick={() => navigate("/signup", { state: { provider: "local" } })} 
            className="hover:underline"
          >
            SIGN&nbsp;UP
          </button>
        </div>
      </form>

      {/* ✅ 소셜 로그인은 form 밖에 있어야 함 */}
      <div className="flex flex-col items-center mt-6 space-y-3">
        <div className="flex items-center justify-center w-full text-sm text-gray-500"></div>

        <div className="flex gap-3">
          <KakaoLoginButton />
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
