import React, { useContext } from "react";
import { AuthContext } from "../../pages/user/AuthContext";

const WelcomeBanner = () => {
  const { user } = useContext(AuthContext);

  if (!user || !user.name) return null;

  return (
    <div className="px-2 py-1 text-sm font-bold text-gray-800">
      {/* 👋 {user.name}님, 환영합니다! */}
    </div>
  );
};

export default WelcomeBanner;