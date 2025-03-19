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
import { Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import parentAuthService from '../../services/parentAuthService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
  };
  
  const validateEmail = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await parentAuthService.forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setError(err.response?.data?.error || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
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
            Forgot Password
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Enter your email address and we'll send you a link to reset your password
          </Typography>
          
          {success ? (
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset email sent! Please check your inbox for instructions to reset your password.
              </Alert>
              <Typography variant="body2" paragraph>
                If you don't receive an email within a few minutes, please check your spam folder.
              </Typography>
              <Button 
                component={RouterLink} 
                to="/parent/login" 
                variant="contained"
                sx={{ mt: 2 }}
              >
                Back to Login
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
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError}
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
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Link component={RouterLink} to="/parent/login" variant="body2">
                  Remember your password? Sign in
                </Link>
                <Link component={RouterLink} to="/parent/register" variant="body2">
                  Don't have an account? Sign up
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

export default ForgotPassword; 