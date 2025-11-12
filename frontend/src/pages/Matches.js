import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  LiveTv,
  Stadium,
} from '@mui/icons-material';
import { matchesAPI } from '../services/api';
import { format } from 'date-fns';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('all');

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [matches, tabValue, selectedWeek]);

  const fetchMatches = async () => {
    try {
      const response = await matchesAPI.getAll();
      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = [];

    // Filter by status (tabs)
    switch (tabValue) {
      case 0: // All
        filtered = matches;
        break;
      case 1: // Completed
        filtered = matches.filter(m => m.status === 'FINISHED');
        break;
      case 2: // Upcoming
        filtered = matches.filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED');
        break;
      case 3: // Live
        filtered = matches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
        break;
      default:
        filtered = matches;
    }

    // Filter by week
    if (selectedWeek !== 'all') {
      filtered = filtered.filter(m => m.matchWeek === parseInt(selectedWeek));
    }

    setFilteredMatches(filtered);
  };

  const getAvailableWeeks = () => {
    const weeks = [...new Set(matches.map(m => m.matchWeek))];
    return weeks.sort((a, b) => a - b);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'FINISHED':
        return { label: 'FT', color: 'success' };
      case 'IN_PLAY':
        return { label: 'LIVE', color: 'error' };
      case 'PAUSED':
        return { label: 'HT', color: 'warning' };
      case 'SCHEDULED':
      case 'TIMED':
        return { label: 'Scheduled', color: 'default' };
      default:
        return { label: status, color: 'default' };
    }
  };

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
          Matches
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Premier League fixtures and results
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            bgcolor: 'white',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 44,
            },
          }}
        >
          <Tab label="All Matches" />
          <Tab label="Completed" />
          <Tab label="Upcoming" />
          <Tab label="Live" />
        </Tabs>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Week</InputLabel>
          <Select
            value={selectedWeek}
            label="Filter by Week"
            onChange={(e) => setSelectedWeek(e.target.value)}
            sx={{ bgcolor: 'white' }}
          >
            <MenuItem value="all">All Weeks</MenuItem>
            {getAvailableWeeks().map(week => (
              <MenuItem key={week} value={week}>
                Week {week}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Matches Grid */}
      {filteredMatches.length > 0 ? (
        <Grid container spacing={2}>
          {filteredMatches.map((match) => {
            const statusChip = getStatusChip(match.status);
            const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';

            return (
              <Grid item xs={12} sm={6} lg={4} key={match.id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    overflow: 'visible',
                    ...(isLive && {
                      border: '2px solid',
                      borderColor: 'error.main',
                      boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
                    }),
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={`Week ${match.matchWeek}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor: 'grey.100',
                        }}
                      />
                      <Chip
                        label={statusChip.label}
                        size="small"
                        color={statusChip.color}
                        sx={{
                          height: 22,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          ...(isLive && {
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0.7 },
                            },
                          }),
                        }}
                      />
                    </Box>

                    {/* Teams */}
                    <Box sx={{ mb: 2 }}>
                      {/* Home Team */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                          {match.homeClub?.crestUrl || match.homeClub?.logoUrl ? (
                            <Avatar
                              src={match.homeClub?.crestUrl || match.homeClub?.logoUrl}
                              alt={match.homeClub?.name}
                              sx={{ width: 36, height: 36, bgcolor: 'white', p: 0.3 }}
                            />
                          ) : (
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                              {match.homeClub?.tla || 'HOM'}
                            </Avatar>
                          )}
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {match.homeClub?.shortName || match.homeClub?.name || 'TBD'}
                          </Typography>
                        </Box>
                        {match.status === 'FINISHED' && (
                          <Typography variant="h6" fontWeight={700} sx={{ minWidth: 28, textAlign: 'center' }}>
                            {match.homeScore ?? '-'}
                          </Typography>
                        )}
                      </Box>

                      {/* Away Team */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                          {match.awayClub?.crestUrl || match.awayClub?.logoUrl ? (
                            <Avatar
                              src={match.awayClub?.crestUrl || match.awayClub?.logoUrl}
                              alt={match.awayClub?.name}
                              sx={{ width: 36, height: 36, bgcolor: 'white', p: 0.3 }}
                            />
                          ) : (
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'error.main', fontSize: '0.75rem' }}>
                              {match.awayClub?.tla || 'AWY'}
                            </Avatar>
                          )}
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {match.awayClub?.shortName || match.awayClub?.name || 'TBD'}
                          </Typography>
                        </Box>
                        {match.status === 'FINISHED' && (
                          <Typography variant="h6" fontWeight={700} sx={{ minWidth: 28, textAlign: 'center' }}>
                            {match.awayScore ?? '-'}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Footer */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Stadium sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {match.venue || 'TBD'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {match.matchDate ? format(new Date(match.matchDate), 'MMM dd, yyyy') : 'TBD'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Schedule sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No matches found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Matches;
