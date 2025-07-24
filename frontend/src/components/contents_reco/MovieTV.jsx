import React, {useState, useEffect} from "react";
import axios from "axios";

const MovieTV = ({ onSelectMovieTV }) => {
    const [contents, setContents] = useState([]);
    const [expandedList, setExpandedList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRandomContents = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://memory-x.duckdns.org:8080/api/random-content");
            setContents(response.data);
            setExpandedList(new Array(response.data.length).fill(false));
        } catch (error) {
            console.error("영화 및 티비방송 정보를 불러오는 데 실패했습니다.", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRandomContents();
    }, []);

    const handleChooseMovieTV = (contentId, title, releaseDate) => {
        if (onSelectMovieTV) {
            onSelectMovieTV({ content_id: contentId, title, releaseDate });
        }
    }

    const toggleExpand = (index) => {
        const newExpandedList = [...expandedList];
        newExpandedList[index] = !newExpandedList[index];
        setExpandedList(newExpandedList);
    };

    return (      
        <div className="bg-white p-4 rounded-xl shadow border max-w-md space-y-4 mb-10">
            {isLoading ? (<p className="text-sm">영화/방송 불러오는 중...</p>)
            : ( 
                <>
                    <div className="flex justify-end mb-3">
                        <button onClick={fetchRandomContents} className="text-sm px-3 py-1 bg-blue-200 hover:bg-blue-300 rounded" disabled={isLoading}>🔄 새로고침</button>
                    </div>

                    {contents.map((item, index) => (
                        <div key={item.contentId} className="border p-3 rounded">
                            <div className="flex gap-4">
                                <img
                                src={item.posterUrl ? `https://image.tmdb.org/t/p/w500${item.posterUrl}` : "https://via.placeholder.com/300x450?text=No+Image"}
                                alt={item.title}
                                className="w-[90px] h-[120px] object-cover border rounded-lg"
                                />
                                <div className="flex flex-col items-end justify-start flex-1 text-right mt-5">
                                    <h3 className="font-bold text-sm">{item.title}</h3>
                                    <p className="text-sm text-gray-600">{item.releaseDate}</p>
                                    <button
                                        className="bg-[#9EDCEB] text-sm px-2 py-1 mt-2 w-fit"
                                        onClick={() => handleChooseMovieTV(item.contentId, item.title, item.releaseDate)}
                                    >
                                        선택하기
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-2">
                                <p className={`text-sm text-gray-700 ${!expandedList[index] ? "line-clamp-3" : ""}`}>{item.overview}</p>
                                {item.overview && item.overview.length > 100 && (
                                    <button
                                        className="text-blue-600 text-sm mt-1"
                                        onClick={() => toggleExpand(index)}
                                    >
                                        {expandedList[index] ? "접기" : "더보기"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))};
                </>
            )}
        </div>
    );
}

export default MovieTV;