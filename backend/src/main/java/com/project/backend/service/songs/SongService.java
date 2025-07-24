package com.project.backend.service.songs;

import com.project.backend.dto.songs.SongDto;
import com.project.backend.model.Songs;
import com.project.backend.repository.SongsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SongService {
    private final SongsRepository songRepository;

    public List<SongDto> getRandomSongs(int count) {
        List<Songs> allSongs = songRepository.findAll();
        Collections.shuffle(allSongs);
        return allSongs.stream()
                .limit(count)
                .map(song -> SongDto.builder()
                        .songId(song.getSongId())
                        .title(song.getTitle())
                        .artist(song.getArtist())
                        .year(song.getYear())
                        .month(song.getMonth())
                        .lyrics(song.getLyrics())
                        .build())
                .collect(Collectors.toList());
    }
}
