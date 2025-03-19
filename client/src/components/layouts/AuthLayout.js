import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography, Grid } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.primary.light,
        backgroundImage: 'linear-gradient(to right bottom, #3f51b5, #6573c3)',
      }}
    >
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <SchoolIcon sx={{ fontSize: 40, color: 'white', mr: 1 }} />
          <Typography variant="h4" component="h1" color="white" fontWeight="bold">
            Class Harmony
          </Typography>
        </Box>
        <Paper 
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Welcome to Class Harmony
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" align="center">
              Balanced Classes, Brighter Futures
            </Typography>
          </Box>
          <Outlet />
        </Paper>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="white">
            © {new Date().getFullYear()} Class Harmony. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout; 