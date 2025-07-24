import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './RecoMovieTV.module.css';
import refresh from './refresh.png';

const RecoMovieTV = ({ onSelectMovieTV }) => {
    const [MovieTVs, setMovieTVs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMovieTVs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://memory-x.duckdns.org:8080/api/random-content");
            setMovieTVs(response.data);
            console.log(response.data);
            if (response.data.length > 0) {
                setCurrentIndex(0);
                onSelectMovieTV({
                    content_id: response.data[0].contentId, 
                    title: response.data[0].title,
                    releaseDate: response.data[0].releaseDate,
                    posterUrl: response.data[0].posterUrl
                });
            } else {
                onSelectMovieTV(null);
            }
        } catch (err) {
            console.error("추천 영화 및 티비방송 정보 가져오기 실패:", err);
            setError("영화 및 티비방송 정보를 불러오는 데 실패했습니다.");
            setMovieTVs([]);
            onSelectMovieTV(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovieTVs();
    }, []);

    const handleNext = () => {
        if (MovieTVs.length === 0) return;
        const nextIndex = (currentIndex + 1) % MovieTVs.length;
        setCurrentIndex(nextIndex);
        onSelectMovieTV({
            content_id: MovieTVs[nextIndex].contentId, 
            title: MovieTVs[nextIndex].title,
            releaseDate: MovieTVs[nextIndex].releaseDate,
            posterUrl: MovieTVs[nextIndex].posterUrl
        });
    };

    const handlePrev = () => {
        if (MovieTVs.length === 0) return;
        const prevIndex = (currentIndex - 1 + MovieTVs.length) % MovieTVs.length;
        setCurrentIndex(prevIndex);
        onSelectMovieTV({
            content_id: MovieTVs[prevIndex].contentId, 
            title: MovieTVs[prevIndex].title,
            releaseDate: MovieTVs[prevIndex].releaseDate,
            posterUrl: MovieTVs[prevIndex].posterUrl
        });
    };

    if (loading) {
        return <div className={styles.loadingMessage}>영화 및 방송을 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.errorMessage}>{error}</div>;
    }

    if (MovieTVs.length === 0) {
        return <div className={styles.noResults}>추천할 영화 및 방송이 없습니다.</div>;
    }

    const currentMovieTV = MovieTVs[currentIndex];

    return (
        <div>
            <div className={styles.recoMovieTVHeader}>
                <div className={styles.recoMovieTVHeader}>
                    <h2 className={styles.recoSelectTitle}>추천 영화 및 방송 선택</h2>
                    <img 
                        src={refresh}
                        alt='refresh'
                        className={styles.refreshButton}
                        onClick={fetchMovieTVs}
                    />
                </div>

                {/* <button onClick={() => onSelectMovieTV(currentMovieTV ? {
                    content_id: currentMovieTV.contentId, 
                    title: currentMovieTV.title,
                    releaseDate: currentMovieTV.releaseDate,
                    posterUrl: currentMovieTV.posterUrl
                } : null)} className={styles.selectButton}>
                    선택
                </button> */}
            </div>
            
            <div className={styles.recoMovieTVContainer}>
                <div className={styles.navigationButtons}>
                    <button onClick={handlePrev} className={styles.navButton} disabled={MovieTVs.length <= 1}>
                        <span className={styles.arrow}>&#9664;</span>
                    </button>
                </div>
                <div className={styles.MovieTVCard}>
                    <img 
                        src={currentMovieTV.posterUrl ? `https://image.tmdb.org/t/p/w500${currentMovieTV.posterUrl}` : "https://via.placeholder.com/300x450?text=No+Image"}
                        alt={currentMovieTV.title}
                        className={styles.posterImage}
                    />
                    <div className={styles.MovieTVInfo}>
                        <div className={styles.MovieTVInfoHeader}>
                            <span className={styles.MovieTVTitle}>{currentMovieTV.title}
                            </span>
                        </div>
                        <p className={styles.MovieTVReleaseDate}>{currentMovieTV.releaseDate}</p>
                    </div>
                </div>
                <button onClick={handleNext} className={styles.navButton} disabled={MovieTVs.length <= 1}>
                    <span className={styles.arrow}>&#9654;</span>
                </button>
            </div>
        </div>
    );
};

export default RecoMovieTV;