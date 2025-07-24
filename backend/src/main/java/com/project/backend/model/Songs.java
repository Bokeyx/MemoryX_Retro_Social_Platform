package com.project.backend.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="SONGS")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class Songs {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="SONG_ID")
    private Integer songId;

    @Column(name="TITLE", length=255, nullable=false)
    private String title;

    @Column(name="ARTIST", length=255, nullable=false)
    private String artist;

    @Column(name="YEAR")
    private Integer year;

    @Column(name="MONTH")
    private Integer month;

    @Lob
    @Column(name="LYRICS", columnDefinition = "LONGTEXT")
    private String lyrics;

    @Column(name="TOP_WORDS", length=255)
    private String topWords;

    @Column(name="PREDICT")
    private Integer predict;

    @OneToMany(mappedBy = "mysong", orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default // ✅ 각 List 필드 위에 추가
    private List<Users> mysong = new ArrayList<>();

    @OneToMany(mappedBy = "recoSong", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default // ✅ 각 List 필드 위에 추가
    private List<Diaries> recoSong = new ArrayList<>();
}
