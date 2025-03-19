import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
  SortByAlpha as SortByAlphaIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useParentAuth } from '../../contexts/ParentAuthContext';
import api from '../../services/api';

const StudentsList = () => {
  const { currentParent, loading: authLoading } = useParentAuth();
  const navigate = useNavigate();
  
  // State for students list and UI
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('nameAsc'); // nameAsc, nameDesc, gradeAsc, gradeDesc
  
  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      if (!currentParent) return;
      
      try {
        setLoading(true);
        // First check if students are already in the currentParent object
        if (currentParent.students && currentParent.students.length > 0) {
          setStudents(currentParent.students);
        } else {
          // Otherwise fetch from API
          const response = await api.get('/parent/students');
          setStudents(response.data.data || []);
        }
        setError('');
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentParent]);
  
  // Apply filters and search when dependencies change
  useEffect(() => {
    if (!students) return;
    
    let result = [...students];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        student => 
          student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply grade filter
    if (gradeFilter !== 'all') {
      result = result.filter(student => student.grade.toString() === gradeFilter);
    }
    
    // Apply sorting
    switch (sortOrder) {
      case 'nameAsc':
        result.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
        break;
      case 'nameDesc':
        result.sort((a, b) => `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`));
        break;
      case 'gradeAsc':
        result.sort((a, b) => a.grade - b.grade);
        break;
      case 'gradeDesc':
        result.sort((a, b) => b.grade - a.grade);
        break;
      default:
        break;
    }
    
    setFilteredStudents(result);
  }, [students, searchTerm, gradeFilter, sortOrder]);
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setGradeFilter('all');
    setSortOrder('nameAsc');
  };
  
  // Generate array of grade options from K-12
  const gradeOptions = ['K', ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
  
  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          color="inherit" 
          onClick={() => navigate('/parent/dashboard')}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Students
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Students"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="grade-filter-label">Grade</InputLabel>
              <Select
                labelId="grade-filter-label"
                id="grade-filter"
                value={gradeFilter}
                label="Grade"
                onChange={(e) => setGradeFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Grades</MenuItem>
                {gradeOptions.map(grade => (
                  <MenuItem key={grade} value={grade}>{grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="sort-order-label">Sort By</InputLabel>
              <Select
                labelId="sort-order-label"
                id="sort-order"
                value={sortOrder}
                label="Sort By"
                onChange={(e) => setSortOrder(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <SortByAlphaIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="nameAsc">Name (A-Z)</MenuItem>
                <MenuItem value="nameDesc">Name (Z-A)</MenuItem>
                <MenuItem value="gradeAsc">Grade (Low-High)</MenuItem>
                <MenuItem value="gradeDesc">Grade (High-Low)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {filteredStudents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Students Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {students.length > 0 
              ? 'Try adjusting your search or filters'
              : 'There are no students associated with your account. Please contact your school administrator.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredStudents.map((student) => (
            <Grid item xs={12} sm={6} md={4} key={student.id || student._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ width: 40, height: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" component="div">
                      {student.firstName} {student.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {student.grade === 'K' ? 'Kindergarten' : `Grade ${student.grade}`}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Student ID
                    </Typography>
                    <Typography variant="body2">
                      {student.studentId || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Current Teacher
                    </Typography>
                    <Typography variant="body2">
                      {student.currentTeacher || 'Not assigned'}
                    </Typography>
                  </Box>
                  
                  {student.currentClass && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Current Class
                      </Typography>
                      <Typography variant="body2">
                        {student.currentClass.name || 'N/A'}
                      </Typography>
                    </Box>
                  )}
                  
                  {student.specialNeeds && student.specialNeeds.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Special Considerations
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {student.specialNeeds.slice(0, 2).map((need, index) => (
                          <Chip 
                            key={index}
                            label={need}
                            size="small"
                            color="secondary" 
                            variant="outlined"
                          />
                        ))}
                        {student.specialNeeds.length > 2 && (
                          <Chip 
                            label={`+${student.specialNeeds.length - 2} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
                
                <Divider />
                
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate(`/parent/students/${student.id || student._id}`)}
                    endIcon={<ArrowForwardIcon />}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={() => navigate('/parent/requests/new', { state: { studentId: student.id || student._id } })}
                  >
                    New Request
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default StudentsList; 