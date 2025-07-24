// src/components/feed/FeedButton.jsx
import React from "react";

const FeedButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="font-singleday px-6 py-2 mt-4 bg-[#50b7d8] text-white rounded-full text-sm hover:opacity-90"
    >
      더보기
    </button>
  );
};

export default FeedButton;
