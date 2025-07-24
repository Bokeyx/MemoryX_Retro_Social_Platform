# 사용할 베이스 이미지 지정: Python 3.9 버전의 경량 이미지를 사용합니다.
FROM python:3.9-slim-buster

# 컨테이너 내부의 작업 디렉토리를 /app으로 설정합니다.
# 이후 모든 명령어는 이 디렉토리 내에서 실행됩니다.
WORKDIR /app

# requirements.txt 파일을 먼저 복사하여 Docker의 캐시 기능을 활용합니다.
COPY requirements.txt .

# requirements.txt에 명시된 모든 Python 패키지를 설치합니다.
# 이 부분은 requirements.txt 파일이 변경될 때만 다시 실행됩니다.
RUN pip install -r requirements.txt

# 나머지 소스 코드를 복사합니다.
COPY . /app/ai

# Python이 '/app' 디렉토리를 모듈 검색 경로에 추가하도록 명시적으로 설정합니다.
# 이렇게 하면 'ai.routers', 'ai.schemas', 'ai.services'와 같은 절대 임포트가 가능해집니다.
ENV PYTHONPATH=/app:$PYTHONPATH

# 애플리케이션이 컨테이너 내부에서 리스닝할 포트를 노출합니다.
EXPOSE 8000

# 컨테이너가 시작될 때 실행될 명령어입니다.
# Uvicorn을 'ai' 패키지 내의 'fastapi_server' 모듈에서 'app' 인스턴스를 실행하도록 합니다.
# 이제 PYTHONPATH가 설정되었으므로 'ai.fastapi_server:app'이 올바르게 작동합니다.
CMD ["uvicorn", "ai.fastapi_server:app", "--host", "0.0.0.0", "--port", "8000"]