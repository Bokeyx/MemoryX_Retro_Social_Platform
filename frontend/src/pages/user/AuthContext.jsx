// src/pages/user/AuthContext.jsx
import React, { createContext, useState } from 'react';

// 1. context 생성
export const AuthContext = createContext();

// 2. provider 정의
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // 로그인 시 localStorage에 저장 + 상태 업데이트
  const login = (userData) => {
    console.log("AuthContext: Setting user data:", userData); // ADD THIS LINE
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', userData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const updateUserProfile = (updates) => {
    console.log("AuthContext: updateUserProfile called with updates:", updates); // Add this
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log("AuthContext: User state updated to:", updatedUser); // Add this
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserProfile, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
