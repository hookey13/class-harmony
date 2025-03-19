import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  Balance as BalanceIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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

const Settings = () => {
  // State
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  
  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'Class Harmony',
    logoUrl: '',
    supportEmail: 'support@classharmony.edu',
    enableBetaFeatures: false,
    maintenanceMode: false,
    currentSchoolYear: '2023-2024'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    emailNotificationDigestFrequency: 'daily',
    enableSystemNotifications: true,
    teacherSurveyReminderDays: 7,
    studentImportReminderDays: 14,
    parentRequestReminderDays: 5
  });
  
  const [classBalanceSettings, setClassBalanceSettings] = useState({
    defaultFactors: {
      gender: 70,
      academic: 80,
      behavior: 75,
      specialNeeds: 90,
      parentRequests: 60,
      teacherFeedback: 70
    },
    enableAutoBalancing: true,
    maxIterations: 100,
    targetBalanceScore: 85
  });
  
  const [dataRetentionSettings, setDataRetentionSettings] = useState({
    studentDataRetentionYears: 5,
    classListsRetentionYears: 3,
    surveysRetentionYears: 2,
    enableDataArchiving: true,
    autoDeleteInactiveUsers: true,
    inactiveUserMonths: 12
  });
  
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    senderName: 'Class Harmony',
    senderEmail: 'noreply@classharmony.edu',
    enableHTML: true,
    enableAttachments: true
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireSpecialChar: true,
    passwordRequireNumber: true,
    passwordRequireUppercase: true,
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    ipRestriction: false,
    allowedIPs: ''
  });
  
  // Notification context
  const { createNotification } = useNotifications();
  
  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);
  
  // Fetch settings from API
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.getSystemSettings();
      
      if (result) {
        // Update all settings state with fetched data
        if (result.general) setGeneralSettings(result.general);
        if (result.notifications) setNotificationSettings(result.notifications);
        if (result.classBalance) setClassBalanceSettings(result.classBalance);
        if (result.dataRetention) setDataRetentionSettings(result.dataRetention);
        if (result.email) setEmailSettings(result.email);
        if (result.security) setSecuritySettings(result.security);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle general settings change
  const handleGeneralSettingsChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    
    setGeneralSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Handle notification settings change
  const handleNotificationSettingsChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    
    setNotificationSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Handle class balance settings change
  const handleClassBalanceSettingsChange = (factor, value) => {
    if (factor === 'enableAutoBalancing') {
      setClassBalanceSettings(prev => ({
        ...prev,
        enableAutoBalancing: value
      }));
    } else if (factor === 'maxIterations' || factor === 'targetBalanceScore') {
      setClassBalanceSettings(prev => ({
        ...prev,
        [factor]: value
      }));
    } else {
      // Handle factors
      setClassBalanceSettings(prev => ({
        ...prev,
        defaultFactors: {
          ...prev.defaultFactors,
          [factor]: value
        }
      }));
    }
  };
  
  // Handle data retention settings change
  const handleDataRetentionSettingsChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    
    setDataRetentionSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Handle email settings change
  const handleEmailSettingsChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    
    setEmailSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Handle security settings change
  const handleSecuritySettingsChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    
    setSecuritySettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Handle save settings
  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await api.updateSystemSettings({
        general: generalSettings,
        notifications: notificationSettings,
        classBalance: classBalanceSettings,
        dataRetention: dataRetentionSettings,
        email: emailSettings,
        security: securitySettings
      });
      
      if (result && result.success) {
        setSuccess('Settings saved successfully');
        
        // Create notification
        createNotification({
          type: 'success',
          title: 'Settings Updated',
          message: 'System settings have been updated successfully.'
        });
      } else {
        setError(result?.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('An error occurred while saving settings');
    } finally {
      setLoading(false);
    }
  };
  
  // Test email connection
  const handleTestEmailConnection = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await api.testEmailConnection(emailSettings);
      
      if (result && result.success) {
        setSuccess('Email connection test successful');
      } else {
        setError(result?.message || 'Email connection test failed');
      }
    } catch (err) {
      console.error('Error testing email connection:', err);
      setError('An error occurred while testing email connection');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Settings
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
          Save All Settings
        </Button>
      </Box>
      
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
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<SchoolIcon sx={{ mr: 1 }} />} label="General" id="settings-tab-0" />
          <Tab icon={<NotificationsIcon sx={{ mr: 1 }} />} label="Notifications" id="settings-tab-1" />
          <Tab icon={<BalanceIcon sx={{ mr: 1 }} />} label="Class Balance" id="settings-tab-2" />
          <Tab icon={<StorageIcon sx={{ mr: 1 }} />} label="Data Retention" id="settings-tab-3" />
          <Tab icon={<EmailIcon sx={{ mr: 1 }} />} label="Email" id="settings-tab-4" />
          <Tab icon={<SecurityIcon sx={{ mr: 1 }} />} label="Security" id="settings-tab-5" />
        </Tabs>
        
        {/* General Settings */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                General Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="System Name"
                name="systemName"
                value={generalSettings.systemName}
                onChange={handleGeneralSettingsChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Logo URL"
                name="logoUrl"
                value={generalSettings.logoUrl}
                onChange={handleGeneralSettingsChange}
                margin="normal"
                helperText="URL to your organization's logo"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Support Email"
                name="supportEmail"
                value={generalSettings.supportEmail}
                onChange={handleGeneralSettingsChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Current School Year"
                name="currentSchoolYear"
                value={generalSettings.currentSchoolYear}
                onChange={handleGeneralSettingsChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={generalSettings.enableBetaFeatures}
                    onChange={handleGeneralSettingsChange}
                    name="enableBetaFeatures"
                  />
                }
                label="Enable Beta Features"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onChange={handleGeneralSettingsChange}
                    name="maintenanceMode"
                  />
                }
                label="Maintenance Mode"
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Notification Settings */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.enableEmailNotifications}
                    onChange={handleNotificationSettingsChange}
                    name="enableEmailNotifications"
                  />
                }
                label="Enable Email Notifications"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.enableSystemNotifications}
                    onChange={handleNotificationSettingsChange}
                    name="enableSystemNotifications"
                  />
                }
                label="Enable System Notifications"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Email Digest Frequency</InputLabel>
                <Select
                  name="emailNotificationDigestFrequency"
                  value={notificationSettings.emailNotificationDigestFrequency}
                  onChange={handleNotificationSettingsChange}
                  label="Email Digest Frequency"
                >
                  <MenuItem value="realtime">Real-time</MenuItem>
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Reminder Settings (Days)
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Teacher Survey Reminder"
                name="teacherSurveyReminderDays"
                type="number"
                value={notificationSettings.teacherSurveyReminderDays}
                onChange={handleNotificationSettingsChange}
                margin="normal"
                helperText="Days before sending reminder"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Student Import Reminder"
                name="studentImportReminderDays"
                type="number"
                value={notificationSettings.studentImportReminderDays}
                onChange={handleNotificationSettingsChange}
                margin="normal"
                helperText="Days before sending reminder"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Parent Request Reminder"
                name="parentRequestReminderDays"
                type="number"
                value={notificationSettings.parentRequestReminderDays}
                onChange={handleNotificationSettingsChange}
                margin="normal"
                helperText="Days before sending reminder"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Class Balance Settings */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Class Balance Algorithm Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={classBalanceSettings.enableAutoBalancing}
                    onChange={(e) => handleClassBalanceSettingsChange('enableAutoBalancing', e.target.checked)}
                  />
                }
                label="Enable Automatic Balancing"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Max Optimization Iterations
              </Typography>
              <Slider
                value={classBalanceSettings.maxIterations}
                onChange={(e, value) => handleClassBalanceSettingsChange('maxIterations', value)}
                min={10}
                max={500}
                step={10}
                valueLabelDisplay="auto"
                marks={[
                  { value: 10, label: '10' },
                  { value: 100, label: '100' },
                  { value: 250, label: '250' },
                  { value: 500, label: '500' }
                ]}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Target Balance Score
              </Typography>
              <Slider
                value={classBalanceSettings.targetBalanceScore}
                onChange={(e, value) => handleClassBalanceSettingsChange('targetBalanceScore', value)}
                min={50}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                marks={[
                  { value: 50, label: '50' },
                  { value: 75, label: '75' },
                  { value: 90, label: '90' },
                  { value: 100, label: '100' }
                ]}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Balance Factor Weights
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Adjust the weight of each factor in the balancing algorithm (0-100)
              </Typography>
            </Grid>
            
            {Object.entries(classBalanceSettings.defaultFactors).map(([factor, value]) => (
              <Grid item xs={12} md={4} key={factor}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {factor.charAt(0).toUpperCase() + factor.slice(1)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Slider
                      value={value}
                      onChange={(e, newValue) => handleClassBalanceSettingsChange(factor, newValue)}
                      min={0}
                      max={100}
                      valueLabelDisplay="auto"
                      sx={{ mr: 2, flexGrow: 1 }}
                    />
                    <Chip 
                      label={`${value}%`} 
                      color={value > 75 ? 'primary' : value > 50 ? 'default' : 'default'} 
                      variant={value > 75 ? 'filled' : 'outlined'}
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        
        {/* Data Retention Settings */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Data Retention Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Student Data Retention (Years)"
                name="studentDataRetentionYears"
                type="number"
                value={dataRetentionSettings.studentDataRetentionYears}
                onChange={handleDataRetentionSettingsChange}
                margin="normal"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Class Lists Retention (Years)"
                name="classListsRetentionYears"
                type="number"
                value={dataRetentionSettings.classListsRetentionYears}
                onChange={handleDataRetentionSettingsChange}
                margin="normal"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Surveys Retention (Years)"
                name="surveysRetentionYears"
                type="number"
                value={dataRetentionSettings.surveysRetentionYears}
                onChange={handleDataRetentionSettingsChange}
                margin="normal"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={dataRetentionSettings.enableDataArchiving}
                    onChange={handleDataRetentionSettingsChange}
                    name="enableDataArchiving"
                  />
                }
                label="Enable Data Archiving"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={dataRetentionSettings.autoDeleteInactiveUsers}
                    onChange={handleDataRetentionSettingsChange}
                    name="autoDeleteInactiveUsers"
                  />
                }
                label="Auto-Delete Inactive Users"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Inactive User Months Before Deletion"
                name="inactiveUserMonths"
                type="number"
                value={dataRetentionSettings.inactiveUserMonths}
                onChange={handleDataRetentionSettingsChange}
                margin="normal"
                InputProps={{ inputProps: { min: 1 } }}
                disabled={!dataRetentionSettings.autoDeleteInactiveUsers}
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Email Settings */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Email Server Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Server"
                name="smtpServer"
                value={emailSettings.smtpServer}
                onChange={handleEmailSettingsChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Port"
                name="smtpPort"
                type="number"
                value={emailSettings.smtpPort}
                onChange={handleEmailSettingsChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Username"
                name="smtpUsername"
                value={emailSettings.smtpUsername}
                onChange={handleEmailSettingsChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Password"
                name="smtpPassword"
                type="password"
                value={emailSettings.smtpPassword}
                onChange={handleEmailSettingsChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sender Name"
                name="senderName"
                value={emailSettings.senderName}
                onChange={handleEmailSettingsChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sender Email"
                name="senderEmail"
                value={emailSettings.senderEmail}
                onChange={handleEmailSettingsChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailSettings.enableHTML}
                    onChange={handleEmailSettingsChange}
                    name="enableHTML"
                  />
                }
                label="Enable HTML Emails"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailSettings.enableAttachments}
                    onChange={handleEmailSettingsChange}
                    name="enableAttachments"
                  />
                }
                label="Enable Email Attachments"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                variant="outlined" 
                onClick={handleTestEmailConnection}
                disabled={loading}
              >
                Test Email Connection
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Security Settings */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Password Requirements
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Minimum Password Length"
                    name="passwordMinLength"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={handleSecuritySettingsChange}
                    margin="normal"
                    InputProps={{ inputProps: { min: 6 } }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.passwordRequireSpecialChar}
                        onChange={handleSecuritySettingsChange}
                        name="passwordRequireSpecialChar"
                      />
                    }
                    label="Require Special Character"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.passwordRequireNumber}
                        onChange={handleSecuritySettingsChange}
                        name="passwordRequireNumber"
                      />
                    }
                    label="Require Number"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.passwordRequireUppercase}
                        onChange={handleSecuritySettingsChange}
                        name="passwordRequireUppercase"
                      />
                    }
                    label="Require Uppercase Letter"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Session & Login Security
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Session Timeout (Minutes)"
                    name="sessionTimeoutMinutes"
                    type="number"
                    value={securitySettings.sessionTimeoutMinutes}
                    onChange={handleSecuritySettingsChange}
                    margin="normal"
                    InputProps={{ inputProps: { min: 5 } }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Max Login Attempts"
                    name="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={handleSecuritySettingsChange}
                    margin="normal"
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onChange={handleSecuritySettingsChange}
                        name="twoFactorAuth"
                      />
                    }
                    label="Enable Two-Factor Authentication"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="ip-restriction-content"
                  id="ip-restriction-header"
                >
                  <Typography>IP Restriction (Advanced)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.ipRestriction}
                            onChange={handleSecuritySettingsChange}
                            name="ipRestriction"
                          />
                        }
                        label="Enable IP Restriction"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Allowed IP Addresses"
                        name="allowedIPs"
                        value={securitySettings.allowedIPs}
                        onChange={handleSecuritySettingsChange}
                        margin="normal"
                        helperText="Comma-separated list of IP addresses or CIDR ranges"
                        disabled={!securitySettings.ipRestriction}
                        multiline
                        rows={3}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
          Save All Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings; 