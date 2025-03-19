import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Grid,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Rating,
  Chip,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const SurveyForm = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State for loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for survey data
  const [survey, setSurvey] = useState(null);
  const [student, setStudent] = useState(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    // Academic Profile
    academicStrengths: '',
    academicAreas: '',
    academicRating: 3,
    
    // Social-Emotional
    socialEmotional: '',
    workStyle: 'varies',
    behaviorType: 'appropriate',
    placementConsiderations: '',
    
    // Learning Style
    learningStyle: '',
    primaryModality: 'visual',
    attentionSpan: 'average',
    independenceLevel: 'developing',
    
    // Placement Recommendations
    placementRecommendations: '',
    teachingStyle: 'flexible',
    additionalNotes: '',
    
    // Status tracking
    status: 'not_started'
  });
  
  // State for stepper
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [saving, setSaving] = useState(false);
  
  // Steps for the survey
  const steps = [
    { label: 'Academic Profile', description: 'Student\'s academic strengths and areas for growth' },
    { label: 'Social-Emotional', description: 'Student\'s social and emotional characteristics' },
    { label: 'Learning Style', description: 'How the student learns best' },
    { label: 'Placement Recommendations', description: 'Your recommendations for next year\'s placement' }
  ];
  
  // Fetch survey data on component mount
  useEffect(() => {
    const fetchSurveyData = async () => {
      setLoading(true);
      try {
        // In production, this would be a real API call
        // const response = await api.get(`/teacher/surveys/${surveyId}`);
        // setSurvey(response.data.survey);
        // setStudent(response.data.student);
        // setFormData(response.data.formData || initialFormData);
        
        // For development purposes, we'll use mock data
        setTimeout(() => {
          provideMockData();
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching survey data:', err);
        setError('Failed to load survey data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchSurveyData();
  }, [surveyId]);
  
  // Provide mock data for development
  const provideMockData = () => {
    const mockStudent = {
      id: parseInt(surveyId),
      firstName: `Student ${surveyId}`,
      lastName: `Last ${surveyId}`,
      grade: '3',
      nextGrade: '4',
      photo: `https://placehold.co/100/4caf50/white?text=S${surveyId}`,
      birthDate: '2015-05-15',
      gender: 'Female',
      className: 'Grade 3 - Room 102'
    };
    
    const mockSurvey = {
      id: parseInt(surveyId),
      studentId: parseInt(surveyId),
      status: 'in_progress',
      completionPercentage: 50,
      updatedAt: new Date().toISOString()
    };
    
    // If survey is in progress, pre-fill some form data
    const mockFormData = {
      academicStrengths: mockSurvey.status !== 'not_started' ? 'Student shows strong skills in mathematics and critical thinking. She is able to solve complex problems and explain her reasoning clearly.' : '',
      academicAreas: mockSurvey.status !== 'not_started' ? 'Reading comprehension could be improved. Student sometimes struggles with inferring meaning from text and needs support with vocabulary development.' : '',
      socialEmotional: mockSurvey.status !== 'not_started' ? 'Student is generally well-adjusted socially. She has a small group of close friends and works well in collaborative settings.' : '',
      learningStyle: mockSurvey.status !== 'not_started' ? 'Student is a visual and kinesthetic learner. She benefits from hands-on activities and visual aids to reinforce concepts.' : '',
      placementRecommendations: mockSurvey.status === 'completed' ? 'I recommend placing this student with a teacher who emphasizes hands-on learning and provides strong support for reading development.' : '',
      additionalNotes: mockSurvey.status === 'completed' ? 'Student would benefit from being separated from Student #12 due to past conflicts.' : ''
    };
    
    setStudent(mockStudent);
    setSurvey(mockSurvey);
    setFormData(mockFormData);
    
    // Set completed steps based on form data
    const newCompleted = {};
    if (mockFormData.academicStrengths && mockFormData.academicAreas) newCompleted[0] = true;
    if (mockFormData.socialEmotional) newCompleted[1] = true;
    if (mockFormData.learningStyle) newCompleted[2] = true;
    if (mockFormData.placementRecommendations) newCompleted[3] = true;
    setCompleted(newCompleted);
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle step navigation
  const handleNext = () => {
    const newCompleted = { ...completed };
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
    setActiveStep(prevStep => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  const handleStep = (step) => {
    setActiveStep(step);
  };
  
  // Save survey data
  const handleSave = async () => {
    setSaving(true);
    try {
      // In production, this would be a real API call
      // await api.put(`/teacher/surveys/${surveyId}`, formData);
      
      // For development purposes, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update completion status
      const newCompleted = { ...completed };
      newCompleted[activeStep] = true;
      setCompleted(newCompleted);
      
      // Update survey status
      const allStepsCompleted = steps.every((_, index) => newCompleted[index]);
      if (allStepsCompleted) {
        setSurvey(prev => ({
          ...prev,
          status: 'completed',
          completionPercentage: 100
        }));
      } else {
        const completionPercentage = Math.round(
          (Object.keys(newCompleted).length / steps.length) * 100
        );
        setSurvey(prev => ({
          ...prev,
          status: 'in_progress',
          completionPercentage
        }));
      }
      
      // Show success message or navigate
      if (activeStep === steps.length - 1 && allStepsCompleted) {
        navigate('/teacher/surveys');
      }
    } catch (err) {
      console.error('Error saving survey data:', err);
      setError('Failed to save survey data. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle survey submission
  const handleSubmit = async () => {
    setSaving(true);
    try {
      // In production, this would be a real API call
      // await api.put(`/teacher/surveys/${surveyId}/submit`, formData);
      
      // For development purposes, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to surveys list
      navigate('/teacher/surveys');
    } catch (err) {
      console.error('Error submitting survey:', err);
      setError('Failed to submit survey. Please try again.');
    } finally {
      setSaving(false);
    }
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
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/teacher/surveys')}
        >
          Back to Surveys
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* Header with student info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Box
              component="img"
              src={student?.photo}
              alt={`${student?.firstName} ${student?.lastName}`}
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #e0e0e0'
              }}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="h5">
              {student?.firstName} {student?.lastName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {student?.className} • Current Grade: {student?.grade}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip 
                label={survey?.status === 'completed' ? 'Completed' : survey?.status === 'in_progress' ? 'In Progress' : 'Not Started'} 
                color={survey?.status === 'completed' ? 'success' : survey?.status === 'in_progress' ? 'warning' : 'default'}
                size="small"
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {survey?.completionPercentage}% complete
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/teacher/surveys')}
            >
              Back to Surveys
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Survey form with stepper */}
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label} completed={completed[index]}>
              <StepLabel 
                optional={<Typography variant="caption">{step.description}</Typography>}
                onClick={() => handleStep(index)}
                sx={{ cursor: 'pointer' }}
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Box sx={{ mt: 2, mb: 1 }}>
                  {/* Academic Profile step */}
                  {index === 0 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Describe this student's academic strengths and performance
                        </Typography>
                        <TextField
                          name="academicStrengths"
                          value={formData.academicStrengths}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={4}
                          placeholder="Consider academic skills, subject strengths, participation in class, work habits, etc."
                          variant="outlined"
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Describe academic areas where this student needs growth or support
                        </Typography>
                        <TextField
                          name="academicAreas"
                          value={formData.academicAreas}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={4}
                          placeholder="Consider subjects where the student struggles, areas needing improvement, or specific supports required."
                          variant="outlined"
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControl component="fieldset" sx={{ mt: 2 }}>
                          <FormLabel component="legend">Overall academic performance</FormLabel>
                          <Rating 
                            name="academicRating"
                            value={formData.academicRating || 3}
                            onChange={(event, newValue) => {
                              setFormData(prev => ({
                                ...prev,
                                academicRating: newValue
                              }));
                            }}
                            max={5}
                            size="large"
                            sx={{ mt: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            1 = Needs significant support | 5 = Exceeding grade-level expectations
                          </Typography>
                        </FormControl>
                      </Grid>
                    </Grid>
                  )}
                  
                  {/* Social-Emotional step */}
                  {index === 1 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Describe this student's social-emotional characteristics
                        </Typography>
                        <TextField
                          name="socialEmotional"
                          value={formData.socialEmotional}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={4}
                          placeholder="Consider social interactions, emotional regulation, behavior, peer relationships, etc."
                          variant="outlined"
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
                          <FormLabel component="legend">Student typically works best:</FormLabel>
                          <RadioGroup
                            name="workStyle"
                            value={formData.workStyle || 'varies'}
                            onChange={handleChange}
                          >
                            <FormControlLabel value="independently" control={<Radio />} label="Independently" />
                            <FormControlLabel value="smallGroups" control={<Radio />} label="In small groups" />
                            <FormControlLabel value="largeGroups" control={<Radio />} label="In large groups" />
                            <FormControlLabel value="varies" control={<Radio />} label="Varies by activity" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
                          <FormLabel component="legend">Classroom behavior:</FormLabel>
                          <RadioGroup
                            name="behaviorType"
                            value={formData.behaviorType || 'appropriate'}
                            onChange={handleChange}
                          >
                            <FormControlLabel value="exemplary" control={<Radio />} label="Exemplary" />
                            <FormControlLabel value="appropriate" control={<Radio />} label="Generally appropriate" />
                            <FormControlLabel value="inconsistent" control={<Radio />} label="Inconsistent" />
                            <FormControlLabel value="challenging" control={<Radio />} label="Often challenging" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Are there specific students this student should be placed with or separated from next year?
                        </Typography>
                        <TextField
                          name="placementConsiderations"
                          value={formData.placementConsiderations || ''}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="List students and explain reasons (positive relationships, conflicts, etc.)"
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  )}
                  
                  {/* Learning Style step */}
                  {index === 2 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Describe this student's learning style, preferences, and effective teaching approaches
                        </Typography>
                        <TextField
                          name="learningStyle"
                          value={formData.learningStyle}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={4}
                          placeholder="Consider how the student learns best, teaching methods that are effective, learning preferences, etc."
                          variant="outlined"
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                          Learning modality preferences (check all that apply)
                        </Typography>
                        <Grid container spacing={2}>
                          {['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'].map((modality) => {
                            const modKey = modality.toLowerCase();
                            return (
                              <Grid item xs={6} sm={3} key={modality}>
                                <FormControlLabel
                                  control={
                                    <Radio 
                                      checked={formData.primaryModality === modKey}
                                      onChange={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          primaryModality: modKey
                                        }));
                                      }}
                                    />
                                  }
                                  label={modality}
                                />
                              </Grid>
                            );
                          })}
                        </Grid>
                        <Typography variant="caption" color="text.secondary">
                          Select the student's primary learning modality
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Student engagement and motivation
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <FormControl component="fieldset" fullWidth>
                              <FormLabel component="legend">Attention span:</FormLabel>
                              <RadioGroup
                                name="attentionSpan"
                                value={formData.attentionSpan || 'average'}
                                onChange={handleChange}
                              >
                                <FormControlLabel value="sustained" control={<Radio />} label="Sustained/focused" />
                                <FormControlLabel value="average" control={<Radio />} label="Average for grade" />
                                <FormControlLabel value="variable" control={<Radio />} label="Variable/dependent on interest" />
                                <FormControlLabel value="limited" control={<Radio />} label="Limited/needs frequent redirection" />
                              </RadioGroup>
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <FormControl component="fieldset" fullWidth>
                              <FormLabel component="legend">Independence level:</FormLabel>
                              <RadioGroup
                                name="independenceLevel"
                                value={formData.independenceLevel || 'developing'}
                                onChange={handleChange}
                              >
                                <FormControlLabel value="highly" control={<Radio />} label="Highly independent" />
                                <FormControlLabel value="appropriate" control={<Radio />} label="Age-appropriate independence" />
                                <FormControlLabel value="developing" control={<Radio />} label="Developing independence" />
                                <FormControlLabel value="dependent" control={<Radio />} label="Often dependent on adult support" />
                              </RadioGroup>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                  
                  {/* Placement Recommendations step */}
                  {index === 3 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Specific placement recommendations for next year
                        </Typography>
                        <TextField
                          name="placementRecommendations"
                          value={formData.placementRecommendations}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={4}
                          placeholder="Provide recommendations for ideal classroom environment, teaching style, peer groupings, etc."
                          variant="outlined"
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Teaching style that would best support this student
                        </Typography>
                        <Grid container spacing={2}>
                          {[
                            { value: 'structured', label: 'Highly structured' },
                            { value: 'flexible', label: 'Flexible/adaptable' },
                            { value: 'nurturing', label: 'Nurturing/supportive' },
                            { value: 'challenging', label: 'Challenging/demanding' }
                          ].map((style) => (
                            <Grid item xs={6} key={style.value}>
                              <FormControlLabel
                                control={
                                  <Radio 
                                    checked={formData.teachingStyle === style.value}
                                    onChange={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        teachingStyle: style.value
                                      }));
                                    }}
                                  />
                                }
                                label={style.label}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Additional notes or considerations for placement
                        </Typography>
                        <TextField
                          name="additionalNotes"
                          value={formData.additionalNotes}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Any other information that would be helpful for placement decisions"
                          variant="outlined"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          Your recommendations will be considered as part of the collaborative placement process. 
                          Final placement decisions will be made by the school administration taking into account 
                          multiple factors including academic needs, social dynamics, and balanced classrooms.
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </Box>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                  >
                    Back
                  </Button>
                  <Box>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      sx={{ mr: 1 }}
                      disabled={saving}
                      startIcon={<SaveIcon />}
                    >
                      Save
                    </Button>
                    {index === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleSubmit}
                        disabled={saving || !Object.keys(completed).length === steps.length}
                        startIcon={<CheckIcon />}
                      >
                        Submit
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<ArrowForwardIcon />}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
};

export default SurveyForm; 