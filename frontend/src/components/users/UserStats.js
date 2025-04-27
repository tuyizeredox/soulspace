import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  alpha,
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  Skeleton,
  Tooltip as MuiTooltip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  PersonAdd as PersonAddIcon,
  HowToReg as HowToRegIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Refresh as RefreshIcon,
  Smartphone as SmartphoneIcon,
  Computer as ComputerIcon,
  Tablet as TabletIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarMonth as CalendarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const UserStats = ({ stats, loading = false, onRefresh }) => {
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

  // Colors for pie chart
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
  ];

  // Stat cards data
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      change: stats.growthRates?.totalUsers || '+0%',
      changeType: 'positive',
      description: 'Total registered users in the system'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: <HowToRegIcon />,
      color: theme.palette.success.main,
      change: stats.growthRates?.activeUsers || '+0%',
      changeType: 'positive',
      description: 'Users active in the last 30 days'
    },
    {
      title: 'New Users Today',
      value: stats.newUsersToday.toLocaleString(),
      icon: <PersonAddIcon />,
      color: theme.palette.info.main,
      change: stats.growthRates?.newUsers || '+0%',
      changeType: 'positive',
      description: 'Users registered in the last 24 hours'
    },
    {
      title: 'Admin Users',
      value: (
        (stats.usersByRole?.find(role => role.name === 'Hospital Admins')?.value || 0) +
        (stats.usersByRole?.find(role => role.name === 'Super Admins')?.value || 0)
      ).toLocaleString(),
      icon: <SupervisorAccountIcon />,
      color: theme.palette.warning.main,
      change: '+5%',
      changeType: 'positive',
      description: 'Total system administrators'
    },
  ];

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length && payload[0] && payload[0].fill) {
      // Get the color from the payload or use a default color
      const fillColor = payload[0].fill || theme.palette.primary.main;

      return (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
            borderRadius: 2,
            minWidth: 180,
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{
              color: fillColor,
              borderBottom: `2px solid ${alpha(fillColor, 0.3)}`,
              pb: 0.5,
              mb: 1,
            }}
          >
            {payload[0].name || 'Unknown'}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Count:
            </Typography>
            <Typography variant="body2">
              {(payload[0].value || 0).toLocaleString()} users
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="body2" fontWeight={600}>
              Percentage:
            </Typography>
            <Chip
              label={`${((payload[0].payload?.percent || 0) * 100).toFixed(1)}%`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                backgroundColor: alpha(fillColor, 0.15),
                color: fillColor,
                fontWeight: 600,
              }}
            />
          </Box>
        </Paper>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    // Handle undefined values
    if (cx === undefined || cy === undefined || midAngle === undefined ||
        innerRadius === undefined || outerRadius === undefined || percent === undefined) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Format the percentage, handling NaN
    const percentValue = isNaN(percent) ? 0 : percent;
    const formattedPercent = `${(percentValue * 100).toFixed(0)}%`;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
        style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
      >
        {formattedPercent}
      </text>
    );
  };

  // Add percentage to user role data
  const userRoleData = (stats.usersByRole || []).map(item => ({
    ...item,
    percent: stats.totalUsers > 0 ? (item.value || 0) / stats.totalUsers : 0
  }));

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header with refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          User Management Overview
        </Typography>
        <MuiTooltip title="Refresh statistics">
          <IconButton
            onClick={onRefresh}
            disabled={loading}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </MuiTooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Stat Cards */}
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(stat.color, 0.05)} 0%, ${alpha(stat.color, 0.1)} 100%)`,
                  border: `1px solid ${alpha(stat.color, 0.2)}`,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 10px 20px ${alpha(stat.color, 0.2)}`,
                  },
                }}
              >
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: alpha(stat.color, 0.2),
                        color: stat.color,
                        width: 56,
                        height: 56,
                        boxShadow: `0 4px 8px ${alpha(stat.color, 0.3)}`,
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        }
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    {loading ? (
                      <Skeleton width={60} height={24} />
                    ) : (
                      <Chip
                        label={stat.change}
                        size="small"
                        color={stat.changeType === 'positive' ? 'success' : 'error'}
                        sx={{
                          fontWeight: 600,
                          borderRadius: '12px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      />
                    )}
                  </Box>

                  {loading ? (
                    <>
                      <Skeleton width="80%" height={40} sx={{ mb: 0.5 }} />
                      <Skeleton width="60%" height={20} sx={{ mb: 1.5 }} />
                      <Skeleton width="90%" height={16} sx={{ mb: 1 }} />
                    </>
                  ) : (
                    <>
                      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{
                          mb: 0.5,
                          color: stat.color,
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 'auto',
                          fontSize: '0.75rem',
                          opacity: 0.8,
                        }}
                      >
                        {stat.description}
                      </Typography>
                    </>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant={loading ? "indeterminate" : "determinate"}
                      value={70}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(stat.color, 0.15),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stat.color,
                          borderRadius: 4,
                          backgroundImage: `linear-gradient(90deg, ${alpha(stat.color, 0.8)} 0%, ${stat.color} 100%)`,
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}

        {/* User Distribution by Role */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.08)}`,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.12)}`,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      color: theme.palette.primary.main,
                      width: 40,
                      height: 40,
                      mr: 1.5,
                    }}
                  >
                    <SupervisorAccountIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    User Distribution by Role
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loading || userRoleData.length === 0 ? (
                  loading ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress size={40} thickness={4} color="primary" />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Loading data...
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          mb: 2,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      >
                        <SupervisorAccountIcon fontSize="large" />
                      </Avatar>
                      <Typography variant="body1" color="text.secondary" align="center">
                        No user data available
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, opacity: 0.7 }}>
                        Add users to see distribution
                      </Typography>
                    </Box>
                  )
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={2}
                      >
                        {userRoleData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke={alpha(COLORS[index % COLORS.length], 0.2)}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconSize={10}
                        iconType="circle"
                        wrapperStyle={{
                          paddingTop: '20px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.08)}`,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.12)}`,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.info.main, 0.2),
                      color: theme.palette.info.main,
                      width: 40,
                      height: 40,
                      mr: 1.5,
                    }}
                  >
                    <PersonAddIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Recently Added Users
                  </Typography>
                </Box>
                <Chip
                  label={`Total: ${stats.totalUsers || 0}`}
                  size="small"
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                />
              </Box>

              <Box sx={{ height: 300, overflowY: 'auto', pr: 1 }}>
                {loading ? (
                  Array.from(new Array(4)).map((_, index) => (
                    <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                      <Box sx={{ width: '100%' }}>
                        <Skeleton width="60%" height={24} />
                        <Skeleton width="40%" height={20} />
                      </Box>
                    </Box>
                  ))
                ) : stats.recentUsers?.length > 0 ? (
                  stats.recentUsers.map((user, index) => (
                    <Paper
                      key={user.id || index}
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.7),
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateX(5px)',
                          boxShadow: `0 4px 8px ${alpha(theme.palette.info.main, 0.15)}`,
                          borderColor: alpha(theme.palette.info.main, 0.3),
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            mr: 1.5,
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                            color: theme.palette.info.main,
                            fontSize: '1rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {user.name || 'Unknown User'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mr: 2,
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                            }}>
                              <SupervisorAccountIcon sx={{ fontSize: '0.875rem', mr: 0.5, opacity: 0.7 }} />
                              {user.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                            </Box>
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                            }}>
                              <CalendarIcon sx={{ fontSize: '0.875rem', mr: 0.5, opacity: 0.7 }} />
                              {new Date(user.joinedDate).toLocaleDateString()}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 1,
                        pt: 1,
                        borderTop: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
                      }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                        }}>
                          <EmailIcon sx={{ fontSize: '0.875rem', mr: 0.5, opacity: 0.7 }} />
                          {user.email}
                        </Box>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                        }}>
                          <PhoneIcon sx={{ fontSize: '0.875rem', mr: 0.5, opacity: 0.7 }} />
                          {user.phone}
                        </Box>
                      </Box>
                    </Paper>
                  ))
                ) : (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        mb: 2,
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                      }}
                    >
                      <PersonAddIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="body1" color="text.secondary" align="center">
                      No recent users found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, opacity: 0.7 }}>
                      New users will appear here
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserStats;
