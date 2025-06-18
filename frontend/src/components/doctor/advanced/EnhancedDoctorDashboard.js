import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Badge,
  useTheme,
  useMediaQuery,
  alpha,
  Skeleton,
  Alert,
  Snackbar,
  Container
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from '../../../utils/axiosConfig';
import './EnhancedDoctorDashboard.css';

// Import components
import DoctorAppointmentManagement from './DoctorAppointmentManagement';
import DoctorScheduleManager from './DoctorScheduleManager';
import DoctorStats from './DoctorStats';
import AvailabilityScheduler from './AvailabilityScheduler';

const EnhancedDoctorDashboard = () => {
  const theme = useTheme();
  const isXSmall = useMediaQuery('(max-width:480px)'); // Extra small phones
  const isXXSmall = useMediaQuery('(max-width:360px)'); // Very small phones
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Small phones
  const isTablet = useMediaQuery(theme.breakpoints.down('md')); // Tablets
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg')); // Small laptops
  const isLandscape = useMediaQuery('(orientation: landscape)');
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    schedules: [],
    stats: {},
    notifications: []
  });

  // Get user data from Redux store
  const { user: oldAuthUser } = useSelector((state) => state.auth);
  const { user: userAuthUser } = useSelector((state) => state.userAuth);
  const user = userAuthUser || oldAuthUser;

  // Responsive utility function
  const getResponsiveValue = (xxs, xs, sm, md, lg) => {
    if (isXXSmall) return xxs;
    if (isXSmall) return xs;
    if (isMobile) return sm;
    if (isTablet) return md;
    return lg;
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [appointmentsRes, statsRes, schedulesRes] = await Promise.all([
          axios.get('/api/doctors/my-appointments'),
          axios.get('/api/doctors/stats'),
          axios.get(`/api/doctors/${user?.id}/schedules`).catch(() => ({ data: [] }))
        ]);

        // Debug logging
        console.log('API Responses:', {
          appointments: appointmentsRes.data,
          stats: statsRes.data,
          schedules: schedulesRes.data
        });

        setDashboardData({
          appointments: Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [],
          stats: statsRes.data || {},
          schedules: Array.isArray(schedulesRes.data) ? schedulesRes.data : [],
          notifications: []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        
        // Set mock data for development
        setDashboardData({
          appointments: [
            {
              _id: '1',
              patient: { name: 'John Doe', _id: 'p1' },
              date: new Date().toISOString(),
              time: '10:00',
              type: 'consultation',
              status: 'confirmed',
              reason: 'Regular checkup'
            },
            {
              _id: '2',
              patient: { name: 'Jane Smith', _id: 'p2' },
              date: new Date(Date.now() + 86400000).toISOString(),
              time: '14:30',
              type: 'follow-up',
              status: 'confirmed',
              reason: 'Follow-up visit'
            }
          ],
          stats: {
            totalAppointments: 45,
            completedAppointments: 38,
            pendingAppointments: 5,
            cancelledAppointments: 2,
            totalPatients: 32,
            averageRating: 4.8
          },
          schedules: [],
          notifications: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Calculate badge counts
  const badgeCounts = useMemo(() => {
    // Ensure we have arrays
    const appointments = Array.isArray(dashboardData.appointments) ? dashboardData.appointments : [];
    const schedules = Array.isArray(dashboardData.schedules) ? dashboardData.schedules : [];
    
    const pendingAppointments = appointments.filter(
      apt => apt.status === 'confirmed' && new Date(apt.date) >= new Date()
    ).length;
    
    const pendingSchedules = schedules.filter(
      schedule => schedule.status === 'pending'
    ).length;

    return {
      appointments: pendingAppointments,
      schedules: pendingSchedules
    };
  }, [dashboardData]);

  // Tab configuration
  const tabs = [
    {
      label: 'Overview',
      icon: <DashboardIcon />,
      badge: null,
      component: <DoctorStats data={dashboardData} loading={loading} />
    },
    {
      label: 'Appointments',
      icon: <EventIcon />,
      badge: badgeCounts.appointments,
      component: <DoctorAppointmentManagement 
        appointments={Array.isArray(dashboardData.appointments) ? dashboardData.appointments : []}
        loading={loading}
        onAppointmentUpdate={(updatedAppointment) => {
          setDashboardData(prev => ({
            ...prev,
            appointments: Array.isArray(prev.appointments) 
              ? prev.appointments.map(apt => 
                  apt._id === updatedAppointment._id ? updatedAppointment : apt
                )
              : []
          }));
        }}
      />
    },
    {
      label: 'My Schedule',
      icon: <ScheduleIcon />,
      badge: null,
      component: <DoctorScheduleManager 
        schedules={Array.isArray(dashboardData.schedules) ? dashboardData.schedules : []}
        loading={loading}
        onScheduleUpdate={(updatedSchedule) => {
          setDashboardData(prev => ({
            ...prev,
            schedules: Array.isArray(prev.schedules)
              ? prev.schedules.map(schedule => 
                  schedule._id === updatedSchedule._id ? updatedSchedule : schedule
                )
              : []
          }));
        }}
      />
    },
    {
      label: 'Availability',
      icon: <AssignmentIcon />,
      badge: badgeCounts.schedules,
      component: <AvailabilityScheduler 
        onScheduleRequest={(newRequest) => {
          setDashboardData(prev => ({
            ...prev,
            schedules: Array.isArray(prev.schedules) 
              ? [...prev.schedules, newRequest]
              : [newRequest]
          }));
        }}
      />
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
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

  if (loading && (!dashboardData.appointments || !Array.isArray(dashboardData.appointments) || !dashboardData.appointments.length)) {
    return (
      <Container maxWidth="xl" sx={{ px: isXSmall ? 0.5 : isMobile ? 1 : 2 }}>
        <Box sx={{ 
          p: isXSmall ? 0.5 : isMobile ? 1 : isTablet ? 2 : 3,
          minHeight: '100vh'
        }}>
          <Skeleton 
            variant="rectangular" 
            height={isXSmall ? 32 : isMobile ? 40 : 60} 
            sx={{ 
              mb: isXSmall ? 1 : isMobile ? 2 : 3, 
              borderRadius: isXSmall ? 1 : 2,
              mx: isXSmall ? 0.5 : 0
            }} 
          />
          <Grid container spacing={isXSmall ? 0.5 : isMobile ? 1 : isTablet ? 2 : 3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={6} lg={3} key={item}>
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
          </Grid>
          <Skeleton 
            variant="rectangular" 
            height={isXSmall ? 250 : isMobile ? 300 : 400} 
            sx={{ 
              mt: isXSmall ? 1 : isMobile ? 2 : 3, 
              borderRadius: isXSmall ? 1 : 2,
              mx: isXSmall ? 0.5 : 0
            }} 
          />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: isXSmall ? 0.5 : isMobile ? 1 : 2 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box sx={{ 
          p: isXSmall ? 0.5 : isMobile ? 1 : isTablet ? 2 : 3,
          minHeight: '100vh'
        }}>
          {/* Header */}
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                mb: isXSmall ? 1 : isMobile ? 2 : 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                borderRadius: isXSmall ? 1 : isMobile ? 2 : 3,
                overflow: 'hidden',
                mx: isXSmall ? 0.5 : 0
              }}
            >
              <CardContent sx={{ 
                p: isXSmall ? 1.5 : isMobile ? 2 : isTablet ? 2.5 : 3,
                '&:last-child': { pb: isXSmall ? 1.5 : isMobile ? 2 : isTablet ? 2.5 : 3 }
              }}>
                <Typography 
                  variant={getResponsiveValue("body1", "h6", "h5", "h4", "h4")} 
                  fontWeight={700} 
                  gutterBottom
                  sx={{
                    fontSize: getResponsiveValue('1rem', '1.25rem', '1.5rem', '2rem', '2.125rem'),
                    lineHeight: 1.2,
                    textAlign: isXSmall ? 'center' : 'left'
                  }}
                >
                  {isXXSmall ? user?.name || 'Doctor' : 
                   isXSmall ? `Dr. ${user?.name || 'Doctor'}` : 
                   `Welcome back, Dr. ${user?.name || 'Doctor'}`}
                </Typography>
                <Typography 
                  variant={getResponsiveValue("caption", "caption", "body2", "h6", "h6")} 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: getResponsiveValue('0.65rem', '0.75rem', '0.875rem', '1.25rem', '1.25rem'),
                    display: isMobile ? 'block' : 'inline',
                    textAlign: isXSmall ? 'center' : 'left'
                  }}
                >
                  {isXXSmall ? 
                    (user?.specialization || 'Medical') :
                    (user?.specialization || 'Medical Professional')
                  }
                  {!isMobile && ' • '}
                  {isMobile && <br />}
                  {isXXSmall ? 
                    (user?.department?.split(' ')[0] || 'General') :
                    (user?.department || 'General Medicine')
                  }
                </Typography>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={itemVariants}>
            <Card sx={{ 
              borderRadius: isXSmall ? 1 : isMobile ? 2 : 3, 
              overflow: 'hidden',
              boxShadow: isXSmall ? 0 : isMobile ? 1 : 3,
              mx: isXSmall ? 0.5 : 0
            }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant={isMobile ? "fullWidth" : "scrollable"}
                  scrollButtons={isMobile ? false : "auto"}
                  allowScrollButtonsMobile={!isMobile}
                  sx={{
                    '& .MuiTab-root': {
                      minHeight: isXSmall ? 40 : isMobile ? 48 : isTablet ? 56 : 64,
                      textTransform: 'none',
                      fontSize: isXSmall ? '0.65rem' : isMobile ? '0.75rem' : isTablet ? '0.875rem' : '1rem',
                      fontWeight: 500,
                      minWidth: isMobile ? 'auto' : 120,
                      px: isXSmall ? 0.25 : isMobile ? 0.5 : 1,
                      '&.Mui-selected': {
                        color: theme.palette.primary.main,
                        fontWeight: 600
                      }
                    },
                    '& .MuiTabs-flexContainer': {
                      justifyContent: isMobile ? 'space-around' : 'flex-start'
                    },
                    '& .MuiTabs-indicator': {
                      height: isXSmall ? 2 : 3
                    }
                  }}
                >
                  {tabs.map((tab, index) => (
                    <Tab
                      key={index}
                      label={
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: isXSmall ? 0.25 : isMobile ? 0.5 : 1,
                          flexDirection: isMobile ? 'column' : 'row'
                        }}>
                          {tab.badge ? (
                            <Badge 
                              badgeContent={tab.badge} 
                              color="error"
                              sx={{
                                '& .MuiBadge-badge': {
                                  fontSize: isXSmall ? '0.5rem' : '0.75rem',
                                  minWidth: isXSmall ? 14 : 20,
                                  height: isXSmall ? 14 : 20
                                }
                              }}
                            >
                              {React.cloneElement(tab.icon, {
                                sx: { fontSize: isXSmall ? '0.875rem' : isMobile ? '1rem' : '1.25rem' }
                              })}
                            </Badge>
                          ) : (
                            React.cloneElement(tab.icon, {
                              sx: { fontSize: isXSmall ? '0.875rem' : isMobile ? '1rem' : '1.25rem' }
                            })
                          )}
                          {!isMobile && tab.label}
                          {isMobile && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontSize: isXSmall ? '0.5rem' : '0.65rem',
                                lineHeight: 1,
                                textAlign: 'center'
                              }}
                            >
                              {isXSmall ? tab.label.split(' ')[0] : tab.label}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  ))}
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ 
                minHeight: isXSmall ? 300 : isMobile ? 400 : isTablet ? 500 : 600,
                overflow: 'hidden'
              }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {tabs[activeTab]?.component}
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Card>
          </motion.div>

          {/* Error Snackbar */}
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError(null)}
            anchorOrigin={{ 
              vertical: isMobile ? 'top' : 'bottom', 
              horizontal: 'center' 
            }}
            sx={{
              '& .MuiSnackbarContent-root': {
                minWidth: isXSmall ? '95vw' : isMobile ? '90vw' : 'auto',
                mx: isXSmall ? 0.5 : 1
              }
            }}
          >
            <Alert
              onClose={() => setError(null)}
              severity="error"
              variant="filled"
              sx={{
                fontSize: isXSmall ? '0.75rem' : isMobile ? '0.875rem' : '1rem',
                '& .MuiAlert-message': {
                  wordBreak: 'break-word'
                },
                '& .MuiAlert-action': {
                  padding: isXSmall ? '0 4px' : '0 8px'
                }
              }}
            >
              {error}
            </Alert>
          </Snackbar>
        </Box>
      </motion.div>
    </Container>
  );
};

export default EnhancedDoctorDashboard;