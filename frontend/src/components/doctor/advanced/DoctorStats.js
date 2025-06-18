import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha,
  Skeleton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  LocalHospital as LocalHospitalIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DoctorStats = ({ data, loading }) => {
  const theme = useTheme();
  const isXSmall = useMediaQuery('(max-width:480px)'); // Extra small phones
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Small phones
  const isTablet = useMediaQuery(theme.breakpoints.down('md')); // Tablets
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg')); // Small laptops

  // Mock data for charts
  const appointmentTrends = [
    { month: 'Jan', appointments: 45, completed: 42 },
    { month: 'Feb', appointments: 52, completed: 48 },
    { month: 'Mar', appointments: 48, completed: 45 },
    { month: 'Apr', appointments: 61, completed: 58 },
    { month: 'May', appointments: 55, completed: 52 },
    { month: 'Jun', appointments: 67, completed: 63 }
  ];

  const patientDemographics = [
    { name: 'Adults (18-65)', value: 65, color: theme.palette.primary.main },
    { name: 'Seniors (65+)', value: 25, color: theme.palette.secondary.main },
    { name: 'Children (<18)', value: 10, color: theme.palette.success.main }
  ];

  const appointmentTypes = [
    { name: 'Consultation', value: 40, color: theme.palette.info.main },
    { name: 'Follow-up', value: 30, color: theme.palette.warning.main },
    { name: 'Emergency', value: 20, color: theme.palette.error.main },
    { name: 'Routine', value: 10, color: theme.palette.success.main }
  ];

  // Stats cards configuration
  const statsCards = [
    {
      title: 'Total Patients',
      value: data?.stats?.totalPatients || 32,
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      trend: '+12%',
      subtitle: 'Active patients under care'
    },
    {
      title: 'Total Appointments',
      value: data?.stats?.totalAppointments || 45,
      icon: <EventIcon />,
      color: theme.palette.secondary.main,
      trend: '+8%',
      subtitle: 'This month'
    },
    {
      title: 'Completed',
      value: data?.stats?.completedAppointments || 38,
      icon: <CheckCircleIcon />,
      color: theme.palette.success.main,
      trend: '+15%',
      subtitle: 'Successfully completed'
    },
    {
      title: 'Pending',
      value: data?.stats?.pendingAppointments || 5,
      icon: <ScheduleIcon />,
      color: theme.palette.warning.main,
      trend: '-3%',
      subtitle: 'Awaiting confirmation'
    },
    {
      title: 'Average Rating',
      value: data?.stats?.averageRating || 4.8,
      icon: <StarIcon />,
      color: theme.palette.info.main,
      trend: '+0.2',
      subtitle: 'Patient satisfaction',
      isRating: true
    },
    {
      title: 'Cancelled',
      value: data?.stats?.cancelledAppointments || 2,
      icon: <AssignmentIcon />,
      color: theme.palette.error.main,
      trend: '-1%',
      subtitle: 'This month'
    }
  ];

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

  if (loading) {
    return (
      <Box sx={{ p: isXSmall ? 0.5 : isMobile ? 1 : isTablet ? 2 : 3 }}>
        <Grid container spacing={isXSmall ? 0.5 : isMobile ? 1 : isTablet ? 2 : 3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton 
                variant="rectangular" 
                height={isXSmall ? 80 : isMobile ? 100 : 120} 
                sx={{ 
                  borderRadius: isXSmall ? 1 : 2,
                  mx: isXSmall ? 0.5 : 0
                }} 
              />
            </Grid>
          ))}
          <Grid item xs={12} md={8}>
            <Skeleton 
              variant="rectangular" 
              height={isXSmall ? 200 : isMobile ? 250 : 300} 
              sx={{ 
                borderRadius: isXSmall ? 1 : 2,
                mx: isXSmall ? 0.5 : 0
              }} 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton 
              variant="rectangular" 
              height={isXSmall ? 200 : isMobile ? 250 : 300} 
              sx={{ 
                borderRadius: isXSmall ? 1 : 2,
                mx: isXSmall ? 0.5 : 0
              }} 
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ p: isXSmall ? 0.5 : isMobile ? 1 : isTablet ? 2 : 3 }}>
        {/* Stats Cards */}
        <Grid container spacing={isXSmall ? 0.5 : isMobile ? 1 : isTablet ? 2 : 3} sx={{ mb: isXSmall ? 1 : isMobile ? 2 : 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div variants={itemVariants}>
                <Card
                  sx={{
                    borderRadius: isXSmall ? 1 : isMobile ? 2 : 3,
                    transition: 'all 0.3s ease',
                    mx: isXSmall ? 0.5 : 0,
                    boxShadow: isXSmall ? 1 : 2,
                    '&:hover': {
                      transform: isMobile ? 'none' : 'translateY(-4px)',
                      boxShadow: isXSmall ? 2 : isMobile ? theme.shadows[2] : theme.shadows[8]
                    }
                  }}
                >
                  <CardContent sx={{ 
                    p: isXSmall ? 1.5 : isMobile ? 2 : isTablet ? 2.5 : 3,
                    '&:last-child': { pb: isXSmall ? 1.5 : isMobile ? 2 : isTablet ? 2.5 : 3 }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      mb: isXSmall ? 1 : isMobile ? 1.5 : 2,
                      flexDirection: isMobile ? 'column' : 'row',
                      textAlign: isMobile ? 'center' : 'left'
                    }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(stat.color, 0.1),
                          color: stat.color,
                          width: isXSmall ? 40 : isMobile ? 48 : 56,
                          height: isXSmall ? 40 : isMobile ? 48 : 56,
                          mb: isMobile ? 1 : 0
                        }}
                      >
                        {React.cloneElement(stat.icon, {
                          sx: { fontSize: isXSmall ? '1rem' : isMobile ? '1.25rem' : '1.5rem' }
                        })}
                      </Avatar>
                      <Box sx={{ textAlign: isMobile ? 'center' : 'right' }}>
                        <Typography
                          variant={isXSmall ? "h6" : isMobile ? "h5" : "h4"}
                          fontWeight={700}
                          color={stat.color}
                          sx={{ fontSize: isXSmall ? '1.25rem' : isMobile ? '1.5rem' : '2.125rem' }}
                        >
                          {stat.isRating ? stat.value.toFixed(1) : stat.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={stat.trend.startsWith('+') ? 'success.main' : 'error.main'}
                          fontWeight={500}
                          sx={{ fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem' }}
                        >
                          {stat.trend}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography 
                      variant={isXSmall ? "body1" : isMobile ? "subtitle1" : "h6"} 
                      fontWeight={600} 
                      gutterBottom
                      sx={{ 
                        textAlign: isMobile ? 'center' : 'left',
                        fontSize: isXSmall ? '0.875rem' : isMobile ? '1rem' : '1.25rem'
                      }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        textAlign: isMobile ? 'center' : 'left',
                        fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem'
                      }}
                    >
                      {stat.subtitle}
                    </Typography>
                    {stat.isRating && (
                      <LinearProgress
                        variant="determinate"
                        value={(stat.value / 5) * 100}
                        sx={{
                          mt: 1,
                          height: isXSmall ? 3 : isMobile ? 4 : 6,
                          borderRadius: 3,
                          bgcolor: alpha(stat.color, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: stat.color,
                            borderRadius: 3
                          }
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={isXSmall ? 0.5 : isMobile ? 1 : isTablet ? 2 : 3}>
          {/* Appointment Trends */}
          <Grid item xs={12} lg={8}>
            <motion.div variants={itemVariants}>
              <Card sx={{ 
                borderRadius: isXSmall ? 1 : isMobile ? 2 : 3,
                mx: isXSmall ? 0.5 : 0,
                boxShadow: isXSmall ? 1 : 2
              }}>
                <CardContent sx={{ 
                  p: isXSmall ? 1.5 : isMobile ? 2 : isTablet ? 2.5 : 3,
                  '&:last-child': { pb: isXSmall ? 1.5 : isMobile ? 2 : isTablet ? 2.5 : 3 }
                }}>
                  <Typography 
                    variant={isXSmall ? "body1" : isMobile ? "subtitle1" : "h6"} 
                    fontWeight={600} 
                    gutterBottom
                    sx={{ fontSize: isXSmall ? '0.875rem' : isMobile ? '1rem' : '1.25rem' }}
                  >
                    Appointment Trends
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: isXSmall ? 1.5 : isMobile ? 2 : 3,
                      fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem'
                    }}
                  >
                    Monthly appointment statistics
                  </Typography>
                  <ResponsiveContainer width="100%" height={isXSmall ? 200 : isMobile ? 250 : 300}>
                    <LineChart data={appointmentTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                      <XAxis 
                        dataKey="month" 
                        stroke={theme.palette.text.secondary}
                        fontSize={isXSmall ? 8 : isMobile ? 10 : 12}
                        tick={{ fontSize: isXSmall ? 8 : isMobile ? 10 : 12 }}
                        interval={isXSmall ? 1 : 0}
                      />
                      <YAxis 
                        stroke={theme.palette.text.secondary}
                        fontSize={isXSmall ? 8 : isMobile ? 10 : 12}
                        tick={{ fontSize: isXSmall ? 8 : isMobile ? 10 : 12 }}
                        width={isXSmall ? 30 : 40}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ 
                          fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem',
                          paddingTop: isXSmall ? '5px' : '10px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="appointments"
                        stroke={theme.palette.primary.main}
                        strokeWidth={isXSmall ? 1.5 : isMobile ? 2 : 3}
                        dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: isXSmall ? 3 : isMobile ? 4 : 6 }}
                        name="Total"
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke={theme.palette.success.main}
                        strokeWidth={isXSmall ? 1.5 : isMobile ? 2 : 3}
                        dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: isXSmall ? 3 : isMobile ? 4 : 6 }}
                        name="Completed"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Patient Demographics */}
          <Grid item xs={12} lg={4}>
            <motion.div variants={itemVariants}>
              <Card sx={{ 
                borderRadius: isXSmall ? 1 : isMobile ? 2 : 3, 
                height: '100%',
                minHeight: isMobile ? 'auto' : '100%',
                mx: isXSmall ? 0.5 : 0,
                boxShadow: isXSmall ? 1 : 2
              }}>
                <CardContent sx={{ 
                  p: isXSmall ? 1.5 : isMobile ? 2 : isTablet ? 2.5 : 3,
                  '&:last-child': { pb: isXSmall ? 1.5 : isMobile ? 2 : isTablet ? 2.5 : 3 }
                }}>
                  <Typography 
                    variant={isXSmall ? "body1" : isMobile ? "subtitle1" : "h6"} 
                    fontWeight={600} 
                    gutterBottom
                    sx={{ fontSize: isXSmall ? '0.875rem' : isMobile ? '1rem' : '1.25rem' }}
                  >
                    Patient Demographics
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: isXSmall ? 1.5 : isMobile ? 2 : 3,
                      fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem'
                    }}
                  >
                    Age distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={isXSmall ? 150 : isMobile ? 200 : 250}>
                    <PieChart>
                      <Pie
                        data={patientDemographics}
                        cx="50%"
                        cy="50%"
                        innerRadius={isXSmall ? 30 : isMobile ? 40 : 60}
                        outerRadius={isXSmall ? 55 : isMobile ? 70 : 100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {patientDemographics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: isXSmall ? 0.5 : isMobile ? 1 : 2 }}>
                    {patientDemographics.map((item, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: isXSmall ? 0.25 : isMobile ? 0.5 : 1 
                      }}>
                        <Box
                          sx={{
                            width: isXSmall ? 8 : isMobile ? 10 : 12,
                            height: isXSmall ? 8 : isMobile ? 10 : 12,
                            borderRadius: '50%',
                            bgcolor: item.color,
                            mr: isXSmall ? 0.5 : 1
                          }}
                        />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            flex: 1,
                            fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem'
                          }}
                        >
                          {isXSmall ? item.name.split(' ')[0] : item.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight={600}
                          sx={{ fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem' }}
                        >
                          {item.value}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Appointment Types */}
          <Grid item xs={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card sx={{ 
                borderRadius: isXSmall ? 1 : isMobile ? 2 : 3,
                mx: isXSmall ? 0.5 : 0,
                boxShadow: isXSmall ? 1 : 2
              }}>
                <CardContent sx={{ 
                  p: isXSmall ? 1.5 : isMobile ? 2 : isTablet ? 2.5 : 3,
                  '&:last-child': { pb: isXSmall ? 1.5 : isMobile ? 2 : isTablet ? 2.5 : 3 }
                }}>
                  <Typography 
                    variant={isXSmall ? "body1" : isMobile ? "subtitle1" : "h6"} 
                    fontWeight={600} 
                    gutterBottom
                    sx={{ fontSize: isXSmall ? '0.875rem' : isMobile ? '1rem' : '1.25rem' }}
                  >
                    Appointment Types
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: isXSmall ? 1.5 : isMobile ? 2 : 3,
                      fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem'
                    }}
                  >
                    Distribution by type
                  </Typography>
                  <ResponsiveContainer width="100%" height={isXSmall ? 150 : isMobile ? 200 : 250}>
                    <BarChart data={appointmentTypes} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                      <XAxis 
                        type="number" 
                        stroke={theme.palette.text.secondary}
                        fontSize={isXSmall ? 8 : isMobile ? 10 : 12}
                        tick={{ fontSize: isXSmall ? 8 : isMobile ? 10 : 12 }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke={theme.palette.text.secondary}
                        fontSize={isXSmall ? 8 : isMobile ? 10 : 12}
                        width={isXSmall ? 50 : isMobile ? 60 : 80}
                        tick={{ fontSize: isXSmall ? 8 : isMobile ? 10 : 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[0, 4, 4, 0]}
                        fill={theme.palette.primary.main}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Performance Metrics */}
          <Grid item xs={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card sx={{ 
                borderRadius: isXSmall ? 1 : isMobile ? 2 : 3,
                mx: isXSmall ? 0.5 : 0,
                boxShadow: isXSmall ? 1 : 2
              }}>
                <CardContent sx={{ 
                  p: isXSmall ? 1.5 : isMobile ? 2 : isTablet ? 2.5 : 3,
                  '&:last-child': { pb: isXSmall ? 1.5 : isMobile ? 2 : isTablet ? 2.5 : 3 }
                }}>
                  <Typography 
                    variant={isXSmall ? "body1" : isMobile ? "subtitle1" : "h6"} 
                    fontWeight={600} 
                    gutterBottom
                    sx={{ fontSize: isXSmall ? '0.875rem' : isMobile ? '1rem' : '1.25rem' }}
                  >
                    Performance Metrics
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: isXSmall ? 1.5 : isMobile ? 2 : 3,
                      fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem'
                    }}
                  >
                    Key performance indicators
                  </Typography>
                  
                  <Box sx={{ mb: isXSmall ? 1.5 : isMobile ? 2 : 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isXSmall ? 0.5 : 1 }}>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem' }}
                      >
                        Patient Satisfaction
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{ fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem' }}
                      >
                        96%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={96}
                      sx={{
                        height: isXSmall ? 4 : isMobile ? 6 : 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.success.main,
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: isXSmall ? 1.5 : isMobile ? 2 : 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isXSmall ? 0.5 : 1 }}>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem' }}
                      >
                        On-time Rate
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{ fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem' }}
                      >
                        92%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={92}
                      sx={{
                        height: isXSmall ? 4 : isMobile ? 6 : 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.info.main,
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isXSmall ? 0.5 : 1 }}>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem' }}
                      >
                        Treatment Success
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{ fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : '0.875rem' }}
                      >
                        88%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={88}
                      sx={{
                        height: isXSmall ? 4 : isMobile ? 6 : 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.warning.main,
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default DoctorStats;