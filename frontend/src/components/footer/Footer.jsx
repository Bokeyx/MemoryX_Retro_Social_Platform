// src/components/footer/Footer.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const iconClass = "w-8 h-8"; // 32x32px 사이즈로 살짝 여유 있게

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-white border-t shadow-md">
      <button onClick={() => navigate("/main")}>
        <img src="/icon/home.png" alt="Home" className={iconClass} />
      </button>
      <button onClick={() => navigate("/main/diary")}>
        <img src="/icon/post.png" alt="Post" className={iconClass} />
      </button>
      <button onClick={() => navigate("/chat")}>
        <img src="/icon/community.png" alt="Community" className={iconClass} />
      </button>
      <button onClick={() => navigate("/main/mypage")}>
        <img src="/icon/profile.png" alt="Profile" className={iconClass} />
      </button>
    </footer>
  );
};

export default Footer;
