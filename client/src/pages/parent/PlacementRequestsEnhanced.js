import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import {
  Add,
  School,
  Person,
  Edit,
  Delete,
  History,
  MoreVert,
  Send,
  Comment,
  Schedule,
  Check,
  Close,
  Warning,
  Info,
  CheckCircle,
  AccessTime,
  Assignment,
  Message,
  ArrowForward,
  Feedback,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import { useParentAuth } from '../../contexts/ParentAuthContext';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`request-tabpanel-${index}`}
      aria-labelledby={`request-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const PlacementRequestsEnhanced = () => {
  const navigate = useNavigate();
  const { parent } = useParentAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    closed: 0,
  });

  // Mock data for development
  const mockRequests = [
    {
      id: 1,
      studentName: 'Emma Johnson',
      studentGrade: '3rd Grade',
      requestType: 'Teacher Preference',
      status: 'pending',
      createdAt: '2023-05-15T09:30:00',
      updatedAt: '2023-05-15T09:30:00',
      preferredTeacher: 'Ms. Wilson',
      reasonForRequest: 'Emma works well with teachers who provide structured environments.',
      adminResponse: null,
      timeline: [
        { 
          id: 1, 
          date: '2023-05-15T09:30:00', 
          action: 'Request Created', 
          description: 'Placement request submitted successfully', 
          actor: 'Parent' 
        },
        { 
          id: 2, 
          date: '2023-05-16T14:22:00', 
          action: 'Request Viewed', 
          description: 'Request viewed by administration', 
          actor: 'Admin' 
        }
      ],
      messages: [
        {
          id: 1,
          date: '2023-05-16T15:45:00',
          text: 'Thank you for your request. We will review it with the teaching team.',
          sender: 'Admin',
          read: true
        }
      ]
    },
    {
      id: 2,
      studentName: 'Liam Smith',
      studentGrade: '1st Grade',
      requestType: 'Peer Placement',
      status: 'approved',
      createdAt: '2023-05-10T11:20:00',
      updatedAt: '2023-05-14T15:45:00',
      preferredPeers: 'Noah Davis, Olivia Wilson',
      reasonForRequest: 'Liam works well collaboratively with these peers and they support each other\'s learning.',
      adminResponse: 'We\'ve been able to place Liam with Noah. We couldn\'t accommodate placing him with Olivia due to classroom balance requirements.',
      assignedClass: 'Class 1B - Mrs. Thompson',
      timeline: [
        { 
          id: 1, 
          date: '2023-05-10T11:20:00', 
          action: 'Request Created', 
          description: 'Placement request submitted successfully', 
          actor: 'Parent' 
        },
        { 
          id: 2, 
          date: '2023-05-11T09:15:00', 
          action: 'Request Viewed', 
          description: 'Request viewed by administration', 
          actor: 'Admin' 
        },
        { 
          id: 3, 
          date: '2023-05-13T13:10:00', 
          action: 'Request Discussed', 
          description: 'Request discussed in placement team meeting', 
          actor: 'Admin' 
        },
        { 
          id: 4, 
          date: '2023-05-14T15:45:00', 
          action: 'Request Approved', 
          description: 'Request approved with partial accommodation', 
          actor: 'Admin' 
        }
      ],
      messages: [
        {
          id: 1,
          date: '2023-05-11T10:30:00',
          text: 'We\'ve received your placement request and will review it during our next placement meeting.',
          sender: 'Admin',
          read: true
        },
        {
          id: 2,
          date: '2023-05-14T15:45:00',
          text: 'We\'ve been able to approve your request partially. Liam will be placed with Noah, but we couldn\'t accommodate placing him with Olivia due to classroom balance.',
          sender: 'Admin',
          read: true
        }
      ]
    },
    {
      id: 3,
      studentName: 'Sophia Martinez',
      studentGrade: 'Kindergarten',
      requestType: 'Learning Environment',
      status: 'rejected',
      createdAt: '2023-05-08T08:45:00',
      updatedAt: '2023-05-13T11:30:00',
      environmentPreference: 'Structured classroom with clear routines',
      reasonForRequest: 'Sophia thrives in environments with clear expectations and consistent routines.',
      adminResponse: 'We are unable to accommodate this specific request as all our kindergarten classrooms follow a similar teaching approach. However, we have noted Sophia\'s needs in her file for her teacher to consider.',
      rejectionReason: 'Cannot accommodate specific classroom environment preference',
      timeline: [
        { 
          id: 1, 
          date: '2023-05-08T08:45:00', 
          action: 'Request Created', 
          description: 'Placement request submitted successfully', 
          actor: 'Parent' 
        },
        { 
          id: 2, 
          date: '2023-05-09T10:20:00', 
          action: 'Request Viewed', 
          description: 'Request viewed by administration', 
          actor: 'Admin' 
        },
        { 
          id: 3, 
          date: '2023-05-13T11:30:00', 
          action: 'Request Rejected', 
          description: 'Request could not be accommodated', 
          actor: 'Admin' 
        }
      ],
      messages: [
        {
          id: 1,
          date: '2023-05-09T14:15:00',
          text: 'Thank you for your placement request. We\'ll review it with our kindergarten team.',
          sender: 'Admin',
          read: true
        },
        {
          id: 2,
          date: '2023-05-13T11:30:00',
          text: 'After careful consideration, we\'re unable to accommodate this specific request as all our kindergarten classrooms follow a similar teaching approach. We\'ve noted Sophia\'s needs in her file for her teacher to consider.',
          sender: 'Admin',
          read: true
        }
      ]
    }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      setRequests(mockRequests);
      
      // Calculate status counts
      const counts = mockRequests.reduce((acc, request) => {
        acc[request.status] = (acc[request.status] || 0) + 1;
        return acc;
      }, {pending: 0, approved: 0, rejected: 0, closed: 0});
      
      setStatusCounts(counts);
      
    } catch (err) {
      setError('Error fetching placement requests: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type, request = null) => {
    setDialogType(type);
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
    setFeedbackText('');
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setActiveTab(1);
  };

  const handleFeedbackChange = (event) => {
    setFeedbackText(event.target.value);
  };

  const handleSendFeedback = () => {
    // In a real implementation, this would send feedback to the backend
    alert(`Feedback sent: ${feedbackText}`);
    handleCloseDialog();
  };

  const handleMenuOpen = (event, request) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditRequest = () => {
    handleMenuClose();
    navigate(`/parent/requests/edit/${selectedRequest.id}`);
  };

  const handleDeleteRequest = () => {
    handleMenuClose();
    handleOpenDialog('delete');
  };

  const handleConfirmDelete = () => {
    // In a real implementation, this would call an API endpoint
    setRequests(requests.filter(r => r.id !== selectedRequest.id));
    handleCloseDialog();
  };

  const handleCreateRequest = () => {
    navigate('/parent/requests/create');
  };

  // Get chip color based on status
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'rejected':
        return <Close />;
      case 'pending':
        return <AccessTime />;
      case 'closed':
        return <Info />;
      default:
        return <Info />;
    }
  };

  // Get timeline dot color based on action
  const getTimelineDotColor = (action) => {
    if (action.includes('Created')) return 'info';
    if (action.includes('Viewed')) return 'secondary';
    if (action.includes('Discussed')) return 'warning';
    if (action.includes('Approved')) return 'success';
    if (action.includes('Rejected')) return 'error';
    return 'grey';
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render placement requests list
  const renderRequestsList = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            My Placement Requests
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateRequest}
          >
            New Request
          </Button>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <CardContent>
                  <Typography variant="h4">{statusCounts.pending || 0}</Typography>
                  <Typography variant="body2">Pending</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent>
                  <Typography variant="h4">{statusCounts.approved || 0}</Typography>
                  <Typography variant="body2">Approved</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                <CardContent>
                  <Typography variant="h4">{statusCounts.rejected || 0}</Typography>
                  <Typography variant="body2">Rejected</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', bgcolor: 'grey.300' }}>
                <CardContent>
                  <Typography variant="h4">{statusCounts.closed || 0}</Typography>
                  <Typography variant="body2">Closed</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      {requests.length > 0 ? (
        requests.map((request) => (
          <Grid item xs={12} key={request.id}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <School />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {request.studentName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {request.studentGrade} • {request.requestType}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Chip
                        icon={getStatusIcon(request.status)}
                        label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        color={getStatusChipColor(request.status)}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(request.createdAt)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, request)}
                        sx={{ ml: 1 }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <Typography component="span" fontWeight="bold">Request: </Typography>
                  {request.reasonForRequest}
                </Typography>
                
                {request.status !== 'pending' && (
                  <Typography variant="body2">
                    <Typography component="span" fontWeight="bold">Response: </Typography>
                    {request.adminResponse || 'No response yet'}
                  </Typography>
                )}
                
                {request.status === 'approved' && request.assignedClass && (
                  <Chip
                    icon={<CheckCircle />}
                    label={`Assigned to: ${request.assignedClass}`}
                    color="success"
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                {request.messages && request.messages.length > 0 && (
                  <Chip
                    icon={<Message />}
                    label={`${request.messages.length} message${request.messages.length > 1 ? 's' : ''}`}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                )}
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => handleViewDetails(request)}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              You haven't submitted any placement requests yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateRequest}
              sx={{ mt: 2 }}
            >
              Create Your First Request
            </Button>
          </Paper>
        </Grid>
      )}
    </Grid>
  );

  // Render request details
  const renderRequestDetails = () => {
    if (!selectedRequest) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            Select a request to view details
          </Typography>
        </Paper>
      );
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => setActiveTab(0)}
              startIcon={<ArrowForward sx={{ transform: 'rotate(180deg)' }} />}
            >
              Back to List
            </Button>
            <Chip
              icon={getStatusIcon(selectedRequest.status)}
              label={selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
              color={getStatusChipColor(selectedRequest.status)}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Request Details
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Student
                </Typography>
                <Typography variant="body1">
                  {selectedRequest.studentName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Grade
                </Typography>
                <Typography variant="body1">
                  {selectedRequest.studentGrade}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Request Type
                </Typography>
                <Typography variant="body1">
                  {selectedRequest.requestType}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Date Submitted
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedRequest.createdAt)}
                </Typography>
              </Grid>
            </Grid>
            
            <Typography variant="subtitle2" color="textSecondary">
              Request Details
            </Typography>
            <Typography variant="body1" paragraph>
              {selectedRequest.reasonForRequest}
            </Typography>
            
            {selectedRequest.preferredTeacher && (
              <>
                <Typography variant="subtitle2" color="textSecondary">
                  Preferred Teacher
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedRequest.preferredTeacher}
                </Typography>
              </>
            )}
            
            {selectedRequest.preferredPeers && (
              <>
                <Typography variant="subtitle2" color="textSecondary">
                  Preferred Peers
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedRequest.preferredPeers}
                </Typography>
              </>
            )}
            
            {selectedRequest.environmentPreference && (
              <>
                <Typography variant="subtitle2" color="textSecondary">
                  Learning Environment Preference
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedRequest.environmentPreference}
                </Typography>
              </>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Administrative Response
            </Typography>
            
            {selectedRequest.status === 'approved' && (
              <>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Your request has been approved.
                </Alert>
                <Typography variant="subtitle2" color="textSecondary">
                  Response Notes
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedRequest.adminResponse || 'No additional notes provided.'}
                </Typography>
                {selectedRequest.assignedClass && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Assigned Class
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedRequest.assignedClass}
                    </Typography>
                  </>
                )}
              </>
            )}
            
            {selectedRequest.status === 'rejected' && (
              <>
                <Alert severity="error" sx={{ mb: 2 }}>
                  Your request has been declined.
                </Alert>
                <Typography variant="subtitle2" color="textSecondary">
                  Reason for Rejection
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedRequest.rejectionReason || 'No specific reason provided.'}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Additional Notes
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedRequest.adminResponse || 'No additional notes provided.'}
                </Typography>
              </>
            )}
            
            {selectedRequest.status === 'pending' && (
              <Alert severity="info">
                Your request is currently under review. We'll notify you when a decision has been made.
              </Alert>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              {selectedRequest.status === 'pending' && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Edit />}
                  onClick={handleEditRequest}
                  sx={{ mr: 1 }}
                >
                  Edit Request
                </Button>
              )}
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<Feedback />}
                onClick={() => handleOpenDialog('feedback')}
              >
                Provide Feedback
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status Timeline
            </Typography>
            <Timeline position="right">
              {selectedRequest.timeline.map((event) => (
                <TimelineItem key={event.id}>
                  <TimelineOppositeContent color="text.secondary" sx={{ maxWidth: '30%' }}>
                    {formatDate(event.date)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={getTimelineDotColor(event.action)} />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body1" component="span" fontWeight="bold">
                      {event.action}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.description}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
          
          {selectedRequest.messages && selectedRequest.messages.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Messages
              </Typography>
              <List>
                {selectedRequest.messages.map((message) => (
                  <React.Fragment key={message.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: message.sender === 'Admin' ? 'primary.main' : 'secondary.main' }}>
                          {message.sender === 'Admin' ? <Person /> : parent?.firstName?.charAt(0) || 'P'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={message.sender}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {message.text}
                            </Typography>
                            <Typography
                              component="div"
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              {formatDate(message.date)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ display: 'flex', mt: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<Send />}
                >
                  Send
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    );
  };

  // Render feedback dialog
  const renderFeedbackDialog = () => (
    <Dialog open={openDialog && dialogType === 'feedback'} onClose={handleCloseDialog} fullWidth maxWidth="sm">
      <DialogTitle>Provide Feedback</DialogTitle>
      <DialogContent>
        <DialogContentText paragraph>
          Your feedback helps us improve our placement process. Please share any thoughts or concerns about your request.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Your Feedback"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={feedbackText}
          onChange={handleFeedbackChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSendFeedback} color="primary" variant="contained" disabled={!feedbackText.trim()}>
          Send Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Render delete confirmation dialog
  const renderDeleteDialog = () => (
    <Dialog open={openDialog && dialogType === 'delete'} onClose={handleCloseDialog}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this placement request? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirmDelete} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Options menu
  const renderOptionsMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      {selectedRequest && selectedRequest.status === 'pending' && (
        <MenuItem onClick={handleEditRequest}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit Request" />
        </MenuItem>
      )}
      <MenuItem onClick={handleDeleteRequest}>
        <ListItemIcon>
          <Delete fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Delete Request" />
      </MenuItem>
    </Menu>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Placement Requests
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="placement requests tabs"
          sx={{ mb: 3 }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge badgeContent={requests.length} color="primary" sx={{ mr: 1 }}>
                  <Assignment />
                </Badge>
                My Requests
              </Box>
            } 
          />
          <Tab 
            label="Request Details" 
            disabled={!selectedRequest} 
          />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={activeTab} index={0}>
              {renderRequestsList()}
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              {renderRequestDetails()}
            </TabPanel>
          </>
        )}
        
        {/* Dialogs */}
        {renderFeedbackDialog()}
        {renderDeleteDialog()}
        {renderOptionsMenu()}
      </Box>
    </Container>
  );
};

export default PlacementRequestsEnhanced; 