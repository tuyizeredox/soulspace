import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  useTheme,
  alpha,
  Paper
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DoctorAnalytics = ({ doctors, stats }) => {
  const theme = useTheme();

  // Prepare chart data
  const departmentData = {
    labels: Object.keys(stats.departmentDistribution || {}),
    datasets: [
      {
        label: 'Doctors by Department',
        data: Object.values(stats.departmentDistribution || {}),
        backgroundColor: [
          alpha(theme.palette.primary.main, 0.8),
          alpha(theme.palette.secondary.main, 0.8),
          alpha(theme.palette.success.main, 0.8),
          alpha(theme.palette.warning.main, 0.8),
          alpha(theme.palette.error.main, 0.8),
          alpha(theme.palette.info.main, 0.8)
        ],
        borderColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main,
          theme.palette.info.main
        ],
        borderWidth: 2
      }
    ]
  };

  // Experience distribution
  const experienceRanges = {
    '0-2 years': 0,
    '3-5 years': 0,
    '6-10 years': 0,
    '11-15 years': 0,
    '16+ years': 0
  };

  doctors.forEach(doctor => {
    const exp = doctor.experience || 0;
    if (exp <= 2) experienceRanges['0-2 years']++;
    else if (exp <= 5) experienceRanges['3-5 years']++;
    else if (exp <= 10) experienceRanges['6-10 years']++;
    else if (exp <= 15) experienceRanges['11-15 years']++;
    else experienceRanges['16+ years']++;
  });

  const experienceData = {
    labels: Object.keys(experienceRanges),
    datasets: [
      {
        label: 'Experience Distribution',
        data: Object.values(experienceRanges),
        backgroundColor: alpha(theme.palette.primary.main, 0.6),
        borderColor: theme.palette.primary.main,
        borderWidth: 2
      }
    ]
  };

  // Specialization distribution
  const specializationCount = {};
  doctors.forEach(doctor => {
    const spec = doctor.specialization || 'General';
    specializationCount[spec] = (specializationCount[spec] || 0) + 1;
  });

  const specializationData = {
    labels: Object.keys(specializationCount),
    datasets: [
      {
        data: Object.values(specializationCount),
        backgroundColor: [
          alpha(theme.palette.primary.main, 0.8),
          alpha(theme.palette.secondary.main, 0.8),
          alpha(theme.palette.success.main, 0.8),
          alpha(theme.palette.warning.main, 0.8),
          alpha(theme.palette.error.main, 0.8),
          alpha(theme.palette.info.main, 0.8),
          alpha(theme.palette.purple?.main || '#9c27b0', 0.8),
          alpha(theme.palette.orange?.main || '#ff9800', 0.8)
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Doctor Analytics Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Comprehensive insights into your hospital's medical staff
        </Typography>

        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12}>
            <motion.div variants={itemVariants}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      borderRadius: 2
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: 'white'
                          }}
                        >
                          <PeopleIcon />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight="bold" color="primary">
                            {stats.totalDoctors}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Doctors
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                      borderRadius: 2
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                            color: 'white'
                          }}
                        >
                          <TrendingUpIcon />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight="bold" color="success.main">
                            {stats.activeDoctors}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Active Doctors
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      borderRadius: 2
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                            color: 'white'
                          }}
                        >
                          <StarIcon />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight="bold" color="info.main">
                            {stats.averageExperience}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Avg. Experience
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                      borderRadius: 2
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                            color: 'white'
                          }}
                        >
                          <ScheduleIcon />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {Object.keys(stats.departmentDistribution || {}).length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Departments
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card sx={{ borderRadius: 2, height: 400 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Doctors by Department
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar data={departmentData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card sx={{ borderRadius: 2, height: 400 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Experience Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar data={experienceData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card sx={{ borderRadius: 2, height: 400 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Specialization Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Doughnut data={specializationData} options={doughnutOptions} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card sx={{ borderRadius: 2, height: 400 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Top Specializations
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {Object.entries(specializationCount)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 6)
                      .map(([spec, count], index) => (
                        <Paper
                          key={spec}
                          sx={{
                            p: 2,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight="bold">
                              {spec}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="h6" color="primary" fontWeight="bold">
                                {count}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                doctor{count !== 1 ? 's' : ''}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Paper>
                      ))
                    }
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default DoctorAnalytics;