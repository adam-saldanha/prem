import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  EmojiEvents,
  SportsSoccer,
  People,
} from '@mui/icons-material';
import { playersAPI, clubsAPI, matchesAPI } from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalClubs: 20,
    totalMatches: 0,
    upcomingMatches: 0,
  });
  const [topScorers, setTopScorers] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [players, matches, upcoming, scorers] = await Promise.all([
        playersAPI.getAll(),
        matchesAPI.getAll(),
        matchesAPI.getUpcoming(),
        playersAPI.getTopScorers(5),
      ]);

      setStats({
        totalPlayers: players.data.length,
        totalClubs: 20,
        totalMatches: matches.data.length,
        upcomingMatches: upcoming.data.length,
      });

      setTopScorers(scorers.data);
      setUpcomingMatches(upcoming.data.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, trend, color }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: `${color}.50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Premier League 2024/25 Season Overview
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={<People sx={{ fontSize: 28 }} />}
            title="Total Players"
            value={stats.totalPlayers}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={<EmojiEvents sx={{ fontSize: 28 }} />}
            title="Clubs"
            value={stats.totalClubs}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={<SportsSoccer sx={{ fontSize: 28 }} />}
            title="Total Matches"
            value={stats.totalMatches}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={<SportsSoccer sx={{ fontSize: 28 }} />}
            title="Upcoming"
            value={stats.upcomingMatches}
            trend="+12%"
            color="error"
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Top Scorers */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Top Scorers
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Leading goal scorers this season
                  </Typography>
                </Box>
                <Chip
                  label={`${topScorers.length} Players`}
                  size="small"
                  sx={{
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    fontWeight: 600,
                    border: 'none',
                  }}
                />
              </Box>

              {topScorers.map((player, index) => (
                <Box
                  key={player.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    bgcolor: index === 0 ? 'rgba(124, 58, 237, 0.04)' : 'grey.50',
                    border: '1px solid',
                    borderColor: index === 0 ? 'primary.200' : 'grey.100',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: 2,
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} flex={1} minWidth={0}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        bgcolor: index === 0 ? 'primary.main' : index === 1 ? 'grey.600' : index === 2 ? 'warning.main' : 'grey.400',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </Box>

                    {player.club?.crestUrl || player.club?.logoUrl ? (
                      <Avatar
                        src={player.club?.crestUrl || player.club?.logoUrl}
                        alt={player.club?.name}
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: 'white',
                          p: 0.3,
                          flexShrink: 0,
                          display: { xs: 'none', sm: 'flex' },
                        }}
                      />
                    ) : null}

                    <Box flex={1} minWidth={0}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {player.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {player.club?.tla || player.club?.shortName || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2} flexShrink={0}>
                    <Box textAlign="center">
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: 'success.main',
                          lineHeight: 1.2,
                        }}
                      >
                        {player.goals || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Goals
                      </Typography>
                    </Box>
                    <Box textAlign="center" sx={{ display: { xs: 'none', md: 'block' } }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {player.assists || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Assists
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Matches */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Upcoming Matches
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Next fixtures
                  </Typography>
                </Box>
                <Chip
                  label={`${stats.upcomingMatches} Matches`}
                  size="small"
                  sx={{
                    bgcolor: 'success.50',
                    color: 'success.main',
                    fontWeight: 600,
                    border: 'none',
                  }}
                />
              </Box>

              {upcomingMatches.length > 0 ? (
                upcomingMatches.map((match) => (
                  <Box
                    key={match.id}
                    sx={{
                      p: 2.5,
                      mb: 1.5,
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.100',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 2,
                        borderColor: 'primary.200',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Chip
                        label={`Week ${match.matchWeek}`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor: 'white',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {new Date(match.matchDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                        {match.homeClub?.crestUrl || match.homeClub?.logoUrl ? (
                          <Avatar
                            src={match.homeClub?.crestUrl || match.homeClub?.logoUrl}
                            alt={match.homeClub?.name}
                            sx={{ width: 32, height: 32, bgcolor: 'white', p: 0.3 }}
                          />
                        ) : (
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                            {match.homeClub?.tla || 'HOM'}
                          </Avatar>
                        )}
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {match.homeClub?.tla || match.homeClub?.name}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ px: 2 }}
                      >
                        vs
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, justifyContent: 'flex-end' }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {match.awayClub?.tla || match.awayClub?.name}
                        </Typography>
                        {match.awayClub?.crestUrl || match.awayClub?.logoUrl ? (
                          <Avatar
                            src={match.awayClub?.crestUrl || match.awayClub?.logoUrl}
                            alt={match.awayClub?.name}
                            sx={{ width: 32, height: 32, bgcolor: 'white', p: 0.3 }}
                          />
                        ) : (
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'error.main', fontSize: '0.75rem' }}>
                            {match.awayClub?.tla || 'AWY'}
                          </Avatar>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <SportsSoccer sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No upcoming matches
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
