import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Assessment as AssessmentIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useData } from '../contexts/DataContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

const Reports = () => {
  const {
    classLists,
    classBalanceReport,
    requestStatistics,
    isLoading,
    error,
    fetchClassLists,
    getClassBalanceReport,
    getRequestStatistics,
    reportsLoading,
  } = useData();

  // State
  const [selectedClassListId, setSelectedClassListId] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Load data on component mount
  useEffect(() => {
    fetchClassLists();
    getRequestStatistics();
  }, [fetchClassLists, getRequestStatistics]);

  // Handle class list change
  const handleClassListChange = (event) => {
    const classListId = event.target.value;
    setSelectedClassListId(classListId);
    
    if (classListId) {
      getClassBalanceReport(classListId);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Refresh report data
  const refreshReportData = () => {
    if (selectedClassListId) {
      getClassBalanceReport(selectedClassListId);
    }
    getRequestStatistics();
  };

  // Helper function to generate random pastel colors
  const generatePastelColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      // Generate pastel colors by having high lightness (0.7-0.9)
      // and medium saturation (0.4-0.6)
      const h = (i * 360) / count;  // Distribute hues evenly
      const s = 0.5;  // Medium saturation
      const l = 0.8;  // High lightness for pastel
      
      // Convert HSL to RGB
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = l - c / 2;
      
      let r, g, b;
      if (h < 60) {
        [r, g, b] = [c, x, 0];
      } else if (h < 120) {
        [r, g, b] = [x, c, 0];
      } else if (h < 180) {
        [r, g, b] = [0, c, x];
      } else if (h < 240) {
        [r, g, b] = [0, x, c];
      } else if (h < 300) {
        [r, g, b] = [x, 0, c];
      } else {
        [r, g, b] = [c, 0, x];
      }
      
      const color = `rgba(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}, 0.7)`;
      colors.push(color);
    }
    return colors;
  };

  // Get chart data for gender distribution
  const getGenderChartData = () => {
    if (!classBalanceReport || !classBalanceReport.classMetrics) return null;
    
    const labels = classBalanceReport.classMetrics.map(c => c.className);
    const maleData = classBalanceReport.classMetrics.map(c => c.genderDistribution.male);
    const femaleData = classBalanceReport.classMetrics.map(c => c.genderDistribution.female);
    const otherData = classBalanceReport.classMetrics.map(c => c.genderDistribution.other);
    
    return {
      labels,
      datasets: [
        {
          label: 'Male',
          data: maleData,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        },
        {
          label: 'Female',
          data: femaleData,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
        },
        {
          label: 'Other',
          data: otherData,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
        },
      ],
    };
  };

  // Get chart data for academic distribution
  const getAcademicChartData = () => {
    if (!classBalanceReport || !classBalanceReport.classMetrics) return null;
    
    const labels = classBalanceReport.classMetrics.map(c => c.className);
    const advancedData = classBalanceReport.classMetrics.map(c => c.academicDistribution.advanced);
    const proficientData = classBalanceReport.classMetrics.map(c => c.academicDistribution.proficient);
    const basicData = classBalanceReport.classMetrics.map(c => c.academicDistribution.basic);
    const belowBasicData = classBalanceReport.classMetrics.map(c => c.academicDistribution.belowBasic || 0);
    
    return {
      labels,
      datasets: [
        {
          label: 'Advanced',
          data: advancedData,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        },
        {
          label: 'Proficient',
          data: proficientData,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
        },
        {
          label: 'Basic',
          data: basicData,
          backgroundColor: 'rgba(255, 206, 86, 0.7)',
        },
        {
          label: 'Below Basic',
          data: belowBasicData,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
        },
      ],
    };
  };

  // Get chart data for behavior distribution
  const getBehaviorChartData = () => {
    if (!classBalanceReport || !classBalanceReport.classMetrics) return null;
    
    const labels = classBalanceReport.classMetrics.map(c => c.className);
    const lowData = classBalanceReport.classMetrics.map(c => c.behaviorDistribution.low);
    const mediumData = classBalanceReport.classMetrics.map(c => c.behaviorDistribution.medium);
    const highData = classBalanceReport.classMetrics.map(c => c.behaviorDistribution.high);
    
    return {
      labels,
      datasets: [
        {
          label: 'Low',
          data: lowData,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
        },
        {
          label: 'Medium',
          data: mediumData,
          backgroundColor: 'rgba(255, 206, 86, 0.7)',
        },
        {
          label: 'High',
          data: highData,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
        },
      ],
    };
  };

  // Get chart data for special needs
  const getSpecialNeedsChartData = () => {
    if (!classBalanceReport || !classBalanceReport.classMetrics) return null;
    
    const labels = classBalanceReport.classMetrics.map(c => c.className);
    const data = classBalanceReport.classMetrics.map(c => c.specialNeedsPercentage);
    
    return {
      labels,
      datasets: [
        {
          label: 'Special Needs %',
          data,
          backgroundColor: 'rgba(153, 102, 255, 0.7)',
        },
      ],
    };
  };

  // Get chart data for balance scores
  const getBalanceScoreChartData = () => {
    if (!classBalanceReport || !classBalanceReport.balanceScores) return null;
    
    return {
      labels: ['Gender', 'Academic', 'Behavior', 'Special Needs', 'Class Size'],
      datasets: [
        {
          label: 'Balance Score',
          data: [
            classBalanceReport.balanceScores.gender,
            classBalanceReport.balanceScores.academic,
            classBalanceReport.balanceScores.behavior,
            classBalanceReport.balanceScores.specialNeeds,
            classBalanceReport.balanceScores.size,
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
        },
      ],
    };
  };

  // Get chart data for parent request types
  const getRequestTypesChartData = () => {
    if (!requestStatistics || !requestStatistics.parentRequests) return null;
    
    const { types } = requestStatistics.parentRequests;
    
    return {
      labels: ['Teacher Preference', 'Student Placement', 'Student Separation'],
      datasets: [
        {
          data: [types.teacher, types.placement, types.separation],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Get chart data for parent request status
  const getRequestStatusChartData = () => {
    if (!requestStatistics || !requestStatistics.parentRequests) return null;
    
    const { approved, pending, declined } = requestStatistics.parentRequests;
    
    return {
      labels: ['Approved', 'Pending', 'Declined'],
      datasets: [
        {
          data: [approved, pending, declined],
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(255, 99, 132, 0.7)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  const renderClassBalanceReport = () => {
    if (!classBalanceReport) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Please select a class list to view the balance report.
          </Typography>
        </Box>
      );
    }

    const genderChartData = getGenderChartData();
    const academicChartData = getAcademicChartData();
    const behaviorChartData = getBehaviorChartData();
    const specialNeedsChartData = getSpecialNeedsChartData();
    const balanceScoreChartData = getBalanceScoreChartData();

    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardHeader 
                  title="Overall Balance Score" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <Divider />
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-flex',
                      mb: 2,
                    }}
                  >
                    <CircularProgress
                      variant="determinate"
                      value={classBalanceReport.overallBalanceScore}
                      size={120}
                      thickness={5}
                      sx={{ color: (theme) => {
                        const score = classBalanceReport.overallBalanceScore;
                        if (score >= 80) return theme.palette.success.main;
                        if (score >= 60) return theme.palette.warning.main;
                        return theme.palette.error.main;
                      }}}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="h4"
                        component="div"
                        color="text.secondary"
                      >
                        {classBalanceReport.overallBalanceScore}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    A score of 100 represents perfect balance across all factors.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardHeader 
                  title="Balance Scores by Factor" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 250 }}>
                    <Radar 
                      data={balanceScoreChartData} 
                      options={radarChartOptions} 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Gender Distribution" 
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Bar data={genderChartData} options={barChartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Academic Level Distribution" 
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Bar data={academicChartData} options={barChartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Behavior Level Distribution" 
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Bar data={behaviorChartData} options={barChartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Special Needs Percentage" 
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Bar data={specialNeedsChartData} options={barChartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Card>
            <CardHeader 
              title="Class Metrics Detail" 
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Class</TableCell>
                      <TableCell align="center">Students</TableCell>
                      <TableCell align="center">Gender Ratio (M:F:O)</TableCell>
                      <TableCell align="center">Academic (A:P:B:BB)</TableCell>
                      <TableCell align="center">Behavior (L:M:H)</TableCell>
                      <TableCell align="center">Special Needs</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {classBalanceReport.classMetrics.map((metric) => (
                      <TableRow key={metric.classId}>
                        <TableCell>{metric.className}</TableCell>
                        <TableCell align="center">{metric.studentCount}</TableCell>
                        <TableCell align="center">
                          {metric.genderDistribution.male}:{metric.genderDistribution.female}:{metric.genderDistribution.other}
                        </TableCell>
                        <TableCell align="center">
                          {metric.academicDistribution.advanced}:
                          {metric.academicDistribution.proficient}:
                          {metric.academicDistribution.basic}:
                          {metric.academicDistribution.belowBasic || 0}
                        </TableCell>
                        <TableCell align="center">
                          {metric.behaviorDistribution.low}:
                          {metric.behaviorDistribution.medium}:
                          {metric.behaviorDistribution.high}
                        </TableCell>
                        <TableCell align="center">
                          {metric.specialNeedsCount} ({metric.specialNeedsPercentage}%)
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
                      <TableCell><strong>Overall</strong></TableCell>
                      <TableCell align="center"><strong>{classBalanceReport.overallMetrics.studentCount}</strong></TableCell>
                      <TableCell align="center">
                        <strong>
                          {classBalanceReport.overallMetrics.genderDistribution.male}:
                          {classBalanceReport.overallMetrics.genderDistribution.female}:
                          {classBalanceReport.overallMetrics.genderDistribution.other}
                        </strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>
                          {classBalanceReport.overallMetrics.academicDistribution.advanced}:
                          {classBalanceReport.overallMetrics.academicDistribution.proficient}:
                          {classBalanceReport.overallMetrics.academicDistribution.basic}:
                          {classBalanceReport.overallMetrics.academicDistribution.belowBasic || 0}
                        </strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>
                          {classBalanceReport.overallMetrics.behaviorDistribution.low}:
                          {classBalanceReport.overallMetrics.behaviorDistribution.medium}:
                          {classBalanceReport.overallMetrics.behaviorDistribution.high}
                        </strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>
                          {classBalanceReport.overallMetrics.specialNeedsCount} 
                          ({classBalanceReport.overallMetrics.specialNeedsPercentage}%)
                        </strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  };

  const renderRequestStatistics = () => {
    if (!requestStatistics) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No request statistics available.
          </Typography>
        </Box>
      );
    }

    const requestTypesChartData = getRequestTypesChartData();
    const requestStatusChartData = getRequestStatusChartData();

    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Parent Request Summary" 
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Total Requests:
                    </Typography>
                    <Typography variant="h3">
                      {requestStatistics.parentRequests.total}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Approval Rate:
                    </Typography>
                    <Typography variant="h3">
                      {requestStatistics.parentRequests.approvalRate}%
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Approved
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={100} 
                        color="success"
                        sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                      />
                      <Typography variant="body2">
                        {requestStatistics.parentRequests.approved}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Pending
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={100} 
                        color="warning"
                        sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                      />
                      <Typography variant="body2">
                        {requestStatistics.parentRequests.pending}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Declined
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={100} 
                        color="error"
                        sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                      />
                      <Typography variant="body2">
                        {requestStatistics.parentRequests.declined}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Teacher Survey Summary" 
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Total Surveys:
                    </Typography>
                    <Typography variant="h3">
                      {requestStatistics.teacherSurveys.total}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Completion Rate:
                    </Typography>
                    <Typography variant="h3">
                      {requestStatistics.teacherSurveys.completionRate}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Completed
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={100} 
                        color="success"
                        sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                      />
                      <Typography variant="body2">
                        {requestStatistics.teacherSurveys.completed}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Pending
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={100} 
                        color="warning"
                        sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                      />
                      <Typography variant="body2">
                        {requestStatistics.teacherSurveys.pending}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Parent Request Types" 
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Pie data={requestTypesChartData} options={pieChartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Parent Request Status" 
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Pie data={requestStatusChartData} options={pieChartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reports & Analytics
        </Typography>
        <Box>
          <IconButton 
            onClick={refreshReportData}
            disabled={isLoading || reportsLoading}
            sx={{ mr: 1 }}
            color="primary"
          >
            {isLoading || reportsLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
          <Tooltip title="Export to Excel (Coming Soon)">
            <span>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                disabled={true}
              >
                Export
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Display error if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="class-list-label">Select Class List</InputLabel>
              <Select
                labelId="class-list-label"
                value={selectedClassListId}
                label="Select Class List"
                onChange={handleClassListChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {classLists.map((classList) => (
                  <MenuItem key={classList.id} value={classList.id}>
                    {classList.name} - Grade {classList.gradeLevel} ({classList.academicYear})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab 
                icon={<BarChartIcon />} 
                iconPosition="start" 
                label="Class Balance" 
              />
              <Tab 
                icon={<PieChartIcon />} 
                iconPosition="start" 
                label="Request Stats" 
              />
            </Tabs>
          </Grid>
        </Grid>
      </Paper>
      
      {isLoading || reportsLoading ? (
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading report data...
          </Typography>
        </Box>
      ) : (
        <Box>
          {activeTab === 0 ? renderClassBalanceReport() : renderRequestStatistics()}
        </Box>
      )}
    </Box>
  );
};

export default Reports; 