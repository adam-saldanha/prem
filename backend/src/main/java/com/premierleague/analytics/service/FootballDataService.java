package com.premierleague.analytics.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.premierleague.analytics.entity.*;
import com.premierleague.analytics.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class FootballDataService {

    private static final Logger logger = LoggerFactory.getLogger(FootballDataService.class);
    private static final String API_BASE_URL = "https://api.football-data.org/v4";
    private static final String PREMIER_LEAGUE_CODE = "PL";

    @Value("${football.data.api.key:}")
    private String apiKey;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private PredictionRepository predictionRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Run every hour
    @Scheduled(cron = "0 0 * * * ?")
    public void scheduledDataRefresh() {
        logger.info("Starting scheduled data refresh from Football-Data.org API");
        try {
            refreshAllData();
            logger.info("Scheduled data refresh completed successfully");
        } catch (Exception e) {
            logger.error("Error during scheduled data refresh", e);
        }
    }

    public void refreshAllData() {
        try {
            logger.info("Fetching Premier League data from Football-Data.org API");
            
            // Fetch and update standings - contains all team data we need
            fetchAndUpdateStandings();
            
            // Fetch and update matches
            fetchAndUpdateMatches();
            
            // Fetch and update scorers (players) - updates stats for top scorers
            fetchAndUpdateScorers();
            
            logger.info("Data refresh completed successfully");
        } catch (Exception e) {
            logger.error("Error refreshing data from API", e);
            throw new RuntimeException("Failed to refresh data", e);
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        if (apiKey != null && !apiKey.isEmpty()) {
            headers.set("X-Auth-Token", apiKey);
        }
        return headers;
    }

    private void fetchAndUpdateStandings() {
        try {
            String url = API_BASE_URL + "/competitions/" + PREMIER_LEAGUE_CODE + "/standings";
            HttpEntity<String> entity = new HttpEntity<>(createHeaders());
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode standings = root.get("standings");

            if (standings != null && standings.isArray()) {
                for (JsonNode standingNode : standings) {
                    String type = standingNode.get("type").asText();
                    if ("TOTAL".equals(type)) {
                        JsonNode table = standingNode.get("table");
                        if (table != null && table.isArray()) {
                            for (JsonNode teamStanding : table) {
                                updateClubStanding(teamStanding);
                            }
                            logger.info("Updated standings for {} teams", table.size());
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error fetching standings", e);
        }
    }

    private void updateClubStanding(JsonNode teamStanding) {
        try {
            // Extract position
            Integer position = teamStanding.get("position").asInt();
            
            // Extract team info
            JsonNode teamNode = teamStanding.get("team");
            Long externalId = teamNode.get("id").asLong();
            String teamName = teamNode.get("name").asText();
            String shortName = teamNode.get("shortName").asText();
            String tla = teamNode.has("tla") ? teamNode.get("tla").asText() : "";
            String crestUrl = teamNode.has("crest") ? teamNode.get("crest").asText() : "";
            
            // Extract all standings statistics
            Integer playedGames = teamStanding.get("playedGames").asInt();
            Integer won = teamStanding.get("won").asInt();
            Integer draw = teamStanding.get("draw").asInt();
            Integer lost = teamStanding.get("lost").asInt();
            Integer points = teamStanding.get("points").asInt();
            Integer goalsFor = teamStanding.get("goalsFor").asInt();
            Integer goalsAgainst = teamStanding.get("goalsAgainst").asInt();
            Integer goalDifference = teamStanding.get("goalDifference").asInt();

            // Find or create club
            Optional<Club> existingClub = clubRepository.findByName(teamName);
            Club club;
            
            if (existingClub.isPresent()) {
                club = existingClub.get();
                logger.debug("Updating existing club: {}", teamName);
            } else {
                club = new Club();
                club.setName(teamName);
                logger.info("Creating new club from standings: {}", teamName);
            }
            
            // Update basic team info from API
            club.setExternalId(externalId);
            club.setShortName(shortName);
            club.setTla(tla);
            club.setCrestUrl(crestUrl);
            club.setLogoUrl(crestUrl); // Use crest as logo URL
            
            // Update ALL standings data
            club.setPosition(position);
            club.setPlayedGames(playedGames);
            club.setWon(won);
            club.setDraw(draw);
            club.setLost(lost);
            club.setPoints(points);
            club.setGoalsFor(goalsFor);
            club.setGoalsAgainst(goalsAgainst);
            club.setGoalDifference(goalDifference);
            
            // Save to database
            Club savedClub = clubRepository.save(club);
            
            logger.info("✓ Saved {} - Pos: {}, Pts: {}, W: {}, D: {}, L: {}, GF: {}, GA: {}, GD: {}", 
                teamName, position, points, won, draw, lost, goalsFor, goalsAgainst, goalDifference);
            
        } catch (Exception e) {
            logger.error("Error updating club standing from API", e);
            e.printStackTrace();
        }
    }



    private String[] parseClubColors(String clubColors) {
        String[] result = new String[2];
        if (clubColors != null && !clubColors.isEmpty()) {
            String[] colors = clubColors.split("/");
            result[0] = mapColorToHex(colors[0].trim());
            result[1] = colors.length > 1 ? mapColorToHex(colors[1].trim()) : "#FFFFFF";
        } else {
            result[0] = "#38003c";
            result[1] = "#FFFFFF";
        }
        return result;
    }

    private String mapColorToHex(String color) {
        Map<String, String> colorMap = new HashMap<>();
        colorMap.put("Red", "#DC0714");
        colorMap.put("Blue", "#0057B8");
        colorMap.put("White", "#FFFFFF");
        colorMap.put("Black", "#000000");
        colorMap.put("Yellow", "#FDB913");
        colorMap.put("Green", "#00A650");
        colorMap.put("Orange", "#FF6600");
        colorMap.put("Purple", "#702F8A");
        colorMap.put("Claret", "#670E36");
        colorMap.put("Navy", "#003087");
        colorMap.put("Sky Blue", "#6CABDD");
        colorMap.put("Gold", "#FFD700");
        
        return colorMap.getOrDefault(color, "#38003c");
    }


    private void updatePlayerFromApi(JsonNode playerNode, Club club) {
        try {
            String name = playerNode.get("name").asText();
            String position = playerNode.has("position") ? playerNode.get("position").asText() : "Unknown";
            String nationality = playerNode.has("nationality") ? playerNode.get("nationality").asText() : "";
            String dateOfBirthStr = playerNode.has("dateOfBirth") ? playerNode.get("dateOfBirth").asText() : null;
            Integer shirtNumber = playerNode.has("shirtNumber") && !playerNode.get("shirtNumber").isNull() 
                ? playerNode.get("shirtNumber").asInt() : null;

            LocalDate dateOfBirth = null;
            if (dateOfBirthStr != null) {
                try {
                    dateOfBirth = LocalDate.parse(dateOfBirthStr);
                } catch (Exception e) {
                    logger.debug("Could not parse date of birth: {}", dateOfBirthStr);
                }
            }

            // Check if player exists
            List<Player> existingPlayers = playerRepository.findByClubId(club.getId());
            Optional<Player> existingPlayer = existingPlayers.stream()
                .filter(p -> p.getName().equals(name))
                .findFirst();

            Player player;
            if (existingPlayer.isPresent()) {
                player = existingPlayer.get();
            } else {
                player = new Player();
                player.setName(name);
                player.setGoals(0);
                player.setAssists(0);
                player.setYellowCards(0);
                player.setRedCards(0);
                player.setMatchesPlayed(0);
                player.setMinutesPlayed(0);
                player.setCleanSheets(0);
                player.setSaves(0);
            }

            player.setPosition(mapPosition(position));
            player.setNationality(nationality);
            player.setDateOfBirth(dateOfBirth);
            player.setJerseyNumber(shirtNumber);
            player.setClub(club);
            
            playerRepository.save(player);
            
        } catch (Exception e) {
            logger.error("Error updating player", e);
        }
    }

    private String mapPosition(String position) {
        if (position == null) return "Unknown";
        
        switch (position.toUpperCase()) {
            case "GOALKEEPER":
                return "Goalkeeper";
            case "DEFENCE":
            case "DEFENDER":
                return "Defender";
            case "MIDFIELD":
            case "MIDFIELDER":
                return "Midfielder";
            case "OFFENCE":
            case "ATTACK":
            case "FORWARD":
                return "Forward";
            default:
                return "Midfielder";
        }
    }

    private void fetchAndUpdateMatches() {
        try {
            // Get current season
            String currentSeason = String.valueOf(LocalDate.now().getYear());
            
            String url = API_BASE_URL + "/competitions/" + PREMIER_LEAGUE_CODE + "/matches?season=" + currentSeason;
            HttpEntity<String> entity = new HttpEntity<>(createHeaders());
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode matches = root.get("matches");

            if (matches != null && matches.isArray()) {
                int count = 0;
                for (JsonNode matchNode : matches) {
                    updateMatchFromApi(matchNode);
                    count++;
                }
                logger.info("Updated {} matches", count);
            }
        } catch (Exception e) {
            logger.error("Error fetching matches", e);
        }
    }

    private void updateMatchFromApi(JsonNode matchNode) {
        try {
            Long externalId = matchNode.get("id").asLong();
            String utcDate = matchNode.get("utcDate").asText();
            String status = matchNode.get("status").asText();
            Integer matchday = matchNode.has("matchday") && !matchNode.get("matchday").isNull() 
                ? matchNode.get("matchday").asInt() : null;
            String venue = matchNode.has("venue") && !matchNode.get("venue").isNull()
                ? matchNode.get("venue").asText() : null;

            // Parse date
            LocalDateTime matchDate = LocalDateTime.parse(utcDate, DateTimeFormatter.ISO_DATE_TIME);

            // Get teams
            JsonNode homeTeamNode = matchNode.get("homeTeam");
            JsonNode awayTeamNode = matchNode.get("awayTeam");
            
            String homeTeamName = homeTeamNode.get("name").asText();
            String awayTeamName = awayTeamNode.get("name").asText();

            Optional<Club> homeClub = clubRepository.findByName(homeTeamName);
            Optional<Club> awayClub = clubRepository.findByName(awayTeamName);

            if (homeClub.isEmpty() || awayClub.isEmpty()) {
                logger.debug("Clubs not found for match: {} vs {}", homeTeamName, awayTeamName);
                return;
            }

            // Get scores
            JsonNode scoreNode = matchNode.get("score");
            JsonNode fullTimeNode = scoreNode.get("fullTime");
            Integer homeScore = fullTimeNode.has("home") && !fullTimeNode.get("home").isNull() 
                ? fullTimeNode.get("home").asInt() : null;
            Integer awayScore = fullTimeNode.has("away") && !fullTimeNode.get("away").isNull() 
                ? fullTimeNode.get("away").asInt() : null;

            // Find or create match
            List<Match> existingMatches = matchRepository.findByHomeClubIdOrAwayClubId(
                homeClub.get().getId(), homeClub.get().getId()
            );
            
            Optional<Match> existingMatch = existingMatches.stream()
                .filter(m -> m.getHomeClub().getId().equals(homeClub.get().getId()) &&
                            m.getAwayClub().getId().equals(awayClub.get().getId()) &&
                            m.getMatchDate().toLocalDate().equals(matchDate.toLocalDate()))
                .findFirst();

            Match match;
            if (existingMatch.isPresent()) {
                match = existingMatch.get();
            } else {
                match = new Match();
                match.setHomeClub(homeClub.get());
                match.setAwayClub(awayClub.get());
                match.setMatchDate(matchDate);
            }

            match.setHomeScore(homeScore);
            match.setAwayScore(awayScore);
            match.setMatchWeek(matchday);
            match.setVenue(venue != null ? venue : homeClub.get().getStadium());
            match.setStatus(mapMatchStatus(status));
            match.setSeason(getCurrentSeason());

            matchRepository.save(match);
            
        } catch (Exception e) {
            logger.error("Error updating match", e);
        }
    }

    private Match.MatchStatus mapMatchStatus(String status) {
        switch (status.toUpperCase()) {
            case "SCHEDULED":
            case "TIMED":
                return Match.MatchStatus.SCHEDULED;
            case "LIVE":
            case "IN_PLAY":
            case "PAUSED":
                return Match.MatchStatus.LIVE;
            case "FINISHED":
            case "AWARDED":
                return Match.MatchStatus.FINISHED;
            case "POSTPONED":
                return Match.MatchStatus.POSTPONED;
            case "CANCELLED":
            case "SUSPENDED":
                return Match.MatchStatus.CANCELLED;
            default:
                return Match.MatchStatus.SCHEDULED;
        }
    }

    private void fetchAndUpdateScorers() {
        try {
            String url = API_BASE_URL + "/competitions/" + PREMIER_LEAGUE_CODE + "/scorers";
            HttpEntity<String> entity = new HttpEntity<>(createHeaders());
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode scorers = root.get("scorers");

            if (scorers != null && scorers.isArray()) {
                for (JsonNode scorerNode : scorers) {
                    updatePlayerStatsFromScorer(scorerNode);
                }
                logger.info("Updated top scorers statistics");
            }
        } catch (Exception e) {
            logger.error("Error fetching scorers", e);
        }
    }

    private void updatePlayerStatsFromScorer(JsonNode scorerNode) {
        try {
            // Extract player info
            JsonNode playerNode = scorerNode.get("player");
            Long playerId = playerNode.get("id").asLong();
            String playerName = playerNode.get("name").asText();
            String firstName = playerNode.has("firstName") && !playerNode.get("firstName").isNull() 
                ? playerNode.get("firstName").asText() : "";
            String lastName = playerNode.has("lastName") && !playerNode.get("lastName").isNull() 
                ? playerNode.get("lastName").asText() : "";
            String dateOfBirth = playerNode.has("dateOfBirth") && !playerNode.get("dateOfBirth").isNull() 
                ? playerNode.get("dateOfBirth").asText() : null;
            String nationality = playerNode.has("nationality") && !playerNode.get("nationality").isNull() 
                ? playerNode.get("nationality").asText() : null;
            String section = playerNode.has("section") && !playerNode.get("section").isNull() 
                ? playerNode.get("section").asText() : null;
            Integer shirtNumber = playerNode.has("shirtNumber") && !playerNode.get("shirtNumber").isNull() 
                ? playerNode.get("shirtNumber").asInt() : null;

            // Extract team info
            JsonNode teamNode = scorerNode.get("team");
            Long teamExternalId = teamNode.get("id").asLong();
            
            // Extract stats
            Integer goals = scorerNode.has("goals") ? scorerNode.get("goals").asInt() : 0;
            Integer assists = scorerNode.has("assists") && !scorerNode.get("assists").isNull() 
                ? scorerNode.get("assists").asInt() : 0;
            Integer matches = scorerNode.has("playedMatches") ? scorerNode.get("playedMatches").asInt() : 0;

            // Find club by external ID
            Optional<Club> clubOpt = clubRepository.findByExternalId(teamExternalId);
            if (!clubOpt.isPresent()) {
                logger.warn("Club with external ID {} not found for player {}", teamExternalId, playerName);
                return;
            }
            
            Club club = clubOpt.get();

            // Find or create player
            List<Player> allPlayers = playerRepository.findAll();
            Optional<Player> playerOpt = allPlayers.stream()
                .filter(p -> p.getName().equals(playerName) || 
                            (p.getClub() != null && p.getClub().getId().equals(club.getId()) && 
                             p.getName().equalsIgnoreCase(playerName)))
                .findFirst();

            Player player;
            if (playerOpt.isPresent()) {
                player = playerOpt.get();
                logger.debug("Updating existing player: {}", playerName);
            } else {
                player = new Player();
                player.setName(playerName);
                player.setClub(club);
                logger.info("Creating new player from scorers: {}", playerName);
            }

            // Update player details
            player.setNationality(nationality);
            player.setJerseyNumber(shirtNumber);
            
            // Map position from section
            if (section != null) {
                player.setPosition(mapPositionFromSection(section));
            }
            
            // Parse date of birth
            if (dateOfBirth != null) {
                try {
                    LocalDate dob = LocalDate.parse(dateOfBirth);
                    player.setDateOfBirth(dob);
                } catch (Exception e) {
                    logger.debug("Could not parse date of birth for player: {}", playerName);
                }
            }

            // Update stats
            player.setGoals(goals);
            player.setAssists(assists);
            player.setMatchesPlayed(matches);

            playerRepository.save(player);
            logger.debug("✓ Updated stats for player: {} - Goals: {}, Assists: {}, Matches: {}", 
                playerName, goals, assists, matches);

        } catch (Exception e) {
            logger.error("Error updating player stats from scorer", e);
            e.printStackTrace();
        }
    }

    private String mapPositionFromSection(String section) {
        if (section == null) return "Unknown";
        
        section = section.toLowerCase();
        if (section.contains("goalkeeper")) return "Goalkeeper";
        if (section.contains("defence") || section.contains("defender")) return "Defender";
        if (section.contains("midfield")) return "Midfielder";
        if (section.contains("forward") || section.contains("winger") || 
            section.contains("striker") || section.contains("offence")) return "Forward";
        
        return section; // Return original if no match
    }

    private void fetchAndUpdateAllTeamSquads() {
        try {
            logger.info("Fetching squad data for all Premier League teams...");
            
            // Get all clubs from database
            List<Club> clubs = clubRepository.findAll();
            
            int teamsProcessed = 0;
            for (Club club : clubs) {
                if (club.getExternalId() != null) {
                    try {
                        fetchAndUpdateTeamSquad(club.getExternalId(), club);
                        teamsProcessed++;
                        
                        // Add a small delay to avoid rate limiting
                        Thread.sleep(200);
                    } catch (Exception e) {
                        logger.error("Error fetching squad for team {}: {}", club.getName(), e.getMessage());
                    }
                }
            }
            
            logger.info("Successfully fetched squad data for {} teams", teamsProcessed);
        } catch (Exception e) {
            logger.error("Error fetching all team squads", e);
        }
    }

    public void fetchAndUpdateTeamSquad(Long teamExternalId, Club club) {
        try {
            String url = API_BASE_URL + "/teams/" + teamExternalId;
            HttpEntity<String> entity = new HttpEntity<>(createHeaders());
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode squad = root.get("squad");

            if (squad != null && squad.isArray()) {
                int playersProcessed = 0;
                for (JsonNode playerNode : squad) {
                    updatePlayerFromSquad(playerNode, club);
                    playersProcessed++;
                }
                logger.info("Updated {} players for {}", playersProcessed, club.getName());
            }
        } catch (Exception e) {
            logger.error("Error fetching squad for team {}", teamExternalId, e);
        }
    }

    private void updatePlayerFromSquad(JsonNode playerNode, Club club) {
        try {
            // Extract player info
            Long playerId = playerNode.has("id") && !playerNode.get("id").isNull() 
                ? playerNode.get("id").asLong() : null;
            String playerName = playerNode.has("name") && !playerNode.get("name").isNull() 
                ? playerNode.get("name").asText() : null;
            
            if (playerName == null || playerName.isEmpty()) {
                return; // Skip if no name
            }

            String position = playerNode.has("position") && !playerNode.get("position").isNull() 
                ? playerNode.get("position").asText() : "Unknown";
            String dateOfBirth = playerNode.has("dateOfBirth") && !playerNode.get("dateOfBirth").isNull() 
                ? playerNode.get("dateOfBirth").asText() : null;
            String nationality = playerNode.has("nationality") && !playerNode.get("nationality").isNull() 
                ? playerNode.get("nationality").asText() : null;
            Integer shirtNumber = playerNode.has("shirtNumber") && !playerNode.get("shirtNumber").isNull() 
                ? playerNode.get("shirtNumber").asInt() : null;

            // Find or create player by name and club
            List<Player> existingPlayers = playerRepository.findByClubId(club.getId());
            Optional<Player> playerOpt = existingPlayers.stream()
                .filter(p -> p.getName().equalsIgnoreCase(playerName))
                .findFirst();

            Player player;
            if (playerOpt.isPresent()) {
                player = playerOpt.get();
            } else {
                player = new Player();
                player.setName(playerName);
                player.setClub(club);
                player.setGoals(0);
                player.setAssists(0);
                player.setMatchesPlayed(0);
            }

            // Update player details
            player.setPosition(position);
            player.setNationality(nationality);
            player.setJerseyNumber(shirtNumber);
            
            // Parse date of birth
            if (dateOfBirth != null) {
                try {
                    LocalDate dob = LocalDate.parse(dateOfBirth);
                    player.setDateOfBirth(dob);
                } catch (Exception e) {
                    logger.debug("Could not parse date of birth for player: {}", playerName);
                }
            }

            playerRepository.save(player);

        } catch (Exception e) {
            logger.error("Error updating player from squad data", e);
        }
    }

    private String getCurrentSeason() {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        
        // Premier League season typically starts in August
        if (month >= 8) {
            return year + "/" + String.valueOf(year + 1).substring(2);
        } else {
            return (year - 1) + "/" + String.valueOf(year).substring(2);
        }
    }
}
