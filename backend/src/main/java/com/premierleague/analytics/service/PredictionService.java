package com.premierleague.analytics.service;

import com.premierleague.analytics.entity.Club;
import com.premierleague.analytics.entity.Match;
import com.premierleague.analytics.entity.Prediction;
import com.premierleague.analytics.repository.MatchRepository;
import com.premierleague.analytics.repository.PredictionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PredictionService {
    private static final Logger logger = LoggerFactory.getLogger(PredictionService.class);

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private PredictionRepository predictionRepository;

    /**
     * Generate predictions for next 10 upcoming matches every hour
     */
    @Scheduled(cron = "0 30 * * * ?") // Run at 30 minutes past every hour
    public void generatePredictionsForUpcomingMatches() {
        logger.info("Generating predictions for next 10 upcoming matches");
        
        // Get all scheduled matches and sort by date
        List<Match> upcomingMatches = matchRepository.findByStatus(Match.MatchStatus.SCHEDULED)
            .stream()
            .sorted((m1, m2) -> m1.getMatchDate().compareTo(m2.getMatchDate()))
            .limit(10) // Only take first 10 matches
            .collect(java.util.stream.Collectors.toList());
        
        logger.info("Found {} upcoming matches to predict", upcomingMatches.size());
        
        int predictionsCreated = 0;
        for (Match match : upcomingMatches) {
            try {
                // Check if prediction already exists
                if (predictionRepository.findByMatchId(match.getId()).isEmpty()) {
                    Prediction prediction = generatePrediction(match);
                    predictionRepository.save(prediction);
                    predictionsCreated++;
                    logger.info("Generated prediction for match: {} vs {}", 
                        match.getHomeClub().getName(), match.getAwayClub().getName());
                }
            } catch (Exception e) {
                logger.error("Error generating prediction for match {}: {}", match.getId(), e.getMessage());
            }
        }
        
        logger.info("Prediction generation completed: {} new predictions created", predictionsCreated);
    }

    /**
     * Generate a prediction for a specific match based on:
     * 1. Last 5 results for both teams
     * 2. Current standings
     * 3. Home advantage
     */
    public Prediction generatePrediction(Match match) {
        Club homeClub = match.getHomeClub();
        Club awayClub = match.getAwayClub();

        // Get last 5 matches for each team
        List<Match> homeClubMatches = getLastNMatches(homeClub.getId(), 5);
        List<Match> awayClubMatches = getLastNMatches(awayClub.getId(), 5);

        // Calculate form points (last 5 matches: Win=3, Draw=1, Loss=0)
        int homeFormPoints = calculateFormPoints(homeClubMatches, homeClub.getId());
        int awayFormPoints = calculateFormPoints(awayClubMatches, awayClub.getId());

        // Get current positions
        int homePosition = homeClub.getPosition() != null ? homeClub.getPosition() : 20;
        int awayPosition = awayClub.getPosition() != null ? awayClub.getPosition() : 20;

        // Calculate probabilities
        double[] probabilities = calculateWinProbabilities(
            homeFormPoints, awayFormPoints,
            homePosition, awayPosition,
            homeClub.getPoints() != null ? homeClub.getPoints() : 0,
            awayClub.getPoints() != null ? awayClub.getPoints() : 0
        );

        // Predict scores
        int[] predictedScores = predictScores(probabilities, homeFormPoints, awayFormPoints);

        // Determine outcome
        String outcome;
        if (predictedScores[0] > predictedScores[1]) {
            outcome = "HOME_WIN";
        } else if (predictedScores[0] < predictedScores[1]) {
            outcome = "AWAY_WIN";
        } else {
            outcome = "DRAW";
        }

        // Generate reasoning
        String reasoning = generateReasoning(
            homeClub, awayClub,
            homeFormPoints, awayFormPoints,
            homePosition, awayPosition,
            probabilities
        );

        // Calculate confidence
        double confidence = Math.max(Math.max(probabilities[0], probabilities[1]), probabilities[2]);

        // Create prediction
        Prediction prediction = new Prediction();
        prediction.setMatch(match);
        prediction.setPredictedHomeScore(predictedScores[0]);
        prediction.setPredictedAwayScore(predictedScores[1]);
        prediction.setPredictedOutcome(outcome);
        prediction.setHomeWinProbability(probabilities[0]);
        prediction.setDrawProbability(probabilities[1]);
        prediction.setAwayWinProbability(probabilities[2]);
        prediction.setConfidence(confidence);
        prediction.setReasoning(reasoning);
        prediction.setHomeFormPoints(homeFormPoints);
        prediction.setAwayFormPoints(awayFormPoints);
        prediction.setHomePosition(homePosition);
        prediction.setAwayPosition(awayPosition);

        return prediction;
    }

    private List<Match> getLastNMatches(Long clubId, int n) {
        List<Match> allMatches = matchRepository.findByHomeClubIdOrAwayClubId(clubId, clubId);
        
        return allMatches.stream()
            .filter(m -> m.getStatus() == Match.MatchStatus.FINISHED)
            .sorted((m1, m2) -> m2.getMatchDate().compareTo(m1.getMatchDate()))
            .limit(n)
            .collect(Collectors.toList());
    }

    private int calculateFormPoints(List<Match> matches, Long clubId) {
        int points = 0;
        
        for (Match match : matches) {
            if (match.getHomeScore() == null || match.getAwayScore() == null) {
                continue;
            }

            boolean isHome = match.getHomeClub().getId().equals(clubId);
            int clubScore = isHome ? match.getHomeScore() : match.getAwayScore();
            int opponentScore = isHome ? match.getAwayScore() : match.getHomeScore();

            if (clubScore > opponentScore) {
                points += 3; // Win
            } else if (clubScore == opponentScore) {
                points += 1; // Draw
            }
            // Loss = 0 points
        }
        
        return points;
    }

    private double[] calculateWinProbabilities(
        int homeFormPoints, int awayFormPoints,
        int homePosition, int awayPosition,
        int homeTablePoints, int awayTablePoints
    ) {
        // Base probabilities with home advantage
        double homeWinProb = 40.0; // Home advantage starts at 40%
        double drawProb = 30.0;
        double awayWinProb = 30.0;

        // Form influence (max 20% swing) - Reduced from 30%
        int formDiff = homeFormPoints - awayFormPoints;
        double formInfluence = (formDiff / 15.0) * 10.0; // Max form diff is 15 (5*3 - 0)
        homeWinProb += formInfluence;
        awayWinProb -= formInfluence;

        // Position influence (max 30% swing) - INCREASED from 20% for more weight
        int positionDiff = awayPosition - homePosition; // Better position = lower number
        double positionInfluence = (positionDiff / 20.0) * 15.0; // Increased multiplier
        homeWinProb += positionInfluence;
        awayWinProb -= positionInfluence;

        // Points influence (max 20% swing) - INCREASED from 15%
        int pointsDiff = homeTablePoints - awayTablePoints;
        double pointsInfluence = (pointsDiff / 40.0) * 10.0; // Increased multiplier
        homeWinProb += pointsInfluence;
        awayWinProb -= pointsInfluence;

        // Extra boost for teams in top 4 vs teams in bottom 4
        if (homePosition <= 4 && awayPosition >= 17) {
            homeWinProb += 10.0; // Top team vs relegation candidate
            awayWinProb -= 5.0;
        } else if (awayPosition <= 4 && homePosition >= 17) {
            awayWinProb += 10.0;
            homeWinProb -= 5.0;
        }

        // Normalize to ensure they sum to 100%
        double total = homeWinProb + drawProb + awayWinProb;
        homeWinProb = (homeWinProb / total) * 100.0;
        drawProb = (drawProb / total) * 100.0;
        awayWinProb = (awayWinProb / total) * 100.0;

        // Ensure no extreme probabilities
        homeWinProb = Math.max(5.0, Math.min(85.0, homeWinProb));
        awayWinProb = Math.max(5.0, Math.min(85.0, awayWinProb));
        drawProb = Math.max(5.0, 100.0 - homeWinProb - awayWinProb);

        return new double[]{homeWinProb, drawProb, awayWinProb};
    }

    private int[] predictScores(double[] probabilities, int homeFormPoints, int awayFormPoints) {
        int homeScore, awayScore;

        // Determine outcome based on probabilities
        if (probabilities[0] > probabilities[2]) {
            // Home win predicted
            if (probabilities[0] > 60) {
                homeScore = 2 + (homeFormPoints > 10 ? 1 : 0);
                awayScore = homeFormPoints > 12 ? 0 : 1;
            } else {
                homeScore = 2;
                awayScore = 1;
            }
        } else if (probabilities[2] > probabilities[0]) {
            // Away win predicted
            if (probabilities[2] > 60) {
                awayScore = 2 + (awayFormPoints > 10 ? 1 : 0);
                homeScore = awayFormPoints > 12 ? 0 : 1;
            } else {
                awayScore = 2;
                homeScore = 1;
            }
        } else {
            // Draw predicted
            if (homeFormPoints < 5 && awayFormPoints < 5) {
                homeScore = awayScore = 0; // Low-scoring draw
            } else {
                homeScore = awayScore = 1; // Standard draw
            }
        }

        return new int[]{homeScore, awayScore};
    }

    private String generateReasoning(
        Club homeClub, Club awayClub,
        int homeFormPoints, int awayFormPoints,
        int homePosition, int awayPosition,
        double[] probabilities
    ) {
        StringBuilder reasoning = new StringBuilder();

        reasoning.append(homeClub.getShortName() != null ? homeClub.getShortName() : homeClub.getName())
                 .append(" (").append(homePosition).append(") vs ")
                 .append(awayClub.getShortName() != null ? awayClub.getShortName() : awayClub.getName())
                 .append(" (").append(awayPosition).append("). ");

        // Form analysis
        reasoning.append("Recent form: ")
                 .append(homeClub.getShortName() != null ? homeClub.getShortName() : homeClub.getName())
                 .append(" (").append(homeFormPoints).append("/15 pts), ")
                 .append(awayClub.getShortName() != null ? awayClub.getShortName() : awayClub.getName())
                 .append(" (").append(awayFormPoints).append("/15 pts). ");

        // Key factor
        if (homeFormPoints > awayFormPoints + 4) {
            reasoning.append("Home team's strong recent form gives them an advantage. ");
        } else if (awayFormPoints > homeFormPoints + 4) {
            reasoning.append("Away team's superior form could overcome home advantage. ");
        } else {
            reasoning.append("Both teams in similar form. ");
        }

        // Position
        if (Math.abs(homePosition - awayPosition) > 5) {
            if (homePosition < awayPosition) {
                reasoning.append("Home team's better league position is a significant factor. ");
            } else {
                reasoning.append("Away team's superior league standing cannot be ignored. ");
            }
        }

        // Home advantage
        reasoning.append("Home advantage provides approximately 10-15% boost to win probability.");

        return reasoning.toString();
    }

    public List<Prediction> getAllPredictions() {
        return predictionRepository.findAll();
    }

    public List<Prediction> getPredictionsForCurrentWeek(Integer matchWeek) {
        return predictionRepository.findByMatchWeek(matchWeek);
    }

    public List<Prediction> getUpcomingPredictions() {
        // Get all scheduled predictions
        List<Prediction> allPredictions = predictionRepository.findByMatchStatus(Match.MatchStatus.SCHEDULED);
        
        // Sort by match date and limit to 10
        return allPredictions.stream()
            .sorted((p1, p2) -> p1.getMatch().getMatchDate().compareTo(p2.getMatch().getMatchDate()))
            .limit(10)
            .collect(Collectors.toList());
    }
    
    public void clearAllPredictions() {
        logger.info("Clearing all predictions");
        predictionRepository.deleteAll();
        logger.info("All predictions cleared");
    }
    
    public void regeneratePredictions() {
        logger.info("Regenerating predictions - clearing old ones first");
        clearAllPredictions();
        generatePredictionsForUpcomingMatches();
    }
}

