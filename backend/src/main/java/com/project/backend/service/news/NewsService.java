package com.project.backend.service.news;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.project.backend.dto.diaries.DiaryNewsDto;
import com.project.backend.model.Diaries;
import com.project.backend.repository.DiariesRepository;
import com.project.backend.repository.NewsRepository;
import com.project.backend.repository.UsersRepository;
import com.project.backend.service.chatgpt.ChatgptService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NewsService {
    private final NewsRepository newsRepository;
    private final DiariesRepository diariesRepository;
    private final UsersRepository usersRepository;
    private final ChatgptService chatgptService;

    private record NewsData(LocalDate date, String topics){};

    // 0. 메인 newsService
    public Optional<DiaryNewsDto> createTodayDiaryNews(String userId){
        // 0-1. 특정 날짜의 뉴스 데이터(날짜 + 해당 날짜 뉴스 토픽)
        return setDategetNews().flatMap(newsData -> {
            // 0-2. 상위 10개 키워드
            List<String> top10Keywords = parseTopKeywords(newsData.topics(), 10);
            if (top10Keywords.isEmpty()) {
                return Optional.empty();
            }

            // 0-3. GPT 프롬프트 -> AI 결과
            String prompt = createNewsPrompt(top10Keywords);
            String aiSummary = chatgptService.testChat(prompt);

            // 0-4. 사용자 엔티티 조회
            return usersRepository.findById(userId).map(user -> {
                String topTopic = top10Keywords.stream().limit(3).collect(Collectors.joining(", "));

                Diaries diaryToSave = Diaries.builder()
                    .user(user)
                    .originalText(aiSummary)
                    .retroText(topTopic)
                    .createdAt(newsData.date().atStartOfDay())
                    .publicScope("P")
                    .likeCnt(0)
                    .build();

                Diaries savedDiary = diariesRepository.save(diaryToSave);

                return convertToDto(savedDiary);
            });
        });
    }

    // 1. 날짜 설정 및 뉴스 데이터
    private Optional<NewsData> setDategetNews(){
        int randomYear = ThreadLocalRandom.current().nextInt(2000, 2011);
        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int day = today.getDayOfMonth();
        
        LocalDate setDate = LocalDate.of(randomYear, month, day);

        return newsRepository.findByYearAndMonthAndDay(randomYear, month, day)
            .map(news -> new NewsData(setDate, news.getTopics()));
    }

    // 2. 엔티티 -> DTO
    private DiaryNewsDto convertToDto(Diaries diary) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");

        String aiId = "newsAi";
        
        return DiaryNewsDto.builder()
            .diaryId(diary.getDiaryId())
            .diaryUser(aiId)
            .originalText(diary.getOriginalText())
            .retroText(diary.getRetroText())
            .createdAt(diary.getCreatedAt().format(formatter))
            .build();
    }

    // 3. db내 topics 데이터 파싱
    private List<String> parseTopKeywords(String topicsString, int limit) {
        List<String> keywords = new ArrayList<>();
        Pattern pattern = Pattern.compile("'([^']*)'");
        Matcher matcher = pattern.matcher(topicsString);

        while (matcher.find() && keywords.size() < limit) {
            keywords.add(matcher.group(1));
        }
        return keywords;
    }

    // 4. 프롬프트 생성
    private String createNewsPrompt(List<String> keywords) {
        String keywordStr = String.join(", ", keywords);
        return String.format(
            "아래 키워드들은 특정일의 주요 뉴스 토픽 상위 10개입니다. " +
            "이 키워드들을 바탕으로 그날 대한민국에서 어떤 주요 사건들이 있었는지 한 문장으로 추측하고, " +
            "종합적인 시각에서 자연스러운 문장으로 요약해주세요." +
            "이 때, 이 특정 날짜는 추측하지 않아도 됩니다.\n\n" +
            "키워드: %s", keywordStr
        );
    }

    // 저장된 데이터 get
    public Optional<DiaryNewsDto> getDiaryNews(Integer diaryId){
        return diariesRepository.findById(diaryId)
            .map(this::convertToDto);
    }

    public Optional<DiaryNewsDto> getLatestNewsDiary() {
        return diariesRepository.findTopByUser_UserIdOrderByCreatedAtDesc("newsAi")
                .map(diary -> convertToDto(diary));
    }
}
