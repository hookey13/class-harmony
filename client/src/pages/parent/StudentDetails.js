import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardHeader,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Note as NoteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useParentAuth } from '../../contexts/ParentAuthContext';
import api from '../../services/api';

// TabPanel component for tab contents
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StudentDetails = () => {
  const { id } = useParams();
  const { currentParent } = useParentAuth();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Fetch student and related data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // First verify that this student belongs to the parent
        if (currentParent?.students) {
          const studentBelongsToParent = currentParent.students.some(
            s => s.id === id || s._id === id
          );
          
          if (!studentBelongsToParent) {
            setError('You do not have permission to view this student.');
            setLoading(false);
            return;
          }
        }
        
        // Fetch student details
        const studentResponse = await api.get(`/students/${id}`);
        setStudent(studentResponse.data.data);
        
        // Fetch parent requests for this student
        const requestsResponse = await api.get(`/parent/requests?studentId=${id}`);
        setRequests(requestsResponse.data.data || []);
        
        setError('');
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id, currentParent]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/parent/dashboard')}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Student Details
          </Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/parent/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/parent/dashboard')}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Student Not Found
          </Typography>
        </Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          The student you're looking for could not be found.
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/parent/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton 
          color="inherit" 
          onClick={() => navigate('/parent/dashboard')}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Student Details
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h5">
                {student.firstName} {student.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Grade {student.grade}
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/parent/requests/new', { state: { studentId: student.id || student._id } })}
            sx={{ mt: { xs: 2, sm: 0 } }}
          >
            Create Placement Request
          </Button>
        </Box>
        
        <Divider />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="student details tabs">
            <Tab label="Overview" id="student-tab-0" aria-controls="student-tabpanel-0" />
            <Tab label="Placement Requests" id="student-tab-1" aria-controls="student-tabpanel-1" />
            <Tab label="Academic Info" id="student-tab-2" aria-controls="student-tabpanel-2" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Basic Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Student ID" secondary={student.studentId || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Date of Birth" secondary={formatDate(student.dateOfBirth)} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Gender" secondary={student.gender || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="School" secondary={student.school?.name || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Grade Level" secondary={`Grade ${student.grade}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Current Teacher" secondary={student.currentTeacher || 'Not assigned'} />
                  </ListItem>
                </List>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <AssignmentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Current Class Information
                </Typography>
                {student.currentClass ? (
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Class Name" secondary={student.currentClass.name || 'N/A'} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Room Number" secondary={student.currentClass.roomNumber || 'N/A'} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Teacher" secondary={student.currentClass.teacher || 'N/A'} />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Assignment Date" 
                        secondary={formatDate(student.currentClass.assignmentDate)} 
                      />
                    </ListItem>
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No current class assignment information available.
                  </Typography>
                )}
              </Box>
              
              {student.notes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <NoteIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Notes
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2">
                      {student.notes}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Grid>
            
            {student.specialNeeds && student.specialNeeds.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Special Needs/Considerations
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {student.specialNeeds.map((need, index) => (
                      <Chip 
                        key={index}
                        label={need}
                        color="secondary" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Placement Requests
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => navigate('/parent/requests/new', { state: { studentId: student.id || student._id } })}
              >
                New Request
              </Button>
            </Box>
            
            {requests.length > 0 ? (
              <Grid container spacing={2}>
                {requests.map((request) => (
                  <Grid item xs={12} key={request.id || request._id}>
                    <Card variant="outlined">
                      <CardHeader
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              {request.requestType === 'teacher_preference' ? 'Teacher Preference' : 
                                request.requestType === 'student_together' ? 'Place with Student' :
                                request.requestType === 'student_separate' ? 'Separate from Student' :
                                request.requestType === 'learning_style' ? 'Learning Style' :
                                request.requestType === 'special_needs' ? 'Special Needs' : 'Other'}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={request.status} 
                              color={
                                request.status === 'pending' ? 'warning' :
                                request.status === 'approved' ? 'success' :
                                request.status === 'denied' ? 'error' :
                                'default'
                              }
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        subheader={`Submitted on ${formatDate(request.createdAt)}`}
                        action={
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => navigate(`/parent/requests/${request.id || request._id}`)}
                          >
                            View
                          </Button>
                        }
                      />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {request.details}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" paragraph>
                  No placement requests have been submitted for this student.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/parent/requests/new', { state: { studentId: student.id || student._id } })}
                >
                  Create First Request
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              <TimelineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Academic Profile
            </Typography>
            
            {student.academicProfile ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Academic Strengths
                    </Typography>
                    {student.academicProfile.strengths ? (
                      <Typography variant="body2">
                        {student.academicProfile.strengths}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No academic strengths information available.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Areas for Growth
                    </Typography>
                    {student.academicProfile.areasForGrowth ? (
                      <Typography variant="body2">
                        {student.academicProfile.areasForGrowth}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No areas for growth information available.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Learning Style
                    </Typography>
                    {student.academicProfile.learningStyle ? (
                      <Typography variant="body2">
                        {student.academicProfile.learningStyle}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No learning style information available.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                
                {student.academicProfile.assessments && student.academicProfile.assessments.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Recent Assessments
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Assessment</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Score/Result</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {student.academicProfile.assessments.map((assessment, index) => (
                            <TableRow key={index}>
                              <TableCell>{assessment.name}</TableCell>
                              <TableCell>{formatDate(assessment.date)}</TableCell>
                              <TableCell>{assessment.score}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Alert severity="info">
                Academic profile information is not available for this student.
              </Alert>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default StudentDetails; 