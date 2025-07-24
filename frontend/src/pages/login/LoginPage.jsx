import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/login/LoginForm.jsx";
import loginApi from "../../services/LoginApi.jsx";
import { AuthContext } from "../../pages/user/AuthContext.jsx";

const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext); // 🔥 여기서 login 함수만 사용

  const handleLogin = async (id, pw, isSocial = false) => {
    try {
      const data = await loginApi.login(id, pw);
      console.log("로그인 성공", data);

      // ✅ accessToken 저장
      localStorage.setItem("accessToken", data.token);

      // ✅ 사용자 정보 전역 상태로 저장
      // 🔥 user 상태 업데이트 및 토큰 저장은 login()에서 처리함
      login({
        userId: data.userId,
        name: data.name,
        email: data.email,
        token: data.token,
        profileImage: data.profileImage, // Add this line
        introduction: data.introduction
      });


      setError("");
      navigate("/main");
    } catch (err) {
      console.error("로그인 실패", err);
      if (!isSocial) {
        setError("올바르지 않은 정보입니다 !!");
      }
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <LoginForm onLogin={handleLogin} error={error} />
    </div>
  );
};

export default LoginPage;