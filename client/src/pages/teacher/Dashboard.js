import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  Divider,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CardHeader
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon,
  PersonAdd as PersonAddIcon,
  CalendarToday as CalendarIcon,
  BarChart as BarChartIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Email as EmailIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as RechartsTooltip, Legend } from 'recharts';

// Array of colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

/**
 * Component to display class summary metrics
 */
const ClassSummary = ({ classData }) => {
  const navigate = useNavigate();
  
  if (!classData) return <CircularProgress />;
  
  const genderDistribution = [
    { name: 'Male', value: classData.genderDistribution?.male || 0 },
    { name: 'Female', value: classData.genderDistribution?.female || 0 }
  ];
  
  const academicDistribution = [
    { name: 'Advanced', value: classData.academicDistribution?.advanced || 0 },
    { name: 'Proficient', value: classData.academicDistribution?.proficient || 0 },
    { name: 'Developing', value: classData.academicDistribution?.developing || 0 },
    { name: 'Needs Support', value: classData.academicDistribution?.needsSupport || 0 }
  ].filter(item => item.value > 0);
  
  return (
    <Card variant="outlined">
      <CardHeader
        title={classData.name}
        subheader={`${classData.students?.length || 0} students • Grade ${classData.grade}`}
        action={
          <Tooltip title="Download Class Roster">
            <IconButton aria-label="download">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Gender Distribution</Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Academic Levels</Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={academicDistribution}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {academicDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Chip
                icon={<InfoIcon />}
                label={`${classData.specialNeeds || 0} Special Needs`}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<AssessmentIcon />}
                label={`Avg. Academic: ${classData.averageAcademic?.toFixed(1) || 'N/A'}`}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<AssessmentIcon />}
                label={`Avg. Behavioral: ${classData.averageBehavioral?.toFixed(1) || 'N/A'}`}
                color="info"
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          color="primary" 
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate(`/teacher/classes/${classData.id || classData._id}`)}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

/**
 * Component to display recent student activity
 */
const RecentActivity = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          No recent activities
        </Typography>
      </Box>
    );
  }
  
  return (
    <List sx={{ width: '100%' }}>
      {activities.map((activity) => (
        <ListItem
          key={activity.id}
          divider
          secondaryAction={
            <Typography variant="caption" color="textSecondary">
              {activity.timeAgo}
            </Typography>
          }
        >
          <ListItemAvatar>
            <Avatar 
              alt={activity.student.name} 
              src={activity.student.profileImage}
              sx={{ 
                bgcolor: activity.type === 'improvement' ? 'success.main' : 
                activity.type === 'concern' ? 'error.main' : 'primary.main'
              }}
            >
              {activity.type === 'improvement' ? <ArrowUpwardIcon /> : 
               activity.type === 'concern' ? <ArrowDownwardIcon /> : <InfoIcon />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={activity.student.name}
            secondary={activity.description}
          />
        </ListItem>
      ))}
    </List>
  );
};

/**
 * Component to display student progress insights
 */
