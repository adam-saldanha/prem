import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Avatar,
  Chip,
  Grid,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  ArrowBack,
  Stadium,
  Person,
  CalendarToday,
  SportsSoccer,
  Groups,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { clubsAPI, playersAPI } from '../services/api';

// Helper function to get country flag emoji from country code
const getCountryFlag = (nationality) => {
  if (!nationality) return '🏴';
  
  const countryFlags = {
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    'Northern Ireland': '🇬🇧',
    'Spain': '🇪🇸',
    'France': '🇫🇷',
    'Germany': '🇩🇪',
    'Italy': '🇮🇹',
    'Portugal': '🇵🇹',
    'Brazil': '🇧🇷',
    'Argentina': '🇦🇷',
    'Belgium': '🇧🇪',
    'Netherlands': '🇳🇱',
    'Croatia': '🇭🇷',
    'Uruguay': '🇺🇾',
    'Colombia': '🇨🇴',
    'Mexico': '🇲🇽',
    'Chile': '🇨🇱',
    'Senegal': '🇸🇳',
    'Ivory Coast': '🇨🇮',
    'Ghana': '🇬🇭',
    'Nigeria': '🇳🇬',
    'Egypt': '🇪🇬',
    'Morocco': '🇲🇦',
    'Algeria': '🇩🇿',
    'Japan': '🇯🇵',
    'South Korea': '🇰🇷',
    'Australia': '🇦🇺',
    'USA': '🇺🇸',
    'Canada': '🇨🇦',
    'Denmark': '🇩🇰',
    'Sweden': '🇸🇪',
    'Norway': '🇳🇴',
    'Finland': '🇫🇮',
    'Poland': '🇵🇱',
    'Austria': '🇦🇹',
    'Switzerland': '🇨🇭',
    'Czech Republic': '🇨🇿',
    'Serbia': '🇷🇸',
    'Ukraine': '🇺🇦',
    'Russia': '🇷🇺',
    'Turkey': '🇹🇷',
    'Greece': '🇬🇷',
    'Romania': '🇷🇴',
    'Slovakia': '🇸🇰',
    'Hungary': '🇭🇺',
    'Ireland': '🇮🇪',
    'Iceland': '🇮🇸',
    'Albania': '🇦🇱',
    'Bosnia-Herzegovina': '🇧🇦',
    'North Macedonia': '🇲🇰',
    'Slovenia': '🇸🇮',
    'Montenegro': '🇲🇪',
    'Ecuador': '🇪🇨',
    'Peru': '🇵🇪',
    'Venezuela': '🇻🇪',
    'Paraguay': '🇵🇾',
    'Costa Rica': '🇨🇷',
    'Jamaica': '🇯🇲',
    'Trinidad and Tobago': '🇹🇹',
    'Mali': '🇲🇱',
    'Burkina Faso': '🇧🇫',
    'Cameroon': '🇨🇲',
    'Guinea': '🇬🇳',
    'Cape Verde': '🇨🇻',
    'Gabon': '🇬🇦',
    'DR Congo': '🇨🇩',
    'Angola': '🇦🇴',
    'South Africa': '🇿🇦',
    'Tunisia': '🇹🇳',
    'China': '🇨🇳',
    'Iran': '🇮🇷',
    'Saudi Arabia': '🇸🇦',
    'UAE': '🇦🇪',
    'Iraq': '🇮🇶',
    'India': '🇮🇳',
    'Thailand': '🇹🇭',
    'Vietnam': '🇻🇳',
    'New Zealand': '🇳🇿',
    'Norway': '🇳🇴',
    'Uzbekistan': '🇺🇿',
  };
  
  return countryFlags[nationality] || '🌍';
};

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingSquad, setFetchingSquad] = useState(false);

  useEffect(() => {
    fetchClubDetails();
  }, [id]);

  const fetchClubDetails = async () => {
    try {
      console.log('Fetching club details for internal ID:', id);
      
      // Fetch club details from our backend
      const clubResponse = await clubsAPI.getById(id);
      const clubData = clubResponse.data;
      
      console.log('Club data received:', {
        name: clubData.name,
        internalId: clubData.id,
        externalId: clubData.externalId,
      });
      
      setClub(clubData);

      // Always fetch fresh squad data from Football-Data.org API
      if (clubData.externalId) {
        console.log('Fetching fresh squad data from API using external ID:', clubData.externalId);
        await fetchSquadFromAPI(clubData.externalId);
      } else {
        console.error('❌ Club has no external API ID! Cannot fetch squad data.');
        setPlayers([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching club details:', error);
      setLoading(false);
    }
  };

  const fetchSquadFromAPI = async (externalId) => {
    setFetchingSquad(true);
    try {
      const apiKey = process.env.REACT_APP_FOOTBALL_DATA_API_KEY;
      const apiUrl = `https://api.football-data.org/v4/teams/${externalId}`;
      
      console.log('═══════════════════════════════════════════════');
      console.log('🔄 FETCHING TEAM DATA FROM FOOTBALL-DATA.ORG');
      console.log('═══════════════════════════════════════════════');
      console.log('📍 API URL:', apiUrl);
      console.log('🔑 API Key present:', !!apiKey);
      console.log('🆔 External Team ID:', externalId);
      
      if (!apiKey) {
        console.error('❌ API key not found! Please set REACT_APP_FOOTBALL_DATA_API_KEY in frontend/.env');
        console.error('💡 Create frontend/.env file with: REACT_APP_FOOTBALL_DATA_API_KEY=your_key_here');
        setPlayers([]);
        setFetchingSquad(false);
        return;
      }

      // Fetch team data directly from Football-Data.org
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-Auth-Token': apiKey,
        },
      });

      console.log('📊 API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Response received successfully');
      console.log('📦 Team Name:', data.name);
      console.log('🏟️  Stadium:', data.venue);
      console.log('👔 Manager:', data.coach?.name);
      console.log('📅 Founded:', data.founded);
      console.log('👥 Squad Size:', data.squad?.length || 0);
      
      // Update club details with API data
      if (data) {
        setClub(prev => ({
          ...prev,
          stadium: data.venue || prev.stadium,
          manager: data.coach?.name || prev.manager,
          foundedYear: data.founded || prev.foundedYear,
          website: data.website,
          clubColors: data.clubColors,
        }));
      }
      
      // Transform API squad data to our format
      if (data.squad && Array.isArray(data.squad)) {
        console.log('🔄 Transforming squad data...');
        console.log('📋 Sample player (first):', data.squad[0]);
        
        const transformedPlayers = data.squad.map(player => ({
          id: player.id,
          name: player.name,
          position: player.position || 'Unknown',
          nationality: player.nationality || null,
        }));
        
        console.log('✅ Transformed', transformedPlayers.length, 'players');
        console.log('📋 Sample transformed player:', transformedPlayers[0]);
        console.log('═══════════════════════════════════════════════');
        
        setPlayers(transformedPlayers);
      } else {
        console.warn('❌ No squad data in API response');
        console.log('═══════════════════════════════════════════════');
        setPlayers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching squad from API:', error);
      console.error('Error details:', error.message);
      setPlayers([]);
    } finally {
      setFetchingSquad(false);
    }
  };

  const getPositionColor = (position) => {
    switch (position?.toLowerCase()) {
      case 'goalkeeper':
        return 'warning';
      case 'defender':
        return 'info';
      case 'midfielder':
        return 'success';
      case 'forward':
      case 'attacker':
        return 'error';
      default:
        return 'default';
    }
  };

  const groupPlayersByPosition = () => {
    const grouped = {
      Goalkeeper: [],
      Defender: [],
      Midfielder: [],
      Forward: [],
      Unknown: [],
    };

    players.forEach(player => {
      const pos = (player.position || 'Unknown').toLowerCase();
      
      if (pos.includes('goalkeeper')) {
        grouped.Goalkeeper.push(player);
      } else if (pos.includes('defence') || pos.includes('defender') || pos.includes('back')) {
        grouped.Defender.push(player);
      } else if (pos.includes('midfield')) {
        grouped.Midfielder.push(player);
      } else if (pos.includes('offence') || pos.includes('forward') || pos.includes('attacker') || 
                 pos.includes('winger') || pos.includes('striker') || pos === 'attack') {
        grouped.Forward.push(player);
      } else {
        grouped.Unknown.push(player);
      }
    });

    return grouped;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (!club) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Club not found
        </Typography>
      </Box>
    );
  }

  const playersByPosition = groupPlayersByPosition();

  return (
    <Box>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <IconButton
          onClick={() => navigate('/clubs')}
          sx={{
            bgcolor: 'white',
            '&:hover': { bgcolor: 'grey.100' },
            boxShadow: 1,
          }}
        >
          <ArrowBack />
        </IconButton>
      </Box>

      {/* Club Header */}
      <Card sx={{ mb: 3, overflow: 'visible' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3}>
            {/* Club Identity */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                {club.crestUrl || club.logoUrl ? (
                  <Avatar
                    src={club.crestUrl || club.logoUrl}
                    alt={club.name}
                    sx={{
                      width: { xs: 80, md: 100 },
                      height: { xs: 80, md: 100 },
                      bgcolor: 'white',
                      p: 1,
                      boxShadow: 2,
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: { xs: 80, md: 100 },
                      height: { xs: 80, md: 100 },
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                      fontWeight: 700,
                    }}
                  >
                    {club.tla || club.shortName?.substring(0, 3).toUpperCase()}
                  </Avatar>
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                    {club.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Position: #${club.position}`}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      label={`${club.points || 0} Points`}
                      sx={{
                        bgcolor: 'success.main',
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Club Info Grid */}
              <Grid container spacing={3}>
                {club.stadium && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Stadium sx={{ color: 'primary.main', mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Stadium
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {club.stadium}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {club.manager && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Person sx={{ color: 'primary.main', mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Manager
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {club.manager}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {club.foundedYear && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <CalendarToday sx={{ color: 'primary.main', mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Founded
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {club.foundedYear}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Groups sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Squad Size
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {players.length} Players
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Season Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Points
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {club.points || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Matches Played
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {club.playedGames || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Goal Difference
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                color={club.goalDifference > 0 ? 'success.main' : club.goalDifference < 0 ? 'error.main' : 'text.primary'}
              >
                {club.goalDifference > 0 ? '+' : ''}{club.goalDifference || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Form (W-D-L)
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {club.won || 0}-{club.draw || 0}-{club.lost || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Squad */}
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Squad
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {players.length} players
            </Typography>
          </Box>

          {fetchingSquad && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={48} sx={{ color: 'primary.main', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Fetching squad data from Football-Data.org...
              </Typography>
            </Box>
          )}

          {!fetchingSquad && players.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SportsSoccer sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No squad data available for this club
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Check browser console for error details
              </Typography>
            </Box>
          )}

          {!fetchingSquad && players.length > 0 && (
            <Box>
              {Object.entries(playersByPosition).map(([position, positionPlayers]) => {
                if (positionPlayers.length === 0) return null;

                return (
                  <Box key={position} sx={{ mb: 4 }}>
                    {/* Position Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 4,
                          height: 24,
                          bgcolor: 
                            position === 'Goalkeeper' ? 'warning.main' :
                            position === 'Defender' ? 'info.main' :
                            position === 'Midfielder' ? 'success.main' :
                            position === 'Forward' ? 'error.main' : 'grey.400',
                          borderRadius: 1,
                        }}
                      />
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        {position}s
                      </Typography>
                      <Chip
                        label={positionPlayers.length}
                        size="small"
                        sx={{
                          bgcolor: 'grey.100',
                          color: 'text.secondary',
                          fontWeight: 600,
                          height: 24,
                        }}
                      />
                    </Box>

                    {/* Players Grid */}
                    <Grid container spacing={1.5}>
                      {positionPlayers
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((player) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={player.id}>
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'white',
                                border: '1px solid',
                                borderColor: 'grey.200',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  boxShadow: 2,
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ flexGrow: 1, minWidth: 0, pr: 1 }}>
                                  <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    color="text.primary"
                                    sx={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      mb: 0.5,
                                    }}
                                  >
                                    {player.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {player.position}
                                  </Typography>
                                </Box>
                                <Typography
                                  sx={{
                                    fontSize: '1.5rem',
                                    lineHeight: 1,
                                  }}
                                >
                                  {getCountryFlag(player.nationality)}
                                </Typography>
                              </Box>
                              <Divider sx={{ my: 1 }} />
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
                                {player.nationality || 'Unknown'}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                    </Grid>
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClubDetail;

