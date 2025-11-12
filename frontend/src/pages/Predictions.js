import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  AutoAwesome,
  Refresh,
  EmojiEvents,
} from '@mui/icons-material';
import { predictionsAPI } from '../services/api';
import { format } from 'date-fns';

const Predictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await predictionsAPI.getUpcoming();
      setPredictions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setLoading(false);
    }
  };

  const handleGeneratePredictions = async () => {
    setGenerating(true);
    try {
      await predictionsAPI.generate();
      await fetchPredictions();
    } catch (error) {
      console.error('Error generating predictions:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getOutcomeText = (outcome) => {
    switch (outcome) {
      case 'HOME_WIN': return 'Home Win';
      case 'AWAY_WIN': return 'Away Win';
      case 'DRAW': return 'Draw';
      default: return outcome;
    }
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'HOME_WIN': return 'primary';
      case 'AWAY_WIN': return 'error';
      case 'DRAW': return 'warning';
      default: return 'default';
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Match Predictions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered predictions based on recent form and standings
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={fetchPredictions} color="primary">
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
            onClick={handleGeneratePredictions}
            disabled={generating}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            {generating ? 'Generating...' : 'Generate Predictions'}
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Total Predictions
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {predictions.length}
                  </Typography>
                </Box>
                <Psychology sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Avg Confidence
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {predictions.length > 0 
                      ? Math.round(predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length)
                      : 0}%
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Based On
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    Form & Standings
                  </Typography>
                </Box>
                <EmojiEvents sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Predictions List */}
      {predictions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Psychology sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No predictions available
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Click "Generate Predictions" to create predictions for upcoming matches
            </Typography>
            <Button
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={handleGeneratePredictions}
            >
              Generate Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {predictions.map((prediction) => (
            <Grid item xs={12} md={6} key={prediction.id}>
              <Card
                sx={{
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      icon={<Psychology />}
                      label={getOutcomeText(prediction.predictedOutcome)}
                      color={getOutcomeColor(prediction.predictedOutcome)}
                      sx={{ fontWeight: 600 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {prediction.match?.matchDate 
                        ? format(new Date(prediction.match.matchDate), 'MMM dd, HH:mm')
                        : 'TBD'}
                    </Typography>
                  </Box>

                  {/* Match Details */}
                  <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={5}>
                      <Box sx={{ textAlign: 'center' }}>
                        {prediction.match?.homeClub?.crestUrl && (
                          <Box
                            component="img"
                            src={prediction.match.homeClub.crestUrl}
                            alt={prediction.match.homeClub.name}
                            sx={{ width: 40, height: 40, mb: 1, objectFit: 'contain' }}
                          />
                        )}
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          {prediction.match?.homeClub?.shortName || prediction.match?.homeClub?.name}
                        </Typography>
                        <Chip
                          label={`#${prediction.homePosition}`}
                          size="small"
                          sx={{ bgcolor: 'grey.100', fontSize: '0.7rem', mb: 1 }}
                        />
                        <Typography variant="h3" fontWeight={700} color="primary.main">
                          {prediction.predictedHomeScore}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Form: {prediction.homeFormPoints}/15
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={2}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          VS
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={5}>
                      <Box sx={{ textAlign: 'center' }}>
                        {prediction.match?.awayClub?.crestUrl && (
                          <Box
                            component="img"
                            src={prediction.match.awayClub.crestUrl}
                            alt={prediction.match.awayClub.name}
                            sx={{ width: 40, height: 40, mb: 1, objectFit: 'contain' }}
                          />
                        )}
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          {prediction.match?.awayClub?.shortName || prediction.match?.awayClub?.name}
                        </Typography>
                        <Chip
                          label={`#${prediction.awayPosition}`}
                          size="small"
                          sx={{ bgcolor: 'grey.100', fontSize: '0.7rem', mb: 1 }}
                        />
                        <Typography variant="h3" fontWeight={700} color="error.main">
                          {prediction.predictedAwayScore}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Form: {prediction.awayFormPoints}/15
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Win Probabilities */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mb: 1 }}>
                      Win Probabilities
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <LinearProgress
                          variant="determinate"
                          value={prediction.homeWinProbability}
                          sx={{ height: 8, borderRadius: 1, bgcolor: 'grey.200' }}
                        />
                        <Typography variant="caption" align="center" display="block" sx={{ mt: 0.5 }}>
                          Home: {Math.round(prediction.homeWinProbability)}%
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <LinearProgress
                          variant="determinate"
                          value={prediction.drawProbability}
                          sx={{ height: 8, borderRadius: 1, bgcolor: 'grey.200' }}
                          color="warning"
                        />
                        <Typography variant="caption" align="center" display="block" sx={{ mt: 0.5 }}>
                          Draw: {Math.round(prediction.drawProbability)}%
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <LinearProgress
                          variant="determinate"
                          value={prediction.awayWinProbability}
                          sx={{ height: 8, borderRadius: 1, bgcolor: 'grey.200' }}
                          color="error"
                        />
                        <Typography variant="caption" align="center" display="block" sx={{ mt: 0.5 }}>
                          Away: {Math.round(prediction.awayWinProbability)}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Reasoning */}
                  {prediction.reasoning && (
                    <Alert
                      severity="info"
                      icon={<Psychology />}
                      sx={{
                        '& .MuiAlert-message': {
                          width: '100%',
                        },
                      }}
                    >
                      <Typography variant="caption">
                        {prediction.reasoning}
                      </Typography>
                    </Alert>
                  )}

                  {/* Confidence Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Chip
                      label={`${Math.round(prediction.confidence)}% Confidence`}
                      size="small"
                      sx={{
                        bgcolor: prediction.confidence > 60 ? 'success.50' : 'warning.50',
                        color: prediction.confidence > 60 ? 'success.main' : 'warning.main',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Predictions;
