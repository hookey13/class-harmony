import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Create as CreateIcon,
  Print as PrintIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Notes as NotesIcon,
  PieChart as PieChartIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import ClassBalanceChart from '../../components/ClassBalanceChart';

// Array of colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Component for student academic and behavioral details
const StudentDetailsCard = ({ student }) => {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {student.firstName[0]}{student.lastName[0]}
          </Avatar>
          <Box>
            <Typography variant="h6">{student.firstName} {student.lastName}</Typography>
            <Typography variant="body2" color="textSecondary">ID: {student.studentId}</Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Chip 
              label={student.gender} 
              size="small" 
              sx={{ mr: 1 }} 
            />
            {student.specialNeeds && (
              <Chip 
                label="Special Needs" 
                size="small" 
                color="secondary" 
              />
            )}
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>Academic Profile</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 100 }}>Level:</Typography>
              <Chip 
                label={student.academicLevel || 'Not set'} 
                size="small"
                color={
                  student.academicLevel === 'advanced' ? 'success' :
                  student.academicLevel === 'proficient' ? 'primary' :
                  student.academicLevel === 'developing' ? 'warning' :
                  student.academicLevel === 'needs_support' ? 'error' : 'default'
                }
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 100 }}>Strengths:</Typography>
              <Typography variant="body2">{student.academicStrengths || 'None specified'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ width: 100 }}>Challenges:</Typography>
              <Typography variant="body2">{student.academicChallenges || 'None specified'}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>Behavioral Profile</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 100 }}>Level:</Typography>
              <Chip 
                label={student.behavioralLevel || 'Not set'} 
                size="small"
                color={
                  student.behavioralLevel === 'excellent' ? 'success' :
                  student.behavioralLevel === 'good' ? 'primary' :
                  student.behavioralLevel === 'fair' ? 'warning' :
                  student.behavioralLevel === 'needs_improvement' ? 'error' : 'default'
                }
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 100 }}>Strengths:</Typography>
              <Typography variant="body2">{student.behavioralStrengths || 'None specified'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ width: 100 }}>Challenges:</Typography>
              <Typography variant="body2">{student.behavioralChallenges || 'None specified'}</Typography>
            </Box>
          </Grid>
        </Grid>
        
        {student.specialNeeds && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Special Needs Information</Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>Accommodations:</strong> {student.accommodations || 'None specified'}
              </Typography>
            </Box>
            {student.iep && (
              <Chip label="IEP" size="small" color="primary" sx={{ mr: 1 }} />
            )}
            {student.plan504 && (
              <Chip label="504 Plan" size="small" color="primary" />
            )}
          </>
        )}
        
        {student.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              <NotesIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              Additional Notes
            </Typography>
            <Typography variant="body2">{student.notes}</Typography>
          </>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            size="small"
            startIcon={<CreateIcon />}
            sx={{ mr: 1 }}
          >
            Add Notes
          </Button>
          <Button
            size="small"
            startIcon={<AssignmentIcon />}
          >
            Learning Plan
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Parent request summary component
const ParentRequestSummary = ({ requests }) => {
  return (
    <Card variant="outlined">
      <CardHeader title="Parent Requests" />
      <Divider />
      <CardContent>
        {requests && requests.length > 0 ? (
          <List>
            {requests.map((request, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={request.parentName}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {request.studentName} - {request.type}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="textSecondary">
                          {request.details}
                        </Typography>
                      </>
                    }
                  />
                  <Chip 
                    label={request.fulfilled ? "Fulfilled" : "Not Fulfilled"} 
                    color={request.fulfilled ? "success" : "default"}
                    size="small"
                  />
                </ListItem>
                {index < requests.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
            No parent requests for this class
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Main component
const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [parentRequests, setParentRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Fetch class data on component mount
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        
        // Fetch class details
        const response = await api.get(`/api/teacher/classes/${classId}`);
        setClassData(response.data);
        setStudents(response.data.students || []);
        
        // Fetch parent requests related to this class
        const requestsResponse = await api.get(`/api/teacher/parent-requests`, {
          params: { classId }
        });
        setParentRequests(requestsResponse.data || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching class data:', err);
        setError('Failed to load class data. Please try again later.');
        setLoading(false);
      }
    };
    
    if (classId) {
      fetchClassData();
    }
  }, [classId]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           (student.studentId && student.studentId.includes(searchTerm));
  });
  
  // Mock data for class metrics
  const classMetrics = {
    academicDistribution: {
      advanced: 25,
      proficient: 45,
      developing: 20,
      needsSupport: 10
    },
    behavioralDistribution: {
      excellent: 30,
      good: 40,
      fair: 20,
      needsImprovement: 10
    },
    genderDistribution: {
      male: 52,
      female: 48
    },
    specialNeeds: {
      iep: 15,
      plan504: 10,
      none: 75
    }
  };
  
  // Format data for charts
  const academicData = Object.keys(classMetrics.academicDistribution).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
    value: classMetrics.academicDistribution[key]
  }));
  
  const behavioralData = Object.keys(classMetrics.behavioralDistribution).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
    value: classMetrics.behavioralDistribution[key]
  }));
  
  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading class data...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/teacher/dashboard')}
            startIcon={<ArrowBackIcon />}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Render main content
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          color="primary"
          onClick={() => navigate('/teacher/dashboard')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h4" component="h1">
          {classData?.name || 'Class Details'}
        </Typography>
        
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            sx={{ mr: 1 }}
          >
            Print Roster
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Export Data
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                  {classData?.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Academic Year: {classData?.academicYear} • Grade: {classData?.grade} • 
                  Total Students: {students.length}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab icon={<GroupIcon />} label="Students" />
              <Tab icon={<PieChartIcon />} label="Class Analytics" />
              <Tab icon={<DescriptionIcon />} label="Parent Requests" />
            </Tabs>
            
            {/* Students Tab */}
            {activeTab === 0 && (
              <>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <TextField
                    label="Search Students"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{ mr: 2, minWidth: 250 }}
                  />
                  
                  <Tooltip title="Filter Students">
                    <IconButton>
                      <FilterListIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Sort Students">
                    <IconButton>
                      <SortIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 'auto' }}>
                    Showing {filteredStudents.length} of {students.length} students
                  </Typography>
                </Box>
                
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(student => (
                    <StudentDetailsCard key={student.id || student._id} student={student} />
                  ))
                ) : (
                  <Alert severity="info">
                    No students found matching your search criteria
                  </Alert>
                )}
              </>
            )}
            
            {/* Class Analytics Tab */}
            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Class Composition
                  </Typography>
                  <ClassBalanceChart 
                    classData={{
                      name: classData?.name,
                      metrics: classMetrics
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="Academic Distribution" />
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={academicData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {academicData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="Behavioral Distribution" />
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={behavioralData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {behavioralData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardHeader title="Learning Needs Summary" />
                    <CardContent>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Count</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>IEP Students</TableCell>
                              <TableCell align="right">{Math.round(classMetrics.specialNeeds.iep * students.length / 100)}</TableCell>
                              <TableCell align="right">{classMetrics.specialNeeds.iep}%</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>504 Plan Students</TableCell>
                              <TableCell align="right">{Math.round(classMetrics.specialNeeds.plan504 * students.length / 100)}</TableCell>
                              <TableCell align="right">{classMetrics.specialNeeds.plan504}%</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>English Language Learners</TableCell>
                              <TableCell align="right">3</TableCell>
                              <TableCell align="right">12%</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Gifted/Accelerated</TableCell>
                              <TableCell align="right">4</TableCell>
                              <TableCell align="right">16%</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {/* Parent Requests Tab */}
            {activeTab === 2 && (
              <ParentRequestSummary requests={parentRequests} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClassDetails; 