# --- 빌드 스테이지 ---
# Node.js 20 버전의 Alpine Linux 이미지를 사용하여 애플리케이션을 빌드합니다.
# Alpine 이미지는 작고 가벼워 최종 이미지 크기를 줄이는 데 유리합니다.
FROM node:20-alpine AS build

ARG VITE_AI_API_URL
ENV VITE_AI_API_URL=$VITE_AI_API_URL

# 작업 디렉토리를 /app으로 설정합니다.
# 이후 모든 명령어는 이 디렉토리 내에서 실행됩니다.
WORKDIR /app

# package.json과 package-lock.json (또는 yarn.lock) 파일을 먼저 복사합니다.
# 이는 의존성 변경 시에만 npm install이 다시 실행되도록 Docker 캐시를 활용하기 위함입니다.
COPY package*.json ./

# 프로젝트 의존성을 설치합니다.
# --force는 peer dependency 경고를 무시하고 설치를 강제합니다.
RUN npm install --force

# 현재 디렉토리의 모든 파일(소스 코드)을 작업 디렉토리로 복사합니다.
COPY . .

# Vite 애플리케이션을 프로덕션 모드로 빌드합니다.
# 빌드된 결과물은 일반적으로 dist/ 디렉토리에 생성됩니다.
RUN npm run build

# --- 서빙 스테이지 ---
# 가벼운 웹 서버인 Nginx의 Alpine 버전을 사용하여 빌드된 정적 파일을 서빙합니다.
FROM nginx:alpine

# Nginx의 기본 설정 파일을 제거합니다.
RUN rm /etc/nginx/conf.d/default.conf

# 사용자 정의 Nginx 설정 파일을 컨테이너 내의 올바른 위치로 복사합니다.
# 이 파일은 다음 단계에서 생성할 것입니다.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 스테이지에서 생성된 빌드 결과물(dist/ 디렉토리 내용)을 Nginx 웹 서버의
# 기본 문서 루트 디렉토리(/usr/share/nginx/html)로 복사합니다.
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx가 기본적으로 사용하는 HTTP 포트인 80번 포트를 외부에 노출합니다.
# 이는 Docker 컨테이너 외부에서 이 포트로 접근할 수 있도록 합니다.
EXPOSE 80

# 컨테이너가 시작될 때 Nginx 서버를 실행합니다.
# -g 'daemon off;'는 Nginx를 포그라운드에서 실행하여 Docker 컨테이너가 계속 실행되도록 합니다.
CMD ["nginx", "-g", "daemon off;"]