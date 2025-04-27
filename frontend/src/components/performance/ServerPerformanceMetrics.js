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
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

const ServerPerformanceMetrics = () => {
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

  // Mock data for server performance
  const responseTimeData = [
    { time: '00:00', value: 120 },
    { time: '02:00', value: 132 },
    { time: '04:00', value: 100 },
    { time: '06:00', value: 152 },
    { time: '08:00', value: 205 },
    { time: '10:00', value: 178 },
    { time: '12:00', value: 195 },
    { time: '14:00', value: 220 },
    { time: '16:00', value: 180 },
    { time: '18:00', value: 165 },
    { time: '20:00', value: 140 },
    { time: '22:00', value: 125 },
  ];

  const serverLoadData = [
    { time: '00:00', cpu: 25, memory: 35, disk: 15 },
    { time: '02:00', cpu: 30, memory: 38, disk: 16 },
    { time: '04:00', cpu: 22, memory: 32, disk: 14 },
    { time: '06:00', cpu: 28, memory: 40, disk: 18 },
    { time: '08:00', cpu: 45, memory: 55, disk: 22 },
    { time: '10:00', cpu: 52, memory: 62, disk: 25 },
    { time: '12:00', cpu: 48, memory: 58, disk: 24 },
    { time: '14:00', cpu: 50, memory: 60, disk: 26 },
    { time: '16:00', cpu: 42, memory: 52, disk: 22 },
    { time: '18:00', cpu: 38, memory: 48, disk: 20 },
    { time: '20:00', cpu: 30, memory: 42, disk: 18 },
    { time: '22:00', cpu: 26, memory: 36, disk: 16 },
  ];

  const requestVolumeData = [
    { time: '00:00', requests: 520 },
    { time: '02:00', requests: 420 },
    { time: '04:00', requests: 320 },
    { time: '06:00', requests: 480 },
    { time: '08:00', requests: 850 },
    { time: '10:00', requests: 1200 },
    { time: '12:00', requests: 1350 },
    { time: '14:00', requests: 1280 },
    { time: '16:00', requests: 1150 },
    { time: '18:00', requests: 950 },
    { time: '20:00', requests: 780 },
    { time: '22:00', requests: 650 },
  ];

  const errorRateData = [
    { time: '00:00', rate: 0.8 },
    { time: '02:00', rate: 0.5 },
    { time: '04:00', rate: 0.3 },
    { time: '06:00', rate: 0.7 },
    { time: '08:00', rate: 1.2 },
    { time: '10:00', rate: 1.8 },
    { time: '12:00', rate: 1.5 },
    { time: '14:00', rate: 1.3 },
    { time: '16:00', rate: 1.0 },
    { time: '18:00', rate: 0.8 },
    { time: '20:00', rate: 0.6 },
    { time: '22:00', rate: 0.4 },
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
          Server Performance Metrics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Detailed server performance analytics over the last 24 hours
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Response Time Chart */}
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
                  Response Time
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
                    data={responseTimeData}
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

          {/* Server Load Chart */}
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
                  Server Load
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
                  <AreaChart
                    data={serverLoadData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      name="CPU Usage"
                      stackId="1"
                      stroke={theme.palette.primary.main}
                      fill={alpha(theme.palette.primary.main, 0.6)}
                      unit="%"
                    />
                    <Area
                      type="monotone"
                      dataKey="memory"
                      name="Memory Usage"
                      stackId="2"
                      stroke={theme.palette.info.main}
                      fill={alpha(theme.palette.info.main, 0.6)}
                      unit="%"
                    />
                    <Area
                      type="monotone"
                      dataKey="disk"
                      name="Disk I/O"
                      stackId="3"
                      stroke={theme.palette.success.main}
                      fill={alpha(theme.palette.success.main, 0.6)}
                      unit="%"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Request Volume Chart */}
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
                  Request Volume
                </Typography>
                <Chip
                  label="Last 24 Hours"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={requestVolumeData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      name="Requests"
                      stroke={theme.palette.success.main}
                      fill={alpha(theme.palette.success.main, 0.2)}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Error Rate Chart */}
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
                  Error Rate
                </Typography>
                <Chip
                  label="Last 24 Hours"
                  size="small"
                  color="error"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={errorRateData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      name="Error Rate"
                      stroke={theme.palette.error.main}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      unit="%"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ServerPerformanceMetrics;
