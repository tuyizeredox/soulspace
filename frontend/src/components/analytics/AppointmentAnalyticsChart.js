import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Divider,
  Chip,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { EventNote as AppointmentIcon } from '@mui/icons-material';

const AppointmentAnalyticsChart = ({ data, timeRange }) => {
  const theme = useTheme();

  // Format data for the chart
  const chartData = [
    { name: 'Pending', value: data.pending || 0, color: theme.palette.warning.main },
    { name: 'Confirmed', value: data.confirmed || 0, color: theme.palette.success.main }
  ];

  // Calculate percentages
  const totalAppointments = data.total || (data.pending + data.confirmed) || 1;
  const pendingPercentage = ((data.pending / totalAppointments) * 100).toFixed(1);
  const confirmedPercentage = ((data.confirmed / totalAppointments) * 100).toFixed(1);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: theme.shadows[3]
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            {payload[0].name} Appointments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {payload[0].value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {((payload[0].value / totalAppointments) * 100).toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: theme.shadows[2] }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AppointmentIcon 
              sx={{ 
                color: theme.palette.primary.main, 
                mr: 1, 
                fontSize: 28,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                padding: 0.5,
                borderRadius: '50%'
              }} 
            />
            <Typography variant="h6" fontWeight={600}>
              Appointment Analytics
            </Typography>
          </Box>
          <Chip
            label={timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
            size="small"
            color="primary"
            sx={{ fontWeight: 500, height: 24 }}
          />
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pending Appointments
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600} color="warning.main">
                    {pendingPercentage}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={parseFloat(pendingPercentage)} 
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {data.pending} appointments awaiting confirmation
                </Typography>
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Confirmed Appointments
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600} color="success.main">
                    {confirmedPercentage}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={parseFloat(confirmedPercentage)} 
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {data.confirmed} appointments confirmed
                </Typography>
              </Box>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={600} color="primary.main">
                  {totalAppointments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Appointments
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AppointmentAnalyticsChart;
