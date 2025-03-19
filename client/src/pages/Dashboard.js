import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Button,
  LinearProgress,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert,
  Tab,
  Tabs
} from '@mui/material';
import { 
  School as SchoolIcon,
  Group as GroupIcon, 
  AssignmentTurnedIn as SurveyIcon, 
  Assignment as RequestsIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  ViewList as ListIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { useData } from '../contexts/DataContext';

// Import our new components
import OptimizationMetrics from '../components/OptimizationMetrics';
import ClassBalanceChart from '../components/ClassBalanceChart';
import ParentRequestsWidget from '../components/ParentRequestsWidget';

// Import dashboard service
import dashboardService from '../services/dashboardService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    schools, 
    selectedSchool,
    gradeLevels, 
    students, 
    teachers, 
    classLists,
    isLoading, 
    error,
    fetchSchools,
    fetchGradeLevels,
    fetchTeachers,
    fetchStudents,
    fetchClassLists
  } = useData();

  // Local state for dashboard stats and view
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    completedSurveys: 0,
    pendingSurveys: 0,
    parentRequests: 0,
    percentComplete: 0,
  });
  const [dashboardView, setDashboardView] = useState(0);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [optimizationMetrics, setOptimizationMetrics] = useState(null);
  const [classBalanceData, setClassBalanceData] = useState(null);
  const [parentRequests, setParentRequests] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  // Calculate stats when data changes
  useEffect(() => {
    if (students.length && teachers.length && classLists.length) {
      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        completedSurveys: 26, // Placeholder - would come from API
        pendingSurveys: 6, // Placeholder - would come from API
        parentRequests: 42, // Placeholder - would come from API
        percentComplete: calculateCompletion(classLists),
      });
    }
  }, [students, teachers, classLists]);

  // Fetch dashboard data when selected school changes
  useEffect(() => {
    if (selectedSchool?.id) {
      fetchDashboardData(selectedSchool.id);
    }
  }, [selectedSchool]);

  // Fetch dashboard data based on the active view
  useEffect(() => {
    if (selectedSchool?.id) {
      if (dashboardView === 1) {
        fetchDetailedMetrics(selectedSchool.id);
      }
    }
  }, [dashboardView, selectedSchool]);

  // Fetch basic dashboard data
  const fetchDashboardData = async (schoolId) => {
    try {
      setDashboardLoading(true);
      
      // Fetch recent activity
      const activityData = await dashboardService.getRecentActivity(schoolId);
      setRecentActivity(activityData);
      
      // Fetch upcoming tasks
      const tasksData = await dashboardService.getUpcomingTasks(schoolId);
      setUpcomingTasks(tasksData);
      
      setDashboardLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardLoading(false);
    }
  };

  // Fetch detailed metrics for the second tab
  const fetchDetailedMetrics = async (schoolId) => {
    try {
      setDashboardLoading(true);
      
      // Fetch optimization metrics
      const metricsData = await dashboardService.getOptimizationMetrics(schoolId);
      setOptimizationMetrics(metricsData);
      
      // Fetch class balance data for the most recent active class list
      if (classLists.length > 0) {
        const activeList = classLists.find(list => list.status === 'active');
        if (activeList) {
          const balanceData = await dashboardService.getClassBalanceData(activeList.id);
          setClassBalanceData(balanceData);
        }
      }
      
      // Fetch parent requests
      const requestsData = await dashboardService.getParentRequests(schoolId);
      setParentRequests(requestsData);
      
      setDashboardLoading(false);
    } catch (error) {
      console.error('Error fetching detailed metrics:', error);
      setDashboardLoading(false);
    }
  };

  // Helper to calculate completion percentage
  const calculateCompletion = (lists) => {
    if (!lists || lists.length === 0) return 0;
    const completed = lists.filter(list => list.status === 'active').length;
    return Math.round((completed / lists.length) * 100);
  };

  // Chart data based on real data
  const getChartData = () => {
    // Group students by grade level
    const studentsByGrade = {};
    students.forEach(student => {
      if (!studentsByGrade[student.grade]) {
        studentsByGrade[student.grade] = 0;
      }
      studentsByGrade[student.grade]++;
    });

    // Get grade level names
    const labels = gradeLevels.map(grade => grade.name || `Grade ${grade.code}`);
    const studentCounts = gradeLevels.map(grade => studentsByGrade[grade.code] || 0);

    // Mock survey completion for now
    const surveyCompletions = gradeLevels.map(() => Math.floor(Math.random() * 8) + 1);

    return {
      labels,
      datasets: [
        {
          label: 'Students',
          data: studentCounts,
          backgroundColor: 'rgba(63, 81, 181, 0.6)',
        },
        {
          label: 'Teacher Surveys Completed',
          data: surveyCompletions,
          backgroundColor: 'rgba(0, 150, 136, 0.6)',
        },
      ],
    };
  };

  // Get grade level progress
  const getGradeLevelProgress = () => {
    return gradeLevels.map(grade => {
      // Find class lists for this grade
      const relatedLists = classLists.filter(list => list.gradeLevel === grade.code);
      
      // Calculate progress
      let progress = 0;
      let status = 'planning';
      
      if (relatedLists.length > 0) {
        const activeList = relatedLists.find(list => list.status === 'active');
        const draftList = relatedLists.find(list => list.status === 'draft');
        
        if (activeList) {
          progress = 100;
          status = 'complete';
        } else if (draftList) {
          progress = 60;
          status = 'in-progress';
        } else {
          progress = 30;
          status = 'planning';
        }
      }
      
      // Get student count
      const studentCount = students.filter(s => s.grade === grade.code).length;
      
      return {
        id: grade.id,
        name: grade.name || `Grade ${grade.code}`,
        students: studentCount,
        progress,
        status
      };
    });
  };

  // Use the fetched data if available, otherwise use the mock data
  const notifications = recentActivity.length > 0 ? recentActivity : [
    { id: 1, message: 'Teacher Sarah Johnson completed her survey', date: '2 hours ago', type: 'survey' },
    { id: 2, message: 'New parent request received for student Alex Chen', date: '4 hours ago', type: 'request' },
    { id: 3, message: '12 new students imported from PowerSchool', date: 'Yesterday', type: 'import' },
    { id: 4, message: 'Class list optimization complete for Grade 3', date: 'Yesterday', type: 'optimization' },
  ];

  // Use the fetched data if available, otherwise use the mock data
  const tasks = upcomingTasks.length > 0 ? upcomingTasks : [
    { id: 1, task: 'Complete Grade 2 teacher surveys', due: '2 days', progress: 75 },
    { id: 2, task: 'Review parent requests for Grade 4', due: '3 days', progress: 30 },
    { id: 3, task: 'Finalize class lists for Grade 1', due: '1 week', progress: 50 },
  ];

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Class Placement Progress',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Handle dashboard view change
  const handleViewChange = (event, newValue) => {
    setDashboardView(newValue);
  };

  // Refresh all dashboard data
  const refreshData = () => {
    fetchSchools();
    if (selectedSchool) {
      fetchGradeLevels();
      fetchTeachers();
      fetchStudents();
      fetchClassLists();
      
      // Refresh dashboard-specific data
      fetchDashboardData(selectedSchool.id);
      if (dashboardView === 1) {
        fetchDetailedMetrics(selectedSchool.id);
      }
    }
  };

  // Calculate data to display
  const chartData = getChartData();
  const gradeLevelData = getGradeLevelProgress();

  // Check if the dashboard is loading
  const isDashboardLoading = isLoading || dashboardLoading;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Box>
          <IconButton 
            onClick={refreshData} 
            disabled={isLoading}
            sx={{ mr: 1 }}
            color="primary"
          >
            {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/class-lists/new')}
          >
            New Class List
          </Button>
        </Box>
      </Box>

      {/* Display error if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              bgcolor: 'rgba(63, 81, 181, 0.1)',
              borderRadius: 2,
              border: '1px solid rgba(63, 81, 181, 0.2)',
            }}
          >
            <GroupIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h3" component="div" fontWeight="bold">
              {isLoading ? <CircularProgress size={30} /> : stats.totalStudents}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Total Students
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              bgcolor: 'rgba(0, 150, 136, 0.1)',
              borderRadius: 2,
              border: '1px solid rgba(0, 150, 136, 0.2)',
            }}
          >
            <SchoolIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h3" component="div" fontWeight="bold">
              {isLoading ? <CircularProgress size={30} /> : stats.totalTeachers}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Total Teachers
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              bgcolor: 'rgba(76, 175, 80, 0.1)',
              borderRadius: 2,
              border: '1px solid rgba(76, 175, 80, 0.2)',
            }}
          >
            <SurveyIcon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
            <Typography variant="h3" component="div" fontWeight="bold">
              {isLoading ? <CircularProgress size={30} /> : `${stats.completedSurveys}/${stats.completedSurveys + stats.pendingSurveys}`}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Teacher Surveys Completed
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              bgcolor: 'rgba(255, 152, 0, 0.1)',
              borderRadius: 2,
              border: '1px solid rgba(255, 152, 0, 0.2)',
            }}
          >
            <RequestsIcon sx={{ fontSize: 48, color: '#ff9800', mb: 1 }} />
            <Typography variant="h3" component="div" fontWeight="bold">
              {isLoading ? <CircularProgress size={30} /> : stats.parentRequests}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Parent Requests
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Dashboard View Selector */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={dashboardView}
          onChange={handleViewChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<ListIcon />} label="Detailed Metrics" />
        </Tabs>
      </Box>

      {/* Main Dashboard Content - Overview */}
      {dashboardView === 0 && (
        <Grid container spacing={3}>
          {/* Left column */}
          <Grid item xs={12} md={8}>
            {/* Progress by Grade Level */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Grade Levels Progress" />
              <Divider />
              <CardContent>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List>
                    {gradeLevelData.map((grade) => (
                      <React.Fragment key={grade.id}>
                        <ListItem
                          secondaryAction={
                            <Button
                              size="small"
                              endIcon={<ArrowForwardIcon />}
                              onClick={() => navigate(`/class-lists?grade=${grade.id}`)}
                            >
                              View
                            </Button>
                          }
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {grade.name}
                                </Typography>
                                <Chip 
                                  size="small" 
                                  label={`${grade.students} students`}
                                  sx={{ ml: 1 }}
                                />
                                <Chip 
                                  size="small" 
                                  label={
                                    grade.status === 'complete' ? 'Complete' : 
                                    grade.status === 'in-progress' ? 'In Progress' : 
                                    'Planning'
                                  }
                                  color={
                                    grade.status === 'complete' ? 'success' : 
                                    grade.status === 'in-progress' ? 'primary' : 
                                    'default'
                                  }
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={grade.progress} 
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                  {grade.progress}% Complete
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {grade.id < gradeLevelData.length && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            {/* Chart */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Class Placement Overview" />
              <Divider />
              <CardContent>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ height: 300 }}>
                    <Bar data={chartData} options={chartOptions} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right column */}
          <Grid item xs={12} md={4}>
            {/* School Info */}
            {selectedSchool && (
              <Card sx={{ mb: 3 }}>
                <CardHeader 
                  title="Current School" 
                  subheader={selectedSchool.name}
                />
                <Divider />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSchool.address}, {selectedSchool.city}, {selectedSchool.state} {selectedSchool.zipCode}
                  </Typography>
                  {selectedSchool.subscription && (
                    <Chip 
                      label={`${selectedSchool.subscription.charAt(0).toUpperCase()}${selectedSchool.subscription.slice(1)} Subscription`}
                      color="primary"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notifications */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Recent Activity" />
              <Divider />
              <CardContent>
                <List sx={{ p: 0 }}>
                  {notifications.map((notification) => (
                    <React.Fragment key={notification.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={notification.message}
                          secondary={notification.date}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardHeader title="Upcoming Tasks" />
              <Divider />
              <CardContent>
                <List sx={{ p: 0 }}>
                  {tasks.map((task) => (
                    <React.Fragment key={task.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={task.task}
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                Due in {task.due}
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={task.progress} 
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Dashboard Content - Detailed Metrics */}
      {dashboardView === 1 && (
        <Grid container spacing={3}>
          {/* Optimization Metrics */}
          <Grid item xs={12}>
            <OptimizationMetrics 
              isLoading={isDashboardLoading}
              data={optimizationMetrics}
              title="Class Optimization Metrics"
            />
          </Grid>

          {/* Class Balance Chart */}
          <Grid item xs={12} md={8}>
            <ClassBalanceChart 
              isLoading={isDashboardLoading}
              data={classBalanceData}
              title="Class Balance Analysis"
            />
          </Grid>

          {/* Parent Requests */}
          <Grid item xs={12} md={4}>
            <ParentRequestsWidget 
              isLoading={isDashboardLoading}
              data={parentRequests}
              title="Parent Requests"
              onViewAll={() => navigate('/parent-requests')}
              onRefresh={() => fetchDetailedMetrics(selectedSchool.id)}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard; 