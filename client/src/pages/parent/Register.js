import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useParentAuth } from '../../contexts/ParentAuthContext';
import SchoolIcon from '@mui/icons-material/School';

const ParentRegister = () => {
  const navigate = useNavigate();
  const { register } = useParentAuth();
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Account Information', 'School Details', 'Review & Submit'];
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    schoolCode: '',
  });
  
  // UI state
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      // Validate account information
      if (!formData.firstName) {
        errors.firstName = 'First name is required';
      }
      
      if (!formData.lastName) {
        errors.lastName = 'Last name is required';
      }
      
      if (!formData.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email is invalid';
      }
      
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else if (step === 1) {
      // Validate school information
      if (!formData.schoolCode) {
        errors.schoolCode = 'School code is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(activeStep)) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const result = await register(formData);
      
      setSuccessMessage('Registration successful! Please check your email to verify your account.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        schoolCode: '',
      });
      
      // Navigate to login after a delay
      setTimeout(() => {
        navigate('/parent/login');
      }, 5000);
    } catch (err) {
      console.error('Registration error:', err);
      setSubmitError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                value={formData.firstName}
                onChange={handleChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="phone"
                label="Phone Number (Optional)"
                id="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="schoolCode"
                label="School Code"
                name="schoolCode"
                value={formData.schoolCode}
                onChange={handleChange}
                error={!!formErrors.schoolCode}
                helperText={formErrors.schoolCode || "Enter the school code provided by your school"}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                <strong>Note:</strong> Students will be associated with your account after registration through the school administrator. 
                If you need immediate association of students, please contact your school's administration office.
              </Typography>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>Name:</strong> {formData.firstName} {formData.lastName}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {formData.email}
                </Typography>
                <Typography variant="body1">
                  <strong>Phone:</strong> {formData.phone || 'Not provided'}
                </Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                School Information
              </Typography>
              <Typography variant="body1">
                <strong>School Code:</strong> {formData.schoolCode}
              </Typography>
              
              <Alert severity="info" sx={{ mt: 3 }}>
                By registering, you agree to our Terms of Service and Privacy Policy. 
                You will receive an email to verify your account after registration.
              </Alert>
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
            <SchoolIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              Class Harmony
            </Typography>
          </Box>
          
          <Typography component="h2" variant="h5" align="center" gutterBottom>
            Parent Registration
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Create an account to submit class placement requests and track your students' information
          </Typography>
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}
          
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : handleNext}>
            <Box sx={{ mb: 3 }}>
              {renderStepContent(activeStep)}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                disabled={activeStep === 0 || isSubmitting}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              <Button
                variant="contained"
                type={activeStep === steps.length - 1 ? 'submit' : 'button'}
                onClick={activeStep === steps.length - 1 ? undefined : handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} />
                ) : activeStep === steps.length - 1 ? (
                  'Register'
                ) : (
                  'Next'
                )}
              </Button>
            </Box>
          </form>
          
          {activeStep === 0 && (
            <>
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">OR</Typography>
              </Divider>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Already have an account?
                </Typography>
                <Button 
                  component={RouterLink} 
                  to="/parent/login" 
                  variant="outlined"
                  fullWidth
                >
                  Sign In
                </Button>
              </Box>
            </>
          )}
        </Paper>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} Class Harmony. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default ParentRegister; 