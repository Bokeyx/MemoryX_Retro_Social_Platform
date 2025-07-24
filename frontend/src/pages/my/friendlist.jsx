import React from 'react';
import MemoryXTitle from "../../components/memoryx/Memoryx";
import Footer from "../../components/footer/Footer";
import DM from "../../components/dm/DM"; // ✅ 꼭 이거 사용!
import FriendListPage from './feed/FriendListPage';

const FriendList = () => {
  return (
    <div className="min-h-screen pb-20 bg-[#f0f9ff] px-4 py-6">
      <div className="relative mb-4">
        {/* MEMORY X 타이틀 */}
        <div className="text-center">
          <MemoryXTitle className="text-2xl" />
        </div>

        {/* DM 아이콘 - 우측 상단에 작게 배치 */}
        <div className="absolute bottom-0 right-2">
          <DM className="w-[40px] h-[40px]" />
        </div>
      </div>
    <div className="relative mb-4">
  {/* 선: 위에 딱 붙고 살짝 더 넓게 */}
<hr
  className="
    mt-2              // 위 여백 (4=16px, 2=8px, 1=4px 등 조절)
    w-[100%]           // 너비 (예: 96%, 98%, calc(...) 도 가능)
    mx-auto           // 가운데 정렬
    border-t
    border-gray-300   // 색상 (gray-400, gray-200 등도 가능)
  "
/>
  </div>
  <FriendListPage />
<Footer />
</div>
  );
};

export default FriendList;