import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
  FilterAlt as FilterIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  CompareArrows as CompareIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import axios from 'axios';

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <Typography variant="subtitle2" color="textSecondary">
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: entry.color,
                mr: 1,
                borderRadius: '50%',
              }}
            />
            <Typography variant="body2">
              {entry.name}: {entry.value.toFixed(2)}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

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

const MultiYearAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [yearRange, setYearRange] = useState(['2022-2023', '2023-2024']);
  const [selectedGrades, setSelectedGrades] = useState(['all']);
  const [selectedMetrics, setSelectedMetrics] = useState(['academicBalance', 'behavioralBalance']);
  const [chartType, setChartType] = useState('line');
  const [multiYearData, setMultiYearData] = useState(null);
  const [compareMode, setCompareMode] = useState(false);

  // Available academic years
  const availableYears = ['2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025'];
  
  // Available grades
  const grades = [
    { value: 'all', label: 'All Grades' },
    { value: 'K', label: 'Kindergarten' },
    { value: '1', label: '1st Grade' },
    { value: '2', label: '2nd Grade' },
    { value: '3', label: '3rd Grade' },
    { value: '4', label: '4th Grade' },
    { value: '5', label: '5th Grade' },
  ];

  // Available metrics
  const metrics = [
    { value: 'academicBalance', label: 'Academic Balance', color: '#8884d8' },
    { value: 'behavioralBalance', label: 'Behavioral Balance', color: '#82ca9d' },
    { value: 'genderBalance', label: 'Gender Balance', color: '#ffc658' },
    { value: 'specialNeedsDistribution', label: 'Special Needs Distribution', color: '#ff8042' },
    { value: 'parentRequestsFulfilled', label: 'Parent Requests Fulfilled', color: '#0088FE' },
    { value: 'teacherSatisfaction', label: 'Teacher Satisfaction', color: '#00C49F' },
    { value: 'studentPerformanceGrowth', label: 'Student Growth', color: '#FFBB28' },
  ];

  // Chart types
  const chartTypes = [
    { value: 'line', label: 'Line Chart' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'composed', label: 'Composed Chart' },
    { value: 'radar', label: 'Radar Chart' },
  ];

  // Fetch data when filters change
  useEffect(() => {
    fetchMultiYearData();
  }, [yearRange, selectedGrades, selectedMetrics]);

  // Sample color array for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

  const fetchMultiYearData = async () => {
    try {
      setLoading(true);
      
      // In a real application, we would call the API with the filter parameters
      // const response = await axios.get('/api/analytics/multi-year', {
      //   params: {
      //     years: yearRange,
      //     grades: selectedGrades,
      //     metrics: selectedMetrics
      //   }
      // });
      // setMultiYearData(response.data);
      
      // For now, let's generate mock data
      const mockData = generateMockData();
      setMultiYearData(mockData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching multi-year data:', err);
      setError('Failed to fetch multi-year analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for development purposes
  const generateMockData = () => {
    // Trends data for line/area charts
    const trends = yearRange.map(year => {
      const baseData = {
        year,
        academicBalance: 70 + Math.random() * 20,
        behavioralBalance: 65 + Math.random() * 25,
        genderBalance: 80 + Math.random() * 15,
        specialNeedsDistribution: 75 + Math.random() * 15,
        parentRequestsFulfilled: 65 + Math.random() * 30,
        teacherSatisfaction: 70 + Math.random() * 20,
        studentPerformanceGrowth: 60 + Math.random() * 30
      };
      
      // Add grade-specific data if not "all grades"
      if (!selectedGrades.includes('all')) {
        selectedGrades.forEach(grade => {
          baseData[`grade_${grade}_academicBalance`] = 65 + Math.random() * 25;
          baseData[`grade_${grade}_behavioralBalance`] = 60 + Math.random() * 30;
        });
      }
      
      return baseData;
    });

    // Comparison data for radar charts
    const comparison = metrics.map(metric => {
      const data = {
        metric: metric.label,
      };
      
      yearRange.forEach(year => {
        data[year] = 60 + Math.random() * 30;
      });
      
      return data;
    });

    // Grade distribution changes over years
    const gradeDistribution = availableYears.map(year => {
      const data = {
        year,
      };
      
      grades.filter(g => g.value !== 'all').forEach(grade => {
        data[grade.label] = 50 + Math.random() * 50;
      });
      
      return data;
    });

    // Student performance data
    const performanceMetrics = ['Reading', 'Math', 'Science', 'Social Studies', 'Art'];
    const performanceTrends = yearRange.map(year => {
      const yearData = {
        year,
      };
      
      performanceMetrics.forEach(subject => {
        yearData[subject] = 70 + Math.random() * 20;
      });
      
      return yearData;
    });

    // Optimization impact data
    const optimizationImpact = yearRange.map(year => {
      return {
        year,
        beforeOptimization: 50 + Math.random() * 20,
        afterOptimization: 70 + Math.random() * 20,
        improvement: 15 + Math.random() * 10,
      };
    });

    return {
      trends,
      comparison,
      gradeDistribution,
      performanceTrends,
      optimizationImpact
    };
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleYearRangeChange = (event) => {
    setYearRange(event.target.value);
  };

  const handleGradeChange = (event) => {
    setSelectedGrades(event.target.value);
  };

  const handleMetricsChange = (event) => {
    setSelectedMetrics(event.target.value);
  };

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
  };

  const handleExport = async (format) => {
    try {
      // In a real app, we would call the export API
      // const response = await axios.get(`/api/analytics/multi-year/export/${format}`, {
      //   params: {
      //     years: yearRange,
      //     grades: selectedGrades,
      //     metrics: selectedMetrics
      //   },
      //   responseType: 'blob'
      // });
      
      // Mock download behavior
      alert(`Exporting data in ${format} format`);
      
      // Create a download link for a real implementation
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `class-harmony-multi-year-analytics.${format}`);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
    } catch (err) {
      console.error('Error exporting analytics:', err);
      setError('Failed to export data. Please try again later.');
    }
  };

  // Render trends chart based on selected chart type
  const renderTrendsChart = () => {
    if (!multiYearData || !multiYearData.trends) return null;

    const filteredMetrics = metrics.filter(m => selectedMetrics.includes(m.value));
    
    const renderChart = () => {
      switch (chartType) {
        case 'bar':
          return (
            <BarChart data={multiYearData.trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              {filteredMetrics.map((metric, index) => (
                <Bar 
                  key={metric.value} 
                  dataKey={metric.value} 
                  name={metric.label} 
                  fill={metric.color || COLORS[index % COLORS.length]} 
                />
              ))}
            </BarChart>
          );
        case 'area':
          return (
            <AreaChart data={multiYearData.trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              {filteredMetrics.map((metric, index) => (
                <Area 
                  key={metric.value} 
                  type="monotone" 
                  dataKey={metric.value} 
                  name={metric.label} 
                  fill={metric.color || COLORS[index % COLORS.length]} 
                  fillOpacity={0.6}
                  stroke={metric.color || COLORS[index % COLORS.length]} 
                />
              ))}
            </AreaChart>
          );
        case 'composed':
          return (
            <ComposedChart data={multiYearData.trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              {filteredMetrics.map((metric, index) => 
                index % 2 === 0 ? (
                  <Bar 
                    key={metric.value} 
                    dataKey={metric.value} 
                    name={metric.label} 
                    fill={metric.color || COLORS[index % COLORS.length]} 
                  />
                ) : (
                  <Line 
                    key={metric.value} 
                    type="monotone" 
                    dataKey={metric.value} 
                    name={metric.label} 
                    stroke={metric.color || COLORS[index % COLORS.length]} 
                  />
                )
              )}
            </ComposedChart>
          );
        case 'radar':
          // For radar chart, we need to transform the data
          const radarData = multiYearData.comparison;
          return (
            <RadarChart outerRadius={150} width={500} height={500} data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              {yearRange.map((year, index) => (
                <Radar 
                  key={year} 
                  name={year} 
                  dataKey={year} 
                  stroke={COLORS[index % COLORS.length]} 
                  fill={COLORS[index % COLORS.length]} 
                  fillOpacity={0.6} 
                />
              ))}
              <Legend />
              <RechartsTooltip />
            </RadarChart>
          );
        case 'line':
        default:
          return (
            <LineChart data={multiYearData.trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              {filteredMetrics.map((metric, index) => (
                <Line 
                  key={metric.value} 
                  type="monotone" 
                  dataKey={metric.value} 
                  name={metric.label} 
                  stroke={metric.color || COLORS[index % COLORS.length]} 
                  activeDot={{ r: 8 }} 
                />
              ))}
            </LineChart>
          );
      }
    };

    return (
      <ResponsiveContainer width="100%" height={400}>
        {renderChart()}
      </ResponsiveContainer>
    );
  };

  // Render optimization impact chart
  const renderOptimizationImpactChart = () => {
    if (!multiYearData || !multiYearData.optimizationImpact) return null;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={multiYearData.optimizationImpact} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend />
          <Bar yAxisId="left" dataKey="beforeOptimization" name="Before Optimization" fill="#8884d8" />
          <Bar yAxisId="left" dataKey="afterOptimization" name="After Optimization" fill="#82ca9d" />
          <Line yAxisId="right" type="monotone" dataKey="improvement" name="Improvement %" stroke="#ff7300" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  // Render student performance trends
  const renderPerformanceTrendsChart = () => {
    if (!multiYearData || !multiYearData.performanceTrends) return null;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={multiYearData.performanceTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="Reading" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Math" stroke="#82ca9d" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Science" stroke="#ffc658" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Social Studies" stroke="#ff8042" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Art" stroke="#0088FE" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Multi-Year Analytics
          </Typography>
          
          <Box>
            <Tooltip title="Export as Excel">
              <IconButton onClick={() => handleExport('xlsx')} sx={{ mr: 1 }}>
                <TableIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export as PDF">
              <IconButton onClick={() => handleExport('pdf')} sx={{ mr: 1 }}>
                <PdfIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export as CSV">
              <IconButton onClick={() => handleExport('csv')}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Filters and Chart Options
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Academic Years</InputLabel>
                <Select
                  multiple
                  value={yearRange}
                  onChange={handleYearRangeChange}
                  label="Academic Years"
                  renderValue={(selected) => selected.join(', ')}
                >
                  {availableYears.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Grade Levels</InputLabel>
                <Select
                  multiple
                  value={selectedGrades}
                  onChange={handleGradeChange}
                  label="Grade Levels"
                  renderValue={(selected) => 
                    selected.includes('all') 
                      ? 'All Grades' 
                      : selected.map(g => grades.find(grade => grade.value === g)?.label).join(', ')
                  }
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Metrics</InputLabel>
                <Select
                  multiple
                  value={selectedMetrics}
                  onChange={handleMetricsChange}
                  label="Metrics"
                  renderValue={(selected) => 
                    selected.map(m => metrics.find(metric => metric.value === m)?.label).join(', ')
                  }
                >
                  {metrics.map((metric) => (
                    <MenuItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              aria-label="chart type"
              size="small"
            >
              {chartTypes.map(type => (
                <ToggleButton key={type.value} value={type.value}>
                  {type.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            
            <Box>
              <Button
                variant={compareMode ? "contained" : "outlined"}
                startIcon={<CompareIcon />}
                onClick={toggleCompareMode}
                sx={{ mr: 1 }}
              >
                Compare Mode
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchMultiYearData}
              >
                Refresh Data
              </Button>
            </Box>
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Metrics Trends" icon={<TrendingUpIcon />} iconPosition="start" />
              <Tab label="Optimization Impact" icon={<CompareIcon />} iconPosition="start" />
              <Tab label="Student Performance" icon={<SchoolIcon />} iconPosition="start" />
            </Tabs>
            
            <TabPanel value={activeTab} index={0}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Multi-Year Trends: {selectedMetrics.map(m => metrics.find(metric => metric.value === m)?.label).join(', ')}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Analyze how selected metrics have changed over time across different academic years.
                </Typography>
                {renderTrendsChart()}
              </Paper>
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Optimization Impact Analysis
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Compare class balance metrics before and after optimization across multiple years.
                </Typography>
                {renderOptimizationImpactChart()}
              </Paper>
            </TabPanel>
            
            <TabPanel value={activeTab} index={2}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Student Performance Trends
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Track student academic performance across different subjects over multiple years.
                </Typography>
                {renderPerformanceTrendsChart()}
              </Paper>
            </TabPanel>
          </>
        )}
      </Box>
    </Container>
  );
};

export default MultiYearAnalytics;
