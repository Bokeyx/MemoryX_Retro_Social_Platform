import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemoryXTitle from '../../components/memoryx/Memoryx';
import apiClient from '../../api/apiService'; // apiClient 임포트

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState('findId'); // 'findId' 또는 'resetPassword'
  const [formData, setFormData] = useState({ userId: '', phoneNumber: '' });
  const [codeSent, setCodeSent] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [timer, setTimer] = useState(10); // 10초
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' }); // 메시지 상태

  // 타이머 카운트 다운
  useEffect(() => {
    if (codeSent && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setMessage({ text: '인증 시간이 만료되었습니다. 다시 시도해주세요.', type: 'error' });
      setCodeSent(false);
    }
  }, [codeSent, timer]);

  const handleChange = (e) => {
    setMessage({ text: '', type: '' });
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      let response;
      if (mode === 'findId') {
        console.log("Sending phone number for findId:", formData.phoneNumber);
        response = await apiClient.post('/api/find-id/send-code', {
          phoneNumber: formData.phoneNumber,
        });
      } else { // mode === 'resetPassword'
        response = await apiClient.post('/api/forgot-password/send-code', {
          userId: formData.userId,
          phoneNumber: formData.phoneNumber,
        });
      }

      if (response.status === 200) {
        setCodeSent(true);
        setTimer(10); // 타이머 재시작
        setMessage({ text: `인증코드가 전송되었습니다: ${response.data.code}`, type: 'success' });
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      setMessage({ text: '인증 코드 발송에 실패했습니다. 정보를 확인해주세요.', type: 'error' });
    }
  };

  const handleVerifyCode = async () => {
    setMessage({ text: '', type: '' });
    try {
      let response;
      if (mode === 'findId') {
        response = await apiClient.post('/api/find-id/verify-code', {
          phoneNumber: formData.phoneNumber,
          code: codeInput,
        });
        if (response.status === 200) {
          setMessage({ text: `찾으신 아이디는: ${response.data.userId} 입니다.`, type: 'success' });
          setCodeSent(false); // 인증 성공 후 코드 입력 필드 숨김
        }
      } else { // mode === 'resetPassword'
        response = await apiClient.post('/api/forgot-password/verify-code', {
          userId: formData.userId,
          phoneNumber: formData.phoneNumber,
          code: codeInput,
        });
        if (response.status === 200) {
          setShowPasswordFields(true);
          setCodeSent(false); // 인증 성공 후 코드 입력 필드 숨김
          setMessage({ text: '인증코드가 확인되었습니다. 새 비밀번호를 입력해주세요.', type: 'success' });
        }
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setMessage({ text: '인증 코드 확인에 실패했습니다. 유효하지 않거나 만료된 코드입니다.', type: 'error' });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (newPassword !== confirmPassword) {
      setMessage({ text: '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.', type: 'error' });
      return;
    }
    try {
      const response = await apiClient.post('/api/forgot-password/reset-password', {
        userId: formData.userId,
        newPassword: newPassword,
      });
      if (response.status === 200) {
        // 비밀번호 재설정 성공 시 바로 로그인 페이지로 이동하므로 메시지 불필요
        navigate('/login'); // 로그인 페이지로 이동
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({ text: '비밀번호 재설정에 실패했습니다.', type: 'error' });
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setFormData({ userId: '', phoneNumber: '' }); // 폼 데이터 초기화
    setCodeSent(false); // 인증 상태 초기화
    setCodeInput(''); // 인증 코드 입력 초기화
    setTimer(10); // 타이머 초기화
    setShowPasswordFields(false); // 비밀번호 필드 숨김
    setNewPassword(''); // 새 비밀번호 초기화
    setConfirmPassword(''); // 비밀번호 확인 초기화
    setMessage({ text: '', type: '' }); // 메시지 초기화
  };

  return (
    <div className="font-singleday min-h-screen flex items-center justify-center bg-[#f0f9ff] px-4 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
      >
        <img src="/icon/backblack.png" alt="Back" className="w-6 h-6" />
      </button>
      <div className="w-[320px]">
       {/* 타이틀 + 선 묶음 */}
      <div className="flex flex-col items-center mb-6">
        <MemoryXTitle className="text-4xl" />
        <hr className="w-64 mt-2 border-t border-black" />
      </div>

      <div className="flex justify-center m-4 space-x-4">
        <button
          onClick={() => handleModeChange('findId')}
          className={`px-4 py-2 rounded-lg font-bold font-retro ${mode === 'findId' ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          아이디 찾기
        </button>
        <button
          onClick={() => handleModeChange('resetPassword')}
          className={`px-4 py-2 rounded-lg font-bold font-retro ${mode === 'resetPassword' ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          비밀번호 찾기
        </button>
      </div>

        <form onSubmit={handleSendCode} className="space-y-4">
          {mode === 'resetPassword' && (
            <InputField icon="👤" name="userId" placeholder="아이디" value={formData.userId} onChange={handleChange} required />
          )}
          <InputField icon="📱" name="phoneNumber" placeholder="휴대폰 번호" value={formData.phoneNumber} onChange={handleChange} required />

          <button
            type="submit"
            className="w-full py-2 mt-2 font-bold tracking-widest text-white rounded-lg bg-[#56B7CF] hover:bg-sky-500 font-retro"
          >
            SEND CODE
          </button>
        </form>

        {message.text && (
          <div className={`mt-4 text-center font-bold ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
            {message.text}
          </div>
        )}

        {codeSent && (
          <div className="mt-6 space-y-2">
            <input
              type="text"
              placeholder="인증코드 입력"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full px-3 py-2 bg-white border rounded-lg outline-none"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>남은 시간: {String(timer).padStart(2, '0')}초</span>
              <button
                onClick={handleVerifyCode}
                className="font-bold text-sky-600 font-retro hover:underline"
              >
                인증 확인
              </button>
            </div>
          </div>
        )}

        {showPasswordFields && (
          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            <InputField icon="🔒" name="newPassword" type="password" placeholder="새 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <InputField icon="🔒" name="confirmPassword" type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <button
              type="submit"
              className="w-full py-2 mt-2 font-bold tracking-widest text-white rounded-lg bg-sky-400 hover:bg-sky-500 font-retro"
            >
              비밀번호 재설정
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const InputField = ({ icon, name, placeholder, value, onChange, required, type = 'text' }) => (
  <div className="flex items-center px-3 py-2 bg-white border rounded-lg bg-opacity-90">
    <span className="mr-2">{icon}</span>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-transparent outline-none"
    />
  </div>
);

export default ForgotPasswordPage;
