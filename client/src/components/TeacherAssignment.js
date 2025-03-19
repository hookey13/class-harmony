import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Tooltip,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  SwapHoriz as SwapHorizIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import axios from 'axios';
import api from '../utils/api';

const TeacherAssignment = ({ classes, academicYear, grade, onSave }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [compatibilityDetails, setCompatibilityDetails] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load initial assignments if any exist
  useEffect(() => {
    if (classes && classes.length > 0 && academicYear && grade !== undefined) {
      fetchTeacherAssignments();
    }
  }, [classes, academicYear, grade]);

  const fetchTeacherAssignments = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/optimization/assign-teachers', {
        academicYear,
        grade,
        classes
      });
      
      setAssignments(response.data.assignments);
      setAvailableTeachers(response.data.availableTeachers);
      setSuccessMessage('Teacher assignments loaded successfully');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
      setErrorMessage('Failed to load teacher assignments');
      
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssignments = async () => {
    setLoading(true);
    try {
      // Format the assignments to save
      const formattedAssignments = assignments.map(assignment => ({
        classId: assignment.classId,
        teacherId: assignment.teacherId
      }));
      
      await api.post('/api/optimization/save-teacher-assignments', {
        academicYear,
        grade,
        assignments: formattedAssignments
      });
      
      setSuccessMessage('Teacher assignments saved successfully');
      
      if (onSave) {
        onSave(assignments);
      }
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving teacher assignments:', error);
      setErrorMessage('Failed to save teacher assignments');
      
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherAssignment = async (teacherId, classId) => {
    // Find the class and teacher
    const teacherClass = classes.find(c => c.id === classId || c._id === classId);
    const teacher = availableTeachers.find(t => t.id === teacherId || t._id === teacherId);
    
    if (!teacherClass || !teacher) {
      setErrorMessage('Class or teacher not found');
      return;
    }
    
    // Get compatibility details
    try {
      const response = await api.post('/api/optimization/teacher-compatibility', {
        teacherId,
        classData: teacherClass
      });
      
      // Update assignments
      const updatedAssignments = [...assignments];
      const existingIndex = updatedAssignments.findIndex(a => a.classId === classId);
      
      if (existingIndex >= 0) {
        updatedAssignments[existingIndex] = {
          ...updatedAssignments[existingIndex],
          teacherId,
          teacherName: teacher.name,
          compatibilityScore: response.data.compatibilityScore
        };
      } else {
        updatedAssignments.push({
          classId,
          className: teacherClass.name,
          teacherId,
          teacherName: teacher.name,
          compatibilityScore: response.data.compatibilityScore
        });
      }
      
      setAssignments(updatedAssignments);
      setSelectedTeacher(null);
      setSelectedClass(null);
      setDialogOpen(false);
      
      setSuccessMessage(`Teacher ${teacher.name} assigned to ${teacherClass.name}`);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error assigning teacher:', error);
      setErrorMessage('Failed to assign teacher');
      
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };

  const handleShowCompatibility = async (teacherId, classId) => {
    try {
      const teacherClass = classes.find(c => c.id === classId || c._id === classId);
      
      if (!teacherClass) {
        setErrorMessage('Class not found');
        return;
      }
      
      const response = await api.post('/api/optimization/teacher-compatibility', {
        teacherId,
        classData: teacherClass
      });
      
      setCompatibilityDetails(response.data);
      setDetailsOpen(prev => ({
        ...prev,
        [classId]: !prev[classId]
      }));
    } catch (error) {
      console.error('Error fetching compatibility details:', error);
      setErrorMessage('Failed to fetch compatibility details');
      
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };

  const handleRemoveAssignment = (classId) => {
    const updatedAssignments = assignments.filter(a => a.classId !== classId);
    setAssignments(updatedAssignments);
    
    setSuccessMessage('Teacher assignment removed');
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const filteredTeachers = searchTerm 
    ? availableTeachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.specialtyAreas.some(area => 
          area.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : availableTeachers;

  const openAssignDialog = (classData) => {
    setSelectedClass(classData);
    setDialogOpen(true);
  };

  const getColorForScore = (score) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'info.main';
    if (score >= 40) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box sx={{ mt: 3 }}>
      {(successMessage || errorMessage) && (
        <Box sx={{ mb: 2 }}>
          {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}
        </Box>
      )}
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h3">
            Teacher Assignment
          </Typography>
          
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchTeacherAssignments}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              onClick={handleSaveAssignments}
              disabled={loading || assignments.length === 0}
            >
              Save Assignments
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Class Assignments
                </Typography>
                
                {classes && classes.length > 0 ? (
                  <Grid container spacing={2}>
                    {classes.map((classItem) => {
                      const assignment = assignments.find(a => 
                        a.classId === classItem.id || a.classId === classItem._id
                      );
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={classItem.id || classItem._id}>
                          <Card 
                            variant="outlined"
                            sx={{ 
                              height: '100%',
                              borderLeft: assignment ? `4px solid ${getColorForScore(assignment.compatibilityScore)}` : 'none'
                            }}
                          >
                            <CardHeader
                              title={classItem.name}
                              subheader={`${classItem.students.length} students`}
                            />
                            
                            <CardContent>
                              {assignment ? (
                                <>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ mr: 2, bgcolor: getColorForScore(assignment.compatibilityScore) }}>
                                      <PersonIcon />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body1">
                                        {assignment.teacherName}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" color="textSecondary">
                                          Compatibility: 
                                        </Typography>
                                        <Chip 
                                          label={`${Math.round(assignment.compatibilityScore)}%`}
                                          size="small"
                                          sx={{ 
                                            ml: 1,
                                            bgcolor: getColorForScore(assignment.compatibilityScore),
                                            color: 'white'
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', mt: 2 }}>
                                    <Button
                                      size="small"
                                      onClick={() => handleShowCompatibility(assignment.teacherId, classItem.id || classItem._id)}
                                      startIcon={detailsOpen[classItem.id || classItem._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    >
                                      {detailsOpen[classItem.id || classItem._id] ? 'Hide Details' : 'Show Details'}
                                    </Button>
                                    
                                    <Button
                                      size="small"
                                      color="error"
                                      startIcon={<CloseIcon />}
                                      onClick={() => handleRemoveAssignment(classItem.id || classItem._id)}
                                      sx={{ ml: 'auto' }}
                                    >
                                      Remove
                                    </Button>
                                  </Box>
                                  
                                  <Collapse in={detailsOpen[classItem.id || classItem._id]}>
                                    {compatibilityDetails && (
                                      <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Compatibility Details
                                        </Typography>
                                        
                                        <Box sx={{ mb: 1 }}>
                                          <Typography variant="body2" color="textSecondary">
                                            Academic Distribution
                                          </Typography>
                                          <Box sx={{ display: 'flex', mt: 0.5 }}>
                                            <Chip 
                                              label={`Adv: ${Math.round(compatibilityDetails.compatibilityDetails.academicDistribution.advanced)}%`} 
                                              size="small" 
                                              sx={{ mr: 0.5 }}
                                            />
                                            <Chip 
                                              label={`Prof: ${Math.round(compatibilityDetails.compatibilityDetails.academicDistribution.proficient)}%`} 
                                              size="small" 
                                              sx={{ mr: 0.5 }}
                                            />
                                            <Chip 
                                              label={`Dev: ${Math.round(compatibilityDetails.compatibilityDetails.academicDistribution.developing)}%`} 
                                              size="small" 
                                              sx={{ mr: 0.5 }}
                                            />
                                            <Chip 
                                              label={`Support: ${Math.round(compatibilityDetails.compatibilityDetails.academicDistribution.needsSupport)}%`} 
                                              size="small"
                                            />
                                          </Box>
                                        </Box>
                                        
                                        <Box sx={{ mb: 1 }}>
                                          <Typography variant="body2" color="textSecondary">
                                            Gender Distribution
                                          </Typography>
                                          <Box sx={{ display: 'flex', mt: 0.5 }}>
                                            <Chip 
                                              label={`M: ${Math.round(compatibilityDetails.compatibilityDetails.genderDistribution.male)}%`} 
                                              size="small" 
                                              sx={{ mr: 0.5 }}
                                            />
                                            <Chip 
                                              label={`F: ${Math.round(compatibilityDetails.compatibilityDetails.genderDistribution.female)}%`} 
                                              size="small" 
                                              sx={{ mr: 0.5 }}
                                            />
                                          </Box>
                                        </Box>
                                        
                                        <Box>
                                          <Typography variant="body2" color="textSecondary">
                                            Special Needs: {compatibilityDetails.compatibilityDetails.specialNeedsCount} students
                                          </Typography>
                                        </Box>
                                      </Box>
                                    )}
                                  </Collapse>
                                </>
                              ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                                  <Typography variant="body2" color="textSecondary" gutterBottom>
                                    No teacher assigned
                                  </Typography>
                                  <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<PersonIcon />}
                                    size="small"
                                    onClick={() => openAssignDialog(classItem)}
                                    sx={{ mt: 1 }}
                                  >
                                    Assign Teacher
                                  </Button>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No classes available for assignment
                  </Alert>
                )}
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
      
      {/* Teacher Assignment Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Assign Teacher to {selectedClass?.name}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Search Teachers"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm('')}>
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
          
          <List>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <ListItem 
                  key={teacher.id || teacher._id}
                  button
                  selected={selectedTeacher?.id === teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  sx={{ 
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      }
                    }
                  }}
                >
                  <ListItemIcon>
                    <Avatar>
                      <SchoolIcon />
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={teacher.name}
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span">
                          {teacher.specialtyAreas.join(', ')}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span">
                          Teaching style: {teacher.teachingStyle}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Alert severity="info">
                No teachers found matching your search criteria
              </Alert>
            )}
          </List>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          
          <Button 
            onClick={() => handleTeacherAssignment(selectedTeacher.id, selectedClass.id || selectedClass._id)}
            color="primary"
            variant="contained"
            disabled={!selectedTeacher}
          >
            Assign Teacher
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherAssignment; 