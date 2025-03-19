import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { School as SchoolIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <SchoolIcon sx={{ fontSize: 70, color: 'primary.main', mb: 2, opacity: 0.7 }} />
        
        <Typography variant="h1" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
          404
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mb: 2, textAlign: 'center' }}>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          size="large"
          sx={{ px: 4, py: 1.5 }}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFound; 