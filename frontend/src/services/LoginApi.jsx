// src/services/loginApi.jsx
import axios from 'axios';

const login = async (id, password) => {
  const response = await axios.post('/api/users/login', {
    userId: id,
    password: password
  });

  const data = response.data;

  // ✅ 여기서 바로 토큰 저장
  if (data.token) {
    localStorage.setItem("accessToken", data.token);
  }

  return data;
};

export default { login };
