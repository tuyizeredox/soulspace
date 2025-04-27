import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Import user activity components
import UserActivitySummary from '../../components/useractivity/UserActivitySummary';
import ActiveUsersChart from '../../components/useractivity/ActiveUsersChart';
import UserSessionsAnalytics from '../../components/useractivity/UserSessionsAnalytics';
import UserActionsList from '../../components/useractivity/UserActionsList';

const UserActivity = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

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
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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
            <PeopleIcon
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
                User Activity
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Comprehensive user activity monitoring and analytics
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

        {/* Tabs */}
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider',
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
                minWidth: 120,
              }
            }}
          >
            <Tab label="Overview" />
            <Tab label="Active Users" />
            <Tab label="Sessions" />
            <Tab label="Recent Actions" />
          </Tabs>
        </Box>

        {/* User Activity Content */}
        {tabValue === 0 && (
          <Box component={motion.div} variants={itemVariants}>
            <UserActivitySummary />
            <ActiveUsersChart />
            <UserSessionsAnalytics />
            <UserActionsList />
          </Box>
        )}

        {tabValue === 1 && (
          <Box component={motion.div} variants={itemVariants}>
            <ActiveUsersChart />
          </Box>
        )}

        {tabValue === 2 && (
          <Box component={motion.div} variants={itemVariants}>
            <UserSessionsAnalytics />
          </Box>
        )}

        {tabValue === 3 && (
          <Box component={motion.div} variants={itemVariants}>
            <UserActionsList />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default UserActivity;
