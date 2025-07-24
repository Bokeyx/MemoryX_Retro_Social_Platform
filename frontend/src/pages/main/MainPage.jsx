// src/pages/main/MainPage.jsx
import React from "react";
import SearchBar from "../../components/search/SearchBar";
import FriendList from "../../components/friends/FriendList";
import FeedList from "../../components/feed/FeedList";
import MainLayout from "../../components/layout/MainLayout";
import WelcomeBanner from "../../components/common/WelcomeBanner";

const MainPage = () => {
  return (
    <MainLayout>
       <WelcomeBanner />
      {/* 검색창 */}
      <div className="relative mb-4">
        <SearchBar />
        <hr
          className="w-full mx-auto mt-3 border-t border-gray-300 "
        />
      </div>

      {/* 캐릭터 필터 */} 
      <FriendList />

      {/* 피드 카드 */}
      <FeedList />
    </MainLayout>  
  );
};

export default MainPage;
