// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';
import './App.css';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './pages/user/AuthContext';

// ✅ .env에서 구글 클라이언트 ID 불러오기
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const App = () => (
  <GoogleOAuthProvider clientId={clientId}>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </GoogleOAuthProvider>
);

export default App;
