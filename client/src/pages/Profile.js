import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../services/api';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile = () => {
  // State
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    school: '',
    title: '',
    bio: '',
    avatarUrl: ''
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    appNotifications: true,
    studentUpdates: true,
    classChanges: true,
    systemAnnouncements: true,
    userMentions: true,
    dailySummary: false,
    weeklySummary: true
  });

  // Contexts
  const { user, updateUserProfile } = useAuth();
  const { createNotification } = useNotifications();
  
  // Fetch user profile on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        school: user.school || '',
        title: user.title || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
      });
      
      // Load notification settings if available
      if (user.notificationSettings) {
        setNotificationSettings(user.notificationSettings);
      }
    }
  }, [user]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle profile data change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle password data change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle notification settings change
  const handleNotificationSettingChange = (e) => {
    const { name, checked } = e.target;
    
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Save profile
  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await api.updateUserProfile(user.id, profileData);
      
      if (result && result.success) {
        // Update auth context
        updateUserProfile(result.data);
        
        setSuccess('Profile updated successfully');
        
        // Create notification
        createNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully.'
        });
      } else {
        setError(result?.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Change password
  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      setError('Current password is required');
      return;
    }
    
    if (!passwordData.newPassword) {
      setError('New password is required');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    // Password strength validation
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await api.changePassword(passwordData);
      
      if (result && result.success) {
        setSuccess('Password changed successfully');
        
        // Reset password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Create notification
        createNotification({
          type: 'success',
          title: 'Password Changed',
          message: 'Your password has been updated successfully.'
        });
      } else {
        setError(result?.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('An error occurred while changing your password');
    } finally {
      setLoading(false);
    }
  };
  
  // Save notification settings
  const handleSaveNotificationSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await api.updateNotificationPreferences(user.id, notificationSettings);
      
      if (result && result.success) {
        // Update auth context with new settings
        updateUserProfile({
          ...user,
          notificationSettings
        });
        
        setSuccess('Notification preferences updated successfully');
        
        // Create notification
        createNotification({
          type: 'success',
          title: 'Preferences Updated',
          message: 'Your notification preferences have been updated.'
        });
      } else {
        setError(result?.message || 'Failed to update notification preferences');
      }
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setError('An error occurred while updating your notification preferences');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="profile tabs"
          >
            <Tab 
              icon={<PersonIcon />} 
              label="Personal Info" 
              id="profile-tab-0" 
              aria-controls="profile-tabpanel-0"
            />
            <Tab 
              icon={<SecurityIcon />} 
              label="Security" 
              id="profile-tab-1" 
              aria-controls="profile-tabpanel-1"
            />
            <Tab 
              icon={<NotificationsIcon />} 
              label="Notifications" 
              id="profile-tab-2" 
              aria-controls="profile-tabpanel-2"
            />
          </Tabs>
        </Box>
        
        {/* Personal Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                src={profileData.avatarUrl} 
                sx={{ width: 150, height: 150, mb: 2 }}
              >
                {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Button 
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ mb: 2 }}
              >
                Change Photo
              </Button>
              <Chip 
                label={profileData.role ? profileData.role.toUpperCase() : 'USER'} 
                color="primary" 
                sx={{ mb: 1 }}
              />
              {profileData.school && (
                <Typography variant="body2" color="text.secondary">
                  {profileData.school}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    type="email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    name="title"
                    value={profileData.title}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Password requirements:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon color={passwordData.newPassword.length >= 8 ? 'success' : 'disabled'} fontSize="small" />
                  <Typography variant="body2" color={passwordData.newPassword.length >= 8 ? 'text.primary' : 'text.secondary'}>
                    Minimum 8 characters
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon color={/[A-Z]/.test(passwordData.newPassword) ? 'success' : 'disabled'} fontSize="small" />
                  <Typography variant="body2" color={/[A-Z]/.test(passwordData.newPassword) ? 'text.primary' : 'text.secondary'}>
                    At least one uppercase letter
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon color={/[0-9]/.test(passwordData.newPassword) ? 'success' : 'disabled'} fontSize="small" />
                  <Typography variant="body2" color={/[0-9]/.test(passwordData.newPassword) ? 'text.primary' : 'text.secondary'}>
                    At least one number
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon 
                    color={passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'success' : 'disabled'} 
                    fontSize="small" 
                  />
                  <Typography 
                    variant="body2" 
                    color={passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'text.primary' : 'text.secondary'}
                  >
                    Passwords match
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleChangePassword}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
              Change Password
            </Button>
          </Box>
        </TabPanel>
        
        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Delivery Methods
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onChange={handleNotificationSettingChange}
                        name="emailNotifications"
                        color="primary"
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.appNotifications}
                        onChange={handleNotificationSettingChange}
                        name="appNotifications"
                        color="primary"
                      />
                    }
                    label="In-app Notifications"
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Notification Types
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.studentUpdates}
                        onChange={handleNotificationSettingChange}
                        name="studentUpdates"
                        color="primary"
                      />
                    }
                    label="Student Updates"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.classChanges}
                        onChange={handleNotificationSettingChange}
                        name="classChanges"
                        color="primary"
                      />
                    }
                    label="Class Changes"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.systemAnnouncements}
                        onChange={handleNotificationSettingChange}
                        name="systemAnnouncements"
                        color="primary"
                      />
                    }
                    label="System Announcements"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.userMentions}
                        onChange={handleNotificationSettingChange}
                        name="userMentions"
                        color="primary"
                      />
                    }
                    label="User Mentions"
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Summary Emails
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.dailySummary}
                        onChange={handleNotificationSettingChange}
                        name="dailySummary"
                        color="primary"
                      />
                    }
                    label="Daily Summary"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.weeklySummary}
                        onChange={handleNotificationSettingChange}
                        name="weeklySummary"
                        color="primary"
                      />
                    }
                    label="Weekly Summary"
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveNotificationSettings}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                Save Preferences
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Profile; 