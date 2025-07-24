package com.project.backend.model;

import java.time.LocalDate;
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
@Table(name="CONTENTS")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class Contents {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="CONTENT_ID")
    private Integer contentId;

    @Column(name="TITLE", length=255, nullable=false)
    private String title;

    @Column(name="RELEASE_DATE", nullable = false)
    private LocalDate releaseDate;

    @Lob
    @Column(name="OVERVIEW", columnDefinition = "LONGTEXT", nullable = false)
    private String overview;

    @Column(name="POSTER_URL", length=255)
    private String posterUrl;

    @OneToMany(mappedBy = "recoContent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default // ✅ 이 줄 추가
    private List<Diaries> recoContent = new ArrayList<>();
}
