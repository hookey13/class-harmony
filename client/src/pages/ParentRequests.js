import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  Divider,
  Tooltip,
  CircularProgress,
  Snackbar,
  Autocomplete,
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Badge,
  LinearProgress,
  List,
  ListItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useData } from '../contexts/DataContext';

// Status component with appropriate styling
const RequestStatus = ({ status }) => {
  let color = 'default';
  if (status === 'approved') color = 'success';
  if (status === 'pending') color = 'warning';
  if (status === 'declined') color = 'error';
  
  return (
    <Chip 
      label={status.charAt(0).toUpperCase() + status.slice(1)} 
      color={color} 
      size="small" 
      variant="outlined"
    />
  );
};

const RequestImpactAnalysis = ({ request, onClose, open }) => {
  const [loading, setLoading] = useState(true);
  const [impact, setImpact] = useState(null);
  
  useEffect(() => {
    if (open) {
      // Simulate API call to analyze impact
      const timer = setTimeout(() => {
        setImpact({
          compatible: Math.random() > 0.3,
          impactScore: Math.floor(Math.random() * 100),
          details: [
            { 
              factor: 'Class Balance', 
              impact: Math.floor(Math.random() * 10) - 5,
              description: Math.random() > 0.5 ? 'Slightly improves gender balance' : 'May negatively affect academic balance'
            },
            { 
              factor: 'Student Relationship', 
              impact: Math.floor(Math.random() * 10) - 5,
              description: Math.random() > 0.5 ? 'Students work well together' : 'Potential behavioral conflict'
            },
            { 
              factor: 'Teacher Compatibility', 
              impact: Math.floor(Math.random() * 10) - 5,
              description: Math.random() > 0.5 ? 'Compatible teaching style' : 'Teaching style may not be optimal for student'
            }
          ]
        });
        setLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [open, request]);
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Request Impact Analysis
        <Typography variant="subtitle2" color="textSecondary">
          {request?.type === 'classmate' ? 'Student with Student' : 'Student with Teacher'} Request
        </Typography>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Overall Compatibility:</Typography>
              <Chip 
                label={impact.compatible ? 'Compatible' : 'Potential Issues'}
                color={impact.compatible ? 'success' : 'warning'}
                icon={impact.compatible ? <CheckCircleIcon /> : <WarningIcon />}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Impact Score: {impact.impactScore}/100
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={impact.impactScore} 
                color={impact.impactScore > 70 ? 'success' : impact.impactScore > 40 ? 'warning' : 'error'}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            
            <Typography variant="h6" gutterBottom>Impact Details:</Typography>
            <List>
              {impact.details.map((detail, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: detail.impact > 0 ? 'success.light' : detail.impact < 0 ? 'error.light' : 'warning.light' 
                      }}>
                        {detail.impact > 0 ? '+' : detail.impact < 0 ? '-' : '='}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={detail.factor} 
                      secondary={detail.description}
                    />
                    <Chip 
                      label={detail.impact > 0 ? 'Positive' : detail.impact < 0 ? 'Negative' : 'Neutral'}
                      size="small"
                      color={detail.impact > 0 ? 'success' : detail.impact < 0 ? 'error' : 'default'}
                    />
                  </ListItem>
                  {index < impact.details.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        {!loading && (
          <Button 
            color={impact?.compatible ? 'success' : 'warning'}
            variant="contained"
            onClick={onClose}
          >
            {impact?.compatible ? 'Approve Request' : 'Review Carefully'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const ParentRequests = () => {
  const {
    selectedSchool,
    gradeLevels,
    teachers,
    students,
    parentRequests,
    isLoading,
    parentRequestsLoading,
    error,
    fetchParentRequests,
    createParentRequest,
    updateParentRequest,
    deleteParentRequest,
    fetchStudents,
    fetchTeachers,
  } = useData();
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    parentName: '',
    parentEmail: '',
    requestType: 'teacher',
    requestDetails: '',
    teacherId: '',
    friendStudentId: '',
    avoidStudentId: '',
  });
  
  // Current request being edited/deleted/viewed
  const [currentRequest, setCurrentRequest] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    gradeLevel: '',
    requestType: '',
  });
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // New state variables
  const [impactAnalysisOpen, setImpactAnalysisOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [conflictFilter, setConflictFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load data on component mount
  useEffect(() => {
    if (selectedSchool) {
      fetchParentRequests();
      fetchStudents();
      fetchTeachers();
    }
  }, [selectedSchool, fetchParentRequests, fetchStudents, fetchTeachers]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Apply filter based on tab
    let statusFilter = '';
    if (newValue === 1) statusFilter = 'pending';
    if (newValue === 2) statusFilter = 'approved';
    if (newValue === 3) statusFilter = 'declined';
    
    setFilters(prev => ({ ...prev, status: statusFilter }));
    fetchParentRequests({ status: statusFilter });
  };
  
  // Filter the parent requests based on filters
  const filteredRequests = parentRequests.filter(request => {
    if (filters.status && request.status !== filters.status) return false;
    if (filters.gradeLevel && request.gradeLevel !== filters.gradeLevel) return false;
    if (filters.requestType && request.requestType !== filters.requestType) return false;
    return true;
  });
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission for creating a request
  const handleCreateSubmit = async () => {
    try {
      // Validate form fields
      if (!formData.studentId || !formData.parentName || !formData.parentEmail || !formData.requestType) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error',
        });
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.parentEmail)) {
        setSnackbar({
          open: true,
          message: 'Please enter a valid email address',
          severity: 'error',
        });
        return;
      }
      
      // Additional validations based on request type
      if (formData.requestType === 'teacher' && !formData.teacherId) {
        setSnackbar({
          open: true,
          message: 'Please select a teacher',
          severity: 'error',
        });
        return;
      }
      
      if (formData.requestType === 'placement' && !formData.friendStudentId) {
        setSnackbar({
          open: true,
          message: 'Please select a student to place with',
          severity: 'error',
        });
        return;
      }
      
      if (formData.requestType === 'separation' && !formData.avoidStudentId) {
        setSnackbar({
          open: true,
          message: 'Please select a student to separate from',
          severity: 'error',
        });
        return;
      }
      
      // Get the student's grade level
      const student = students.find(s => s.id === formData.studentId);
      const gradeLevel = student ? student.grade : '';
      
      // Create the request
      const result = await createParentRequest({
        ...formData,
        schoolId: selectedSchool.id,
        gradeLevel,
      });
      
      if (result && result.success) {
        setSnackbar({
          open: true,
          message: 'Parent request created successfully',
          severity: 'success',
        });
        setOpenCreateDialog(false);
        resetForm();
      } else {
        throw new Error(result?.error || 'Failed to create request');
      }
    } catch (err) {
      console.error('Error creating parent request:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to create request',
        severity: 'error',
      });
    }
  };
  
  // Handle form submission for updating a request
  const handleUpdateSubmit = async () => {
    try {
      if (!currentRequest) return;
      
      // Update the request status
      const result = await updateParentRequest(currentRequest.id, formData);
      
      if (result && result.success) {
        setSnackbar({
          open: true,
          message: 'Parent request updated successfully',
          severity: 'success',
        });
        setOpenEditDialog(false);
        resetForm();
      } else {
        throw new Error(result?.error || 'Failed to update request');
      }
    } catch (err) {
      console.error('Error updating parent request:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update request',
        severity: 'error',
      });
    }
  };
  
  // Handle request deletion
  const handleDeleteSubmit = async () => {
    try {
      if (!currentRequest) return;
      
      const result = await deleteParentRequest(currentRequest.id);
      
      if (result && result.success) {
        setSnackbar({
          open: true,
          message: 'Parent request deleted successfully',
          severity: 'success',
        });
        setOpenDeleteDialog(false);
        resetForm();
      } else {
        throw new Error(result?.error || 'Failed to delete request');
      }
    } catch (err) {
      console.error('Error deleting parent request:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete request',
        severity: 'error',
      });
    }
  };
  
  // Handle request status update
  const handleStatusUpdate = async (requestId, newStatus, declineReason = '') => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'declined' && declineReason) {
        updateData.declineReason = declineReason;
      }
      
      const result = await updateParentRequest(requestId, updateData);
      
      if (result && result.success) {
        setSnackbar({
          open: true,
          message: `Request ${newStatus} successfully`,
          severity: 'success',
        });
      } else {
        throw new Error(result?.error || `Failed to ${newStatus} request`);
      }
    } catch (err) {
      console.error(`Error updating request status to ${newStatus}:`, err);
      setSnackbar({
        open: true,
        message: err.message || `Failed to ${newStatus} request`,
        severity: 'error',
      });
    }
  };
  
  // Open edit dialog and set current request
  const handleOpenEditDialog = (request) => {
    setCurrentRequest(request);
    setFormData({
      status: request.status,
      declineReason: request.declineReason || '',
    });
    setOpenEditDialog(true);
  };
  
  // Open view dialog and set current request
  const handleOpenViewDialog = (request) => {
    setCurrentRequest(request);
    setOpenViewDialog(true);
  };
  
  // Open delete dialog and set current request
  const handleOpenDeleteDialog = (request) => {
    setCurrentRequest(request);
    setOpenDeleteDialog(true);
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      studentId: '',
      parentName: '',
      parentEmail: '',
      requestType: 'teacher',
      requestDetails: '',
      teacherId: '',
      friendStudentId: '',
      avoidStudentId: '',
    });
    setCurrentRequest(null);
  };
  
  // Apply filters
  const applyFilters = () => {
    fetchParentRequests(filters);
    setOpenFilterDialog(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      gradeLevel: '',
      requestType: '',
    });
    fetchParentRequests();
    setOpenFilterDialog(false);
  };
  
  // Get student display name
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };
  
  // Get teacher display name
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher';
  };
  
  // Get request type display
  const getRequestTypeDisplay = (type) => {
    switch (type) {
      case 'teacher':
        return 'Teacher Preference';
      case 'placement':
        return 'Student Placement';
      case 'separation':
        return 'Student Separation';
      default:
        return type;
    }
  };
  
  // Handle show impact analysis
  const handleShowImpactAnalysis = (request) => {
    setSelectedRequest(request);
    setImpactAnalysisOpen(true);
  };
  
  // Get filtered requests
  const getFilteredRequests = () => {
    return parentRequests.filter(request => {
      // Status filter
      if (statusFilter !== 'all' && request.status !== statusFilter) return false;
      
      // Conflict filter
      if (conflictFilter && !request.hasConflicts) return false;
      
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesStudent = request.studentName.toLowerCase().includes(query);
        const matchesTarget = request.targetName.toLowerCase().includes(query);
        const matchesParent = request.parentName.toLowerCase().includes(query);
        
        if (!matchesStudent && !matchesTarget && !matchesParent) return false;
      }
      
      return true;
    });
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Parent Requests
        </Typography>
        <Box>
          <IconButton 
            onClick={() => fetchParentRequests()}
            disabled={isLoading || parentRequestsLoading}
            sx={{ mr: 1 }}
            color="primary"
          >
            {isLoading || parentRequestsLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
          <Button
            variant="contained"
            startIcon={<FilterIcon />}
            onClick={() => setOpenFilterDialog(true)}
            sx={{ mr: 1 }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            New Request
          </Button>
        </Box>
      </Box>
      
      {/* Display error if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Requests" />
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Declined" />
        </Tabs>
      </Paper>
      
      {/* Requests Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell>Request Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading || parentRequestsLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={30} sx={{ my: 3 }} />
                </TableCell>
              </TableRow>
            ) : getFilteredRequests().length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="text.secondary" sx={{ my: 3 }}>
                    No parent requests found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              getFilteredRequests().map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>{request.studentName}</TableCell>
                  <TableCell>{request.parentName}</TableCell>
                  <TableCell>{getRequestTypeDisplay(request.requestType)}</TableCell>
                  <TableCell>
                    <RequestStatus status={request.status} />
                  </TableCell>
                  <TableCell>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenViewDialog(request)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {request.status === 'pending' && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleStatusUpdate(request.id, 'approved')}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Decline">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenEditDialog(request)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="default"
                        onClick={() => handleOpenDeleteDialog(request)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Create Request Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Parent Request</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={students}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                onChange={(e, value) => setFormData(prev => ({ ...prev, studentId: value?.id || '' }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Student"
                    required
                    margin="normal"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="request-type-label">Request Type</InputLabel>
                <Select
                  labelId="request-type-label"
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleInputChange}
                  label="Request Type"
                  required
                >
                  <MenuItem value="teacher">Teacher Preference</MenuItem>
                  <MenuItem value="placement">Student Placement (Together)</MenuItem>
                  <MenuItem value="separation">Student Separation (Apart)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Parent Name"
                name="parentName"
                value={formData.parentName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Parent Email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                type="email"
              />
            </Grid>
            
            {/* Conditional fields based on request type */}
            {formData.requestType === 'teacher' && (
              <Grid item xs={12}>
                <Autocomplete
                  options={teachers}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                  onChange={(e, value) => setFormData(prev => ({ ...prev, teacherId: value?.id || '' }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Preferred Teacher"
                      required
                      margin="normal"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}
            
            {formData.requestType === 'placement' && (
              <Grid item xs={12}>
                <Autocomplete
                  options={students.filter(s => s.id !== formData.studentId)}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                  onChange={(e, value) => setFormData(prev => ({ ...prev, friendStudentId: value?.id || '' }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Student to Place With"
                      required
                      margin="normal"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}
            
            {formData.requestType === 'separation' && (
              <Grid item xs={12}>
                <Autocomplete
                  options={students.filter(s => s.id !== formData.studentId)}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                  onChange={(e, value) => setFormData(prev => ({ ...prev, avoidStudentId: value?.id || '' }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Student to Separate From"
                      required
                      margin="normal"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                label="Additional Details"
                name="requestDetails"
                value={formData.requestDetails}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateSubmit} variant="contained" color="primary">
            {isLoading || parentRequestsLoading ? <CircularProgress size={24} /> : 'Create Request'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Request Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Request Status</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="declined">Declined</MenuItem>
            </Select>
          </FormControl>
          
          {formData.status === 'declined' && (
            <TextField
              label="Reason for Declining"
              name="declineReason"
              value={formData.declineReason}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateSubmit} variant="contained" color="primary">
            {isLoading || parentRequestsLoading ? <CircularProgress size={24} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Request Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent dividers>
          {currentRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardHeader title="Student & Parent Information" />
                  <Divider />
                  <CardContent>
                    <Typography variant="subtitle2">Student:</Typography>
                    <Typography variant="body1" gutterBottom>{currentRequest.studentName}</Typography>
                    
                    <Typography variant="subtitle2">Parent:</Typography>
                    <Typography variant="body1" gutterBottom>{currentRequest.parentName}</Typography>
                    
                    <Typography variant="subtitle2">Email:</Typography>
                    <Typography variant="body1" gutterBottom>{currentRequest.parentEmail}</Typography>
                    
                    <Typography variant="subtitle2">Grade Level:</Typography>
                    <Typography variant="body1">
                      {gradeLevels.find(g => g.code === currentRequest.gradeLevel)?.name || 
                       `Grade ${currentRequest.gradeLevel}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardHeader 
                    title="Request Information" 
                    action={<RequestStatus status={currentRequest.status} />}
                  />
                  <Divider />
                  <CardContent>
                    <Typography variant="subtitle2">Request Type:</Typography>
                    <Typography variant="body1" gutterBottom>
                      {getRequestTypeDisplay(currentRequest.requestType)}
                    </Typography>
                    
                    {currentRequest.requestType === 'teacher' && (
                      <>
                        <Typography variant="subtitle2">Preferred Teacher:</Typography>
                        <Typography variant="body1" gutterBottom>
                          {getTeacherName(currentRequest.teacherId)}
                        </Typography>
                      </>
                    )}
                    
                    {currentRequest.requestType === 'placement' && (
                      <>
                        <Typography variant="subtitle2">Student to Place With:</Typography>
                        <Typography variant="body1" gutterBottom>
                          {getStudentName(currentRequest.friendStudentId)}
                        </Typography>
                      </>
                    )}
                    
                    {currentRequest.requestType === 'separation' && (
                      <>
                        <Typography variant="subtitle2">Student to Separate From:</Typography>
                        <Typography variant="body1" gutterBottom>
                          {getStudentName(currentRequest.avoidStudentId)}
                        </Typography>
                      </>
                    )}
                    
                    <Typography variant="subtitle2">Created On:</Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(currentRequest.createdAt).toLocaleString()}
                    </Typography>
                    
                    {currentRequest.updatedAt && (
                      <>
                        <Typography variant="subtitle2">Last Updated:</Typography>
                        <Typography variant="body1" gutterBottom>
                          {new Date(currentRequest.updatedAt).toLocaleString()}
                        </Typography>
                      </>
                    )}
                    
                    {currentRequest.status === 'declined' && currentRequest.declineReason && (
                      <>
                        <Typography variant="subtitle2">Reason for Declining:</Typography>
                        <Typography variant="body1" color="error">
                          {currentRequest.declineReason}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader title="Additional Details" />
                  <Divider />
                  <CardContent>
                    <Typography variant="body1">
                      {currentRequest.requestDetails || 'No additional details provided.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          {currentRequest && currentRequest.status === 'pending' && (
            <>
              <Button 
                onClick={() => {
                  setOpenViewDialog(false);
                  handleStatusUpdate(currentRequest.id, 'approved');
                }} 
                color="success"
              >
                Approve
              </Button>
              <Button 
                onClick={() => {
                  setOpenViewDialog(false);
                  handleOpenEditDialog(currentRequest);
                }} 
                color="error"
              >
                Decline
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this parent request? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteSubmit} color="error">
            {isLoading || parentRequestsLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Filter Dialog */}
      <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Requests</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="normal">
            <InputLabel id="filter-status-label">Status</InputLabel>
            <Select
              labelId="filter-status-label"
              name="status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              label="Status"
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="declined">Declined</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="filter-grade-label">Grade Level</InputLabel>
            <Select
              labelId="filter-grade-label"
              name="gradeLevel"
              value={filters.gradeLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, gradeLevel: e.target.value }))}
              label="Grade Level"
            >
              <MenuItem value="">All Grades</MenuItem>
              {gradeLevels.map(grade => (
                <MenuItem key={grade.id} value={grade.code}>
                  {grade.name || `Grade ${grade.code}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="filter-type-label">Request Type</InputLabel>
            <Select
              labelId="filter-type-label"
              name="requestType"
              value={filters.requestType}
              onChange={(e) => setFilters(prev => ({ ...prev, requestType: e.target.value }))}
              label="Request Type"
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="teacher">Teacher Preference</MenuItem>
              <MenuItem value="placement">Student Placement</MenuItem>
              <MenuItem value="separation">Student Separation</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters}>Reset</Button>
          <Button onClick={applyFilters} variant="contained" color="primary">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Request Impact Analysis Dialog */}
      <RequestImpactAnalysis 
        open={impactAnalysisOpen} 
        onClose={() => setImpactAnalysisOpen(false)}
        request={selectedRequest}
      />
    </Box>
  );
};

export default ParentRequests; 