package com.project.backend.service.contents;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.project.backend.dto.contents.ContentDto;
import com.project.backend.model.Contents;
import com.project.backend.repository.ContentsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContentService {
    private final ContentsRepository contentsRepository;

    public List<ContentDto> getRandomContents(int count) {
        List<Contents> all = contentsRepository.findAll();
        Collections.shuffle(all);
        return all.stream()
                .limit(count)
                .map(content -> ContentDto.builder()
                        .contentId(content.getContentId())
                        .title(content.getTitle())
                        .releaseDate(content.getReleaseDate())
                        .overview(content.getOverview())
                        .posterUrl(content.getPosterUrl())
                        .build())
                .collect(Collectors.toList());
    }
}