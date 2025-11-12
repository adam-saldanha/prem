package com.premierleague.analytics.service;

import com.premierleague.analytics.entity.*;
import com.premierleague.analytics.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
public class DataInitializationService implements CommandLineRunner {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private PredictionRepository predictionRepository;

    private final Random random = new Random();

    @Autowired
    private FootballDataService footballDataService;

    @Override
    public void run(String... args) throws Exception {
        if (clubRepository.count() == 0) {
            // Try to fetch real data from Football-Data.org API first
            try {
                System.out.println("Fetching real Premier League data from Football-Data.org API...");
                footballDataService.refreshAllData();
                System.out.println("Successfully loaded data from Football-Data.org API");
            } catch (Exception e) {
                // If API fails, fall back to sample data
                System.out.println("Could not fetch data from API, initializing with sample data: " + e.getMessage());
                initializeData();
            }
        }
    }

    private void initializeData() {

        // Create clubs
        List<Club> clubs = Arrays.asList(
            createClub("Manchester United", "Man Utd", "Old Trafford", 1878, "Erik ten Hag", "#DA020E", "#FFF"),
            createClub("Manchester City", "Man City", "Etihad Stadium", 1880, "Pep Guardiola", "#6CABDD", "#FFF"),
            createClub("Liverpool", "Liverpool", "Anfield", 1892, "Jurgen Klopp", "#C8102E", "#F6EB61"),
            createClub("Chelsea", "Chelsea", "Stamford Bridge", 1905, "Mauricio Pochettino", "#034694", "#FFF"),
            createClub("Arsenal", "Arsenal", "Emirates Stadium", 1886, "Mikel Arteta", "#EF0107", "#FFF"),
            createClub("Tottenham Hotspur", "Spurs", "Tottenham Hotspur Stadium", 1882, "Ange Postecoglou", "#132257", "#FFF"),
            createClub("Newcastle United", "Newcastle", "St James' Park", 1892, "Eddie Howe", "#241F20", "#FFF"),
            createClub("Aston Villa", "Villa", "Villa Park", 1874, "Unai Emery", "#95BFE5", "#670E36")
        );

        // Create players for each club
        for (Club club : clubs) {
            createPlayersForClub(club);
        }

        // Create matches
        createMatches(clubs);
    }

    private Club createClub(String name, String shortName, String stadium, int foundedYear, String manager, String primaryColor, String secondaryColor) {
        Club club = new Club();
        club.setName(name);
        club.setShortName(shortName);
        club.setStadium(stadium);
        club.setFoundedYear(foundedYear);
        club.setManager(manager);
        club.setPrimaryColor(primaryColor);
        club.setSecondaryColor(secondaryColor);
        return clubRepository.save(club);
    }

    private void createPlayersForClub(Club club) {
        String[] positions = {"Goalkeeper", "Defender", "Midfielder", "Forward"};
        String[] nationalities = {"England", "Brazil", "France", "Spain", "Germany", "Portugal", "Argentina", "Netherlands"};
        
        // Create goalkeeper
        createPlayer(club.getName() + " GK", 1, "Goalkeeper", nationalities[random.nextInt(nationalities.length)], club);
        
        // Create defenders
        for (int i = 2; i <= 5; i++) {
            createPlayer(club.getName() + " DEF " + i, i, "Defender", nationalities[random.nextInt(nationalities.length)], club);
        }
        
        // Create midfielders
        for (int i = 6; i <= 8; i++) {
            createPlayer(club.getName() + " MID " + i, i, "Midfielder", nationalities[random.nextInt(nationalities.length)], club);
        }
        
        // Create forwards
        for (int i = 9; i <= 11; i++) {
            createPlayer(club.getName() + " FWD " + i, i, "Forward", nationalities[random.nextInt(nationalities.length)], club);
        }
    }