const StudentInsights = ({ students }) => {
  if (!students || students.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          No student data available
        </Typography>
      </Box>
    );
  }
  
  const needsAttention = students.filter(s => 
    s.academicTrend === 'declining' || 
    s.behavioralTrend === 'declining' || 
    s.attendanceRate < 0.85
  );
  
  const improvements = students.filter(s => 
    s.academicTrend === 'improving' || 
    s.behavioralTrend === 'improving'
  );
  
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Student</TableCell>
            <TableCell align="center">Academic</TableCell>
            <TableCell align="center">Behavioral</TableCell>
            <TableCell align="center">Attendance</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {needsAttention.map((student) => (
            <TableRow key={student.id} sx={{ bgcolor: 'rgba(244, 67, 54, 0.07)' }}>
              <TableCell component="th" scope="row">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={student.profileImage} 
                    sx={{ width: 24, height: 24, mr: 1 }}
                  >
                    {student.firstName.charAt(0)}
                  </Avatar>
                  <Typography variant="body2">
                    {student.firstName} {student.lastName}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center">
                {student.academicTrend === 'declining' ? (
                  <Chip 
                    icon={<ArrowDownwardIcon />} 
                    label="Declining" 
                    size="small" 
                    color="error" 
                    variant="outlined" 
                  />
                ) : (
                  student.academicLevel
                )}
              </TableCell>
              <TableCell align="center">
                {student.behavioralTrend === 'declining' ? (
                  <Chip 
                    icon={<ArrowDownwardIcon />} 
                    label="Declining" 
                    size="small" 
                    color="error" 
                    variant="outlined" 
                  />
                ) : (
                  student.behavioralLevel
                )}
              </TableCell>
              <TableCell align="center">
                {student.attendanceRate < 0.85 ? (
                  <Chip 
                    label={`${(student.attendanceRate * 100).toFixed(0)}%`} 
                    size="small" 
                    color="error" 
                    variant="outlined" 
                  />
                ) : (
                  `${(student.attendanceRate * 100).toFixed(0)}%`
                )}
              </TableCell>
              <TableCell align="right">
                <Button size="small" startIcon={<EmailIcon />} variant="outlined">
                  Contact
                </Button>
              </TableCell>
            </TableRow>
          ))}
          
          {improvements.filter(s => !needsAttention.includes(s)).map((student) => (
            <TableRow key={student.id} sx={{ bgcolor: 'rgba(76, 175, 80, 0.07)' }}>
              <TableCell component="th" scope="row">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={student.profileImage} 
                    sx={{ width: 24, height: 24, mr: 1 }}
                  >
                    {student.firstName.charAt(0)}
                  </Avatar>
                  <Typography variant="body2">
                    {student.firstName} {student.lastName}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center">
                {student.academicTrend === 'improving' ? (
                  <Chip 
                    icon={<ArrowUpwardIcon />} 
                    label="Improving" 
                    size="small" 
                    color="success" 
                    variant="outlined" 
                  />
                ) : (
                  student.academicLevel
                )}
              </TableCell>
              <TableCell align="center">
                {student.behavioralTrend === 'improving' ? (
                  <Chip 
                    icon={<ArrowUpwardIcon />} 
                    label="Improving" 
                    size="small" 
                    color="success" 
                    variant="outlined" 
                  />
                ) : (
                  student.behavioralLevel
                )}
              </TableCell>
              <TableCell align="center">
                {`${(student.attendanceRate * 100).toFixed(0)}%`}
              </TableCell>
              <TableCell align="right">
                <Button size="small" startIcon={<AssessmentIcon />} variant="outlined">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
          
          {students
            .filter(s => !needsAttention.includes(s) && !improvements.includes(s))
            .slice(0, 5)
            .map((student) => (
              <TableRow key={student.id}>
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src={student.profileImage} 
                      sx={{ width: 24, height: 24, mr: 1 }}
                    >
                      {student.firstName.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {student.firstName} {student.lastName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">{student.academicLevel}</TableCell>
                <TableCell align="center">{student.behavioralLevel}</TableCell>
                <TableCell align="center">{`${(student.attendanceRate * 100).toFixed(0)}%`}</TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<AssessmentIcon />} variant="outlined">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  
  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  const getRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString; // Return the timeAgo property directly
  };
  
  const getTaskIcon = (type) => {
    switch (type) {
      case 'survey':
        return <AssessmentIcon />;
      case 'collaboration':
        return <GroupIcon />;
      case 'admin':
        return <SchoolIcon />;
      default:
        return <AssignmentIcon />;
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real app, these would be actual API calls
        // For this example, we'll use fake data
        
        // Fetch class data
        const classResponse = await axios.get('/api/classes/current');
        setClassData(classResponse.data);
        
        // Fetch recent activities
        const activitiesResponse = await axios.get('/api/activities/recent');
        setRecentActivities(activitiesResponse.data);
        
        // Fetch students in class
        const studentsResponse = await axios.get('/api/students', {
          params: { classId: classResponse.data.id }
        });
        setStudents(studentsResponse.data);
        
        // Fetch upcoming tasks
        const tasksResponse = await axios.get('/api/tasks/upcoming');
        setUpcomingTasks(tasksResponse.data);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        
        // In case of API error, use mock data for demonstration
        setClassData({
          id: '1',
          name: 'Class 3A',
          grade: 3,
          students: Array(22).fill(null),
          genderDistribution: { male: 12, female: 10 },
          academicDistribution: {
            advanced: 5,
            proficient: 10,
            developing: 5,
            needsSupport: 2
          },
          specialNeeds: 3,
          averageAcademic: 3.2,
          averageBehavioral: 3.5
        });
        
        setRecentActivities([
          {
            id: '1',
            type: 'improvement',
            student: { name: 'Emma Johnson', profileImage: '' },
            description: 'Showed significant improvement in math quiz scores',
            timeAgo: '2 days ago'
          },
          {
            id: '2',
            type: 'concern',
            student: { name: 'Noah Smith', profileImage: '' },
            description: 'Has been late to class 3 times this week',
            timeAgo: '1 day ago'
          },
          {
            id: '3',
            type: 'general',
            student: { name: 'Olivia Brown', profileImage: '' },
            description: 'Parents requested conference about reading progress',
            timeAgo: '4 hours ago'
          }
        ]);
        
        setStudents([
          {
            id: '1',
            firstName: 'Emma',
            lastName: 'Johnson',
            profileImage: '',
            academicLevel: 4,
            academicTrend: 'improving',
            behavioralLevel: 3,
            behavioralTrend: 'stable',
            attendanceRate: 0.95
          },
          {
            id: '2',
            firstName: 'Noah',
            lastName: 'Smith',
            profileImage: '',
            academicLevel: 3,
            academicTrend: 'stable',
            behavioralLevel: 2,
            behavioralTrend: 'declining',
            attendanceRate: 0.82
          },
          {
            id: '3',
            firstName: 'Olivia',
            lastName: 'Brown',
            profileImage: '',
            academicLevel: 2,
            academicTrend: 'declining',
            behavioralLevel: 3,
            behavioralTrend: 'stable',
            attendanceRate: 0.90
          },
          {
            id: '4',
            firstName: 'Liam',
            lastName: 'Davis',
            profileImage: '',
            academicLevel: 4,
            academicTrend: 'stable',
            behavioralLevel: 4,
            behavioralTrend: 'stable',
            attendanceRate: 0.98
          },
          {
            id: '5',
            firstName: 'Ava',
            lastName: 'Miller',
            profileImage: '',
            academicLevel: 3,
            academicTrend: 'improving',
            behavioralLevel: 3,
            behavioralTrend: 'improving',
            attendanceRate: 0.93
          },
          {
            id: '6',
            firstName: 'Ethan',
            lastName: 'Wilson',
            profileImage: '',
            academicLevel: 2,
            academicTrend: 'stable',
            behavioralLevel: 3,
            behavioralTrend: 'stable',
            attendanceRate: 0.88
          },
          {
            id: '7',
            firstName: 'Isabella',
            lastName: 'Moore',
            profileImage: '',
            academicLevel: 3,
            academicTrend: 'stable',
            behavioralLevel: 4,
            behavioralTrend: 'stable',
            attendanceRate: 0.96
          }
        ]);
        
        setUpcomingTasks([
          {
            id: '1',
            title: 'Math quiz preparation',
            dueDate: '2023-09-15',
            priority: 'high'
          },
          {
            id: '2',
            title: 'Parent-teacher conference',
            dueDate: '2023-09-18',
            priority: 'medium'
          },
          {
            id: '3',
            title: 'Submit quarterly progress reports',
            dueDate: '2023-09-20',
            priority: 'high'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Welcome and header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          bgcolor: 'primary.main', 
          color: 'white',
          borderRadius: 2
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <DashboardIcon sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome, {dashboardData.teacher.name}
            </Typography>
            <Typography variant="subtitle1">
              {dashboardData.teacher.school} • Grade {dashboardData.teacher.grade} • {dashboardData.teacher.classroom}
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => navigate('/teacher/profile')}
            >
              My Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Students card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" component="div">
                  My Students
                </Typography>
              </Box>
              <Typography variant="h3" component="div" gutterBottom>
                {dashboardData.students.total}
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" display="inline">Students with IEP: </Typography>
                <Chip 
                  label={dashboardData.students.withIEP} 
                  size="small" 
                  color="secondary" 
                  sx={{ ml: 1 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" display="inline">English Language Learners: </Typography>
                <Chip 
                  label={dashboardData.students.withELL} 
                  size="small" 
                  color="info" 
                  sx={{ ml: 1 }}
                />
              </Box>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/teacher/students')}
              >
                View Students
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Surveys card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" component="div">
                  Student Surveys
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Box sx={{ flex: 1, mr: 1 }}>
                  <Typography variant="h3" component="div" gutterBottom>
                    {dashboardData.surveys.completionRate}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData.surveys.completionRate} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">Completed: {dashboardData.surveys.completed}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HourglassEmptyIcon color="warning" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">In Progress: {dashboardData.surveys.inProgress}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">Not Started: {dashboardData.surveys.notStarted}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/teacher/surveys')}
              >
                View Surveys
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Collaboration card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" component="div">
                  Placement Collaboration
                </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                Collaborate with other teachers and administrators on student placement decisions for the next year.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon color="info" fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  3 discussions need your input
                </Typography>
              </Box>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/teacher/collaboration')}
              >
                Join Discussion
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main content section */}
      <Grid container spacing={3}>
        {/* Left column */}
        <Grid item xs={12} md={7}>
          {/* Tasks section */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 1 }} />
                Upcoming Tasks
              </Typography>
            </Box>
            <List>
              {dashboardData.tasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem 
                    alignItems="flex-start"
                    secondaryAction={
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate(task.link)}
                      >
                        View
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getPriorityColor(task.priority) + '.light' }}>
                        {getTaskIcon(task.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" component="span">
                            {task.title}
                          </Typography>
                          <Chip 
                            label={task.priority.toUpperCase()} 
                            size="small" 
                            color={getPriorityColor(task.priority)} 
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span" color="text.primary">
                            {task.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <EventIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                            <Typography variant="caption">
                              Due in {formatDate(task.dueDate)}
                            </Typography>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
          
          {/* Recent activity section */}
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                Recent Activity
              </Typography>
            </Box>
            <List>
              {dashboardData.recentActivity.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        {activity.type === 'survey' ? <AssessmentIcon /> : <GroupIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.description}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {getRelativeTime(activity.timestamp)}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Right column */}
        <Grid item xs={12} md={5}>
          {/* Notifications section */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1 }} />
                Notifications
              </Typography>
              <Button size="small">Mark All Read</Button>
            </Box>
            <List>
              {dashboardData.notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItemButton>
                    <ListItemIcon>
                      <Badge
                        variant="dot"
                        color="error"
                        invisible={notification.read}
                      >
                        <NotificationsIcon color={notification.read ? "action" : "primary"} />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" component="div" color="text.secondary" sx={{ mt: 0.5 }}>
                            {getRelativeTime(notification.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                </React.Fragment>
              ))}
            </List>
          </Paper>
          
          {/* Quick actions section */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate('/teacher/surveys')}
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  Complete Surveys
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<GroupIcon />}
                  onClick={() => navigate('/teacher/collaboration')}
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  Placement Discussion
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<PersonIcon />}
                  onClick={() => navigate('/teacher/students')}
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  View Students
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<SchoolIcon />}
                  onClick={() => navigate('/teacher/school-info')}
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  School Info
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 2
                    }
                  }}
                  onClick={() => navigate('/teacher/learning-plans')}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ fontSize: 40, color: 'info.main' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom>Learning Plans</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Create and manage student learning plans
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Academic calendar section */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Academic Calendar
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <EventIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="End of Year Surveys Due" 
                  secondary="May 25, 2023" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EventIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Final Day of School" 
                  secondary="June 15, 2023" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EventIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Staff Development Day" 
                  secondary="June 16, 2023" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EventIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Summer Break Begins" 
                  secondary="June 17, 2023" 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherDashboard; 