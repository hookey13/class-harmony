import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  GetApp,
  PictureAsPdf,
  TableChart,
  FilterAlt,
  Refresh,
} from '@mui/icons-material';
import { optimizationService } from '../../services/optimizationService';
import axios from 'axios';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [data, setData] = useState({
    classDistribution: [],
    studentDemographics: [],
    optimizationScores: [],
    requestMetrics: [],
    teacherSurveyStats: []
  });

  // Color scales for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  // Mock academic years for demo
  const academicYears = ['2021-2022', '2022-2023', '2023-2024', '2024-2025'];
  
  // Mock grades for demo
  const grades = [
    { value: 'all', label: 'All Grades' },
    { value: 'K', label: 'Kindergarten' },
    { value: '1', label: '1st Grade' },
    { value: '2', label: '2nd Grade' },
    { value: '3', label: '3rd Grade' },
    { value: '4', label: '4th Grade' },
    { value: '5', label: '5th Grade' },
  ];

  // Mock data generation for demonstration
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedGrade, dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics', {
        params: {
          grade: selectedGrade,
          dateRange
        }
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`/api/analytics/export/${format}`, {
        params: {
          grade: selectedGrade,
          dateRange
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `class-harmony-analytics.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting analytics:', err);
    }
  };

  // Render class composition chart
  const renderClassDistribution = () => (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Class Size Distribution
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.classDistribution}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="className" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="studentCount" fill="#0088FE" name="Students" />
          <Bar dataKey="targetSize" fill="#00C49F" name="Target Size" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  // Render student distribution pie chart
  const renderDemographics = () => (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Student Demographics
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.studentDemographics}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.studentDemographics.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );

  // Render optimization scores over time
  const renderOptimizationScores = () => (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Optimization Scores Over Time
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.optimizationScores}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="academicBalance" fill="#0088FE" name="Academic Balance" />
          <Bar dataKey="behavioralBalance" fill="#00C49F" name="Behavioral Balance" />
          <Bar dataKey="specialNeeds" fill="#FFBB28" name="Special Needs Distribution" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  // Render request metrics
  const renderRequestMetrics = () => (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Parent Request Metrics
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data.requestMetrics}
            dataKey="value"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data.requestMetrics.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );

  // Render teacher survey completion
  const renderTeacherSurveyStats = () => (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Teacher Survey Completion
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.teacherSurveyStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="grade" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" fill="#0088FE" name="Completed" />
          <Bar dataKey="pending" fill="#FF8042" name="Pending" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  // Render dashboard overview
  const renderDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Analytics Overview
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Data for {selectedGrade}, {dateRange}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Students
            </Typography>
            <Typography variant="h4">
              {data.classDistribution.reduce((total, cls) => total + cls.studentCount, 0)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Classes
            </Typography>
            <Typography variant="h4">
              {data.classDistribution.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Average Class Size
            </Typography>
            <Typography variant="h4">
              {data.classDistribution.length > 0 
                ? (data.classDistribution.reduce((total, cls) => total + cls.studentCount, 0) / data.classDistribution.length).toFixed(1) 
                : 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Avg. Balance Score
            </Typography>
            <Typography variant="h4">
              {data.classDistribution.length > 0 
                ? (data.classDistribution.reduce((total, cls) => total + cls.targetSize, 0) / data.classDistribution.length).toFixed(2)
                : 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        {renderClassDistribution()}
      </Grid>

      <Grid item xs={12} md={6}>
        {renderDemographics()}
      </Grid>

      <Grid item xs={12} md={6}>
        {renderOptimizationScores()}
      </Grid>

      <Grid item xs={12} md={6}>
        {renderTeacherSurveyStats()}
      </Grid>
    </Grid>
  );

  // Render detailed statistics
  const renderDetailedStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Balance Metrics Details
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class</TableCell>
                  <TableCell align="right">Gender Balance</TableCell>
                  <TableCell align="right">Academic Balance</TableCell>
                  <TableCell align="right">Special Needs</TableCell>
                  <TableCell align="right">Behavioral</TableCell>
                  <TableCell align="right">Overall Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.classDistribution.map((cls) => (
                  <TableRow key={cls.className}>
                    <TableCell component="th" scope="row">
                      {cls.className}
                    </TableCell>
                    <TableCell align="right">
                      {(Math.abs(cls.boys - cls.girls) / cls.studentCount < 0.2) ? 'Good' : 'Needs Review'}
                    </TableCell>
                    <TableCell align="right">
                      {(cls.highAcademic / cls.studentCount > 0.1 && 
                        cls.highAcademic / cls.studentCount < 0.5) ? 'Good' : 'Needs Review'}
                    </TableCell>
                    <TableCell align="right">
                      {(cls.specialNeeds / cls.studentCount < 0.25) ? 'Good' : 'Needs Review'}
                    </TableCell>
                    <TableCell align="right">
                      {'Good'} {/* Placeholder - would use actual data */}
                    </TableCell>
                    <TableCell align="right">
                      {cls.targetSize > 0.8 ? 'Good' : 'Needs Review'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  // Render export options
  const renderExportOptions = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Export Options
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Export analytics data for {selectedGrade}, {dateRange}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<PictureAsPdf />}
                onClick={() => handleExport('pdf')}
              >
                Export as PDF
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<TableChart />}
                onClick={() => handleExport('csv')}
              >
                Export as CSV
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Scheduled Reports
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Set up automated reports to be generated and sent periodically.
          </Typography>
          
          <Button
            variant="outlined"
          >
            Configure Scheduled Reports
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4">
            Analytics & Reporting
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="grade-label">Grade</InputLabel>
              <Select
                labelId="grade-label"
                id="grade"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                label="Grade"
              >
                {grades.map((g) => (
                  <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="date-range-label">Time Range</InputLabel>
              <Select
                labelId="date-range-label"
                id="date-range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="quarter">Last Quarter</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchAnalyticsData}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="analytics tabs"
            variant="fullWidth"
          >
            <Tab label="Dashboard" />
            <Tab label="Detailed Statistics" />
            <Tab label="Export Options" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={activeTab} index={0}>
              {renderDashboard()}
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              {renderDetailedStats()}
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              {renderExportOptions()}
            </TabPanel>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Analytics; 