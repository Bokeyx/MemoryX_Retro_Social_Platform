package com.project.backend.service.news;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend.model.Diaries;
import com.project.backend.model.Users;
import com.project.backend.repository.DiariesRepository;
import com.project.backend.repository.NewsRepository;
import com.project.backend.repository.UsersRepository;
import com.project.backend.service.chatgpt.ChatgptService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NewsSchedulerService {

    private final NewsRepository newsRepository;
    private final DiariesRepository diariesRepository;
    private final UsersRepository usersRepository;
    private final ChatgptService chatgptService;

    private static final String NEWS_AI_USER_ID = "newsAi";

    /**
     * 매일 오전 12시 1분에 실행됩니다.
     * cron = "초 분 시 일 월 요일"
     */
    @Scheduled(cron = "0 1 0 * * *") // 👈 매일 00시 01분에 실행
    @Transactional
    public void createRandomDateNewsDiary() {
        System.out.println("뉴스 다이어리 생성 스케줄러 실행...");

        // 1. 임의의 날짜 설정 (2000~2010년 사이의 오늘 날짜)
        int randomYear = ThreadLocalRandom.current().nextInt(2000, 2011);
        LocalDate today = LocalDate.now();
        LocalDate targetDate = LocalDate.of(randomYear, today.getMonthValue(), today.getDayOfMonth());

        // 2. 해당 날짜, 해당 유저의 뉴스성 다이어리가 이미 존재하는지 확인
        boolean diaryExists = diariesRepository.existsByUser_UserIdAndCreatedAt(
                NEWS_AI_USER_ID,
                targetDate.atStartOfDay()
        );

        if (diaryExists) {
            System.out.println(targetDate + " 날짜의 뉴스 다이어리는 이미 존재하여 생성을 건너뜁니다.");
            return;
        }

        // 3. 뉴스가 없다면 생성 로직 실행
        // 3-1. DB에서 해당 날짜의 뉴스 토픽 가져오기
        newsRepository.findByYearAndMonthAndDay(randomYear, today.getMonthValue(), today.getDayOfMonth())
            .ifPresent(news -> {
                // 3-2. 상위 10개 키워드 파싱
                List<String> top10Keywords = parseTopKeywords(news.getTopics(), 10);
                if (top10Keywords.isEmpty()) {
                    System.out.println("뉴스 토픽에서 키워드를 찾지 못했습니다.");
                    return;
                }

                // 3-3. GPT 프롬프트 생성 및 AI 요약 요청
                String prompt = createNewsPrompt(top10Keywords);
                String aiSummary = chatgptService.testChat(prompt);

                // 3-4. 'newsAi' 유저 정보 가져오기 (없으면 생성)
                Users newsAiUser = usersRepository.findById(NEWS_AI_USER_ID)
                        .orElseGet(() -> {
                            Users newUser = Users.builder()
                                .userId(NEWS_AI_USER_ID)
                                .password("dummy_password") // 실제로는 안전한 비밀번호를 사용해야 합니다.
                                .name("뉴스봇")
                                .email("news_ai@memory-x.com")
                                .sex("M")
                                .authProvider("SYSTEM")
                                .userStatus("ACTIVE")
                                .build();
                            return usersRepository.save(newUser);
                        });

                // 3-5. 다이어리 엔티티 생성 및 저장
                String topTopic = top10Keywords.stream().limit(3).collect(Collectors.joining(", "));
                Diaries diaryToSave = Diaries.builder()
                        .user(newsAiUser)
                        .originalText(aiSummary)
                        .retroText(topTopic)
                        .createdAt(targetDate.atStartOfDay())
                        .publicScope("P")
                        .likeCnt(0)
                        .build();

                diariesRepository.save(diaryToSave);
                System.out.println(targetDate + " 날짜의 뉴스 다이어리를 성공적으로 생성했습니다.");
            });
    }

    // 헬퍼 메소드 (기존 NewsService와 동일)
    private List<String> parseTopKeywords(String topicsString, int limit) {
        List<String> keywords = new ArrayList<>();
        Pattern pattern = Pattern.compile("'([^']*)'");
        Matcher matcher = pattern.matcher(topicsString);
        while (matcher.find() && keywords.size() < limit) {
            keywords.add(matcher.group(1));
        }
        return keywords;
    }

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
}