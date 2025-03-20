import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  CircularProgress,
  Paper,
  Container,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  School as SchoolIcon,
  LockOutlined as LockIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setLoginError('');
        await login(values.email, values.password);
        // Changed the redirect to go to dashboard instead of home
        navigate('/dashboard');
      } catch (error) {
        setLoginError(error.message || 'Login failed. Please check your credentials.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#f5f5f5'
    }}>
      <Container maxWidth="sm">
        <Card
          elevation={4}
          sx={{
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              backgroundColor: 'primary.main',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <SchoolIcon fontSize="large" sx={{ mb: 1 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Class Harmony
            </Typography>
            <Typography variant="subtitle1">
              Administrator Login
            </Typography>
          </Box>
          
          <CardContent sx={{ p: isMobile ? 3 : 4 }}>
            {loginError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {loginError}
              </Alert>
            )}
            
            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                variant="outlined"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                margin="normal"
                size="medium"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'text.secondary' }}>@</Box>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                margin="normal"
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Forgot password?
                </Link>
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={formik.isSubmitting}
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                {formik.isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                <Link component={RouterLink} to="/teacher/login" variant="body2">
                  Teacher Login
                </Link>
                <Divider orientation="vertical" flexItem />
                <Link component={RouterLink} to="/parent/login" variant="body2">
                  Parent Login
                </Link>
              </Box>
            </form>
            
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" variant="body2" fontWeight="medium">
                  Register here
                </Link>
              </Typography>
            </Box>
            
            <Paper
              elevation={0}
              sx={{ 
                mt: 3, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', 
                p: 2, 
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
                Demo Credentials
              </Typography>
              <Typography variant="body2" align="center">
                Email: <Box component="span" fontWeight="medium">principal@example.com</Box>
              </Typography>
              <Typography variant="body2" align="center">
                Password: <Box component="span" fontWeight="medium">password123</Box>
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;