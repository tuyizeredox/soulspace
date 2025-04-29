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
  Grid
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { LocalHospital as DoctorIcon } from '@mui/icons-material';

const DoctorPerformanceChart = ({ data, timeRange }) => {
  const theme = useTheme();

  // Format data for the chart
  const chartData = [
    { name: 'Doctors', value: data.totalDoctors || 0 },
    { name: 'Patients', value: data.totalPatients || 0 },
    { name: 'Active Treatments', value: data.activeTreatments || 0 }
  ];

  // Colors for the pie chart
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main
  ];

  // Calculate the patient-to-doctor ratio
  const patientDoctorRatio = data.totalDoctors > 0 
    ? (data.totalPatients / data.totalDoctors).toFixed(1) 
    : 0;

  // Calculate the treatment efficiency (treatments per doctor)
  const treatmentEfficiency = data.totalDoctors > 0 
    ? (data.activeTreatments / data.totalDoctors).toFixed(1) 
    : 0;

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
            {payload[0].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {payload[0].value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {((payload[0].value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
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
            <DoctorIcon 
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
              Doctor Performance
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
          <Grid item xs={12} md={7}>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Patient-to-Doctor Ratio
                </Typography>
                <Typography variant="h4" fontWeight={600} color="primary">
                  {patientDoctorRatio}:1
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Patients per doctor
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Treatment Efficiency
                </Typography>
                <Typography variant="h4" fontWeight={600} color="secondary">
                  {treatmentEfficiency}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active treatments per doctor
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DoctorPerformanceChart;
