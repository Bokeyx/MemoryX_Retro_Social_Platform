// package com.project.backend.service.movieTV;

// import com.project.backend.dto.movieTV.ContentDto;
// import com.project.backend.model.Contents;
// import com.project.backend.repository.ContentsRepository;
// import lombok.RequiredArgsConstructor;
// import org.springframework.stereotype.Service;

// import java.util.List;
// import java.util.stream.Collectors;

// @Service
// @RequiredArgsConstructor
// public class ContentService {

//     private final ContentsRepository contentsRepository;

//     public List<ContentDto> getRandomContents(int count) {
//         List<Contents> randomContents = contentsRepository.findRandomContents(count);
//         return randomContents.stream()
//                 .map(content -> ContentDto.builder()
//                         .contentId(content.getContentId())
//                         .title(content.getTitle())
//                         .releaseDate(content.getReleaseDate())
//                         .overview(content.getOverview())
//                         .posterUrl(content.getPosterUrl())
//                         .build())
//                 .collect(Collectors.toList());
//     }
// }
