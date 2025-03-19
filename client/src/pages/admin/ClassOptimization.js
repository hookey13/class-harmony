import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Slider,
  Button,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Save as SaveIcon,
  SwapHoriz as SwapHorizIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  Balance as BalanceIcon,
  Accessibility as AccessibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Lightbulb as LightbulbIcon,
  PriorityHigh as PriorityHighIcon,
  ArrowUpward as ArrowUpwardIcon,
  Description as DescriptionIcon,
  PersonAdd as PersonAddIcon,
  Class as ClassIcon,
  Add as AddIcon,
  Publish as PublishIcon,
  ArrowForward as ArrowForwardIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import optimizationService from '../../services/optimizationService';
import ClassBalanceChart from '../../components/ClassBalanceChart';
import OptimizationMetrics, { ParentRequestFulfillment } from '../../components/OptimizationMetrics';
import ConstraintsEditor from '../../components/ConstraintsEditor';
import AISuggestions from '../../components/AISuggestions';
import TeacherAssignment from '../../components/TeacherAssignment';
import ClassRosterReport from '../../components/ClassRosterReport';
import api from '../../services/api';
import constraintService from '../../services/constraintService';
import ConstraintsViolationsAlert from '../../components/ConstraintsViolationsAlert';
import ManualAdjustmentInterface from '../../components/ManualAdjustmentInterface';

