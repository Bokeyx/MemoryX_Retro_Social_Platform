import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// __dirname 수동 정의 (ES 모듈 환경에서 필요)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@public": path.resolve(__dirname, "./public"),
    },
  },
  server: {
    origin: "http://localhost:5173",
    proxy: {
      "/api": {
        // ✅ 로컬 개발용 백엔드 주소
        target: "http://memory-x.duckdns.org:8080",
        changeOrigin: true,
      },

      // '/friends': {
      //   target: 'http://localhost:8080', // 백엔드 서버 주소 및 포트
      //   changeOrigin: true, // 대상 서버의 호스트 헤더를 변경 (CORS 문제 해결에 도움)
      //   rewrite: (path) => path.replace(/^\/friends/, '/friends'), // 필요에 따라 경로 재작성 (현재는 동일)
      // },

      // 🔐 실제 배포 서버 주소 (주석으로 유지)
      // "/api": {
      //   target: "http://backend-spring:8080",
      //   changeOrigin: true,
      // },
    },
  },
});