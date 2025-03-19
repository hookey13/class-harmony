import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Tooltip,
  Chip,
  Badge,
  Alert,
  AlertTitle,
  Collapse,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  TransferWithinAStation as SwapIcon,
  Compare as CompareIcon,
  ArrowForward as ArrowForwardIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  School as SchoolIcon,
  Undo as UndoIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { calculateClassBalance } from '../services/optimizationService';
import api from '../services/api';

/**
 * ManualAdjustmentInterface component
 * 
 * Provides an interface for administrators to manually adjust student class placements
 * with immediate feedback on impact to various balance metrics
 */
const ManualAdjustmentInterface = ({ 
  classes, 
  students, 
  academicYear, 
  grade, 
  constraints = [],
  onSave 
}) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [targetClass, setTargetClass] = useState(null);
  const [showImpact, setShowImpact] = useState(false);
  const [impactPreview, setImpactPreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [violatedConstraints, setViolatedConstraints] = useState([]);

  // Calculate and update balance scores whenever classes change
  useEffect(() => {
    if (classes && classes.length > 0) {
      calculateBalanceScores();
    }
  }, [classes]);

  // Calculate balance scores for all classes
  const calculateBalanceScores = () => {
    const updatedClasses = classes.map(cls => {
      if (!cls.balanceScore) {
        const studentsInClass = cls.students || [];
        const balanceScore = calculateClassBalance(studentsInClass);
        return { ...cls, balanceScore };
      }
      return cls;
    });
    return updatedClasses;
  };

  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setShowImpact(false);
  };

  // Handle class selection
  const handleClassSelect = (classObj) => {
    setSelectedClass(classObj);
    setSelectedStudent(null);
    setShowImpact(false);
  };

  // Handle target class selection
  const handleTargetClassSelect = (classObj) => {
    if (classObj && selectedStudent) {
      setTargetClass(classObj);
      previewImpact(selectedStudent, selectedClass, classObj);
    } else {
      setTargetClass(null);
      setShowImpact(false);
    }
  };

  // Preview the impact of moving a student
  const previewImpact = async (student, sourceClass, targetClass) => {
    if (!student || !sourceClass || !targetClass) return;
    
    setIsLoading(true);
    
    try {
      // Create a copy of classes with the proposed change
      const modifiedClasses = classes.map(cls => {
        if (cls.id === sourceClass.id) {
          // Remove student from source class
          return {
            ...cls,
            students: cls.students.filter(s => s.id !== student.id)
          };
        } else if (cls.id === targetClass.id) {
          // Add student to target class
          return {
            ...cls,
            students: [...cls.students, student]
          };
        }
        return cls;
      });

      // Calculate new balance scores
      const sourceClassOld = classes.find(c => c.id === sourceClass.id);
      const targetClassOld = classes.find(c => c.id === targetClass.id);
      
      const sourceClassNew = modifiedClasses.find(c => c.id === sourceClass.id);
      const targetClassNew = modifiedClasses.find(c => c.id === targetClass.id);
      
      const sourceBalanceOld = sourceClassOld ? calculateClassBalance(sourceClassOld.students) : 0;
      const targetBalanceOld = targetClassOld ? calculateClassBalance(targetClassOld.students) : 0;
      
      const sourceBalanceNew = sourceClassNew ? calculateClassBalance(sourceClassNew.students) : 0;
      const targetBalanceNew = targetClassNew ? calculateClassBalance(targetClassNew.students) : 0;

      // Check constraints
      let constraintViolations = [];
      if (constraints && constraints.length > 0) {
        // Call API to check constraints
        try {
          const response = await api.post('/api/constraints/validate', {
            classes: modifiedClasses,
            academicYear,
            grade
          });
          constraintViolations = response.data.violations || [];
        } catch (error) {
          console.error('Error validating constraints:', error);
        }
      }

      setImpactPreview({
        sourceClass: {
          before: sourceBalanceOld,
          after: sourceBalanceNew,
          delta: sourceBalanceNew - sourceBalanceOld
        },
        targetClass: {
          before: targetBalanceOld,
          after: targetBalanceNew,
          delta: targetBalanceNew - targetBalanceOld
        },
        overall: {
          before: (sourceBalanceOld + targetBalanceOld) / 2,
          after: (sourceBalanceNew + targetBalanceNew) / 2,
          delta: ((sourceBalanceNew + targetBalanceNew) - (sourceBalanceOld + targetBalanceOld)) / 2
        }
      });
      
      setViolatedConstraints(constraintViolations);
      setShowImpact(true);
    } catch (error) {
      console.error('Error calculating impact:', error);
      setAlertMessage({
        type: 'error',
        message: 'Failed to calculate adjustment impact'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Execute the student move
  const executeMove = () => {
    if (!selectedStudent || !selectedClass || !targetClass) return;
    
    // Add to history for undo
    setHistory([
      ...history, 
      { 
        student: selectedStudent, 
        fromClass: selectedClass, 
        toClass: targetClass,
        timestamp: new Date()
      }
    ]);
    
    // Create copies of the affected classes
    const updatedClasses = classes.map(cls => {
      if (cls.id === selectedClass.id) {
        return {
          ...cls,
          students: cls.students.filter(s => s.id !== selectedStudent.id),
          balanceScore: impactPreview.sourceClass.after
        };
      } else if (cls.id === targetClass.id) {
        return {
          ...cls,
          students: [...cls.students, selectedStudent],
          balanceScore: impactPreview.targetClass.after
        };
      }
      return cls;
    });
    
    // Reset selections
    setSelectedStudent(null);
    setTargetClass(null);
    setShowImpact(false);
    
    // Display success message
    setAlertMessage({
      type: 'success',
      message: `Successfully moved ${selectedStudent.firstName} ${selectedStudent.lastName} to ${targetClass.name}`
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
    
    // Call onSave with updated classes
    if (onSave) {
      onSave(updatedClasses);
    }
  };

  // Undo the last move
  const undoLastMove = () => {
    if (history.length === 0) return;
    
    const lastMove = history[history.length - 1];
    const updatedHistory = [...history];
    updatedHistory.pop();
    setHistory(updatedHistory);
    
    // Update classes by reversing the last move
    const updatedClasses = classes.map(cls => {
      if (cls.id === lastMove.toClass.id) {
        return {
          ...cls,
          students: cls.students.filter(s => s.id !== lastMove.student.id)
        };
      } else if (cls.id === lastMove.fromClass.id) {
        return {
          ...cls,
          students: [...cls.students, lastMove.student]
        };
      }
      return cls;
    });
    
    // Update balance scores
    const classesWithScores = updatedClasses.map(cls => {
      const balanceScore = calculateClassBalance(cls.students);
      return { ...cls, balanceScore };
    });
    
    // Display success message
    setAlertMessage({
      type: 'info',
      message: `Undid move of ${lastMove.student.firstName} ${lastMove.student.lastName}`
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
    
    // Call onSave with updated classes
    if (onSave) {
      onSave(classesWithScores);
    }
  };

  // Helper to get impact color based on delta
  const getImpactColor = (delta) => {
    if (delta > 5) return 'success.main';
    if (delta > 0) return 'info.main';
    if (delta > -5) return 'warning.main';
    return 'error.main';
  };

  // Render student item with relevant indicators
  const renderStudentItem = (student) => {
    return (
      <ListItem
        button
        key={student.id}
        selected={selectedStudent && selectedStudent.id === student.id}
        onClick={() => handleStudentSelect(student)}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: student.gender === 'Male' ? 'primary.light' : 'secondary.light' }}>
            {student.firstName.charAt(0) + student.lastName.charAt(0)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={`${student.firstName} ${student.lastName}`}
          secondary={
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
              <Chip 
                size="small" 
                label={student.academicLevel} 
                sx={{ height: 20 }}
                color={
                  student.academicLevel === 'Advanced' ? 'success' :
                  student.academicLevel === 'Proficient' ? 'info' :
                  student.academicLevel === 'Basic' ? 'warning' : 'error'
                }
              />
              {student.specialNeeds && (
                <Chip size="small" label="Special Needs" color="secondary" sx={{ height: 20 }} />
              )}
              {student.behaviorLevel === 'High' && (
                <Chip size="small" label="High Needs" color="error" sx={{ height: 20 }} />
              )}
            </Box>
          }
        />
      </ListItem>
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Manual Class Adjustment
      </Typography>
      
      {alertMessage && (
        <Alert 
          severity={alertMessage.type} 
          sx={{ mb: 2 }}
          onClose={() => setAlertMessage(null)}
        >
          {alertMessage.message}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        {/* Class Selection */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Select Class" 
              titleTypographyProps={{ variant: 'subtitle1' }}
            />
            <Divider />
            <CardContent>
              <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {classes.map(classObj => (
                  <ListItem 
                    button 
                    key={classObj.id}
                    selected={selectedClass && selectedClass.id === classObj.id}
                    onClick={() => handleClassSelect(classObj)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <SchoolIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={classObj.name}
                      secondary={`${classObj.students ? classObj.students.length : 0} students • Balance: ${
                        classObj.balanceScore ? classObj.balanceScore.toFixed(0) : 'N/A'
                      }`}
                    />
                    {classObj.balanceScore && (
                      <Tooltip title={`Balance Score: ${classObj.balanceScore.toFixed(0)}/100`}>
                        <Box sx={{ width: 40 }}>
                          <LinearProgress
                            variant="determinate"
                            value={classObj.balanceScore}
                            color={
                              classObj.balanceScore >= 80 ? 'success' :
                              classObj.balanceScore >= 60 ? 'info' :
                              classObj.balanceScore >= 40 ? 'warning' : 'error'
                            }
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Tooltip>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Student Selection (from selected class) */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title={selectedClass ? `Students in ${selectedClass.name}` : "Select a Class"}
              titleTypographyProps={{ variant: 'subtitle1' }}
              action={
                selectedClass && (
                  <Tooltip title="Class Balance">
                    <Chip
                      label={`Balance: ${selectedClass.balanceScore ? selectedClass.balanceScore.toFixed(0) : 'N/A'}`}
                      color={
                        selectedClass.balanceScore >= 80 ? 'success' :
                        selectedClass.balanceScore >= 60 ? 'info' :
                        selectedClass.balanceScore >= 40 ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </Tooltip>
                )
              }
            />
            <Divider />
            <CardContent>
              {selectedClass ? (
                <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {selectedClass.students && selectedClass.students.length > 0 ? (
                    selectedClass.students.map(student => renderStudentItem(student))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No students in this class" />
                    </ListItem>
                  )}
                </List>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Typography color="text.secondary">
                    Select a class to view students
                  </Typography>
                </Box>
              )}
              
              {selectedStudent && selectedClass && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Move {selectedStudent.firstName} {selectedStudent.lastName} to:
                  </Typography>
                  
                  <Autocomplete
                    value={targetClass}
                    onChange={(event, newValue) => handleTargetClassSelect(newValue)}
                    options={classes.filter(c => c.id !== selectedClass.id)}
                    getOptionLabel={(option) => option.name}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          ({option.students ? option.students.length : 0} students)
                        </Typography>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Target Class"
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    )}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Impact Preview and Controls */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Adjustment Impact" 
              titleTypographyProps={{ variant: 'subtitle1' }}
              action={
                history.length > 0 && (
                  <Tooltip title="Undo Last Move">
                    <IconButton size="small" onClick={undoLastMove}>
                      <UndoIcon />
                    </IconButton>
                  </Tooltip>
                )
              }
            />
            <Divider />
            <CardContent>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : showImpact && impactPreview ? (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" gutterBottom>
                        Source Class Impact:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: getImpactColor(impactPreview.sourceClass.delta) }}>
                          {impactPreview.sourceClass.delta > 0 ? '+' : ''}
                          {impactPreview.sourceClass.delta.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          ({impactPreview.sourceClass.before.toFixed(1)} → {impactPreview.sourceClass.after.toFixed(1)})
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" gutterBottom>
                        Target Class Impact:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: getImpactColor(impactPreview.targetClass.delta) }}>
                          {impactPreview.targetClass.delta > 0 ? '+' : ''}
                          {impactPreview.targetClass.delta.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          ({impactPreview.targetClass.before.toFixed(1)} → {impactPreview.targetClass.after.toFixed(1)})
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" gutterBottom>
                    Overall Balance Impact:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ color: getImpactColor(impactPreview.overall.delta) }}>
                      {impactPreview.overall.delta > 0 ? '+' : ''}
                      {impactPreview.overall.delta.toFixed(1)}
                    </Typography>
                    <Chip 
                      size="small" 
                      icon={impactPreview.overall.delta >= 0 ? <CheckCircleIcon /> : <WarningIcon />}
                      label={impactPreview.overall.delta >= 0 ? "Recommended" : "Not Recommended"} 
                      color={impactPreview.overall.delta >= 0 ? "success" : "warning"}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  
                  {violatedConstraints.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <AlertTitle>Constraint Violations</AlertTitle>
                      This move would violate {violatedConstraints.length} constraint(s)
                    </Alert>
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      color="inherit"
                      onClick={() => {
                        setShowImpact(false);
                        setTargetClass(null);
                      }}
                      sx={{ mr: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={executeMove}
                      startIcon={<SwapIcon />}
                    >
                      Move Student
                    </Button>
                  </Box>
                </Box>
              ) : selectedStudent && targetClass ? (
                <Typography color="text.secondary">
                  Calculating impact...
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                  <InfoIcon color="disabled" sx={{ fontSize: 40, mb: 2 }} />
                  <Typography color="text.secondary" align="center">
                    Select a source class, student, and target class to see the impact of moving the student
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
          
          {history.length > 0 && (
            <Paper sx={{ mt: 2, p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                <HistoryIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                Recent Adjustments
              </Typography>
              <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                {history.slice().reverse().map((move, index) => (
                  <ListItem key={index} divider={index < history.length - 1}>
                    <ListItemText
                      primary={`${move.student.firstName} ${move.student.lastName}`}
                      secondary={`${move.fromClass.name} → ${move.toClass.name}`}
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(move.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManualAdjustmentInterface; 