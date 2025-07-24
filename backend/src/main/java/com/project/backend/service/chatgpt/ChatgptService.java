package com.project.backend.service.chatgpt;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.project.backend.config.chatgpt.ChatgptConfig;
import com.project.backend.dto.chatgpt.ChatRequestDto;
import com.project.backend.dto.chatgpt.ChatResponseDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatgptService {
    private final RestTemplate template;
    private final ChatgptConfig config;
    
    public String testChat(String prompt){
        ChatRequestDto request = new ChatRequestDto(config.getModel(), prompt);
        ChatResponseDto response = template.postForObject(config.getApiUrl(), request, ChatResponseDto.class);

        return response.getChoices().get(0).getMessageDto().getContent();
    }
}