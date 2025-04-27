import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Button,
  Divider,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Favorite,
  DirectionsRun,
  WaterDrop,
  Bedtime,
  Restaurant,
  MonitorWeight,
  BarChart,
  TrendingUp,
  TrendingDown,
  FitnessCenter,
  LocalFireDepartment,
  Speed,
  Timeline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Sample data for health monitoring
const healthData = {
  vitals: {
    heartRate: {
      current: 72,
      min: 58,
      max: 142,
      unit: 'bpm',
      trend: 'stable',
      labels: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'],
      data: [68, 72, 110, 95, 75, 72, 70],
    },
    bloodPressure: {
      systolic: 118,
      diastolic: 75,
      unit: 'mmHg',
      trend: 'improving',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      systolicData: [120, 118, 122, 119, 121, 117, 118],
      diastolicData: [80, 78, 82, 79, 77, 75, 76],
    },
    oxygenLevel: {
      current: 98,
      min: 95,
      max: 99,
      unit: '%',
      trend: 'stable',
    },
    temperature: {
      current: 98.6,
      unit: '°F',
      trend: 'stable',
    },
  },
  activity: {
    steps: {
      today: 8742,
      goal: 10000,
      unit: 'steps',
      weekly: [6500, 7200, 8100, 9500, 7800, 5400, 8742],
    },
    calories: {
      burned: 1850,
      goal: 2200,
      unit: 'kcal',
      weekly: [1750, 1900, 2100, 2300, 1950, 1600, 1850],
    },
    distance: {
      today: 5.2,
      goal: 6,
      unit: 'km',
      weekly: [4.8, 5.1, 5.8, 6.2, 5.3, 4.1, 5.2],
    },
    activeMinutes: {
      today: 42,
      goal: 60,
      unit: 'min',
      weekly: [35, 45, 65, 70, 50, 30, 42],
    },
  },
  sleep: {
    lastNight: 7.2,
    goal: 8,
    unit: 'hours',
    quality: 'Good',
    stages: {
      deep: 2.1,
      light: 4.2,
      rem: 0.9,
    },
    weekly: [6.8, 7.5, 8.1, 7.2, 6.9, 8.3, 7.2],
  },
  nutrition: {
    calories: {
      consumed: 1950,
      goal: 2000,
      unit: 'kcal',
    },
    water: {
      consumed: 6,
      goal: 8,
      unit: 'glasses',
    },
    macros: {
      carbs: 45,
      protein: 30,
      fat: 25,
    },
  },
};

