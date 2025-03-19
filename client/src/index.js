import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import theme from './theme';
import App from './App';
import './index.css';

// Initialize service worker
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('Service Worker registration successful');
  },
  onUpdate: (registration) => {
    // Notify user about new version
    const shouldUpdate = window.confirm(
      'A new version of Class Harmony is available. Would you like to update now?'
    );
    if (shouldUpdate) {
      window.location.reload();
    }
  }
});

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
); 