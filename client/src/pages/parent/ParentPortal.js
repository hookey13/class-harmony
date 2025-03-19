import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Snackbar,
  Tab,
  Tabs,
  Rating,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useData } from '../../contexts/DataContext';

// Custom TabPanel component for tab content
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`parent-tabpanel-${index}`}
      aria-labelledby={`parent-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ParentPortal = () => {
  const {
    user,
    students,
    teachers,
    classes,
    isLoading,
    error: dataError,
    fetchStudents,
    fetchTeachers,
    fetchClasses,
    submitParentPreferences,
  } = useData();

  // State for active tab
  const [activeTab, setActiveTab] = useState(0);

  // State for student preferences
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // State for preference dialog
  const [preferenceDialog, setPreferenceDialog] = useState({
    open: false,
    studentId: null,
    type: null,
  });

  // Get current user's children
  const userChildren = students.filter(student => student.parentId === user?.id);

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchStudents();
      fetchTeachers();
      fetchClasses();
    }
  }, [user, fetchStudents, fetchTeachers, fetchClasses]);

  // Initialize preferences for each child
  useEffect(() => {
    const initialPreferences = {};
    userChildren.forEach(child => {
      initialPreferences[child.id] = {
        learningStyle: '',
        teacherPreferences: [],
        peerPreferences: [],
        additionalNotes: '',
        specialConsiderations: [],
      };
    });
    setPreferences(initialPreferences);
  }, [userChildren]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Open preference dialog
  const handleOpenPreferenceDialog = (studentId, type) => {
    setPreferenceDialog({
      open: true,
      studentId,
      type,
    });
  };

  // Close preference dialog
  const handleClosePreferenceDialog = () => {
    setPreferenceDialog({
      open: false,
      studentId: null,
      type: null,
    });
  };

  // Add preference
  const handleAddPreference = (studentId, type, value) => {
    setPreferences(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [type]: Array.isArray(prev[studentId][type])
          ? [...prev[studentId][type], value]
          : value,
      },
    }));
    handleClosePreferenceDialog();
  };

  // Remove preference
  const handleRemovePreference = (studentId, type, index) => {
    setPreferences(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [type]: prev[studentId][type].filter((_, i) => i !== index),
      },
    }));
  };

  // Handle notes change
  const handleNotesChange = (studentId, value) => {
    setPreferences(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        additionalNotes: value,
      },
    }));
  };

  // Submit preferences
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await submitParentPreferences({
        parentId: user.id,
        preferences,
      });

      if (result.success) {
        setSuccess(true);
        setSnackbar({
          open: true,
          message: 'Preferences submitted successfully!',
          severity: 'success',
        });
      } else {
        throw new Error(result.error || 'Failed to submit preferences');
      }
    } catch (err) {
      setError(`Failed to submit preferences: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Render student preferences form
  const renderPreferencesForm = (student) => (
    <Card key={student.id} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {student.firstName} {student.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Grade {student.grade} • Student ID: {student.id}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Learning Style</InputLabel>
              <Select
                value={preferences[student.id]?.learningStyle || ''}
                onChange={(e) => handleAddPreference(student.id, 'learningStyle', e.target.value)}
                label="Learning Style"
              >
                <MenuItem value="visual">Visual Learner</MenuItem>
                <MenuItem value="auditory">Auditory Learner</MenuItem>
                <MenuItem value="kinesthetic">Kinesthetic Learner</MenuItem>
                <MenuItem value="mixed">Mixed Learning Style</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Teacher Preferences
              </Typography>
              <List dense>
                {preferences[student.id]?.teacherPreferences.map((pref, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={pref.teacherName} secondary={pref.reason} />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleRemovePreference(student.id, 'teacherPreferences', index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenPreferenceDialog(student.id, 'teacherPreferences')}
              >
                Add Teacher Preference
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Peer Preferences
              </Typography>
              <List dense>
                {preferences[student.id]?.peerPreferences.map((pref, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={pref.studentName}
                      secondary={`Preference: ${pref.type === 'together' ? 'Place together' : 'Keep separate'}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleRemovePreference(student.id, 'peerPreferences', index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenPreferenceDialog(student.id, 'peerPreferences')}
              >
                Add Peer Preference
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Special Considerations
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="Any special needs, accommodations, or other important information..."
                value={preferences[student.id]?.additionalNotes || ''}
                onChange={(e) => handleNotesChange(student.id, e.target.value)}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Render placement status
  const renderPlacementStatus = (student) => {
    const placement = classes.find(c => c.studentIds?.includes(student.id));
    const status = placement ? 'placed' : 'pending';

    return (
      <Card key={student.id} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {student.firstName} {student.lastName}
            </Typography>
            <Chip
              label={status === 'placed' ? 'Placed' : 'Pending'}
              color={status === 'placed' ? 'success' : 'warning'}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>

          {status === 'placed' && placement ? (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Class Assignment
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Teacher:</strong> {placement.teacherName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Room:</strong> {placement.roomNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Class Size:</strong> {placement.studentIds.length} students
                    </Typography>
                    <Typography variant="body2">
                      <strong>Schedule:</strong> {placement.schedule}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          ) : (
            <Alert severity="info">
              Class placement is pending. You will be notified when the assignment is made.
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  // Preference Dialog Content
  const PreferenceDialog = () => {
    const [selectedValue, setSelectedValue] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
      if (preferenceDialog.type === 'teacherPreferences') {
        const teacher = teachers.find(t => t.id === selectedValue);
        handleAddPreference(preferenceDialog.studentId, 'teacherPreferences', {
          teacherId: selectedValue,
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          reason,
        });
      } else if (preferenceDialog.type === 'peerPreferences') {
        const peer = students.find(s => s.id === selectedValue);
        handleAddPreference(preferenceDialog.studentId, 'peerPreferences', {
          studentId: selectedValue,
          studentName: `${peer.firstName} ${peer.lastName}`,
          type: reason,
        });
      }
    };

    return (
      <Dialog open={preferenceDialog.open} onClose={handleClosePreferenceDialog}>
        <DialogTitle>
          Add {preferenceDialog.type === 'teacherPreferences' ? 'Teacher' : 'Peer'} Preference
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>
              Select {preferenceDialog.type === 'teacherPreferences' ? 'Teacher' : 'Student'}
            </InputLabel>
            <Select
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              label={`Select ${preferenceDialog.type === 'teacherPreferences' ? 'Teacher' : 'Student'}`}
            >
              {preferenceDialog.type === 'teacherPreferences'
                ? teachers.map(teacher => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </MenuItem>
                  ))
                : students
                    .filter(s => s.id !== preferenceDialog.studentId)
                    .map(student => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </MenuItem>
                    ))}
            </Select>
          </FormControl>

          {preferenceDialog.type === 'teacherPreferences' ? (
            <TextField
              fullWidth
              label="Reason for preference"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              rows={2}
            />
          ) : (
            <FormControl fullWidth>
              <InputLabel>Preference Type</InputLabel>
              <Select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                label="Preference Type"
              >
                <MenuItem value="together">Place Together</MenuItem>
                <MenuItem value="separate">Keep Separate</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreferenceDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!selectedValue || !reason}
          >
            Add Preference
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Parent Portal
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your children's class preferences and view placement status
      </Typography>

      {/* Error display */}
      {(error || dataError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || dataError}
        </Alert>
      )}

      {/* Loading state */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : userChildren.length === 0 ? (
        <Alert severity="info">
          No children found. Please contact the school administration if this is incorrect.
        </Alert>
      ) : (
        <>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Preferences" />
              <Tab label="Placement Status" />
            </Tabs>
          </Box>

          {/* Preferences Tab */}
          <TabPanel value={activeTab} index={0}>
            {userChildren.map(student => renderPreferencesForm(student))}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || success}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Saving...' : success ? 'Saved' : 'Save Preferences'}
              </Button>
            </Box>
          </TabPanel>

          {/* Placement Status Tab */}
          <TabPanel value={activeTab} index={1}>
            {userChildren.map(student => renderPlacementStatus(student))}
          </TabPanel>

          {/* Preference Dialog */}
          <PreferenceDialog />

          {/* Success snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            message={snackbar.message}
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setSnackbar({ ...snackbar, open: false })}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            }
          />
        </>
      )}
    </Box>
  );
};

export default ParentPortal; 