    private void createPlayer(String name, int jerseyNumber, String position, String nationality, Club club) {
        Player player = new Player();
        player.setName(name);
        player.setJerseyNumber(jerseyNumber);
        player.setPosition(position);
        player.setNationality(nationality);
        player.setDateOfBirth(LocalDate.now().minusYears(20 + random.nextInt(15)));
        player.setHeight(170.0 + random.nextDouble() * 30);
        player.setWeight(65.0 + random.nextDouble() * 25);
        player.setMarketValue(5000000.0 + random.nextDouble() * 95000000);
        player.setClub(club);
        player.setGoals(random.nextInt(20));
        player.setAssists(random.nextInt(15));
        player.setYellowCards(random.nextInt(8));
        player.setRedCards(random.nextInt(2));
        player.setMatchesPlayed(random.nextInt(38));
        player.setMinutesPlayed(player.getMatchesPlayed() * (60 + random.nextInt(30)));
        if (position.equals("Goalkeeper")) {
            player.setCleanSheets(random.nextInt(15));
            player.setSaves(random.nextInt(100));
        }
        playerRepository.save(player);
    }

    private void createMatches(List<Club> clubs) {
        LocalDateTime now = LocalDateTime.now();
        String currentSeason = "2024/25";
        
        // Create some past matches
        for (int week = 1; week <= 5; week++) {
            for (int i = 0; i < clubs.size() / 2; i++) {
                Club homeClub = clubs.get(i * 2);
                Club awayClub = clubs.get(i * 2 + 1);
                
                Match match = new Match();
                match.setHomeClub(homeClub);
                match.setAwayClub(awayClub);
                match.setMatchDate(now.minusWeeks(6 - week));
                match.setHomeScore(random.nextInt(5));
                match.setAwayScore(random.nextInt(5));
                match.setVenue(homeClub.getStadium());
                match.setAttendance(30000 + random.nextInt(40000));
                match.setMatchWeek(week);
                match.setSeason(currentSeason);
                match.setStatus(Match.MatchStatus.FINISHED);
                
                // Add match statistics
                match.setHomePossession(35.0 + random.nextDouble() * 30);
                match.setAwayPossession(100 - match.getHomePossession());
                match.setHomeShots(5 + random.nextInt(20));
                match.setAwayShots(5 + random.nextInt(20));
                match.setHomeShotsOnTarget(Math.min(match.getHomeShots(), random.nextInt(match.getHomeShots() + 1)));
                match.setAwayShotsOnTarget(Math.min(match.getAwayShots(), random.nextInt(match.getAwayShots() + 1)));
                match.setHomeCorners(random.nextInt(12));
                match.setAwayCorners(random.nextInt(12));
                match.setHomeFouls(5 + random.nextInt(15));
                match.setAwayFouls(5 + random.nextInt(15));
                
                matchRepository.save(match);
            }
        }
        
        // Create upcoming matches
        for (int week = 6; week <= 10; week++) {
            for (int i = 0; i < clubs.size() / 2; i++) {
                Club homeClub = clubs.get((i * 2 + week) % clubs.size());
                Club awayClub = clubs.get((i * 2 + 1 + week) % clubs.size());
                
                Match match = new Match();
                match.setHomeClub(homeClub);
                match.setAwayClub(awayClub);
                match.setMatchDate(now.plusWeeks(week - 5));
                match.setVenue(homeClub.getStadium());
                match.setMatchWeek(week);
                match.setSeason(currentSeason);
                match.setStatus(Match.MatchStatus.SCHEDULED);
                
                Match savedMatch = matchRepository.save(match);
                
                // Create AI predictions for upcoming matches
                createAIPrediction(savedMatch);
            }
        }
    }

    private void createAIPrediction(Match match) {
        Prediction prediction = new Prediction();
        prediction.setMatch(match);
        prediction.setPredictedHomeScore(random.nextInt(4));
        prediction.setPredictedAwayScore(random.nextInt(4));
        
        // Calculate probabilities
        double homeWin = 0.2 + random.nextDouble() * 0.6;
        double draw = 0.1 + random.nextDouble() * 0.3;
        double awayWin = 1.0 - homeWin - draw;
        
        prediction.setHomeWinProbability(homeWin * 100);
        prediction.setDrawProbability(draw * 100);
        prediction.setAwayWinProbability(awayWin * 100);
        prediction.setConfidence(60.0 + random.nextDouble() * 35);
        prediction.setReasoning("AI analysis based on team form, head-to-head records, and player statistics.");
        
        predictionRepository.save(prediction);
    }
}
