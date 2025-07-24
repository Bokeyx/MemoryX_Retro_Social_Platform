import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'

// ✅ Axios 전역 설정
import axios from 'axios';
axios.defaults.withCredentials = true; // 모든 요청에 쿠키/세션 포함

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
