package com.project.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.backend.model.News;

import java.util.Optional;

@Repository
public interface NewsRepository extends JpaRepository<News, Integer>{
    Optional<News> findByYearAndMonthAndDay(int year, int month, int day);
}
