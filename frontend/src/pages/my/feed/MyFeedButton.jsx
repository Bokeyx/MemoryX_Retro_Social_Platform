// src/components/feed/FeedButton.jsx
import React from "react";

const MyFeedButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="font-singleday px-4 py-2 mt-0 bg-[#50b7d8] text-white rounded-full text-sm hover:opacity-90"
    >
      더보기
    </button>
  );
};

export default MyFeedButton;
