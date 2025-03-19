import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Tabs,
  Tab,
  Badge,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Create as CreateIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  OpenInNew as OpenInNewIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  HourglassEmpty as HourglassEmptyIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// TabPanel component for tab contents
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`surveys-tabpanel-${index}`}
      aria-labelledby={`surveys-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Get status icon based on status
const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon />;
    case 'in_progress':
      return <HourglassEmptyIcon />;
    case 'not_started':
      return <AccessTimeIcon />;
    default:
      return <AssignmentIcon />;
  }
};

const StudentSurveys = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State for surveys data
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  
  // State for teacher classes
  const [classes, setClasses] = useState([]);
  
  // Fetch surveys data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In production, these would be real API calls
        // const surveysResponse = await api.get('/teacher/surveys');
        // const classesResponse = await api.get('/teacher/classes');
        // setSurveys(surveysResponse.data.data || []);
        // setClasses(classesResponse.data.data || []);
        
        // For development purposes, we'll use mock data
        setTimeout(() => {
          provideMockData();
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching surveys data:', err);
        setError('Failed to load surveys data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Provide mock data for development
  const provideMockData = () => {
    // Mock classes
    const mockClasses = [
      { id: 1, name: 'Grade 3 - Room 102', grade: '3', students: 24 },
      { id: 2, name: 'Grade 3 - Room 105', grade: '3', students: 22 }
    ];
    
    // Mock surveys
    const mockSurveys = [];
    const statuses = ['completed', 'in_progress', 'not_started'];
    const names = [
      'Emma Johnson', 'Noah Smith', 'Olivia Davis', 'Liam Wilson', 'Ava Brown',
      'William Miller', 'Sophia Martinez', 'James Anderson', 'Isabella Thomas', 'Benjamin Jackson',
      'Mia White', 'Mason Harris', 'Charlotte Martin', 'Elijah Thompson', 'Amelia Garcia',
      'Alexander Robinson', 'Harper Lewis', 'Daniel Lee', 'Evelyn Walker', 'Matthew Hall',
      'Abigail Allen', 'Aiden Young', 'Emily Hernandez', 'Henry King', 'Elizabeth Wright'
    ];
    
    // Generate mock surveys
    for (let i = 1; i <= 50; i++) {
      const classId = i % 2 === 0 ? 1 : 2;
      const className = mockClasses.find(c => c.id === classId).name;
      const statusIndex = i % 5 === 0 ? 0 : (i % 3 === 0 ? 1 : 2);
      const status = statuses[statusIndex];
      const nameIndex = i % names.length;
      
      // Calculate completion percentage
      let completionPercentage = 0;
      if (status === 'completed') {
        completionPercentage = 100;
      } else if (status === 'in_progress') {
        completionPercentage = Math.floor(Math.random() * 75) + 15; // 15-90%
      }
      
      // Generate last updated date
      const now = new Date();
      let lastUpdated;
      if (status === 'completed') {
        lastUpdated = new Date(now.getTime() - (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000);
      } else if (status === 'in_progress') {
        lastUpdated = new Date(now.getTime() - (Math.floor(Math.random() * 3) + 1) * 24 * 60 * 60 * 1000);
      } else {
        lastUpdated = null;
      }
      
      mockSurveys.push({
        id: i,
        studentName: names[nameIndex],
        studentId: 1000 + i,
        studentPhoto: `https://placehold.co/100/${i % 2 === 0 ? '4caf50' : '2196f3'}/white?text=${names[nameIndex].charAt(0)}${names[nameIndex].split(' ')[1].charAt(0)}`,
        grade: '3',
        nextGrade: '4',
        classId: classId,
        className: className,
        status: status,
        completionPercentage: completionPercentage,
        lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
        academicStrengths: status === 'not_started' ? '' : 'Student shows strength in mathematics and critical thinking.',
        academicAreas: status === 'not_started' ? '' : 'Reading comprehension and written expression need further development.',
        learningStyle: status === 'not_started' ? '' : 'Visual learner who benefits from graphic organizers and charts.',
        placementRecommendations: status === 'not_started' ? '' : 'Would benefit from a structured environment with clear expectations.',
        iep: i % 10 === 0, // 10% of students have IEPs
        ell: i % 8 === 0  // 12.5% of students are English Language Learners
      });
    }
    
    setClasses(mockClasses);
    setSurveys(mockSurveys);
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when search changes
  };
  
  // Handle class filter change
  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setPage(0); // Reset to first page when filter changes
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Open dialog to view/edit survey
  const handleOpenSurvey = (survey) => {
    setSelectedSurvey(survey);
    setOpenDialog(true);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Navigate to survey form
  const handleEditSurvey = (surveyId) => {
    handleCloseDialog();
    navigate(`/teacher/surveys/${surveyId}`);
  };
  
  // Filter surveys based on search, class, and tab
  const getFilteredSurveys = () => {
    return surveys.filter(survey => {
      // Filter by search query
      const searchMatch = searchQuery === '' || 
        survey.studentName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by class
      const classMatch = selectedClass === 'all' || 
        survey.classId.toString() === selectedClass.toString();
      
      // Filter by tab
      let tabMatch = true;
      if (tabValue === 1) { // Completed surveys
        tabMatch = survey.status === 'completed';
      } else if (tabValue === 2) { // In-progress surveys
        tabMatch = survey.status === 'in_progress';
      } else if (tabValue === 3) { // Not started surveys
        tabMatch = survey.status === 'not_started';
      }
      
      return searchMatch && classMatch && tabMatch;
    });
  };
  
  // Get paginated surveys
  const getPaginatedSurveys = () => {
    const filteredSurveys = getFilteredSurveys();
    return filteredSurveys.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not started';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'not_started': return 'default';
      default: return 'default';
    }
  };
  
  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'not_started': return 'Not Started';
      default: return status;
    }
  };
  
  // Get survey completion stats
  const getCompletionStats = () => {
    const total = surveys.length;
    const completed = surveys.filter(s => s.status === 'completed').length;
    const inProgress = surveys.filter(s => s.status === 'in_progress').length;
    const notStarted = surveys.filter(s => s.status === 'not_started').length;
    
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionPercentage
    };
  };
  
  const stats = getCompletionStats();
  
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
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AssessmentIcon fontSize="large" sx={{ mr: 1 }} />
        Student Placement Surveys
      </Typography>
      
      {/* Progress overview card */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Survey Completion Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.completionPercentage} 
                  color="primary" 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {stats.completionPercentage}%
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="h6">
                      {stats.completed}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HourglassEmptyIcon color="warning" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      In Progress
                    </Typography>
                    <Typography variant="h6">
                      {stats.inProgress}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon color="disabled" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Not Started
                    </Typography>
                    <Typography variant="h6">
                      {stats.notStarted}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
              <Typography variant="body1" paragraph>
                Complete placement surveys for your students to provide input on their learning styles, academic needs, and social-emotional development.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<PersonIcon />}
                  onClick={() => navigate('/teacher/students')}
                  sx={{ mr: 2 }}
                >
                  View Students
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<FilterListIcon />}
                  onClick={() => setTabValue(3)}
                >
                  Show Not Started
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Class filter cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {classes.map((classItem) => (
          <Grid item xs={12} sm={6} md={3} key={classItem.id}>
            <Card 
              variant="outlined" 
              sx={{ 
                cursor: 'pointer',
                border: selectedClass === classItem.id.toString() ? '2px solid' : '1px solid',
                borderColor: selectedClass === classItem.id.toString() ? 'primary.main' : 'divider'
              }}
              onClick={() => handleClassChange(classItem.id.toString())}
            >
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ClassIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">
                    {classItem.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {classItem.students} Students
                </Typography>
              </CardContent>
              <CardActions>
                <Box sx={{ width: '100%' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={
                      Math.round(
                        (surveys.filter(s => s.classId === classItem.id && s.status === 'completed').length / 
                        surveys.filter(s => s.classId === classItem.id).length) * 100
                      )
                    } 
                    sx={{ height: 5, borderRadius: 5 }}
                  />
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            variant="outlined" 
            sx={{ 
              cursor: 'pointer',
              border: selectedClass === 'all' ? '2px solid' : '1px solid',
              borderColor: selectedClass === 'all' ? 'primary.main' : 'divider'
            }}
            onClick={() => handleClassChange('all')}
          >
            <CardContent sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  All Classes
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {surveys.length} Total Students
              </Typography>
            </CardContent>
            <CardActions>
              <Box sx={{ width: '100%' }}>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.completionPercentage} 
                  sx={{ height: 5, borderRadius: 5 }}
                />
              </Box>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Search bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by student name"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Paper>
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="survey tabs"
        >
          <Tab 
            label={`All Surveys (${getFilteredSurveys().length})`} 
            id="surveys-tab-0" 
            aria-controls="surveys-tabpanel-0" 
          />
          <Tab 
            label={`Completed (${surveys.filter(s => s.status === 'completed').length})`} 
            id="surveys-tab-1" 
            aria-controls="surveys-tabpanel-1" 
          />
          <Tab 
            label={`In Progress (${surveys.filter(s => s.status === 'in_progress').length})`} 
            id="surveys-tab-2" 
            aria-controls="surveys-tabpanel-2" 
          />
          <Tab 
            label={`Not Started (${surveys.filter(s => s.status === 'not_started').length})`} 
            id="surveys-tab-3" 
            aria-controls="surveys-tabpanel-3" 
          />
        </Tabs>
      </Paper>
      
      {/* Survey list */}
      <TabPanel value={tabValue} index={0}>
        <SurveyTable 
          surveys={getPaginatedSurveys()}
          totalSurveys={getFilteredSurveys().length}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          navigateToSurvey={handleEditSurvey}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          formatDate={formatDate}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <SurveyTable 
          surveys={getPaginatedSurveys()}
          totalSurveys={getFilteredSurveys().length}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          navigateToSurvey={handleEditSurvey}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          formatDate={formatDate}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <SurveyTable 
          surveys={getPaginatedSurveys()}
          totalSurveys={getFilteredSurveys().length}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          navigateToSurvey={handleEditSurvey}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          formatDate={formatDate}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <SurveyTable 
          surveys={getPaginatedSurveys()}
          totalSurveys={getFilteredSurveys().length}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          navigateToSurvey={handleEditSurvey}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          formatDate={formatDate}
        />
      </TabPanel>
      
      {/* Survey Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedSurvey && (
          <>
            <DialogTitle>
              <Typography variant="h6">
                Survey for {selectedSurvey.studentName}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {selectedSurvey.className} • Grade {selectedSurvey.grade}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              {/* Status and Completion */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip 
                  icon={getStatusIcon(selectedSurvey.status)}
                  label={getStatusLabel(selectedSurvey.status)} 
                  color={getStatusColor(selectedSurvey.status)}
                />
                <Typography variant="body2" color="text.secondary">
                  Last updated: {formatDate(selectedSurvey.lastUpdated)}
                </Typography>
              </Box>
              
              {selectedSurvey.status === 'in_progress' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Completion: {selectedSurvey.completionPercentage}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={selectedSurvey.completionPercentage} 
                    sx={{ height: 8, borderRadius: 2 }}
                  />
                </Box>
              )}
              
              {/* Survey Content if started or completed */}
              {selectedSurvey.status !== 'not_started' && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Academic Strengths</Typography>
                    <Typography variant="body2">{selectedSurvey.academicStrengths || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Academic Areas for Growth</Typography>
                    <Typography variant="body2">{selectedSurvey.academicAreas || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Social-Emotional Observations</Typography>
                    <Typography variant="body2">{selectedSurvey.socialEmotional || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Learning Style</Typography>
                    <Typography variant="body2">{selectedSurvey.learningStyle || 'Not provided'}</Typography>
                  </Grid>
                  
                  {selectedSurvey.status === 'completed' && (
                    <>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Placement Recommendations</Typography>
                        <Typography variant="body2">{selectedSurvey.placementRecommendations || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Additional Notes</Typography>
                        <Typography variant="body2">{selectedSurvey.additionalNotes || 'Not provided'}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              )}
              
              {/* Message if not started */}
              {selectedSurvey.status === 'not_started' && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    No survey data available yet.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Click 'Start Survey' to begin providing input for this student's placement.
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<CreateIcon />}
                onClick={() => handleEditSurvey(selectedSurvey.id)}
              >
                {selectedSurvey.status === 'not_started' ? 'Start Survey' : 'Edit Survey'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

// Surveys table component
const SurveyTable = ({ 
  surveys, 
  totalSurveys,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  navigateToSurvey,
  getStatusColor,
  getStatusLabel,
  formatDate
}) => {
  if (surveys.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No surveys found matching your criteria.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Completion</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {surveys.map((survey) => (
              <TableRow 
                key={survey.id} 
                hover 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => navigateToSurvey(survey.id)}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src={survey.studentPhoto} 
                      alt={survey.studentName}
                      sx={{ width: 36, height: 36, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle2">
                        {survey.studentName}
                      </Typography>
                      <Box sx={{ display: 'flex', mt: 0.5 }}>
                        {survey.iep && <Chip label="IEP" size="small" color="secondary" sx={{ mr: 0.5, height: 20 }} />}
                        {survey.ell && <Chip label="ELL" size="small" color="info" sx={{ height: 20 }} />}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{survey.className}</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(survey.status)} 
                    color={getStatusColor(survey.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1, maxWidth: 100 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={survey.completionPercentage} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {survey.completionPercentage}%
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{formatDate(survey.lastUpdated)}</TableCell>
                <TableCell align="center">
                  <Tooltip title={survey.status === 'not_started' ? 'Start Survey' : 'View/Edit Survey'}>
                    <IconButton 
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToSurvey(survey.id);
                      }}
                    >
                      {survey.status === 'not_started' ? <EditIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={totalSurveys}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </>
  );
};

export default StudentSurveys; 