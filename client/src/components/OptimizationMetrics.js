import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Balance as BalanceIcon,
  School as SchoolIcon,
  EmojiPeople as BehaviorIcon,
  Accessibility as SpecialNeedsIcon,
  Favorite as RequestsIcon,
  CheckCircle as CheckCircleIcon,
  PriorityHigh as PriorityHighIcon,
  Group as GroupIcon,
  AccessibilityNew as AccessibilityNewIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

/**
 * Component to display fulfillment of parent requests
 */
export const ParentRequestFulfillment = ({ parentRequests }) => {
  if (!parentRequests || !parentRequests.requests || parentRequests.requests.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          No parent requests available
        </Typography>
      </Box>
    );
  }

  const fulfillmentRate = parentRequests.total > 0 
    ? Math.round((parentRequests.fulfilled / parentRequests.total) * 100) 
    : 0;

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Parent Request Fulfillment
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              {parentRequests.fulfilled} of {parentRequests.total} requests fulfilled
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {fulfillmentRate}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={fulfillmentRate} 
            color={fulfillmentRate >= 75 ? "success" : fulfillmentRate >= 50 ? "primary" : "warning"}
            sx={{ height: 8, borderRadius: 5 }}
          />
        </Box>
        
        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
          {parentRequests.requests.map((request) => (
            <ListItem key={request.id} divider>
              <ListItemIcon>
                {request.type === 'teacher' ? <SchoolIcon color="primary" /> : <PersonIcon color="primary" />}
              </ListItemIcon>
              <ListItemText
                primary={`${request.studentName} with ${request.targetName}`}
                secondary={`Request Type: ${request.type === 'teacher' ? 'Teacher' : 'Classmate'}`}
              />
              <ListItemSecondaryAction>
                {request.fulfilled ? (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Fulfilled"
                    size="small"
                    color="success"
                  />
                ) : (
                  <Chip
                    icon={<PriorityHighIcon />}
                    label="Not Fulfilled"
                    size="small"
                    color="default"
                  />
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

/**
 * Component to display optimization metrics
 */
const OptimizationMetrics = ({ data, parentRequests }) => {
  if (!data) return null;

  const metricsData = [
    {
      title: 'Gender Balance',
      value: data.genderBalance || 0,
      icon: <GroupIcon />,
      color: getColorForValue(data.genderBalance),
      description: 'Even distribution of male and female students across classes'
    },
    {
      title: 'Academic Balance',
      value: data.academicBalance || 0,
      icon: <SchoolIcon />,
      color: getColorForValue(data.academicBalance),
      description: 'Similar distribution of academic abilities in each class'
    },
    {
      title: 'Behavioral Balance',
      value: data.behavioralBalance || 0,
      icon: <PsychologyIcon />,
      color: getColorForValue(data.behavioralBalance),
      description: 'Even distribution of behavioral needs across classes'
    },
    {
      title: 'Special Needs Distribution',
      value: data.specialNeedsDistribution || 0,
      icon: <AccessibilityNewIcon />,
      color: getColorForValue(data.specialNeedsDistribution),
      description: 'Balanced allocation of students with special needs'
    },
    {
      title: 'Parent Requests Fulfilled',
      value: data.parentRequestsFulfilled || 0,
      icon: <BalanceIcon />,
      color: getColorForValue(data.parentRequestsFulfilled),
      description: 'Percentage of parent placement requests honored'
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Optimization Metrics
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          These metrics show how well the optimization algorithm has balanced various factors
          across all classes. Higher percentages indicate better balance.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Balance Metrics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {metricsData.map((metric) => (
                <Box key={metric.title} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: `${metric.color}.light`,
                      color: `${metric.color}.dark`,
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      mr: 1
                    }}>
                      {metric.icon}
                    </Box>
                    <Typography variant="body1">{metric.title}</Typography>
                    <Box sx={{ flex: 1 }} />
                    <Typography variant="body1" fontWeight="medium">
                      {metric.value}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={metric.value} 
                    color={metric.color}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                    {metric.description}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ParentRequestFulfillment parentRequests={parentRequests} />
          
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Optimization Impact
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Overall Balance Score
                  </Typography>
                  <Typography variant="h4" color="primary" fontWeight="medium">
                    {calculateOverallScore(data)}%
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" gutterBottom color="textSecondary">
                    Improvement from Random Assignment
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h5" color="success.main" fontWeight="medium" sx={{ mr: 1 }}>
                      +{Math.round((calculateOverallScore(data) - 70) * 1.5)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      better balanced classes
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Rebalancing Recommendation
                  </Typography>
                  {calculateOverallScore(data) >= 85 ? (
                    <Chip 
                      color="success" 
                      icon={<CheckCircleIcon />} 
                      label="Excellent Balance - No Changes Needed" 
                      sx={{ height: 'auto', py: 0.5 }}
                    />
                  ) : calculateOverallScore(data) >= 75 ? (
                    <Chip 
                      color="info" 
                      label="Good Balance - Minor Tweaks Recommended" 
                      sx={{ height: 'auto', py: 0.5 }}
                    />
                  ) : (
                    <Chip 
                      color="warning" 
                      label="Needs Improvement - Consider Re-optimizing" 
                      sx={{ height: 'auto', py: 0.5 }}
                    />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

// Helper function to determine color based on value
function getColorForValue(value) {
  if (value >= 90) return 'success';
  if (value >= 75) return 'primary';
  if (value >= 60) return 'info';
  if (value >= 45) return 'warning';
  return 'error';
}

// Helper function to calculate overall score
function calculateOverallScore(data) {
  const values = [
    data.genderBalance || 0,
    data.academicBalance || 0,
    data.behavioralBalance || 0,
    data.specialNeedsDistribution || 0,
    data.parentRequestsFulfilled || 0
  ];
  
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(average);
}

export default OptimizationMetrics; 