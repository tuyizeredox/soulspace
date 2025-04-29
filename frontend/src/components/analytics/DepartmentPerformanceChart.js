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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating
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
import { Business as DepartmentIcon } from '@mui/icons-material';

const DepartmentPerformanceChart = ({ data, timeRange }) => {
  const theme = useTheme();

  // Format data for the chart
  const chartData = data.map(dept => ({
    name: dept.name,
    doctors: dept.doctors,
    patients: dept.patients,
    appointments: dept.appointments
  }));

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
            <DepartmentIcon 
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
              Department Performance
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
        
        <Box sx={{ height: 250, mb: 3 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="doctors"
                name="Doctors"
                fill={theme.palette.primary.main}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="patients"
                name="Patients"
                fill={theme.palette.secondary.main}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="appointments"
                name="Appointments"
                fill={theme.palette.success.main}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Doctors</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Patients</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Satisfaction</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((dept, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {dept.name}
                  </TableCell>
                  <TableCell align="center">{dept.doctors}</TableCell>
                  <TableCell align="center">{dept.patients}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Rating 
                        value={dept.satisfaction / 20} 
                        precision={0.5} 
                        readOnly 
                        size="small" 
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {dept.satisfaction}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default DepartmentPerformanceChart;
