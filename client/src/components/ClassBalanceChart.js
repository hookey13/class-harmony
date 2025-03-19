import React from 'react';
import { Box, Paper, Typography, Grid, Divider } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

/**
 * Component to visualize class balance metrics
 * 
 * @param {Object} props
 * @param {Object} props.data - Balance metrics data
 */
const ClassBalanceChart = ({ data }) => {
  if (!data) return null;
  
  const classData = data.classes ? data.classes : [];
  
  // Format data for radar chart
  const radarData = [
    { subject: 'Gender Balance', A: data.genderBalance || 0, fullMark: 100 },
    { subject: 'Academic Balance', A: data.academicBalance || 0, fullMark: 100 },
    { subject: 'Behavioral Balance', A: data.behavioralBalance || 0, fullMark: 100 },
    { subject: 'Special Needs', A: data.specialNeedsDistribution || 0, fullMark: 100 },
    { subject: 'Parent Requests', A: data.parentRequestsFulfilled || 0, fullMark: 100 },
  ];
  
  // Format data for pie chart
  const genderData = [
    { name: 'Male', value: data.genderCounts?.male || 0 },
    { name: 'Female', value: data.genderCounts?.female || 0 },
  ];
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Class Balance Analysis</Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={4}>
        {/* Class Size Distribution */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>Class Size Distribution</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={classData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#8884d8" name="Student Count" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        {/* Gender Distribution */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>Overall Gender Distribution</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        {/* Balance Radar Chart */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Balance Metrics</Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Balance Score" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Legend />
                <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ClassBalanceChart; 