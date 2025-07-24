import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa'; // Ensure react-icons is installed
import { AuthContext } from '../../pages/user/AuthContext'; // AuthContext import

// 이미지 경로 그대로 사용 - ONLY THESE IMPORTS ARE USED
import ManProfile from '@public/icon/man.png';
import GirlProfile from '@public/icon/girl.png';

const DEBOUNCE_DELAY = 300; // 0.3초 지연

const SearchBar = ({ placeholder = '친구의 ID 또는 이름을 검색해보세요~' }) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // Get user from AuthContext
    const currentUserId = user ? user.userId : null; // Get current user's ID

    // 자동 완성 검색 관련 상태
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]); // 자동 완성 결과 목록
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false); // 추천 목록 보이기/숨기기
    const searchInputRef = useRef(null); // 검색 input 엘리먼트 참조
    const debounceTimeoutRef = useRef(null); // 디바운스 타이머 참조

    // 검색 실행 함수 (디바운스 적용 대상)
    const performSearch = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setSearchError(null);
            setSearchLoading(false);
            return;
        }

        setSearchLoading(true);
        setSearchError(null);

        try {
            // 실제 API 호출 (http://localhost:8080/api/users/search)
            console.log("Searching with query:", query, "and excluding userId:", currentUserId); // 디버깅용
            const response = await fetch(`/api/users/search2?query=${encodeURIComponent(query)}${currentUserId ? `&excludeUserId=${currentUserId}` : ''}`);

            if (!response.ok) {
                if (response.status === 204) { // No Content
                    setSearchResults([]);
                } else {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }
            } else {
                const data = await response.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error("친구 검색 실패:", error);
            setSearchError("검색된 친구 없음..눈물을 흘린㈂ㅏ....");
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, []); // 의존성 없음 (query는 인자로 받음)

    // 검색 입력 변경 핸들러 (디바운스 적용)
    const handleSearchInputChange = useCallback((e) => {
        const value = e.target.value;
        setSearchQuery(value); // 입력 필드 값 업데이트

        // 기존 타이머 클리어
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // 새 타이머 설정
        debounceTimeoutRef.current = setTimeout(() => {
            performSearch(value); // 지연 후 검색 실행
        }, DEBOUNCE_DELAY);

        // 입력값이 있을 때만 추천 목록을 보여줌
        setShowSuggestions(value.trim().length > 0);
    }, [performSearch]);

    // 검색 추천 항목 클릭 시
    const handleSuggestionClick = useCallback((user) => {
        setSearchQuery(user.name); // 검색 필드에 선택된 이름 채우기
        setSearchResults([]); // 추천 목록 숨기기
        setShowSuggestions(false); // 추천 목록 숨기기
        // 선택된 친구의 프로필 페이지로 이동
        navigate(`/main/friendpage/${user.userId}`);
        // alert(`${user.name}(${user.userId}) 선택됨!`); // 디버깅용 알림, 실제 앱에서는 제거
    }, [navigate]);

    // 검색 필드 외의 영역 클릭 시 추천 목록 숨기기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="relative mb-6" ref={searchInputRef}>
            <div className="font-singleday flex items-center bg-white rounded-full p-2 border border-gray-300 shadow-sm">
                <FaSearch className="h-5 w-5 text-gray-400 ml-2" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="flex-1 ml-2 text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => setShowSuggestions(searchQuery.trim().length > 0)} // 포커스 시에도 추천 목록 보이기
                />
            </div>

            {/* 자동 완성 추천 목록 */}
            {showSuggestions && (searchLoading || searchResults.length > 0 || searchError) && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {searchLoading && (
                        <div className="font-singleday p-3 text-center text-gray-500">검색 중...</div>
                    )}
                    {!searchLoading && searchError && (
                        <div className="font-singleday p-3 text-center text-red-500">{searchError}</div>
                    )}
                    {!searchLoading && !searchError && searchQuery.trim() && searchResults.length === 0 && (
                        <div className="font-singleday p-3 text-center text-gray-500">
                            '{searchQuery}'에 대한 검색 결과가 없습니다.
                        </div>
                    )}
                    {!searchLoading && searchResults.length > 0 && (
                        <ul>
                            {searchResults.map((user) => (
                                <li
                                    key={user.userId}
                                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                                    onClick={() => handleSuggestionClick(user)}
                                >
                                    <img
                                        src={user.profileImage || ManProfile} // 기본 이미지 폴백
                                        alt="프로필"
                                        className="w-10 h-10 object-contain rounded-full mr-3 border border-gray-200"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-800">{user.name}</p>
                                        <p className="text-sm text-gray-500">ID: {user.userId}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
