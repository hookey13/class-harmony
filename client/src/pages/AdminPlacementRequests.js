import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

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

const AdminPlacementRequests = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State for requests data
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for tabbed interface
  const [tabValue, setTabValue] = useState(0);
  
  // State for action dialog
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(''); // 'approve', 'reject', 'delete'
  const [dialogLoading, setDialogLoading] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');
  const [assignedClass, setAssignedClass] = useState('');
  
  // Fetch requests data
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/placement-requests');
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
          nextGrade: '4',
          currentClass: 'Mrs. Thompson - 3B',
          photo: 'https://placehold.co/100/9c27b0/white?text=EJ'
        },
        parent: {
          id: '101',
          firstName: 'Michael',
          lastName: 'Johnson',
          email: 'michael.johnson@example.com'
        },
        requestType: 'teacher',
        preferredTeacher: {
          id: '201',
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
        updatedAt: '2023-04-15T10:30:00Z',
        adminNotes: '',
        assignedClass: null
      },
      {
        id: '2',
        studentId: '2',
        student: {
          id: '2',
          firstName: 'Noah',
          lastName: 'Johnson',
          grade: '1',
          nextGrade: '2',
          currentClass: 'Mr. Davis - 1A',
          photo: 'https://placehold.co/100/2196f3/white?text=NJ'
        },
        parent: {
          id: '101',
          firstName: 'Michael',
          lastName: 'Johnson',
          email: 'michael.johnson@example.com'
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
        adminNotes: 'Placement in Ms. Wilson\'s class approved for next year.',
        assignedClass: 'Ms. Wilson - 2B'
      },
      {
        id: '3',
        studentId: '3',
        student: {
          id: '3',
          firstName: 'Olivia',
          lastName: 'Smith',
          grade: '5',
          nextGrade: '6',
          currentClass: 'Mrs. Wilson - 5C',
          photo: 'https://placehold.co/100/4caf50/white?text=OS'
        },
        parent: {
          id: '102',
          firstName: 'Jennifer',
          lastName: 'Smith',
          email: 'jennifer.smith@example.com'
        },
        requestType: 'teacher',
        preferredTeacher: {
          id: '202',
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
        adminNotes: 'Unable to accommodate due to class size constraints. Placed with Mr. Roberts who also has strong STEM credentials.',
        assignedClass: 'Mr. Roberts - 6A'
      }
    ];
    
    // Add more mock requests to test pagination
    for (let i = 4; i <= 25; i++) {
      mockRequests.push({
        id: `${i}`,
        studentId: `${i}`,
        student: {
          id: `${i}`,
          firstName: `Student`,
          lastName: `${i}`,
          grade: Math.floor(Math.random() * 6) + 1,
          nextGrade: Math.floor(Math.random() * 6) + 2,
          currentClass: `Teacher ${i % 5} - ${i % 3}${String.fromCharCode(65 + (i % 3))}`,
          photo: `https://placehold.co/100/4caf50/white?text=S${i}`
        },
        parent: {
          id: `${100 + i}`,
          firstName: `Parent`,
          lastName: `${i}`,
          email: `parent${i}@example.com`
        },
        requestType: i % 2 === 0 ? 'teacher' : 'placement',
        preferredTeacher: i % 2 === 0 ? {
          id: `${200 + i}`,
          name: `Teacher ${i % 5}`,
          grade: Math.floor(Math.random() * 6) + 1,
          class: `${Math.floor(Math.random() * 6) + 1}${String.fromCharCode(65 + (i % 3))}`
        } : null,
        preferredPlacement: i % 2 !== 0 ? `Preferred placement description for student ${i}` : null,
        reasons: {
          academic: i % 2 === 0,
          social: i % 3 === 0,
          personality: i % 4 === 0,
          specialNeeds: i % 5 === 0
        },
        peerRequest: i % 3 === 0,
        peerNames: i % 3 === 0 ? `Peer ${i+1}, Peer ${i+2}` : '',
        additionalNotes: `Additional notes for request ${i}`,
        status: ['pending', 'approved', 'rejected'][i % 3],
        submittedAt: new Date(2023, Math.floor(Math.random() * 5), Math.floor(Math.random() * 28) + 1).toISOString(),
        updatedAt: new Date(2023, Math.floor(Math.random() * 5), Math.floor(Math.random() * 28) + 1).toISOString(),
        adminNotes: ['pending', 'approved', 'rejected'][i % 3] !== 'pending' ? `Admin notes for request ${i}` : '',
        assignedClass: ['pending', 'approved', 'rejected'][i % 3] === 'approved' ? 
          `Teacher ${i % 7} - ${Math.floor(Math.random() * 6) + 1}${String.fromCharCode(65 + (i % 3))}` : null
      });
    }
    
    setRequests(mockRequests);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset pagination when changing tabs
    setPage(0);
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    // Reset pagination when search changes
    setPage(0);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    // Reset pagination when filters change
    setPage(0);
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
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filter requests based on search and status filter
  const getFilteredRequests = () => {
    return requests.filter(request => {
      // Filter by search query
      const searchMatch = searchQuery === '' ||
        request.student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.parent.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.parent.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.requestType === 'teacher' && 
          request.preferredTeacher?.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by status
      const statusMatch = statusFilter === 'all' || request.status === statusFilter;
      
      // Filter by tab
      let tabMatch = true;
      if (tabValue === 1) {
        tabMatch = request.status === 'pending';
      } else if (tabValue === 2) {
        tabMatch = request.status === 'approved';
      } else if (tabValue === 3) {
        tabMatch = request.status === 'rejected';
      }
      
      return searchMatch && statusMatch && tabMatch;
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
        comparison = `${a.student.lastName} ${a.student.firstName}`.localeCompare(`${b.student.lastName} ${b.student.firstName}`);
      } else if (sortBy === 'grade') {
        comparison = a.student.grade - b.student.grade;
      } else if (sortBy === 'parent') {
        comparison = `${a.parent.lastName} ${a.parent.firstName}`.localeCompare(`${b.parent.lastName} ${b.parent.firstName}`);
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
      default: return <PendingIcon />;
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
  
  // Open action dialog
  const handleOpenDialog = (request, action) => {
    setSelectedRequest(request);
    setDialogAction(action);
    setResponseNotes('');
    setAssignedClass(action === 'approve' ? request.assignedClass || '' : '');
    setOpenDialog(true);
  };
  
  // Close action dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogLoading(false);
  };
  
  // Submit request action
  const handleSubmitAction = async () => {
    if (!selectedRequest) return;
    
    setDialogLoading(true);
    
    try {
      let actionEndpoint = '';
      let actionData = {};
      
      switch (dialogAction) {
        case 'approve':
          actionEndpoint = `/admin/placement-requests/${selectedRequest.id}/approve`;
          actionData = {
            adminNotes: responseNotes,
            assignedClass: assignedClass
          };
          break;
        case 'reject':
          actionEndpoint = `/admin/placement-requests/${selectedRequest.id}/reject`;
          actionData = {
            adminNotes: responseNotes
          };
          break;
        case 'delete':
          actionEndpoint = `/admin/placement-requests/${selectedRequest.id}`;
          break;
        default:
          throw new Error('Invalid action');
      }
      
      if (dialogAction === 'delete') {
        await api.delete(actionEndpoint);
        
        // Remove from state
        setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      } else {
        const response = await api.post(actionEndpoint, actionData);
        
        // Update in state
        setRequests(prev => prev.map(req => 
          req.id === selectedRequest.id ? { ...req, ...response.data.data } : req
        ));
      }
      
      // Close dialog
      handleCloseDialog();
      
      // For development mockup, update the request in state
      if (process.env.NODE_ENV === 'development') {
        const updatedRequests = [...requests];
        const requestIndex = updatedRequests.findIndex(req => req.id === selectedRequest.id);
        
        if (requestIndex !== -1) {
          if (dialogAction === 'delete') {
            updatedRequests.splice(requestIndex, 1);
          } else {
            updatedRequests[requestIndex] = {
              ...updatedRequests[requestIndex],
              status: dialogAction === 'approve' ? 'approved' : 'rejected',
              adminNotes: responseNotes,
              assignedClass: dialogAction === 'approve' ? assignedClass : null,
              updatedAt: new Date().toISOString()
            };
          }
          
          setRequests(updatedRequests);
        }
      }
    } catch (err) {
      console.error(`Error ${dialogAction}ing request:`, err);
      setError(`Failed to ${dialogAction} request. Please try again.`);
    } finally {
      setDialogLoading(false);
    }
  };
  
  // Count requests by status
  const pendingRequests = requests.filter(request => request.status === 'pending');
  const approvedRequests = requests.filter(request => request.status === 'approved');
  const rejectedRequests = requests.filter(request => request.status === 'rejected');
  
  // Get current page data
  const sortedRequests = getSortedRequests();
  const paginatedRequests = sortedRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AssignmentIcon fontSize="large" sx={{ mr: 1 }} />
        Parent Placement Requests
      </Typography>
      
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
            No Placement Requests
          </Typography>
          <Typography variant="body1">
            There are no parent placement requests to review at this time.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Filters and controls */}
          <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search by student or parent name"
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
                <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
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
                    onClick={() => handleSortChange('grade')}
                    variant={sortBy === 'grade' ? 'contained' : 'outlined'}
                    size="small"
                    color={sortBy === 'grade' ? 'primary' : 'inherit'}
                  >
                    Grade {sortBy === 'grade' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </Button>
                </Box>
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
          
          {/* Requests Table */}
          <TableContainer component={Paper} sx={{ mt: 2, mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Parent</TableCell>
                  <TableCell>Request Type</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No requests match your current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRequests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        {request.student.firstName} {request.student.lastName}
                      </TableCell>
                      <TableCell>
                        {request.student.grade} → {request.student.nextGrade}
                      </TableCell>
                      <TableCell>
                        {request.parent.firstName} {request.parent.lastName}
                      </TableCell>
                      <TableCell>
                        {request.requestType === 'teacher' ? (
                          <>Teacher: {request.preferredTeacher?.name}</>
                        ) : (
                          <>Placement</>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(request.submittedAt)}</TableCell>
                      <TableCell>
                        <Chip 
                          size="small"
                          label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          color={getStatusChipColor(request.status)}
                          icon={getStatusIcon(request.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            onClick={() => navigate(`/admin/placement-requests/${request.id}`)}
                            variant="outlined"
                          >
                            View
                          </Button>
                          
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="small"
                                color="success"
                                onClick={() => handleOpenDialog(request, 'approve')}
                                variant="outlined"
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleOpenDialog(request, 'reject')}
                                variant="outlined"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <TablePagination
            component="div"
            count={sortedRequests.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}
      
      {/* Approve Dialog */}
      <Dialog
        open={openDialog && dialogAction === 'approve'}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Approve Placement Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Request for {selectedRequest.student.firstName} {selectedRequest.student.lastName} (Grade {selectedRequest.student.grade})
              </Typography>
              
              <TextField
                label="Assigned Class"
                fullWidth
                margin="normal"
                variant="outlined"
                value={assignedClass}
                onChange={(e) => setAssignedClass(e.target.value)}
                required
                error={assignedClass.trim() === ''}
                helperText={assignedClass.trim() === '' ? 'Assigned class is required' : ''}
              />
              
              <TextField
                label="Response Notes"
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                placeholder="Provide additional information about the approved placement."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            disabled={dialogLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitAction} 
            color="success" 
            variant="contained"
            disabled={dialogLoading || assignedClass.trim() === ''}
            startIcon={dialogLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {dialogLoading ? 'Processing...' : 'Approve Request'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog
        open={openDialog && dialogAction === 'reject'}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Reject Placement Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Request for {selectedRequest.student.firstName} {selectedRequest.student.lastName} (Grade {selectedRequest.student.grade})
              </Typography>
              
              <TextField
                label="Rejection Reason"
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                required
                error={responseNotes.trim() === ''}
                helperText={responseNotes.trim() === '' ? 'Rejection reason is required' : 'Please provide a clear explanation for the parent.'}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            disabled={dialogLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitAction} 
            color="error" 
            variant="contained"
            disabled={dialogLoading || responseNotes.trim() === ''}
            startIcon={dialogLoading ? <CircularProgress size={20} /> : <CancelIcon />}
          >
            {dialogLoading ? 'Processing...' : 'Reject Request'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog
        open={openDialog && dialogAction === 'delete'}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          Delete Placement Request
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this placement request? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            disabled={dialogLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitAction} 
            color="error" 
            variant="contained"
            disabled={dialogLoading}
            startIcon={dialogLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {dialogLoading ? 'Deleting...' : 'Delete Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPlacementRequests;
