import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './RecoSong.module.css';
import refresh from './refresh.png';
import bgm from './bgm.png'

const RecoSong = ({ onSelectSong }) => {
    const [songs, setSongs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSongs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://memory-x.duckdns.org:8080/api/songs/random?count=5");
            setSongs(response.data);
            if (response.data.length > 0) {
                setCurrentIndex(0);
                onSelectSong(response.data[0]);
            } else {
                onSelectSong(null);
            }
        } catch (err) {
            console.error("추천 음악 가져오기 실패:", err);
            setError("추천 음악을 불러오는 데 실패했습니다.");
            setSongs([]);
            onSelectSong(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
            fetchSongs();
        }, []);

    const handleNext = () => {
        if (songs.length === 0) return;
        const nextIndex = (currentIndex + 1) % songs.length;
        setCurrentIndex(nextIndex);
        onSelectSong(songs[nextIndex]);
    };

    const handlePrev = () => {
        if (songs.length === 0) return;
        const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
        setCurrentIndex(prevIndex);
        onSelectSong(songs[prevIndex]);
    };

    if (loading) {
        return <div className={styles.loadingMessage}>음악을 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.errorMessage}>{error}</div>;
    }

    if (songs.length === 0) {
        return <div className={styles.noResults}>추천할 음악이 없습니다.</div>;
    }

    const currentSong = songs[currentIndex];

    return (
        <div>
            <div className={styles.recoSongHeader}>
                <div className={styles.recoSongHeader}>
                    <h2 className={styles.recoSelectTitle}>추천 음악 선택</h2>
                    <img 
                        src= {refresh}
                        alt='refresh'
                        className={styles.refreshButton}
                        onClick={fetchSongs}
                    />
                </div>
                {/* <button onClick={() => onSelectSong(currentSong)} className={styles.selectButton}>
                    선택
                </button> */}
                
            </div>
            
            <div className={styles.recoSongContainer}>
                <div className={styles.navigationButtons}>
                    <button onClick={handlePrev} className={styles.navButton} disabled={songs.length <= 1}>
                        <span className={styles.arrow}>&#9664;</span>
                    </button>
                </div>
                <div className={styles.songCard}>
                    <img 
                        src={bgm}
                        alt='bgmImage'
                        className={styles.bgmImage}
                    />
                    <div className={styles.songInfo}>
                        <div className={styles.songInfoHeader}>
                            <span className={styles.songTitle}>{currentSong.title}
                                <span className={styles.songArtist}>-{currentSong.artist}</span>
                            </span>
                        </div>
                        <p className={styles.songReleaseDate}>{currentSong.year}. {currentSong.month}</p>
                    </div>
                </div>
                <button onClick={handleNext} className={styles.navButton} disabled={songs.length <= 1}>
                    <span className={styles.arrow}>&#9654;</span>
                </button>
            </div>
        </div>
    );
};

export default RecoSong;