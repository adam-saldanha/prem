package com.premierleague.analytics.repository;

import com.premierleague.analytics.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    Optional<Prediction> findByMatchId(Long matchId);
    
    @Query("SELECT p FROM Prediction p JOIN p.match m WHERE m.status = :status ORDER BY m.matchDate ASC")
    List<Prediction> findByMatchStatus(@Param("status") com.premierleague.analytics.entity.Match.MatchStatus status);
    
    @Query("SELECT p FROM Prediction p JOIN p.match m WHERE m.matchWeek = :matchWeek ORDER BY m.matchDate ASC")
    List<Prediction> findByMatchWeek(@Param("matchWeek") Integer matchWeek);
}
