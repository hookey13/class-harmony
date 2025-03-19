import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  ListItem,
  ListItemText,
  List,
  Avatar,
  Stack,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../services/api';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schools-tabpanel-${index}`}
      aria-labelledby={`schools-tab-${index}`}
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

const SchoolsManagement = () => {
  // State
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [districts, setDistricts] = useState([]);
  
  // School form state
  const [openSchoolDialog, setOpenSchoolDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [schoolFormData, setSchoolFormData] = useState({
    id: null,
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    website: '',
    districtId: '',
    principalName: '',
    principalEmail: '',
    status: 'active',
    studentCount: 0,
    teacherCount: 0,
    gradeLevels: []
  });
  
  // Delete dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  
  // School details dialog state
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  
  // Context
  const { createNotification } = useNotifications();
  
  // Fetch schools and districts on component mount
  useEffect(() => {
    fetchDistricts();
    fetchSchools();
  }, []);
  
  // Update filtered schools when schools, search query or filter changes
  useEffect(() => {
    let result = [...schools];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(school => {
        return (
          school.name.toLowerCase().includes(query) ||
          school.city.toLowerCase().includes(query) ||
          school.state.toLowerCase().includes(query) ||
          school.principalName?.toLowerCase().includes(query)
        );
      });
    }
    
    // Apply status filter
    if (filterState !== 'all') {
      result = result.filter(school => school.status === filterState);
    }
    
    setFilteredSchools(result);
  }, [schools, searchQuery, filterState]);
  
  // Fetch schools
  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const schoolsData = await api.getSchools();
      
      if (schoolsData) {
        setSchools(schoolsData);
        setFilteredSchools(schoolsData);
      }
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch districts
  const fetchDistricts = async () => {
    try {
      const districtsData = await api.getDistricts();
      
      if (districtsData) {
        setDistricts(districtsData);
      }
    } catch (err) {
      console.error('Error fetching districts:', err);
    }
  };
  
  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSchools();
    setRefreshing(false);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle add school button click
  const handleAddSchool = () => {
    setIsEdit(false);
    setSchoolFormData({
      id: null,
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      website: '',
      districtId: '',
      principalName: '',
      principalEmail: '',
      status: 'active',
      studentCount: 0,
      teacherCount: 0,
      gradeLevels: []
    });
    setOpenSchoolDialog(true);
  };
  
  // Handle edit school button click
  const handleEditSchool = (school) => {
    setIsEdit(true);
    setSchoolFormData({
      ...school
    });
    setOpenSchoolDialog(true);
  };
  
  // Handle change in school form fields
  const handleSchoolFormChange = (e) => {
    const { name, value } = e.target;
    
    setSchoolFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle student/teacher count change
  const handleCountChange = (e) => {
    const { name, value } = e.target;
    
    // Ensure count is a number and not negative
    const count = Math.max(0, parseInt(value) || 0);
    
    setSchoolFormData(prev => ({
      ...prev,
      [name]: count
    }));
  };
  
  // Handle grade levels change
  const handleGradesChange = (e) => {
    setSchoolFormData(prev => ({
      ...prev,
      gradeLevels: e.target.value
    }));
  };
  
  // Handle save school
  const handleSaveSchool = async () => {
    // Basic validation
    if (!schoolFormData.name) {
      setError('School name is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let result;
      
      if (isEdit) {
        // Update existing school
        result = await api.updateSchool(schoolFormData.id, schoolFormData);
        
        if (result && result.success) {
          // Update local state
          setSchools(prev => prev.map(school => 
            school.id === schoolFormData.id ? result.data : school
          ));
          
          setSuccess('School updated successfully');
          
          // Create notification
          createNotification({
            type: 'success',
            title: 'School Updated',
            message: `${schoolFormData.name} has been updated successfully.`
          });
          
          // Close dialog
          setOpenSchoolDialog(false);
        } else {
          setError(result?.message || 'Failed to update school');
        }
      } else {
        // Create new school
        result = await api.createSchool(schoolFormData);
        
        if (result && result.success) {
          // Update local state
          setSchools(prev => [...prev, result.data]);
          
          setSuccess('School created successfully');
          
          // Create notification
          createNotification({
            type: 'success',
            title: 'School Created',
            message: `${schoolFormData.name} has been created successfully.`
          });
          
          // Close dialog
          setOpenSchoolDialog(false);
        } else {
          setError(result?.message || 'Failed to create school');
        }
      }
    } catch (err) {
      console.error('Error saving school:', err);
      setError('An error occurred while saving the school');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete button click
  const handleDeleteClick = (school) => {
    setSchoolToDelete(school);
    setOpenDeleteDialog(true);
  };
  
  // Handle delete school
  const handleDeleteSchool = async () => {
    if (!schoolToDelete) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await api.deleteSchool(schoolToDelete.id);
      
      if (result && result.success) {
        // Update local state
        setSchools(prev => prev.filter(school => school.id !== schoolToDelete.id));
        
        setSuccess('School deleted successfully');
        
        // Create notification
        createNotification({
          type: 'success',
          title: 'School Deleted',
          message: `${schoolToDelete.name} has been deleted successfully.`
        });
        
        // Close dialog
        setOpenDeleteDialog(false);
        setSchoolToDelete(null);
      } else {
        setError(result?.message || 'Failed to delete school');
      }
    } catch (err) {
      console.error('Error deleting school:', err);
      setError('An error occurred while deleting the school');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle view school details button click
  const handleViewSchoolDetails = (school) => {
    setSelectedSchool(school);
    setOpenDetailsDialog(true);
  };
  
  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    setFilterState(e.target.value);
  };
  
  // Get status color for chips
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Get available grade levels
  const availableGradeLevels = [
    { id: 'k', name: 'Kindergarten' },
    { id: '1', name: '1st Grade' },
    { id: '2', name: '2nd Grade' },
    { id: '3', name: '3rd Grade' },
    { id: '4', name: '4th Grade' },
    { id: '5', name: '5th Grade' },
    { id: '6', name: '6th Grade' },
    { id: '7', name: '7th Grade' },
    { id: '8', name: '8th Grade' },
    { id: '9', name: '9th Grade' },
    { id: '10', name: '10th Grade' },
    { id: '11', name: '11th Grade' },
    { id: '12', name: '12th Grade' }
  ];
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Schools Management
        </Typography>
        <Box>
          <Tooltip title="Refresh schools list">
            <IconButton 
              onClick={handleRefresh} 
              sx={{ mr: 1 }}
              disabled={refreshing}
            >
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddSchool}
          >
            Add School
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
      
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="schools management tabs"
          >
            <Tab label="Schools List" id="schools-tab-0" />
            <Tab label="Map View" id="schools-tab-1" />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            placeholder="Search schools..."
            value={searchQuery}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{ width: '40%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl variant="outlined" size="small">
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={filterState}
              onChange={handleFilterChange}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredSchools.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No schools found. {searchQuery && 'Try a different search query.'}
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={handleAddSchool}
                sx={{ mt: 2 }}
              >
                Add School
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>School Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Principal</TableCell>
                    <TableCell>District</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Students</TableCell>
                    <TableCell align="center">Teachers</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSchools.map((school) => {
                    // Find district name
                    const district = districts.find(d => d.id === school.districtId);
                    
                    return (
                      <TableRow key={school.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: 'primary.main', 
                                mr: 1,
                                width: 32,
                                height: 32
                              }}
                            >
                              <SchoolIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="body1" component="div">
                                {school.name}
                              </Typography>
                              {school.website && (
                                <Typography variant="caption" color="text.secondary">
                                  {school.website}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {school.city}, {school.state}
                        </TableCell>
                        <TableCell>
                          {school.principalName}
                        </TableCell>
                        <TableCell>
                          {district?.name || 'None'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={school.status.charAt(0).toUpperCase() + school.status.slice(1)} 
                            size="small" 
                            color={getStatusColor(school.status)} 
                          />
                        </TableCell>
                        <TableCell align="center">
                          {school.studentCount}
                        </TableCell>
                        <TableCell align="center">
                          {school.teacherCount}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewSchoolDetails(school)}
                              >
                                <SchoolIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit School">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditSchool(school)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete School">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteClick(school)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Map View Coming Soon
            </Typography>
            <Typography variant="body1" paragraph>
              This feature will allow you to view schools on a map with location-based filtering and analytics.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* School Form Dialog */}
      <Dialog 
        open={openSchoolDialog} 
        onClose={() => setOpenSchoolDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEdit ? 'Edit School' : 'Add New School'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="School Name"
                  name="name"
                  value={schoolFormData.name}
                  onChange={handleSchoolFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="district-label">District</InputLabel>
                  <Select
                    labelId="district-label"
                    name="districtId"
                    value={schoolFormData.districtId}
                    onChange={handleSchoolFormChange}
                    label="District"
                  >
                    <MenuItem value="">None</MenuItem>
                    {districts.map((district) => (
                      <MenuItem key={district.id} value={district.id}>
                        {district.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={schoolFormData.address}
                  onChange={handleSchoolFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={schoolFormData.city}
                  onChange={handleSchoolFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={schoolFormData.state}
                  onChange={handleSchoolFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="zipCode"
                  value={schoolFormData.zipCode}
                  onChange={handleSchoolFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={schoolFormData.phone}
                  onChange={handleSchoolFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={schoolFormData.website}
                  onChange={handleSchoolFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Principal Name"
                  name="principalName"
                  value={schoolFormData.principalName}
                  onChange={handleSchoolFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Principal Email"
                  name="principalEmail"
                  value={schoolFormData.principalEmail}
                  onChange={handleSchoolFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={schoolFormData.status}
                    onChange={handleSchoolFormChange}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Student Count"
                  name="studentCount"
                  type="number"
                  value={schoolFormData.studentCount}
                  onChange={handleCountChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Teacher Count"
                  name="teacherCount"
                  type="number"
                  value={schoolFormData.teacherCount}
                  onChange={handleCountChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="grade-levels-label">Grade Levels</InputLabel>
                  <Select
                    labelId="grade-levels-label"
                    multiple
                    name="gradeLevels"
                    value={schoolFormData.gradeLevels}
                    onChange={handleGradesChange}
                    label="Grade Levels"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((gradeId) => {
                          const grade = availableGradeLevels.find(g => g.id === gradeId);
                          return (
                            <Chip 
                              key={gradeId} 
                              label={grade ? grade.name : gradeId} 
                              size="small" 
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {availableGradeLevels.map((grade) => (
                      <MenuItem key={grade.id} value={grade.id}>
                        {grade.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSchoolDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveSchool} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {schoolToDelete?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteSchool} 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* School Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          School Details
        </DialogTitle>
        <DialogContent>
          {selectedSchool && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="General Information" 
                    avatar={<Avatar><SchoolIcon /></Avatar>}
                  />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="School Name" 
                          secondary={selectedSchool.name} 
                        />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="Address" 
                          secondary={`${selectedSchool.address || ''} ${selectedSchool.city || ''}, ${selectedSchool.state || ''} ${selectedSchool.zipCode || ''}`} 
                        />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="Contact" 
                          secondary={
                            <>
                              {selectedSchool.phone && (
                                <Typography variant="body2">
                                  Phone: {selectedSchool.phone}
                                </Typography>
                              )}
                              {selectedSchool.website && (
                                <Typography variant="body2">
                                  Website: {selectedSchool.website}
                                </Typography>
                              )}
                            </>
                          } 
                        />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="Status" 
                          secondary={
                            <Chip 
                              label={selectedSchool.status.charAt(0).toUpperCase() + selectedSchool.status.slice(1)} 
                              size="small" 
                              color={getStatusColor(selectedSchool.status)} 
                            />
                          } 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="School Population" 
                    avatar={<Avatar><GroupsIcon /></Avatar>}
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="h5" align="center">
                          {selectedSchool.studentCount}
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary">
                          Students
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h5" align="center">
                          {selectedSchool.teacherCount}
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary">
                          Teachers
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                          Grade Levels
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedSchool.gradeLevels && selectedSchool.gradeLevels.length > 0 ? (
                            selectedSchool.gradeLevels.map((gradeId) => {
                              const grade = availableGradeLevels.find(g => g.id === gradeId);
                              return (
                                <Chip 
                                  key={gradeId} 
                                  label={grade ? grade.name : gradeId} 
                                  size="small"
                                  color="primary"
                                  variant="outlined" 
                                />
                              );
                            })
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No grade levels specified
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                <Card sx={{ mt: 2 }}>
                  <CardHeader 
                    title="Administration" 
                    avatar={<Avatar><PersonIcon /></Avatar>}
                  />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Principal" 
                          secondary={
                            <>
                              <Typography variant="body2">
                                {selectedSchool.principalName || 'Not specified'}
                              </Typography>
                              {selectedSchool.principalEmail && (
                                <Typography variant="body2">
                                  Email: {selectedSchool.principalEmail}
                                </Typography>
                              )}
                            </>
                          } 
                        />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="District" 
                          secondary={
                            districts.find(d => d.id === selectedSchool.districtId)?.name || 'None'
                          } 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDetailsDialog(false)}
            variant="outlined"
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              setOpenDetailsDialog(false);
              handleEditSchool(selectedSchool);
            }} 
            variant="contained"
            startIcon={<EditIcon />}
          >
            Edit School
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchoolsManagement; 