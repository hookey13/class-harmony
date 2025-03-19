import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Snackbar
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useParentAuth } from '../../contexts/ParentAuthContext';
import parentRequestsService from '../../services/parentRequestsService';

const RequestForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { currentParent } = useParentAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    requestType: '',
    details: '',
    teacherPreference: '',
    studentPreference: '',
    reasonForRequest: '',
    additionalComments: ''
  });

  // Loading and error states
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Get request type options
  const requestTypeOptions = parentRequestsService.getRequestTypeOptions();

  useEffect(() => {
    // If editing an existing request, fetch the data
    if (isEditMode) {
      const fetchRequest = async () => {
        try {
          setLoading(true);
          const response = await parentRequestsService.getRequest(id);
          const requestData = response.data;
          
          setFormData({
            studentId: requestData.studentId || '',
            requestType: requestData.requestType || '',
            details: requestData.details || '',
            teacherPreference: requestData.teacherPreference || '',
            studentPreference: requestData.studentPreference || '',
            reasonForRequest: requestData.reasonForRequest || '',
            additionalComments: requestData.additionalComments || ''
          });
          
          setError('');
        } catch (err) {
          console.error('Error fetching request:', err);
          setError('Failed to load request data. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchRequest();
    }
  }, [id, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  // Validate the form
  const validateForm = () => {
    const errors = {};

    if (!formData.studentId) {
      errors.studentId = 'Please select a student';
    }
    
    if (!formData.requestType) {
      errors.requestType = 'Please select a request type';
    }
    
    if (!formData.details) {
      errors.details = 'Please provide details for your request';
    } else if (formData.details.length < 10) {
      errors.details = 'Please provide more detailed information';
    }

    if (formData.requestType === 'teacher_preference' && !formData.teacherPreference) {
      errors.teacherPreference = 'Please specify a teacher preference';
    }

    if ((formData.requestType === 'student_together' || formData.requestType === 'student_separate') 
        && !formData.studentPreference) {
      errors.studentPreference = 'Please specify which student(s)';
    }

    if (!formData.reasonForRequest) {
      errors.reasonForRequest = 'Please provide a reason for your request';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isEditMode) {
        await parentRequestsService.updateRequest(id, formData);
        setSuccessMessage('Request updated successfully!');
      } else {
        await parentRequestsService.createRequest(formData);
        setSuccessMessage('Request submitted successfully!');
        // Reset form after successful submission if creating a new request
        setFormData({
          studentId: '',
          requestType: '',
          details: '',
          teacherPreference: '',
          studentPreference: '',
          reasonForRequest: '',
          additionalComments: ''
        });
      }
      
      // Navigate back after a short delay to show success message
      setTimeout(() => navigate('/parent/requests'), 1500);
    } catch (err) {
      console.error('Error submitting request:', err);
      setError('Failed to submit request. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/parent/requests');
  };

  // Handle success message close
  const handleCloseSuccessMessage = () => {
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton 
          color="inherit" 
          onClick={() => navigate('/parent/requests')}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Placement Request' : 'New Placement Request'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" component="h2" gutterBottom>
                Request Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(formErrors.studentId)}>
                <InputLabel id="student-select-label">Student</InputLabel>
                <Select
                  labelId="student-select-label"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  label="Student"
                  disabled={submitting}
                >
                  {currentParent?.students?.length > 0 ? (
                    currentParent.students.map(student => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} - Grade {student.grade}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No students available</MenuItem>
                  )}
                </Select>
                {formErrors.studentId && (
                  <FormHelperText>{formErrors.studentId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(formErrors.requestType)}>
                <InputLabel id="request-type-label">Request Type</InputLabel>
                <Select
                  labelId="request-type-label"
                  id="requestType"
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleChange}
                  label="Request Type"
                  disabled={submitting}
                >
                  {requestTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.requestType && (
                  <FormHelperText>{formErrors.requestType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {formData.requestType === 'teacher_preference' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Preferred Teacher"
                  name="teacherPreference"
                  value={formData.teacherPreference}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={submitting}
                  error={Boolean(formErrors.teacherPreference)}
                  helperText={formErrors.teacherPreference}
                />
              </Grid>
            )}
            
            {(formData.requestType === 'student_together' || formData.requestType === 'student_separate') && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={formData.requestType === 'student_together' ? 
                    "Student(s) to be placed with" : "Student(s) to be separated from"}
                  name="studentPreference"
                  value={formData.studentPreference}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={submitting}
                  error={Boolean(formErrors.studentPreference)}
                  helperText={formErrors.studentPreference}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Request"
                name="reasonForRequest"
                value={formData.reasonForRequest}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={2}
                disabled={submitting}
                error={Boolean(formErrors.reasonForRequest)}
                helperText={formErrors.reasonForRequest || "Please explain why this request is important"}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Request Details"
                name="details"
                value={formData.details}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
                disabled={submitting}
                error={Boolean(formErrors.details)}
                helperText={formErrors.details || "Please provide detailed information about your request"}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Comments (Optional)"
                name="additionalComments"
                value={formData.additionalComments}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={2}
                disabled={submitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      {isEditMode ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Request' : 'Submit Request'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={handleCloseSuccessMessage}
        message={successMessage}
      />
    </Container>
  );
};

export default RequestForm; 