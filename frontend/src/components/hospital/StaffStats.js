import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  useTheme,
  alpha,
  Avatar,
} from '@mui/material';
import {
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const StaffStats = ({ stats }) => {
  const theme = useTheme();

  // Animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Prepare data for role chart
  const roleData = [
    { name: 'Doctors', value: stats.byRole.doctor || 0, color: theme.palette.primary.main },
    { name: 'Nurses', value: stats.byRole.nurse || 0, color: theme.palette.info.main },
    { name: 'Pharmacists', value: stats.byRole.pharmacist || 0, color: theme.palette.success.main },
    { name: 'Other Staff', value: (stats.byRole.staff || 0) + (stats.byRole.receptionist || 0) + (stats.byRole.lab_technician || 0), color: theme.palette.warning.main },
  ].filter(item => item.value > 0);

  // Prepare data for status chart
  const statusData = [
    { name: 'Active', value: stats.byStatus.active || 0, color: theme.palette.success.main },
    { name: 'Inactive', value: stats.byStatus.inactive || 0, color: theme.palette.error.main },
    { name: 'On Leave', value: stats.byStatus.on_leave || 0, color: theme.palette.warning.main },
    { name: 'Suspended', value: stats.byStatus.suspended || 0, color: theme.palette.grey[500] },
  ].filter(item => item.value > 0);

  // Stat cards data
  const statCards = [
    {
      title: 'Total Staff',
      value: stats.total || 0,
      icon: <GroupIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Doctors',
      value: stats.byRole.doctor || 0,
      icon: <LocalHospitalIcon />,
      color: theme.palette.info.main,
    },
    {
      title: 'Nurses',
      value: stats.byRole.nurse || 0,
      icon: <MedicalServicesIcon />,
      color: theme.palette.success.main,
    },
    {
      title: 'Pharmacists',
      value: stats.byRole.pharmacist || 0,
      icon: <LocalPharmacyIcon />,
      color: theme.palette.warning.main,
    },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="body2" fontWeight={600} color={payload[0].payload.color}>
            {payload[0].name}: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        {/* Stat Cards */}
        {statCards.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Card
              component={motion.div}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              sx={{
                borderRadius: 3,
                boxShadow: `0 4px 12px ${alpha(stat.color, 0.15)}`,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 8px 16px ${alpha(stat.color, 0.2)}`,
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      width: 40,
                      height: 40,
                      mr: 1.5,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Card
            component={motion.div}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            sx={{ borderRadius: 3, height: '100%' }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Staff by Role
              </Typography>
              <Box sx={{ height: 200, mt: 2 }}>
                {roleData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {roleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                      No data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            component={motion.div}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            sx={{ borderRadius: 3, height: '100%' }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Staff by Status
              </Typography>
              <Box sx={{ height: 200, mt: 2 }}>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                      No data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffStats;
