import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MemoryXTitle from "../../components/memoryx/Memoryx.jsx";
import {
  registerUser,
  checkUserIdDuplicate,
} from "../../services/SingupApi.jsx";
import styles from "../my/feed/ReverseInfo/ReversePage.module.css";
import axios from 'axios'; // Cloudinary 업로드를 위해 axios를 추가합니다.

// --- Cloudinary 설정 ---
// 아래 값들은 실제 Cloudinary 계정 정보로 채워져야 합니다.
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/despgicej/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = 'memoryx_unsigned_preset';


const SignupPage = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const provider = location.state?.provider || "local"; // "local", "google", or "kakao"
  const isSocial = provider === "google" || provider === "kakao";

  // [추가] 실제 이미지 파일 객체를 담을 상태
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("/logo.png");
  const [isCustomImage, setIsCustomImage] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errors, setErrors] = useState({});
  const [isIdAvailable, setIsIdAvailable] = useState(null);
  const [hasClickedDefaultImage, setHasClickedDefaultImage] = useState(false);

  const [formData, setFormData] = useState({
    userId: isSocial ? location.state?.userId || "" : "",
    password: isSocial ? location.state?.password || "" : "",
    confirmPassword: "",
    name: provider === "google" ? location.state?.name || "" : "",
    email: isSocial ? location.state?.email || "" : "",
    birth: "",
    phone: "",
    sex: "",
    bloodType: "",
    introduction: "",
    profileImage: "", // 최종적으로 Cloudinary URL 또는 기본 이미지 경로가 저장될 필드
  });

  useEffect(() => {
    if (hasClickedDefaultImage) {
      let defaultImage = "";
      if (formData.sex === "1") defaultImage = "/image/man_profile.png";
      else if (formData.sex === "2") defaultImage = "/image/woman_profile.png";
      if (defaultImage) {
        setPreviewImage(defaultImage);
        setFormData((prev) => ({ ...prev, profileImage: defaultImage }));
        setIsCustomImage(false);
        setProfileImageFile(null); // 커스텀 이미지 파일 선택 해제
      }
    }
  }, [formData.sex, hasClickedDefaultImage]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
    navigate("/login");
  };

  const validateField = (name, value) => {
    let error = "";

    if (name === "userId" && provider === "local") {
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,20}$/.test(value)) {
        error = "영문+숫자 조합으로 4~20자여야 합니다.";
      }
    }

    if (name === "password" && provider === "local") {
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,100}$/.test(value)) {
        error = "영문+숫자 조합 4~100자여야 합니다.";
      }
    }

    if (name === "confirmPassword" && provider === "local") {
      if (value !== formData.password) {
        error = "비밀번호가 일치하지 않습니다.";
      }
    }

    if (name === "name" && provider !== "google" && !/^[A-Za-z가-힣]{1,50}$/.test(value)) {
      error = "한글 또는 영문으로 1~50자여야 합니다.";
    }

    if (name === "email") {
      if (value.length > 50) {
        error = "이메일은 최대 50자입니다.";
      } else if (provider === "local" && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/.test(value)) {
        error = "이메일은 영문@영문.com 형식이어야 합니다.";
      }
    }

    if (name === "phone") {
      const cleanedValue = value.replace(/[^0-9]/g, '');
      if (cleanedValue.length !== 11 || !/^010\d{8}$/.test(cleanedValue)) {
        error = "010으로 시작하는 11자리 숫자여야 합니다.";
      }
    }

    if (name === "birth" && value) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        error = "생년월일은 YYYY-MM-DD 형식으로 입력해주세요.";
      } else {
        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
          error = "유효하지 않은 날짜입니다. (예: 2월 30일)";
        } else if (date > new Date()) {
          error = "미래의 날짜는 선택할 수 없습니다.";
        }
      }
    }

    if (name === "introduction" && value.length > 100) {
      error = "자기소개는 최대 100자입니다.";
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "birth") {
      const cleaned = value.replace(/\D/g, "").slice(0, 8); // 숫자만 추출, 8자로 제한
      if (cleaned.length > 6) {
        processedValue = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6)}`;
      } else if (cleaned.length > 4) {
        processedValue = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
      } else {
        processedValue = cleaned;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    const error = validateField(name, processedValue);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (name === "userId") {
      setIsIdAvailable(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    for (const key in formData) {
      // confirmPassword는 별도 검증하므로 제외
      if (key === 'confirmPassword') continue;
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    }
    // [수정] 이미지 선택 유효성 검사: 커스텀 이미지 또는 기본 이미지가 선택되었는지 확인
    if (!isCustomImage && !formData.profileImage.includes('_profile.png')) {
        newErrors.profileImage = "❌ 기본 이미지 또는 사진 추가 필요.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- [핵심 수정] 회원가입 제출 로직 ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 기존 유효성 검사를 먼저 수행합니다.
    const formIsValid = validateForm();
    if (!formIsValid) {
      console.log("Validation failed, returning.");
      return;
    }

    if (provider === "local" && isIdAvailable !== true) {
      setErrors((prev) => ({
        ...prev,
        userId: "❌ 아이디 중복확인을 해주세요.",
      }));
      console.log("Local provider and ID not available, returning.");
      return;
    }

    let finalImageUrl = formData.profileImage; // 기본 이미지 URL 또는 기본 이미지 경로로 시작

    // 1. 만약 사용자가 새로운 이미지를 선택했다면, Cloudinary에 업로드합니다.
    if (profileImageFile && isCustomImage) {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', profileImageFile);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      try {
        const response = await axios.post(CLOUDINARY_URL, cloudinaryFormData,{
        withCredentials: false
      });
        finalImageUrl = response.data.secure_url; // 업로드 성공 후 받은 URL
      } catch (error) {
        console.error("Cloudinary 업로드 실패:", error);
        alert("이미지 업로드 중 오류가 발생했습니다.");
        return; // 업로드 실패 시 회원가입 중단
      }
    }

    // 2. 백엔드로 보낼 최종 데이터에 이미지 URL을 포함시킵니다.
    const submitData = {
      ...formData,
      profileImage: finalImageUrl, // Cloudinary URL 또는 기본 이미지 경로
      authProvider: provider,
    };

    if (provider === "local") delete submitData.confirmPassword;

    // 3. 최종 데이터를 백엔드로 전송하여 회원가입을 완료합니다.
    try {
      await registerUser(submitData);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
      alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // --- [핵심 수정] 이미지 변경 핸들러 ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file); // 업로드할 실제 파일 객체를 상태에 저장
      setPreviewImage(URL.createObjectURL(file)); // 임시 URL로 미리보기 생성
      setIsCustomImage(true);
      // 유효성 검사를 통과시키기 위해 임시 값을 설정하고, 에러를 지웁니다.
      setFormData(prev => ({ ...prev, profileImage: 'custom' }));
      setErrors(prev => ({ ...prev, profileImage: "" }));
    }
  };


  const handleSetDefaultImage = () => {
    setHasClickedDefaultImage(true);
    if (!formData.sex) {
      setShowAlert(true);
      return;
    }
    const defaultImage =
      formData.sex === "1"
        ? "/image/man_profile.png"
        : "/image/woman_profile.png";
    setPreviewImage(defaultImage);
    setFormData((prev) => ({ ...prev, profileImage: defaultImage }));
    setIsCustomImage(false);
    setProfileImageFile(null); // 커스텀 이미지 파일 상태 초기화
    setErrors(prev => ({ ...prev, profileImage: "" })); // 이미지 에러 초기화
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const checkDuplicateId = async () => {
    const userId = formData.userId.trim();
    if (!userId) {
      setErrors((prev) => ({
        ...prev,
        userId: "아이디를 입력하세요.",
      }));
      return;
    }
    const error = validateField("userId", userId);
    if (error) {
      setErrors((prev) => ({ ...prev, userId: error }));
      return;
    }

    try {
      const response = await checkUserIdDuplicate(userId);
      if (response.isDuplicate) {
        setIsIdAvailable(false);
        setErrors((prev) => ({
          ...prev,
          userId: "❌ 이미 존재하는 아이디입니다.",
        }));
      } else {
        setIsIdAvailable(true);
        setErrors((prev) => ({ ...prev, userId: "" }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        userId: "아이디 확인 중 오류 발생",
      }));
    }
  };

  return (
    <div className="font-singleday min-h-screen flex items-center justify-center bg-[#f0f9ff] px-4 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
      >
        <img src="/icon/backblack.png" alt="Back" className="w-6 h-6" />
      </button>
      {showAlert && (
        <div className="fixed z-50 px-6 py-3 text-center text-red-700 transform -translate-x-1/2 -translate-y-1/2 bg-red-100 border border-red-400 rounded shadow-lg top-1/2 left-1/2">
          성별을 선택하세요.
        </div>
      )}
      <div className="w-full max-w-xs">
        <div className="mb-6 text-center">
          <div className="flex flex-col items-center pt-4">
            <MemoryXTitle className="text-4xl" />
          </div>
          {previewImage && previewImage !== "/logo.png" && (
            <img
              src={previewImage}
              alt="프로필 이미지"
              className="object-cover w-24 h-24 mx-auto border border-gray-300"
            />
          )}
          <div className="flex justify-center gap-4 mt-2">
            <button
              type="button"
              onClick={handleImageClick}
              className="text-xs text-gray-500 underline"
            >
              사진추가
            </button>
            <button
              type="button"
              onClick={handleSetDefaultImage}
              className="text-xs text-gray-500 underline"
            >
              기본이미지 설정
            </button>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          {provider === "local" && (
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <InputField
                  icon="👤"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="아이디 (영문+숫자, 4자 이상)"
                  error={errors.userId}
                  required
                />
              </div>
              <button
                type="button"
                onClick={checkDuplicateId}
                className="flex-shrink-0 h-10 px-2 text-xs text-white rounded bg-sky-500 hover:bg-sky-600"
              >
                중복확인
              </button>
            </div>
          )}
          {provider === "local" && isIdAvailable === true && (
            <span className="ml-2 text-xs text-green-600">
              ✅ 사용 가능한 아이디입니다.
            </span>
          )}
          {provider === "local" && (
            <>
              <InputField
                icon="🔒"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호(영문+숫자,4자 이상)"
                error={errors.password}
                required
              />
              <InputField
                icon="🔒"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호 확인"
                error={errors.confirmPassword}
                required
              />
            </>
          )}
          {provider !== 'google' && (
            <InputField
              icon="✏️"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름"
              error={errors.name}
              required
              readOnly={provider === "google"}
            />
          )}
          {provider === 'local' && (
            <InputField
              icon="📧"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일(example@memoryx.com)"
              error={errors.email}
              required
              readOnly={isSocial}
            />
          )}
          <InputField
            icon="📅"
            type="text"
            name="birth"
            value={formData.birth}
            onChange={handleChange}
            placeholder="생년월일 (YYYY-MM-DD)"
            error={errors.birth}
            required
          />
          <InputField
            icon="📞"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="휴대폰 (01012345678)"
            error={errors.phone}
            required
          />
          <SelectField
            icon="⚧️"
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            options={[
              { value: "", label: "성별", disabled: true },
              { value: "1", label: "남자" },
              { value: "2", label: "여자" },
            ]}
            required
          />
          <SelectField
            icon="🩸"
            name="bloodType"
            value={formData.bloodType}
            onChange={handleChange}
            options={[
              { value: "", label: "혈액형", disabled: true },
              { value: "A", label: "A형" },
              { value: "B", label: "B형" },
              { value: "O", label: "O형" },
              { value: "AB", label: "AB형" },
            ]}
            required
          />
          <div className="flex flex-col px-3 py-2 text-sm tracking-wide bg-white border rounded-lg font-retro">
            <label className="flex items-center mb-1">
              <span className="mr-2">🗒️</span>
              <span className="text-xs text-gray-500">자기소개 (최대 100자)</span>
            </label>
            <textarea
              name="introduction"
              value={formData.introduction}
              onChange={handleChange}
              maxLength={100}
              placeholder="자신을 간단히 소개해보세요!"
              className="w-full h-24 placeholder-gray-400 bg-transparent outline-none resize-none"
            />
            {errors.introduction && (
              <span className="mt-1 text-xs text-red-500">
                {errors.introduction}
              </span>
            )}
            {errors.profileImage && (
              <span className="block mt-1 text-xs text-center text-red-500">
                {errors.profileImage}
              </span>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-4 tracking-widest text-white rounded-md font-retro bg-sky-400 hover:bg-sky-500"
          >
            SAVE
          </button>
        </form>
      </div>
      {showSuccessPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <p className={styles.popupText}>회원가입을 축하합니다!</p>
            <button onClick={handleCloseSuccessPopup} className={styles.popupButton}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({
  icon,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  error,
  readOnly = false,
}) => (
  <div className="flex flex-col">
    <div className={`flex items-center px-3 h-10 text-sm tracking-wide bg-white border rounded-lg font-retro ${error ? "border-red-400" : ""}`}>
      <span className="mr-2 text-lg">{icon}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        className="w-full placeholder-gray-400 bg-transparent outline-none"
      />
    </div>
    <div className="h-4 ml-2">
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  </div>
);

const SelectField = ({ icon, name, value, onChange, options, required = false }) => (
  <div className="flex items-center px-3 py-2 text-sm tracking-wide bg-white border rounded-lg font-retro">
    <span className="mr-2 text-lg">{icon}</span>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-transparent outline-none"
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default SignupPage;