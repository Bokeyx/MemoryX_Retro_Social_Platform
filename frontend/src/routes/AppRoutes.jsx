import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import LandingPage from "../pages/landing/LandingPage.jsx";
import LoginPage from "../pages/login/LoginPage.jsx";
import KakaoCallbackPage from "../pages/user/KakaoCallbackPage.jsx";
import SignupPage from "../pages/signup/SignupPage.jsx";
import MainPage from "../pages/main/MainPage.jsx";
import ForgotPasswordPage from "../pages/login/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/user/ResetPasswordPage.jsx";
import MyPage from "../pages/my/MyPage.jsx";
{
  /* 🔵 추가 */
}
import FriendList from "../pages/my/friendlist.jsx";
{
  /* 🔵 추가 */
}
import ReportDetailPage from "../pages/my/feed/ReportPage.jsx";
{
  /* 🔵 추가 */
}
import ReverseInfo from "/src/pages/my/feed/ReverseInfo/ReversePage.jsx";
{
  /* 🔵 추가 */
}
import FriendPage from "../pages/friend/Friendpage.jsx";
{
  /* 🔵 추가 */
}
import F2FListPage from "../pages/friend/F2FListPage.jsx";
{
  /* 🔵 추가 */
}
import Diary from "../pages/diary/DiaryPage.jsx";
import Diarylanding from "../pages/diary/DiaryLandingPage.jsx";
import MainLayout from "../components/layout/MainLayout.jsx";
import RandomChat from "../pages/chat/RandomChat.jsx";
import DiaryResult from "../pages/saveDiary/DiaryResult.jsx"; // 🔵 추가
import AlertPage from "../pages/alert/AlertPage.jsx"; // 🔵 추가
import PrivateRoute from "../components/login/PrivateRoute.jsx";
import MyPageMain from "../pages/my/MyPageMain.jsx";
import ChatMain from "../pages/chat/ChatMain.jsx";
import ChatPage from "../pages/chat/ChatPage.jsx";
import ReverseMain from "../pages/my/feed/ReverseInfo/ReverseMain.jsx";
import FriendMainPage from "../pages/friend/FriendMainPage.jsx";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/oauth/callback/kakao" element={<KakaoCallbackPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
    <Route
      path="/main"
      element={
        <PrivateRoute>
          <MainPage />
        </PrivateRoute>
      }
    />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/main/mypage" element={<MyPageMain />} />
    <Route path="/main/mypage/friendlist" element={<FriendList />} />{" "}
    <Route path="/main/mypage/report" element={<ReportDetailPage />} />{" "}
    <Route path="/main/mypage/reverse" element={<ReverseMain />} />{" "}
    
    <Route path="/main/friendpage/:id" element={<FriendMainPage />} />{" "}
    <Route path="/main/friendpage/:id/friendlist" element={<F2FListPage />} />{" "}
    
    <Route path="/main/diary" element={<Diary />} />
    <Route path="/main/diary/loading" element={<Diarylanding />} />{" "}
    <Route path="/main/diary/result" element={<DiaryResult />} />
    <Route path="/main/alert" element={<AlertPage />} />
    <Route path="/chat" element={<ChatMain />}/>
    <Route path="/chat/:emotionId" element={<ChatPage />} />
    
  </Routes>
);

export default AppRoutes;
