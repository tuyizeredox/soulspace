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

const DatabasePerformanceMetrics = () => {
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

  // Mock data for database performance
  const queryResponseTimeData = [
    { time: '00:00', value: 42 },
    { time: '02:00', value: 38 },
    { time: '04:00', value: 35 },
    { time: '06:00', value: 40 },
    { time: '08:00', value: 65 },
    { time: '10:00', value: 78 },
    { time: '12:00', value: 82 },
    { time: '14:00', value: 75 },
    { time: '16:00', value: 70 },
    { time: '18:00', value: 60 },
    { time: '20:00', value: 55 },
    { time: '22:00', value: 48 },
  ];

  const queryVolumeData = [
    { time: '00:00', reads: 320, writes: 80 },
    { time: '02:00', reads: 280, writes: 60 },
    { time: '04:00', reads: 220, writes: 40 },
    { time: '06:00', reads: 300, writes: 70 },
    { time: '08:00', reads: 520, writes: 150 },
    { time: '10:00', reads: 780, writes: 220 },
    { time: '12:00', reads: 850, writes: 250 },
    { time: '14:00', reads: 820, writes: 230 },
    { time: '16:00', reads: 750, writes: 200 },
    { time: '18:00', reads: 620, writes: 180 },
    { time: '20:00', reads: 480, writes: 120 },
    { time: '22:00', reads: 380, writes: 90 },
  ];

  // Top slow queries data
  const slowQueriesData = [
    {
      id: 1,
      query: 'SELECT * FROM patients WHERE hospital_id = ? AND status = ?',
      avgTime: '120ms',
      executions: 1245,
      lastExecuted: '10 min ago',
    },
    {
      id: 2,
      query: 'SELECT * FROM appointments WHERE doctor_id = ? AND date BETWEEN ? AND ?',
      avgTime: '95ms',
      executions: 2150,
      lastExecuted: '5 min ago',
    },
    {
      id: 3,
      query: 'SELECT * FROM medical_records WHERE patient_id = ? ORDER BY date DESC',
      avgTime: '85ms',
      executions: 1820,
      lastExecuted: '12 min ago',
    },
    {
      id: 4,
      query: 'UPDATE user_sessions SET last_activity = ? WHERE user_id = ?',
      avgTime: '75ms',
      executions: 5240,
      lastExecuted: '2 min ago',
    },
    {
      id: 5,
      query: 'INSERT INTO notifications (user_id, type, message, created_at) VALUES (?, ?, ?, ?)',
      avgTime: '68ms',
      executions: 3150,
      lastExecuted: '3 min ago',
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
          Database Performance Metrics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Detailed database performance analytics over the last 24 hours
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Query Response Time Chart */}
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
                  Query Response Time
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
                    data={queryResponseTimeData}
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

          {/* Query Volume Chart */}
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
                  Query Volume
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
                    data={queryVolumeData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="reads"
                      name="Read Queries"
                      fill={theme.palette.info.main}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="writes"
                      name="Write Queries"
                      fill={theme.palette.warning.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Top Slow Queries Table */}
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
                  Top Slow Queries
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
                      <TableCell sx={{ fontWeight: 600 }}>Query</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Avg. Time</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Executions</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Last Executed</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {slowQueriesData.map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.query}
                        </TableCell>
                        <TableCell align="right">{row.avgTime}</TableCell>
                        <TableCell align="right">{row.executions.toLocaleString()}</TableCell>
                        <TableCell align="right">{row.lastExecuted}</TableCell>
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

export default DatabasePerformanceMetrics;
