package com.premierleague.analytics.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "players")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "jersey_number")
    private Integer jerseyNumber;

    private String position;

    private String nationality;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private Double height;

    private Double weight;

    @Column(name = "market_value")
    private Double marketValue;

    @Column(name = "photo_url")
    private String photoUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "club_id")
    @JsonIgnoreProperties("players")
    private Club club;

    // Statistics
    private Integer goals = 0;
    private Integer assists = 0;
    @Column(name = "yellow_cards")
    private Integer yellowCards = 0;
    @Column(name = "red_cards")
    private Integer redCards = 0;
    @Column(name = "matches_played")
    private Integer matchesPlayed = 0;
    @Column(name = "minutes_played")
    private Integer minutesPlayed = 0;
    @Column(name = "clean_sheets")
    private Integer cleanSheets = 0;
    private Integer saves = 0;

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
}
