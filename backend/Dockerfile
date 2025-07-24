# Java 17 JDK를 포함하는 경량 이미지를 사용합니다.
FROM openjdk:17-jdk-slim

# 컨테이너 내부의 작업 디렉토리를 /app으로 설정합니다.
WORKDIR /app

# Gradle 프로젝트의 경우, build.gradle, settings.gradle, gradlew, gradle 폴더 등을 복사합니다.
COPY build.gradle settings.gradle ./
COPY gradlew ./
COPY gradle ./gradle

# Gradle Wrapper 실행 권한을 부여합니다.
RUN chmod +x gradlew

# 의존성 캐싱을 위해 먼저 의존성만 다운로드합니다.
# 실제 JAR 생성은 건너뛰고 의존성만 해결합니다.
RUN ./gradlew dependencies --no-daemon --stacktrace || true

# Spring Boot 애플리케이션의 소스 코드를 컨테이너로 복사합니다.
COPY src ./src

# Spring Boot 애플리케이션을 빌드하여 실행 가능한 JAR 파일을 생성합니다.
# 이 단계에서 실제 JAR 파일이 생성됩니다.
RUN ./gradlew bootJar --no-daemon --stacktrace

# 빌드된 JAR 파일이 존재하는지 확인하기 위한 디버깅 명령어 (이제는 제거하거나 주석 처리)
# RUN ls -l /app/build/libs/

# 컨테이너가 시작될 때 실행될 명령어입니다.
# 생성된 JAR 파일을 Java 가상 머신(JVM)으로 실행합니다.
# 정확한 JAR 파일명을 명시합니다.
ENTRYPOINT ["java", "-jar", "/app/build/libs/backend-0.0.1-SNAPSHOT.jar"]

# !!! 중요: 이전에 디버깅을 위해 임시로 추가했던 CMD 라인은 제거해야 합니다. !!!
# CMD ["tail", "-f", "/dev/null"]
    