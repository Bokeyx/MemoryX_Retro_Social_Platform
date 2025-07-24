package com.project.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="NEWS")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class News {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="NEWS_ID")
    private Integer newsId;

    @Column(name="YEAR", nullable=false)
    private Integer year;

    @Column(name="MONTH", nullable=false)
    private Integer month;

    @Column(name="DAY", nullable=false)
    private Integer day;

    @Lob
    @Column(name="TOPICS", columnDefinition = "LONGTEXT", nullable=false)
    private String topics;
}
