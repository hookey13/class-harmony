import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  TablePagination,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useParentAuth } from '../../contexts/ParentAuthContext';
import parentRequestsService from '../../services/parentRequestsService';

const RequestsList = () => {
  const { currentParent } = useParentAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const navigate = useNavigate();

  // Get status options for coloring chips
  const statusOptions = parentRequestsService.getStatusOptions();
  
  // Get request type options for display
  const requestTypeOptions = parentRequestsService.getRequestTypeOptions();

  // Fetch parent requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentParent) return;
      
      try {
        setLoading(true);
        const response = await parentRequestsService.getMyRequests();
        setRequests(response.data || []);
        setError('');
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to load placement requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentParent]);

  // Filter requests based on search term
  const filteredRequests = requests.filter(request => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      request.student?.firstName?.toLowerCase().includes(searchTermLower) ||
      request.student?.lastName?.toLowerCase().includes(searchTermLower) ||
      (requestTypeOptions.find(option => option.value === request.requestType)?.label || '')
        .toLowerCase().includes(searchTermLower) ||
      request.status.toLowerCase().includes(searchTermLower) ||
      request.details?.toLowerCase().includes(searchTermLower)
    );
  });

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Delete handlers
  const handleOpenDeleteDialog = (request) => {
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRequestToDelete(null);
  };
  
  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    
    try {
      await parentRequestsService.deleteRequest(requestToDelete.id);
      setRequests(requests.filter(r => r.id !== requestToDelete.id));
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting request:', err);
      setError('Failed to delete the request. Please try again.');
      handleCloseDeleteDialog();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton 
          color="inherit" 
          onClick={() => navigate('/parent/dashboard')}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Placement Requests
        </Typography>
      </Box>

      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            label="Search Requests"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: '300px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/parent/requests/new')}
          >
            New Request
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredRequests.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            {searchTerm ? (
              <Typography variant="body2" color="text.secondary">
                No requests found matching your search criteria.
              </Typography>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" paragraph>
                  You haven't submitted any placement requests yet.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/parent/requests/new')}
                >
                  Create Request
                </Button>
              </>
            )}
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="requests table">
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Request Type</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date Submitted</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {request.student?.firstName} {request.student?.lastName}
                        </TableCell>
                        <TableCell>
                          {requestTypeOptions.find(option => option.value === request.requestType)?.label || request.requestType}
                        </TableCell>
                        <TableCell>
                          {request.details?.length > 50 
                            ? `${request.details.substring(0, 50)}...` 
                            : request.details}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={statusOptions[request.status.toLowerCase()]?.label || request.status}
                            color={statusOptions[request.status.toLowerCase()]?.color || 'default'}
                          />
                        </TableCell>
                        <TableCell>{formatDate(request.createdAt || new Date())}</TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => navigate(`/parent/requests/${request.id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleOpenDeleteDialog(request)}
                            disabled={request.status.toLowerCase() === 'approved'}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRequests.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Request?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this placement request? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteRequest} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RequestsList; 