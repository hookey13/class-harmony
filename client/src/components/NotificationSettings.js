import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
  Button,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress
} from '@mui/material';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const NotificationSettings = () => {
  const { user } = useAuth();
  const { updateNotificationPreferences, subscribeToPushNotifications } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [preferences, setPreferences] = useState({
    email: true,
    push: false,
    sms: false,
    inApp: true,
    types: {
      CLASS_PLACEMENT: true,
      PARENT_REQUEST: true,
      TEACHER_SURVEY: true,
      SYSTEM_UPDATE: true,
      OPTIMIZATION_COMPLETE: true
    }
  });

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPreferences(prev => ({
        ...prev,
        ...user.notificationPreferences
      }));
      setLoading(false);
    }
  }, [user]);

  const handleChannelChange = async (channel) => {
    try {
      setError(null);
      const newPreferences = {
        ...preferences,
        [channel]: !preferences[channel]
      };

      // If enabling push notifications, request permission
      if (channel === 'push' && !preferences.push) {
        if (!('Notification' in window)) {
          throw new Error('This browser does not support push notifications');
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await subscribeToPushNotifications();
        } else {
          throw new Error('Permission to send notifications was denied');
        }
      }

      await updateNotificationPreferences(newPreferences);
      setPreferences(newPreferences);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      // Revert the change if there was an error
      setPreferences(prev => ({
        ...prev,
        [channel]: !prev[channel]
      }));
    }
  };

  const handleTypeChange = async (type) => {
    try {
      setError(null);
      const newPreferences = {
        ...preferences,
        types: {
          ...preferences.types,
          [type]: !preferences.types[type]
        }
      };

      await updateNotificationPreferences(newPreferences);
      setPreferences(newPreferences);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      // Revert the change if there was an error
      setPreferences(prev => ({
        ...prev,
        types: {
          ...prev.types,
          [type]: !prev.types[type]
        }
      }));
    }
  };

  const handleSaveAll = async () => {
    try {
      setError(null);
      await updateNotificationPreferences(preferences);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Notification Settings
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification Channels
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.inApp}
                  onChange={() => handleChannelChange('inApp')}
                />
              }
              label="In-app notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.email}
                  onChange={() => handleChannelChange('email')}
                />
              }
              label="Email notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.push}
                  onChange={() => handleChannelChange('push')}
                />
              }
              label="Push notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.sms}
                  onChange={() => handleChannelChange('sms')}
                />
              }
              label="SMS notifications"
            />
          </FormGroup>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification Types
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Class Placements"
                secondary="Updates about student class assignments"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={preferences.types.CLASS_PLACEMENT}
                  onChange={() => handleTypeChange('CLASS_PLACEMENT')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Parent Requests"
                secondary="Updates about parent placement requests"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={preferences.types.PARENT_REQUEST}
                  onChange={() => handleTypeChange('PARENT_REQUEST')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Teacher Surveys"
                secondary="Reminders and updates about teacher surveys"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={preferences.types.TEACHER_SURVEY}
                  onChange={() => handleTypeChange('TEACHER_SURVEY')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="System Updates"
                secondary="Important system announcements and updates"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={preferences.types.SYSTEM_UPDATE}
                  onChange={() => handleTypeChange('SYSTEM_UPDATE')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Optimization Complete"
                secondary="Notifications when class optimization is complete"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={preferences.types.OPTIMIZATION_COMPLETE}
                  onChange={() => handleTypeChange('OPTIMIZATION_COMPLETE')}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveAll}
        >
          Save Changes
        </Button>
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Notification settings updated successfully
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationSettings; 