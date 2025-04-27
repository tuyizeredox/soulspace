import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Divider,
  Chip,
  useTheme,
  alpha,
  Paper,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Memory,
  Storage,
  NetworkCheck,
  AccessTime,
  Speed,
  DeviceHub,
  Backup,
  Refresh,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const SystemHealthMonitor = ({ systemHealth, onRefresh }) => {
  const theme = useTheme();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Get color based on value
  const getColorByValue = (value) => {
    if (value < 50) return theme.palette.success.main;
    if (value < 80) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle fontSize="small" sx={{ color: theme.palette.success.main }} />;
      case 'warning':
        return <Warning fontSize="small" sx={{ color: theme.palette.warning.main }} />;
      case 'critical':
        return <Error fontSize="small" sx={{ color: theme.palette.error.main }} />;
      default:
        return <CheckCircle fontSize="small" sx={{ color: theme.palette.success.main }} />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'success';
    }
  };

  return (
    <Card
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            System Health Monitor
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={getStatusIcon(systemHealth.status)}
              label={`Status: ${systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}`}
              color={getStatusColor(systemHealth.status)}
              size="small"
              sx={{ fontWeight: 500 }}
            />
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={onRefresh} sx={{ color: theme.palette.primary.main }}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* CPU Usage */}
          <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                height: '100%',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Memory sx={{ color: getColorByValue(systemHealth.cpu), mr: 1 }} />
                <Typography variant="subtitle2">CPU Usage</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="h5" fontWeight={600} sx={{ color: getColorByValue(systemHealth.cpu) }}>
                  {systemHealth.cpu}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemHealth.cpu}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(getColorByValue(systemHealth.cpu), 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getColorByValue(systemHealth.cpu),
                  }
                }}
              />
            </Paper>
          </Grid>

          {/* Memory Usage */}
          <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                height: '100%',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Storage sx={{ color: getColorByValue(systemHealth.memory), mr: 1 }} />
                <Typography variant="subtitle2">Memory Usage</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="h5" fontWeight={600} sx={{ color: getColorByValue(systemHealth.memory) }}>
                  {systemHealth.memory}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemHealth.memory}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(getColorByValue(systemHealth.memory), 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getColorByValue(systemHealth.memory),
                  }
                }}
              />
            </Paper>
          </Grid>

          {/* Disk Usage */}
          <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                height: '100%',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Storage sx={{ color: getColorByValue(systemHealth.disk), mr: 1 }} />
                <Typography variant="subtitle2">Disk Usage</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="h5" fontWeight={600} sx={{ color: getColorByValue(systemHealth.disk) }}>
                  {systemHealth.disk}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemHealth.disk}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(getColorByValue(systemHealth.disk), 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getColorByValue(systemHealth.disk),
                  }
                }}
              />
            </Paper>
          </Grid>

          {/* Network Usage */}
          <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                height: '100%',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <NetworkCheck sx={{ color: getColorByValue(systemHealth.network), mr: 1 }} />
                <Typography variant="subtitle2">Network Usage</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="h5" fontWeight={600} sx={{ color: getColorByValue(systemHealth.network) }}>
                  {systemHealth.network}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemHealth.network}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(getColorByValue(systemHealth.network), 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getColorByValue(systemHealth.network),
                  }
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          {/* System Metrics */}
          <Grid item xs={12} component={motion.div} variants={itemVariants}>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 180,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <AccessTime sx={{ color: theme.palette.info.main, mr: 1 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Uptime</Typography>
                  <Typography variant="body2" fontWeight={600}>{systemHealth.uptime}</Typography>
                </Box>
              </Paper>

              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 180,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <Speed sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Response Time</Typography>
                  <Typography variant="body2" fontWeight={600}>{systemHealth.responseTime}</Typography>
                </Box>
              </Paper>

              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 180,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <DeviceHub sx={{ color: theme.palette.warning.main, mr: 1 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Active Connections</Typography>
                  <Typography variant="body2" fontWeight={600}>{systemHealth.activeConnections.toLocaleString()}</Typography>
                </Box>
              </Paper>

              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 180,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <Backup sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Last Backup</Typography>
                  <Typography variant="body2" fontWeight={600}>{systemHealth.lastBackup}</Typography>
                </Box>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SystemHealthMonitor;
