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
  AreaChart,
  Area,
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

const GrowthTrendsChart = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('year');
  const [dataType, setDataType] = useState('users');

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

  // Mock data for growth trends
  const userGrowthData = {
    month: [
      { date: 'Jan 1', total: 5000, new: 250 },
      { date: 'Jan 8', total: 5250, new: 280 },
      { date: 'Jan 15', total: 5530, new: 310 },
      { date: 'Jan 22', total: 5840, new: 340 },
      { date: 'Jan 29', total: 6180, new: 370 },
      { date: 'Feb 5', total: 6550, new: 400 },
      { date: 'Feb 12', total: 6950, new: 430 },
      { date: 'Feb 19', total: 7380, new: 460 },
      { date: 'Feb 26', total: 7840, new: 490 },
      { date: 'Mar 5', total: 8330, new: 520 },
      { date: 'Mar 12', total: 8850, new: 550 },
      { date: 'Mar 19', total: 9400, new: 580 },
    ],
    quarter: [
      { date: 'Jan', total: 5000, new: 1200 },
      { date: 'Feb', total: 6200, new: 1500 },
      { date: 'Mar', total: 7700, new: 1800 },
      { date: 'Apr', total: 9500, new: 2100 },
      { date: 'May', total: 11600, new: 2400 },
      { date: 'Jun', total: 14000, new: 2700 },
    ],
    year: [
      { date: 'Jan', total: 5000, new: 1200 },
      { date: 'Feb', total: 6200, new: 1500 },
      { date: 'Mar', total: 7700, new: 1800 },
      { date: 'Apr', total: 9500, new: 2100 },
      { date: 'May', total: 11600, new: 2400 },
      { date: 'Jun', total: 14000, new: 2700 },
      { date: 'Jul', total: 16700, new: 3000 },
      { date: 'Aug', total: 19700, new: 3300 },
      { date: 'Sep', total: 23000, new: 3600 },
      { date: 'Oct', total: 26600, new: 3900 },
      { date: 'Nov', total: 30500, new: 4200 },
      { date: 'Dec', total: 34700, new: 4500 },
    ],
  };

  const hospitalGrowthData = {
    month: [
      { date: 'Jan 1', total: 42, new: 1 },
      { date: 'Jan 8', total: 43, new: 1 },
      { date: 'Jan 15', total: 44, new: 1 },
      { date: 'Jan 22', total: 45, new: 1 },
      { date: 'Jan 29', total: 46, new: 1 },
      { date: 'Feb 5', total: 47, new: 2 },
      { date: 'Feb 12', total: 49, new: 2 },
      { date: 'Feb 19', total: 51, new: 2 },
      { date: 'Feb 26', total: 53, new: 2 },
      { date: 'Mar 5', total: 55, new: 3 },
      { date: 'Mar 12', total: 58, new: 3 },
      { date: 'Mar 19', total: 61, new: 3 },
    ],
    quarter: [
      { date: 'Jan', total: 42, new: 4 },
      { date: 'Feb', total: 46, new: 7 },
      { date: 'Mar', total: 53, new: 8 },
      { date: 'Apr', total: 61, new: 9 },
      { date: 'May', total: 70, new: 10 },
      { date: 'Jun', total: 80, new: 12 },
    ],
    year: [
      { date: 'Jan', total: 42, new: 4 },
      { date: 'Feb', total: 46, new: 7 },
      { date: 'Mar', total: 53, new: 8 },
      { date: 'Apr', total: 61, new: 9 },
      { date: 'May', total: 70, new: 10 },
      { date: 'Jun', total: 80, new: 12 },
      { date: 'Jul', total: 92, new: 14 },
      { date: 'Aug', total: 106, new: 16 },
      { date: 'Sep', total: 122, new: 18 },
      { date: 'Oct', total: 140, new: 20 },
      { date: 'Nov', total: 160, new: 22 },
      { date: 'Dec', total: 182, new: 24 },
    ],
  };

  // Get data based on selected options
  const getChartData = () => {
    if (dataType === 'users') {
      return userGrowthData[timeRange];
    } else {
      return hospitalGrowthData[timeRange];
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (_, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  // Handle data type change
  const handleDataTypeChange = (_, newDataType) => {
    if (newDataType !== null) {
      setDataType(newDataType);
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
              Growth Trends
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track growth patterns over time
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ToggleButtonGroup
              value={dataType}
              exclusive
              onChange={handleDataTypeChange}
              aria-label="data type"
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
              <ToggleButton value="users" aria-label="users">
                Users
              </ToggleButton>
              <ToggleButton value="hospitals" aria-label="hospitals">
                Hospitals
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
          {/* Total Growth Chart */}
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
                  Total {dataType === 'users' ? 'Users' : 'Hospitals'}
                </Typography>
                <Chip
                  label={`Last ${timeRange === 'month' ? '30 Days' : timeRange === 'quarter' ? '6 Months' : '12 Months'}`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getChartData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name={`Total ${dataType === 'users' ? 'Users' : 'Hospitals'}`}
                      stroke={theme.palette.primary.main}
                      fill={alpha(theme.palette.primary.main, 0.2)}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* New Growth Chart */}
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
                  New {dataType === 'users' ? 'Users' : 'Hospitals'}
                </Typography>
                <Chip
                  label={`Last ${timeRange === 'month' ? '30 Days' : timeRange === 'quarter' ? '6 Months' : '12 Months'}`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getChartData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="new"
                      name={`New ${dataType === 'users' ? 'Users' : 'Hospitals'}`}
                      fill={theme.palette.success.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Growth Insights */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Growth Insights
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, borderLeft: `4px solid ${theme.palette.primary.main}`, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '0 4px 4px 0' }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Consistent Growth
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dataType === 'users' ? 'User' : 'Hospital'} growth has been consistently positive, with an average monthly increase of {dataType === 'users' ? '12%' : '8%'} over the past year.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, borderLeft: `4px solid ${theme.palette.success.main}`, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: '0 4px 4px 0' }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Seasonal Patterns
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Growth tends to accelerate during Q2 and Q4, with peaks in June and December, suggesting seasonal registration patterns.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, borderLeft: `4px solid ${theme.palette.info.main}`, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: '0 4px 4px 0' }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Projected Growth
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Based on current trends, we project reaching {dataType === 'users' ? '50,000 users' : '250 hospitals'} by the end of the year, representing a {dataType === 'users' ? '44%' : '37%'} annual growth rate.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GrowthTrendsChart;
