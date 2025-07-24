// src/components/calendar/Calendar.jsx
import React, { useState, useEffect } from 'react'; // useEffect 훅을 import 합니다.

// 캘린더 컴포넌트 추가 *************
// selectedDate, onDateSelect, datesWithDiaries prop을 받도록 수정
const Calendar = ({ selectedDate, onDateSelect, datesWithDiaries }) => {
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date()); // 현재 캘린더에 표시될 월/년도

  // selectedDate prop이 변경될 때 캘린더의 표시 월을 업데이트 (선택 사항)
  useEffect(() => {
    if (selectedDate) {
      setCurrentDisplayDate(selectedDate);
    }
  }, [selectedDate]);

  // 이전 달로 이동 *************
  const goToPreviousMonth = () => {
    setCurrentDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // 다음 달로 이동 *************
  const goToNextMonth = () => {
    setCurrentDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // 현재 달의 첫 날과 마지막 날을 계산 *************
  const year = currentDisplayDate.getFullYear();
  const month = currentDisplayDate.getMonth(); // 0부터 11까지 (1월-12월)
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0); // 다음 달 0일 = 이번 달 마지막 날

  // 달력에 표시될 날짜 배열 생성 *************
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0(일요일)부터 6(토요일)까지

  const calendarDays = [];
  // 이전 달의 빈 칸 채우기 *************
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // 현재 달의 날짜 채우기 *************
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }
  // 다음 달의 빈 칸 채우기 (총 42칸 또는 35칸을 맞추기 위해) *************
  const remainingCells = 42 - calendarDays.length; // 6주 기준
  for (let i = 0; i < remainingCells; i++) {
    calendarDays.push(null);
  }

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // 🚨🚨🚨 디버깅을 위한 console.log 추가 🚨🚨🚨
  console.log("--- Calendar Debugging ---");
  console.log("datesWithDiaries (일기가 있는 날짜들):", datesWithDiaries);
  console.log("현재 캘린더 표시 월/년도:", currentDisplayDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }));
  console.log("--------------------------");


  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6"> {/* ************* */}
      {/* 월 이동 및 현재 월 표시 헤더 ************* */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousMonth} className="text-gray-600 text-2xl px-2 py-1 rounded-full hover:bg-gray-100 transition-colors">
          &lt;
        </button>
        <h3 className="font-singleday text-xl font-bold text-gray-800">
          {currentDisplayDate.toLocaleString('ko-KR', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={goToNextMonth} className="text-gray-600 text-2xl px-2 py-1 rounded-full hover:bg-gray-100 transition-colors">
          &gt;
        </button>
      </div>

      {/* 요일 헤더 ************* */}
      <div className="font-singleday grid grid-cols-7 text-center text-sm font-semibold text-gray-500 mb-2">
        {dayNames.map(day => (
          <div key={day} className={day === '일' ? 'text-red-500' : (day === '토' ? 'text-blue-500' : '')}>
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 ************* */}
      <div className="grid grid-cols-7 gap-1 text-center text-gray-700">
        {calendarDays.map((day, index) => {
          const isCurrentMonthDay = day !== null;
          const fullDate = isCurrentMonthDay ? new Date(year, month, day) : null;
          const formattedDate = fullDate ? fullDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') : null; // 'YYYY.MM.DD' 형식

          // 일기가 있는 날짜인지 확인
          const hasDiary = formattedDate && datesWithDiaries.includes(formattedDate);
          
          // 오늘 날짜인지 확인
          const isToday = fullDate && new Date().toDateString() === fullDate.toDateString();

          // 선택된 날짜인지 확인
          const isSelected = selectedDate && fullDate && selectedDate.toDateString() === fullDate.toDateString();

          return (
            <div
              key={index}
              className={`p-2 rounded-md relative ${ // relative 추가하여 점 위치 조정
                !isCurrentMonthDay
                  ? 'bg-gray-50 text-gray-300' // 빈 칸 스타일
                  : 'font-singleday hover:bg-gray-100 cursor-pointer' // 날짜 칸 스타일
              } ${
                isToday
                  ? 'bg-blue-100 border border-blue-400' // 오늘 날짜 강조
                  : ''
              } ${
                isSelected
                  ? 'border-2 border-blue-500 rounded-full' // 선택된 날짜 스타일
                  : ''
              }`}
              onClick={() => isCurrentMonthDay && onDateSelect(fullDate)} // 날짜 클릭 이벤트
            >
              {day}
              {/* 일기가 있는 날짜에 점 표시 */}
              {hasDiary && (
                <div className="absolute bottom-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div> // 점 위치 조정
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
