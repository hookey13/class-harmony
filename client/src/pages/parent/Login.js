import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  Grid, 
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useParentAuth } from '../../contexts/ParentAuthContext';
import SchoolIcon from '@mui/icons-material/School';

const ParentLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error } = useParentAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      await login(formData);
      navigate('/parent/dashboard');
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
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
            Parent Portal Login
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Log in to access student information and submit class placement requests
          </Typography>
          
          {(submitError || error) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError || error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Link to="/parent/forgot-password" component={RouterLink} variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                <Link to="/parent/register" component={RouterLink} variant="body2">
                  Don't have an account? Sign up
                </Link>
              </Grid>
            </Grid>
          </form>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>
          
          <Button
            fullWidth
            variant="outlined"
            component={RouterLink}
            to="/login"
            sx={{ mt: 1, mb: 2, py: 1.2 }}
          >
            Admin Login
          </Button>
        </Paper>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} Class Harmony. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default ParentLogin; 