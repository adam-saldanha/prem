package com.premierleague.analytics.repository;

import com.premierleague.analytics.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByHomeClubIdOrAwayClubId(Long homeClubId, Long awayClubId);
    List<Match> findByMatchDateBetween(LocalDateTime start, LocalDateTime end);
    List<Match> findByStatus(Match.MatchStatus status);
    List<Match> findBySeason(String season);
    List<Match> findByMatchWeek(Integer matchWeek);
    
    @Query("SELECT m FROM Match m WHERE m.season = :season AND m.matchWeek = :matchWeek")
    List<Match> findBySeasonAndMatchWeek(@Param("season") String season, @Param("matchWeek") Integer matchWeek);
    
    @Query("SELECT m FROM Match m WHERE (m.homeClub.id = :clubId OR m.awayClub.id = :clubId) AND m.status = :status")
    List<Match> findByClubAndStatus(@Param("clubId") Long clubId, @Param("status") Match.MatchStatus status);
}
