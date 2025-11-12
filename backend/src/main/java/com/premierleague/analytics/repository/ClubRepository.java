package com.premierleague.analytics.repository;

import com.premierleague.analytics.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {
    Optional<Club> findByName(String name);
    Optional<Club> findByShortName(String shortName);
    Optional<Club> findByExternalId(Long externalId);
    
    @Query("SELECT c FROM Club c LEFT JOIN FETCH c.players WHERE c.id = :id")
    Optional<Club> findByIdWithPlayers(Long id);
    
    // Sort clubs by position (ascending), with nulls last, then by name
    @Query("SELECT c FROM Club c ORDER BY CASE WHEN c.position IS NULL THEN 1 ELSE 0 END, c.position ASC, c.name ASC")
    List<Club> findAllByOrderByPositionAsc();
}
