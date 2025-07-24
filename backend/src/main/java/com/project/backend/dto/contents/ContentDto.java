package com.project.backend.dto.contents;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentDto {
    private Integer contentId;
    private String title;
    private LocalDate releaseDate;
    private String overview;
    private String posterUrl;
}
