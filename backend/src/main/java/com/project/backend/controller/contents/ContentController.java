package com.project.backend.controller.contents;

import com.project.backend.dto.contents.ContentDto;
import com.project.backend.service.contents.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @GetMapping("/random-content")
    public ResponseEntity<List<ContentDto>> getRandomContents(@RequestParam(defaultValue = "5") int count) {
        List<ContentDto> contents = contentService.getRandomContents(count);
        return ResponseEntity.ok(contents);
    }
}