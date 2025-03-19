import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Divider,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useParentAuth } from '../../contexts/ParentAuthContext';
import api from '../../services/api';

const CreateRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId } = useParams();
  const { currentParent } = useParentAuth();
  
  // State for form data
  const [formData, setFormData] = useState({
    studentId: studentId || '',
    requestType: 'teacher',
    preferredTeacher: '',
    preferredPlacement: '',
    reason: '',
    academicReason: false,
    socialReason: false,
    personalityReason: false,
    specialNeedsReason: false,
    peerRequest: false,
    peerNames: '',
    additionalNotes: '',
    confirmUnderstanding: false
  });
  
  // State for form validation
  const [errors, setErrors] = useState({});
  
  // State for API interactions
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // State for multi-step form
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Student Information', 'Request Details', 'Confirmation'];
  
  // Get student and teacher data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch students for current parent
        const studentsResponse = await api.get('/parent/students');
        setStudents(studentsResponse.data.data || []);
        
        // Fetch available teachers
        const teachersResponse = await api.get('/parent/available-teachers');
        setTeachers(teachersResponse.data.data || []);
        
        // If studentId is provided in URL, set it in form
        if (studentId) {
          setFormData(prev => ({ ...prev, studentId }));
        } else if (location.state?.studentId) {
          setFormData(prev => ({ ...prev, studentId: location.state.studentId }));
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        
        // For development purposes, let's provide mock data
        provideMockData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [studentId, location.state]);
  
  // Provide mock data for development purposes
  const provideMockData = () => {
    // Mock students
    setStudents([
      {
        id: '1',
        firstName: 'Emma',
        lastName: 'Johnson',
        grade: '3',
        currentClass: 'Mrs. Thompson - 3B',
        photo: 'https://placehold.co/100/9c27b0/white?text=EJ'
      },
      {
        id: '2',
        firstName: 'Noah',
        lastName: 'Johnson',
        grade: '1',
        currentClass: 'Mr. Davis - 1A',
        photo: 'https://placehold.co/100/2196f3/white?text=NJ'
      },
      {
        id: '3',
        firstName: 'Olivia',
        lastName: 'Johnson',
        grade: '5',
        currentClass: 'Mrs. Wilson - 5C',
        photo: 'https://placehold.co/100/4caf50/white?text=OJ'
      }
    ]);
    
    // Mock teachers
    setTeachers([
      {
        id: '101',
        name: 'Mrs. Miller',
        grade: '4',
        class: '4A',
        bio: 'Experienced teacher with a focus on project-based learning.',
        photo: 'https://placehold.co/100/9c27b0/white?text=MM'
      },
      {
        id: '102',
        name: 'Mr. Rodriguez',
        grade: '4',
        class: '4B',
        bio: 'Specializes in STEM education with an engaging teaching style.',
        photo: 'https://placehold.co/100/2196f3/white?text=MR'
      },
      {
        id: '103',
        name: 'Mrs. Chen',
        grade: '4',
        class: '4C',
        bio: 'Strong background in differentiated instruction and inclusive learning.',
        photo: 'https://placehold.co/100/4caf50/white?text=MC'
      }
    ]);
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For checkboxes, use the checked property
    const newValue = type === 'checkbox' ? checked : value;
    
    // Special handling for peer request checkbox
    if (name === 'peerRequest' && !checked) {
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
        peerNames: '' // Clear peer names if peer request is unchecked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
    
    // Clear validation error for this field when user changes it
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    // Validate student selection
    if (!formData.studentId) {
      newErrors.studentId = 'Please select a student';
    }
    
    // Validate based on request type
    if (formData.requestType === 'teacher') {
      if (!formData.preferredTeacher) {
        newErrors.preferredTeacher = 'Please select a preferred teacher';
      }
    } else if (formData.requestType === 'placement') {
      if (!formData.preferredPlacement) {
        newErrors.preferredPlacement = 'Please provide placement details';
      }
    }
    
    // Validate reason selection
    if (!formData.academicReason && !formData.socialReason && 
        !formData.personalityReason && !formData.specialNeedsReason) {
      newErrors.reason = 'Please select at least one reason for your request';
    }
    
    // Validate peer names if peer request is checked
    if (formData.peerRequest && !formData.peerNames.trim()) {
      newErrors.peerNames = 'Please provide the names of requested peers';
    }
    
    // Validate confirmation checkbox in final step
    if (activeStep === 2 && !formData.confirmUnderstanding) {
      newErrors.confirmUnderstanding = 'You must confirm your understanding of the placement process';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateForm()) {
      setActiveStep(prev => prev + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  // Get selected student details
  const getSelectedStudent = () => {
    if (!formData.studentId) return null;
    return students.find(student => student.id === formData.studentId) || null;
  };
  
  // Get selected teacher details
  const getSelectedTeacher = () => {
    if (!formData.preferredTeacher) return null;
    return teachers.find(teacher => teacher.id === formData.preferredTeacher) || null;
  };
  
  // Get reason text
  const getReasonText = () => {
    const reasons = [];
    if (formData.academicReason) reasons.push('Academic');
    if (formData.socialReason) reasons.push('Social');
    if (formData.personalityReason) reasons.push('Learning Style/Personality');
    if (formData.specialNeedsReason) reasons.push('Special Needs');
    
    return reasons.join(', ');
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Format the data for API
      const requestData = {
        studentId: formData.studentId,
        requestType: formData.requestType,
        preferredTeacherId: formData.requestType === 'teacher' ? formData.preferredTeacher : null,
        preferredPlacement: formData.requestType === 'placement' ? formData.preferredPlacement : null,
        reasons: {
          academic: formData.academicReason,
          social: formData.socialReason,
          personality: formData.personalityReason,
          specialNeeds: formData.specialNeedsReason
        },
        peerRequest: formData.peerRequest,
        peerNames: formData.peerRequest ? formData.peerNames : null,
        additionalNotes: formData.additionalNotes
      };
      
      // Submit to API
      const response = await api.post('/parent/placement-requests', requestData);
      
      setSuccess('Your placement request has been submitted successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/parent/requests');
      }, 3000);
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err.response?.data?.message || 'Failed to submit request. Please try again later.');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Render Student Information step
  const renderStudentStep = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Select Student
        </Typography>
        
        <FormControl fullWidth error={!!errors.studentId} sx={{ mb: 3 }}>
          <FormLabel>Which student is this request for?</FormLabel>
          
          {students.length > 0 ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {students.map(student => (
                <Grid item xs={12} sm={6} md={4} key={student.id}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: 'pointer',
                      boxShadow: formData.studentId === student.id ? 3 : 0,
                      border: formData.studentId === student.id ? '2px solid' : '1px solid',
                      borderColor: formData.studentId === student.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => handleChange({ target: { name: 'studentId', value: student.id } })}
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={student.photo} 
                        alt={`${student.firstName} ${student.lastName}`}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6">
                          {student.firstName} {student.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Grade: {student.grade}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current Class: {student.currentClass}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ mt: 1 }}>
              No students found. Please add students to your account first.
            </Alert>
          )}
          
          {errors.studentId && (
            <Typography color="error" variant="caption">
              {errors.studentId}
            </Typography>
          )}
        </FormControl>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={!formData.studentId}
          >
            Next
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Render Request Details step
  const renderDetailsStep = () => {
    const selectedStudent = getSelectedStudent();
    
    return (
      <Box>
        {selectedStudent && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Request for: 
              <Chip
                avatar={<Avatar src={selectedStudent.photo} />}
                label={`${selectedStudent.firstName} ${selectedStudent.lastName} - Grade ${selectedStudent.grade}`}
                sx={{ ml: 1 }}
              />
            </Typography>
          </Box>
        )}
        
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Request Type</FormLabel>
          <RadioGroup
            name="requestType"
            value={formData.requestType}
            onChange={handleChange}
            row
          >
            <FormControlLabel 
              value="teacher" 
              control={<Radio />} 
              label="Teacher Preference" 
            />
            <FormControlLabel 
              value="placement" 
              control={<Radio />} 
              label="General Placement Request" 
            />
          </RadioGroup>
        </FormControl>
        
        {formData.requestType === 'teacher' ? (
          <FormControl fullWidth error={!!errors.preferredTeacher} sx={{ mb: 3 }}>
            <FormLabel>Preferred Teacher</FormLabel>
            
            {teachers.length > 0 ? (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {teachers.map(teacher => (
                  <Grid item xs={12} sm={6} key={teacher.id}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        cursor: 'pointer',
                        boxShadow: formData.preferredTeacher === teacher.id ? 3 : 0,
                        border: formData.preferredTeacher === teacher.id ? '2px solid' : '1px solid',
                        borderColor: formData.preferredTeacher === teacher.id ? 'primary.main' : 'divider'
                      }}
                      onClick={() => handleChange({ target: { name: 'preferredTeacher', value: teacher.id } })}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={teacher.photo} 
                          alt={teacher.name}
                          sx={{ width: 50, height: 50, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="subtitle1">
                            {teacher.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Grade {teacher.grade} - {teacher.class}
                          </Typography>
                          <Typography variant="body2">
                            {teacher.bio}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info" sx={{ mt: 1 }}>
                No teacher information available. Please describe your preference in the notes section.
              </Alert>
            )}
            
            {errors.preferredTeacher && (
              <Typography color="error" variant="caption">
                {errors.preferredTeacher}
              </Typography>
            )}
          </FormControl>
        ) : (
          <FormControl fullWidth error={!!errors.preferredPlacement} sx={{ mb: 3 }}>
            <FormLabel>Placement Details</FormLabel>
            <TextField
              multiline
              rows={3}
              name="preferredPlacement"
              value={formData.preferredPlacement}
              onChange={handleChange}
              placeholder="Describe your preferred placement (e.g., learning environment, class structure, etc.)"
              sx={{ mt: 1 }}
            />
            {errors.preferredPlacement && (
              <Typography color="error" variant="caption">
                {errors.preferredPlacement}
              </Typography>
            )}
          </FormControl>
        )}
        
        <FormControl component="fieldset" error={!!errors.reason} sx={{ mb: 3 }}>
          <FormLabel component="legend">Reason for Request (select all that apply)</FormLabel>
          <Box sx={{ mt: 1, ml: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.academicReason}
                  onChange={handleChange}
                  name="academicReason"
                />
              }
              label="Academic Needs"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.socialReason}
                  onChange={handleChange}
                  name="socialReason"
                />
              }
              label="Social Dynamics"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.personalityReason}
                  onChange={handleChange}
                  name="personalityReason"
                />
              }
              label="Learning Style/Personality Match"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.specialNeedsReason}
                  onChange={handleChange}
                  name="specialNeedsReason"
                />
              }
              label="Special Needs Accommodation"
            />
          </Box>
          {errors.reason && (
            <Typography color="error" variant="caption">
              {errors.reason}
            </Typography>
          )}
        </FormControl>
        
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.peerRequest}
                onChange={handleChange}
                name="peerRequest"
              />
            }
            label="Include peer placement request"
          />
          
          {formData.peerRequest && (
            <TextField
              fullWidth
              name="peerNames"
              label="Peer Names"
              value={formData.peerNames}
              onChange={handleChange}
              placeholder="Names of students you would like your child to be placed with"
              margin="normal"
              error={!!errors.peerNames}
              helperText={errors.peerNames}
              sx={{ mt: 1 }}
            />
          )}
        </FormControl>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <FormLabel>Additional Notes (optional)</FormLabel>
          <TextField
            multiline
            rows={4}
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            placeholder="Please provide any additional information that may help us understand your request better"
            sx={{ mt: 1 }}
          />
        </FormControl>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
          >
            Review Request
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Render Confirmation step
  const renderConfirmationStep = () => {
    const selectedStudent = getSelectedStudent();
    const selectedTeacher = getSelectedTeacher();
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Review Your Request
        </Typography>
        
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                Student Information
              </Typography>
              {selectedStudent ? (
                <List dense>
                  <ListItem>
                    <Avatar 
                      src={selectedStudent.photo} 
                      sx={{ mr: 2 }}
                    />
                    <ListItemText 
                      primary={`${selectedStudent.firstName} ${selectedStudent.lastName}`} 
                      secondary={`Grade ${selectedStudent.grade} - ${selectedStudent.currentClass}`}
                    />
                  </ListItem>
                </List>
              ) : (
                <Typography color="error">
                  No student selected
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                Request Type
              </Typography>
              <Typography>
                {formData.requestType === 'teacher' 
                  ? 'Teacher Preference' 
                  : 'General Placement Request'}
              </Typography>
              
              {formData.requestType === 'teacher' && selectedTeacher && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    Preferred Teacher:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Avatar 
                      src={selectedTeacher.photo} 
                      sx={{ width: 40, height: 40, mr: 1 }}
                    />
                    <Typography>
                      {selectedTeacher.name} ({selectedTeacher.class})
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {formData.requestType === 'placement' && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    Preferred Placement:
                  </Typography>
                  <Typography>
                    {formData.preferredPlacement || 'Not specified'}
                  </Typography>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                Reasons for Request
              </Typography>
              <Typography>
                {getReasonText() || 'None selected'}
              </Typography>
              
              {formData.peerRequest && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="medium">
                    Peer Request:
                  </Typography>
                  <Typography>
                    {formData.peerNames}
                  </Typography>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                Additional Notes
              </Typography>
              <Typography>
                {formData.additionalNotes || 'None provided'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.confirmUnderstanding}
              onChange={handleChange}
              name="confirmUnderstanding"
            />
          }
          label="I understand that this is a request only and that final placement decisions are made by school administration based on multiple factors. While all requests will be considered, they cannot be guaranteed."
        />
        {errors.confirmUnderstanding && (
          <Typography color="error" variant="caption" display="block">
            {errors.confirmUnderstanding}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            startIcon={<SendIcon />}
            disabled={submitLoading || !formData.confirmUnderstanding}
          >
            {submitLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Render success message after submission
  const renderSuccessMessage = () => {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Request Submitted Successfully
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Your placement request has been received and will be reviewed by the school administration.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/parent/requests')}
        >
          View My Requests
        </Button>
      </Box>
    );
  };
  
  // Main render
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AssignmentIcon fontSize="large" sx={{ mr: 1 }} />
        Create Placement Request
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : success ? (
        renderSuccessMessage()
      ) : (
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === 0 && renderStudentStep()}
          {activeStep === 1 && renderDetailsStep()}
          {activeStep === 2 && renderConfirmationStep()}
        </Paper>
      )}
    </Container>
  );
};

export default CreateRequest;
