import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
  ExpandMore as ExpandMoreIcon,
  InsertChart as InsertChartIcon,
  Wc as GenderIcon,
  School as AcademicIcon,
  School as SchoolIcon,
  Announcement as BehavioralIcon,
  Accessibility as SpecialNeedsIcon,
  People as ParentRequestsIcon,
  SwapHoriz as SwapIcon,
  ArrowForward as MoveIcon,
  InfoOutlined as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  ContactSupport as HelpIcon,
  Refresh as RefreshIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import aiSuggestionService from '../services/aiSuggestionService';

/**
 * Component to display AI-powered suggestions for class optimization
 */
const AISuggestions = ({ classData, onApplySuggestion, loading: parentLoading, onRefresh }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [insights, setInsights] = useState(null);
  const [constraints, setConstraints] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    if (classData) {
      fetchAIData();
    }
  }, [classData]);

  const fetchAIData = async () => {
    setLoading(true);
    setError(null);
    try {
      const insightsData = await aiSuggestionService.getInsights(classData);
      setInsights(insightsData);

      if (classData.classes && classData.classes.length > 0) {
        const placementData = await aiSuggestionService.getPlacementSuggestions(
          classData,
          classData.classes[0].id // Default to first class
        );
        setSuggestions(placementData);
      }

      const constraintData = await aiSuggestionService.getConstraintAnalysis(classData);
      setConstraints(constraintData);
    } catch (err) {
      console.error('Error fetching AI data:', err);
      setError('Failed to load AI suggestions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAIData();
    if (onRefresh) onRefresh();
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <ErrorIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      case 'low':
        return <InfoIcon color="info" />;
      case 'info':
        return <CheckIcon color="success" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  const getImpactChipColor = (value) => {
    if (!value) return 'default';
    if (value.startsWith('+')) {
      const num = parseFloat(value);
      if (num >= 5) return 'success';
      if (num > 0) return 'info';
      return 'default';
    }
    if (value.startsWith('-')) return 'error';
    return 'default';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'gender':
        return <GenderIcon color="primary" />;
      case 'academic':
        return <AcademicIcon color="primary" />;
      case 'behavioral':
        return <BehavioralIcon color="primary" />;
      case 'special_needs':
        return <SpecialNeedsIcon color="primary" />;
      case 'parent_requests':
        return <ParentRequestsIcon color="primary" />;
      case 'teacher_specialization':
        return <SchoolIcon color="primary" />;
      case 'swap':
        return <SwapIcon color="primary" />;
      case 'move':
        return <MoveIcon color="primary" />;
      default:
        return <InfoIcon color="primary" />;
    }
  };

  if (loading || parentLoading) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PsychologyIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">AI Suggestions</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
        <Typography variant="body2" color="text.secondary" align="center">
          Processing class data and generating intelligent suggestions...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PsychologyIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">AI Suggestions</Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          onClick={handleRefresh}
          fullWidth
        >
          Retry
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PsychologyIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">AI Suggestions</Typography>
        </Box>
        <Tooltip title="Refresh suggestions">
          <IconButton onClick={handleRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant={activeTab === 'insights' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('insights')}
            startIcon={<LightbulbIcon />}
            size="small"
          >
            Insights
          </Button>
          <Button
            variant={activeTab === 'suggestions' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('suggestions')}
            startIcon={<TuneIcon />}
            size="small"
          >
            Improvement Suggestions
          </Button>
          <Button
            variant={activeTab === 'constraints' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('constraints')}
            startIcon={<InfoIcon />}
            size="small"
          >
            Constraints
          </Button>
        </Box>
        
        {activeTab === 'insights' && insights && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Overall Balance Score: {insights.balanceScore}%
              <LinearProgress
                variant="determinate"
                value={insights.balanceScore}
                sx={{ height: 8, borderRadius: 5, mt: 1 }}
                color={
                  insights.balanceScore >= 85
                    ? 'success'
                    : insights.balanceScore >= 70
                    ? 'info'
                    : insights.balanceScore >= 50
                    ? 'warning'
                    : 'error'
                }
              />
            </Alert>
            
            <Typography variant="body2" paragraph>
              {insights.summary}
            </Typography>
            
            <List>
              {insights.insights.map((insight, index) => (
                <ListItem
                  key={index}
                  sx={{
                    mb: 1,
                    bgcolor:
                      insight.severity === 'high'
                        ? 'error.light'
                        : insight.severity === 'medium'
                        ? 'warning.light'
                        : insight.severity === 'low'
                        ? 'info.light'
                        : 'success.light',
                    borderRadius: 1,
                    py: 1,
                  }}
                >
                  <ListItemIcon>{getSeverityIcon(insight.severity)}</ListItemIcon>
                  <ListItemText
                    primary={insight.message}
                    secondary={
                      insight.affectedClasses && insight.affectedClasses.length > 0
                        ? `Affected classes: ${insight.affectedClasses.join(', ')}`
                        : null
                    }
                  />
                  <Chip
                    size="small"
                    icon={getTypeIcon(insight.type)}
                    label={insight.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {activeTab === 'suggestions' && suggestions && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Recommended Student Placement Changes
            </Typography>
            
            <Typography variant="body2" paragraph>
              {suggestions.summary}
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Suggested Actions:
            </Typography>
            
            <Grid container spacing={2}>
              {suggestions.suggestions.map((suggestion, index) => (
                <Grid item xs={12} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ mr: 1 }}>
                          {suggestion.type === 'swap' ? (
                            <SwapIcon color="primary" />
                          ) : (
                            <MoveIcon color="primary" />
                          )}
                        </Box>
                        <Typography variant="subtitle1">
                          {suggestion.type === 'swap'
                            ? 'Swap Students'
                            : 'Move Student'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        {suggestion.type === 'swap' ? (
                          <Typography variant="body2">
                            Swap <strong>{suggestion.studentA.name}</strong> (in class{' '}
                            {suggestion.studentA.currentClass}) with{' '}
                            <strong>{suggestion.studentB.name}</strong> (in class{' '}
                            {suggestion.studentB.currentClass})
                          </Typography>
                        ) : (
                          <Typography variant="body2">
                            Move <strong>{suggestion.student.name}</strong> from class{' '}
                            {suggestion.student.currentClass} to class{' '}
                            {suggestion.targetClass}
                          </Typography>
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {suggestion.reason}
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Impact:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {Object.entries(suggestion.impact).map(
                          ([metric, value]) =>
                            value !== '0%' && (
                              <Chip
                                key={metric}
                                size="small"
                                label={`${metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${value}`}
                                color={getImpactChipColor(value)}
                              />
                            )
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => onApplySuggestion(suggestion)}
                        >
                          Apply
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {suggestions.constraints && suggestions.constraints.length > 0 && (
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    Student Constraints ({suggestions.constraints.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {suggestions.constraints.map((constraint, index) => (
                      <ListItem key={index} divider={index < suggestions.constraints.length - 1}>
                        <ListItemIcon>
                          {constraint.constraintType === 'parent_request' ? (
                            <ParentRequestsIcon color="primary" />
                          ) : (
                            <SpecialNeedsIcon color="primary" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${constraint.student.name} (${constraint.student.currentClass})`}
                          secondary={constraint.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        )}
        
        {activeTab === 'constraints' && constraints && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Constraining Factors Analysis
            </Typography>
            
            <List>
              {constraints.constrainingFactors.map((factor, index) => (
                <ListItem
                  key={index}
                  sx={{
                    mb: 1,
                    bgcolor:
                      factor.impact === 'high'
                        ? 'error.light'
                        : factor.impact === 'medium'
                        ? 'warning.light'
                        : 'info.light',
                    borderRadius: 1,
                    py: 1,
                  }}
                >
                  <ListItemIcon>{getTypeIcon(factor.type)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        {factor.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2">{factor.description}</Typography>
                        {factor.affectedClasses && (
                          <Typography variant="caption">
                            Affected classes: {factor.affectedClasses.join(', ')}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <Chip
                    size="small"
                    label={`${factor.impact} impact`}
                    color={
                      factor.impact === 'high'
                        ? 'error'
                        : factor.impact === 'medium'
                        ? 'warning'
                        : 'info'
                    }
                  />
                </ListItem>
              ))}
            </List>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Recommendations to Reduce Constraints:
            </Typography>
            <List dense>
              {constraints.recommendations.map((recommendation, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <LightbulbIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
            </List>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              {constraints.estimatedImpact}
            </Alert>
          </Box>
        )}
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Powered by AI analysis of school data
        </Typography>
        <Tooltip title="Learn more about AI recommendations">
          <IconButton size="small">
            <HelpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default AISuggestions; 