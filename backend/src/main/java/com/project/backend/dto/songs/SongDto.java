package com.project.backend.dto.songs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SongDto {
    private Integer songId;
    private String title;
    private String artist;
    private Integer year;
    private Integer month;
    private String lyrics;    
}