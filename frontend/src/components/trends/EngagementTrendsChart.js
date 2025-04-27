import React, { useState } from 'react';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';

const EngagementTrendsChart = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('month');
  const [userType, setUserType] = useState('all');

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

  // Mock data for engagement trends
  const sessionDurationData = {
    all: {
      month: [
        { date: 'Week 1', duration: 12.5 },
        { date: 'Week 2', duration: 13.2 },
        { date: 'Week 3', duration: 14.8 },
        { date: 'Week 4', duration: 15.5 },
      ],
      quarter: [
        { date: 'Jan', duration: 11.8 },
        { date: 'Feb', duration: 12.5 },
        { date: 'Mar', duration: 13.2 },
        { date: 'Apr', duration: 14.8 },
        { date: 'May', duration: 15.5 },
        { date: 'Jun', duration: 16.2 },
      ],
      year: [
        { date: 'Jan', duration: 10.5 },
        { date: 'Feb', duration: 11.2 },
        { date: 'Mar', duration: 11.8 },
        { date: 'Apr', duration: 12.5 },
        { date: 'May', duration: 13.2 },
        { date: 'Jun', duration: 14.8 },
        { date: 'Jul', duration: 15.5 },
        { date: 'Aug', duration: 16.2 },
        { date: 'Sep', duration: 16.8 },
        { date: 'Oct', duration: 17.5 },
        { date: 'Nov', duration: 18.2 },
        { date: 'Dec', duration: 18.8 },
      ],
    },
    patients: {
      month: [
        { date: 'Week 1', duration: 10.2 },
        { date: 'Week 2', duration: 10.8 },
        { date: 'Week 3', duration: 11.5 },
        { date: 'Week 4', duration: 12.2 },
      ],
      quarter: [
        { date: 'Jan', duration: 9.5 },
        { date: 'Feb', duration: 10.2 },
        { date: 'Mar', duration: 10.8 },
        { date: 'Apr', duration: 11.5 },
        { date: 'May', duration: 12.2 },
        { date: 'Jun', duration: 12.8 },
      ],
      year: [
        { date: 'Jan', duration: 8.2 },
        { date: 'Feb', duration: 8.8 },
        { date: 'Mar', duration: 9.5 },
        { date: 'Apr', duration: 10.2 },
        { date: 'May', duration: 10.8 },
        { date: 'Jun', duration: 11.5 },
        { date: 'Jul', duration: 12.2 },
        { date: 'Aug', duration: 12.8 },
        { date: 'Sep', duration: 13.5 },
        { date: 'Oct', duration: 14.2 },
        { date: 'Nov', duration: 14.8 },
        { date: 'Dec', duration: 15.5 },
      ],
    },
    doctors: {
      month: [
        { date: 'Week 1', duration: 18.5 },
        { date: 'Week 2', duration: 19.2 },
        { date: 'Week 3', duration: 20.8 },
        { date: 'Week 4', duration: 21.5 },
      ],
      quarter: [
        { date: 'Jan', duration: 17.8 },
        { date: 'Feb', duration: 18.5 },
        { date: 'Mar', duration: 19.2 },
        { date: 'Apr', duration: 20.8 },
        { date: 'May', duration: 21.5 },
        { date: 'Jun', duration: 22.2 },
      ],
      year: [
        { date: 'Jan', duration: 16.5 },
        { date: 'Feb', duration: 17.2 },
        { date: 'Mar', duration: 17.8 },
        { date: 'Apr', duration: 18.5 },
        { date: 'May', duration: 19.2 },
        { date: 'Jun', duration: 20.8 },
        { date: 'Jul', duration: 21.5 },
        { date: 'Aug', duration: 22.2 },
        { date: 'Sep', duration: 22.8 },
        { date: 'Oct', duration: 23.5 },
        { date: 'Nov', duration: 24.2 },
        { date: 'Dec', duration: 24.8 },
      ],
    },
  };

  const featureUsageData = {
    all: {
      month: [
        { feature: 'Appointments', usage: 42 },
        { feature: 'Medical Records', usage: 28 },
        { feature: 'Messaging', usage: 18 },
        { feature: 'AI Assistant', usage: 12 },
      ],
      quarter: [
        { feature: 'Appointments', usage: 40 },
        { feature: 'Medical Records', usage: 25 },
        { feature: 'Messaging', usage: 20 },
        { feature: 'AI Assistant', usage: 15 },
      ],
      year: [
        { feature: 'Appointments', usage: 38 },
        { feature: 'Medical Records', usage: 22 },
        { feature: 'Messaging', usage: 22 },
        { feature: 'AI Assistant', usage: 18 },
      ],
    },
    patients: {
      month: [
        { feature: 'Appointments', usage: 45 },
        { feature: 'Medical Records', usage: 25 },
        { feature: 'Messaging', usage: 15 },
        { feature: 'AI Assistant', usage: 15 },
      ],
      quarter: [
        { feature: 'Appointments', usage: 42 },
        { feature: 'Medical Records', usage: 22 },
        { feature: 'Messaging', usage: 18 },
        { feature: 'AI Assistant', usage: 18 },
      ],
      year: [
        { feature: 'Appointments', usage: 40 },
        { feature: 'Medical Records', usage: 20 },
        { feature: 'Messaging', usage: 20 },
        { feature: 'AI Assistant', usage: 20 },
      ],
    },
    doctors: {
      month: [
        { feature: 'Appointments', usage: 38 },
        { feature: 'Medical Records', usage: 32 },
        { feature: 'Messaging', usage: 22 },
        { feature: 'AI Assistant', usage: 8 },
      ],
      quarter: [
        { feature: 'Appointments', usage: 35 },
        { feature: 'Medical Records', usage: 30 },
        { feature: 'Messaging', usage: 25 },
        { feature: 'AI Assistant', usage: 10 },
      ],
      year: [
        { feature: 'Appointments', usage: 32 },
        { feature: 'Medical Records', usage: 28 },
        { feature: 'Messaging', usage: 28 },
        { feature: 'AI Assistant', usage: 12 },
      ],
    },
  };

  const retentionRateData = {
    all: {
      month: [
        { date: 'Week 1', rate: 92 },
        { date: 'Week 2', rate: 91 },
        { date: 'Week 3', rate: 93 },
        { date: 'Week 4', rate: 94 },
      ],
      quarter: [
        { date: 'Jan', rate: 90 },
        { date: 'Feb', rate: 91 },
        { date: 'Mar', rate: 92 },
        { date: 'Apr', rate: 93 },
        { date: 'May', rate: 94 },
        { date: 'Jun', rate: 95 },
      ],
      year: [
        { date: 'Jan', rate: 85 },
        { date: 'Feb', rate: 86 },
        { date: 'Mar', rate: 87 },
        { date: 'Apr', rate: 88 },
        { date: 'May', rate: 89 },
        { date: 'Jun', rate: 90 },
        { date: 'Jul', rate: 91 },
        { date: 'Aug', rate: 92 },
        { date: 'Sep', rate: 93 },
        { date: 'Oct', rate: 94 },
        { date: 'Nov', rate: 95 },
        { date: 'Dec', rate: 96 },
      ],
    },
    patients: {
      month: [
        { date: 'Week 1', rate: 90 },
        { date: 'Week 2', rate: 89 },
        { date: 'Week 3', rate: 91 },
        { date: 'Week 4', rate: 92 },
      ],
      quarter: [
        { date: 'Jan', rate: 88 },
        { date: 'Feb', rate: 89 },
        { date: 'Mar', rate: 90 },
        { date: 'Apr', rate: 91 },
        { date: 'May', rate: 92 },
        { date: 'Jun', rate: 93 },
      ],
      year: [
        { date: 'Jan', rate: 82 },
        { date: 'Feb', rate: 83 },
        { date: 'Mar', rate: 84 },
        { date: 'Apr', rate: 85 },
        { date: 'May', rate: 86 },
        { date: 'Jun', rate: 87 },
        { date: 'Jul', rate: 88 },
        { date: 'Aug', rate: 89 },
        { date: 'Sep', rate: 90 },
        { date: 'Oct', rate: 91 },
        { date: 'Nov', rate: 92 },
        { date: 'Dec', rate: 93 },
      ],
    },
    doctors: {
      month: [
        { date: 'Week 1', rate: 95 },
        { date: 'Week 2', rate: 94 },
        { date: 'Week 3', rate: 96 },
        { date: 'Week 4', rate: 97 },
      ],
      quarter: [
        { date: 'Jan', rate: 93 },
        { date: 'Feb', rate: 94 },
        { date: 'Mar', rate: 95 },
        { date: 'Apr', rate: 96 },
        { date: 'May', rate: 97 },
        { date: 'Jun', rate: 98 },
      ],
      year: [
        { date: 'Jan', rate: 90 },
        { date: 'Feb', rate: 91 },
        { date: 'Mar', rate: 92 },
        { date: 'Apr', rate: 93 },
        { date: 'May', rate: 94 },
        { date: 'Jun', rate: 95 },
        { date: 'Jul', rate: 96 },
        { date: 'Aug', rate: 97 },
        { date: 'Sep', rate: 98 },
        { date: 'Oct', rate: 98 },
        { date: 'Nov', rate: 99 },
        { date: 'Dec', rate: 99 },
      ],
    },
  };

  // Get data based on selected options
  const getSessionDurationData = () => {
    return sessionDurationData[userType][timeRange];
  };

  const getFeatureUsageData = () => {
    return featureUsageData[userType][timeRange];
  };

  const getRetentionRateData = () => {
    return retentionRateData[userType][timeRange];
  };

  // Handle time range change
  const handleTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  // Handle user type change
  const handleUserTypeChange = (event, newUserType) => {
    if (newUserType !== null) {
      setUserType(newUserType);
    }
  };

  // Colors for pie charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
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
          <Typography variant="subtitle2">{label || payload[0].name}</Typography>
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
                {entry.name}: {entry.value} {entry.name === 'duration' ? 'minutes' : entry.name === 'rate' ? '%' : '%'}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
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
              Engagement Trends
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track user engagement metrics over time
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ToggleButtonGroup
              value={userType}
              exclusive
              onChange={handleUserTypeChange}
              aria-label="user type"
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
              <ToggleButton value="all" aria-label="all">
                All Users
              </ToggleButton>
              <ToggleButton value="patients" aria-label="patients">
                Patients
              </ToggleButton>
              <ToggleButton value="doctors" aria-label="doctors">
                Doctors
              </ToggleButton>
            </ToggleButtonGroup>

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
              <ToggleButton value="month" aria-label="month">
                Month
              </ToggleButton>
              <ToggleButton value="quarter" aria-label="quarter">
                Quarter
              </ToggleButton>
              <ToggleButton value="year" aria-label="year">
                Year
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Session Duration Chart */}
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
                  Average Session Duration
                </Typography>
                <Chip
                  label={`Last ${timeRange === 'month' ? '30 Days' : timeRange === 'quarter' ? '6 Months' : '12 Months'}`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getSessionDurationData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="duration"
                      name="Duration"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Feature Usage Chart */}
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
                  Feature Usage Distribution
                </Typography>
                <Chip
                  label={`Last ${timeRange === 'month' ? '30 Days' : timeRange === 'quarter' ? '6 Months' : '12 Months'}`}
                  size="small"
                  color="info"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getFeatureUsageData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="usage"
                      nameKey="feature"
                    >
                      {getFeatureUsageData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Retention Rate Chart */}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  User Retention Rate
                </Typography>
                <Chip
                  label={`Last ${timeRange === 'month' ? '30 Days' : timeRange === 'quarter' ? '6 Months' : '12 Months'}`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getRetentionRateData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      name="Retention Rate"
                      stroke={theme.palette.success.main}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
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

export default EngagementTrendsChart;
