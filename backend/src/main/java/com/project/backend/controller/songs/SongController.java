package com.project.backend.controller.songs;

import com.project.backend.service.songs.SongService;
import com.project.backend.dto.songs.SongDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
@RequiredArgsConstructor
public class SongController {

    private final SongService songService;

    // 예: /api/songs/random?count=5
    @GetMapping("/random")
    public ResponseEntity<List<SongDto>> getRandomSongs(@RequestParam(defaultValue = "5") int count) {
        List<SongDto> songs = songService.getRandomSongs(count);
        return ResponseEntity.ok(songs);
    }
}

