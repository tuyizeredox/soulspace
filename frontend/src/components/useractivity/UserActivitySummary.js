import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  alpha,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  AccessTime as AccessTimeIcon,
  TouchApp as TouchAppIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const UserActivitySummary = () => {
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

  // Mock user activity data
  const activityMetrics = [
    {
      title: 'Active Users',
      value: '3,245',
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      status: '+12%',
      statusColor: 'success',
      progress: 78,
    },
    {
      title: 'New Registrations',
      value: '128',
      icon: <PersonAddIcon />,
      color: theme.palette.info.main,
      status: '+8%',
      statusColor: 'success',
      progress: 65,
    },
    {
      title: 'Avg. Session Time',
      value: '18m 42s',
      icon: <AccessTimeIcon />,
      color: theme.palette.success.main,
      status: '+5%',
      statusColor: 'success',
      progress: 72,
    },
    {
      title: 'Engagement Rate',
      value: '68%',
      icon: <TouchAppIcon />,
      color: theme.palette.warning.main,
      status: '+3%',
      statusColor: 'success',
      progress: 68,
    },
  ];

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
        <Typography variant="h6" fontWeight={600} gutterBottom>
          User Activity Summary
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Overview of user activity metrics for the last 24 hours
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {activityMetrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(metric.color, 0.1),
                  border: `1px solid ${alpha(metric.color, 0.2)}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: metric.color,
                    }}
                  >
                    {React.cloneElement(metric.icon, { sx: { fontSize: 24 } })}
                    <Typography variant="subtitle2" fontWeight={600} sx={{ ml: 1 }}>
                      {metric.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={metric.status}
                    color={metric.statusColor}
                    size="small"
                    sx={{ fontWeight: 500, height: 24 }}
                  />
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                  {metric.value}
                </Typography>
                <Box sx={{ width: '100%', mt: 'auto' }}>
                  <LinearProgress
                    variant="determinate"
                    value={metric.progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(metric.color, 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: metric.color,
                        borderRadius: 3,
                      }
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserActivitySummary;
