import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import parentAuthService from '../../services/parentAuthService';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
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
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.password) {
      errors.password = 'New password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await parentAuthService.resetPassword(token, { password: formData.password });
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/parent/login');
      }, 3000);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.response?.data?.error || 'Failed to reset password. The token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!token) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
              <SchoolIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography component="h1" variant="h4" fontWeight="bold">
                Class Harmony
              </Typography>
            </Box>
            
            <Typography component="h2" variant="h5" align="center" gutterBottom>
              Reset Password
            </Typography>
            
            <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
              Reset token is missing. Please use the link provided in your email.
            </Alert>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button 
                component={RouterLink} 
                to="/parent/forgot-password" 
                variant="contained"
              >
                Request a new password reset
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
            <SchoolIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              Class Harmony
            </Typography>
          </Box>
          
          <Typography component="h2" variant="h5" align="center" gutterBottom>
            Reset Password
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Enter your new password below
          </Typography>
          
          {success ? (
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Your password has been reset successfully! You'll be redirected to the login page in a few seconds.
              </Alert>
              <Button 
                component={RouterLink} 
                to="/parent/login" 
                variant="contained"
                sx={{ mt: 2 }}
              >
                Go to Login
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                disabled={loading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                disabled={loading}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link component={RouterLink} to="/parent/login" variant="body2">
                  Remember your password? Sign in
                </Link>
              </Box>
            </form>
          )}
        </Paper>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} Class Harmony. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default ResetPassword; 