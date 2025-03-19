import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Storage,
  SystemUpdate,
  Link as LinkIcon,
  Add,
  Delete,
  Edit,
  Code,
  Check,
  Close,
  Description,
  CloudDownload,
  Settings,
} from '@mui/icons-material';
import apiService from '../../services/apiService';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Integrations = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sisSystems, setSisSystems] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [availableApis, setAvailableApis] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  
  // Mock SIS systems for demo
  const mockSisSystems = [
    { id: 1, name: 'PowerSchool', connected: true, lastSync: '2023-06-10T14:30:00', status: 'active' },
    { id: 2, name: 'Infinite Campus', connected: false, lastSync: null, status: 'inactive' },
    { id: 3, name: 'Skyward', connected: false, lastSync: null, status: 'inactive' },
    { id: 4, name: 'Blackbaud', connected: false, lastSync: null, status: 'inactive' },
  ];
  
  // Mock webhooks for demo
  const mockWebhooks = [
    { id: 1, name: 'New Student Alert', url: 'https://example.com/webhooks/new-student', event: 'student.created', active: true },
    { id: 2, name: 'Class Update', url: 'https://example.com/webhooks/class-update', event: 'class.updated', active: true },
    { id: 3, name: 'Teacher Survey Completion', url: 'https://example.com/webhooks/survey-complete', event: 'survey.completed', active: false },
  ];
  
  // Mock available APIs for demo
  const mockAvailableApis = [
    { id: 'students', name: 'Students API', description: 'Manage student data', endpoints: 12 },
    { id: 'classes', name: 'Classes API', description: 'Manage class lists and assignments', endpoints: 8 },
    { id: 'teachers', name: 'Teachers API', description: 'Manage teacher data and surveys', endpoints: 6 },
    { id: 'placement-requests', name: 'Placement Requests API', description: 'Handle parent placement requests', endpoints: 7 },
    { id: 'analytics', name: 'Analytics API', description: 'Access class composition analytics', endpoints: 5 },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, these would be API calls
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Simulate API responses
      setSisSystems(mockSisSystems);
      setWebhooks(mockWebhooks);
      setAvailableApis(mockAvailableApis);
      
    } catch (err) {
      setError('Error fetching integration data: ' + apiService.handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setCurrentItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentItem(null);
  };

  const handleSaveDialog = () => {
    // In a real implementation, this would call an API endpoint
    // For now, we'll just close the dialog
    handleCloseDialog();
  };

  const handleDeleteItem = (type, id) => {
    // In a real implementation, this would call an API endpoint
    // For now, we'll just remove from the state
    if (type === 'webhook') {
      setWebhooks(webhooks.filter(webhook => webhook.id !== id));
    }
  };

  const handleToggleWebhook = (id) => {
    // In a real implementation, this would call an API endpoint
    // For now, we'll just update the state
    setWebhooks(
      webhooks.map(webhook => 
        webhook.id === id 
          ? { ...webhook, active: !webhook.active } 
          : webhook
      )
    );
  };

  const handleTestSisConnection = (id) => {
    // In a real implementation, this would call an API endpoint
    alert(`Testing connection to SIS system with ID: ${id}`);
  };

  const handleSyncSisData = (id) => {
    // In a real implementation, this would call an API endpoint
    alert(`Syncing data from SIS system with ID: ${id}`);
  };

  // Render SIS integration tab
  const renderSisIntegrations = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Student Information Systems (SIS)
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Connect your SIS to automatically import student and teacher data.
        </Typography>
      </Grid>
      
      {sisSystems.map((system) => (
        <Grid item xs={12} md={6} key={system.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Storage sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {system.name}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Chip 
                  label={system.connected ? 'Connected' : 'Not Connected'} 
                  color={system.connected ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              
              {system.connected && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Last sync: {new Date(system.lastSync).toLocaleString()}
                </Typography>
              )}
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button 
                  variant={system.connected ? "outlined" : "contained"} 
                  onClick={() => handleOpenDialog('sis', system)}
                >
                  {system.connected ? 'Configure' : 'Connect'}
                </Button>
                
                {system.connected && (
                  <>
                    <Button 
                      variant="outlined" 
                      startIcon={<Check />}
                      onClick={() => handleTestSisConnection(system.id)}
                    >
                      Test
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<SystemUpdate />}
                      onClick={() => handleSyncSisData(system.id)}
                    >
                      Sync
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render webhooks tab
  const renderWebhooks = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Webhooks
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => handleOpenDialog('webhook')}
          >
            New Webhook
          </Button>
        </Box>
        <Typography variant="body2" color="textSecondary" paragraph>
          Webhooks allow external systems to receive real-time updates from Class Harmony.
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Paper>
          <List>
            {webhooks.map((webhook) => (
              <React.Fragment key={webhook.id}>
                <ListItem>
                  <ListItemIcon>
                    <LinkIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={webhook.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textSecondary">
                          {webhook.url}
                        </Typography>
                        <br />
                        <Chip 
                          label={webhook.event} 
                          size="small" 
                          sx={{ mr: 1, mt: 0.5 }}
                        />
                        <Chip 
                          label={webhook.active ? 'Active' : 'Inactive'} 
                          color={webhook.active ? 'success' : 'default'}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleToggleWebhook(webhook.id)}
                      title={webhook.active ? 'Deactivate' : 'Activate'}
                    >
                      {webhook.active ? <Close /> : <Check />}
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleOpenDialog('webhook', webhook)}
                      title="Edit"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleDeleteItem('webhook', webhook.id)}
                      title="Delete"
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            {webhooks.length === 0 && (
              <ListItem>
                <ListItemText 
                  primary="No webhooks configured" 
                  secondary="Click the 'New Webhook' button to create one."
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  // Render API documentation tab
  const renderApiDocs = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          API Documentation
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Access our API documentation to integrate with Class Harmony programmatically.
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Paper>
          <List>
            {availableApis.map((api) => (
              <React.Fragment key={api.id}>
                <ListItem button onClick={() => window.open(`/api-docs/${api.id}`, '_blank')}>
                  <ListItemIcon>
                    <Code />
                  </ListItemIcon>
                  <ListItemText 
                    primary={api.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textSecondary">
                          {api.description}
                        </Typography>
                        <br />
                        <Chip 
                          label={`${api.endpoints} endpoints`} 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Description sx={{ mr: 1 }} />
              <Typography variant="h6">
                API Documentation
              </Typography>
            </Box>
            <Typography variant="body2" paragraph>
              Complete API documentation with examples and schema references.
            </Typography>
            <Button variant="outlined" startIcon={<Description />}>
              View Documentation
            </Button>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CloudDownload sx={{ mr: 1 }} />
              <Typography variant="h6">
                Client Libraries
              </Typography>
            </Box>
            <Typography variant="body2" paragraph>
              Download client libraries for easy integration.
            </Typography>
            <Button variant="outlined" startIcon={<CloudDownload />}>
              Download SDK
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render settings tab
  const renderSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Integration Settings
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Configure global settings for all integrations.
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            API Access Control
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable API access"
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Require authentication for all API calls"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch />}
                label="Enable rate limiting"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum requests per minute"
                defaultValue="60"
                type="number"
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Webhook Settings
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable webhook delivery"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Include detailed event data"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch />}
                label="Enable webhook signing"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<Settings />}>
              Save Settings
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  // Render SIS configuration dialog
  const renderSisDialog = () => (
    <Dialog open={openDialog && dialogType === 'sis'} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {currentItem?.connected ? 'Configure SIS Connection' : 'Connect to SIS'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText paragraph>
          {currentItem?.connected
            ? `Configure your connection to ${currentItem?.name}.`
            : `Connect to ${currentItem?.name} to automatically import student and teacher data.`}
        </DialogContentText>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="API URL"
              defaultValue={currentItem?.connected ? 'https://api.example.com/v1' : ''}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="API Key"
              defaultValue={currentItem?.connected ? '••••••••••••••••' : ''}
              margin="normal"
              type="password"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Sync Frequency</InputLabel>
              <Select
                defaultValue={currentItem?.connected ? 'daily' : 'manual'}
                label="Sync Frequency"
              >
                <MenuItem value="manual">Manual only</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch defaultChecked={currentItem?.connected} />}
              label="Enable automatic sync"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch defaultChecked={currentItem?.connected} />}
              label="Include teacher data"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSaveDialog} color="primary" variant="contained">
          {currentItem?.connected ? 'Update' : 'Connect'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Render webhook configuration dialog
  const renderWebhookDialog = () => (
    <Dialog open={openDialog && dialogType === 'webhook'} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {currentItem ? 'Edit Webhook' : 'New Webhook'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText paragraph>
          Webhooks allow external systems to receive real-time updates from Class Harmony.
        </DialogContentText>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Webhook Name"
              defaultValue={currentItem?.name || ''}
              margin="normal"
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Payload URL"
              defaultValue={currentItem?.url || ''}
              margin="normal"
              required
              helperText="The URL that will receive the webhook payload"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Event Type</InputLabel>
              <Select
                defaultValue={currentItem?.event || ''}
                label="Event Type"
              >
                <MenuItem value="student.created">Student Created</MenuItem>
                <MenuItem value="student.updated">Student Updated</MenuItem>
                <MenuItem value="class.created">Class Created</MenuItem>
                <MenuItem value="class.updated">Class Updated</MenuItem>
                <MenuItem value="survey.completed">Survey Completed</MenuItem>
                <MenuItem value="placement-request.created">Placement Request Created</MenuItem>
                <MenuItem value="placement-request.approved">Placement Request Approved</MenuItem>
                <MenuItem value="placement-request.rejected">Placement Request Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch defaultChecked={currentItem?.active || true} />}
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSaveDialog} color="primary" variant="contained">
          {currentItem ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Integrations
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="integration tabs"
            variant="fullWidth"
          >
            <Tab label="SIS Integrations" />
            <Tab label="Webhooks" />
            <Tab label="API Documentation" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={activeTab} index={0}>
              {renderSisIntegrations()}
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              {renderWebhooks()}
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              {renderApiDocs()}
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              {renderSettings()}
            </TabPanel>
          </>
        )}
        
        {/* Dialogs */}
        {renderSisDialog()}
        {renderWebhookDialog()}
      </Box>
    </Container>
  );
};

export default Integrations; 