import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Divider,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Avatar,
  Chip,
  CircularProgress,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  PeopleAlt as PeopleAltIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Event as EventIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  DonutLarge as DonutLargeIcon,
  AccountBalance as AccountBalanceIcon,
  Build as BuildIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarTodayIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// Array of colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

/**
 * Component to display key metrics in a small card format
 */
const MetricCard = ({ title, value, icon, color, percent, trend, description }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Avatar sx={{ bgcolor: `${color}.light`, width: 40, height: 40 }}>
            {icon}
          </Avatar>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
          {percent && (
            <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>
              {percent}%
            </Typography>
          )}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trend === 'up' ? (
              <ArrowUpwardIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
            ) : (
              <ArrowDownwardIcon fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
            )}
            <Typography variant="body2" color={trend === 'up' ? 'success.main' : 'error.main'}>
              {trend === 'up' ? '+' : '-'}
              {Math.abs(percent)}% from last period
            </Typography>
          </Box>
        )}
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Component for the optimization status overview
 */
const OptimizationStatusCard = ({ status, lastRun, academicYear, grade, onOptimize }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'not_started':
        return 'error';
      default:
        return 'info';
    }
  };
  
  return (
    <Card>
      <CardHeader
        title="Class Optimization"
        subheader={`Status: ${status === 'complete' ? 'Complete' : status === 'in_progress' ? 'In Progress' : 'Not Started'}`}
        action={
          <Chip 
            label={status === 'complete' ? 'Complete' : status === 'in_progress' ? 'In Progress' : 'Not Started'} 
            color={getStatusColor(status)}
            variant="filled"
          />
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Academic Year
            </Typography>
            <Typography variant="body1">
              {academicYear}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Grade Level
            </Typography>
            <Typography variant="body1">
              {grade}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Last Optimization Run
            </Typography>
            <Typography variant="body1">
              {lastRun || 'Never'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Button 
          variant="contained" 
          fullWidth 
          color="primary"
          onClick={() => navigate('/admin/optimize')}
          startIcon={<BarChartIcon />}
        >
          {status === 'complete' ? 'View Results' : 'Start Optimization'}
        </Button>
      </CardActions>
    </Card>
  );
};

/**
 * Component to display parent request statistics
 */
const ParentRequestsCard = ({ stats }) => {
  const navigate = useNavigate();
  
  if (!stats) {
    return (
      <Card>
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }
  
  const requestData = [
    { name: 'Submitted', value: stats.submitted },
    { name: 'Pending', value: stats.pending },
    { name: 'Approved', value: stats.approved },
    { name: 'Rejected', value: stats.rejected }
  ];
  
  const completionRate = Math.round((stats.submitted / stats.total) * 100);
  
  return (
    <Card>
      <CardHeader 
        title="Parent Preferences" 
        subheader={`${stats.submitted} of ${stats.total} families have submitted preferences`}
      />
      <CardContent>
        <Box sx={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={requestData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {requestData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value, name) => [value, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Completion Rate: {completionRate}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={completionRate} 
            sx={{ height: 8, borderRadius: 5 }} 
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={() => navigate('/admin/parent-preferences')}
          startIcon={<ArrowForwardIcon />}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

/**
 * Component to display teacher preferences statistics
 */
const TeacherPreferencesCard = ({ stats }) => {
  const navigate = useNavigate();
  
  if (!stats) {
    return (
      <Card>
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }
  
  const teachingStyleData = [
    { name: 'Collaborative', value: stats.teachingStyles.collaborative },
    { name: 'Traditional', value: stats.teachingStyles.traditional },
    { name: 'Project-based', value: stats.teachingStyles.projectBased },
    { name: 'Mixed', value: stats.teachingStyles.mixed }
  ];
  
  const completionRate = Math.round((stats.submitted / stats.total) * 100);
  
  return (
    <Card>
      <CardHeader 
        title="Teacher Preferences" 
        subheader={`${stats.submitted} of ${stats.total} teachers have submitted preferences`}
      />
      <CardContent>
        <Box sx={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={teachingStyleData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#8884d8">
                {teachingStyleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Completion Rate: {completionRate}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={completionRate} 
            sx={{ height: 8, borderRadius: 5 }} 
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={() => navigate('/admin/teacher-preferences')}
          startIcon={<ArrowForwardIcon />}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

/**
 * Component to display student distribution
 */
const StudentDistributionCard = ({ data }) => {
  const navigate = useNavigate();
  
  if (!data) {
    return (
      <Card>
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader 
        title="Student Distribution" 
        subheader="By Grade Level"
      />
      <CardContent>
        <Box sx={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip formatter={(value, name, props) => [`${value} students`, `Grade ${props.payload.name}`]} />
              <Bar dataKey="value" fill="#8884d8">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={() => navigate('/admin/students')}
          startIcon={<ArrowForwardIcon />}
        >
          View All Students
        </Button>
      </CardActions>
    </Card>
  );
};

/**
 * Component to display recent system activity
 */
const RecentActivityCard = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            No recent activities
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'optimization':
        return <BarChartIcon />;
      case 'parent_preference':
        return <PersonIcon />;
      case 'teacher_preference':
        return <SchoolIcon />;
      case 'user':
        return <GroupIcon />;
      default:
        return <InfoIcon />;
    }
  };
  
  return (
    <Card>
      <CardHeader title="Recent Activity" />
      <List>
        {activities.map((activity) => (
          <ListItem key={activity.id} divider>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: `${activity.color || 'primary'}.light` }}>
                {getActivityIcon(activity.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={activity.description}
              secondary={activity.time}
            />
          </ListItem>
        ))}
      </List>
      <CardActions>
        <Button 
          size="small" 
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
      </CardActions>
    </Card>
  );
};

/**
 * Main Admin Dashboard component
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [parentRequestStats, setParentRequestStats] = useState(null);
  const [teacherPreferenceStats, setTeacherPreferenceStats] = useState(null);
  const [optimizationStatus, setOptimizationStatus] = useState('not_started');
  const [studentDistribution, setStudentDistribution] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState('');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real app, these would be actual API calls
        // For this example, we'll use mock data
        
        // Mock data for development
        setMetrics({
          totalStudents: 524,
          totalTeachers: 32,
          totalParents: 412,
          pendingRequests: 45,
          completionRate: 78
        });
        
        setParentRequestStats({
          total: 412,
          submitted: 320,
          pending: 45,
          approved: 260,
          rejected: 15
        });
        
        setTeacherPreferenceStats({
          total: 32,
          submitted: 29,
          pending: 3,
          approved: 26,
          rejected: 0,
          teachingStyles: {
            collaborative: 12,
            traditional: 8,
            projectBased: 7,
            mixed: 5
          }
        });
        
        setOptimizationStatus('in_progress');
        setCurrentAcademicYear('2023-2024');
        
        setStudentDistribution([
          { name: '1', value: 65 },
          { name: '2', value: 72 },
          { name: '3', value: 68 },
          { name: '4', value: 75 },
          { name: '5', value: 82 },
          { name: '6', value: 78 },
          { name: '7', value: 84 }
        ]);
        
        setRecentActivities([
          {
            id: '1',
            type: 'optimization',
            description: 'Optimization run completed for Grade 3',
            time: '2 hours ago',
            color: 'success'
          },
          {
            id: '2',
            type: 'parent_preference',
            description: '15 new parent preferences submitted',
            time: '5 hours ago',
            color: 'info'
          },
          {
            id: '3',
            type: 'teacher_preference',
            description: 'Teacher preferences approved for Grade 4',
            time: '1 day ago',
            color: 'primary'
          },
          {
            id: '4',
            type: 'user',
            description: '5 new parent accounts created',
            time: '2 days ago',
            color: 'secondary'
          }
        ]);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Admin Dashboard
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<SettingsIcon />}
              onClick={() => navigate('/admin/settings')}
              sx={{ mr: 1 }}
            >
              Settings
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<BarChartIcon />}
              onClick={() => navigate('/admin/optimize')}
            >
              Optimize Classes
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Total Students" 
              value={metrics?.totalStudents}
              icon={<PeopleAltIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Total Teachers" 
              value={metrics?.totalTeachers}
              icon={<SchoolIcon />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Total Parents" 
              value={metrics?.totalParents}
              icon={<PersonIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Pending Requests" 
              value={metrics?.pendingRequests}
              icon={<AssignmentIcon />}
              color="warning"
            />
          </Grid>
        </Grid>
        
        {/* Main Dashboard Content */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Optimization Status */}
              <Grid item xs={12}>
                <OptimizationStatusCard 
                  status={optimizationStatus}
                  lastRun="March 15, 2023, 2:30 PM"
                  academicYear={currentAcademicYear}
                  grade="All Grades"
                />
              </Grid>
              
              {/* Parent Requests Stats */}
              <Grid item xs={12} md={6}>
                <ParentRequestsCard stats={parentRequestStats} />
              </Grid>
              
              {/* Teacher Preferences Stats */}
              <Grid item xs={12} md={6}>
                <TeacherPreferencesCard stats={teacherPreferenceStats} />
              </Grid>
              
              {/* Student Distribution */}
              <Grid item xs={12}>
                <StudentDistributionCard data={studentDistribution} />
              </Grid>
            </Grid>
          </Grid>
          
          {/* Right Column */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={3}>
              {/* Academic Year Info */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="Current Academic Year" 
                    subheader={currentAcademicYear}
                    avatar={
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <CalendarTodayIcon />
                      </Avatar>
                    }
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        Optimization Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {metrics?.completionRate}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics?.completionRate} 
                      sx={{ height: 8, borderRadius: 5, my: 1 }} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      {metrics?.completionRate >= 100 
                        ? 'All placements completed!' 
                        : `${100 - metrics?.completionRate}% remaining to complete`}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => navigate('/admin/academic-years')}
                      startIcon={<ArrowForwardIcon />}
                    >
                      Manage Academic Years
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              {/* Recent Activity */}
              <Grid item xs={12}>
                <RecentActivityCard activities={recentActivities} />
              </Grid>
              
              {/* Quick Actions */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Quick Actions" />
                  <CardContent>
                    <List disablePadding>
                      <ListItem component={Button} onClick={() => navigate('/admin/students')}>
                        <ListItemIcon>
                          <PeopleAltIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Manage Students" sx={{ textAlign: 'left' }} />
                      </ListItem>
                      <ListItem component={Button} onClick={() => navigate('/admin/teachers')}>
                        <ListItemIcon>
                          <SchoolIcon color="secondary" />
                        </ListItemIcon>
                        <ListItemText primary="Manage Teachers" sx={{ textAlign: 'left' }} />
                      </ListItem>
                      <ListItem component={Button} onClick={() => navigate('/admin/classes')}>
                        <ListItemIcon>
                          <GroupIcon color="info" />
                        </ListItemIcon>
                        <ListItemText primary="Manage Classes" sx={{ textAlign: 'left' }} />
                      </ListItem>
                      <ListItem component={Button} onClick={() => navigate('/admin/reports')}>
                        <ListItemIcon>
                          <AssessmentIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Generate Reports" sx={{ textAlign: 'left' }} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 