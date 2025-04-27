import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  LinearProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

const ApiPerformanceMetrics = () => {
  const theme = useTheme();

  // Animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Mock data for API performance
  const apiResponseTimeData = [
    { time: '00:00', value: 85 },
    { time: '02:00', value: 78 },
    { time: '04:00', value: 72 },
    { time: '06:00', value: 80 },
    { time: '08:00', value: 120 },
    { time: '10:00', value: 145 },
    { time: '12:00', value: 155 },
    { time: '14:00', value: 140 },
    { time: '16:00', value: 130 },
    { time: '18:00', value: 115 },
    { time: '20:00', value: 100 },
    { time: '22:00', value: 90 },
  ];

  const apiRequestsData = [
    { time: '00:00', successful: 420, failed: 12 },
    { time: '02:00', successful: 380, failed: 8 },
    { time: '04:00', successful: 320, failed: 5 },
    { time: '06:00', successful: 420, failed: 10 },
    { time: '08:00', successful: 680, failed: 22 },
    { time: '10:00', successful: 920, failed: 35 },
    { time: '12:00', successful: 1050, failed: 42 },
    { time: '14:00', successful: 980, failed: 38 },
    { time: '16:00', successful: 850, failed: 30 },
    { time: '18:00', successful: 720, failed: 25 },
    { time: '20:00', successful: 580, failed: 18 },
    { time: '22:00', successful: 480, failed: 14 },
  ];

  // Top API endpoints data
  const topEndpointsData = [
    {
      id: 1,
      endpoint: '/api/appointments',
      method: 'GET',
      avgResponseTime: '95ms',
      requests: 12450,
      errorRate: '0.8%',
      status: 'Healthy',
    },
    {
      id: 2,
      endpoint: '/api/users/profile',
      method: 'GET',
      avgResponseTime: '78ms',
      requests: 9820,
      errorRate: '0.5%',
      status: 'Healthy',
    },
    {
      id: 3,
      endpoint: '/api/auth/login',
      method: 'POST',
      avgResponseTime: '120ms',
      requests: 7540,
      errorRate: '1.2%',
      status: 'Healthy',
    },
    {
      id: 4,
      endpoint: '/api/appointments/book',
      method: 'POST',
      avgResponseTime: '145ms',
      requests: 5280,
      errorRate: '1.8%',
      status: 'Warning',
    },
    {
      id: 5,
      endpoint: '/api/medical-records',
      method: 'GET',
      avgResponseTime: '110ms',
      requests: 4950,
      errorRate: '0.9%',
      status: 'Healthy',
    },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            p: 2,
            borderRadius: 1,
            boxShadow: theme.shadows[3],
          }}
        >
          <Typography variant="subtitle2">{label}</Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: entry.color,
                  borderRadius: '50%',
                  mr: 1,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {entry.name}: {entry.value} {entry.unit || ''}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Healthy':
        return theme.palette.success.main;
      case 'Warning':
        return theme.palette.warning.main;
      case 'Critical':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <Card
      component={motion.div}
      variants={itemVariants}
      sx={{
        mb: 3,
        borderRadius: 2,
        boxShadow: theme.shadows[3],
        background: `linear-gradient(to right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          API Performance Metrics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Detailed API performance analytics over the last 24 hours
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* API Response Time Chart */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  API Response Time
                </Typography>
                <Chip
                  label="Last 24 Hours"
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={apiResponseTimeData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Response Time"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      unit="ms"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* API Requests Chart */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  API Requests
                </Typography>
                <Chip
                  label="Last 24 Hours"
                  size="small"
                  color="info"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={apiRequestsData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="successful"
                      name="Successful Requests"
                      fill={theme.palette.success.main}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="failed"
                      name="Failed Requests"
                      fill={theme.palette.error.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Top API Endpoints Table */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Top API Endpoints
                </Typography>
                <Chip
                  label="Last 24 Hours"
                  size="small"
                  color="warning"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                <Table sx={{ minWidth: 650 }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Avg. Response Time</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Requests</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Error Rate</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topEndpointsData.map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.endpoint}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.method}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              backgroundColor: row.method === 'GET' 
                                ? alpha(theme.palette.info.main, 0.1)
                                : row.method === 'POST'
                                ? alpha(theme.palette.success.main, 0.1)
                                : row.method === 'PUT'
                                ? alpha(theme.palette.warning.main, 0.1)
                                : alpha(theme.palette.error.main, 0.1),
                              color: row.method === 'GET' 
                                ? theme.palette.info.main
                                : row.method === 'POST'
                                ? theme.palette.success.main
                                : row.method === 'PUT'
                                ? theme.palette.warning.main
                                : theme.palette.error.main,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">{row.avgResponseTime}</TableCell>
                        <TableCell align="right">{row.requests.toLocaleString()}</TableCell>
                        <TableCell align="right">{row.errorRate}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(row.status),
                                mr: 1,
                              }}
                            />
                            <Typography variant="body2">{row.status}</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ApiPerformanceMetrics;
