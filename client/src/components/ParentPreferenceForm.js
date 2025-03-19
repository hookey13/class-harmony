import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Autocomplete,
  Chip,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';

const MAX_STUDENT_PREFERENCES = 3;
const MAX_TEACHER_PREFERENCES = 2;

/**
 * Component for parents to submit preferences for their children's class placement
 * 
 * @param {Object} props
 * @param {Object} props.student - Student object
 * @param {string} props.academicYear - Current academic year
 * @param {function} props.onSubmit - Callback when form is submitted
 */
const ParentPreferenceForm = ({ student, academicYear, onSubmit }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    preferredClassmates: [],
    avoidClassmates: [],
    teacherPreference: {
      preferredTeachers: [],
      teachingStylePreference: 'balanced'
    },
    specialConsiderations: '',
    submissionNotes: ''
  });
  
  const [availableStudents, setAvailableStudents] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  
  // Load students and teachers data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch students in the same grade
        const studentResponse = await axios.get('/api/students', {
          params: {
            grade: student.grade,
            academicYear,
            limit: 100,
            excludeId: student._id
          }
        });
        
        // Fetch teachers for the same grade
        const teacherResponse = await axios.get('/api/users', {
          params: {
            role: 'teacher',
            grade: student.grade,
            academicYear,
            limit: 20
          }
        });
        
        setAvailableStudents(studentResponse.data.students || []);
        setAvailableTeachers(teacherResponse.data.users || []);
        
        // If there's an existing preference, load it
        try {
          const preferenceResponse = await axios.get(`/api/parent-preferences/student/${student._id}`, {
            params: { academicYear }
          });
          
          if (preferenceResponse.data) {
            setFormData({
              preferredClassmates: preferenceResponse.data.preferredClassmates || [],
              avoidClassmates: preferenceResponse.data.avoidClassmates || [],
              teacherPreference: preferenceResponse.data.teacherPreference || {
                preferredTeachers: [],
                teachingStylePreference: 'balanced'
              },
              specialConsiderations: preferenceResponse.data.specialConsiderations || '',
              submissionNotes: preferenceResponse.data.submissionNotes || ''
            });
          }
        } catch (prefErr) {
          // No existing preference, using default
          console.log('No existing preference found');
        }
      } catch (err) {
        setError('Error loading data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (student && academicYear) {
      fetchData();
    }
  }, [student, academicYear]);
  
  const handleStudentSelect = (field, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue
    });
  };
  
  const handleTeacherSelect = (newValue) => {
    setFormData({
      ...formData,
      teacherPreference: {
        ...formData.teacherPreference,
        preferredTeachers: newValue
      }
    });
  };
  
  const handleTeachingStyleChange = (event) => {
    setFormData({
      ...formData,
      teacherPreference: {
        ...formData.teacherPreference,
        teachingStylePreference: event.target.value
      }
    });
  };
  
  const handleTextChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const submission = {
        student: student._id,
        academicYear,
        grade: student.grade,
        preferredClassmates: formData.preferredClassmates.map(s => s._id),
        avoidClassmates: formData.avoidClassmates.map(s => s._id),
        teacherPreference: {
          preferredTeachers: formData.teacherPreference.preferredTeachers.map(t => t._id),
          teachingStylePreference: formData.teacherPreference.teachingStylePreference
        },
        specialConsiderations: formData.specialConsiderations,
        submissionNotes: formData.submissionNotes,
        submissionStatus: 'submitted'
      };
      
      const response = await axios.post('/api/parent-preferences', submission);
      
      setSuccess(true);
      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (err) {
      setError('Error submitting preferences: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Classmate Preferences</Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              You can select up to {MAX_STUDENT_PREFERENCES} students you would prefer your child to be placed with.
              While we cannot guarantee all preferences, we will try to honor at least one.
            </Typography>
            
            <Autocomplete
              multiple
              options={availableStudents}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
              value={formData.preferredClassmates}
              onChange={(_, newValue) => {
                if (newValue.length <= MAX_STUDENT_PREFERENCES) {
                  handleStudentSelect('preferredClassmates', newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Preferred Classmates"
                  placeholder="Search students by name"
                  helperText={`${formData.preferredClassmates.length}/${MAX_STUDENT_PREFERENCES} selected`}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    icon={<PersonIcon />}
                    label={`${option.firstName} ${option.lastName}`}
                    {...getTagProps({ index })}
                  />
                ))
              }
              sx={{ mt: 2, mb: 4 }}
            />
            
            <Typography variant="h6" gutterBottom>Students to Avoid</Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              If there are any students you prefer your child not to be placed with due to negative interactions,
              please select them below. This information will be kept confidential.
            </Typography>
            
            <Autocomplete
              multiple
              options={availableStudents}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
              value={formData.avoidClassmates}
              onChange={(_, newValue) => {
                if (newValue.length <= MAX_STUDENT_PREFERENCES) {
                  handleStudentSelect('avoidClassmates', newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Students to Avoid"
                  placeholder="Search students by name"
                  helperText={`${formData.avoidClassmates.length}/${MAX_STUDENT_PREFERENCES} selected`}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    color="warning"
                    icon={<PersonIcon />}
                    label={`${option.firstName} ${option.lastName}`}
                    {...getTagProps({ index })}
                  />
                ))
              }
              sx={{ mt: 2 }}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Teacher Preferences</Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              You can select up to {MAX_TEACHER_PREFERENCES} teachers you would prefer for your child.
              We cannot guarantee teacher assignments but will take preferences into consideration.
            </Typography>
            
            <Autocomplete
              multiple
              options={availableTeachers}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
              value={formData.teacherPreference.preferredTeachers}
              onChange={(_, newValue) => {
                if (newValue.length <= MAX_TEACHER_PREFERENCES) {
                  handleTeacherSelect(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Preferred Teachers"
                  placeholder="Search teachers by name"
                  helperText={`${formData.teacherPreference.preferredTeachers.length}/${MAX_TEACHER_PREFERENCES} selected`}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    icon={<SchoolIcon />}
                    label={`${option.firstName} ${option.lastName}`}
                    {...getTagProps({ index })}
                  />
                ))
              }
              sx={{ mt: 2, mb: 4 }}
            />
            
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Preferred Teaching Style</FormLabel>
              <RadioGroup
                row
                value={formData.teacherPreference.teachingStylePreference}
                onChange={handleTeachingStyleChange}
              >
                <FormControlLabel 
                  value="structured" 
                  control={<Radio />} 
                  label={
                    <Box>
                      <Typography variant="body2">Structured</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Clear routines, explicit instructions, consistent approach
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="balanced" 
                  control={<Radio />} 
                  label={
                    <Box>
                      <Typography variant="body2">Balanced</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Mix of structure and creativity, adaptable approach
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="progressive" 
                  control={<Radio />} 
                  label={
                    <Box>
                      <Typography variant="body2">Progressive</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Student-led, project-based, flexible approach
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Special Considerations</Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Please share any additional information that would be helpful for class placement,
              such as learning preferences, social dynamics, or other special circumstances.
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Special Considerations"
              value={formData.specialConsiderations}
              onChange={(e) => handleTextChange('specialConsiderations', e.target.value)}
              placeholder="Describe any special considerations for your child's placement"
              sx={{ mb: 3 }}
            />
            
            <Typography variant="h6" gutterBottom>Additional Notes</Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Is there anything else you would like the administration to know about your preferences?
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Notes"
              value={formData.submissionNotes}
              onChange={(e) => handleTextChange('submissionNotes', e.target.value)}
              placeholder="Any additional information you would like to share"
            />
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom align="center">Review & Submit</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review your preferences below before submitting. You can go back to edit any section if needed.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      <PersonAddIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Classmate Preferences
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Preferred Classmates:
                    </Typography>
                    {formData.preferredClassmates.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {formData.preferredClassmates.map((student) => (
                          <Chip
                            key={student._id}
                            size="small"
                            label={`${student.firstName} ${student.lastName}`}
                            icon={<PersonIcon />}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ mb: 2 }}>None selected</Typography>
                    )}
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Students to Avoid:
                    </Typography>
                    {formData.avoidClassmates.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formData.avoidClassmates.map((student) => (
                          <Chip
                            key={student._id}
                            size="small"
                            color="warning"
                            label={`${student.firstName} ${student.lastName}`}
                            icon={<PersonIcon />}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2">None selected</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Teacher Preferences
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Preferred Teachers:
                    </Typography>
                    {formData.teacherPreference.preferredTeachers.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {formData.teacherPreference.preferredTeachers.map((teacher) => (
                          <Chip
                            key={teacher._id}
                            size="small"
                            label={`${teacher.firstName} ${teacher.lastName}`}
                            icon={<SchoolIcon />}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ mb: 2 }}>None selected</Typography>
                    )}
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Preferred Teaching Style:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {formData.teacherPreference.teachingStylePreference.charAt(0).toUpperCase() + 
                        formData.teacherPreference.teachingStylePreference.slice(1)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Additional Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Special Considerations:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {formData.specialConsiderations || 'None provided'}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Additional Notes:
                    </Typography>
                    <Typography variant="body2">
                      {formData.submissionNotes || 'None provided'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  const steps = ['Classmate Preferences', 'Teacher Preferences', 'Additional Information', 'Review & Submit'];
  
  if (loading && !formData.preferredClassmates.length && !formData.teacherPreference.preferredTeachers.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (success) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>Preferences Submitted Successfully!</Typography>
        <Typography variant="body1" paragraph>
          Thank you for submitting your preferences for {student.firstName} {student.lastName}.
          The school administration will take these into consideration during class placement.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          You can update your preferences at any time before the deadline.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Class Preferences for {student?.firstName} {student?.lastName}
      </Typography>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Academic Year: {academicYear} | Grade: {student?.grade === 0 ? 'Kindergarten' : `Grade ${student?.grade}`}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {getStepContent(activeStep)}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              Submit Preferences
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              startIcon={<SaveIcon />}
            >
              Save & Continue
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ParentPreferenceForm; 