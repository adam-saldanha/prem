package com.premierleague.analytics.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "clubs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Club {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "short_name")
    private String shortName;

    private String stadium;

    @Column(name = "founded_year")
    private Integer foundedYear;

    private String manager;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "primary_color")
    private String primaryColor;

    @Column(name = "secondary_color")
    private String secondaryColor;

    @Column(name = "external_id")
    private Long externalId;

    @Column(name = "tla")
    private String tla;

    @Column(name = "crest_url")
    private String crestUrl;

    @Column(name = "position")
    private Integer position;

    @Column(name = "played_games")
    private Integer playedGames;

    @Column(name = "won")
    private Integer won;

    @Column(name = "draw")
    private Integer draw;

    @Column(name = "lost")
    private Integer lost;

    @Column(name = "points")
    private Integer points;

    @Column(name = "goals_for")
    private Integer goalsFor;

    @Column(name = "goals_against")
    private Integer goalsAgainst;

    @Column(name = "goal_difference")
    private Integer goalDifference;

    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("club")
    private Set<Player> players = new HashSet<>();

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
