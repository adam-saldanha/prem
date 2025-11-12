package com.premierleague.analytics.controller;

import com.premierleague.analytics.entity.Player;
import com.premierleague.analytics.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/players")
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    @GetMapping
    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Player> getPlayerById(@PathVariable Long id) {
        return playerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/club/{clubId}")
    public List<Player> getPlayersByClub(@PathVariable Long clubId) {
        return playerRepository.findByClubId(clubId);
    }

    @GetMapping("/position/{position}")
    public List<Player> getPlayersByPosition(@PathVariable String position) {
        return playerRepository.findByPosition(position);
    }

    @GetMapping("/nationality/{nationality}")
    public List<Player> getPlayersByNationality(@PathVariable String nationality) {
        return playerRepository.findByNationality(nationality);
    }

    @GetMapping("/top-scorers")
    public List<Player> getTopScorers(@RequestParam(defaultValue = "10") int limit) {
        return playerRepository.findTopScorers().stream()
                .limit(limit)
                .toList();
    }

    @GetMapping("/top-assists")
    public List<Player> getTopAssistProviders(@RequestParam(defaultValue = "10") int limit) {
        return playerRepository.findTopAssistProviders().stream()
                .limit(limit)
                .toList();
    }

    @PostMapping
    public Player createPlayer(@RequestBody Player player) {
        return playerRepository.save(player);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Player> updatePlayer(@PathVariable Long id, @RequestBody Player playerDetails) {
        return playerRepository.findById(id)
                .map(player -> {
                    player.setName(playerDetails.getName());
                    player.setJerseyNumber(playerDetails.getJerseyNumber());
                    player.setPosition(playerDetails.getPosition());
                    player.setNationality(playerDetails.getNationality());
                    player.setDateOfBirth(playerDetails.getDateOfBirth());
                    player.setHeight(playerDetails.getHeight());
                    player.setWeight(playerDetails.getWeight());
                    player.setMarketValue(playerDetails.getMarketValue());
                    player.setPhotoUrl(playerDetails.getPhotoUrl());
                    player.setClub(playerDetails.getClub());
                    player.setGoals(playerDetails.getGoals());
                    player.setAssists(playerDetails.getAssists());
                    player.setYellowCards(playerDetails.getYellowCards());
                    player.setRedCards(playerDetails.getRedCards());
                    player.setMatchesPlayed(playerDetails.getMatchesPlayed());
                    player.setMinutesPlayed(playerDetails.getMinutesPlayed());
                    player.setCleanSheets(playerDetails.getCleanSheets());
                    player.setSaves(playerDetails.getSaves());
                    return ResponseEntity.ok(playerRepository.save(player));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlayer(@PathVariable Long id) {
        return playerRepository.findById(id)
                .map(player -> {
                    playerRepository.delete(player);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