// Component to display student details
const StudentCard = ({ student, onSwap }) => {
  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ 
              bgcolor: student.specialNeeds ? 'warning.light' : 'primary.light',
              width: 32, 
              height: 32,
              mr: 1
            }}>
              {student.firstName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" component="div" fontWeight="medium">
                {student.firstName} {student.lastName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Chip 
                  size="small" 
                  label={`Academic: ${student.academicLevel}`} 
                  sx={{ mr: 0.5, height: 20, fontSize: '0.7rem' }}
                  color={student.academicLevel >= 4 ? "success" : student.academicLevel >= 2 ? "primary" : "error"}
                />
                {student.specialNeeds && (
                  <Chip 
                    size="small" 
                    label="Special Needs" 
                    sx={{ height: 20, fontSize: '0.7rem' }}
                    color="warning"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => onSwap(student)} sx={{ ml: 1 }}>
            <SwapHorizIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

// Component to display class details
const ClassCard = ({ classData, index, onSwapStudent }) => {
  return (
    <Card>
      <CardHeader 
        title={`Class ${index + 1}`}
        subheader={`${classData.students.length} students`}
        action={
          <Tooltip title="Class Balance Score">
            <Chip
              icon={<InfoIcon />}
              label={classData.balanceScore?.toFixed(2) || "N/A"}
              size="small"
              color="primary"
            />
          </Tooltip>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent sx={{ maxHeight: 400, overflow: 'auto', p: 1 }}>
        {classData.students.map((student, studentIndex) => (
          <StudentCard 
            key={student.id} 
            student={student} 
            onSwap={(student) => onSwapStudent(index, studentIndex, student)}
          />
        ))}
      </CardContent>
    </Card>
  );
};

// Component to display student swap dialog
const SwapStudentDialog = ({ open, onClose, student, classes, onSwap }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  useEffect(() => {
    if (!open) {
      setSelectedClass(null);
      setSelectedStudent(null);
    }
  }, [open]);
  
  const handleSwap = () => {
    if (selectedClass !== null && selectedStudent !== null) {
      onSwap(selectedClass, selectedStudent);
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Swap Student
        <Typography variant="subtitle2" color="textSecondary">
          Select a student to swap with {student?.firstName} {student?.lastName}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {classes.map((classData, classIndex) => (
            <Grid item xs={12} md={6} key={classIndex}>
              <Card variant="outlined">
                <CardHeader 
                  title={`Class ${classIndex + 1}`}
                  sx={{ pb: 1 }}
                />
                <Divider />
                <CardContent sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
                  {classData.students.map((classStudent, studentIndex) => (
                    <Card 
                      key={classStudent.id} 
                      variant="outlined" 
                      sx={{ 
                        mb: 1, 
                        cursor: 'pointer',
                        bgcolor: selectedClass === classIndex && selectedStudent === studentIndex ? 'primary.light' : 'background.paper'
                      }}
                      onClick={() => {
                        setSelectedClass(classIndex);
                        setSelectedStudent(studentIndex);
                      }}
                    >
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ 
                            bgcolor: classStudent.specialNeeds ? 'warning.light' : 'primary.light',
                            width: 32, 
                            height: 32,
                            mr: 1
                          }}>
                            {classStudent.firstName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" component="div" fontWeight="medium">
                              {classStudent.firstName} {classStudent.lastName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Chip 
                                size="small" 
                                label={`Academic: ${classStudent.academicLevel}`} 
                                sx={{ mr: 0.5, height: 20, fontSize: '0.7rem' }}
                                color={classStudent.academicLevel >= 4 ? "success" : classStudent.academicLevel >= 2 ? "primary" : "error"}
                              />
                              {classStudent.specialNeeds && (
                                <Chip 
                                  size="small" 
                                  label="Special Needs" 
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                  color="warning"
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSwap} 
          variant="contained" 
          color="primary"
          disabled={selectedClass === null || selectedStudent === null}
        >
          Swap Students
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ClassOptimization = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weights, setWeights] = useState(optimizationService.DEFAULT_WEIGHTS);
  const [optimizedClasses, setOptimizedClasses] = useState(null);
  const [constraints, setConstraints] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClassIndex, setSelectedClassIndex] = useState(null);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(null);
  const [optimizationStrategy, setOptimizationStrategy] = useState('balanced');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [classCount, setClassCount] = useState(3);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [grade, setGrade] = useState(3); // Default to 3rd grade
  const [availableYears, setAvailableYears] = useState([]);
  const [parentRequests, setParentRequests] = useState({
    requests: [],
    fulfilled: 0,
    total: 0
  });
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [success, setSuccess] = useState(null);
  const [balanceScores, setBalanceScores] = useState(null);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [optimizationError, setOptimizationError] = useState(null);
  const [optimizationStatus, setOptimizationStatus] = useState('Ready to optimize');
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const [optimizationWarnings, setOptimizationWarnings] = useState([]);
  const [constraintViolations, setConstraintViolations] = useState([]);
  const [showViolations, setShowViolations] = useState(true);
  const [overallBalance, setOverallBalance] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch available academic years on component mount
  useEffect(() => {
    // In a real app, you would fetch this from the API
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push(`${year}-${year + 1}`);
    }
    setAvailableYears(years);
    setAcademicYear(years[0]);
  }, []);

  // Fetch optimization stats when academic year or grade changes
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await optimizationService.fetchOptimizationStats(academicYear, grade);
        setStats(stats);
      } catch (err) {
        console.error('Error fetching optimization stats:', err);
      }
    };
    
    if (academicYear && grade) {
      fetchStats();
    }
  }, [academicYear, grade]);

  // Fetch students when academic year or grade changes
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const students = await optimizationService.fetchStudentsForGrade(grade, academicYear);
        setStudents(students);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setLoading(false);
      }
    };
    
    if (academicYear && grade) {
      fetchStudents();
    }
  }, [academicYear, grade]);

  // Fetch parent requests when academic year or grade changes
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const requests = await optimizationService.fetchParentRequests(academicYear, grade);
        setParentRequests(requests);
      } catch (err) {
        console.error('Error fetching parent requests:', err);
      }
    };
    
    if (academicYear && grade) {
      fetchRequests();
    }
  }, [academicYear, grade]);

  const handleWeightChange = (factor) => (event, value) => {
    setWeights(prev => ({
      ...prev,
      [factor]: value
    }));
  };

  const handleOptimize = async () => {
    try {
      setLoading(true);
      setOptimizationError(null);
      
      if (!academicYear || !grade || classCount <= 0) {
        setOptimizationError('Please select an academic year, grade, and number of classes');
        setLoading(false);
        return;
      }
      
      // Prepare for optimization
      setOptimizedClasses([]);
      setError(null); // Clear any previous errors
      
      if (students.length > 0) {
        // Get optimization weights
        const optimizationWeights = {
          academicBalance: weights.academicBalance / 100,
          behavioralBalance: weights.behavioralBalance / 100,
          genderBalance: weights.genderBalance / 100,
          specialNeedsDistribution: weights.specialNeedsDistribution / 100,
          parentRequests: weights.parentRequests / 100
        };
        
        // Attempt to use server-side optimization first
        let classesResult;
        try {
          classesResult = await optimizationService.runServerOptimization(
            academicYear,
            grade,
            classCount,
            optimizationStrategy,
            optimizationWeights,
            constraints // Pass constraints to the server-side optimization
          );
        } catch (serverError) {
          console.error('Server-side optimization failed, falling back to client-side:', serverError);
          
          // Fall back to client-side optimization
          if (constraints && constraints.length > 0) {
            // Apply constraints first to get initial student distribution
            const initialDistribution = constraintService.applyConstraints(students, constraints, classCount);
            // Then optimize further with the balance factors
            classesResult = optimizationService.optimizeClasses(
              students,
              classCount,
              optimizationWeights,
              constraints, // Pass constraints to the client-side method
              initialDistribution // Provide the constraint-based initial distribution
            );
          } else {
            // No constraints, just use regular optimization
            classesResult = optimizationService.optimizeClasses(
              students,
              classCount,
              optimizationWeights
            );
          }
        }
        
        // Check for constraint violations after optimization
        if (constraints && constraints.length > 0) {
          const validationResult = constraintService.validateConstraints(classesResult, constraints);
          
          if (!validationResult.satisfied) {
            setConstraintViolations(validationResult.violatedConstraints);
            setShowViolations(true);
          } else {
            setConstraintViolations([]);
            setShowViolations(false);
          }
        }
        
        // Calculate balance scores for metrics
        const genderBalance = optimizationService.calculateGenderBalance(classesResult);
        const academicBalance = optimizationService.calculateAcademicBalance(classesResult);
        const behavioralBalance = optimizationService.calculateBehavioralBalance(classesResult);
        const specialNeedsBalance = optimizationService.calculateSpecialNeedsDistribution(classesResult);
        const requestsFulfilled = parentRequests?.fulfillmentRate || 75;
        
        setBalanceScores({
          genderBalance,
          academicBalance,
          behavioralBalance,
          specialNeedsDistribution: specialNeedsBalance,
          parentRequestsFulfilled: requestsFulfilled
        });
        
        // Update UI with optimized classes
        setOptimizedClasses(classesResult);
        setActiveTab(1); // Switch to Classes tab
        
        // Get AI suggestions after optimization
        handleGetSuggestions();
      } else {
        setError("No students found for the selected criteria");
      }
    } catch (err) {
      console.error('Error during optimization:', err);
      setError(`Error during optimization: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClasses = async () => {
    setLoading(true);
    try {
      // Apply the optimization results
      const result = await optimizationService.applyOptimizationResults(
        optimizedClasses,
        academicYear,
        grade
      );
      
      setSuccess(`Classes saved successfully! Created: ${result.createdCount}, Updated: ${result.updatedCount}`);
      // Reset after a few seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError('Failed to save classes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapStudents = (classIndex1, studentIndex1, classIndex2, studentIndex2) => {
    if (!optimizedClasses) return;

    const newClasses = JSON.parse(JSON.stringify(optimizedClasses));
    const temp = newClasses.classes[classIndex1].students[studentIndex1];
    newClasses.classes[classIndex1].students[studentIndex1] = 
      newClasses.classes[classIndex2].students[studentIndex2];
    newClasses.classes[classIndex2].students[studentIndex2] = temp;

    // Recalculate scores
    newClasses.classes = newClasses.classes.map(cls => ({
      ...cls,
      balanceScore: optimizationService.calculateClassBalance(cls, weights)
    }));
    
    newClasses.optimizationScore = newClasses.classes.reduce((acc, cls) => 
      acc + cls.balanceScore, 0) / newClasses.classes.length;

    setOptimizedClasses(newClasses);
  };
  
  const handleOpenSwapDialog = (classIndex, studentIndex, student) => {
    setSelectedClassIndex(classIndex);
    setSelectedStudentIndex(studentIndex);
    setSelectedStudent(student);
    setSwapDialogOpen(true);
  };
  
  const handleSwapFromDialog = (targetClassIndex, targetStudentIndex) => {
    handleSwapStudents(
      selectedClassIndex, 
      selectedStudentIndex, 
      targetClassIndex, 
      targetStudentIndex
    );
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Fetch teacher assignments when switching to the teacher assignment or reports tab
    if ((newValue === 2 || newValue === 3) && optimizedClasses?.classes?.length > 0) {
      fetchTeacherAssignments();
    }
    
    // Fetch AI suggestions when switching to the AI suggestions tab
    if (newValue === 5 && optimizedClasses && !aiSuggestions) {
      handleGetSuggestions();
    }
  };
  
  const handleStrategyChange = (event) => {
    const strategy = event.target.value;
    setOptimizationStrategy(strategy);
    
    // Adjust weights based on strategy
    let newWeights = { ...weights };
    
    switch (strategy) {
      case 'academic':
        newWeights = {
          ...weights,
          academicBalance: 2.0,
          behavioralBalance: 1.0,
          genderBalance: 1.0,
          specialNeedsDistribution: 1.5,
          parentRequests: 1.0
        };
        break;
      case 'behavioral':
        newWeights = {
          ...weights,
          academicBalance: 1.0,
          behavioralBalance: 2.0,
          genderBalance: 1.0,
          specialNeedsDistribution: 1.8,
          parentRequests: 1.0
        };
        break;
      case 'requests':
        newWeights = {
          ...weights,
          academicBalance: 1.0,
          behavioralBalance: 1.0,
          genderBalance: 1.0,
          specialNeedsDistribution: 1.5,
          parentRequests: 2.0
        };
        break;
      default: // balanced
        newWeights = {
          academicBalance: 1.0,
          behavioralBalance: 1.0,
          genderBalance: 1.0,
          specialNeedsDistribution: 1.5,
          classSize: 2.0,
          parentRequests: 1.8,
          teacherPreferences: 1.6,
          studentRelationships: 1.7
        };
    }
    
    setWeights(newWeights);
  };

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const suggestions = await optimizationService.getAISuggestions(
        optimizedClasses, 
        academicYear, 
        grade
      );
      setAiSuggestions(suggestions);
    } catch (error) {
      setError('Failed to get AI suggestions: ' + error.message);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleConstraintChange = (newConstraints) => {
    setConstraints(newConstraints);
  };

  const fetchTeacherAssignments = async () => {
    if (!academicYear || grade === undefined) return;
    
    try {
      const response = await api.post('/api/optimization/assign-teachers', {
        academicYear,
        grade,
        classes: optimizedClasses.classes
      });
      
      setTeacherAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
      setError('Failed to load teacher assignments');
      
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  const handleCloseViolations = () => {
    setShowViolations(false);
  };

  const handleSaveManualAdjustments = (updatedClasses) => {
    setOptimizedClasses(updatedClasses);
    // Calculate new overall balance score
    const totalBalance = updatedClasses.reduce((sum, cls) => sum + (cls.balanceScore || 0), 0);
    const averageBalance = totalBalance / updatedClasses.length;
    setOverallBalance(averageBalance);
    
    setSnackbar({
      open: true,
      message: 'Manual adjustments saved successfully',
      severity: 'success'
    });
  };

  const renderWeightControls = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Optimization Settings
      </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showAdvancedSettings}
              onChange={(e) => setShowAdvancedSettings(e.target.checked)}
            />
          }
          label="Advanced Settings"
        />
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="academic-year-label">Academic Year</InputLabel>
            <Select
              labelId="academic-year-label"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              label="Academic Year"
            >
              {availableYears.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="grade-label">Grade Level</InputLabel>
            <Select
              labelId="grade-label"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              label="Grade Level"
            >
              {[0, 1, 2, 3, 4, 5].map(grade => (
                <MenuItem key={grade} value={grade}>
                  {grade === 0 ? 'Kindergarten' : `Grade ${grade}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="strategy-label">Optimization Strategy</InputLabel>
            <Select
              labelId="strategy-label"
              value={optimizationStrategy}
              onChange={handleStrategyChange}
              label="Optimization Strategy"
            >
              <MenuItem value="balanced">Balanced (All Factors)</MenuItem>
              <MenuItem value="academic">Academic Focus</MenuItem>
              <MenuItem value="behavioral">Behavioral Focus</MenuItem>
              <MenuItem value="requests">Parent Requests Priority</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Number of Classes"
            type="number"
            value={classCount}
            onChange={(e) => setClassCount(Math.max(1, parseInt(e.target.value) || 1))}
            fullWidth
            margin="normal"
            InputProps={{ inputProps: { min: 1, max: 10 } }}
          />
        </Grid>
      </Grid>
      
      {stats && (
        <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Optimization Readiness
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="body2" color="textSecondary">
                Students
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ mr: 1 }}>
                  {stats.studentCount || 0}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.readiness?.studentReadiness || 0}
                  sx={{ flexGrow: 1, height: 5, borderRadius: 5 }}
                  color={stats.readiness?.studentReadiness >= 50 ? "success" : "warning"}
                />
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="textSecondary">
                Teacher Preferences
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ mr: 1 }}>
                  {stats.teacherPreferenceCount || 0}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.readiness?.teacherReadiness || 0}
                  sx={{ flexGrow: 1, height: 5, borderRadius: 5 }}
                  color={stats.readiness?.teacherReadiness >= 80 ? "success" : "warning"}
                />
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="textSecondary">
                Parent Preferences
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ mr: 1 }}>
                  {stats.parentPreferenceCount || 0}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.readiness?.parentReadiness || 0}
                  sx={{ flexGrow: 1, height: 5, borderRadius: 5 }}
                  color={stats.readiness?.parentReadiness >= 50 ? "success" : "warning"}
                />
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={stats.readiness?.status || 'Unknown'}
              color={
                stats.readiness?.status === 'Ready for optimization' ? 'success' :
                stats.readiness?.status === 'Almost ready' ? 'primary' :
                'warning'
              }
              size="small"
            />
          </Box>
        </Paper>
      )}
      
      {showAdvancedSettings && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Factor Weights</Typography>
          </AccordionSummary>
          <AccordionDetails>
      <Grid container spacing={3}>
        {Object.entries(weights).map(([factor, value]) => (
          <Grid item xs={12} sm={6} md={4} key={factor}>
            <Typography gutterBottom>
              {factor.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Typography>
            <Slider
              value={value}
              min={0}
              max={2}
              step={0.1}
              onChange={handleWeightChange(factor)}
              valueLabelDisplay="auto"
              marks
            />
          </Grid>
        ))}
      </Grid>
          </AccordionDetails>
        </Accordion>
      )}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleOptimize}
          startIcon={<RefreshIcon />}
          disabled={loading || students.length === 0}
          size="large"
        >
          {loading ? <CircularProgress size={24} /> : 'Optimize Classes'}
        </Button>
      </Box>
    </Paper>
  );

  const renderClassList = () => (
    <Grid container spacing={3}>
      {optimizedClasses?.classes.map((classroom, classIndex) => (
        <Grid item xs={12} md={4} key={classIndex}>
          <ClassCard 
            classData={classroom} 
            index={classIndex} 
            onSwapStudent={handleOpenSwapDialog}
          />
        </Grid>
      ))}
    </Grid>
  );
  
  const renderAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ClassBalanceChart 
          data={{
            optimizationScore: optimizedClasses.optimizationScore,
            classes: optimizedClasses.classes.map((c, i) => ({ 
              name: `Class ${i+1}`, 
              students: c.students.length 
            })),
            genderBalance: Math.round(optimizedClasses.optimizationScore * 90),
            academicBalance: Math.round(optimizedClasses.optimizationScore * 95),
            behavioralBalance: Math.round(optimizedClasses.optimizationScore * 85),
            specialNeedsDistribution: Math.round(optimizedClasses.optimizationScore * 92),
            parentRequestsFulfilled: Math.round(optimizedClasses.optimizationScore * 88),
            genderCounts: {
              male: optimizedClasses.classes.reduce((sum, c) => 
                sum + c.students.filter(s => s.gender === 'Male').length, 0),
              female: optimizedClasses.classes.reduce((sum, c) => 
                sum + c.students.filter(s => s.gender === 'Female').length, 0)
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <OptimizationMetrics 
          data={{
            genderBalance: Math.round(optimizedClasses.optimizationScore * 90),
            academicBalance: Math.round(optimizedClasses.optimizationScore * 95),
            behavioralBalance: Math.round(optimizedClasses.optimizationScore * 85),
            specialNeedsDistribution: Math.round(optimizedClasses.optimizationScore * 92),
            parentRequestsFulfilled: Math.round(optimizedClasses.optimizationScore * 88),
          }}
          parentRequests={parentRequests}
        />
      </Grid>
    </Grid>
  );

  // Helper function to handle applying an AI suggestion
  const handleApplySuggestion = (suggestion) => {
    if (!optimizedClasses) return;
    
    // Parse student names from the description if it's a student swap suggestion
    if (suggestion.type === 'swap') {
      const newClasses = JSON.parse(JSON.stringify(optimizedClasses));
      const studentA = suggestion.studentA;
      const studentB = suggestion.studentB;
      
      // Find the students and their classes
      let classAIndex = -1;
      let classBIndex = -1;
      let studentAIndex = -1;
      let studentBIndex = -1;
      
      newClasses.classes.forEach((classObj, classIndex) => {
        classObj.students.forEach((student, studentIndex) => {
          if (student.id === studentA.id) {
            classAIndex = classIndex;
            studentAIndex = studentIndex;
          } else if (student.id === studentB.id) {
            classBIndex = classIndex;
            studentBIndex = studentIndex;
          }
        });
      });
      
      if (classAIndex !== -1 && classBIndex !== -1 && 
          studentAIndex !== -1 && studentBIndex !== -1) {
        // Swap the students
        const temp = newClasses.classes[classAIndex].students[studentAIndex];
        newClasses.classes[classAIndex].students[studentAIndex] = 
          newClasses.classes[classBIndex].students[studentBIndex];
        newClasses.classes[classBIndex].students[studentBIndex] = temp;
        
        // Recalculate scores
        newClasses.classes = newClasses.classes.map(cls => ({
          ...cls,
          balanceScore: optimizationService.calculateClassBalance(cls, weights)
        }));
        
        newClasses.optimizationScore = newClasses.classes.reduce((acc, cls) => 
          acc + cls.balanceScore, 0) / newClasses.classes.length;
        
        setOptimizedClasses(newClasses);
        setSuccess('Applied AI suggestion: Swapped students successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } else if (suggestion.type === 'move') {
      // Implementation for moving a student between classes
      // Similar to swap but only moving one student
      const newClasses = JSON.parse(JSON.stringify(optimizedClasses));
      const student = suggestion.student;
      const targetClassName = suggestion.targetClass;
      
      let sourceClassIndex = -1;
      let sourceStudentIndex = -1;
      let targetClassIndex = -1;
      
      newClasses.classes.forEach((classObj, classIndex) => {
        if (classObj.name === targetClassName) {
          targetClassIndex = classIndex;
        }
        
        classObj.students.forEach((s, studentIndex) => {
          if (s.id === student.id) {
            sourceClassIndex = classIndex;
            sourceStudentIndex = studentIndex;
          }
        });
      });
      
      if (sourceClassIndex !== -1 && targetClassIndex !== -1 && sourceStudentIndex !== -1) {
        // Move the student
        const studentToMove = newClasses.classes[sourceClassIndex].students[sourceStudentIndex];
        newClasses.classes[sourceClassIndex].students.splice(sourceStudentIndex, 1);
        newClasses.classes[targetClassIndex].students.push(studentToMove);
        
        // Recalculate scores
        newClasses.classes = newClasses.classes.map(cls => ({
          ...cls,
          balanceScore: optimizationService.calculateClassBalance(cls, weights)
        }));
        
        newClasses.optimizationScore = newClasses.classes.reduce((acc, cls) => 
          acc + cls.balanceScore, 0) / newClasses.classes.length;
        
        setOptimizedClasses(newClasses);
        setSuccess('Applied AI suggestion: Moved student successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    }
  };

  // Helper function to get gender counts from optimized classes
  const getGenderCounts = (classes) => {
    const genderCounts = { male: 0, female: 0, other: 0 };
    
    classes.forEach(classItem => {
      classItem.students.forEach(student => {
        if (student.gender === 'male') {
          genderCounts.male += 1;
        } else if (student.gender === 'female') {
          genderCounts.female += 1;
        } else {
          genderCounts.other += 1;
        }
      });
    });
    
    return genderCounts;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Class Optimization
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {academicYear && grade && (
          <ConstraintsEditor 
            academicYear={academicYear}
            grade={grade}
            onConstraintsChange={handleConstraintChange}
          />
        )}

        {renderWeightControls()}

        {/* Constraints Violations Alert */}
        {constraintViolations.length > 0 && (
          <ConstraintsViolationsAlert
            violations={constraintViolations}
            open={showViolations}
            onClose={handleCloseViolations}
          />
        )}

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="h6">Optimizing Classes...</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              This may take a few moments
            </Typography>
            <LinearProgress sx={{ width: '50%' }} />
          </Box>
        ) : (
          optimizedClasses && (
            <>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">
                  Optimization Score: {(optimizedClasses.optimizationScore * 100).toFixed(1)}%
                </Typography>
                <Chip 
                  label={`${optimizedClasses.iterations} iterations`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Box sx={{ flex: 1 }} />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveClasses}
                >
                  Save Classes
                </Button>
              </Box>
              
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Class Lists" icon={<GroupIcon />} iconPosition="start" />
                <Tab label="Analytics" icon={<SchoolIcon />} iconPosition="start" />
                <Tab label="Teacher Assignment" icon={<PersonIcon />} iconPosition="start" />
                <Tab label="Reports" icon={<DescriptionIcon />} iconPosition="start" />
                <Tab label="Manual Adjustment" icon={<SwapHorizIcon />} iconPosition="start" />
                <Tab label="AI Suggestions" icon={<PsychologyIcon />} iconPosition="start" />
              </Tabs>
              
              {activeTab === 0 && renderClassList()}
              {activeTab === 1 && renderAnalytics()}
              {activeTab === 2 && (
                <TeacherAssignment 
                  classes={optimizedClasses.classes} 
                  academicYear={academicYear}
                  grade={grade}
                  onSave={(assignments) => {
                    setTeacherAssignments(assignments);
                    setSuccess('Teacher assignments saved successfully');
                    setTimeout(() => setSuccess(''), 3000);
                  }}
                />
              )}
              {activeTab === 3 && (
                <ClassRosterReport 
                  classes={optimizedClasses.classes}
                  assignments={teacherAssignments}
                  academicYear={academicYear}
                  grade={grade}
                />
              )}
              {activeTab === 4 && (
                <ManualAdjustmentInterface
                  classes={optimizedClasses}
                  students={students}
                  academicYear={academicYear}
                  grade={grade}
                  constraints={constraints}
                  onSave={handleSaveManualAdjustments}
                />
              )}
              {activeTab === 5 && (
                <Box>
                  <AISuggestions 
                    classData={{
                      classes: optimizedClasses.classes,
                      metrics: balanceScores,
                      constraints: constraints
                    }}
                    onApplySuggestion={handleApplySuggestion}
                    loading={loadingSuggestions}
                    onRefresh={handleGetSuggestions}
                  />
                </Box>
              )}
            </>
          )
        )}
      </Box>
      
      <SwapStudentDialog 
        open={swapDialogOpen}
        onClose={() => setSwapDialogOpen(false)}
        student={selectedStudent}
        classes={optimizedClasses?.classes || []}
        onSwap={handleSwapFromDialog}
      />
    </Container>
  );
};

export default ClassOptimization; 