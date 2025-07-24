import { useEffect, useContext, useRef } from "react"; // 1. useRef를 import 합니다.
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function KakaoCallbackPage() {
  const [params] = useSearchParams();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const hasFetched = useRef(false); // 2. API 호출 여부를 추적할 ref를 생성합니다.

  useEffect(() => {
    // 3. 이미 API가 호출되었다면, 즉시 실행을 중단합니다.
    if (hasFetched.current) {
      return;
    }

    const code = params.get("code");
    const VITE_KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
    const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI

    const fetchKakaoUser = async () => {
      try {
        console.log("🔑 인가 코드:", code);
        console.log("📨 redirect_uri:", REDIRECT_URI);
        console.log("🔐 client_id:", VITE_KAKAO_REST_API_KEY);

        const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: VITE_KAKAO_REST_API_KEY,
            redirect_uri: REDIRECT_URI,
            code: code,
          }),
        });

        const tokenData = await tokenRes.json();
        console.log("🪪 토큰 응답 전체:", tokenData);

        if (!tokenData.access_token) {
          console.error("❗ access_token 없음: 인가 코드가 유효하지 않거나 이미 사용됨");
          navigate("/login"); // 실패 시 로그인 페이지로 이동하는 것이 좋습니다.
          return;
        }

        const accessToken = tokenData.access_token;

        const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const userData = await userRes.json();
        console.log("👤 사용자 정보:", userData);

        

        const userIdFromKakao = String(userData.id);
        const generatedUsername = userIdFromKakao.substring(0, 20); // client_id의 앞에서부터 최대 20자
        const passwordLength = Math.ceil(userIdFromKakao.length / 2);
        const finalPasswordLength = passwordLength % 2 !== 0 ? passwordLength + 1 : passwordLength;
        const generatedPassword = userIdFromKakao.substring(0, finalPasswordLength);

        try {
          // const response = await fetch("http://210.119.12.98:8080/auth/kakao"
           const response = await fetch("http://memory-x.duckdns.org:8080/auth/kakao"
            , {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userIdFromKakao,
              username: generatedUsername,
              password: generatedPassword,
            }),
          });

          const backendData = await response.json();

          const userDataForAuth = {
            provider: 'kakao',
            userId: backendData.userId,
            password: backendData.password,
            email: backendData.email, // 백엔드에서 제공하는 이메일 (선택 사항)
            name: backendData.name,   // 백엔드에서 제공하는 이름 (선택 사항)
            profileImage: backendData.profileImage, // 백엔드에서 제공하는 프로필 이미지 (선택 사항)
            isNew: backendData.isNew
          };

          localStorage.setItem("loginUser", JSON.stringify(userDataForAuth));
          login(userDataForAuth);

          if (userDataForAuth.isNew) {
              navigate("/signup", {
                state: {
                  provider: "kakao",
                  userId: backendData.userId,
                  password: backendData.password,
                  email: backendData.email,
                },
              });
            } else {
              navigate("/main");
            }
        } catch (err) {
          console.error("백엔드 카카오 로그인 처리 실패", err);
          navigate("/login");
        }

        // navigate로 페이지를 이동시키면 URL이 자동으로 변경되므로,
        // history.replaceState는 필수는 아니지만, 만약을 위해 남겨둘 수 있습니다.

      } catch (err) {
        console.error("카카오 로그인 처리 실패:", err);
        navigate("/login"); // 에러 발생 시에도 로그인 페이지로 이동
      }
    };

    if (code) {
      hasFetched.current = true; // 4. API를 호출하기 직전에 ref 값을 true로 변경합니다.
      fetchKakaoUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, login, navigate]); // 5. useEffect에서 사용하는 외부 변수들을 의존성 배열에 추가합니다.

  return <div className="mt-20 text-lg text-center">카카오 로그인 처리 중...</div>;
}