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
  LinearProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { motion } from 'framer-motion';

const FeatureUsageTrends = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('month');

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

  // Mock data for feature usage trends
  const featureAdoptionData = {
    month: [
      { feature: 'Appointments', adoption: 92 },
      { feature: 'Medical Records', adoption: 85 },
      { feature: 'Messaging', adoption: 78 },
      { feature: 'AI Assistant', adoption: 65 },
      { feature: 'Prescriptions', adoption: 72 },
      { feature: 'Lab Results', adoption: 68 },
      { feature: 'Billing', adoption: 58 },
      { feature: 'Telemedicine', adoption: 62 },
    ],
    quarter: [
      { feature: 'Appointments', adoption: 90 },
      { feature: 'Medical Records', adoption: 82 },
      { feature: 'Messaging', adoption: 75 },
      { feature: 'AI Assistant', adoption: 60 },
      { feature: 'Prescriptions', adoption: 70 },
      { feature: 'Lab Results', adoption: 65 },
      { feature: 'Billing', adoption: 55 },
      { feature: 'Telemedicine', adoption: 58 },
    ],
    year: [
      { feature: 'Appointments', adoption: 88 },
      { feature: 'Medical Records', adoption: 80 },
      { feature: 'Messaging', adoption: 72 },
      { feature: 'AI Assistant', adoption: 55 },
      { feature: 'Prescriptions', adoption: 68 },
      { feature: 'Lab Results', adoption: 62 },
      { feature: 'Billing', adoption: 52 },
      { feature: 'Telemedicine', adoption: 54 },
    ],
  };

  const featureGrowthData = {
    month: [
      { date: 'Week 1', appointments: 92, records: 85, messaging: 78, ai: 65 },
      { date: 'Week 2', appointments: 93, records: 86, messaging: 79, ai: 68 },
      { date: 'Week 3', appointments: 94, records: 87, messaging: 81, ai: 72 },
      { date: 'Week 4', appointments: 95, records: 88, messaging: 82, ai: 75 },
    ],
    quarter: [
      { date: 'Jan', appointments: 88, records: 80, messaging: 72, ai: 55 },
      { date: 'Feb', appointments: 89, records: 81, messaging: 73, ai: 57 },
      { date: 'Mar', appointments: 90, records: 82, messaging: 75, ai: 60 },
      { date: 'Apr', appointments: 91, records: 83, messaging: 76, ai: 62 },
      { date: 'May', appointments: 93, records: 85, messaging: 78, ai: 65 },
      { date: 'Jun', appointments: 95, records: 88, messaging: 82, ai: 75 },
    ],
    year: [
      { date: 'Jan', appointments: 80, records: 72, messaging: 65, ai: 40 },
      { date: 'Feb', appointments: 82, records: 74, messaging: 67, ai: 42 },
      { date: 'Mar', appointments: 84, records: 76, messaging: 69, ai: 45 },
      { date: 'Apr', appointments: 86, records: 78, messaging: 71, ai: 48 },
      { date: 'May', appointments: 88, records: 80, messaging: 73, ai: 52 },
      { date: 'Jun', appointments: 90, records: 82, messaging: 75, ai: 55 },
      { date: 'Jul', appointments: 91, records: 83, messaging: 76, ai: 58 },
      { date: 'Aug', appointments: 92, records: 84, messaging: 77, ai: 60 },
      { date: 'Sep', appointments: 93, records: 85, messaging: 78, ai: 62 },
      { date: 'Oct', appointments: 94, records: 86, messaging: 79, ai: 65 },
      { date: 'Nov', appointments: 95, records: 87, messaging: 80, ai: 70 },
      { date: 'Dec', appointments: 96, records: 88, messaging: 82, ai: 75 },
    ],
  };

  // Feature usage frequency data
  const featureFrequencyData = [
    {
      feature: 'Appointments',
      daily: 35,
      weekly: 45,
      monthly: 20,
      color: theme.palette.primary.main,
    },
    {
      feature: 'Medical Records',
      daily: 25,
      weekly: 50,
      monthly: 25,
      color: theme.palette.info.main,
    },
    {
      feature: 'Messaging',
      daily: 60,
      weekly: 30,
      monthly: 10,
      color: theme.palette.success.main,
    },
    {
      feature: 'AI Assistant',
      daily: 40,
      weekly: 40,
      monthly: 20,
      color: theme.palette.warning.main,
    },
  ];

  // Get data based on selected options
  const getFeatureAdoptionData = () => {
    return featureAdoptionData[timeRange];
  };

  const getFeatureGrowthData = () => {
    return featureGrowthData[timeRange];
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
                {entry.name}: {entry.value}%
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
              Feature Usage Trends
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track feature adoption and usage patterns
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
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Feature Adoption Chart */}
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
                  Feature Adoption Rate
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
                  <BarChart
                    data={getFeatureAdoptionData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="feature" type="category" width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="adoption"
                      name="Adoption Rate"
                      fill={theme.palette.primary.main}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Feature Growth Chart */}
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
                  Feature Usage Growth
                </Typography>
                <Chip
                  label={`Last ${timeRange === 'month' ? '30 Days' : timeRange === 'quarter' ? '6 Months' : '12 Months'}`}
                  size="small"
                  color="info"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getFeatureGrowthData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[30, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="appointments"
                      name="Appointments"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="records"
                      name="Medical Records"
                      stroke={theme.palette.info.main}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="messaging"
                      name="Messaging"
                      stroke={theme.palette.success.main}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ai"
                      name="AI Assistant"
                      stroke={theme.palette.warning.main}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Feature Usage Frequency */}
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
                  Feature Usage Frequency
                </Typography>
                <Chip
                  label="Current"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <Grid container spacing={3}>
                {featureFrequencyData.map((feature, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {feature.feature}
                        </Typography>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: feature.color,
                          }}
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Daily
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {feature.daily}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={feature.daily}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(feature.color, 0.2),
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: feature.color,
                              borderRadius: 3,
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Weekly
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {feature.weekly}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={feature.weekly}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(feature.color, 0.2),
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: feature.color,
                              borderRadius: 3,
                            }
                          }}
                        />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Monthly
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {feature.monthly}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={feature.monthly}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(feature.color, 0.2),
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: feature.color,
                              borderRadius: 3,
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FeatureUsageTrends;
