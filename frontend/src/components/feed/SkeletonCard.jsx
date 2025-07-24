import React from "react";

/**
 * 데이터 로딩 중에 표시될 스켈레톤 UI 컴포넌트입니다.
 * animate-pulse 클래스로 은은한 맥박 애니메이션 효과를 줍니다.
 */
const SkeletonCard = () => (
  <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-md p-4 animate-pulse">
    {/* 프로필 섹션 스켈레톤 */}
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
    
    {/* 콘텐츠 이미지 스켈레톤 */}
    <div className="h-48 bg-gray-300 rounded mb-4"></div>
    
    {/* 콘텐츠 텍스트 스켈레톤 */}
    <div className="h-4 bg-gray-300 rounded w-full"></div>
    <div className="h-4 bg-gray-300 rounded w-5/6 mt-2"></div>
  </div>
);

export default SkeletonCard;
