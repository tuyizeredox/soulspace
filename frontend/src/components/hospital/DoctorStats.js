import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  LocalHospital,
  People,
  CheckCircle,
  AccessTime,
  Star,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DoctorStats = ({ stats }) => {
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
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  // Colors for the pie chart
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff8042',
  ];

  // Stat cards data
  const statCards = [
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: <LocalHospital />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Active Doctors',
      value: stats.activeDoctors,
      icon: <CheckCircle />,
      color: theme.palette.success.main,
    },
    {
      title: 'On Leave',
      value: stats.onLeaveDoctors,
      icon: <AccessTime />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Top Rated',
      value: stats.topPerforming.length > 0 ? `${stats.topPerforming[0].rating}/5` : 'N/A',
      icon: <Star />,
      color: theme.palette.secondary.main,
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Doctor Statistics Overview
      </Typography>

      <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        {/* Stat Cards */}
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index} component={motion.div} variants={itemVariants}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`,
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      width: 48,
                      height: 48,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Specialization Distribution */}
        <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              overflow: 'hidden',
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Doctors by Specialization
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                {stats.bySpecialization.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.bySpecialization}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.bySpecialization.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} doctors`, name]}
                        contentStyle={{ 
                          backgroundColor: theme.palette.background.paper,
                          borderColor: theme.palette.divider,
                          borderRadius: 8,
                          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography color="text.secondary">No specialization data available</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Doctors */}
        <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Top Performing Doctors
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {stats.topPerforming.length > 0 ? (
                <Box>
                  {stats.topPerforming.map((doctor, index) => (
                    <Box
                      key={doctor.id || index}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            mr: 2,
                          }}
                        >
                          {doctor.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {doctor.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doctor.specialization}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 3, textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={600}>
                            {doctor.patients}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Patients
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={600} color="secondary.main">
                            {doctor.rating.toFixed(1)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Rating
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography color="text.secondary">No performance data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorStats;
