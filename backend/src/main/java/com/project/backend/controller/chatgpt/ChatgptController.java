package com.project.backend.controller.chatgpt;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.project.backend.config.chatgpt.ChatgptConfig;
import com.project.backend.dto.chatgpt.ChatRequestDto;
import com.project.backend.dto.chatgpt.ChatResponseDto;
import com.project.backend.service.chatgpt.ChatgptService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/gpt")
@RequiredArgsConstructor
public class ChatgptController {
    private final ChatgptService chatgptService;
    private final RestTemplate restTemplate;
    private final ChatgptConfig chatgptConfig;

    @GetMapping("/test")
    public String getGptHello(){
        return "gpt hello!!";
    }
    
    @GetMapping("/chat/test")
    public String chat(@RequestParam(name = "prompt")String prompt){

        ChatRequestDto request = new ChatRequestDto(chatgptConfig.getModel(), prompt);
        ChatResponseDto response = restTemplate.postForObject(chatgptConfig.getApiUrl(), request, ChatResponseDto.class);

        return response.getChoices().get(0).getMessageDto().getContent();
    }

    
}