const HealthMonitoring = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Render stat card
  const renderStatCard = (title, value, unit, icon, color, progress = null, trend = null) => (
    <Paper
      component={motion.div}
      variants={itemVariants}
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha(color, 0.2)}`,
        background: alpha(color, 0.05),
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 10px 20px ${alpha(color, 0.2)}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: alpha(color, 0.2),
            color: color,
            width: 48,
            height: 48,
          }}
        >
          {icon}
        </Avatar>
        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: trend === 'improving' ? theme.palette.success.main :
                    trend === 'declining' ? theme.palette.error.main :
                    theme.palette.info.main,
            }}
          >
            {trend === 'improving' ? <TrendingUp fontSize="small" /> :
             trend === 'declining' ? <TrendingDown fontSize="small" /> : null}
          </Box>
        )}
      </Box>
      <Typography variant="h6" component="div" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: color, mb: 1 }}>
        {value} <Typography component="span" variant="body2">{unit}</Typography>
      </Typography>
      {progress !== null && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(color, 0.2),
              '& .MuiLinearProgress-bar': {
                bgcolor: color,
              },
            }}
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
            {progress}% of goal
          </Typography>
        </Box>
      )}
    </Paper>
  );

  // Render vitals tab
  const renderVitalsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Heart Rate',
          healthData.vitals.heartRate.current,
          healthData.vitals.heartRate.unit,
          <Favorite />,
          '#f44336',
          null,
          healthData.vitals.heartRate.trend
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Blood Pressure',
          `${healthData.vitals.bloodPressure.systolic}/${healthData.vitals.bloodPressure.diastolic}`,
          healthData.vitals.bloodPressure.unit,
          <Speed />,
          '#2196f3',
          null,
          healthData.vitals.bloodPressure.trend
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Oxygen Level',
          healthData.vitals.oxygenLevel.current,
          healthData.vitals.oxygenLevel.unit,
          <WaterDrop />,
          '#4caf50',
          null,
          healthData.vitals.oxygenLevel.trend
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Temperature',
          healthData.vitals.temperature.current,
          healthData.vitals.temperature.unit,
          <LocalFireDepartment />,
          '#ff9800',
          null,
          healthData.vitals.temperature.trend
        )}
      </Grid>
      <Grid item xs={12}>
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            p: 3,
            borderRadius: 3,
            height: '100%',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Heart Rate Trends</Typography>
            <Button variant="outlined" size="small" startIcon={<Timeline />}>
              View Details
            </Button>
          </Box>
          <Box sx={{ height: 300, p: 1 }}>
            {/* This would be a chart component in a real implementation */}
            <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
              color: theme.palette.text.secondary
            }}>
              <Typography>Heart Rate Chart Would Appear Here</Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  // Render activity tab
  const renderActivityTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Steps',
          healthData.activity.steps.today,
          healthData.activity.steps.unit,
          <DirectionsRun />,
          '#4caf50',
          Math.round((healthData.activity.steps.today / healthData.activity.steps.goal) * 100)
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Calories Burned',
          healthData.activity.calories.burned,
          healthData.activity.calories.unit,
          <LocalFireDepartment />,
          '#f44336',
          Math.round((healthData.activity.calories.burned / healthData.activity.calories.goal) * 100)
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Distance',
          healthData.activity.distance.today,
          healthData.activity.distance.unit,
          <Timeline />,
          '#2196f3',
          Math.round((healthData.activity.distance.today / healthData.activity.distance.goal) * 100)
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Active Minutes',
          healthData.activity.activeMinutes.today,
          healthData.activity.activeMinutes.unit,
          <FitnessCenter />,
          '#ff9800',
          Math.round((healthData.activity.activeMinutes.today / healthData.activity.activeMinutes.goal) * 100)
        )}
      </Grid>
      <Grid item xs={12}>
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            p: 3,
            borderRadius: 3,
            height: '100%',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Weekly Activity Summary</Typography>
            <Button variant="outlined" size="small" startIcon={<BarChart />}>
              View Details
            </Button>
          </Box>
          <Box sx={{ height: 300, p: 1 }}>
            {/* This would be a chart component in a real implementation */}
            <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
              color: theme.palette.text.secondary
            }}>
              <Typography>Activity Chart Would Appear Here</Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  // Render sleep tab
  const renderSleepTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Sleep Duration',
          healthData.sleep.lastNight,
          healthData.sleep.unit,
          <Bedtime />,
          '#9c27b0',
          Math.round((healthData.sleep.lastNight / healthData.sleep.goal) * 100)
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Deep Sleep',
          healthData.sleep.stages.deep,
          healthData.sleep.unit,
          <Bedtime />,
          '#673ab7',
          null
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Light Sleep',
          healthData.sleep.stages.light,
          healthData.sleep.unit,
          <Bedtime />,
          '#3f51b5',
          null
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'REM Sleep',
          healthData.sleep.stages.rem,
          healthData.sleep.unit,
          <Bedtime />,
          '#2196f3',
          null
        )}
      </Grid>
      <Grid item xs={12}>
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            p: 3,
            borderRadius: 3,
            height: '100%',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Sleep Patterns</Typography>
            <Button variant="outlined" size="small" startIcon={<Timeline />}>
              View Details
            </Button>
          </Box>
          <Box sx={{ height: 300, p: 1 }}>
            {/* This would be a chart component in a real implementation */}
            <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
              color: theme.palette.text.secondary
            }}>
              <Typography>Sleep Pattern Chart Would Appear Here</Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  // Render nutrition tab
  const renderNutritionTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Calories Consumed',
          healthData.nutrition.calories.consumed,
          healthData.nutrition.calories.unit,
          <Restaurant />,
          '#ff9800',
          Math.round((healthData.nutrition.calories.consumed / healthData.nutrition.calories.goal) * 100)
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Water Intake',
          healthData.nutrition.water.consumed,
          healthData.nutrition.water.unit,
          <WaterDrop />,
          '#2196f3',
          Math.round((healthData.nutrition.water.consumed / healthData.nutrition.water.goal) * 100)
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Carbohydrates',
          healthData.nutrition.macros.carbs,
          '%',
          <Restaurant />,
          '#4caf50',
          null
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderStatCard(
          'Protein',
          healthData.nutrition.macros.protein,
          '%',
          <Restaurant />,
          '#f44336',
          null
        )}
      </Grid>
      <Grid item xs={12}>
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            p: 3,
            borderRadius: 3,
            height: '100%',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Nutrition Breakdown</Typography>
            <Button variant="outlined" size="small" startIcon={<BarChart />}>
              View Details
            </Button>
          </Box>
          <Box sx={{ height: 300, p: 1 }}>
            {/* This would be a chart component in a real implementation */}
            <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
              color: theme.palette.text.secondary
            }}>
              <Typography>Nutrition Chart Would Appear Here</Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderVitalsTab();
      case 1:
        return renderActivityTab();
      case 2:
        return renderSleepTab();
      case 3:
        return renderNutritionTab();
      default:
        return renderVitalsTab();
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Health Monitoring
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Track your health metrics and monitor your progress over time
          </Typography>
        </motion.div>

        <Paper sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            aria-label="health monitoring tabs"
          >
            <Tab
              icon={<Favorite />}
              label="Vitals"
              iconPosition="start"
              sx={{ py: 2 }}
            />
            <Tab
              icon={<DirectionsRun />}
              label="Activity"
              iconPosition="start"
              sx={{ py: 2 }}
            />
            <Tab
              icon={<Bedtime />}
              label="Sleep"
              iconPosition="start"
              sx={{ py: 2 }}
            />
            <Tab
              icon={<Restaurant />}
              label="Nutrition"
              iconPosition="start"
              sx={{ py: 2 }}
            />
          </Tabs>
        </Paper>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {renderTabContent()}
        </motion.div>
      </Box>
    </Container>
  );
};

export default HealthMonitoring;
