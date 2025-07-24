# MySQL 8.0 이미지를 기반으로 합니다.
FROM mysql:8.0

# init.sql 및 my.cnf 파일을 컨테이너 내부로 복사합니다.
# Dockerfile의 COPY 명령어는 권한 문제를 덜 일으킵니다.
COPY init.sql /docker-entrypoint-initdb.d/
COPY my.cnf /etc/mysql/conf.d/

# my.cnf 파일의 권한을 안전하게 설정합니다. (읽기 전용)
RUN chmod 444 /etc/mysql/conf.d/my.cnf