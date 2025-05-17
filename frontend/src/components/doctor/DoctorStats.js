import React from 'react';
import { Grid, Card, CardContent, Typography, Box, useTheme, alpha, Divider, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  VideoCall as VideoCallIcon,
  MeetingRoom as MeetingRoomIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';

const DoctorStats = ({ stats }) => {
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

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: <PersonIcon />,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1),
      subtitle: 'Assigned to you'
    },
    {
      title: 'Today\'s Appointments',
      value: stats.todayAppointments,
      icon: <CalendarIcon />,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1),
      subtitle: 'Scheduled for today'
    },
    {
      title: 'Pending Appointments',
      value: stats.pendingAppointments,
      icon: <ScheduleIcon />,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1),
      subtitle: 'Awaiting confirmation'
    },
    {
      title: 'Completed Appointments',
      value: stats.completedAppointments,
      icon: <CheckCircleIcon />,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1),
      subtitle: 'Successfully completed'
    }
  ];

  // Additional stats cards
  const additionalStats = [
    {
      title: 'Online Consultations',
      value: stats.onlineConsultations,
      icon: <VideoCallIcon />,
      color: theme.palette.success.dark,
      bgColor: alpha(theme.palette.success.dark, 0.1),
      subtitle: 'Virtual appointments'
    },
    {
      title: 'In-Person Visits',
      value: stats.inPersonVisits,
      icon: <MeetingRoomIcon />,
      color: theme.palette.secondary.main,
      bgColor: alpha(theme.palette.secondary.main, 0.1),
      subtitle: 'Physical appointments'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating || 4.8,
      icon: <StarIcon />,
      color: '#FFB400',
      bgColor: alpha('#FFB400', 0.1),
      subtitle: 'Patient satisfaction',
      isRating: true
    },
    {
      title: 'Patient Satisfaction',
      value: stats.patientSatisfaction || 92,
      icon: <FavoriteIcon />,
      color: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, 0.1),
      subtitle: 'Overall experience',
      isPercentage: true
    }
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              component={motion.div}
              variants={itemVariants}
              elevation={0}
              sx={{
                borderRadius: 3,
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: stat.bgColor,
                      color: stat.color,
                      mr: 2,
                      boxShadow: `0 4px 12px ${alpha(stat.color, 0.2)}`
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      {stat.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.subtitle}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h3" fontWeight={700} color={stat.color} align="center" sx={{ mt: 2 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, mt: 4 }}>
        Performance Metrics
      </Typography>

      <Grid container spacing={3}>
        {additionalStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              component={motion.div}
              variants={itemVariants}
              elevation={0}
              sx={{
                borderRadius: 3,
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: stat.bgColor,
                      color: stat.color,
                      mr: 2,
                      boxShadow: `0 4px 12px ${alpha(stat.color, 0.2)}`
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      {stat.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.subtitle}
                    </Typography>
                  </Box>
                </Box>

                {stat.isRating ? (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h3" fontWeight={700} color={stat.color}>
                        {stat.value}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            sx={{
                              color: star <= Math.round(stat.value) ? stat.color : alpha(stat.color, 0.3),
                              fontSize: 20
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(stat.value / 5) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(stat.color, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: stat.color
                        }
                      }}
                    />
                  </Box>
                ) : stat.isPercentage ? (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h3" fontWeight={700} color={stat.color}>
                        {stat.value}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stat.value}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(stat.color, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: stat.color
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Typography variant="h3" fontWeight={700} color={stat.color} align="center" sx={{ mt: 2 }}>
                    {stat.value}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DoctorStats;
