import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Search,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { clubsAPI } from '../services/api';

const Clubs = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await clubsAPI.getAll();
      setClubs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setLoading(false);
    }
  };

  const getPositionColor = (position) => {
    if (!position) return 'transparent';
    if (position <= 4) return '#10B981'; // Champions League - Green
    if (position === 5) return '#F59E0B'; // Europa League - Orange
    if (position >= 18) return '#EF4444'; // Relegation - Red
    return 'transparent';
  };

  const getPositionBadge = (position) => {
    if (!position) return null;
    if (position <= 4) return 'UCL';
    if (position === 5) return 'UEL';
    if (position >= 18) return 'REL';
    return null;
  };

  const filteredClubs = clubs.filter(club =>
    club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.shortName?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Premier League Standings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current league table for 2024/25 season
          </Typography>
        </Box>

        <TextField
          placeholder="Search clubs..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: '100%', sm: 280 },
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
            },
          }}
        />
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: '#10B981' }} />
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Champions League
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: '#F59E0B' }} />
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Europa League
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: '#EF4444' }} />
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Relegation
          </Typography>
        </Box>
      </Box>

      {/* Standings Table */}
      <Card sx={{ overflow: 'hidden' }}>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', width: 60 }}>POS</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary' }}>CLUB</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', display: { xs: 'none', sm: 'table-cell' } }}>PL</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', display: { xs: 'none', md: 'table-cell' } }}>W</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', display: { xs: 'none', md: 'table-cell' } }}>D</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', display: { xs: 'none', md: 'table-cell' } }}>L</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', display: { xs: 'none', lg: 'table-cell' } }}>GF</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', display: { xs: 'none', lg: 'table-cell' } }}>GA</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary' }}>GD</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary' }}>PTS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClubs.map((club, index) => (
                <TableRow
                  key={club.name}
                  onClick={() => navigate(`/clubs/${club.id}`)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'grey.50',
                    },
                    borderLeft: '3px solid',
                    borderLeftColor: getPositionColor(club.position),
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {club.position || index + 1}
                      </Typography>
                      {getPositionBadge(club.position) && (
                        <Chip
                          label={getPositionBadge(club.position)}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: getPositionColor(club.position),
                            color: 'white',
                            display: { xs: 'none', sm: 'inline-flex' },
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {club.crestUrl || club.logoUrl ? (
                        <Avatar
                          src={club.crestUrl || club.logoUrl}
                          alt={club.name}
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'white',
                            p: 0.3,
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'primary.main',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {club.tla || club.shortName?.substring(0, 3).toUpperCase()}
                        </Avatar>
                      )}
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                          {club.shortName || club.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', lg: 'block' } }}>
                          {club.tla}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2">{club.playedGames || 0}</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2">{club.won || 0}</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2">{club.draw || 0}</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2">{club.lost || 0}</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    <Typography variant="body2">{club.goalsFor || 0}</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    <Typography variant="body2">{club.goalsAgainst || 0}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      {club.goalDifference > 0 && <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />}
                      {club.goalDifference < 0 && <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />}
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          color: club.goalDifference > 0 ? 'success.main' : club.goalDifference < 0 ? 'error.main' : 'text.primary',
                        }}
                      >
                        {club.goalDifference > 0 ? '+' : ''}{club.goalDifference || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={club.points || 0}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 700,
                        minWidth: 42,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Clubs;
