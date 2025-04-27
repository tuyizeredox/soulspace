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
  Paper,
  Button,
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
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const PredictiveAnalytics = () => {
  const theme = useTheme();
  const [predictionType, setPredictionType] = useState('users');

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

  // Mock data for predictive analytics
  const userPredictionData = [
    // Historical data
    { month: 'Jan', users: 5000, predicted: false },
    { month: 'Feb', users: 6200, predicted: false },
    { month: 'Mar', users: 7700, predicted: false },
    { month: 'Apr', users: 9500, predicted: false },
    { month: 'May', users: 11600, predicted: false },
    { month: 'Jun', users: 14000, predicted: false },
    // Predicted data
    { month: 'Jul', users: 16700, predicted: true },
    { month: 'Aug', users: 19700, predicted: true },
    { month: 'Sep', users: 23000, predicted: true },
    { month: 'Oct', users: 26600, predicted: true },
    { month: 'Nov', users: 30500, predicted: true },
    { month: 'Dec', users: 34700, predicted: true },
  ];

  const hospitalPredictionData = [
    // Historical data
    { month: 'Jan', hospitals: 42, predicted: false },
    { month: 'Feb', hospitals: 46, predicted: false },
    { month: 'Mar', hospitals: 53, predicted: false },
    { month: 'Apr', hospitals: 61, predicted: false },
    { month: 'May', hospitals: 70, predicted: false },
    { month: 'Jun', hospitals: 80, predicted: false },
    // Predicted data
    { month: 'Jul', hospitals: 92, predicted: true },
    { month: 'Aug', hospitals: 106, predicted: true },
    { month: 'Sep', hospitals: 122, predicted: true },
    { month: 'Oct', hospitals: 140, predicted: true },
    { month: 'Nov', hospitals: 160, predicted: true },
    { month: 'Dec', hospitals: 182, predicted: true },
  ];

  const revenuePredictionData = [
    // Historical data
    { month: 'Jan', revenue: 120000, predicted: false },
    { month: 'Feb', revenue: 145000, predicted: false },
    { month: 'Mar', revenue: 175000, predicted: false },
    { month: 'Apr', revenue: 210000, predicted: false },
    { month: 'May', revenue: 250000, predicted: false },
    { month: 'Jun', revenue: 295000, predicted: false },
    // Predicted data
    { month: 'Jul', revenue: 345000, predicted: true },
    { month: 'Aug', revenue: 400000, predicted: true },
    { month: 'Sep', revenue: 460000, predicted: true },
    { month: 'Oct', revenue: 525000, predicted: true },
    { month: 'Nov', revenue: 595000, predicted: true },
    { month: 'Dec', revenue: 670000, predicted: true },
  ];

  // Prediction insights
  const predictionInsights = {
    users: [
      {
        title: 'Growth Acceleration',
        description: 'User growth is predicted to accelerate in Q3 and Q4, with a projected 148% annual growth rate.',
        trend: 'up',
      },
      {
        title: 'Seasonal Patterns',
        description: 'Expect higher user acquisition during September-November due to healthcare enrollment periods.',
        trend: 'info',
      },
      {
        title: 'Retention Impact',
        description: 'Improved retention rates are expected to contribute 35% of the total user growth.',
        trend: 'up',
      },
    ],
    hospitals: [
      {
        title: 'Steady Expansion',
        description: 'Hospital partnerships are projected to more than double by year-end, reaching 182 total facilities.',
        trend: 'up',
      },
      {
        title: 'Regional Concentration',
        description: 'Growth is expected to concentrate in urban areas, with 65% of new hospitals in metropolitan regions.',
        trend: 'info',
      },
      {
        title: 'Specialty Focus',
        description: 'Specialty clinics are predicted to represent 40% of new hospital partnerships in Q3-Q4.',
        trend: 'up',
      },
    ],
    revenue: [
      {
        title: 'Revenue Surge',
        description: 'Revenue is projected to grow by 127% annually, reaching $670K monthly by December.',
        trend: 'up',
      },
      {
        title: 'Diversification',
        description: 'Revenue streams are expected to diversify, with subscription services growing to 45% of total revenue.',
        trend: 'up',
      },
      {
        title: 'Seasonal Fluctuations',
        description: 'Expect temporary revenue plateaus during August due to reduced healthcare activity.',
        trend: 'down',
      },
    ],
  };

  // Get data based on selected prediction type
  const getPredictionData = () => {
    switch (predictionType) {
      case 'users':
        return userPredictionData;
      case 'hospitals':
        return hospitalPredictionData;
      case 'revenue':
        return revenuePredictionData;
      default:
        return userPredictionData;
    }
  };

  // Get data key based on selected prediction type
  const getDataKey = () => {
    return predictionType;
  };

  // Handle prediction type change
  const handlePredictionTypeChange = (event, newPredictionType) => {
    if (newPredictionType !== null) {
      setPredictionType(newPredictionType);
    }
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: theme.palette.success.main }} />;
      case 'down':
        return <TrendingDownIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <InfoIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isPredicted = payload[0].payload.predicted;
      
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
                {entry.name}: {predictionType === 'revenue' ? `$${entry.value.toLocaleString()}` : entry.value.toLocaleString()}
                {isPredicted && (
                  <Chip
                    label="Predicted"
                    size="small"
                    color="warning"
                    sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                  />
                )}
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
              Predictive Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered predictions for future growth and trends
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={predictionType}
            exclusive
            onChange={handlePredictionTypeChange}
            aria-label="prediction type"
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
              User Growth
            </ToggleButton>
            <ToggleButton value="hospitals" aria-label="hospitals">
              Hospital Growth
            </ToggleButton>
            <ToggleButton value="revenue" aria-label="revenue">
              Revenue Growth
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Prediction Chart */}
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
                  {predictionType === 'users' ? 'User Growth Prediction' : 
                   predictionType === 'hospitals' ? 'Hospital Growth Prediction' : 
                   'Revenue Growth Prediction'}
                </Typography>
                <Chip
                  label="6-Month Forecast"
                  size="small"
                  color="warning"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getPredictionData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <ReferenceLine x="Jun" stroke={theme.palette.warning.main} strokeDasharray="3 3" label={{ value: 'Current', position: 'top', fill: theme.palette.warning.main, fontSize: 12 }} />
                    <defs>
                      <linearGradient id="colorData" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey={getDataKey()}
                      name={predictionType === 'users' ? 'Users' : 
                            predictionType === 'hospitals' ? 'Hospitals' : 
                            'Revenue'}
                      stroke={theme.palette.primary.main}
                      fillOpacity={1}
                      fill="url(#colorData)"
                      activeDot={{ r: 8 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Prediction Insights */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Prediction Insights
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {predictionInsights[predictionType].map((insight, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(
                          insight.trend === 'up' ? theme.palette.success.main : 
                          insight.trend === 'down' ? theme.palette.error.main : 
                          theme.palette.info.main,
                          0.05
                        ),
                        border: `1px solid ${alpha(
                          insight.trend === 'up' ? theme.palette.success.main : 
                          insight.trend === 'down' ? theme.palette.error.main : 
                          theme.palette.info.main,
                          0.2
                        )}`,
                        height: '100%',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getTrendIcon(insight.trend)}
                        <Typography variant="subtitle2" fontWeight={600} sx={{ ml: 1 }}>
                          {insight.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {insight.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Prediction Actions */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Take action based on these predictions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Download Report
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Set Growth Targets
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PredictiveAnalytics;
