import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  Person,
  AccessTime,
  MoreVert,
  TrendingUp,
  PeopleAlt,
  PersonAdd,
  DevicesOther,
  Visibility,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const UserActivityMonitor = ({ userStats }) => {
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

  // Colors for charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 2,
            boxShadow: theme.shadows[3],
            borderRadius: 1,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
          }}
        >
          <Typography variant="subtitle2" color="text.primary">
            {label}
          </Typography>
          <Typography variant="body2" color={payload[0].color}>
            {`${payload[0].name}: ${payload[0].value}`}
          </Typography>
        </Paper>
      );
    }
    return null;
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
            User Activity Monitor
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Visibility />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            View All
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* User Stats */}
          <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mr: 2
                      }}
                    >
                      <PeopleAlt />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Users</Typography>
                      <Typography variant="h6" fontWeight={600}>{userStats.totalUsers.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                  <TrendingUp sx={{ color: theme.palette.success.main }} />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        mr: 2
                      }}
                    >
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Active Users</Typography>
                      <Typography variant="h6" fontWeight={600}>{userStats.activeUsers.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`${Math.round((userStats.activeUsers / userStats.totalUsers) * 100)}%`}
                    size="small"
                    color="info"
                    sx={{ fontWeight: 500 }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        mr: 2
                      }}
                    >
                      <PersonAdd />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">New Users Today</Typography>
                      <Typography variant="h6" fontWeight={600}>{userStats.newUsersToday}</Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="+12%"
                    size="small"
                    color="success"
                    sx={{ fontWeight: 500 }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Users by Role */}
          <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Users by Role</Typography>
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={userStats.usersByRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {userStats.usersByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2 }}>
                {userStats.usersByRole.map((role, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: COLORS[index % COLORS.length],
                        mr: 1
                      }}
                    />
                    <Typography variant="caption" sx={{ mr: 1 }}>{role.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {role.value.toLocaleString()} ({Math.round((role.value / userStats.totalUsers) * 100)}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Users by Device */}
          <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Users by Device</Typography>
              <Box sx={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={userStats.usersByDevice}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Users" radius={[4, 4, 0, 0]}>
                      {userStats.usersByDevice.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2 }}>
                {userStats.usersByDevice.map((device, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: COLORS[index % COLORS.length],
                        mr: 1
                      }}
                    />
                    <Typography variant="caption" sx={{ mr: 1 }}>{device.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {device.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* User Activity Chart */}
          <Grid item xs={12} component={motion.div} variants={itemVariants}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2 }}>User Activity (Last 7 Days)</Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userStats.userActivity}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="users" name="Active Users" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserActivityMonitor;
