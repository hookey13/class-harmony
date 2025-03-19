import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Icon
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Class Harmony
              </Typography>
              <Typography variant="h5" component="h2" gutterBottom>
                AI-Powered Classroom Management for Schools
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                Optimize class assignments, balance student groups, and create the perfect learning environment with our advanced algorithms and intuitive tools.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src="https://via.placeholder.com/600x400?text=Class+Harmony"
                  alt="Classroom Illustration" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 400,
                    display: 'inline-block'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Features
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Discover how Class Harmony can transform your classroom assignment process
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <AutoAwesomeIcon color="primary" sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  AI-Powered Optimization
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Our algorithm balances academic abilities, behavior, gender, and special needs to create optimally balanced classrooms.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <PeopleIcon color="primary" sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Parent Input Integration
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Collect and incorporate parent requests for student placements while maintaining balanced classrooms.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <AssessmentIcon color="primary" sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Detailed Analytics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Visual reports and metrics help you understand classroom composition and make data-driven decisions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <PersonIcon color="primary" sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Teacher Assignment
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Match teachers to classrooms based on teaching styles, student needs, and compatibility scores.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <SchoolIcon color="primary" sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Student Profiles
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Comprehensive student profiles with academic history, behavioral data, and special considerations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Icon color="primary" sx={{ fontSize: 48 }}>
                    history
                  </Icon>
                </Box>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Multi-Year Planning
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Historical data analysis for creating better classroom assignments year after year.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Call to action */}
      <Box sx={{ bgcolor: 'secondary.light', py: 6, mb: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            Ready to transform your classroom planning?
          </Typography>
          <Typography variant="body1" align="center" paragraph sx={{ mb: 4 }}>
            Join hundreds of schools already using Class Harmony to create balanced, effective classrooms.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/signup')}
            >
              Get Started Today
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h6" align="center" gutterBottom>
            Class Harmony
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
            Bringing harmony to classroom management
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' Class Harmony. All rights reserved.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 