import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
  School as SchoolIcon,
  AccessibilityNew as AccessibilityIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import StudentProfileCard from '../components/StudentProfileCard';

const Students = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State for students data
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    grade: '',
    academicLevel: '',
    specialNeeds: ''
  });
  
  // State for student detail modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // State for action menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuStudent, setMenuStudent] = useState(null);
  
  // Fetch students data when component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        
        // In production, this would be a real API call
        // const response = await api.getStudents();
        // setStudents(response.data);
        
        // For development purposes, we'll use mock data
        setTimeout(() => {
          const mockStudents = Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            firstName: `John${i + 1}`,
            lastName: `Smith${i + 1}`,
            grade: Math.floor(Math.random() * 6) + 1,
            gender: i % 2 === 0 ? 'Male' : 'Female',
            dateOfBirth: new Date(
              Date.now() - (Math.floor(Math.random() * 365 * 3) + 365 * 5) * 24 * 60 * 60 * 1000
            ).toISOString(),
            academicLevel: ['Advanced', 'Proficient', 'Basic', 'Below Basic'][Math.floor(Math.random() * 4)],
            behaviorLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
            specialNeeds: Math.random() < 0.15,
            parents: [
              {
                firstName: `Parent${i + 1}`,
                lastName: `Smith${i + 1}`,
                relationship: 'Parent',
                email: `parent${i + 1}@example.com`,
                phone: `555-${100 + i}`
              }
            ],
            currentClass: {
              className: `Class ${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}`,
              teacherName: `Teacher ${i % 5 + 1}`
            },
            enrollmentDate: new Date(
              Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
            ).toISOString()
          }));
          
          setStudents(mockStudents);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when search changes
  };
  
  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(0); // Reset to first page when filters change
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filter students based on search query and filters
  const filteredStudents = students.filter(student => {
    // Search filter
    const matchesSearch = 
      (student.firstName + ' ' + student.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.parents && student.parents.some(p => 
        (p.firstName + ' ' + p.lastName).toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    // Grade filter
    const matchesGrade = filters.grade === '' || student.grade.toString() === filters.grade;
    
    // Academic level filter
    const matchesAcademicLevel = filters.academicLevel === '' || student.academicLevel === filters.academicLevel;
    
    // Special needs filter
    const matchesSpecialNeeds = 
      filters.specialNeeds === '' || 
      (filters.specialNeeds === 'yes' && student.specialNeeds) ||
      (filters.specialNeeds === 'no' && !student.specialNeeds);
    
    return matchesSearch && matchesGrade && matchesAcademicLevel && matchesSpecialNeeds;
  });
  
  // Get paginated students
  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Handle view student detail
  const handleViewStudentDetail = (student) => {
    navigate(`/students/${student.id}`);
  };
  
  // Handle edit student
  const handleEditStudent = (student) => {
    navigate(`/students/${student.id}?edit=true`);
  };
  
  // Handle delete student
  const handleDeleteStudent = (student) => {
    // In a real app, you would call an API to delete the student
    // For now, we'll just remove it from the local state
    setStudents(students.filter(s => s.id !== student.id));
  };
  
  // Handle add new student
  const handleAddStudent = () => {
    navigate('/students/new');
  };
  
  // Handle opening action menu
  const handleOpenMenu = (event, student) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuStudent(student);
  };
  
  // Handle closing action menu
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuStudent(null);
  };
  
  // Render student detail modal
  const renderStudentDetailModal = () => (
    <Dialog 
      open={detailModalOpen} 
      onClose={() => setDetailModalOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Student Details
        <IconButton
          onClick={() => setDetailModalOpen(false)}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {selectedStudent && (
          <StudentProfileCard student={selectedStudent} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
        <Button 
          variant="contained" 
          onClick={() => {
            setDetailModalOpen(false);
            handleEditStudent(selectedStudent);
          }}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  // Get color for academic level
  const getAcademicLevelColor = (level) => {
    switch (level) {
      case 'Advanced': return 'success';
      case 'Proficient': return 'info';
      case 'Basic': return 'warning';
      case 'Below Basic': return 'error';
      default: return 'default';
    }
  };
  
  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 0 }}>
          <PersonIcon fontSize="large" sx={{ mr: 1 }} />
          Students
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddStudent}
        >
          Add New Student
        </Button>
      </Box>
      
      {/* Search and filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search by student or parent name"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={8}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Grade"
                value={filters.grade}
                onChange={(e) => handleFilterChange('grade', e.target.value)}
                size="small"
                sx={{ minWidth: 100 }}
              >
                <MenuItem value="">All Grades</MenuItem>
                {['K', '1', '2', '3', '4', '5', '6'].map(grade => (
                  <MenuItem key={grade} value={grade === 'K' ? 'K' : grade}>
                    {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                label="Academic Level"
                value={filters.academicLevel}
                onChange={(e) => handleFilterChange('academicLevel', e.target.value)}
                size="small"
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
                <MenuItem value="Proficient">Proficient</MenuItem>
                <MenuItem value="Basic">Basic</MenuItem>
                <MenuItem value="Below Basic">Below Basic</MenuItem>
              </TextField>
              
              <TextField
                select
                label="Special Needs"
                value={filters.specialNeeds}
                onChange={(e) => handleFilterChange('specialNeeds', e.target.value)}
                size="small"
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="">All Students</MenuItem>
                <MenuItem value="yes">With Special Needs</MenuItem>
                <MenuItem value="no">Without Special Needs</MenuItem>
              </TextField>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Students table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Academic Level</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Date of Birth</TableCell>
                <TableCell>Class</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {student.firstName} {student.lastName}
                        {student.specialNeeds && (
                          <Tooltip title="Special Needs">
                            <AccessibilityIcon color="secondary" fontSize="small" sx={{ ml: 1 }} />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>
                      <Chip 
                        label={student.academicLevel} 
                        size="small" 
                        color={getAcademicLevelColor(student.academicLevel)} 
                      />
                    </TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>{formatDate(student.dateOfBirth)}</TableCell>
                    <TableCell>
                      {student.currentClass ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SchoolIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {student.currentClass.className}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewStudentDetail(student)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditStudent(student)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More Actions">
                          <IconButton 
                            size="small"
                            onClick={(e) => handleOpenMenu(e, student)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No students found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredStudents.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
      
      {/* Action menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          navigate(`/students/${menuStudent?.id}/learning-plan`);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          View Learning Plan
        </MenuItem>
        <MenuItem onClick={() => {
          // Handle parent contacts
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          Contact Parents
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          handleDeleteStudent(menuStudent);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Delete Student</Typography>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Students; 