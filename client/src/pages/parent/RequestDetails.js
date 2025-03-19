import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Avatar,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  Comment as CommentIcon,
  StickyNote2 as StickyNote2Icon,
  People as PeopleIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { useParentAuth } from '../../contexts/ParentAuthContext';
import api from '../../services/api';

// Rendered when a parent views a specific placement request
const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentParent } = useParentAuth();
  
  // State for request data
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Fetch request data
  useEffect(() => {
    const fetchRequestDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/parent/placement-requests/${id}`);
        setRequest(response.data.data);
        setError('');
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError('Failed to load request details. Please try again later.');
        
        // For development purposes, let's provide mock data
        provideMockData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequestDetails();
  }, [id]);
  
  // Provide mock data for development purposes
  const provideMockData = () => {
    const mockRequest = {
      id: id,
      studentId: '1',
      student: {
        id: '1',
        firstName: 'Emma',
        lastName: 'Johnson',
        grade: '3',
        nextGrade: '4',
        currentClass: 'Mrs. Thompson - 3B',
        photo: 'https://placehold.co/100/9c27b0/white?text=EJ'
      },
      requestType: 'teacher',
      preferredTeacher: {
        id: '101',
        name: 'Mrs. Miller',
        grade: '4',
        class: '4A',
        bio: 'Experienced teacher with a focus on project-based learning.',
        photo: 'https://placehold.co/100/9c27b0/white?text=MM'
      },
      reasons: {
        academic: true,
        social: false,
        personality: true,
        specialNeeds: false
      },
      peerRequest: true,
      peerNames: 'Sophia Williams, Ethan Davis',
      additionalNotes: 'Emma works best with teachers who provide clear structure and frequent feedback. She thrives in environments where there are clear expectations and opportunities for creative expression.',
      status: 'pending',
      submittedAt: '2023-04-15T10:30:00Z',
      updatedAt: '2023-04-15T10:30:00Z',
      timeline: [
        {
          status: 'submitted',
          date: '2023-04-15T10:30:00Z',
          note: 'Request submitted by parent'
        },
        {
          status: 'review',
          date: '2023-04-17T11:15:00Z',
          note: 'Request under review by administration'
        }
      ],
      adminNotes: '',
      assignedClass: null
    };
    
    setRequest(mockRequest);
  };
  
  // Open delete confirmation dialog
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };
  
  // Close delete confirmation dialog
  const handleDeleteClose = () => {
    setOpenDeleteDialog(false);
  };
  
  // Confirm delete request
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/parent/placement-requests/${id}`);
      
      // Navigate back to requests list
      navigate('/parent/requests/placement');
    } catch (err) {
      console.error('Error deleting request:', err);
      setError('Failed to delete request. Please try again.');
    } finally {
      setDeleteLoading(false);
      setOpenDeleteDialog(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  // Get reason text
  const getReasonText = (reasons) => {
    if (!reasons) return 'Not specified';
    
    const reasonTexts = [];
    if (reasons.academic) reasonTexts.push('Academic');
    if (reasons.social) reasonTexts.push('Social');
    if (reasons.personality) reasonTexts.push('Learning Style/Personality');
    if (reasons.specialNeeds) reasonTexts.push('Special Needs');
    
    return reasonTexts.length > 0 ? reasonTexts.join(', ') : 'Not specified';
  };
  
  // Get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'review':
        return <PendingIcon />;
      case 'submitted':
        return <AssignmentIcon />;
      case 'approved':
        return <CheckCircleIcon />;
      case 'rejected':
        return <CancelIcon />;
      default:
        return <PendingIcon />;
    }
  };
  
  // Get timeline status color
  const getTimelineStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'info';
      case 'review': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };
  
  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  // Can user edit the request?
  const canEdit = request && request.status === 'pending';
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !request) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/parent/requests/placement')}
        >
          Back to Requests
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/parent/requests/placement')}
          sx={{ mb: 2 }}
        >
          Back to Requests
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon fontSize="large" sx={{ mr: 1 }} />
            Placement Request Details
          </Typography>
          
          <Chip 
            label={getStatusLabel(request.status)}
            color={getStatusChipColor(request.status)}
            icon={getStatusIcon(request.status)}
            sx={{ fontSize: '1rem', height: 32, px: 1 }}
          />
        </Box>
      </Box>
      
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Request Information
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                src={request.student.photo} 
                alt={`${request.student.firstName} ${request.student.lastName}`}
                sx={{ width: 60, height: 60, mr: 2 }}
              />
              <Box>
                <Typography variant="h6">
                  {request.student.firstName} {request.student.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current: Grade {request.student.grade} - {request.student.currentClass}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Next Year: Grade {request.student.nextGrade}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              {request.requestType === 'teacher' ? 'Teacher Preference' : 'Placement Request'}
            </Typography>
            
            {request.requestType === 'teacher' && request.preferredTeacher && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={request.preferredTeacher.photo} 
                    alt={request.preferredTeacher.name}
                    sx={{ width: 50, height: 50, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="subtitle1">
                      {request.preferredTeacher.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Grade {request.preferredTeacher.grade} - {request.preferredTeacher.class}
                    </Typography>
                    <Typography variant="body2">
                      {request.preferredTeacher.bio}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
            
            {request.requestType === 'placement' && request.preferredPlacement && (
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                {request.preferredPlacement}
              </Typography>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Reasons for Request:
                  </Typography>
                  <Typography variant="body1">
                    {getReasonText(request.reasons)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Submitted on:
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarMonthIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {formatDate(request.submittedAt)} at {formatTime(request.submittedAt)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {request.peerRequest && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Peer Request:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {request.peerNames}
                  </Typography>
                </Box>
              </Box>
            )}
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Additional Notes:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body1">
                  {request.additionalNotes || 'No additional notes provided.'}
                </Typography>
              </Paper>
            </Box>
            
            {(request.status === 'approved' || request.status === 'rejected') && request.adminNotes && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  School Response
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body1">
                    {request.adminNotes}
                  </Typography>
                </Paper>
              </Box>
            )}
            
            {request.status === 'approved' && request.assignedClass && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Placement Assignment
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                    borderColor: 'success.main'
                  }}
                >
                  <Typography variant="body1" fontWeight="medium">
                    Your child has been assigned to: {request.assignedClass}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
          
          {/* Actions Section */}
          {canEdit && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/parent/requests/edit/${request.id}`)}
                >
                  Edit Request
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteClick}
                >
                  Delete Request
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
        
        {/* Sidebar Content */}
        <Grid item xs={12} md={4}>
          {/* Request Timeline */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Request Timeline
            </Typography>
            
            <Stepper orientation="vertical" sx={{ mt: 2 }}>
              {request.timeline.map((event, index) => (
                <Step key={index} active={true} completed={true}>
                  <StepLabel 
                    StepIconComponent={() => (
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24,
                          bgcolor: `${getTimelineStatusColor(event.status)}.main`,
                          color: 'white'
                        }}
                      >
                        {getStatusIcon(event.status)}
                      </Avatar>
                    )}
                  >
                    <Typography variant="subtitle2">
                      {getStatusLabel(event.status)}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {formatDate(event.date)} at {formatTime(event.date)}
                    </Typography>
                    <Typography variant="body2">
                      {event.note}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>
          
          {/* Request Tips */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              About Placement Requests
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <LightbulbIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Placement requests are carefully reviewed by school administration."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Review process typically takes 2-3 weeks."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CommentIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="You'll be notified by email when there's an update to your request."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <StickyNote2Icon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="While all requests are considered, they cannot be guaranteed."
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this placement request? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RequestDetails;