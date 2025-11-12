package com.premierleague.analytics.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "home_club_id", nullable = false)
    @JsonIgnoreProperties("players")
    private Club homeClub;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "away_club_id", nullable = false)
    @JsonIgnoreProperties("players")
    private Club awayClub;

    @Column(name = "match_date", nullable = false)
    private LocalDateTime matchDate;

    @Column(name = "home_score")
    private Integer homeScore;

    @Column(name = "away_score")
    private Integer awayScore;

    private String venue;

    private String referee;

    private Integer attendance;

    @Column(name = "match_week")
    private Integer matchWeek;

    private String season;

    @Enumerated(EnumType.STRING)
    private MatchStatus status = MatchStatus.SCHEDULED;

    // Match statistics
    @Column(name = "home_possession")
    private Double homePossession;

    @Column(name = "away_possession")
    private Double awayPossession;

    @Column(name = "home_shots")
    private Integer homeShots;

    @Column(name = "away_shots")
    private Integer awayShots;

    @Column(name = "home_shots_on_target")
    private Integer homeShotsOnTarget;

    @Column(name = "away_shots_on_target")
    private Integer awayShotsOnTarget;

    @Column(name = "home_corners")
    private Integer homeCorners;

    @Column(name = "away_corners")
    private Integer awayCorners;

    @Column(name = "home_fouls")
    private Integer homeFouls;

    @Column(name = "away_fouls")
    private Integer awayFouls;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum MatchStatus {
        SCHEDULED,
        LIVE,
        FINISHED,
        POSTPONED,
        CANCELLED
    }
}
