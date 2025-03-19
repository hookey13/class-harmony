import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  Card,
  CardContent,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  VpnKey as VpnKeyIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useParentAuth } from '../../contexts/ParentAuthContext';

// TabPanel component for tab contents
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
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ParentProfile = () => {
  const { currentParent, loading: authLoading, updateDetails, updatePassword } = useParentAuth();
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Dialog state for deleting account
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Initialize form data with current parent info
  useEffect(() => {
    if (currentParent) {
      setProfileData({
        firstName: currentParent.firstName || '',
        lastName: currentParent.lastName || '',
        email: currentParent.email || '',
        phone: currentParent.phone || ''
      });
    }
  }, [currentParent]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (profileErrors[name]) {
      setProfileErrors({
        ...profileErrors,
        [name]: ''
      });
    }
    
    // Clear success message when user makes changes
    if (profileSuccess) {
      setProfileSuccess(false);
    }
  };
  
  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileData.firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!profileData.lastName) {
      errors.lastName = 'Last name is required';
    }
    
    if (!profileData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'Email is invalid';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess(false);
    
    try {
      await updateDetails(profileData);
      setProfileSuccess(true);
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };
  
  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: ''
      });
    }
    
    // Clear success message when user makes changes
    if (passwordSuccess) {
      setPasswordSuccess(false);
    }
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);
    
    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess(true);
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError(err.response?.data?.error || 'Failed to update password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  // Handle opening delete account dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };
  
  // Handle closing delete account dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle delete account
  const handleDeleteAccount = async () => {
    // In a real app, this would call an API to delete the account
    // For now, we'll just close the dialog
    handleCloseDeleteDialog();
  };
  
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profile Summary Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  mb: 2, 
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {currentParent?.firstName?.charAt(0)}{currentParent?.lastName?.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {currentParent?.firstName} {currentParent?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {currentParent?.email}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setTabValue(0)}
                  startIcon={<EditIcon />}
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                School Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                <strong>School:</strong> {currentParent?.school?.name || 'Not available'}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>School Code:</strong> {currentParent?.schoolCode || 'Not available'}
              </Typography>
              <Typography variant="body2">
                <strong>Account Created:</strong> {currentParent?.createdAt ? new Date(currentParent.createdAt).toLocaleDateString() : 'Not available'}
              </Typography>
            </CardContent>
          </Card>
          
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              color="error" 
              fullWidth
              onClick={handleOpenDeleteDialog}
              sx={{ mt: 2 }}
            >
              Delete Account
            </Button>
          </Box>
        </Grid>
        
        {/* Profile Tabs */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                <Tab 
                  label="Edit Profile" 
                  id="profile-tab-0" 
                  aria-controls="profile-tabpanel-0" 
                  icon={<PersonIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Change Password" 
                  id="profile-tab-1" 
                  aria-controls="profile-tabpanel-1" 
                  icon={<VpnKeyIcon />} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>
            
            <Box sx={{ px: 3 }}>
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                
                {profileSuccess && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Profile updated successfully!
                  </Alert>
                )}
                
                {profileError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {profileError}
                  </Alert>
                )}
                
                <form onSubmit={handleProfileSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        autoComplete="given-name"
                        name="firstName"
                        required
                        fullWidth
                        id="firstName"
                        label="First Name"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        error={!!profileErrors.firstName}
                        helperText={profileErrors.firstName}
                        disabled={profileLoading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="lastName"
                        label="Last Name"
                        name="lastName"
                        autoComplete="family-name"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        error={!!profileErrors.lastName}
                        helperText={profileErrors.lastName}
                        disabled={profileLoading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        error={!!profileErrors.email}
                        helperText={profileErrors.email}
                        disabled={profileLoading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="phone"
                        label="Phone Number"
                        name="phone"
                        autoComplete="tel"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        disabled={profileLoading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={profileLoading}
                        sx={{ mt: 2 }}
                      >
                        {profileLoading ? <CircularProgress size={24} /> : 'Save Changes'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                
                {passwordSuccess && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Password updated successfully!
                  </Alert>
                )}
                
                {passwordError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {passwordError}
                  </Alert>
                )}
                
                <form onSubmit={handlePasswordSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        name="currentPassword"
                        label="Current Password"
                        type="password"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        error={!!passwordErrors.currentPassword}
                        helperText={passwordErrors.currentPassword}
                        disabled={passwordLoading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        name="newPassword"
                        label="New Password"
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        error={!!passwordErrors.newPassword}
                        helperText={passwordErrors.newPassword}
                        disabled={passwordLoading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm New Password"
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        error={!!passwordErrors.confirmPassword}
                        helperText={passwordErrors.confirmPassword}
                        disabled={passwordLoading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<VpnKeyIcon />}
                        disabled={passwordLoading}
                        sx={{ mt: 2 }}
                      >
                        {passwordLoading ? <CircularProgress size={24} /> : 'Update Password'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </TabPanel>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Your Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone. All of your personal information, requests, and account history will be permanently deleted.
            <br /><br />
            Are you sure you want to delete your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" autoFocus>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ParentProfile; 