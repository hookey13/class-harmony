import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Divider,
  Typography,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Slider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Accessibility as AccessibilityIcon,
  People as PeopleIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon
} from '@mui/icons-material';

/**
 * Form for adding or editing a student profile
 * @param {Object} student - Student data for editing (undefined for new student)
 * @param {Function} onSave - Function to call when saving the form
 * @param {Function} onCancel - Function to call when cancelling the form
 * @param {Array} gradeOptions - Available grade options
 * @param {Array} teacherOptions - Available teacher options
 * @param {Boolean} isLoading - Whether the form is in loading state
 * @param {String} error - Error message if any
 * @returns {JSX.Element}
 */
const StudentProfileForm = ({
  student,
  onSave,
  onCancel,
  gradeOptions = ['K', '1', '2', '3', '4', '5', '6'],
  teacherOptions = [],
  isLoading = false,
  error = ''
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    gender: '',
    dateOfBirth: null,
    academicLevel: 'Proficient',
    behaviorLevel: 'Medium',
    specialNeeds: false,
    additionalInfo: '',
    // Subject proficiency
    subjectProficiency: {
      mathematics: 70,
      reading: 70,
      science: 70,
      socialStudies: 70,
      writing: 70
    },
    // Special needs & accommodations
    accommodations: [],
    iepInfo: {
      status: 'None',
      lastReviewDate: null,
      nextReviewDate: null,
      caseManager: '',
      notes: ''
    },
    // Parents/guardians
    parents: []
  });

  // Validation state
  const [errors, setErrors] = useState({});
  
  // Parent dialog state
  const [parentDialogOpen, setParentDialogOpen] = useState(false);
  const [currentParent, setCurrentParent] = useState(null);
  const [parentIndex, setParentIndex] = useState(-1);
  
  // Accommodation dialog state
  const [accommodationDialogOpen, setAccommodationDialogOpen] = useState(false);
  const [currentAccommodation, setCurrentAccommodation] = useState(null);
  const [accommodationIndex, setAccommodationIndex] = useState(-1);

  // Accordion expansion state
  const [expandedSection, setExpandedSection] = useState('personal');

  // Load student data if editing
  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
        iepInfo: {
          ...student.iepInfo,
          lastReviewDate: student.iepInfo?.lastReviewDate ? new Date(student.iepInfo.lastReviewDate) : null,
          nextReviewDate: student.iepInfo?.nextReviewDate ? new Date(student.iepInfo.nextReviewDate) : null,
        },
        // Ensure these arrays exist
        parents: student.parents || [],
        accommodations: student.accommodations || [],
        subjectProficiency: student.subjectProficiency || {
          mathematics: 70,
          reading: 70,
          science: 70,
          socialStudies: 70,
          writing: 70
        }
      });
    }
  }, [student]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Format data for submission
    const formattedData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null,
      iepInfo: {
        ...formData.iepInfo,
        lastReviewDate: formData.iepInfo.lastReviewDate ? formData.iepInfo.lastReviewDate.toISOString() : null,
        nextReviewDate: formData.iepInfo.nextReviewDate ? formData.iepInfo.nextReviewDate.toISOString() : null,
      }
    };
    
    // Call save handler
    onSave(formattedData);
  };

  // Validate form data
  const validateForm = (data) => {
    const errors = {};
    
    if (!data.firstName) errors.firstName = 'First name is required';
    if (!data.lastName) errors.lastName = 'Last name is required';
    if (!data.grade) errors.grade = 'Grade is required';
    
    // Parent validation
    data.parents.forEach((parent, index) => {
      if (!parent.firstName) {
        errors[`parent_${index}_firstName`] = 'Parent first name is required';
      }
      if (!parent.lastName) {
        errors[`parent_${index}_lastName`] = 'Parent last name is required';
      }
      if (parent.email && !/\S+@\S+\.\S+/.test(parent.email)) {
        errors[`parent_${index}_email`] = 'Invalid email format';
      }
    });
    
    return errors;
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handle special case of checkbox/switch
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    // Month is 0-indexed in JS, so add 1 and pad with 0 if needed
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Parse date from input field
  const parseInputDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  // Replace handleDateChange function
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields (like iepInfo.lastReviewDate)
    if (name.includes('IepInfo')) {
      const fieldName = name.replace('date', '').toLowerCase();
      // Extract the nested property name
      const nestedProp = fieldName.replace('iepinfo', '');
      
      setFormData(prev => ({
        ...prev,
        iepInfo: {
          ...prev.iepInfo,
          [nestedProp]: parseInputDate(value)
        }
      }));
    } 
    // Handle accommodation dialog date
    else if (name === 'dateImplementationDate' && currentAccommodation) {
      setCurrentAccommodation(prev => ({
        ...prev,
        implementationDate: parseInputDate(value)
      }));
    }
    // Handle regular fields
    else {
      // Extract the field name without the 'date' prefix
      const fieldName = name.replace('date', '').toLowerCase();
      setFormData({
        ...formData,
        [fieldName]: parseInputDate(value)
      });
    }
  };

  // Handle subject proficiency changes
  const handleProficiencyChange = (subject, value) => {
    setFormData(prev => ({
      ...prev,
      subjectProficiency: {
        ...prev.subjectProficiency,
        [subject]: value
      }
    }));
  };

  // Parent dialog handlers
  const openParentDialog = (parent = null, index = -1) => {
    setCurrentParent(parent || {
      firstName: '',
      lastName: '',
      relationship: 'Parent',
      email: '',
      phone: '',
      preferredContactMethod: 'email',
      language: 'English',
      notes: ''
    });
    setParentIndex(index);
    setParentDialogOpen(true);
  };

  const handleParentDialogClose = () => {
    setParentDialogOpen(false);
    setCurrentParent(null);
  };

  const handleParentDialogSave = () => {
    // Validate parent data
    if (!currentParent.firstName || !currentParent.lastName) {
      alert('First name and last name are required');
      return;
    }
    
    setFormData(prev => {
      const updatedParents = [...prev.parents];
      if (parentIndex >= 0) {
        // Update existing parent
        updatedParents[parentIndex] = currentParent;
      } else {
        // Add new parent
        updatedParents.push(currentParent);
      }
      return {
        ...prev,
        parents: updatedParents
      };
    });
    
    handleParentDialogClose();
  };

  const handleParentChange = (e) => {
    const { name, value } = e.target;
    setCurrentParent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteParent = (index) => {
    setFormData(prev => ({
      ...prev,
      parents: prev.parents.filter((_, i) => i !== index)
    }));
  };

  // Accommodation dialog handlers
  const openAccommodationDialog = (accommodation = null, index = -1) => {
    setCurrentAccommodation(accommodation || {
      type: '',
      description: '',
      implementationDate: new Date(),
      provider: ''
    });
    setAccommodationIndex(index);
    setAccommodationDialogOpen(true);
  };

  const handleAccommodationDialogClose = () => {
    setAccommodationDialogOpen(false);
    setCurrentAccommodation(null);
  };

  const handleAccommodationDialogSave = () => {
    // Validate accommodation data
    if (!currentAccommodation.type) {
      alert('Accommodation type is required');
      return;
    }
    
    setFormData(prev => {
      const updatedAccommodations = [...prev.accommodations];
      if (accommodationIndex >= 0) {
        // Update existing accommodation
        updatedAccommodations[accommodationIndex] = currentAccommodation;
      } else {
        // Add new accommodation
        updatedAccommodations.push(currentAccommodation);
      }
      return {
        ...prev,
        accommodations: updatedAccommodations
      };
    });
    
    handleAccommodationDialogClose();
  };

  const handleAccommodationChange = (e) => {
    const { name, value } = e.target;
    setCurrentAccommodation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteAccommodation = (index) => {
    setFormData(prev => ({
      ...prev,
      accommodations: prev.accommodations.filter((_, i) => i !== index)
    }));
  };

  // Accordion handlers
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Accordion 
        expanded={expandedSection === 'personal'} 
        onChange={handleAccordionChange('personal')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Personal Information</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.grade}>
                <InputLabel id="grade-label">Grade</InputLabel>
                <Select
                  labelId="grade-label"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  label="Grade"
                >
                  {gradeOptions.map(grade => (
                    <MenuItem key={grade} value={grade}>
                      {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                  <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                type="date"
                name="dateDateOfBirth"
                value={formatDateForInput(formData.dateOfBirth)}
                onChange={handleDateChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="additionalInfo"
                label="Additional Information"
                value={formData.additionalInfo}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      <Accordion 
        expanded={expandedSection === 'academic'} 
        onChange={handleAccordionChange('academic')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Academic Information</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="academic-level-label">Academic Level</InputLabel>
                <Select
                  labelId="academic-level-label"
                  name="academicLevel"
                  value={formData.academicLevel}
                  onChange={handleChange}
                  label="Academic Level"
                >
                  <MenuItem value="Advanced">Advanced</MenuItem>
                  <MenuItem value="Proficient">Proficient</MenuItem>
                  <MenuItem value="Basic">Basic</MenuItem>
                  <MenuItem value="Below Basic">Below Basic</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Subject Proficiency
              </Typography>
              
              <Grid container spacing={2}>
                {Object.entries(formData.subjectProficiency).map(([subject, value]) => (
                  <Grid item xs={12} sm={6} key={subject}>
                    <Typography variant="body2" gutterBottom>
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs>
                        <Slider
                          value={value}
                          onChange={(e, newValue) => handleProficiencyChange(subject, newValue)}
                          aria-labelledby={`${subject}-slider`}
                          valueLabelDisplay="auto"
                          step={5}
                          marks
                          min={0}
                          max={100}
                        />
                      </Grid>
                      <Grid item>
                        <Typography variant="body2">{value}%</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      <Accordion 
        expanded={expandedSection === 'behavioral'} 
        onChange={handleAccordionChange('behavioral')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PsychologyIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Behavioral Information</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="behavior-level-label">Behavior Level</InputLabel>
                <Select
                  labelId="behavior-level-label"
                  name="behaviorLevel"
                  value={formData.behaviorLevel}
                  onChange={handleChange}
                  label="Behavior Level"
                >
                  <MenuItem value="Low">Low (Few behavioral concerns)</MenuItem>
                  <MenuItem value="Medium">Medium (Some behavioral concerns)</MenuItem>
                  <MenuItem value="High">High (Significant behavioral concerns)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="behavioralNotes"
                label="Behavioral Notes"
                value={formData.behavioralNotes || ''}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      <Accordion 
        expanded={expandedSection === 'specialNeeds'} 
        onChange={handleAccordionChange('specialNeeds')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessibilityIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Special Needs & Accommodations</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.specialNeeds}
                    onChange={handleSwitchChange}
                    name="specialNeeds"
                    color="primary"
                  />
                }
                label="This student has special needs"
              />
            </Grid>
            
            {formData.specialNeeds && (
              <>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">Accommodations</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      size="small"
                      onClick={() => openAccommodationDialog()}
                    >
                      Add Accommodation
                    </Button>
                  </Box>
                  
                  {formData.accommodations.length > 0 ? (
                    <Box sx={{ mb: 2 }}>
                      {formData.accommodations.map((accommodation, index) => (
                        <Paper key={index} variant="outlined" sx={{ p: 2, mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="subtitle2">{accommodation.type}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {accommodation.description}
                              </Typography>
                              {accommodation.provider && (
                                <Typography variant="body2" color="text.secondary">
                                  Provider: {accommodation.provider}
                                </Typography>
                              )}
                            </Box>
                            <Box>
                              <IconButton 
                                size="small" 
                                onClick={() => openAccommodationDialog(accommodation, index)}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteAccommodation(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      No accommodations added
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    IEP Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="iep-status-label">IEP Status</InputLabel>
                        <Select
                          labelId="iep-status-label"
                          name="iepInfo.status"
                          value={formData.iepInfo.status}
                          onChange={handleChange}
                          label="IEP Status"
                        >
                          <MenuItem value="None">None</MenuItem>
                          <MenuItem value="Active">Active</MenuItem>
                          <MenuItem value="In Process">In Process</MenuItem>
                          <MenuItem value="Expired">Expired</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="iepInfo.caseManager"
                        label="Case Manager"
                        value={formData.iepInfo.caseManager}
                        onChange={handleChange}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Last Review Date"
                        type="date"
                        name="dateIepInfoLastReviewDate"
                        value={formatDateForInput(formData.iepInfo.lastReviewDate)}
                        onChange={handleDateChange}
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Next Review Date"
                        type="date"
                        name="dateIepInfoNextReviewDate"
                        value={formatDateForInput(formData.iepInfo.nextReviewDate)}
                        onChange={handleDateChange}
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="iepInfo.notes"
                        label="IEP Notes"
                        value={formData.iepInfo.notes}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      <Accordion 
        expanded={expandedSection === 'parents'} 
        onChange={handleAccordionChange('parents')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Parents/Guardians</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Contact Information</Typography>
            <Button
              startIcon={<AddIcon />}
              size="small"
              onClick={() => openParentDialog()}
            >
              Add Parent/Guardian
            </Button>
          </Box>
          
          {formData.parents.length > 0 ? (
            <Box sx={{ mb: 2 }}>
              {formData.parents.map((parent, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2">
                        {parent.firstName} {parent.lastName} ({parent.relationship})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Email: {parent.email || 'Not provided'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {parent.phone || 'Not provided'}
                      </Typography>
                      {parent.preferredContactMethod && (
                        <Chip 
                          label={`Preferred: ${parent.preferredContactMethod}`} 
                          size="small" 
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => openParentDialog(parent, index)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteParent(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No parent/guardian information added
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          onClick={onCancel} 
          sx={{ mr: 1 }} 
          startIcon={<CancelIcon />}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={isLoading}
        >
          {student ? 'Update Student' : 'Add Student'}
        </Button>
      </Box>
      
      {/* Parent Dialog */}
      <Dialog open={parentDialogOpen} onClose={handleParentDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {parentIndex >= 0 ? 'Edit Parent/Guardian' : 'Add Parent/Guardian'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First Name"
                value={currentParent?.firstName || ''}
                onChange={handleParentChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Last Name"
                value={currentParent?.lastName || ''}
                onChange={handleParentChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="relationship-label">Relationship</InputLabel>
                <Select
                  labelId="relationship-label"
                  name="relationship"
                  value={currentParent?.relationship || 'Parent'}
                  onChange={handleParentChange}
                  label="Relationship"
                >
                  <MenuItem value="Parent">Parent</MenuItem>
                  <MenuItem value="Guardian">Guardian</MenuItem>
                  <MenuItem value="Grandparent">Grandparent</MenuItem>
                  <MenuItem value="Foster Parent">Foster Parent</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="preferred-contact-label">Preferred Contact Method</InputLabel>
                <Select
                  labelId="preferred-contact-label"
                  name="preferredContactMethod"
                  value={currentParent?.preferredContactMethod || 'email'}
                  onChange={handleParentChange}
                  label="Preferred Contact Method"
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="text">Text Message</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={currentParent?.email || ''}
                onChange={handleParentChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone"
                value={currentParent?.phone || ''}
                onChange={handleParentChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="language"
                label="Preferred Language"
                value={currentParent?.language || 'English'}
                onChange={handleParentChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                value={currentParent?.notes || ''}
                onChange={handleParentChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleParentDialogClose}>Cancel</Button>
          <Button onClick={handleParentDialogSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Accommodation Dialog */}
      <Dialog open={accommodationDialogOpen} onClose={handleAccommodationDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {accommodationIndex >= 0 ? 'Edit Accommodation' : 'Add Accommodation'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Autocomplete
                value={currentAccommodation?.type || ''}
                onChange={(event, newValue) => {
                  setCurrentAccommodation(prev => ({
                    ...prev,
                    type: newValue
                  }));
                }}
                inputValue={currentAccommodation?.type || ''}
                onInputChange={(event, newInputValue) => {
                  setCurrentAccommodation(prev => ({
                    ...prev,
                    type: newInputValue
                  }));
                }}
                freeSolo
                options={[
                  'Extended Time',
                  'Preferential Seating',
                  'Reading Assistance',
                  'Speech Therapy',
                  'Physical Therapy',
                  'Occupational Therapy',
                  'Visual Aids',
                  'Hearing Aids',
                  'Behavioral Support',
                  'Sensory Accommodations',
                  'Assistive Technology'
                ]}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Accommodation Type"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={currentAccommodation?.description || ''}
                onChange={handleAccommodationChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="provider"
                label="Provider"
                value={currentAccommodation?.provider || ''}
                onChange={handleAccommodationChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Implementation Date"
                type="date"
                name="dateImplementationDate"
                value={formatDateForInput(currentAccommodation?.implementationDate || null)}
                onChange={handleDateChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAccommodationDialogClose}>Cancel</Button>
          <Button onClick={handleAccommodationDialogSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentProfileForm; 