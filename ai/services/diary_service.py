import os
import mysql.connector
from mysql.connector import Error

def get_db_connection():
    """
    데이터베이스 연결을 설정하고 반환합니다.
    """
    try:
        conn = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            database=os.getenv("MYSQL_DATABASE", "memory_x_db"),
            user=os.getenv("MYSQL_USER", "memoryx"),
            password=os.getenv("MYSQL_PASSWORD", "memoryx486")
        )
        return conn
    except Error as e:
        print(f"Error connecting to MySQL database: {e}")
        return None

def save_diary_entry_to_db(diary_data: dict):
    """
    일기 데이터를 데이터베이스의 DIARIES 테이블에 저장합니다.
    """
    conn = None
    try:
        conn = get_db_connection()
        if conn and conn.is_connected():
            cursor = conn.cursor()
            query = (
                "INSERT INTO DIARIES "
                "(DIARY_USER, ORIGINAL_TEXT, RETRO_TEXT, EMOTION_LABEL, RECO_SONG, RECO_CONTENT, PUBLIC_SCOPE) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s)"
            )
            # reco_song과 reco_content가 None일 경우 DB에 NULL로 저장되도록 처리
            reco_song = diary_data.get("reco_song")
            reco_content = diary_data.get("reco_content")

            # 빈 문자열이 넘어올 경우 None으로 변환하여 DB에 NULL로 저장되도록 함
            if reco_song == "":
                reco_song = None
            if reco_content == "":
                reco_content = None

            values = (
                diary_data["diary_user"],
                diary_data["original_text"],
                diary_data["retro_text"],
                diary_data["emotion_label"],
                reco_song,
                reco_content,
                0 # PUBLIC_SCOPE 기본값 0 추가
            )
            cursor.execute(query, values)
            conn.commit()
            print("일기 데이터가 성공적으로 저장되었습니다.")
            return True
    except Error as e:
        print(f"Error saving diary entry to database: {e}")
        return False
    finally:
        if conn and conn.is_connected():
            conn.close()
