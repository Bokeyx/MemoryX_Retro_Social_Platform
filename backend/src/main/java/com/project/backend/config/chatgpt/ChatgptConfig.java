package com.project.backend.config.chatgpt;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "openai")
public class ChatgptConfig {
    private String apiKey;
    private String apiUrl;
    private String model;

    @Bean
    public RestTemplate template(){
        System.out.println("-------------------");
        System.out.println("-------------------");
        System.out.println(">>>>>apikey " + apiKey);
        System.out.println("-------------------");
        System.out.println("-------------------");
        RestTemplate restTemplate = new RestTemplate();
        
        restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().add("Authorization", "Bearer " + apiKey);
            return execution.execute(request, body);
        });

        return restTemplate;
    };
}