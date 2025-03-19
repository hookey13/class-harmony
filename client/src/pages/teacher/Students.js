import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  CircularProgress,
  Alert,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
  School as SchoolIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`students-tabpanel-${index}`}
      aria-labelledby={`students-tab-${index}`}
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

const TeacherStudents = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentClass, setCurrentClass] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In production, this would be real API calls
        // const studentsResponse = await api.get('/teacher/students');
        // const classesResponse = await api.get('/teacher/classes');
        // setStudents(studentsResponse.data || []);
        // setClasses(classesResponse.data || []);
        
        // For development purposes, we'll use mock data
        setTimeout(() => {
          provideMockData();
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching students data:', err);
        setError('Failed to load students data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const provideMockData = () => {
    // Mock classes
    const mockClasses = [
      { id: 1, name: 'Grade 3 - Room 102', grade: '3', students: 24 },
      { id: 2, name: 'Grade 3 - Room 105', grade: '3', students: 22 }
    ];
    
    // Mock students
    const mockStudents = [];
    
    // Generate 50 mock students
    for (let i = 1; i <= 50; i++) {
      const classId = i % 2 === 0 ? 1 : 2;
      const className = mockClasses.find(c => c.id === classId).name;
      
      mockStudents.push({
        id: i,
        firstName: `Student ${i}`,
        lastName: `Last ${i}`,
        grade: '3',
        nextGrade: '4',
        photo: `https://placehold.co/100/${i % 2 === 0 ? '4caf50' : '2196f3'}/white?text=S${i}`,
        classId: classId,
        className: className,
        birthDate: `2015-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        iep: i % 10 === 0, // 10% of students have IEPs
        ell: i % 8 === 0, // 12.5% of students are English Language Learners
        behavior: ['Excellent', 'Good', 'Average', 'Needs Improvement'][Math.floor(Math.random() * 4)],
        academicPerformance: ['Above Grade Level', 'At Grade Level', 'Approaching Grade Level', 'Below Grade Level'][Math.floor(Math.random() * 4)],
        surveyStatus: i % 5 === 0 ? 'completed' : (i % 3 === 0 ? 'in_progress' : 'not_started')
      });
    }
    
    setClasses(mockClasses);
    setStudents(mockStudents);
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when search changes
  };
  
  // Handle class filter change
  const handleClassChange = (classId) => {
    setCurrentClass(classId);
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
  
  // Navigate to student survey
  const handleViewSurvey = (student) => {
    // Find the survey ID for this student
    const surveyId = student.id; // Assuming the survey ID is the same as the student ID for simplicity
    navigate(`/teacher/surveys/${surveyId}`);
  };
  
  // Filter students based on search and class
  const getFilteredStudents = () => {
    return students.filter(student => {
      // Filter by search query
      const searchMatch = searchQuery === '' || 
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by class
      const classMatch = currentClass === 'all' || student.classId.toString() === currentClass.toString();
      
      // Filter by tab
      let tabMatch = true;
      if (tabValue === 1) { // Surveys completed
        tabMatch = student.surveyStatus === 'completed';
      } else if (tabValue === 2) { // Surveys in progress
        tabMatch = student.surveyStatus === 'in_progress';
      } else if (tabValue === 3) { // Surveys not started
        tabMatch = student.surveyStatus === 'not_started';
      }
      
      return searchMatch && classMatch && tabMatch;
    });
  };
  
  // Get paginated students
  const getPaginatedStudents = () => {
    const filteredStudents = getFilteredStudents();
    return filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get survey status color
  const getSurveyStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'not_started': return 'default';
      default: return 'default';
    }
  };
  
  // Get survey status label
  const getSurveyStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'not_started': return 'Not Started';
      default: return status;
    }
  };
  
  // Count students by survey status
  const surveyCompletedCount = students.filter(s => s.surveyStatus === 'completed').length;
  const surveyInProgressCount = students.filter(s => s.surveyStatus === 'in_progress').length;
  const surveyNotStartedCount = students.filter(s => s.surveyStatus === 'not_started').length;
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <PersonIcon fontSize="large" sx={{ mr: 1 }} />
        My Students
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Class summary cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {classes.map((classItem) => (
              <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    cursor: 'pointer',
                    border: currentClass === classItem.id.toString() ? '2px solid' : '1px solid',
                    borderColor: currentClass === classItem.id.toString() ? 'primary.main' : 'divider'
                  }}
                  onClick={() => handleClassChange(classItem.id.toString())}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {classItem.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SchoolIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Grade {classItem.grade}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {classItem.students} Students
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<AssessmentIcon />}>
                      Surveys
                    </Button>
                    <Button size="small" startIcon={<InfoIcon />}>
                      Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                variant="outlined" 
                sx={{ 
                  cursor: 'pointer',
                  height: '100%',
                  border: currentClass === 'all' ? '2px solid' : '1px solid',
                  borderColor: currentClass === 'all' ? 'primary.main' : 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  py: 2
                }}
                onClick={() => handleClassChange('all')}
              >
                <Typography variant="h6" gutterBottom>
                  All Students
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {students.length} Total Students
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
          
          {/* Search and filter */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search student name"
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
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  Add New Student
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="student survey tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label={
                  <Badge badgeContent={students.length} color="primary">
                    All Students
                  </Badge>
                } 
                id="students-tab-0" 
                aria-controls="students-tabpanel-0"
              />
              <Tab 
                label={
                  <Badge badgeContent={surveyCompletedCount} color="success">
                    Surveys Completed
                  </Badge>
                } 
                id="students-tab-1" 
                aria-controls="students-tabpanel-1"
              />
              <Tab 
                label={
                  <Badge badgeContent={surveyInProgressCount} color="warning">
                    Surveys In Progress
                  </Badge>
                } 
                id="students-tab-2" 
                aria-controls="students-tabpanel-2"
              />
              <Tab 
                label={
                  <Badge badgeContent={surveyNotStartedCount} color="default">
                    Surveys Not Started
                  </Badge>
                } 
                id="students-tab-3" 
                aria-controls="students-tabpanel-3"
              />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <StudentsTable 
              students={getPaginatedStudents()}
              totalStudents={getFilteredStudents().length}
              page={page}
              rowsPerPage={rowsPerPage}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              handleViewSurvey={handleViewSurvey}
              getSurveyStatusColor={getSurveyStatusColor}
              getSurveyStatusLabel={getSurveyStatusLabel}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <StudentsTable 
              students={getPaginatedStudents()}
              totalStudents={getFilteredStudents().length}
              page={page}
              rowsPerPage={rowsPerPage}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              handleViewSurvey={handleViewSurvey}
              getSurveyStatusColor={getSurveyStatusColor}
              getSurveyStatusLabel={getSurveyStatusLabel}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <StudentsTable 
              students={getPaginatedStudents()}
              totalStudents={getFilteredStudents().length}
              page={page}
              rowsPerPage={rowsPerPage}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              handleViewSurvey={handleViewSurvey}
              getSurveyStatusColor={getSurveyStatusColor}
              getSurveyStatusLabel={getSurveyStatusLabel}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <StudentsTable 
              students={getPaginatedStudents()}
              totalStudents={getFilteredStudents().length}
              page={page}
              rowsPerPage={rowsPerPage}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              handleViewSurvey={handleViewSurvey}
              getSurveyStatusColor={getSurveyStatusColor}
              getSurveyStatusLabel={getSurveyStatusLabel}
            />
          </TabPanel>
        </>
      )}
    </Container>
  );
};

// Students table component
const StudentsTable = ({ 
  students,
  totalStudents,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleViewSurvey,
  getSurveyStatusColor,
  getSurveyStatusLabel
}) => {
  if (students.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No students found matching your criteria.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Academic Performance</TableCell>
              <TableCell>Behavior</TableCell>
              <TableCell>Survey Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src={student.photo} 
                      alt={`${student.firstName} ${student.lastName}`}
                      sx={{ mr: 2, width: 32, height: 32 }}
                    >
                      {student.firstName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {student.firstName} {student.lastName}
                      </Typography>
                      <Box sx={{ display: 'flex', mt: 0.5 }}>
                        {student.iep && (
                          <Chip label="IEP" size="small" color="secondary" sx={{ mr: 0.5, height: 20 }} />
                        )}
                        {student.ell && (
                          <Chip label="ELL" size="small" color="info" sx={{ height: 20 }} />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{student.className}</TableCell>
                <TableCell>
                  <Chip 
                    label={student.academicPerformance} 
                    size="small"
                    color={
                      student.academicPerformance === 'Above Grade Level' ? 'success' :
                      student.academicPerformance === 'At Grade Level' ? 'primary' :
                      student.academicPerformance === 'Approaching Grade Level' ? 'warning' :
                      'error'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={student.behavior} 
                    size="small"
                    color={
                      student.behavior === 'Excellent' ? 'success' :
                      student.behavior === 'Good' ? 'primary' :
                      student.behavior === 'Average' ? 'info' :
                      'warning'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getSurveyStatusLabel(student.surveyStatus)} 
                    color={getSurveyStatusColor(student.surveyStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewSurvey(student)}
                    startIcon={student.surveyStatus === 'not_started' ? <AddIcon /> : <VisibilityIcon />}
                  >
                    {student.surveyStatus === 'not_started' ? 'Start Survey' : 'View Survey'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={totalStudents}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </>
  );
};

export default TeacherStudents; 