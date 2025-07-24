import React, { useContext } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../../pages/user/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GoogleLoginButton = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("✅ 받은 토큰:", tokenResponse.access_token);
      try {
        // const response = await axios.post("http://localhost:8080/auth/google"
        const response = await axios.post("http://memory-x.duckdns.org:8080/auth/google"
        
          , {
          accessToken: tokenResponse.access_token,
        }
      
      );

const userData = {
  provider: 'google',
  userId: response.data.userId,
  password: response.data.password,
  email: response.data.email,
  name: response.data.name,
  profileImage: response.data.profileImage, // 프로필 이미지 추가
  isNew: response.data.isNew
};



        localStorage.setItem("loginUser", JSON.stringify(userData)); // 저장
        login(userData); // Context 업데이트

        if (userData.isNew) {
          navigate("/signup", { state: userData });
        } else {
          navigate("/main");
        }
      } catch (err) {
        console.error("Google 사용자 정보 요청 실패", err);
      }
    },
    onError: () => {
      console.warn("Google 로그인 실패 또는 취소");
    },
    flow: "implicit",
  });

  return (
    <button onClick={loginWithGoogle} className="w-14 h-14">
      <img
        src="/icon/google.png"
        alt="구글 로그인"
        className="object-cover rounded-full h-14 w-14"
      />
    </button>
  );
};

export default GoogleLoginButton;
