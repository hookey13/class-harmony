import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Radio,
  RadioGroup,
  FormLabel,
  FormGroup,
  Snackbar,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useData } from '../contexts/DataContext';

// Steps for the teacher survey
const steps = ['Select Class', 'Student Compatibility', 'Special Considerations', 'Review & Submit'];

// Sample compatibility options
const compatibilityOptions = [
  { value: 'works_well', label: 'Works well together' },
  { value: 'should_separate', label: 'Should be separated' },
  { value: 'needs_support', label: 'Need extra support together' },
];

// Sample teaching style options
const teachingStyleOptions = [
  { value: 'structured', label: 'Highly structured environment' },
  { value: 'flexible', label: 'Flexible learning environment' },
  { value: 'collaborative', label: 'Collaborative learning focused' },
  { value: 'independent', label: 'Independent learning focused' },
  { value: 'technology', label: 'Technology-integrated' },
];

const TeacherSurveys = () => {
  const navigate = useNavigate();
  const {
    teachers,
    students,
    selectedSchool,
    gradeLevels,
    selectedGradeLevel,
    isLoading,
    teachersLoading,
    studentsLoading,
    error: dataError,
    fetchTeachers,
    fetchStudents,
    fetchGradeLevels,
    setSelectedGradeLevel,
    createTeacherSurvey,
  } = useData();

  // State for current step
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [teachingStyle, setTeachingStyle] = useState([]);
  const [classroomEnvironment, setClassroomEnvironment] = useState('');
  const [studentPairs, setStudentPairs] = useState([]);
  const [specialConsiderations, setSpecialConsiderations] = useState([]);
  const [comments, setComments] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Pair selection state
  const [pairStudent1, setPairStudent1] = useState('');
  const [pairStudent2, setPairStudent2] = useState('');
  const [pairRelationship, setPairRelationship] = useState('');

  // Special consideration state
  const [considerationStudent, setConsiderationStudent] = useState('');
  const [considerationType, setConsiderationType] = useState('');
  const [considerationNotes, setConsiderationNotes] = useState('');

  // Load initial data
  useEffect(() => {
    if (selectedSchool) {
      fetchGradeLevels();
      fetchTeachers();
    }
  }, [selectedSchool, fetchGradeLevels, fetchTeachers]);

  // Load students when teacher changes
  useEffect(() => {
    if (selectedTeacher) {
      // Find the teacher's grade level
      const teacher = teachers.find(t => t.id === selectedTeacher);
      if (teacher && teacher.grade) {
        // Find the grade level and set it
        const gradeLevel = gradeLevels.find(g => g.code === teacher.grade);
        if (gradeLevel) {
          setSelectedGradeLevel(gradeLevel);
          
          // Fetch students for this teacher's grade
          fetchStudents({ gradeLevel: teacher.grade });
        }
      }
    }
  }, [selectedTeacher, teachers, gradeLevels, fetchStudents, setSelectedGradeLevel]);

  // Filter students to just those in the teacher's class (simulated for now)
  useEffect(() => {
    if (selectedTeacher && students.length > 0) {
      // In a real app, we'd filter to just the teacher's students
      // For now, just use the first 15 students in the grade
      setTeacherStudents(students.slice(0, 15));
    } else {
      setTeacherStudents([]);
    }
  }, [selectedTeacher, students]);

  // Handle teacher change
  const handleTeacherChange = (event) => {
    setSelectedTeacher(event.target.value);
    // Reset form when teacher changes
    setStudentPairs([]);
    setSpecialConsiderations([]);
    setComments('');
    setTeachingStyle([]);
    setClassroomEnvironment('');
  };

  // Handle teaching style change
  const handleTeachingStyleChange = (event) => {
    const { value, checked } = event.target;
    setTeachingStyle(prev => 
      checked 
        ? [...prev, value] 
        : prev.filter(style => style !== value)
    );
  };

  // Add student pair
  const handleAddPair = () => {
    if (!pairStudent1 || !pairStudent2 || !pairRelationship) {
      setError('Please select both students and a relationship type');
      return;
    }

    // Check that we're not adding the same student twice
    if (pairStudent1 === pairStudent2) {
      setError('Cannot pair a student with themselves');
      return;
    }

    // Check that this pair doesn't already exist
    const pairExists = studentPairs.some(
      pair => (pair.student1 === pairStudent1 && pair.student2 === pairStudent2) ||
              (pair.student1 === pairStudent2 && pair.student2 === pairStudent1)
    );

    if (pairExists) {
      setError('This student pair already exists');
      return;
    }

    const student1Data = teacherStudents.find(s => s.id === pairStudent1);
    const student2Data = teacherStudents.find(s => s.id === pairStudent2);

    if (!student1Data || !student2Data) {
      setError('One or both students not found');
      return;
    }

    const newPair = {
      id: `pair_${Date.now()}`,
      student1: pairStudent1,
      student2: pairStudent2,
      student1Name: `${student1Data.firstName} ${student1Data.lastName}`,
      student2Name: `${student2Data.firstName} ${student2Data.lastName}`,
      relationship: pairRelationship,
      relationshipLabel: compatibilityOptions.find(o => o.value === pairRelationship)?.label || pairRelationship
    };

    setStudentPairs([...studentPairs, newPair]);
    setPairStudent1('');
    setPairStudent2('');
    setPairRelationship('');
    setError(null);
  };

  // Remove student pair
  const handleRemovePair = (pairId) => {
    setStudentPairs(studentPairs.filter(pair => pair.id !== pairId));
  };

  // Add special consideration
  const handleAddConsideration = () => {
    if (!considerationStudent || !considerationType) {
      setError('Please select a student and consideration type');
      return;
    }

    const studentData = teacherStudents.find(s => s.id === considerationStudent);
    if (!studentData) {
      setError('Student not found');
      return;
    }

    const newConsideration = {
      id: `consideration_${Date.now()}`,
      studentId: considerationStudent,
      studentName: `${studentData.firstName} ${studentData.lastName}`,
      type: considerationType,
      notes: considerationNotes
    };

    setSpecialConsiderations([...specialConsiderations, newConsideration]);
    setConsiderationStudent('');
    setConsiderationType('');
    setConsiderationNotes('');
    setError(null);
  };

  // Remove special consideration
  const handleRemoveConsideration = (id) => {
    setSpecialConsiderations(specialConsiderations.filter(sc => sc.id !== id));
  };

  // Handle submit
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const teacher = teachers.find(t => t.id === selectedTeacher);
      if (!teacher) {
        throw new Error('Teacher not found');
      }

      // Prepare survey data
      const surveyData = {
        teacherId: selectedTeacher,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        schoolId: selectedSchool.id,
        gradeLevel: teacher.grade,
        teachingStyle,
        classroomEnvironment,
        studentPairs,
        specialConsiderations,
        comments,
        submittedAt: new Date().toISOString()
      };

      // Submit the survey
      const result = await createTeacherSurvey(surveyData);
      
      if (result && result.success) {
        // Set success and display snackbar
        setSuccess(true);
        setSnackbar({
          open: true,
          message: 'Survey submitted successfully!',
          severity: 'success'
        });
      } else {
        throw new Error(result?.error || 'Failed to submit survey');
      }
    } catch (err) {
      setError(`Failed to submit survey: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setActiveStep(0);
    setSelectedTeacher('');
    setTeacherStudents([]);
    setStudentPairs([]);
    setSpecialConsiderations([]);
    setComments('');
    setTeachingStyle([]);
    setClassroomEnvironment('');
    setSuccess(false);
    setError(null);
  };

  // Handle step navigation
  const handleNext = () => {
    if (activeStep === 0 && !selectedTeacher) {
      setError('Please select a teacher');
      return;
    }

    if (activeStep === 0 && (!teachingStyle.length || !classroomEnvironment)) {
      setError('Please complete all required fields');
      return;
    }

    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  // Get step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Teacher Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select your name and share information about your teaching style
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="teacher-select-label">Teacher</InputLabel>
                  <Select
                    labelId="teacher-select-label"
                    value={selectedTeacher}
                    label="Teacher"
                    onChange={handleTeacherChange}
                  >
                    {teachers.map(teacher => (
                      <MenuItem key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName} ({gradeLevels.find(g => g.code === teacher.grade)?.name || `Grade ${teacher.grade}`})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <FormLabel id="classroom-environment-label">
                    Classroom Environment Preference
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="classroom-environment-label"
                    value={classroomEnvironment}
                    onChange={(e) => setClassroomEnvironment(e.target.value)}
                  >
                    <FormControlLabel 
                      value="quiet" 
                      control={<Radio />} 
                      label="Quiet, focused environment" 
                    />
                    <FormControlLabel 
                      value="dynamic" 
                      control={<Radio />} 
                      label="Dynamic, energetic environment" 
                    />
                    <FormControlLabel 
                      value="balanced" 
                      control={<Radio />} 
                      label="Balanced mix of quiet and active times" 
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth component="fieldset" sx={{ mb: 3 }}>
                  <FormLabel component="legend">
                    Teaching Style (select all that apply)
                  </FormLabel>
                  <FormGroup>
                    {teachingStyleOptions.map(option => (
                      <FormControlLabel
                        key={option.value}
                        control={
                          <Checkbox 
                            checked={teachingStyle.includes(option.value)}
                            onChange={handleTeachingStyleChange}
                            value={option.value}
                          />
                        }
                        label={option.label}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Student Compatibility
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Specify which students work well together or should be separated
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Add Student Pair
              </Typography>
              
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="student1-label">Student 1</InputLabel>
                    <Select
                      labelId="student1-label"
                      value={pairStudent1}
                      label="Student 1"
                      onChange={(e) => setPairStudent1(e.target.value)}
                    >
                      {teacherStudents.map(student => (
                        <MenuItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="student2-label">Student 2</InputLabel>
                    <Select
                      labelId="student2-label"
                      value={pairStudent2}
                      label="Student 2"
                      onChange={(e) => setPairStudent2(e.target.value)}
                    >
                      {teacherStudents
                        .filter(student => student.id !== pairStudent1)
                        .map(student => (
                          <MenuItem key={student.id} value={student.id}>
                            {student.firstName} {student.lastName}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="relationship-label">Relationship</InputLabel>
                    <Select
                      labelId="relationship-label"
                      value={pairRelationship}
                      label="Relationship"
                      onChange={(e) => setPairRelationship(e.target.value)}
                    >
                      {compatibilityOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleAddPair}
                  startIcon={<AddIcon />}
                >
                  Add Pair
                </Button>
              </Box>
            </Paper>

            <Typography variant="subtitle1" gutterBottom>
              Student Pairs ({studentPairs.length})
            </Typography>
            
            {studentPairs.length > 0 ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student 1</TableCell>
                      <TableCell>Student 2</TableCell>
                      <TableCell>Relationship</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentPairs.map(pair => (
                      <TableRow key={pair.id}>
                        <TableCell>{pair.student1Name}</TableCell>
                        <TableCell>{pair.student2Name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={pair.relationshipLabel}
                            color={
                              pair.relationship === 'works_well' ? 'success' :
                              pair.relationship === 'should_separate' ? 'error' : 'primary'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleRemovePair(pair.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                No student pairs added yet. Add some pairs above.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Special Considerations
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Note any special considerations for individual students
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Add Special Consideration
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="consideration-student-label">Student</InputLabel>
                    <Select
                      labelId="consideration-student-label"
                      value={considerationStudent}
                      label="Student"
                      onChange={(e) => setConsiderationStudent(e.target.value)}
                    >
                      {teacherStudents.map(student => (
                        <MenuItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="consideration-type-label">Consideration Type</InputLabel>
                    <Select
                      labelId="consideration-type-label"
                      value={considerationType}
                      label="Consideration Type"
                      onChange={(e) => setConsiderationType(e.target.value)}
                    >
                      <MenuItem value="learning_style">Learning Style</MenuItem>
                      <MenuItem value="behavior">Behavior Management</MenuItem>
                      <MenuItem value="accommodation">Special Accommodation</MenuItem>
                      <MenuItem value="strength">Student Strength</MenuItem>
                      <MenuItem value="challenge">Student Challenge</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Notes"
                    fullWidth
                    value={considerationNotes}
                    onChange={(e) => setConsiderationNotes(e.target.value)}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleAddConsideration}
                  startIcon={<AddIcon />}
                >
                  Add Consideration
                </Button>
              </Box>
            </Paper>

            <Typography variant="subtitle1" gutterBottom>
              Special Considerations ({specialConsiderations.length})
            </Typography>
            
            {specialConsiderations.length > 0 ? (
              <List>
                {specialConsiderations.map(consideration => (
                  <React.Fragment key={consideration.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle2">
                              {consideration.studentName}
                            </Typography>
                            <Chip
                              label={consideration.type.replace('_', ' ')}
                              size="small"
                              sx={{ ml: 1, textTransform: 'capitalize' }}
                            />
                          </Box>
                        }
                        secondary={consideration.notes || 'No additional notes'}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveConsideration(consideration.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No special considerations added yet. Add some considerations above.
              </Alert>
            )}

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Additional Comments
              </Typography>
              <TextField
                label="Any other information that might help with classroom placement"
                multiline
                rows={4}
                fullWidth
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review & Submit
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review your input before submitting
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Teacher Information
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Teacher:</strong> {teachers.find(t => t.id === selectedTeacher)?.firstName} {teachers.find(t => t.id === selectedTeacher)?.lastName}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Grade Level:</strong> {gradeLevels.find(g => g.code === teachers.find(t => t.id === selectedTeacher)?.grade)?.name}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Classroom Environment:</strong> {classroomEnvironment === 'quiet' ? 'Quiet, focused environment' : 
                        classroomEnvironment === 'dynamic' ? 'Dynamic, energetic environment' : 'Balanced mix of quiet and active times'}
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>Teaching Style:</strong>
                    </Typography>
                    <Box sx={{ ml: 2 }}>
                      {teachingStyle.map(style => (
                        <Typography key={style} variant="body2" component="div" sx={{ mb: 0.5 }}>
                          • {teachingStyleOptions.find(o => o.value === style)?.label}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Student Pairs ({studentPairs.length})
                    </Typography>
                    
                    {studentPairs.length > 0 ? (
                      <List dense>
                        {studentPairs.map(pair => (
                          <ListItem key={pair.id}>
                            <ListItemText
                              primary={`${pair.student1Name} + ${pair.student2Name}`}
                              secondary={pair.relationshipLabel}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No student pairs specified
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Special Considerations ({specialConsiderations.length})
                    </Typography>
                    
                    {specialConsiderations.length > 0 ? (
                      <List dense>
                        {specialConsiderations.map(consideration => (
                          <ListItem key={consideration.id}>
                            <ListItemText
                              primary={consideration.studentName}
                              secondary={
                                <>
                                  <Typography variant="body2" component="span" sx={{ textTransform: 'capitalize' }}>
                                    {consideration.type.replace('_', ' ')}
                                  </Typography>
                                  {consideration.notes && (
                                    <>: {consideration.notes}</>
                                  )}
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No special considerations specified
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Additional Comments
                    </Typography>
                    
                    {comments ? (
                      <Typography variant="body2">
                        {comments}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No additional comments provided
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {success && (
              <Alert severity="success" sx={{ mt: 3 }}>
                Survey submitted successfully! Thank you for your input.
              </Alert>
            )}
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Teacher Survey
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Share your insights to help create balanced and effective classrooms
      </Typography>

      {/* Error display */}
      {(error || dataError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || dataError}
        </Alert>
      )}

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step content */}
      {getStepContent(activeStep)}

      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={activeStep === 0 ? <RefreshIcon /> : <BackIcon />}
          disabled={loading || success}
          onClick={activeStep === 0 ? handleReset : handleBack}
        >
          {activeStep === 0 ? 'Reset' : 'Back'}
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            endIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSubmit}
            disabled={loading || success}
          >
            {loading ? 'Submitting...' : success ? 'Submitted' : 'Submit Survey'}
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<ForwardIcon />}
            onClick={handleNext}
            disabled={loading}
          >
            Next
          </Button>
        )}
      </Box>

      {/* Success snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        action={
          <IconButton size="small" color="inherit" onClick={() => setSnackbar({ ...snackbar, open: false })}>
            <CheckIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default TeacherSurveys; 