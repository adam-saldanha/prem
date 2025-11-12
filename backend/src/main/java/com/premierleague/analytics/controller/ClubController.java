package com.premierleague.analytics.controller;

import com.premierleague.analytics.entity.Club;
import com.premierleague.analytics.repository.ClubRepository;
import com.premierleague.analytics.service.FootballDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clubs")
public class ClubController {

    @Autowired
    private ClubRepository clubRepository;
    
    @Autowired
    private FootballDataService footballDataService;

    @GetMapping
    public ResponseEntity<?> getAllClubs() {
        List<Club> clubs = clubRepository.findAllByOrderByPositionAsc();
        
        // Return a summary of standings data
        return ResponseEntity.ok(clubs.stream()
                .map(club -> {
                    var data = new java.util.HashMap<String, Object>();
                    data.put("id", club.getId());
                    data.put("externalId", club.getExternalId()); // Include external API ID
                    data.put("position", club.getPosition());
                    data.put("name", club.getName());
                    data.put("shortName", club.getShortName());
                    data.put("tla", club.getTla());
                    data.put("crestUrl", club.getCrestUrl());
                    data.put("playedGames", club.getPlayedGames());
                    data.put("won", club.getWon());
                    data.put("draw", club.getDraw());
                    data.put("lost", club.getLost());
                    data.put("points", club.getPoints());
                    data.put("goalsFor", club.getGoalsFor());
                    data.put("goalsAgainst", club.getGoalsAgainst());
                    data.put("goalDifference", club.getGoalDifference());
                    return data;
                })
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Club> getClubById(@PathVariable Long id) {
        return clubRepository.findByIdWithPlayers(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{id}/fetch-squad")
    public ResponseEntity<?> fetchSquadData(@PathVariable Long id) {
        try {
            Club club = clubRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Club not found"));
            
            if (club.getExternalId() == null) {
                return ResponseEntity.badRequest().body("Club does not have an external API ID");
            }
            
            // Fetch squad data from API
            footballDataService.fetchAndUpdateTeamSquad(club.getExternalId(), club);
            
            // Return updated club with players
            Club updatedClub = clubRepository.findByIdWithPlayers(id)
                    .orElseThrow(() -> new RuntimeException("Club not found after update"));
            
            return ResponseEntity.ok(updatedClub);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching squad data: " + e.getMessage());
        }
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Club> getClubByName(@PathVariable String name) {
        return clubRepository.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Club createClub(@RequestBody Club club) {
        return clubRepository.save(club);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Club> updateClub(@PathVariable Long id, @RequestBody Club clubDetails) {
        return clubRepository.findById(id)
                .map(club -> {
                    club.setName(clubDetails.getName());
                    club.setShortName(clubDetails.getShortName());
                    club.setStadium(clubDetails.getStadium());
                    club.setFoundedYear(clubDetails.getFoundedYear());
                    club.setManager(clubDetails.getManager());
                    club.setLogoUrl(clubDetails.getLogoUrl());
                    club.setPrimaryColor(clubDetails.getPrimaryColor());
                    club.setSecondaryColor(clubDetails.getSecondaryColor());
                    return ResponseEntity.ok(clubRepository.save(club));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClub(@PathVariable Long id) {
        return clubRepository.findById(id)
                .map(club -> {
                    clubRepository.delete(club);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
