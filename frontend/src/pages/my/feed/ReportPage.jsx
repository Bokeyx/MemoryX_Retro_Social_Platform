// src/pages/main/ReportDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import MemoryXTitle from "@/components/memoryx/Memoryx";
import Footer from "@/components/footer/Footer";
import DM from "@/components/dm/DM"; // ✅ 꼭 이거 사용!

// 아이콘 이미지 경로 (jsconfig.json 및 vite.config.js 설정 후 사용 가능)
import ManProfile from '@public/icon/man.png'; // 기본 프로필 아이콘

const ReportDetailPage = () => {
    <div className="min-h-screen pb-20 bg-[#f0f9ff] px-4 py-6">
      <div className="relative mb-4">
        {/* MEMORY X 타이틀 */}
        <div className="text-center">
          <MemoryXTitle className="text-2xl" />
        </div>

        {/* DM 아이콘 - 우측 상단에 작게 배치 */}
        <div className="absolute top-0 right-2">
          <DM className="w-[32px] h-[30px]" />
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
  <Footer />
  </div>
  const location = useLocation(); // 이전 페이지에서 전달된 state를 가져오기 위해 사용
  const navigate = useNavigate(); // 페이지 이동을 위해 사용

  // 이전 페이지에서 전달된 일촌평 정보 (실제 앱에서는 id를 통해 백엔드에서 가져올 수 있음)
  // 예시 데이터: location.state?.comment || { id: 0, authorNo: 0, authorName: "알 수 없음", date: "", comment: "일촌평 내용을 불러올 수 없습니다." }
  const [commentToReport, setCommentToReport] = useState(
    location.state?.comment || {
      id: 1,
      authorNo: 18,
      authorName: "김유신",
      date: "2025.02.04.",
      comment: "내가 쓴 일촌평 어때 마음에 들어?ㅋㅋㅋ",
      profileImg: ManProfile, // 프로필 이미지 추가
    }
  );

  // 신고 사유 체크박스 상태
  const [reportReasons, setReportReasons] = useState({
    spam: false,
    abusive: false,
    obscene: false,
    privacy: false,
    etc: false,
  });

  // 사용자 차단 체크박스 상태
  const [blockUser, setBlockUser] = useState(false);

  // 신고 완료 팝업 메시지 상태
  const [showPopup, setShowPopup] = useState(false);

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setReportReasons(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // 사용자 차단 체크박스 변경 핸들러
  const handleBlockUserChange = (e) => {
    setBlockUser(e.target.checked);
  };

  // 신고하기 버튼 클릭 핸들러
  const handleSubmitReport = () => {
    // 선택된 신고 사유 확인
    const selectedReasons = Object.keys(reportReasons).filter(key => reportReasons[key]);

    if (selectedReasons.length === 0) {
      alert("신고 사유를 하나 이상 선택해주세요."); // 실제 앱에서는 커스텀 모달 사용
      return;
    }

    // 여기에 실제 신고 로직 (백엔드 API 호출)을 구현합니다.
    // 예: fetch('/api/report', { method: 'POST', body: JSON.stringify({ commentId: commentToReport.id, reasons: selectedReasons, blockUser }) })
    // .then(response => response.json())
    // .then(data => {
    //   // 성공 처리
    //   setShowPopup(true); // 팝업 표시
    // })
    // .catch(error => {
    //   console.error("신고 실패:", error);
    //   alert("신고 처리에 실패했습니다. 다시 시도해주세요."); // 실제 앱에서는 커스텀 모달 사용
    // });

    console.log("신고 내용:", {
      commentId: commentToReport.id,
      reasons: selectedReasons,
      blockUser: blockUser,
    });

    // 성공적으로 신고되었다고 가정하고 팝업 표시
    setShowPopup(true);
  };

  // 팝업 닫기 핸들러 및 페이지 이동 (선택 사항)
  const handleClosePopup = () => {
    setShowPopup(false);
    // 팝업 닫은 후 이전 페이지로 돌아가거나 다른 페이지로 이동할 수 있습니다.
    navigate('/main/mypage');
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] p-4 flex flex-col items-center">
      <h1 className="font-retro text-3xl tracking-widest text-outline text-center mb-6">
        COMPLAIN
      </h1>

      {/* 신고할 일촌평 정보 카드 */}
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="font-singleday text-sm text-gray-700">
            NO. {commentToReport.authorNo} {commentToReport.authorName} ({commentToReport.date})
          </span>
        </div>
        <div className="flex items-start gap-3">
          <img
            src={commentToReport.profileImg}
            alt="프로필"
            className="w-10 h-10 object-contain border border-gray-200"
          />
          <p className="flex-1 text-gray-800 text-base">{commentToReport.comment}</p>
        </div>
      </div>

      {/* 신고 사유 및 차단 옵션 */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
        <h2 className="font-bold text-lg text-gray-800 mb-4">신고 사유 선택</h2>
        <div className="space-y-3">
          <label className="flex items-center text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="spam"
              checked={reportReasons.spam}
              onChange={handleCheckboxChange}
              className="form-checkbox h-5 w-5 text-[#56B7CF] rounded focus:ring-[#56B7CF]"
            />
            <span className="ml-2">스팸 또는 광고성 콘텐츠</span>
          </label>
          <label className="flex items-center text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="abusive"
              checked={reportReasons.abusive}
              onChange={handleCheckboxChange}
              className="form-checkbox h-5 w-5 text-[#56B7CF] rounded focus:ring-[#56B7CF]"
            />
            <span className="ml-2">욕설, 비방, 혐오 발언</span>
          </label>
          <label className="flex items-center text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="obscene"
              checked={reportReasons.obscene}
              onChange={handleCheckboxChange}
              className="form-checkbox h-5 w-5 text-[#56B7CF] rounded focus:ring-[#56B7CF]"
            />
            <span className="ml-2">음란물 또는 불쾌감을 주는 콘텐츠</span>
          </label>
          <label className="flex items-center text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="privacy"
              checked={reportReasons.privacy}
              onChange={handleCheckboxChange}
              className="form-checkbox h-5 w-5 text-[#56B7CF] rounded focus:ring-[#56B7CF]"
            />
            <span className="ml-2">사생활 침해 또는 명예훼손</span>
          </label>
          <label className="flex items-center text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="etc"
              checked={reportReasons.etc}
              onChange={handleCheckboxChange}
              className="form-checkbox h-5 w-5 text-[#56B7CF] rounded focus:ring-[#56B7CF]"
            />
            <span className="ml-2">기타</span>
          </label>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <label className="flex items-center text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={blockUser}
              onChange={handleBlockUserChange}
              className="form-checkbox h-5 w-5 text-red-500 rounded focus:ring-red-500"
            />
            <span className="ml-2">사용자를 차단하시겠습니까?</span>
          </label>
        </div>
      </div>

      {/* 신고하기 버튼 */}
      <button
        onClick={handleSubmitReport}
        className="bg-[#56B7CF] text-white px-8 py-3 rounded-full text-lg font-bold hover:brightness-110 transition w-full max-w-sm"
      >
        신고하기
      </button>

      {/* 신고 완료 팝업 */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="text-lg font-semibold mb-4">정상적으로 신고되었습니다.</p>
            <p className="text-gray-600 mb-6">상세히 검토해보겠습니다.</p>
            <button
              onClick={handleClosePopup}
              className="bg-[#56B7CF] text-white px-6 py-2 rounded-md hover:brightness-110 transition"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetailPage;