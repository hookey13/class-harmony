import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  CardActions,
  Divider,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Badge,
  FormGroup,
  FormControlLabel,
  Checkbox,
  AlertTitle,
  RadioGroup,
  Radio,
  LinearProgress
} from '@mui/material';
import { 
  DragIndicator as DragIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Groups as ClassIcon,
  PersonAdd as AddStudentIcon,
  DeleteOutline as DeleteIcon,
  Edit as EditIcon,
  AutoAwesome as OptimizeIcon,
  FileDownload as ExportIcon,
  SwapHoriz as MoveIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  HelpOutline as HelpOutlineIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useData } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationContext';

const ClassLists = () => {
  const [classLists, setClassLists] = useState([]);
  const [activeClassList, setActiveClassList] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('');
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [optimizationResultsOpen, setOptimizationResultsOpen] = useState(false);
  const [optimizationFactors, setOptimizationFactors] = useState({
    gender: true,
    academicLevel: true,
    behaviorLevel: true,
    specialNeeds: true,
    teacherCompatibility: false,
    parentRequests: false
  });
  
  const {
    classes: contextClasses,
    selectedClassList,
    isLoading,
    classListsLoading,
    classesLoading,
    error: contextError,
    fetchClassLists,
    fetchClassListDetails,
    createClass,
    deleteClass,
    updateClass,
    updateStudentList,
    optimizeClasses
  } = useData();
  
  const { createNotification } = useNotifications();
  
  // Mock data
  const mockGradeLevels = [
    { id: '1', name: 'Grade 1' },
    { id: '2', name: 'Grade 2' },
    { id: '3', name: 'Grade 3' },
    { id: '4', name: 'Grade 4' },
    { id: '5', name: 'Grade 5' },
  ];
  
  const mockClassLists = [
    { id: '1', name: '2023-2024 Class List', gradeLevel: '1', status: 'active' },
    { id: '2', name: '2023-2024 Class List', gradeLevel: '2', status: 'active' },
    { id: '3', name: '2023-2024 Class List', gradeLevel: '3', status: 'draft' },
  ];

  // Initialize with mock data on component mount
  useEffect(() => {
    setClassLists(mockClassLists);
    // If URL has a grade level query param, select it
    const urlParams = new URLSearchParams(window.location.search);
    const gradeParam = urlParams.get('grade');
    if (gradeParam) {
      setSelectedGradeLevel(gradeParam);
      // Find the corresponding class list
      const classList = mockClassLists.find(cl => cl.gradeLevel === gradeParam);
      if (classList) {
        handleClassListSelect(classList.id);
      }
    }
  }, []);

  // Fetch classes when a class list is selected
  const handleClassListSelect = (classListId) => {
    setLoading(true);
    setActiveClassList(classListId);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      // Mock classes data
      const mockClasses = [
        {
          id: 'class1',
          name: 'Class 1A',
          teacher: 'Sarah Johnson',
          students: [
            { id: 's1', firstName: 'John', lastName: 'Smith', gender: 'Male', academicLevel: 'Advanced', behaviorLevel: 'Medium' },
            { id: 's2', firstName: 'Emma', lastName: 'Johnson', gender: 'Female', academicLevel: 'Proficient', behaviorLevel: 'Low' },
            { id: 's3', firstName: 'Michael', lastName: 'Williams', gender: 'Male', academicLevel: 'Basic', behaviorLevel: 'High', specialNeeds: true },
            { id: 's4', firstName: 'Sophia', lastName: 'Davis', gender: 'Female', academicLevel: 'Advanced', behaviorLevel: 'Low' },
            { id: 's5', firstName: 'William', lastName: 'Miller', gender: 'Male', academicLevel: 'Proficient', behaviorLevel: 'Medium' },
          ]
        },
        {
          id: 'class2',
          name: 'Class 1B',
          teacher: 'Robert Chen',
          students: [
            { id: 's6', firstName: 'Olivia', lastName: 'Brown', gender: 'Female', academicLevel: 'Advanced', behaviorLevel: 'Low' },
            { id: 's7', firstName: 'James', lastName: 'Jones', gender: 'Male', academicLevel: 'Proficient', behaviorLevel: 'Medium' },
            { id: 's8', firstName: 'Ava', lastName: 'Garcia', gender: 'Female', academicLevel: 'Basic', behaviorLevel: 'Low' },
            { id: 's9', firstName: 'Alexander', lastName: 'Martinez', gender: 'Male', academicLevel: 'Advanced', behaviorLevel: 'High' },
            { id: 's10', firstName: 'Mia', lastName: 'Robinson', gender: 'Female', academicLevel: 'Proficient', behaviorLevel: 'Medium', specialNeeds: true },
          ]
        },
        {
          id: 'class3',
          name: 'Class 1C',
          teacher: 'Jennifer Taylor',
          students: [
            { id: 's11', firstName: 'Ethan', lastName: 'Clark', gender: 'Male', academicLevel: 'Basic', behaviorLevel: 'High' },
            { id: 's12', firstName: 'Isabella', lastName: 'Rodriguez', gender: 'Female', academicLevel: 'Advanced', behaviorLevel: 'Low' },
            { id: 's13', firstName: 'Daniel', lastName: 'Lee', gender: 'Male', academicLevel: 'Proficient', behaviorLevel: 'Medium' },
            { id: 's14', firstName: 'Charlotte', lastName: 'Walker', gender: 'Female', academicLevel: 'Basic', behaviorLevel: 'Low' },
            { id: 's15', firstName: 'Benjamin', lastName: 'Hall', gender: 'Male', academicLevel: 'Advanced', behaviorLevel: 'High', specialNeeds: true },
          ]
        }
      ];
      
      setClasses(mockClasses);
      setLoading(false);
    }, 1000);
  };

  // Handle drag end for a student
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    // No change
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Find source and destination classes
    const sourceClass = classes.find(c => c.id === source.droppableId);
    const destClass = classes.find(c => c.id === destination.droppableId);
    
    if (!sourceClass || !destClass) return;
    
    // Clone classes to avoid direct state mutation
    const newClasses = [...classes];
    
    // Find moved student
    const movedStudent = sourceClass.students.find(s => s.id === draggableId);
    
    // Update source class (remove student)
    const sourceClassIndex = newClasses.findIndex(c => c.id === source.droppableId);
    newClasses[sourceClassIndex] = {
      ...sourceClass,
      students: sourceClass.students.filter(s => s.id !== draggableId)
    };
    
    // Update destination class (add student)
    const destClassIndex = newClasses.findIndex(c => c.id === destination.droppableId);
    const newDestStudents = [...destClass.students];
    newDestStudents.splice(destination.index, 0, movedStudent);
    
    newClasses[destClassIndex] = {
      ...destClass,
      students: newDestStudents
    };
    
    setClasses(newClasses);
    setSuccess("Student moved successfully.");
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  // Handle menu open
  const handleMenuOpen = (event, classId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedClassId(classId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedClassId(null);
  };

  // Handle optimize dialog open
  const handleOptimizeOpen = () => {
    setOptimizeDialogOpen(true);
    handleMenuClose();
  };

  // Handle optimize dialog close
  const handleOptimizeClose = () => {
    setOptimizeDialogOpen(false);
  };

  // Handle optimize action
  const handleOptimize = () => {
    setLoading(true);
    setOptimizeDialogOpen(false);
    
    // Get optimization factors from selected checkboxes
    const factors = [];
    if (document.getElementById('opt-gender').checked) factors.push('gender');
    if (document.getElementById('opt-academic').checked) factors.push('academicLevel');
    if (document.getElementById('opt-behavior').checked) factors.push('behaviorLevel');
    if (document.getElementById('opt-special').checked) factors.push('specialNeeds');
    if (document.getElementById('opt-teacher').checked) factors.push('teacherCompatibility');
    if (document.getElementById('opt-parent').checked) factors.push('parentRequests');
    
    // Get selected optimization strategy
    const strategy = document.querySelector('input[name="optimization-strategy"]:checked')?.value || 'balanced';
    
    // Call API to optimize classes
    optimizeClasses(selectedClassList.id, factors, strategy)
      .then(result => {
        if (result && result.success) {
          // Show success message
          setSuccess("Classes optimized successfully!");
          
          // Store optimization statistics for display
          setOptimizationResults(result.statistics);
          
          // Open results dialog
          setOptimizationResultsOpen(true);
          
          // Create notification
          createNotification({
            type: 'classOptimization',
            title: 'Class Optimization Complete',
            message: `Successfully optimized ${result.classes?.length || 0} classes for ${selectedClassList?.name || 'class list'}`,
            sendEmail: true,
            emailDetails: {
              subject: 'Class Optimization Complete',
              body: `Your class optimization has completed successfully. The classes have been balanced according to your selected factors: ${factors.join(', ')}.`
            }
          });
        } else {
          setError(result.message || "Failed to optimize classes");
        }
      })
      .catch(err => {
        console.error("Error optimizing classes:", err);
        setError("An error occurred while optimizing classes");
      })
      .finally(() => {
        setLoading(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      });
  };

  // Handle create class dialog open
  const handleCreateDialogOpen = () => {
    setCreateDialogOpen(true);
  };

  // Handle create class dialog close
  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setNewClassName('');
  };

  // Handle create class action
  const handleCreateClass = () => {
    if (!newClassName.trim()) {
      setError("Class name is required");
      return;
    }
    
    // Create new class
    const newClass = {
      id: `class${classes.length + 1}`,
      name: newClassName,
      teacher: '',
      students: []
    };
    
    setClasses([...classes, newClass]);
    setCreateDialogOpen(false);
    setNewClassName('');
    setSuccess("New class created successfully!");
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  // Calculate class statistics
  const getClassStats = (classObj) => {
    const students = classObj.students || [];
    const totalStudents = students.length;
    const maleCount = students.filter(s => s.gender === 'Male').length;
    const femaleCount = students.filter(s => s.gender === 'Female').length;
    const specialNeedsCount = students.filter(s => s.specialNeeds).length;
    
    // Academic level distribution
    const academicLevels = {
      Advanced: students.filter(s => s.academicLevel === 'Advanced').length,
      Proficient: students.filter(s => s.academicLevel === 'Proficient').length,
      Basic: students.filter(s => s.academicLevel === 'Basic').length,
    };
    
    // Behavior level distribution
    const behaviorLevels = {
      High: students.filter(s => s.behaviorLevel === 'High').length,
      Medium: students.filter(s => s.behaviorLevel === 'Medium').length,
      Low: students.filter(s => s.behaviorLevel === 'Low').length,
    };
    
    return {
      totalStudents,
      maleCount,
      femaleCount,
      specialNeedsCount,
      academicLevels,
      behaviorLevels
    };
  };

  // Handle optimization factor change
  const handleOptimizationFactorChange = (event) => {
    setOptimizationFactors({
      ...optimizationFactors,
      [event.target.name]: event.target.checked
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Class Lists
        </Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<OptimizeIcon />}
            onClick={handleOptimizeOpen}
            disabled={!activeClassList || loading}
            sx={{ mr: 1 }}
          >
            Optimize Classes
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
            disabled={!activeClassList || loading}
          >
            Add Class
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Grade Level and Class List
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Grade Level</InputLabel>
                <Select
                  value={selectedGradeLevel}
                  onChange={(e) => {
                    setSelectedGradeLevel(e.target.value);
                    // Reset active class list
                    setActiveClassList(null);
                    setClasses([]);
                  }}
                  label="Grade Level"
                >
                  <MenuItem value="">
                    <em>Select a grade level</em>
                  </MenuItem>
                  {mockGradeLevels.map((grade) => (
                    <MenuItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!selectedGradeLevel}>
                <InputLabel>Class List</InputLabel>
                <Select
                  value={activeClassList || ''}
                  onChange={(e) => handleClassListSelect(e.target.value)}
                  label="Class List"
                >
                  <MenuItem value="">
                    <em>Select a class list</em>
                  </MenuItem>
                  {classLists
                    .filter(cl => cl.gradeLevel === selectedGradeLevel)
                    .map((classList) => (
                      <MenuItem key={classList.id} value={classList.id}>
                        {classList.name}
                        {classList.status === 'draft' && (
                          <Chip 
                            label="Draft" 
                            size="small" 
                            color="warning" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        {activeClassList && !loading && (
          <Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Classes
            </Typography>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Grid container spacing={3}>
                {classes.map((classObj) => {
                  const stats = getClassStats(classObj);
                  
                  return (
                    <Grid item xs={12} md={6} lg={4} key={classObj.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardHeader
                          title={classObj.name}
                          subheader={`Teacher: ${classObj.teacher || 'Unassigned'}`}
                          action={
                            <IconButton
                              onClick={(e) => handleMenuOpen(e, classObj.id)}
                            >
                              <MoreIcon />
                            </IconButton>
                          }
                        />
                        
                        <Divider />
                        
                        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Chip
                                icon={<ClassIcon />}
                                label={`${stats.totalStudents} Students`}
                                variant="outlined"
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <Chip
                                icon={<MaleIcon />}
                                label={stats.maleCount}
                                size="small"
                                sx={{ bgcolor: 'rgba(63, 81, 181, 0.1)' }}
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <Chip
                                icon={<FemaleIcon />}
                                label={stats.femaleCount}
                                size="small"
                                sx={{ bgcolor: 'rgba(233, 30, 99, 0.1)' }}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                        
                        <Divider />
                        
                        <Droppable droppableId={classObj.id}>
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              sx={{
                                p: 1,
                                flexGrow: 1,
                                minHeight: 300,
                                bgcolor: snapshot.isDraggingOver ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
                                transition: 'background-color 0.2s ease',
                                overflow: 'auto'
                              }}
                            >
                              {classObj.students.length === 0 ? (
                                <Box
                                  sx={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'text.secondary',
                                    p: 2,
                                    textAlign: 'center'
                                  }}
                                >
                                  <Typography variant="body2">
                                    Drag and drop students here
                                  </Typography>
                                </Box>
                              ) : (
                                classObj.students.map((student, index) => (
                                  <Draggable
                                    key={student.id}
                                    draggableId={student.id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <Box
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        sx={{
                                          p: 1,
                                          mb: 1,
                                          backgroundColor: snapshot.isDragging ? 'rgba(63, 81, 181, 0.16)' : 'white',
                                          borderRadius: 1,
                                          boxShadow: snapshot.isDragging ? 3 : 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          '&:hover': {
                                            bgcolor: 'rgba(0, 0, 0, 0.04)'
                                          }
                                        }}
                                        className="drag-item"
                                      >
                                        <DragIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                                        <Box sx={{ flexGrow: 1 }}>
                                          <Typography variant="body2">
                                            {student.firstName} {student.lastName}
                                          </Typography>
                                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                            <Chip
                                              label={student.gender}
                                              size="small"
                                              sx={{ 
                                                height: 20,
                                                fontSize: '0.625rem',
                                                mr: 0.5,
                                                bgcolor: student.gender === 'Male' ? 'rgba(63, 81, 181, 0.1)' : 'rgba(233, 30, 99, 0.1)'
                                              }}
                                            />
                                            <Chip
                                              label={student.academicLevel}
                                              size="small"
                                              sx={{ 
                                                height: 20,
                                                fontSize: '0.625rem',
                                                bgcolor: 
                                                  student.academicLevel === 'Advanced' ? 'rgba(76, 175, 80, 0.1)' :
                                                  student.academicLevel === 'Proficient' ? 'rgba(255, 152, 0, 0.1)' :
                                                  'rgba(244, 67, 54, 0.1)',
                                                mr: 0.5
                                              }}
                                            />
                                            {student.specialNeeds && (
                                              <Tooltip title="Special Needs">
                                                <WarningIcon sx={{ color: 'warning.main', fontSize: 16 }} />
                                              </Tooltip>
                                            )}
                                          </Box>
                                        </Box>
                                      </Box>
                                    )}
                                  </Draggable>
                                ))
                              )}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                        
                        <Divider />
                        
                        <CardActions>
                          <Typography variant="caption" color="text.secondary">
                            Drag students to rearrange
                          </Typography>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </DragDropContext>
          </Box>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {!activeClassList && !loading && selectedGradeLevel && (
          <Alert severity="info">
            Please select a class list to view and edit classes.
          </Alert>
        )}
        
        {!selectedGradeLevel && !loading && (
          <Alert severity="info">
            Please select a grade level to view available class lists.
          </Alert>
        )}
      </Paper>
      
      {/* Class options menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Class</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AddStudentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Student</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOptimizeOpen}>
          <ListItemIcon>
            <OptimizeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Balance Class</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete Class</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Optimize dialog */}
      <Dialog 
        open={optimizeDialogOpen} 
        onClose={handleOptimizeClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Optimize Class Distribution</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will automatically redistribute students to create balanced classes based on your selected factors:
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Optimization Factors:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel 
                  control={
                    <Checkbox 
                      defaultChecked 
                      id="opt-gender" 
                      name="gender"
                      checked={optimizationFactors.gender}
                      onChange={handleOptimizationFactorChange}
                    />
                  } 
                  label="Gender Balance" 
                />
                <Tooltip title="Distribute male and female students evenly across classes">
                  <IconButton size="small">
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel 
                  control={
                    <Checkbox 
                      defaultChecked 
                      id="opt-academic" 
                      name="academicLevel"
                      checked={optimizationFactors.academicLevel}
                      onChange={handleOptimizationFactorChange}
                    />
                  } 
                  label="Academic Level" 
                />
                <Tooltip title="Balance advanced, proficient, and basic students across classes">
                  <IconButton size="small">
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel 
                  control={
                    <Checkbox 
                      defaultChecked 
                      id="opt-behavior" 
                      name="behaviorLevel"
                      checked={optimizationFactors.behaviorLevel}
                      onChange={handleOptimizationFactorChange}
                    />
                  } 
                  label="Behavior Level" 
                />
                <Tooltip title="Distribute students with high, medium, and low behavior needs evenly">
                  <IconButton size="small">
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel 
                  control={
                    <Checkbox 
                      defaultChecked 
                      id="opt-special" 
                      name="specialNeeds"
                      checked={optimizationFactors.specialNeeds}
                      onChange={handleOptimizationFactorChange}
                    />
                  } 
                  label="Special Needs" 
                />
                <Tooltip title="Ensure students with special needs are distributed appropriately">
                  <IconButton size="small">
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel 
                  control={
                    <Checkbox 
                      id="opt-teacher" 
                      name="teacherCompatibility"
                      checked={optimizationFactors.teacherCompatibility}
                      onChange={handleOptimizationFactorChange}
                    />
                  } 
                  label="Teacher Compatibility" 
                />
                <Tooltip title="Consider teacher survey data about student compatibility">
                  <IconButton size="small">
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel 
                  control={
                    <Checkbox 
                      id="opt-parent" 
                      name="parentRequests"
                      checked={optimizationFactors.parentRequests}
                      onChange={handleOptimizationFactorChange}
                    />
                  } 
                  label="Parent Requests" 
                />
                <Tooltip title="Try to honor approved parent requests for teacher or classmate placement">
                  <IconButton size="small">
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom color="primary">
              Optimization Strategy
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup defaultValue="balanced" name="optimization-strategy">
                <FormControlLabel 
                  value="balanced" 
                  control={<Radio />} 
                  label="Balanced (Equal weight to all factors)" 
                />
                <FormControlLabel 
                  value="academic" 
                  control={<Radio />} 
                  label="Academic Focus (Prioritize academic balance)" 
                />
                <FormControlLabel 
                  value="behavior" 
                  control={<Radio />} 
                  label="Behavior Focus (Prioritize behavior management)" 
                />
                <FormControlLabel 
                  value="requests" 
                  control={<Radio />} 
                  label="Request Priority (Honor as many requests as possible)" 
                />
              </RadioGroup>
            </FormControl>
          </Box>
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            <AlertTitle>Important Note</AlertTitle>
            This action will override manual student assignments. Teacher assignments will remain unchanged.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOptimizeClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleOptimize}
            startIcon={<OptimizeIcon />}
            color="primary"
            autoFocus
          >
            Optimize Classes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Optimization Results Dialog */}
      <Dialog
        open={optimizationResultsOpen}
        onClose={() => setOptimizationResultsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            Optimization Complete
          </Box>
        </DialogTitle>
        <DialogContent>
          {optimizationResults && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader 
                      title="Class Distribution" 
                      subheader={`${optimizationResults.totalStudents} students across ${optimizationResults.classCount} classes`}
                    />
                    <CardContent>
                      <Typography variant="h4" component="div" sx={{ mb: 2, textAlign: 'center' }}>
                        {optimizationResults.averageClassSize}
                        <Typography variant="body2" color="text.secondary">
                          Average class size
                        </Typography>
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Students successfully placed: {optimizationResults.studentsPlaced} 
                        ({Math.round((optimizationResults.studentsPlaced / optimizationResults.totalStudents) * 100)}%)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {optimizationResults.genderBalance && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardHeader 
                        title="Gender Balance" 
                        subheader="Score per class (higher is better)" 
                      />
                      <CardContent>
                        {optimizationResults.genderBalance.map((score, index) => (
                          <Box key={`gender-${index}`} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              Class {index + 1}
                            </Typography>
                            <Box display="flex" alignItems="center">
                              <LinearProgress
                                variant="determinate"
                                value={score}
                                sx={{
                                  height: 10,
                                  borderRadius: 5,
                                  width: '100%',
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: score > 80 ? 'success.main' : 
                                                    score > 60 ? 'warning.main' : 'error.main'
                                  }
                                }}
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1, minWidth: 30 }}>
                                {score}%
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {optimizationResults.academicBalance && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardHeader 
                        title="Academic Balance" 
                        subheader="Distribution of academic levels" 
                      />
                      <CardContent>
                        {optimizationResults.academicBalance.map((score, index) => (
                          <Box key={`academic-${index}`} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              Class {index + 1}
                            </Typography>
                            <Box display="flex" alignItems="center">
                              <LinearProgress
                                variant="determinate"
                                value={score}
                                sx={{
                                  height: 10,
                                  borderRadius: 5,
                                  width: '100%',
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: score > 80 ? 'success.main' : 
                                                    score > 60 ? 'warning.main' : 'error.main'
                                  }
                                }}
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1, minWidth: 30 }}>
                                {score}%
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {optimizationResults.behaviorBalance && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardHeader 
                        title="Behavior Balance" 
                        subheader="Distribution of behavior needs" 
                      />
                      <CardContent>
                        {optimizationResults.behaviorBalance.map((score, index) => (
                          <Box key={`behavior-${index}`} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              Class {index + 1}
                            </Typography>
                            <Box display="flex" alignItems="center">
                              <LinearProgress
                                variant="determinate"
                                value={score}
                                sx={{
                                  height: 10,
                                  borderRadius: 5,
                                  width: '100%',
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: score > 80 ? 'success.main' : 
                                                    score > 60 ? 'warning.main' : 'error.main'
                                  }
                                }}
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1, minWidth: 30 }}>
                                {score}%
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {optimizationResults.requestsFulfilled !== null && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardHeader 
                        title="Parent Requests" 
                        subheader="Percentage of fulfilled requests" 
                      />
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box
                          sx={{
                            position: 'relative',
                            display: 'inline-flex',
                            width: 150,
                            height: 150,
                            mb: 2
                          }}
                        >
                          <CircularProgress
                            variant="determinate"
                            value={optimizationResults.requestsFulfilled}
                            size={150}
                            thickness={5}
                            sx={{
                              color: optimizationResults.requestsFulfilled > 80 ? 'success.main' : 
                                    optimizationResults.requestsFulfilled > 60 ? 'warning.main' : 'error.main'
                            }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="h4" component="div" color="text.secondary">
                              {optimizationResults.requestsFulfilled}%
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Alert severity="info">
                  <AlertTitle>Next Steps</AlertTitle>
                  <Typography variant="body2">
                    Review the class placements and make any needed adjustments. You can manually drag and drop 
                    students between classes if necessary.
                  </Typography>
                </Alert>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOptimizationResultsOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setOptimizationResultsOpen(false)}
            startIcon={<EditIcon />}
          >
            Review Classes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Create class dialog */}
      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose}>
        <DialogTitle>Create New Class</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for the new class. You can assign a teacher and add students later.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Class Name"
            fullWidth
            variant="outlined"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateClass}
            startIcon={<AddIcon />}
          >
            Create Class
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassLists; 