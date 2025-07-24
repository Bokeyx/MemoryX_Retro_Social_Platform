package com.project.backend.dto.chatgpt;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

// gpt에게 질문 요청 dto
@Data
public class ChatRequestDto {
    private String model;
    private List<MessageDto> messages;

    public ChatRequestDto(String model, String prompt){
        this.model = model;
        this.messages = new ArrayList<>();
        this.messages.add(new MessageDto("user", prompt));
    }
}