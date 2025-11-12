package com.premierleague.analytics.repository;

import com.premierleague.analytics.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    List<Player> findByClubId(Long clubId);
    List<Player> findByPosition(String position);
    List<Player> findByNationality(String nationality);
    
    @Query("SELECT p FROM Player p WHERE p.club.id = :clubId ORDER BY p.goals DESC")
    List<Player> findTopScorersByClub(@Param("clubId") Long clubId);
    
    @Query("SELECT p FROM Player p ORDER BY p.goals DESC")
    List<Player> findTopScorers();
    
    @Query("SELECT p FROM Player p ORDER BY p.assists DESC")
    List<Player> findTopAssistProviders();
}
