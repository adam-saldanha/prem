package com.premierleague.analytics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @Column(name = "predicted_home_score")
    private Integer predictedHomeScore;

    @Column(name = "predicted_away_score")
    private Integer predictedAwayScore;

    @Column(name = "predicted_outcome")
    private String predictedOutcome; // HOME_WIN, DRAW, AWAY_WIN

    @Column(name = "home_win_probability")
    private Double homeWinProbability;

    @Column(name = "draw_probability")
    private Double drawProbability;

    @Column(name = "away_win_probability")
    private Double awayWinProbability;

    @Column(name = "confidence")
    private Double confidence;

    @Column(length = 1000)
    private String reasoning;

    @Column(name = "home_form_points")
    private Integer homeFormPoints;

    @Column(name = "away_form_points")
    private Integer awayFormPoints;

    @Column(name = "home_position")
    private Integer homePosition;

    @Column(name = "away_position")
    private Integer awayPosition;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
