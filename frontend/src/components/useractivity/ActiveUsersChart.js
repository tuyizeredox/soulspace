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
  ToggleButtonGroup,
  ToggleButton,
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

const ActiveUsersChart = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = React.useState('day');

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

  // Mock data for active users
  const dailyActiveUsersData = [
    { time: '00:00', users: 1250 },
    { time: '02:00', users: 980 },
    { time: '04:00', users: 780 },
    { time: '06:00', users: 1050 },
    { time: '08:00', users: 1850 },
    { time: '10:00', users: 2450 },
    { time: '12:00', users: 2780 },
    { time: '14:00', users: 2650 },
    { time: '16:00', users: 2350 },
    { time: '18:00', users: 2050 },
    { time: '20:00', users: 1750 },
    { time: '22:00', users: 1450 },
  ];

  const weeklyActiveUsersData = [
    { day: 'Mon', users: 2850 },
    { day: 'Tue', users: 3050 },
    { day: 'Wed', users: 2950 },
    { day: 'Thu', users: 3150 },
    { day: 'Fri', users: 3450 },
    { day: 'Sat', users: 2850 },
    { day: 'Sun', users: 2650 },
  ];

  const monthlyActiveUsersData = [
    { date: '01', users: 2850 },
    { date: '05', users: 3050 },
    { date: '10', users: 3250 },
    { date: '15', users: 3450 },
    { date: '20', users: 3650 },
    { date: '25', users: 3850 },
    { date: '30', users: 4050 },
  ];

  // Get data based on time range
  const getActiveUsersData = () => {
    switch (timeRange) {
      case 'day':
        return dailyActiveUsersData;
      case 'week':
        return weeklyActiveUsersData;
      case 'month':
        return monthlyActiveUsersData;
      default:
        return dailyActiveUsersData;
    }
  };

  // Get x-axis key based on time range
  const getXAxisKey = () => {
    switch (timeRange) {
      case 'day':
        return 'time';
      case 'week':
        return 'day';
      case 'month':
        return 'date';
      default:
        return 'time';
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

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
                {entry.name}: {entry.value.toLocaleString()}
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Active Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track user activity patterns over time
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            aria-label="time range"
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                borderRadius: '4px',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  }
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }
              }
            }}
          >
            <ToggleButton value="day" aria-label="day">
              Day
            </ToggleButton>
            <ToggleButton value="week" aria-label="week">
              Week
            </ToggleButton>
            <ToggleButton value="month" aria-label="month">
              Month
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Active Users Chart */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '100%',
              }}
            >
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getActiveUsersData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey={getXAxisKey()} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="Active Users"
                      stroke={theme.palette.primary.main}
                      fill={alpha(theme.palette.primary.main, 0.2)}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ActiveUsersChart;
