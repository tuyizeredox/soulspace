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
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  CloudQueue as CloudQueueIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const PerformanceOverview = () => {
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

  // Mock performance data
  const performanceMetrics = [
    {
      title: 'Server Response Time',
      value: '124ms',
      icon: <SpeedIcon />,
      color: theme.palette.primary.main,
      status: 'Excellent',
      statusColor: 'success',
      progress: 92,
    },
    {
      title: 'Memory Usage',
      value: '42%',
      icon: <MemoryIcon />,
      color: theme.palette.info.main,
      status: 'Good',
      statusColor: 'info',
      progress: 42,
    },
    {
      title: 'Database Load',
      value: '28%',
      icon: <StorageIcon />,
      color: theme.palette.success.main,
      status: 'Excellent',
      statusColor: 'success',
      progress: 28,
    },
    {
      title: 'API Throughput',
      value: '1.2K/min',
      icon: <CloudQueueIcon />,
      color: theme.palette.warning.main,
      status: 'Good',
      statusColor: 'info',
      progress: 65,
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
          System Performance Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Real-time performance metrics for the SoulSpace platform
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {performanceMetrics.map((metric, index) => (
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

export default PerformanceOverview;
