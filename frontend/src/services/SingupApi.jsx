// src/services/SignupApi.js
// src/services/SingupApi.jsx
import axios from "axios";

// 회원가입 요청 API
export const registerUser = async (userData) => {
  try {
    const response = await axios.post("/api/users/register", userData); // withCredentials 생략 가능
    return response.data;
  } catch (error) {
    console.error("회원가입 실패:", error);
    throw error;
  }
};

// 사용자 ID 중복 확인 API
export const checkUserIdDuplicate = async (userId) => {
  try {
    console.log("💬 보내는 userId:", userId); // ← 이거 꼭 추가해서 확인
    const response = await axios.get(`/api/users/check-duplicate/${userId}`);
    return response.data; // { isDuplicate: true/false }
  } catch (error) {
    console.error("ID 중복 확인 실패:", error);
    throw error;
  }
};