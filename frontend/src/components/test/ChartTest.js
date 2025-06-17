import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Box, Paper, Typography } from '@mui/material';

const testData = [
  { name: 'Jan', value: 30 },
  { name: 'Feb', value: 45 },
  { name: 'Mar', value: 60 },
  { name: 'Apr', value: 35 },
  { name: 'May', value: 80 },
  { name: 'Jun', value: 55 }
];

const pieData = [
  { name: 'A', value: 400, color: '#0088FE' },
  { name: 'B', value: 300, color: '#00C49F' },
  { name: 'C', value: 300, color: '#FFBB28' },
  { name: 'D', value: 200, color: '#FF8042' }
];

const ChartTest = () => {
  console.log('ChartTest rendered with data:', testData, pieData);
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Chart Test Page</Typography>
      
      {/* Bar Chart Test */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Bar Chart Test</Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={testData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
      
      {/* Pie Chart Test */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Pie Chart Test</Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChartTest;