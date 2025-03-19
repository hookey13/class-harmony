import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Breadcrumbs,
  Link,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import StudentProfileCard from '../components/StudentProfileCard';
import StudentProfileForm from '../components/StudentProfileForm';
import api from '../services/api';

/**
 * StudentDetail page - displays detailed student information
 * and provides editing capabilities
 */
const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if we're creating a new student or editing existing
  const isNewStudent = studentId === 'new';
  const isEditModeRequested = new URLSearchParams(location.search).get('edit') === 'true';
  
  // State
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(isNewStudent || isEditModeRequested);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        if (studentId === 'new') {
          // Creating a new student
          setStudent({
            firstName: '',
            lastName: '',
            grade: '',
            gender: '',
            dateOfBirth: null,
            academicLevel: 'Proficient',
            behaviorLevel: 'Medium',
            specialNeeds: false,
            additionalInfo: '',
            subjectProficiency: {
              mathematics: 70,
              reading: 70,
              science: 70,
              socialStudies: 70,
              writing: 70
            },
            accommodations: [],
            iepInfo: {
              status: 'None',
              lastReviewDate: null,
              nextReviewDate: null,
              caseManager: '',
              notes: ''
            },
            parents: []
          });
          setEditMode(true);
        } else {
          // Fetch existing student
          const response = await api.getStudentById(studentId);
          setStudent(response);
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [studentId]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle edit mode toggle
  const handleEditToggle = () => {
    setEditMode(prev => !prev);
  };
  
  // Handle form submission
  const handleSave = async (formData) => {
    try {
      setSaving(true);
      
      let response;
      if (studentId === 'new') {
        // Create new student
        response = await api.createStudent(formData);
        setSuccessMessage('Student created successfully');
        
        // Navigate to the new student's detail page
        navigate(`/students/${response.id}`, { replace: true });
      } else {
        // Update existing student
        response = await api.updateStudent(studentId, formData);
        setSuccessMessage('Student updated successfully');
      }
      
      setStudent(response);
      setEditMode(false);
    } catch (err) {
      console.error('Error saving student data:', err);
      setError('Failed to save student data. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (studentId === 'new') {
      // Navigate back to students list
      navigate('/students');
    } else {
      // Just exit edit mode
      setEditMode(false);
    }
  };
  
  // Close success message
  const handleCloseSuccess = () => {
    setSuccessMessage('');
  };
  
  // Close error message
  const handleCloseError = () => {
    setError(null);
  };
  
  // Mock data for grade levels
  const gradeOptions = ['K', '1', '2', '3', '4', '5', '6'];
  
  // Mock data for academic history
  const academicHistory = [
    {
      academicYear: '2022-2023',
      grade: '2',
      teacher: 'Ms. Johnson',
      gpa: '3.7',
      comments: 'Sarah had an excellent year and showed significant growth in reading comprehension.'
    },
    {
      academicYear: '2021-2022',
      grade: '1',
      teacher: 'Mr. Rodriguez',
      gpa: '3.5',
      comments: 'Sarah adapted well to first grade and excelled in mathematics.'
    }
  ];
  
  // Mock data for class details
  const classDetails = {
    currentClass: {
      name: 'Class 3A',
      teacher: 'Ms. Williams',
      students: 24
    },
    schedule: [
      { period: '1', subject: 'Mathematics', time: '8:30 AM - 9:20 AM' },
      { period: '2', subject: 'Reading', time: '9:25 AM - 10:15 AM' },
      { period: '3', subject: 'Science', time: '10:20 AM - 11:10 AM' },
      { period: '4', subject: 'Lunch', time: '11:15 AM - 11:45 AM' },
      { period: '5', subject: 'Social Studies', time: '11:50 AM - 12:40 PM' },
      { period: '6', subject: 'Art/Music', time: '12:45 PM - 1:35 PM' },
      { period: '7', subject: 'Physical Education', time: '1:40 PM - 2:30 PM' }
    ]
  };
  
  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Main content
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          Dashboard
        </Link>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/students');
          }}
        >
          Students
        </Link>
        <Typography color="text.primary">
          {studentId === 'new' ? 'New Student' : `${student?.firstName} ${student?.lastName}`}
        </Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            edge="start" 
            component={RouterLink} 
            to="/students" 
            sx={{ mr: 2 }}
            aria-label="back to students"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {studentId === 'new' ? 'New Student' : `${student?.firstName} ${student?.lastName}`}
          </Typography>
        </Box>
        
        {!editMode && studentId !== 'new' && (
          <Button 
            variant="contained" 
            startIcon={<EditIcon />} 
            onClick={handleEditToggle}
          >
            Edit Profile
          </Button>
        )}
      </Box>
      
      {/* Error message */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* Success message */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      {/* Main content */}
      {editMode ? (
        <Box component={Paper} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {studentId === 'new' ? 'Create New Student' : 'Edit Student Profile'}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <StudentProfileForm 
            student={student}
            onSave={handleSave}
            onCancel={handleCancel}
            gradeOptions={gradeOptions}
            isLoading={saving}
          />
        </Box>
      ) : (
        <>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto"
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Profile" icon={<SchoolIcon />} iconPosition="start" />
            <Tab label="Academic History" icon={<HistoryIcon />} iconPosition="start" />
            <Tab label="Class Details" icon={<AssessmentIcon />} iconPosition="start" />
          </Tabs>
          
          {activeTab === 0 && (
            <StudentProfileCard 
              student={student} 
              onEdit={handleEditToggle} 
            />
          )}
          
          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Academic History
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {academicHistory.map((year, index) => (
                  <Paper key={index} elevation={0} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Academic Year
                        </Typography>
                        <Typography variant="body1">
                          {year.academicYear}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Grade
                        </Typography>
                        <Typography variant="body1">
                          {year.grade}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Teacher
                        </Typography>
                        <Typography variant="body1">
                          {year.teacher}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="subtitle2" color="text.secondary">
                          GPA
                        </Typography>
                        <Typography variant="body1">
                          {year.gpa}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Comments
                        </Typography>
                        <Typography variant="body1">
                          {year.comments}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                
                {academicHistory.length === 0 && (
                  <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No academic history available
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
          
          {activeTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Class Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Current Class Information
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Class Name
                          </Typography>
                          <Typography variant="body1">
                            {classDetails.currentClass.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Teacher
                          </Typography>
                          <Typography variant="body1">
                            {classDetails.currentClass.teacher}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Class Size
                          </Typography>
                          <Typography variant="body1">
                            {classDetails.currentClass.students} students
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Class Schedule
                      </Typography>
                      
                      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Period</th>
                              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Subject</th>
                              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classDetails.schedule.map((period, index) => (
                              <tr key={index}>
                                <td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{period.period}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{period.subject}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{period.time}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default StudentDetail; 