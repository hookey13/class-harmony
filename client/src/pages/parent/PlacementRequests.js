import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Badge,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Select,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import { useParentAuth } from '../../contexts/ParentAuthContext';
import api from '../../services/api';

// TabPanel component for tab contents
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`requests-tabpanel-${index}`}
      aria-labelledby={`requests-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PlacementRequests = () => {
  const navigate = useNavigate();
  const { currentParent } = useParentAuth();
  
  // State for requests data
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // State for tabbed interface
  const [tabValue, setTabValue] = useState(0);
  
  // State for actions menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  
  // State for delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Fetch requests data
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await api.get('/parent/placement-requests');
        setRequests(response.data.data || []);
        setError('');
      } catch (err) {
        console.error('Error fetching placement requests:', err);
        setError('Failed to load placement requests. Please try again later.');
        
        // For development purposes, let's provide mock data
        provideMockData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, []);
  
  // Provide mock data for development purposes
  const provideMockData = () => {
    const mockRequests = [
      {
        id: '1',
        studentId: '1',
        student: {
          id: '1',
          firstName: 'Emma',
          lastName: 'Johnson',
          grade: '3',
          currentClass: 'Mrs. Thompson - 3B',
          photo: 'https://placehold.co/100/9c27b0/white?text=EJ'
        },
        requestType: 'teacher',
        preferredTeacher: {
          id: '101',
          name: 'Mrs. Miller',
          grade: '4',
          class: '4A'
        },
        reasons: {
          academic: true,
          social: false,
          personality: true,
          specialNeeds: false
        },
        peerRequest: true,
        peerNames: 'Sophia Williams, Ethan Davis',
        additionalNotes: 'Emma works best with teachers who provide clear structure and frequent feedback.',
        status: 'pending',
        submittedAt: '2023-04-15T10:30:00Z',
        updatedAt: '2023-04-15T10:30:00Z'
      },
      {
        id: '2',
        studentId: '2',
        student: {
          id: '2',
          firstName: 'Noah',
          lastName: 'Johnson',
          grade: '1',
          currentClass: 'Mr. Davis - 1A',
          photo: 'https://placehold.co/100/2196f3/white?text=NJ'
        },
        requestType: 'placement',
        preferredPlacement: 'A classroom environment that allows for movement and hands-on learning.',
        reasons: {
          academic: false,
          social: true,
          personality: true,
          specialNeeds: false
        },
        peerRequest: false,
        peerNames: '',
        additionalNotes: 'Noah has difficulty sitting still for long periods and benefits from active learning methods.',
        status: 'approved',
        submittedAt: '2023-03-10T14:45:00Z',
        updatedAt: '2023-03-25T09:15:00Z',
        adminNotes: 'Placement in Ms. Wilson\'s class approved for next year.'
      },
      {
        id: '3',
        studentId: '3',
        student: {
          id: '3',
          firstName: 'Olivia',
          lastName: 'Johnson',
          grade: '5',
          currentClass: 'Mrs. Wilson - 5C',
          photo: 'https://placehold.co/100/4caf50/white?text=OJ'
        },
        requestType: 'teacher',
        preferredTeacher: {
          id: '103',
          name: 'Mrs. Chen',
          grade: '6',
          class: '6B'
        },
        reasons: {
          academic: true,
          social: true,
          personality: false,
          specialNeeds: false
        },
        peerRequest: true,
        peerNames: 'Liam Anderson, Ava Martinez',
        additionalNotes: 'Olivia excels in math and science and would benefit from Mrs. Chen\'s STEM focus.',
        status: 'rejected',
        submittedAt: '2023-02-20T11:00:00Z',
        updatedAt: '2023-03-05T13:30:00Z',
        adminNotes: 'Unable to accommodate due to class size constraints. Placed with Mr. Roberts who also has strong STEM credentials.'
      }
    ];
    
    setRequests(mockRequests);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (sortOption) => {
    if (sortBy === sortOption) {
      // Toggle direction if same sort option
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort option with default desc direction
      setSortBy(sortOption);
      setSortDirection('desc');
    }
  };
  
  // Open actions menu
  const handleMenuOpen = (event, requestId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedRequestId(requestId);
  };
  
  // Close actions menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Open delete confirmation dialog
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };
  
  // Close delete confirmation dialog
  const handleDeleteClose = () => {
    setOpenDeleteDialog(false);
  };
  
  // Confirm delete request
  const handleDeleteConfirm = async () => {
    if (!selectedRequestId) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/parent/placement-requests/${selectedRequestId}`);
      
      // Remove the deleted request from state
      setRequests(prev => prev.filter(request => request.id !== selectedRequestId));
      
      // Close the dialog
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting request:', err);
      setError('Failed to delete request. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Handle view request details
  const handleViewDetails = (requestId) => {
    navigate(`/parent/requests/${requestId}`);
    handleMenuClose();
  };
  
  // Handle edit request
  const handleEditRequest = (requestId) => {
    navigate(`/parent/requests/edit/${requestId}`);
    handleMenuClose();
  };
  
  // Filter requests based on search and status filter
  const getFilteredRequests = () => {
    return requests.filter(request => {
      // Filter by search query
      const searchMatch = searchQuery === '' ||
        request.student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.requestType === 'teacher' && 
          request.preferredTeacher?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (request.preferredPlacement && 
          request.preferredPlacement.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by status
      const statusMatch = statusFilter === 'all' || request.status === statusFilter;
      
      return searchMatch && statusMatch;
    });
  };
  
  // Sort filtered requests
  const getSortedRequests = () => {
    const filteredRequests = getFilteredRequests();
    
    return [...filteredRequests].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.submittedAt) - new Date(b.submittedAt);
      } else if (sortBy === 'student') {
        comparison = a.student.firstName.localeCompare(b.student.firstName);
      } else if (sortBy === 'grade') {
        comparison = a.student.grade - b.student.grade;
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });
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
      case 'pending': return <PendingIcon />;
      case 'approved': return <CheckCircleIcon />;
      case 'rejected': return <CancelIcon />;
      default: return <HourglassEmptyIcon />;
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get request reason text
  const getReasonText = (reasons) => {
    if (!reasons) return 'Not specified';
    
    const reasonTexts = [];
    if (reasons.academic) reasonTexts.push('Academic');
    if (reasons.social) reasonTexts.push('Social');
    if (reasons.personality) reasonTexts.push('Learning Style/Personality');
    if (reasons.specialNeeds) reasonTexts.push('Special Needs');
    
    return reasonTexts.length > 0 ? reasonTexts.join(', ') : 'Not specified';
  };
  
  const sortedRequests = getSortedRequests();
  const pendingRequests = requests.filter(request => request.status === 'pending');
  const approvedRequests = requests.filter(request => request.status === 'approved');
  const rejectedRequests = requests.filter(request => request.status === 'rejected');
  
  // Render request card
  const renderRequestCard = (request) => {
    return (
      <Card 
        key={request.id} 
        variant="outlined" 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Status badge */}
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <Chip 
            size="small"
            label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            color={getStatusChipColor(request.status)}
            icon={getStatusIcon(request.status)}
          />
        </Box>
        
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Student info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              src={request.student.photo} 
              alt={`${request.student.firstName} ${request.student.lastName}`}
              sx={{ width: 50, height: 50, mr: 2 }}
            />
            <Box>
              <Typography variant="h6" component="div">
                {request.student.firstName} {request.student.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Grade {request.student.grade} - {request.student.currentClass}
              </Typography>
            </Box>
          </Box>
          
          {/* Request details */}
          <Typography variant="subtitle1" fontWeight="medium">
            {request.requestType === 'teacher' ? 'Teacher Preference' : 'Placement Request'}
          </Typography>
          
          {request.requestType === 'teacher' && request.preferredTeacher && (
            <Typography variant="body2" paragraph>
              Preferred Teacher: <strong>{request.preferredTeacher.name}</strong> ({request.preferredTeacher.class})
            </Typography>
          )}
          
          {request.requestType === 'placement' && (
            <Typography variant="body2" paragraph>
              {request.preferredPlacement}
            </Typography>
          )}
          
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Reasons:</strong> {getReasonText(request.reasons)}
          </Typography>
          
          {request.peerRequest && (
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Peer Request:</strong> {request.peerNames}
            </Typography>
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <CalendarMonthIcon fontSize="small" sx={{ mr: 0.5 }} />
            Submitted on {formatDate(request.submittedAt)}
          </Typography>
          
          {/* Admin response for approved/rejected requests */}
          {(request.status === 'approved' || request.status === 'rejected') && request.adminNotes && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                School Response:
              </Typography>
              <Typography variant="body2">
                {request.adminNotes}
              </Typography>
            </Box>
          )}
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <Button 
            size="small" 
            onClick={() => handleViewDetails(request.id)}
          >
            View Details
          </Button>
          <IconButton 
            size="small"
            onClick={(e) => handleMenuOpen(e, request.id)}
            disabled={request.status !== 'pending'}
          >
            <MoreVertIcon />
          </IconButton>
        </CardActions>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <AssignmentIcon fontSize="large" sx={{ mr: 1 }} />
          Placement Requests
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/parent/requests/create')}
        >
          New Request
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : requests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Placement Requests Yet
          </Typography>
          <Typography variant="body1" paragraph>
            You haven't submitted any placement requests for your children.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/parent/requests/create')}
          >
            Create Your First Request
          </Button>
        </Paper>
      ) : (
        <>
          {/* Filters and controls */}
          <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search by student or teacher"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusFilterChange}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={12} md={5}>
                <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Button
                    startIcon={<SortIcon />}
                    onClick={() => handleSortChange('date')}
                    variant={sortBy === 'date' ? 'contained' : 'outlined'}
                    size="small"
                    color={sortBy === 'date' ? 'primary' : 'inherit'}
                  >
                    Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    startIcon={<SortIcon />}
                    onClick={() => handleSortChange('student')}
                    variant={sortBy === 'student' ? 'contained' : 'outlined'}
                    size="small"
                    color={sortBy === 'student' ? 'primary' : 'inherit'}
                  >
                    Student {sortBy === 'student' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    startIcon={<SortIcon />}
                    onClick={() => handleSortChange('status')}
                    variant={sortBy === 'status' ? 'contained' : 'outlined'}
                    size="small"
                    color={sortBy === 'status' ? 'primary' : 'inherit'}
                  >
                    Status {sortBy === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="placement requests tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label={
                  <Badge badgeContent={requests.length} color="primary" max={99}>
                    All Requests
                  </Badge>
                } 
                id="requests-tab-0" 
                aria-controls="requests-tabpanel-0"
              />
              <Tab 
                label={
                  <Badge badgeContent={pendingRequests.length} color="warning" max={99}>
                    Pending
                  </Badge>
                } 
                id="requests-tab-1" 
                aria-controls="requests-tabpanel-1"
              />
              <Tab 
                label={
                  <Badge badgeContent={approvedRequests.length} color="success" max={99}>
                    Approved
                  </Badge>
                } 
                id="requests-tab-2" 
                aria-controls="requests-tabpanel-2"
              />
              <Tab 
                label={
                  <Badge badgeContent={rejectedRequests.length} color="error" max={99}>
                    Rejected
                  </Badge>
                } 
                id="requests-tab-3" 
                aria-controls="requests-tabpanel-3"
              />
            </Tabs>
          </Box>
          
          {/* All Requests Tab */}
          <TabPanel value={tabValue} index={0}>
            {sortedRequests.length === 0 ? (
              <Alert severity="info">
                No requests match your filter criteria.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {sortedRequests.map(request => (
                  <Grid item xs={12} sm={6} md={4} key={request.id}>
                    {renderRequestCard(request)}
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
          
          {/* Pending Requests Tab */}
          <TabPanel value={tabValue} index={1}>
            {pendingRequests.length === 0 ? (
              <Alert severity="info">
                You have no pending requests.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {pendingRequests
                  .filter(request => {
                    const searchMatch = searchQuery === '' ||
                      request.student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      request.student.lastName.toLowerCase().includes(searchQuery.toLowerCase());
                    return searchMatch;
                  })
                  .map(request => (
                    <Grid item xs={12} sm={6} md={4} key={request.id}>
                      {renderRequestCard(request)}
                    </Grid>
                  ))}
              </Grid>
            )}
          </TabPanel>
          
          {/* Approved Requests Tab */}
          <TabPanel value={tabValue} index={2}>
            {approvedRequests.length === 0 ? (
              <Alert severity="info">
                You have no approved requests.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {approvedRequests
                  .filter(request => {
                    const searchMatch = searchQuery === '' ||
                      request.student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      request.student.lastName.toLowerCase().includes(searchQuery.toLowerCase());
                    return searchMatch;
                  })
                  .map(request => (
                    <Grid item xs={12} sm={6} md={4} key={request.id}>
                      {renderRequestCard(request)}
                    </Grid>
                  ))}
              </Grid>
            )}
          </TabPanel>
          
          {/* Rejected Requests Tab */}
          <TabPanel value={tabValue} index={3}>
            {rejectedRequests.length === 0 ? (
              <Alert severity="info">
                You have no rejected requests.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {rejectedRequests
                  .filter(request => {
                    const searchMatch = searchQuery === '' ||
                      request.student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      request.student.lastName.toLowerCase().includes(searchQuery.toLowerCase());
                    return searchMatch;
                  })
                  .map(request => (
                    <Grid item xs={12} sm={6} md={4} key={request.id}>
                      {renderRequestCard(request)}
                    </Grid>
                  ))}
              </Grid>
            )}
          </TabPanel>
        </>
      )}
      
      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewDetails(selectedRequestId)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEditRequest(selectedRequestId)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Request</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>
            Delete Request
          </ListItemText>
        </MenuItem>
      </Menu>
      
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

export default PlacementRequests;
