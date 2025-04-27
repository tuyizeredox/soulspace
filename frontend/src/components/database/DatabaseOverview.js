import React from 'react';
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
  LinearProgress,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  CloudSync as CloudSyncIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const DatabaseOverview = () => {
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

  // Mock database metrics
  const databaseMetrics = [
    {
      title: 'Database Size',
      value: '42.8 GB',
      icon: <StorageIcon />,
      color: theme.palette.primary.main,
      status: 'Healthy',
      statusColor: 'success',
      progress: 42,
      details: 'Growing at 2.5 GB/month',
    },
    {
      title: 'Query Performance',
      value: '85 ms',
      icon: <SpeedIcon />,
      color: theme.palette.info.main,
      status: 'Optimized',
      statusColor: 'success',
      progress: 85,
      details: 'Avg. response time',
    },
    {
      title: 'Memory Usage',
      value: '68%',
      icon: <MemoryIcon />,
      color: theme.palette.warning.main,
      status: 'Normal',
      statusColor: 'warning',
      progress: 68,
      details: '16 GB allocated',
    },
    {
      title: 'Replication Status',
      value: 'Synced',
      icon: <CloudSyncIcon />,
      color: theme.palette.success.main,
      status: 'Active',
      statusColor: 'success',
      progress: 100,
      details: 'Last sync: 2 min ago',
    },
  ];

  // Database health indicators
  const healthIndicators = [
    {
      name: 'Connections',
      value: 245,
      max: 500,
      color: theme.palette.primary.main,
    },
    {
      name: 'CPU Usage',
      value: 38,
      max: 100,
      color: theme.palette.info.main,
    },
    {
      name: 'Disk I/O',
      value: 62,
      max: 100,
      color: theme.palette.warning.main,
    },
    {
      name: 'Index Efficiency',
      value: 92,
      max: 100,
      color: theme.palette.success.main,
    },
  ];

  // Database statistics
  const databaseStats = [
    { name: 'Total Collections', value: '28' },
    { name: 'Total Documents', value: '4.2M' },
    { name: 'Indexes', value: '42' },
    { name: 'Avg. Document Size', value: '8.5 KB' },
    { name: 'Read Operations', value: '12.5K/min' },
    { name: 'Write Operations', value: '3.2K/min' },
    { name: 'Uptime', value: '99.98%' },
    { name: 'Last Backup', value: '4 hours ago' },
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
          Database Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Current status and health metrics of the SoulSpace database
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Database Metrics */}
          {databaseMetrics.map((metric, index) => (
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
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                  {metric.details}
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

          {/* Health Indicators */}
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
                Health Indicators
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {healthIndicators.map((indicator, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {indicator.name}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color={indicator.color}>
                          {indicator.value}/{indicator.max}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(indicator.value / indicator.max) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(indicator.color, 0.2),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: indicator.color,
                            borderRadius: 4,
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Database Statistics */}
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
                Database Statistics
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {databaseStats.map((stat, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h6" fontWeight={700} color="primary">
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stat.name}
                      </Typography>
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

export default DatabaseOverview;
