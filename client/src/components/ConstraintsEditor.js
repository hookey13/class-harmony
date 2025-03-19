import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Autocomplete,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Balance as BalanceIcon,
  EqualRound as EqualRoundIcon,
  HighPriority as HighPriorityIcon,
  MediumPriority as MediumPriorityIcon,
  LowPriority as LowPriorityIcon,
  ExpandMore as ExpandMoreIcon,
  People as PeopleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { CONSTRAINT_TYPES, CONSTRAINT_PRIORITIES } from '../services/constraintService';
import api from '../services/api';

const ConstraintsEditor = ({ academicYear, grade, onConstraintsChange }) => {
  const theme = useTheme();
  
  const [constraints, setConstraints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentConstraint, setCurrentConstraint] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // New constraint form state
  const [formData, setFormData] = useState({
    type: '',
    priority: 'medium',
    students: [],
    student: '',
    teacher: '',
    factor: '',
    reason: ''
  });
  
  // Fetch constraints when component mounts or academicYear/grade changes
  useEffect(() => {
    if (academicYear && grade) {
      fetchConstraints();
      fetchStudents();
      fetchTeachers();
    }
  }, [academicYear, grade]);
  
  const fetchConstraints = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/constraints?academicYear=${academicYear}&grade=${grade}`);
      setConstraints(response.data);
      if (onConstraintsChange) {
        onConstraintsChange(response.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching constraints:', err);
      setError('Failed to load constraints. Please try again.');
      setLoading(false);
    }
  };
  
  const fetchStudents = async () => {
    try {
      const response = await api.get(`/api/students?academicYear=${academicYear}&grade=${grade}`);
      setStudents(response.data);
    } catch (err) {
      console.error('Error fetching students:', err);
      // Don't set error state, as this is a secondary fetch
    }
  };
  
  const fetchTeachers = async () => {
    try {
      const response = await api.get('/api/users/teachers');
      setTeachers(response.data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      // Don't set error state, as this is a secondary fetch
    }
  };
  
  const handleCreateConstraint = async () => {
    try {
      setLoading(true);
      
      const constraintData = {
        academicYear,
        grade,
        type: formData.type,
        priority: formData.priority,
        reason: formData.reason
      };
      
      // Add type-specific data
      if (formData.type === CONSTRAINT_TYPES.MUST_BE_TOGETHER || formData.type === CONSTRAINT_TYPES.MUST_BE_SEPARATE) {
        constraintData.students = formData.students;
      } else if (formData.type === CONSTRAINT_TYPES.PREFERRED_TEACHER || formData.type === CONSTRAINT_TYPES.AVOID_TEACHER) {
        constraintData.student = formData.student;
        constraintData.teacher = formData.teacher;
      } else if (formData.type === CONSTRAINT_TYPES.BALANCED_DISTRIBUTION) {
        constraintData.factor = formData.factor;
      }
      
      const response = await api.post('/api/constraints', constraintData);
      
      // Add the new constraint to the state
      setConstraints(prevConstraints => [...prevConstraints, response.data]);
      
      // Notify parent component
      if (onConstraintsChange) {
        onConstraintsChange([...constraints, response.data]);
      }
      
      // Reset form and close dialog
      setFormData({
        type: '',
        priority: 'medium',
        students: [],
        student: '',
        teacher: '',
        factor: '',
        reason: ''
      });
      setCreateDialogOpen(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Constraint created successfully',
        severity: 'success'
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error creating constraint:', err);
      setError('Failed to create constraint. Please try again.');
      setLoading(false);
      
      // Show error message
      setSnackbar({
        open: true,
        message: 'Failed to create constraint',
        severity: 'error'
      });
    }
  };
  
  const handleUpdateConstraint = async () => {
    try {
      setLoading(true);
      
      const constraintData = {
        priority: formData.priority,
        reason: formData.reason
      };
      
      // Add type-specific data
      if (currentConstraint.type === CONSTRAINT_TYPES.MUST_BE_TOGETHER || currentConstraint.type === CONSTRAINT_TYPES.MUST_BE_SEPARATE) {
        constraintData.students = formData.students;
      } else if (currentConstraint.type === CONSTRAINT_TYPES.PREFERRED_TEACHER || currentConstraint.type === CONSTRAINT_TYPES.AVOID_TEACHER) {
        constraintData.student = formData.student;
        constraintData.teacher = formData.teacher;
      } else if (currentConstraint.type === CONSTRAINT_TYPES.BALANCED_DISTRIBUTION) {
        constraintData.factor = formData.factor;
      }
      
      const response = await api.put(`/api/constraints/${currentConstraint._id}`, constraintData);
      
      // Update the constraint in the state
      setConstraints(prevConstraints => 
        prevConstraints.map(c => c._id === currentConstraint._id ? response.data : c)
      );
      
      // Notify parent component
      if (onConstraintsChange) {
        onConstraintsChange(constraints.map(c => c._id === currentConstraint._id ? response.data : c));
      }
      
      // Reset form and close dialog
      setCurrentConstraint(null);
      setEditDialogOpen(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Constraint updated successfully',
        severity: 'success'
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating constraint:', err);
      setError('Failed to update constraint. Please try again.');
      setLoading(false);
      
      // Show error message
      setSnackbar({
        open: true,
        message: 'Failed to update constraint',
        severity: 'error'
      });
    }
  };
  
  const handleDeleteConstraint = async (id) => {
    try {
      setLoading(true);
      
      await api.delete(`/api/constraints/${id}`);
      
      // Remove the constraint from the state
      setConstraints(prevConstraints => prevConstraints.filter(c => c._id !== id));
      
      // Notify parent component
      if (onConstraintsChange) {
        onConstraintsChange(constraints.filter(c => c._id !== id));
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Constraint removed successfully',
        severity: 'success'
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error deleting constraint:', err);
      setError('Failed to delete constraint. Please try again.');
      setLoading(false);
      
      // Show error message
      setSnackbar({
        open: true,
        message: 'Failed to delete constraint',
        severity: 'error'
      });
    }
  };
  
  const handleOpenCreateDialog = () => {
    setFormData({
      type: '',
      priority: 'medium',
      students: [],
      student: '',
      teacher: '',
      factor: '',
      reason: ''
    });
    setCreateDialogOpen(true);
  };
  
  const handleOpenEditDialog = (constraint) => {
    setCurrentConstraint(constraint);
    
    const formValues = {
      priority: constraint.priority,
      reason: constraint.reason || '',
      students: constraint.students?.map(s => s._id) || [],
      student: constraint.student?._id || '',
      teacher: constraint.teacher?._id || '',
      factor: constraint.factor || ''
    };
    
    setFormData(formValues);
    setEditDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setCurrentConstraint(null);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleStudentsChange = (event, newValue) => {
    setFormData({ ...formData, students: newValue.map(student => student._id) });
  };
  
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Helper function to get constraint type icon
  const getConstraintTypeIcon = (type) => {
    switch (type) {
      case CONSTRAINT_TYPES.MUST_BE_TOGETHER:
        return <LinkIcon />;
      case CONSTRAINT_TYPES.MUST_BE_SEPARATE:
        return <LinkOffIcon />;
      case CONSTRAINT_TYPES.PREFERRED_TEACHER:
        return <SchoolIcon />;
      case CONSTRAINT_TYPES.AVOID_TEACHER:
        return <SchoolIcon color="error" />;
      case CONSTRAINT_TYPES.BALANCED_DISTRIBUTION:
        return <BalanceIcon />;
      case CONSTRAINT_TYPES.EQUAL_CLASS_SIZE:
        return <PeopleIcon />;
      default:
        return <WarningIcon />;
    }
  };
  
  // Helper function to get constraint type label
  const getConstraintTypeLabel = (type) => {
    switch (type) {
      case CONSTRAINT_TYPES.MUST_BE_TOGETHER:
        return 'Must Be Together';
      case CONSTRAINT_TYPES.MUST_BE_SEPARATE:
        return 'Must Be Separate';
      case CONSTRAINT_TYPES.PREFERRED_TEACHER:
        return 'Preferred Teacher';
      case CONSTRAINT_TYPES.AVOID_TEACHER:
        return 'Avoid Teacher';
      case CONSTRAINT_TYPES.BALANCED_DISTRIBUTION:
        return 'Balanced Distribution';
      case CONSTRAINT_TYPES.EQUAL_CLASS_SIZE:
        return 'Equal Class Size';
      default:
        return type;
    }
  };
  
  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case CONSTRAINT_PRIORITIES.REQUIRED:
        return theme.palette.error.main;
      case CONSTRAINT_PRIORITIES.HIGH:
        return theme.palette.warning.main;
      case CONSTRAINT_PRIORITIES.MEDIUM:
        return theme.palette.info.main;
      case CONSTRAINT_PRIORITIES.LOW:
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  
  // Helper function to get constraint description
  const getConstraintDescription = (constraint) => {
    switch (constraint.type) {
      case CONSTRAINT_TYPES.MUST_BE_TOGETHER:
        return `${constraint.students.map(s => `${s.firstName} ${s.lastName}`).join(', ')} must be in the same class`;
      case CONSTRAINT_TYPES.MUST_BE_SEPARATE:
        return `${constraint.students.map(s => `${s.firstName} ${s.lastName}`).join(', ')} must be in different classes`;
      case CONSTRAINT_TYPES.PREFERRED_TEACHER:
        return `${constraint.student.firstName} ${constraint.student.lastName} should be with ${constraint.teacher.name}`;
      case CONSTRAINT_TYPES.AVOID_TEACHER:
        return `${constraint.student.firstName} ${constraint.student.lastName} should not be with ${constraint.teacher.name}`;
      case CONSTRAINT_TYPES.BALANCED_DISTRIBUTION:
        return `Classes should be balanced by ${constraint.factor.replace('_', ' ')}`;
      case CONSTRAINT_TYPES.EQUAL_CLASS_SIZE:
        return 'Classes should have approximately equal size';
      default:
        return 'Unknown constraint type';
    }
  };
  
  // Render form fields based on constraint type
  const renderFormFields = () => {
    switch (formData.type || (currentConstraint && currentConstraint.type)) {
      case CONSTRAINT_TYPES.MUST_BE_TOGETHER:
      case CONSTRAINT_TYPES.MUST_BE_SEPARATE:
        return (
          <Autocomplete
            multiple
            options={students}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
            value={students.filter(student => formData.students.includes(student._id))}
            onChange={handleStudentsChange}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Students"
                placeholder="Select at least two students"
                required
                fullWidth
                margin="normal"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={`${option.firstName} ${option.lastName}`}
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        );
      case CONSTRAINT_TYPES.PREFERRED_TEACHER:
      case CONSTRAINT_TYPES.AVOID_TEACHER:
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Student</InputLabel>
              <Select
                name="student"
                value={formData.student}
                onChange={handleFormChange}
                required
              >
                <MenuItem value="">
                  <em>Select a student</em>
                </MenuItem>
                {students.map((student) => (
                  <MenuItem key={student._id} value={student._id}>
                    {student.firstName} {student.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Teacher</InputLabel>
              <Select
                name="teacher"
                value={formData.teacher}
                onChange={handleFormChange}
                required
              >
                <MenuItem value="">
                  <em>Select a teacher</em>
                </MenuItem>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );
      case CONSTRAINT_TYPES.BALANCED_DISTRIBUTION:
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>Factor</InputLabel>
            <Select
              name="factor"
              value={formData.factor}
              onChange={handleFormChange}
              required
            >
              <MenuItem value="">
                <em>Select a factor</em>
              </MenuItem>
              <MenuItem value="gender">Gender</MenuItem>
              <MenuItem value="academic_level">Academic Level</MenuItem>
              <MenuItem value="behavioral_level">Behavioral Level</MenuItem>
              <MenuItem value="special_needs">Special Needs</MenuItem>
            </Select>
          </FormControl>
        );
      case CONSTRAINT_TYPES.EQUAL_CLASS_SIZE:
        // No additional fields needed
        return null;
      default:
        return null;
    }
  };
  
  // Group constraints by type for display
  const groupedConstraints = {};
  constraints.forEach(constraint => {
    if (!groupedConstraints[constraint.type]) {
      groupedConstraints[constraint.type] = [];
    }
    groupedConstraints[constraint.type].push(constraint);
  });
  
  if (loading && constraints.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Optimization Constraints</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add Constraint
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {constraints.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            No constraints defined yet
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Add constraints to control how students are placed into classes
          </Typography>
        </Box>
      ) : (
        Object.entries(groupedConstraints).map(([type, constraintsOfType]) => (
          <Accordion key={type} defaultExpanded sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getConstraintTypeIcon(type)}
                </ListItemIcon>
                <Typography variant="subtitle1">
                  {getConstraintTypeLabel(type)} ({constraintsOfType.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {constraintsOfType.map((constraint) => (
                  <ListItem key={constraint._id}>
                    <ListItemText
                      primary={getConstraintDescription(constraint)}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textSecondary"
                          >
                            Priority: 
                            <Chip 
                              size="small"
                              label={constraint.priority}
                              sx={{ 
                                ml: 1, 
                                color: getPriorityColor(constraint.priority),
                                borderColor: getPriorityColor(constraint.priority),
                                fontWeight: 'medium'
                              }}
                              variant="outlined"
                            />
                          </Typography>
                          {constraint.reason && (
                            <Typography
                              component="span"
                              variant="body2"
                              color="textSecondary"
                              sx={{ display: 'block' }}
                            >
                              Reason: {constraint.reason}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Edit">
                        <IconButton edge="end" onClick={() => handleOpenEditDialog(constraint)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton edge="end" color="error" onClick={() => handleDeleteConstraint(constraint._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      )}
      
      {/* Create Constraint Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Constraint</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Constraint Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleFormChange}
              required
            >
              <MenuItem value="">
                <em>Select a constraint type</em>
              </MenuItem>
              <MenuItem value={CONSTRAINT_TYPES.MUST_BE_TOGETHER}>Must Be Together</MenuItem>
              <MenuItem value={CONSTRAINT_TYPES.MUST_BE_SEPARATE}>Must Be Separate</MenuItem>
              <MenuItem value={CONSTRAINT_TYPES.PREFERRED_TEACHER}>Preferred Teacher</MenuItem>
              <MenuItem value={CONSTRAINT_TYPES.AVOID_TEACHER}>Avoid Teacher</MenuItem>
              <MenuItem value={CONSTRAINT_TYPES.BALANCED_DISTRIBUTION}>Balanced Distribution</MenuItem>
              <MenuItem value={CONSTRAINT_TYPES.EQUAL_CLASS_SIZE}>Equal Class Size</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleFormChange}
              required
            >
              <MenuItem value={CONSTRAINT_PRIORITIES.REQUIRED}>Required</MenuItem>
              <MenuItem value={CONSTRAINT_PRIORITIES.HIGH}>High</MenuItem>
              <MenuItem value={CONSTRAINT_PRIORITIES.MEDIUM}>Medium</MenuItem>
              <MenuItem value={CONSTRAINT_PRIORITIES.LOW}>Low</MenuItem>
            </Select>
          </FormControl>
          
          {formData.type && renderFormFields()}
          
          <TextField
            name="reason"
            label="Reason (Optional)"
            value={formData.reason}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateConstraint} 
            color="primary" 
            variant="contained"
            disabled={!formData.type || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Constraint Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Constraint</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {currentConstraint && getConstraintTypeLabel(currentConstraint.type)}
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleFormChange}
              required
            >
              <MenuItem value={CONSTRAINT_PRIORITIES.REQUIRED}>Required</MenuItem>
              <MenuItem value={CONSTRAINT_PRIORITIES.HIGH}>High</MenuItem>
              <MenuItem value={CONSTRAINT_PRIORITIES.MEDIUM}>Medium</MenuItem>
              <MenuItem value={CONSTRAINT_PRIORITIES.LOW}>Low</MenuItem>
            </Select>
          </FormControl>
          
          {currentConstraint && renderFormFields()}
          
          <TextField
            name="reason"
            label="Reason (Optional)"
            value={formData.reason}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateConstraint} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ConstraintsEditor; 