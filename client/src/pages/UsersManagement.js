import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  TablePagination,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PersonAdd as InviteIcon,
  Security as SecurityIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  VerifiedUser as AdminIcon,
  School as TeacherIcon,
  SupervisorAccount as PrincipalIcon,
  Person as UserIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

// Role icon mapping
const getRoleIcon = (role) => {
  switch (role) {
    case 'admin':
      return <AdminIcon color="primary" />;
    case 'teacher':
      return <TeacherIcon color="success" />;
    case 'principal':
      return <PrincipalIcon color="info" />;
    default:
      return <UserIcon color="action" />;
  }
};

const UsersManagement = () => {
  // State
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  // Selected user
  const [selectedUser, setSelectedUser] = useState(null);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'teacher',
    schoolId: '',
    active: true
  });
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Notification context
  const { createNotification } = useNotifications();
  
  // Load users and schools on component mount
  useEffect(() => {
    fetchUsers();
    fetchSchools();
  }, []);
  
  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.getUsers();
      if (result) {
        setUsers(result);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch schools
  const fetchSchools = async () => {
    try {
      const result = await api.getSchools();
      if (result) {
        setSchools(result);
      }
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  };
  
  // Handle create user
  const handleCreateUser = async () => {
    if (!validateUserForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.createUser(newUser);
      
      if (result && result.success) {
        setSuccess('User created successfully');
        fetchUsers();
        setCreateDialogOpen(false);
        resetNewUserForm();
        
        // Create notification
        createNotification({
          type: 'system',
          title: 'New User Created',
          message: `User ${newUser.name} was created with role: ${newUser.role}`,
        });
      } else {
        setError(result.message || 'Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError('An error occurred while creating the user');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit user
  const handleEditUser = async () => {
    if (!validateUserForm(true)) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.updateUser(selectedUser.id, newUser);
      
      if (result && result.success) {
        setSuccess('User updated successfully');
        fetchUsers();
        setEditDialogOpen(false);
        resetNewUserForm();
      } else {
        setError(result.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError('An error occurred while updating the user');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.deleteUser(selectedUser.id);
      
      if (result && result.success) {
        setSuccess('User deleted successfully');
        fetchUsers();
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        
        // Create notification
        createNotification({
          type: 'system',
          title: 'User Deleted',
          message: `User ${selectedUser.name} was deleted`,
        });
      } else {
        setError(result.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('An error occurred while deleting the user');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle invite user
  const handleInviteUser = async () => {
    if (!newUser.email || !newUser.role || !newUser.schoolId) {
      setError('Email, role, and school are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.inviteUser({
        email: newUser.email,
        role: newUser.role,
        schoolId: newUser.schoolId
      });
      
      if (result && result.success) {
        setSuccess('Invitation sent successfully');
        setInviteDialogOpen(false);
        resetNewUserForm();
        
        // Create notification
        createNotification({
          type: 'system',
          title: 'User Invited',
          message: `Invitation sent to ${newUser.email}`,
        });
      } else {
        setError(result.message || 'Failed to send invitation');
      }
    } catch (err) {
      console.error('Error inviting user:', err);
      setError('An error occurred while sending the invitation');
    } finally {
      setLoading(false);
    }
  };
  
  // Validate user form
  const validateUserForm = (isEdit = false) => {
    if (!newUser.name && !isEdit) {
      setError('Name is required');
      return false;
    }
    
    if (!newUser.email) {
      setError('Email is required');
      return false;
    }
    
    if (!newUser.role) {
      setError('Role is required');
      return false;
    }
    
    if (!newUser.schoolId) {
      setError('School is required');
      return false;
    }
    
    return true;
  };
  
  // Reset new user form
  const resetNewUserForm = () => {
    setNewUser({
      name: '',
      email: '',
      role: 'teacher',
      schoolId: '',
      active: true
    });
  };
  
  // Handle edit dialog open
  const handleEditDialogOpen = (user) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      active: user.active
    });
    setEditDialogOpen(true);
  };
  
  // Handle delete dialog open
  const handleDeleteDialogOpen = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  
  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle toggle active state
  const handleToggleActive = async (user) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.updateUser(user.id, {
        ...user,
        active: !user.active
      });
      
      if (result && result.success) {
        setSuccess(`User ${user.active ? 'deactivated' : 'activated'} successfully`);
        fetchUsers();
      } else {
        setError(result.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('An error occurred while updating user status');
    } finally {
      setLoading(false);
    }
  };
  
  // Get school name by ID
  const getSchoolName = (schoolId) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Calculate row count based on role filtering
  const filteredUsers = users;
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<InviteIcon />}
            onClick={() => setInviteDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Invite User
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add User
          </Button>
        </Box>
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
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>School</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getRoleIcon(user.role)}
                          <Typography sx={{ ml: 1 }}>
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                          color={
                            user.role === 'admin' ? 'primary' :
                            user.role === 'principal' ? 'info' :
                            user.role === 'teacher' ? 'success' : 'default'
                          } 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{getSchoolName(user.schoolId)}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={user.active ? <ActiveIcon /> : <InactiveIcon />}
                          label={user.active ? 'Active' : 'Inactive'} 
                          color={user.active ? 'success' : 'error'} 
                          variant="outlined"
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit User">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditDialogOpen(user)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.active ? 'Deactivate User' : 'Activate User'}>
                          <IconButton 
                            size="small" 
                            color={user.active ? 'error' : 'success'}
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.active ? 
                              <InactiveIcon fontSize="small" /> : 
                              <ActiveIcon fontSize="small" />
                            }
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteDialogOpen(user)}
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
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the details for the new user.
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Full Name"
                type="text"
                fullWidth
                value={newUser.name}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                value={newUser.email}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={newUser.role}
                  onChange={handleFormChange}
                  label="Role"
                >
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="principal">Principal</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>School</InputLabel>
                <Select
                  name="schoolId"
                  value={newUser.schoolId}
                  onChange={handleFormChange}
                  label="School"
                >
                  {schools.map(school => (
                    <MenuItem key={school.id} value={school.id}>
                      {school.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateUser}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Update the user details.
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Full Name"
                type="text"
                fullWidth
                value={newUser.name}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                value={newUser.email}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={newUser.role}
                  onChange={handleFormChange}
                  label="Role"
                >
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="principal">Principal</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>School</InputLabel>
                <Select
                  name="schoolId"
                  value={newUser.schoolId}
                  onChange={handleFormChange}
                  label="School"
                >
                  {schools.map(school => (
                    <MenuItem key={school.id} value={school.id}>
                      {school.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleEditUser}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{selectedUser?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteUser}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Invite User Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)}>
        <DialogTitle>Invite User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Send an invitation to a new user. They will receive an email with instructions to set up their account.
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                value={newUser.email}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={newUser.role}
                  onChange={handleFormChange}
                  label="Role"
                >
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="principal">Principal</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>School</InputLabel>
                <Select
                  name="schoolId"
                  value={newUser.schoolId}
                  onChange={handleFormChange}
                  label="School"
                >
                  {schools.map(school => (
                    <MenuItem key={school.id} value={school.id}>
                      {school.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleInviteUser}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersManagement; 