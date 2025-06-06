import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  alpha,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import {
  AreaChart,
  Area,
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

const SystemPerformanceAnalytics = ({ data, timeRange }) => {
  const theme = useTheme();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

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

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 1
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                  mr: 1
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {entry.name}: {entry.value}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Card
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{ mb: 3 }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          System Performance Metrics
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* CPU & Memory Usage Chart */}
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>CPU & Memory Usage</Typography>
                <Chip 
                  label="Real-time" 
                  size="small" 
                  color="primary" 
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.systemUsage}
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
                      stroke={theme.palette.primary.main}
                      fill={alpha(theme.palette.primary.main, 0.2)}
                    />
                    <Area
                      type="monotone"
                      dataKey="memory"
                      name="Memory Usage"
                      stroke={theme.palette.secondary.main}
                      fill={alpha(theme.palette.secondary.main, 0.2)}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Response Time Chart */}
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>API Response Time</Typography>
                <Chip 
                  label={timeRange} 
                  size="small" 
                  color="info" 
                  sx={{ fontWeight: 500, height: 24, textTransform: 'capitalize' }}
                />
              </Box>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.responseTime}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="time"
                      name="Response Time (ms)"
                      stroke={theme.palette.info.main}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Error Rate Chart */}
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Error Rate</Typography>
                <Chip 
                  label={timeRange} 
                  size="small" 
                  color="error" 
                  sx={{ fontWeight: 500, height: 24, textTransform: 'capitalize' }}
                />
              </Box>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.errorRate}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="errors"
                      name="Errors"
                      fill={theme.palette.error.main}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="warnings"
                      name="Warnings"
                      fill={theme.palette.warning.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Server Load Chart */}
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Server Load</Typography>
                <Chip 
                  label={timeRange} 
                  size="small" 
                  color="success" 
                  sx={{ fontWeight: 500, height: 24, textTransform: 'capitalize' }}
                />
              </Box>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.serverLoad}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="load"
                      name="Server Load"
                      stroke={theme.palette.success.main}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="connections"
                      name="Active Connections"
                      stroke={theme.palette.warning.main}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SystemPerformanceAnalytics;
