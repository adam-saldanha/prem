package com.premierleague.analytics.controller;

import com.premierleague.analytics.entity.Match;
import com.premierleague.analytics.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/matches")
public class MatchController {

    @Autowired
    private MatchRepository matchRepository;

    @GetMapping
    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Match> getMatchById(@PathVariable Long id) {
        return matchRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/club/{clubId}")
    public List<Match> getMatchesByClub(@PathVariable Long clubId) {
        return matchRepository.findByHomeClubIdOrAwayClubId(clubId, clubId);
    }

    @GetMapping("/date-range")
    public List<Match> getMatchesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return matchRepository.findByMatchDateBetween(start, end);
    }

    @GetMapping("/status/{status}")
    public List<Match> getMatchesByStatus(@PathVariable Match.MatchStatus status) {
        return matchRepository.findByStatus(status);
    }

    @GetMapping("/season/{season}")
    public List<Match> getMatchesBySeason(@PathVariable String season) {
        return matchRepository.findBySeason(season);
    }

    @GetMapping("/season/{season}/week/{week}")
    public List<Match> getMatchesBySeasonAndWeek(@PathVariable String season, @PathVariable Integer week) {
        return matchRepository.findBySeasonAndMatchWeek(season, week);
    }

    @GetMapping("/upcoming")
    public List<Match> getUpcomingMatches() {
        return matchRepository.findByStatus(Match.MatchStatus.SCHEDULED);
    }

    @GetMapping("/live")
    public List<Match> getLiveMatches() {
        return matchRepository.findByStatus(Match.MatchStatus.LIVE);
    }

    @PostMapping
    public Match createMatch(@RequestBody Match match) {
        return matchRepository.save(match);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Match> updateMatch(@PathVariable Long id, @RequestBody Match matchDetails) {
        return matchRepository.findById(id)
                .map(match -> {
                    match.setHomeClub(matchDetails.getHomeClub());
                    match.setAwayClub(matchDetails.getAwayClub());
                    match.setMatchDate(matchDetails.getMatchDate());
                    match.setHomeScore(matchDetails.getHomeScore());
                    match.setAwayScore(matchDetails.getAwayScore());
                    match.setVenue(matchDetails.getVenue());
                    match.setReferee(matchDetails.getReferee());
                    match.setAttendance(matchDetails.getAttendance());
                    match.setMatchWeek(matchDetails.getMatchWeek());
                    match.setSeason(matchDetails.getSeason());
                    match.setStatus(matchDetails.getStatus());
                    match.setHomePossession(matchDetails.getHomePossession());
                    match.setAwayPossession(matchDetails.getAwayPossession());
                    match.setHomeShots(matchDetails.getHomeShots());
                    match.setAwayShots(matchDetails.getAwayShots());
                    match.setHomeShotsOnTarget(matchDetails.getHomeShotsOnTarget());
                    match.setAwayShotsOnTarget(matchDetails.getAwayShotsOnTarget());
                    match.setHomeCorners(matchDetails.getHomeCorners());
                    match.setAwayCorners(matchDetails.getAwayCorners());
                    match.setHomeFouls(matchDetails.getHomeFouls());
                    match.setAwayFouls(matchDetails.getAwayFouls());
                    return ResponseEntity.ok(matchRepository.save(match));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMatch(@PathVariable Long id) {
        return matchRepository.findById(id)
                .map(match -> {
                    matchRepository.delete(match);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
