import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  DeleteOutline as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  Drafts as DraftsIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';

const LearningPlansList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [learningPlans, setLearningPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    academicYear: '',
    planType: '',
    status: ''
  });
  
  // Get current academic year options
  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear-1}-${currentYear}`,
    `${currentYear}-${currentYear+1}`,
    `${currentYear+1}-${currentYear+2}`
  ];
  
  // Options for filters
  const planTypes = [
    { value: 'standard', label: 'Standard' },
    { value: 'intervention', label: 'Intervention' },
    { value: 'enrichment', label: 'Enrichment' },
    { value: 'iep_aligned', label: 'IEP Aligned' },
    { value: 'behavior_focused', label: 'Behavior Focused' }
  ];
  
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' }
  ];
  
  // Fetch learning plans on component mount
  useEffect(() => {
    fetchLearningPlans();
  }, []);
  
  // Apply filters and search term to learning plans
  useEffect(() => {
    filterLearningPlans();
  }, [learningPlans, searchTerm, filters]);
  
  const fetchLearningPlans = async () => {
    try {
      setLoading(true);
      const response = await api.getLearningPlans();
      setLearningPlans(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching learning plans:', err);
      setError('Failed to load learning plans. Please try again later.');
      setLoading(false);
    }
  };
  
  const filterLearningPlans = () => {
    let filtered = [...learningPlans];
    
    // Apply filters
    if (filters.academicYear) {
      filtered = filtered.filter(plan => plan.academicYear === filters.academicYear);
    }
    
    if (filters.planType) {
      filtered = filtered.filter(plan => plan.planType === filters.planType);
    }
    
    if (filters.status) {
      filtered = filtered.filter(plan => plan.status === filters.status);
    }
    
    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(plan => 
        (plan.title && plan.title.toLowerCase().includes(lowerSearchTerm)) ||
        (plan.student.firstName && plan.student.firstName.toLowerCase().includes(lowerSearchTerm)) ||
        (plan.student.lastName && plan.student.lastName.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    setFilteredPlans(filtered);
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleClearFilters = () => {
    setFilters({
      academicYear: '',
      planType: '',
      status: ''
    });
    setSearchTerm('');
  };
  
  const handleCreatePlan = () => {
    navigate('/teacher/learning-plans/create');
  };
  
  const handleViewPlan = (planId) => {
    navigate(`/teacher/learning-plans/${planId}`);
  };
  
  const handleEditPlan = (planId) => {
    navigate(`/teacher/learning-plans/${planId}/edit`);
  };
  
  const handleDeletePlan = async (planId) => {
    try {
      await api.deleteLearningPlan(planId);
      // Refresh list after deletion
      setLearningPlans(prevPlans => prevPlans.filter(plan => plan._id !== planId));
    } catch (err) {
      console.error('Error deleting learning plan:', err);
      setError('Failed to delete learning plan. Only draft plans can be deleted.');
    }
  };
  
  // Helper function to get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'draft':
        return { 
          icon: <DraftsIcon fontSize="small" />, 
          color: 'default',
          label: 'Draft'
        };
      case 'active':
        return { 
          icon: <CheckCircleIcon fontSize="small" />, 
          color: 'primary',
          label: 'Active'
        };
      case 'completed':
        return { 
          icon: <CheckCircleIcon fontSize="small" />, 
          color: 'success',
          label: 'Completed'
        };
      case 'archived':
        return { 
          icon: <ArchiveIcon fontSize="small" />, 
          color: 'default',
          label: 'Archived'
        };
      default:
        return { 
          icon: <ErrorIcon fontSize="small" />, 
          color: 'default',
          label: status
        };
    }
  };
  
  // Helper function to format plan type for display
  const formatPlanType = (type) => {
    switch (type) {
      case 'standard':
        return 'Standard';
      case 'intervention':
        return 'Intervention';
      case 'enrichment':
        return 'Enrichment';
      case 'iep_aligned':
        return 'IEP Aligned';
      case 'behavior_focused':
        return 'Behavior Focused';
      default:
        return type;
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Learning Plans
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreatePlan}
        >
          Create New Plan
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Academic Year</InputLabel>
              <Select
                name="academicYear"
                value={filters.academicYear}
                onChange={handleFilterChange}
                label="Academic Year"
              >
                <MenuItem value="">All</MenuItem>
                {academicYears.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Plan Type</InputLabel>
              <Select
                name="planType"
                value={filters.planType}
                onChange={handleFilterChange}
                label="Plan Type"
              >
                <MenuItem value="">All</MenuItem>
                {planTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              startIcon={<FilterListIcon />}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Typography variant="subtitle1" gutterBottom>
        Showing {filteredPlans.length} of {learningPlans.length} learning plans
      </Typography>
      
      {filteredPlans.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Academic Year</TableCell>
                <TableCell>Plan Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPlans.map((plan) => {
                const statusInfo = getStatusInfo(plan.status);
                return (
                  <TableRow key={plan._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                        {plan.title}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {plan.student.firstName} {plan.student.lastName}
                      {plan.student.grade && (
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          (Grade {plan.student.grade})
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{plan.academicYear}</TableCell>
                    <TableCell>{formatPlanType(plan.planType)}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={statusInfo.icon}
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="View Plan">
                          <IconButton color="primary" onClick={() => handleViewPlan(plan._id)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {plan.status === 'draft' && (
                          <>
                            <Tooltip title="Edit Plan">
                              <IconButton color="primary" onClick={() => handleEditPlan(plan._id)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Plan">
                              <IconButton color="error" onClick={() => handleDeletePlan(plan._id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No learning plans found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {searchTerm || filters.academicYear || filters.planType || filters.status
              ? 'Try adjusting your filters'
              : 'Create your first learning plan to get started'}
          </Typography>
          {!searchTerm && !filters.academicYear && !filters.planType && !filters.status && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreatePlan}
              sx={{ mt: 2 }}
            >
              Create New Plan
            </Button>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default LearningPlansList; 