import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Divider,
  Tabs,
  Tab,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';

// Import analytics components
import TimeRangeSelector from '../../components/analytics/TimeRangeSelector';
import SystemPerformanceAnalytics from '../../components/analytics/SystemPerformanceAnalytics';
import UserAnalytics from '../../components/analytics/UserAnalytics';
import HospitalAnalytics from '../../components/analytics/HospitalAnalytics';
import FinancialAnalytics from '../../components/analytics/FinancialAnalytics';

const Analytics = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [tabValue, setTabValue] = useState(0);
  const [analyticsData, setAnalyticsData] = useState({
    system: {
      systemUsage: [],
      responseTime: [],
      errorRate: [],
      serverLoad: []
    },
    users: {
      userGrowth: [],
      userDistribution: [],
      activeUsers: [],
      userEngagement: []
    },
    hospitals: {
      hospitalRegistrations: [],
      hospitalDistribution: [],
      appointmentTrends: [],
      patientSatisfaction: []
    },
    financial: {
      revenueTrends: [],
      revenueByService: [],
      monthlyRevenue: [],
      revenueByHospital: []
    }
  });

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
        duration: 0.5
      }
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // In a real application, you would fetch data from the API
      // const response = await axios.get(`/api/analytics?timeRange=${timeRange}`);
      // setAnalyticsData(response.data);
      
      // For now, we'll use mock data
      setTimeout(() => {
        setAnalyticsData({
          system: {
            systemUsage: generateSystemUsageData(),
            responseTime: generateResponseTimeData(),
            errorRate: generateErrorRateData(),
            serverLoad: generateServerLoadData()
          },
          users: {
            userGrowth: generateUserGrowthData(),
            userDistribution: generateUserDistributionData(),
            activeUsers: generateActiveUsersData(),
            userEngagement: generateUserEngagementData()
          },
          hospitals: {
            hospitalRegistrations: generateHospitalRegistrationsData(),
            hospitalDistribution: generateHospitalDistributionData(),
            appointmentTrends: generateAppointmentTrendsData(),
            patientSatisfaction: generatePatientSatisfactionData()
          },
          financial: {
            revenueTrends: generateRevenueTrendsData(),
            revenueByService: generateRevenueByServiceData(),
            monthlyRevenue: generateMonthlyRevenueData(),
            revenueByHospital: generateRevenueByHospitalData()
          }
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  // Mock data generators
  const generateSystemUsageData = () => {
    const data = [];
    const hours = timeRange === 'day' ? 24 : 12;
    
    for (let i = 0; i < hours; i++) {
      data.push({
        time: timeRange === 'day' ? `${i}:00` : `${i * 2}:00`,
        cpu: Math.floor(Math.random() * 40) + 20,
        memory: Math.floor(Math.random() * 30) + 30
      });
    }
    
    return data;
  };

  const generateResponseTimeData = () => {
    const data = [];
    const points = timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : 30;
    
    for (let i = 0; i < points; i++) {
      data.push({
        time: timeRange === 'day' ? `${i}:00` : timeRange === 'week' ? `Day ${i + 1}` : `Day ${i + 1}`,
        time: Math.floor(Math.random() * 100) + 50
      });
    }
    
    return data;
  };

  const generateErrorRateData = () => {
    const data = [];
    const points = timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : 12;
    
    for (let i = 0; i < points; i++) {
      data.push({
        date: timeRange === 'day' ? `${i}:00` : timeRange === 'week' ? `Day ${i + 1}` : `Month ${i + 1}`,
        errors: Math.floor(Math.random() * 10),
        warnings: Math.floor(Math.random() * 20) + 5
      });
    }
    
    return data;
  };

  const generateServerLoadData = () => {
    const data = [];
    const points = timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : 30;
    
    for (let i = 0; i < points; i++) {
      data.push({
        time: timeRange === 'day' ? `${i}:00` : timeRange === 'week' ? `Day ${i + 1}` : `Day ${i + 1}`,
        load: Math.floor(Math.random() * 50) + 20,
        connections: Math.floor(Math.random() * 500) + 100
      });
    }
    
    return data;
  };

  const generateUserGrowthData = () => {
    const data = [];
    const points = timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : 12;
    let patients = 1000;
    let doctors = 100;
    let admins = 20;
    
    for (let i = 0; i < points; i++) {
      patients += Math.floor(Math.random() * 50);
      doctors += Math.floor(Math.random() * 5);
      admins += Math.floor(Math.random() * 2);
      
      data.push({
        date: timeRange === 'day' ? `${i}:00` : timeRange === 'week' ? `Day ${i + 1}` : `Month ${i + 1}`,
        patients,
        doctors,
        admins
      });
    }
    
    return data;
  };

  const generateUserDistributionData = () => {
    return [
      { name: 'Patients', value: 4200 },
      { name: 'Doctors', value: 850 },
      { name: 'Nurses', value: 420 },
      { name: 'Admins', value: 120 },
      { name: 'Other', value: 252 }
    ];
  };

  const generateActiveUsersData = () => {
    const data = [];
    const points = timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : 30;
    
    for (let i = 0; i < points; i++) {
      data.push({
        date: timeRange === 'day' ? `${i}:00` : timeRange === 'week' ? `Day ${i + 1}` : `Day ${i + 1}`,
        daily: Math.floor(Math.random() * 500) + 1000,
        weekly: Math.floor(Math.random() * 1000) + 3000
      });
    }
    
    return data;
  };

  const generateUserEngagementData = () => {
    return [
      { feature: 'Dashboard', usage: Math.floor(Math.random() * 1000) + 3000 },
      { feature: 'Appointments', usage: Math.floor(Math.random() * 1000) + 2000 },
      { feature: 'Messages', usage: Math.floor(Math.random() * 1000) + 1500 },
      { feature: 'Health Records', usage: Math.floor(Math.random() * 1000) + 1000 },
      { feature: 'AI Assistant', usage: Math.floor(Math.random() * 1000) + 800 }
    ];
  };

  const generateHospitalRegistrationsData = () => {
    const data = [];
    const points = timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : 12;
    let count = 30;
    
    for (let i = 0; i < points; i++) {
      count += Math.floor(Math.random() * 3);
      
      data.push({
        date: timeRange === 'day' ? `${i}:00` : timeRange === 'week' ? `Day ${i + 1}` : `Month ${i + 1}`,
        count
      });
    }
    
    return data;
  };

  const generateHospitalDistributionData = () => {
    return [
      { name: 'General Hospital', value: 15 },
      { name: 'Specialty Clinic', value: 12 },
      { name: 'Medical Center', value: 8 },
      { name: 'Community Hospital', value: 5 },
      { name: 'Research Hospital', value: 2 }
    ];
  };

  const generateAppointmentTrendsData = () => {
    const data = [];
    const points = timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : 30;
    
    for (let i = 0; i < points; i++) {
      data.push({
        date: timeRange === 'day' ? `${i}:00` : timeRange === 'week' ? `Day ${i + 1}` : `Day ${i + 1}`,
        online: Math.floor(Math.random() * 100) + 50,
        inPerson: Math.floor(Math.random() * 150) + 100
      });
    }
    
    return data;
  };

  const generatePatientSatisfactionData = () => {
    return [
      { hospital: 'General Hospital', satisfaction: Math.floor(Math.random() * 20) + 75 },
      { hospital: 'Specialty Clinic', satisfaction: Math.floor(Math.random() * 20) + 75 },
      { hospital: 'Medical Center', satisfaction: Math.floor(Math.random() * 20) + 75 },
      { hospital: 'Community Hospital', satisfaction: Math.floor(Math.random() * 20) + 75 },
      { hospital: 'Research Hospital', satisfaction: Math.floor(Math.random() * 20) + 75 }
    ];
  };

  const generateRevenueTrendsData = () => {
    const data = [];
    const points = timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : 12;
    
    for (let i = 0; i < points; i++) {
      const revenue = Math.floor(Math.random() * 50000) + 100000;
      const expenses = Math.floor(revenue * (Math.random() * 0.3 + 0.5));
      
      data.push({
        date: timeRange === 'day' ? `${i}:00` : timeRange === 'week' ? `Day ${i + 1}` : `Month ${i + 1}`,
        revenue,
        expenses
      });
    }
    
    return data;
  };

  const generateRevenueByServiceData = () => {
    return [
      { name: 'Consultations', value: 450000 },
      { name: 'Procedures', value: 320000 },
      { name: 'Medications', value: 180000 },
      { name: 'Lab Tests', value: 150000 },
      { name: 'Other', value: 145890 }
    ];
  };

  const generateMonthlyRevenueData = () => {
    const data = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < months.length; i++) {
      const revenue = i < 8 ? Math.floor(Math.random() * 50000) + 100000 : 0;
      const target = Math.floor(revenue * (Math.random() * 0.2 + 0.9));
      
      data.push({
        month: months[i],
        revenue,
        target
      });
    }
    
    return data;
  };

  const generateRevenueByHospitalData = () => {
    return [
      { hospital: 'General Hospital', revenue: Math.floor(Math.random() * 200000) + 300000 },
      { hospital: 'Specialty Clinic', revenue: Math.floor(Math.random() * 150000) + 250000 },
      { hospital: 'Medical Center', revenue: Math.floor(Math.random() * 100000) + 200000 },
      { hospital: 'Community Hospital', revenue: Math.floor(Math.random() * 80000) + 150000 },
      { hospital: 'Research Hospital', revenue: Math.floor(Math.random() * 50000) + 100000 }
    ];
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
            <AnalyticsIcon
              sx={{
                fontSize: 40,
                color: theme.palette.primary.main,
                mr: 2,
                p: 0.5,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }}
            />
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Analytics Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Comprehensive analytics and insights for the SoulSpace platform
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ borderRadius: 2 }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<ShareIcon />}
              sx={{ borderRadius: 2 }}
            >
              Share
            </Button>
          </Box>
        </Box>

        {/* Tabs and Time Range Selector */}
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            mb: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              mb: { xs: 2, md: 0 },
              width: { xs: '100%', md: 'auto' }
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 100,
                }
              }}
            >
              <Tab label="Overview" />
              <Tab label="System" />
              <Tab label="Users" />
              <Tab label="Hospitals" />
              <Tab label="Financial" />
            </Tabs>
          </Paper>

          <TimeRangeSelector timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange} />
        </Box>

        {/* Analytics Content */}
        {tabValue === 0 && (
          <Box component={motion.div} variants={itemVariants}>
            <SystemPerformanceAnalytics data={analyticsData.system} timeRange={timeRange} />
            <UserAnalytics data={analyticsData.users} timeRange={timeRange} />
            <HospitalAnalytics data={analyticsData.hospitals} timeRange={timeRange} />
            <FinancialAnalytics data={analyticsData.financial} timeRange={timeRange} />
          </Box>
        )}

        {tabValue === 1 && (
          <Box component={motion.div} variants={itemVariants}>
            <SystemPerformanceAnalytics data={analyticsData.system} timeRange={timeRange} />
          </Box>
        )}

        {tabValue === 2 && (
          <Box component={motion.div} variants={itemVariants}>
            <UserAnalytics data={analyticsData.users} timeRange={timeRange} />
          </Box>
        )}

        {tabValue === 3 && (
          <Box component={motion.div} variants={itemVariants}>
            <HospitalAnalytics data={analyticsData.hospitals} timeRange={timeRange} />
          </Box>
        )}

        {tabValue === 4 && (
          <Box component={motion.div} variants={itemVariants}>
            <FinancialAnalytics data={analyticsData.financial} timeRange={timeRange} />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Analytics;
