package com.project.backend.dto.movieTV;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ContentDto {
    private Integer contentId;
    private String title;
    private LocalDate releaseDate;
    private String overview;
    private String posterUrl;
}
