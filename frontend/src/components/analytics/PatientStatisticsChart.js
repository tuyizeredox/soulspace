import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Divider,
  Chip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { PersonOutline as PatientIcon } from '@mui/icons-material';

const PatientStatisticsChart = ({ data, timeRange }) => {
  const theme = useTheme();

  // Format data for the chart
  const chartData = data.labels?.map((label, index) => ({
    month: label,
    patients: data.datasets?.[0]?.data?.[index] || 0,
    appointments: data.datasets?.[1]?.data?.[index] || 0
  })) || [];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
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
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: entry.color,
                  borderRadius: '50%',
                  mr: 1
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {entry.name}: {entry.value}
              </Typography>
            </Box>
          ))}
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
            <PatientIcon 
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
              Patient Statistics
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
        
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="patients"
                name="New Patients"
                fill={theme.palette.primary.main}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="appointments"
                name="Appointments"
                fill={theme.palette.secondary.main}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PatientStatisticsChart;
