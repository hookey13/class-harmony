import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  TrendingUp,
  Warning,
  CheckCircle,
  Info,
  Refresh,
  Help,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import axios from 'axios';

const PredictiveAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [predictions, setPredictions] = useState({
    classPlacementPredictions: [],
    studentPerformancePredictions: [],
    classBalanceProjections: [],
    riskAssessments: [],
    recommendedActions: []
  });
  const [modelConfidence, setModelConfidence] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchPredictiveData();
  }, [selectedGrade]);

  const fetchPredictiveData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics/predictions', {
        params: { grade: selectedGrade }
      });
      setPredictions(response.data);
      setModelConfidence(response.data.modelConfidence || 0);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch predictive analytics data');
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderConfidenceIndicator = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Model Confidence
          </Typography>
          <Tooltip title="Indicates the AI model's confidence level in its predictions">
            <IconButton size="small">
              <Help />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1, mr: 2 }}>
            <LinearProgress
              variant="determinate"
              value={modelConfidence}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: modelConfidence > 70 ? '#4caf50' : modelConfidence > 40 ? '#ff9800' : '#f44336',
                  borderRadius: 5,
                }
              }}
            />
          </Box>
          <Typography variant="body2" color="textSecondary">
            {`${Math.round(modelConfidence)}%`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderClassPlacementPredictions = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Class Placement Predictions
      </Typography>
      <List>
        {predictions.classPlacementPredictions.map((prediction, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={prediction.title}
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {prediction.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={`Confidence: ${prediction.confidence}%`}
                        color={prediction.confidence > 70 ? 'success' : 'warning'}
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        size="small"
                        label={`Impact: ${prediction.impact}`}
                        color={prediction.impact === 'High' ? 'error' : 'primary'}
                      />
                    </Box>
                  </Box>
                }
              />
            </ListItem>
            {index < predictions.classPlacementPredictions.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );

  const renderStudentPerformancePredictions = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Student Performance Projections
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis dataKey="currentScore" name="Current Score" unit="%" />
          <YAxis dataKey="projectedScore" name="Projected Score" unit="%" />
          <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter
            name="Students"
            data={predictions.studentPerformancePredictions}
            fill="#8884d8"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </Paper>
  );

  const renderClassBalanceProjections = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Class Balance Projections
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={predictions.classBalanceProjections}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="academicBalance"
            stroke="#8884d8"
            name="Academic Balance"
          />
          <Line
            type="monotone"
            dataKey="behavioralBalance"
            stroke="#82ca9d"
            name="Behavioral Balance"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );

  const renderRiskAssessments = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Risk Assessments
      </Typography>
      <Timeline>
        {predictions.riskAssessments.map((risk, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot color={risk.severity === 'high' ? 'error' : 'warning'}>
                <Warning />
              </TimelineDot>
              {index < predictions.riskAssessments.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle1">{risk.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                {risk.description}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={`Severity: ${risk.severity}`}
                  color={risk.severity === 'high' ? 'error' : 'warning'}
                  sx={{ mr: 1 }}
                />
                <Chip
                  size="small"
                  label={`Probability: ${risk.probability}%`}
                  color="primary"
                />
              </Box>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );

  const renderRecommendedActions = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recommended Actions
      </Typography>
      <List>
        {predictions.recommendedActions.map((action, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {action.type === 'immediate' ? (
                      <Warning color="error" sx={{ mr: 1 }} />
                    ) : (
                      <Info color="primary" sx={{ mr: 1 }} />
                    )}
                    {action.title}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {action.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={`Priority: ${action.priority}`}
                        color={action.priority === 'High' ? 'error' : 'primary'}
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        size="small"
                        label={`Impact: ${action.impact}`}
                        color="secondary"
                      />
                    </Box>
                  </Box>
                }
              />
            </ListItem>
            {index < predictions.recommendedActions.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4">
            Predictive Analytics & Insights
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="grade-label">Grade</InputLabel>
              <Select
                labelId="grade-label"
                id="grade"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                label="Grade"
              >
                <MenuItem value="all">All Grades</MenuItem>
                <MenuItem value="K">Kindergarten</MenuItem>
                <MenuItem value="1">Grade 1</MenuItem>
                <MenuItem value="2">Grade 2</MenuItem>
                <MenuItem value="3">Grade 3</MenuItem>
                <MenuItem value="4">Grade 4</MenuItem>
                <MenuItem value="5">Grade 5</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchPredictiveData}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {renderConfidenceIndicator()}
            </Grid>

            <Grid item xs={12} md={6}>
              {renderClassPlacementPredictions()}
            </Grid>

            <Grid item xs={12} md={6}>
              {renderStudentPerformancePredictions()}
            </Grid>

            <Grid item xs={12}>
              {renderClassBalanceProjections()}
            </Grid>

            <Grid item xs={12} md={6}>
              {renderRiskAssessments()}
            </Grid>

            <Grid item xs={12} md={6}>
              {renderRecommendedActions()}
            </Grid>
          </Grid>
        )}

        {lastUpdated && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="body2" color="textSecondary">
              Last updated: {lastUpdated.toLocaleString()}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default PredictiveAnalytics; 