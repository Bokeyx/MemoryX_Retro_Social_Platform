// 파일 경로: frontend/src/services/apiService.js

import axios from "axios";

// .env 파일에서 단일 기본 URL을 가져옵니다. (ngrok 또는 localhost)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ✅ 우리 서비스(Nginx를 통해 접근)를 위한 단일 axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// ✅ JWT 토큰 자동 부착 인터셉터는 그대로 유지합니다. (아주 중요한 기능!)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 디버깅을 위해 최종 API URL 출력
console.log("Unified API Base URL:", API_BASE_URL);

// --- FastAPI AI 백엔드 API 호출 ---
export const transformDiary = async (modernSentence) => {
  try {
    // Nginx가 /api/ai/ 경로를 보고 FastAPI로 보내줍니다.
    const response = await apiClient.post(
      `/api/ai/transform-diary`, 
      { modern_sentence: modernSentence }
    );
    return response.data;
  } catch (error) {
    console.error("Error transforming diary:", error);
    throw error;
  }
};

// --- Spring Boot 백엔드 API 호출 ---
export const fetchUsers = async () => {
  try {
    // Nginx가 /api/users 경로를 보고 Spring Boot로 보내줍니다.
    const response = await apiClient.get('/api/users');
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// --- TMDB API 호출 (외부 서비스) ---
// ✅ 이 함수는 우리 서버를 거치지 않으므로, 기존 axios를 그대로 사용합니다.
export const searchMoviesTMDB = async (query) => {
  const TMDB_API_TOKEN = import.meta.env.VITE_TMDB_API_TOKEN;
  if (!TMDB_API_TOKEN) {
    console.error("TMDB API Token is not set in .env");
    throw new Error("TMDB API Token is missing.");
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie`,
      {
        params: { query: query, language: "ko-KR" },
        headers: {
          Authorization: `Bearer ${TMDB_API_TOKEN}`,
          "Content-Type": "application/json;charset=utf-8",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching movies from TMDB API:", error);
    throw error;
  }
};

// ✅ 다른 파일에서 apiClient를 직접 사용할 수 있도록 export
export default apiClient;
