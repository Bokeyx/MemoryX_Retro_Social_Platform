import React, {useState, useEffect} from "react";
import axios from "axios";

const Song = ({ onSelectSong }) => {
    const [songs, setSongs] = useState([]);
    const [expandedList, setExpandedList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSongs = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get("http://memory-x.duckdns.org:8080/api/songs/random?count=5");
                setSongs(response.data);
                setExpandedList(new Array(response.data.length).fill(false));
            } catch (error) {
                console.error("노래 정보를 불러오는 데 실패했습니다.", error);
            } finally {
                setIsLoading(false);
            }
        };

    useEffect(() => {
        fetchSongs();
    }, []);

    const handleChooseSong = (songId, title, year, month) => {
        const formattedMonth = String(month).padStart(2, '0');
        const releaseDate = `${year}-${formattedMonth}`;

        if (onSelectSong) {
            onSelectSong({ songId, title, releaseDate });
        }
    }
    
    const toggleExpand = (index) => {
        const newExpandedList = [...expandedList];
        newExpandedList[index] = !newExpandedList[index];
        setExpandedList(newExpandedList);
    }

    return (        
        <div className="bg-white p-4 rounded-xl shadow border max-w-md space-y-4 mb-10">
            {isLoading ? (<p className="text-sm">노래 불러오는 중...</p>) 
            : (
                <>
                    <div className="flex justify-end mb-3">
                        <button onClick={fetchSongs} className="text-sm px-3 py-1 bg-blue-200 hover:bg-blue-300 rounded">
                        🎵  새로고침
                        </button>
                    </div>

                    {songs.map((item, index) => (
                        <div key={item.songId} className="border p-2 rounded">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-sm break-words">{item.title}</h3>
                                <button className="bg-[#9EDCEB] text-sm px-2 py-1" onClick={() => handleChooseSong(item.songId, item.title, item.year, item.month)}>선택하기</button>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{item.artist}</p>
                            <p className="text-sm text-gray-600 mb-1">{item.year}년 {item.month}월</p>
                            <p className={`text-sm text-gray-700 ${!expandedList[index] ? "line-clamp-3" : ""}`}>{item.lyrics}</p>
                            {item.lyrics && item.lyrics.length > 100 && (<button className="text-blue-600 text-sm mt-1" onClick={() => toggleExpand(index)}>{expandedList[index] ? "접기" : "더보기"}</button>)}
                        </div>
                    ))}                    
                </>
            )}
        </div>
    );
};

export default Song;
