import React, { Component } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <Container maxWidth="md" sx={{ my: 5 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: 'error.light',
              color: 'error.contrastText'
            }}
          >
            <ErrorIcon sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" paragraph>
              We're sorry, but an error occurred while rendering this page.
            </Typography>
            
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <Box sx={{ my: 3, textAlign: 'left', bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" color="error.main" gutterBottom>
                  Error Details:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                  {this.state.error.toString()}
                </Typography>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 4 }}>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={this.handleReload}
                sx={{ mr: 2 }}
              >
                Reload Page
              </Button>
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={this.handleGoHome}
              >
                Go to Home
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 