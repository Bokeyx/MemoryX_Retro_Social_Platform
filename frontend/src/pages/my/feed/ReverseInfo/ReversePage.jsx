import React, { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MemoryXTitle from "@/components/memoryx/Memoryx";
import axios from "axios";
import { AuthContext } from "@/pages/user/AuthContext.jsx";
import styles from './ReversePage.module.css';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/despgicej/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = 'memoryx_unsigned_preset';

// InputField 컴포넌트 정의
const InputField = ({ icon, placeholder, required, value, disabled, type = "text", name, onChange }) => (
    <div className={`${styles.inputFieldContainer} ${disabled ? styles.disabledInputField : ''}`}>
        <span className={styles.inputFieldIcon}>{icon}</span>
        <input
            type={type}
            placeholder={placeholder}
            required={required}
            value={value}
            disabled={disabled}
            name={name}
            onChange={onChange}
            className={styles.inputField}
        />
    </div>
);

const ReverseInfo = () => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { user, updateUserProfile, logout } = useContext(AuthContext);

    const [userInfo, setUserInfo] = useState(null);
    const [originalUserInfo, setOriginalUserInfo] = useState(null);
    const [previewImage, setPreviewImage] = useState("");
    const [imageChanged, setImageChanged] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 비밀번호 확인
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [passwordMismatchError, setPasswordMismatchError] = useState(false);

    // 팝업창 상태 관리
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showInfoPopup, setShowInfoPopup] = useState(false);
    const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false);
    const [showDeleteCompletePopup, setShowDeleteCompletePopup] = useState(false);
    const [showLogoutConfirmPopup, setShowLogoutConfirmPopup] = useState(false);
    const [showLogoutCompletePopup, setShowLogoutCompletePopup] = useState(false);

    useEffect(() => {
        if (!user || !user.userId) {
            navigate("/login");
            return;
        }
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(`/api/users/listdetail/${user.userId}`);
                const fetchedUser = response.data;
                
                const initialUserInfo = {
                    id: fetchedUser.userId,
                    name: fetchedUser.name,
                    birthdate: fetchedUser.birth,
                    bloodType: fetchedUser.bloodType,
                    email: fetchedUser.email,
                    phone: fetchedUser.phone || '',
                    gender: fetchedUser.sex,
                    introduction: fetchedUser.introduction || '',
                    profileImage: fetchedUser.profileImage || "/logo.png",
                    password: "",
                    authProvider: fetchedUser.authProvider, // authProvider 추가
                };

                setUserInfo(initialUserInfo);
                setOriginalUserInfo(initialUserInfo);
                setPreviewImage(initialUserInfo.profileImage);
            } catch (err) {
                console.error("사용자 정보 불러오기 실패:", err);
                setError("사용자 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserInfo();
    }, [user, navigate]);

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setImageChanged(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageChanged || !fileInputRef.current.files[0]) return null;

        const file = fileInputRef.current.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const cloudinaryResponse = await axios.post(CLOUDINARY_URL, formData, { withCredentials: false });
        return cloudinaryResponse.data.secure_url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isInfoChanged = 
            userInfo.password !== "" ||
            userInfo.email !== originalUserInfo.email ||
            userInfo.phone !== originalUserInfo.phone ||
            userInfo.introduction !== originalUserInfo.introduction;

        if (!isInfoChanged && !imageChanged) {
            setShowInfoPopup(true);
            return;
        }

        if (userInfo.password || passwordConfirm) {
            if (userInfo.password !== passwordConfirm) {
                setPasswordMismatchError(true);
                return;
            } else {
                setPasswordMismatchError(false);
            }
        }

        setLoading(true);
        try {
            const newImageUrl = await uploadImage();
            
            const updateData = {
                name: userInfo.name,
                email: userInfo.email,
                phone: userInfo.phone,
                sex: userInfo.gender,
                introduction: userInfo.introduction,
                ...(userInfo.password && { password: userInfo.password }),
                ...(newImageUrl && { profileImage: newImageUrl })
            };
            
            await axios.put(`/api/users/${user.userId}`, updateData);
            
            // AuthContext의 user 정보를 업데이트하여 다른 페이지에 즉시 반영되도록 함
            updateUserProfile({
                name: userInfo.name, 
                email: userInfo.email,
                ...(newImageUrl && { profileImage: newImageUrl })
            });
            
            setShowSuccessPopup(true);
        } catch (err) {
            console.error("업데이트 실패:", err);
            alert("업데이트에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "passwordConfirm") {
            setPasswordConfirm(value);
        } else {
            setUserInfo(prev => ({ ...prev, [name]: value }));
        }
        if (passwordMismatchError) setPasswordMismatchError(false);
    };
    
    // [수정] 성공 팝업 닫기 핸들러
    const handleCloseSuccessPopup = () => {
        setShowSuccessPopup(false);
        // 페이지를 새로고침하는 대신, mypage로 이동합니다.
        // 이렇게 하면 AuthContext 상태가 유지되어 프로필 사진이 올바르게 반영됩니다.
        navigate("/main/mypage");
    };

    const handleCloseInfoPopup = () => setShowInfoPopup(false);
    
    const handleLogoutClick = () => setShowLogoutConfirmPopup(true);
    const confirmLogout = () => {
        setShowLogoutConfirmPopup(false);
        setShowLogoutCompletePopup(true);
    };
    const cancelLogout = () => setShowLogoutConfirmPopup(false);
    const handleCloseLogoutCompletePopup = () => {
        setShowLogoutCompletePopup(false);
        logout();
        navigate("/login");
    };

    const handleDeleteClick = () => setShowDeleteConfirmPopup(true);
    const confirmDeleteAccount = async () => {
        setShowDeleteConfirmPopup(false);
        setLoading(true);
        try {
            await axios.delete(`/api/users/${user.userId}`);
            setShowDeleteCompletePopup(true);
        } catch (err) {
            console.error("회원 탈퇴 실패:", err);
            alert("회원 탈퇴 처리 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };
    const cancelDelete = () => setShowDeleteConfirmPopup(false);
    const handleCloseDeleteCompletePopup = () => {
        setShowDeleteCompletePopup(false);
        logout();
        navigate("/login");
    };

    const getGenderDisplayValue = (genderCode) => {
        if (!genderCode) return '';
        const code = String(genderCode).toUpperCase();
        if (code === 'M' || code === '1') return '남성';
        if (code === 'F' || code === '2') return '여성';
        return '';
    };

    if (loading) return <div className={styles.loadingContainer}>로딩 중...</div>;
    if (error || !userInfo) return <div className={`${styles.loadingContainer} ${styles.errorText}`}>{error || "사용자 정보를 찾을 수 없습니다."}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <div className={styles.profileSection}>
                    <div className={styles.profileImg}>
                        <img
                            src={previewImage}
                            alt="프로필 미리보기"
                            className={styles.profileImage}
                        />
                        <button type="button" onClick={handleImageClick} className={styles.photoEditButton}>
                            사진수정
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className={styles.hiddenFileInput}
                        />
                    </div>
                    <div>
                        {(!userInfo.authProvider || userInfo.authProvider === 'local') && (
                            <InputField icon="👤" placeholder="아이디" value={userInfo.id} disabled />
                        )}
                        <InputField icon="✏️" placeholder="이름" value={userInfo.name} disabled />
                        <InputField icon="📅" placeholder="생년월일" value={userInfo.birthdate} disabled />
                        <InputField icon="💉" placeholder="혈액형/성별" value={`${userInfo.bloodType || ''}형 / ${getGenderDisplayValue(userInfo.gender)}`} disabled />
                    </div>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {userInfo.authProvider === 'local' && (
                        <>
                            <InputField icon="🔒" placeholder="새 비밀번호" type="password" name="password" value={userInfo.password} onChange={handleInputChange} />
                            <InputField
                                icon="🔒"
                                placeholder="비밀번호 확인"
                                type="password"
                                name="passwordConfirm"
                                value={passwordConfirm}
                                onChange={handleInputChange}
                            />
                            <div className={styles.fieldSpacingDiv}>
                                {passwordMismatchError && <p className={styles.errorMessage}>비밀번호가 일치하지 않습니다!</p>}
                            </div>
                        </>
                    )}
                    {(!userInfo.authProvider || userInfo.authProvider === 'local') && (
                        <InputField icon="📧" placeholder="이메일" type="email" name="email" value={userInfo.email} onChange={handleInputChange} required />
                    )}
                    <InputField icon="📱" placeholder="전화번호" type="tel" name="phone" value={userInfo.phone} onChange={handleInputChange} />
                    <InputField icon="🙋‍♂️" placeholder="자기소개" name="introduction" value={userInfo.introduction} onChange={handleInputChange} />
                    <button type="submit" className={styles.saveButton}>SAVE</button>
                    
                    <div className={styles.actionButtonsContainer}>
                        <button type="button" onClick={handleLogoutClick} className={styles.logoutButton}>
                            로그아웃
                        </button>
                        <button type="button" onClick={handleDeleteClick} className={styles.halfDeleteButton}>
                            회원 탈퇴
                        </button>
                    </div>
                </form>
            </div>

            {showInfoPopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <p className={styles.popupText}>정보 수정이 필요합니다.</p>
                        <button onClick={handleCloseInfoPopup} className={styles.popupButton}>확인</button>
                    </div>
                </div>
            )}
            {showSuccessPopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <p className={styles.popupText}>정상적으로 수정되었습니다 (●ˇ∀ˇ●)</p>
                        <button onClick={handleCloseSuccessPopup} className={styles.popupButton}>확인</button>
                    </div>
                </div>
            )}
            {showLogoutConfirmPopup && (
                 <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <p className={styles.popupText}>로그아웃을 진행하시겠습니까?</p>
                        <div className={styles.popupButtonsContainer}>
                            <button onClick={cancelLogout} className={styles.popupCancelButton}>아니오</button>
                            <button onClick={confirmLogout} className={styles.popupConfirmButton}>예</button>
                        </div>
                    </div>
                </div>
            )}
            {showLogoutCompletePopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <p className={styles.popupText}>정상적으로 로그아웃 되었습니다.</p>
                        <button onClick={handleCloseLogoutCompletePopup} className={styles.popupButton}>확인</button>
                    </div>
                </div>
            )}
            {showDeleteConfirmPopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <p className={styles.popupText}>정말로 회원 탈퇴를 진행하시겠습니까?</p>
                        <p className={styles.popupSubText}>이 작업은 되돌릴 수 없습니다.</p>
                        <div className={styles.popupButtonsContainer}>
                            <button onClick={cancelDelete} className={styles.popupCancelButton}>아니오</button>
                            <button onClick={confirmDeleteAccount} className={styles.popupConfirmButton}>예</button>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteCompletePopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <p className={styles.popupText}>회원탈퇴가 완료되었습니다.</p>
                        <button onClick={handleCloseDeleteCompletePopup} className={styles.popupButton}>확인</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReverseInfo;