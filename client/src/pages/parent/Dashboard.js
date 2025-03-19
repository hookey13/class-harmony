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
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  History as HistoryIcon,
  Group as GroupIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component to display a student card with their info and progress
 */
const StudentCard = ({ student }) => {
  const navigate = useNavigate();
  
  if (!student) return null;
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'needs improvement':
        return 'warning';
      case 'concerning':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getProgressColor = (progress) => {
    if (progress >= 90) return 'success.main';
    if (progress >= 70) return 'info.main';
    if (progress >= 50) return 'warning.main';
    return 'error.main';
  };
  
  return (
    <Card variant="outlined">
      <CardHeader
        avatar={
          <Avatar 
            src={student.profileImage} 
            sx={{ width: 60, height: 60 }}
          >
            {student.firstName.charAt(0)}
          </Avatar>
        }
        title={
          <Typography variant="h6">
            {student.firstName} {student.lastName}
          </Typography>
        }
        subheader={`Grade ${student.grade} • Class ${student.className}`}
        action={
          <IconButton 
            aria-label="edit" 
            onClick={() => navigate(`/parent/student/${student.id}`)}
          >
            <EditIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Academic Progress</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={student.academicProgress} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getProgressColor(student.academicProgress)
                      }
                    }} 
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${student.academicProgress}%`}</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Attendance</Typography>
            <Typography variant="body1">
              {`${student.attendance.rate}%`}
              <Chip 
                size="small" 
                label={`${student.attendance.absences} absences`}
                sx={{ ml: 1 }}
                color={student.attendance.absences > 5 ? "warning" : "default"}
                variant="outlined"
              />
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Behavior</Typography>
            <Chip 
              label={student.behaviorStatus} 
              color={getStatusColor(student.behaviorStatus)}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom>Recent Achievements</Typography>
            {student.recentAchievements && student.recentAchievements.length > 0 ? (
              <List dense disablePadding>
                {student.recentAchievements.slice(0, 2).map((achievement, index) => (
                  <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light' }}>
                        <StarIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={achievement.title}
                      secondary={achievement.date}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent achievements to display
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 1 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(`/parent/student/${student.id}`)}
            >
              View Details
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

/**
 * Component to display the preference submission status
 */
const PreferenceStatus = ({ status, academicYear, deadline, onSubmit }) => {
  const navigate = useNavigate();
  
  const getStatusStep = () => {
    switch (status) {
      case 'not_started':
        return 0;
      case 'in_progress':
        return 1;
      case 'submitted':
        return 2;
      case 'approved':
        return 3;
      default:
        return 0;
    }
  };
  
  return (
    <Card variant="outlined">
      <CardHeader
        title="Class Placement Preferences"
        subheader={`Academic Year ${academicYear}`}
      />
      <Divider />
      <CardContent>
        <Stepper activeStep={getStatusStep()} alternativeLabel sx={{ mb: 3 }}>
          <Step>
            <StepLabel>Not Started</StepLabel>
          </Step>
          <Step>
            <StepLabel>In Progress</StepLabel>
          </Step>
          <Step>
            <StepLabel>Submitted</StepLabel>
          </Step>
          <Step>
            <StepLabel>Approved</StepLabel>
          </Step>
        </Stepper>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ mr: 2 }}>
            {status === 'not_started' && <ScheduleIcon color="action" sx={{ fontSize: 40 }} />}
            {status === 'in_progress' && <WarningIcon color="warning" sx={{ fontSize: 40 }} />}
            {status === 'submitted' && <CheckCircleIcon color="info" sx={{ fontSize: 40 }} />}
            {status === 'approved' && <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />}
          </Box>
          <Box>
            <Typography variant="h6">
              {status === 'not_started' && "Not Started Yet"}
              {status === 'in_progress' && "In Progress"}
              {status === 'submitted' && "Preferences Submitted"}
              {status === 'approved' && "Preferences Approved"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {status === 'not_started' && `Deadline: ${deadline}`}
              {status === 'in_progress' && "Your preferences are saved but not submitted yet"}
              {status === 'submitted' && "Your preferences have been submitted successfully"}
              {status === 'approved' && "Your preferences have been approved by the administration"}
            </Typography>
          </Box>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth
          disabled={status === 'approved'}
          onClick={() => {
            if (status === 'not_started' || status === 'in_progress') {
              navigate('/parent/preferences/edit');
            } else {
              navigate('/parent/preferences/view');
            }
          }}
          sx={{ mt: 2 }}
        >
          {status === 'not_started' && "Start Now"}
          {status === 'in_progress' && "Continue Editing"}
          {status === 'submitted' && "View Submission"}
          {status === 'approved' && "View Approved Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
};

/**
 * Component to display upcoming events
 */
const UpcomingEvents = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No upcoming events
        </Typography>
      </Box>
    );
  }
  
  return (
    <List>
      {events.map((event, index) => (
        <ListItem 
          key={event.id} 
          divider={index < events.length - 1}
          secondaryAction={
            <Chip 
              label={event.date} 
              size="small" 
              variant="outlined"
            />
          }
        >
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: event.color || 'primary.light' }}>
              {event.type === 'meeting' && <GroupIcon />}
              {event.type === 'deadline' && <ScheduleIcon />}
              {event.type === 'announcement' && <NotificationsIcon />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={event.title}
            secondary={event.description}
          />
        </ListItem>
      ))}
    </List>
  );
};

/**
 * Main Parent Dashboard component
 */
const ParentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [preferenceStatus, setPreferenceStatus] = useState('not_started');
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [academicYear, setAcademicYear] = useState('');
  const [preferenceDeadline, setPreferenceDeadline] = useState('');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In production, these would be actual API calls
        // For this example, we'll use mock data
        
        // Fetch parent's students
        // const studentsResponse = await axios.get('/api/parent/students');
        // setStudents(studentsResponse.data);
        
        // Fetch preference status
        // const preferencesResponse = await axios.get('/api/parent/preferences/status');
        // setPreferenceStatus(preferencesResponse.data.status);
        // setAcademicYear(preferencesResponse.data.academicYear);
        // setPreferenceDeadline(preferencesResponse.data.deadline);
        
        // Fetch upcoming events
        // const eventsResponse = await axios.get('/api/parent/events');
        // setUpcomingEvents(eventsResponse.data);
        
        // Fetch notifications
        // const notificationsResponse = await axios.get('/api/parent/notifications');
        // setNotifications(notificationsResponse.data);
        
        // Mock data for development
        setStudents([
          {
            id: '1',
            firstName: 'Emily',
            lastName: 'Johnson',
            profileImage: '',
            grade: 3,
            className: '3A',
            academicProgress: 87,
            attendance: {
              rate: 96,
              absences: 3
            },
            behaviorStatus: 'Excellent',
            recentAchievements: [
              { 
                title: 'Math Quiz Excellence Award', 
                date: '2 weeks ago' 
              },
              { 
                title: 'Reading Challenge Completion', 
                date: '1 month ago' 
              }
            ]
          },
          {
            id: '2',
            firstName: 'David',
            lastName: 'Johnson',
            profileImage: '',
            grade: 5,
            className: '5B',
            academicProgress: 72,
            attendance: {
              rate: 88,
              absences: 6
            },
            behaviorStatus: 'Good',
            recentAchievements: [
              { 
                title: 'Science Fair Participation', 
                date: '3 weeks ago' 
              }
            ]
          }
        ]);
        
        setPreferenceStatus('in_progress');
        setAcademicYear('2023-2024');
        setPreferenceDeadline('April 15, 2023');
        
        setUpcomingEvents([
          {
            id: '1',
            title: 'Parent-Teacher Conference',
            description: 'Spring semester progress review',
            date: 'March 25, 2023',
            type: 'meeting',
            color: 'primary.main'
          },
          {
            id: '2',
            title: 'Preference Submission Deadline',
            description: 'Last day to submit class placement preferences',
            date: 'April 15, 2023',
            type: 'deadline',
            color: 'error.main'
          },
          {
            id: '3',
            title: 'Spring Break',
            description: 'No school for students',
            date: 'March 27-31, 2023',
            type: 'announcement',
            color: 'success.main'
          }
        ]);
        
        setNotifications([
          {
            id: '1',
            title: 'Preference Form Updated',
            message: 'Your preference form has been saved but not submitted.',
            timestamp: '2 days ago',
            read: false
          },
          {
            id: '2',
            title: 'New Announcement',
            message: 'Important information about end-of-year activities.',
            timestamp: '1 week ago',
            read: true
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
        <Typography variant="h4" gutterBottom>
          Parent Dashboard
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Welcome Card */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h5" gutterBottom>
                Welcome, {user?.firstName || 'Parent'}!
              </Typography>
              <Typography variant="body1">
                Track your children's progress and submit your class placement preferences for the upcoming school year.
              </Typography>
            </Paper>
          </Grid>
          
          {/* Student Cards */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ pl: 1 }}>
              Your Children
            </Typography>
          </Grid>
          
          {students.map(student => (
            <Grid item xs={12} md={6} key={student.id}>
              <StudentCard student={student} />
            </Grid>
          ))}
          
          {/* Preference Status */}
          <Grid item xs={12} md={6}>
            <PreferenceStatus 
              status={preferenceStatus}
              academicYear={academicYear}
              deadline={preferenceDeadline}
            />
          </Grid>
          
          {/* Upcoming Events */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader
                title="Upcoming Events"
                action={
                  <Button 
                    size="small" 
                    startIcon={<HistoryIcon />}
                    onClick={() => navigate('/parent/events')}
                  >
                    All Events
                  </Button>
                }
              />
              <Divider />
              <UpcomingEvents events={upcomingEvents} />
            </Card>
          </Grid>
          
          {/* Notifications */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader
                title="Notifications"
                subheader={`You have ${notifications.filter(n => !n.read).length} unread notifications`}
                action={
                  <IconButton aria-label="settings">
                    <NotificationsIcon />
                  </IconButton>
                }
              />
              <Divider />
              <List>
                {notifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    divider
                    sx={{ 
                      bgcolor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: notification.read ? 'grey.300' : 'primary.main' }}>
                        <NotificationsIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {notification.message}
                          </Typography>
                          {` — ${notification.timestamp}`}
                        </React.Fragment>
                      }
                    />
                    <Button size="small" variant="outlined">
                      {notification.read ? "Read" : "Mark as Read"}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>
          
          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper variant="outlined">
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Quick Actions</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PersonIcon />}
                      onClick={() => navigate('/parent/profile')}
                      sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    >
                      Family Profile
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AssignmentIcon />}
                      onClick={() => navigate('/parent/preferences')}
                      sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    >
                      Placement Preferences
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<SchoolIcon />}
                      onClick={() => navigate('/parent/school-info')}
                      sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    >
                      School Information
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<GroupIcon />}
                      onClick={() => navigate('/parent/teachers')}
                      sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    >
                      View Teachers
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ParentDashboard; 