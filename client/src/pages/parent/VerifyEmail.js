import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import api from '../../services/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/parent/auth/verify-email/${token}`);
        setSuccess(true);
      } catch (err) {
        console.error('Error verifying email:', err);
        setError(err.response?.data?.error || 'Email verification failed. The token may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      verifyEmailToken();
    } else {
      setLoading(false);
      setError('Verification token is missing.');
    }
  }, [token]);
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
            <SchoolIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              Class Harmony
            </Typography>
          </Box>
          
          <Typography component="h2" variant="h5" gutterBottom>
            Email Verification
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="body1">
                Verifying your email address...
              </Typography>
            </Box>
          ) : success ? (
            <Box sx={{ my: 4 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Email Verified Successfully!
              </Typography>
              <Typography variant="body1" paragraph>
                Your email has been verified. You can now log in to your parent account.
              </Typography>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/parent/login"
                sx={{ mt: 2 }}
              >
                Sign In
              </Button>
            </Box>
          ) : (
            <Box sx={{ my: 4 }}>
              <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                {error}
              </Alert>
              <Typography variant="body1" paragraph>
                If you're having trouble verifying your email, please try registering again or contact support.
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  component={RouterLink} 
                  to="/parent/register"
                >
                  Register Again
                </Button>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/parent/login"
                >
                  Back to Login
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} Class Harmony. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default VerifyEmail; 