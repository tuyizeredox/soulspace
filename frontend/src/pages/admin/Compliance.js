import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Alert,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
  Tooltip,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  VerifiedUser as VerifiedUserIcon,
  Assignment as AssignmentIcon,
  Policy as PolicyIcon,
  History as HistoryIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';

// Import compliance components
import ComplianceOverview from '../../components/compliance/ComplianceOverview';
import AuditLogs from '../../components/compliance/AuditLogs';
import ComplianceReports from '../../components/compliance/ComplianceReports';
import CompliancePolicies from '../../components/compliance/CompliancePolicies';

const Compliance = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for compliance overview
  const [complianceData, setComplianceData] = useState({
    overallScore: 92,
    overallStatus: 'compliant',
    scoreChange: 3,
    lastAssessment: '2023-07-15',
    categories: [
      { name: 'Privacy Rule', score: 95, status: 'compliant' },
      { name: 'Security Rule', score: 88, status: 'compliant' },
      { name: 'Breach Notification', score: 100, status: 'compliant' },
      { name: 'Patient Rights', score: 85, status: 'warning' },
    ],
    alerts: [
      {
        id: 1,
        title: 'Security Rule Vulnerability',
        description: 'Potential vulnerability in data encryption for archived patient records.',
        severity: 'warning',
        detectedDate: '2023-07-10'
      },
      {
        id: 2,
        title: 'Patient Rights Documentation',
        description: 'Patient rights documentation needs to be updated to comply with latest regulations.',
        severity: 'warning',
        detectedDate: '2023-07-08'
      }
    ]
  });

  // Mock data for audit logs
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      timestamp: '2023-07-15 14:32:45',
      user: 'Dr. Sarah Johnson',
      action: 'Patient Record Access',
      category: 'access',
      status: 'success',
      details: 'Accessed patient #12345 medical history'
    },
    {
      id: 2,
      timestamp: '2023-07-15 13:15:22',
      user: 'Admin User',
      action: 'System Configuration Change',
      category: 'system',
      status: 'success',
      details: 'Updated security settings for user authentication'
    },
    {
      id: 3,
      timestamp: '2023-07-15 11:05:17',
      user: 'John Smith',
      action: 'Failed Login Attempt',
      category: 'security',
      status: 'error',
      details: 'Multiple failed login attempts from IP 192.168.1.105'
    },
    {
      id: 4,
      timestamp: '2023-07-14 16:42:31',
      user: 'System',
      action: 'Automated Backup',
      category: 'data',
      status: 'success',
      details: 'Daily backup completed successfully'
    },
    {
      id: 5,
      timestamp: '2023-07-14 15:22:10',
      user: 'Dr. Michael Lee',
      action: 'Patient Data Export',
      category: 'data',
      status: 'warning',
      details: 'Exported patient data for research purposes'
    },
    {
      id: 6,
      timestamp: '2023-07-14 14:10:05',
      user: 'Nurse Emily Chen',
      action: 'Medication Administration',
      category: 'access',
      status: 'success',
      details: 'Administered medication to patient #54321'
    },
    {
      id: 7,
      timestamp: '2023-07-14 10:45:33',
      user: 'Admin User',
      action: 'User Role Update',
      category: 'user',
      status: 'success',
      details: 'Updated role permissions for Nurse group'
    },
    {
      id: 8,
      timestamp: '2023-07-13 17:30:22',
      user: 'System',
      action: 'Security Scan',
      category: 'security',
      status: 'warning',
      details: 'Vulnerability detected in third-party integration'
    },
    {
      id: 9,
      timestamp: '2023-07-13 14:15:40',
      user: 'Dr. Sarah Johnson',
      action: 'Patient Record Update',
      category: 'data',
      status: 'success',
      details: 'Updated treatment plan for patient #12345'
    },
    {
      id: 10,
      timestamp: '2023-07-13 11:05:17',
      user: 'Admin User',
      action: 'System Update',
      category: 'system',
      status: 'success',
      details: 'Applied security patches to server'
    },
    {
      id: 11,
      timestamp: '2023-07-12 16:42:31',
      user: 'System',
      action: 'Automated Backup',
      category: 'data',
      status: 'success',
      details: 'Daily backup completed successfully'
    },
    {
      id: 12,
      timestamp: '2023-07-12 15:22:10',
      user: 'Dr. Michael Lee',
      action: 'Patient Discharge',
      category: 'access',
      status: 'success',
      details: 'Discharged patient #67890'
    }
  ]);

  // Mock data for compliance reports
  const [reports, setReports] = useState([
    {
      id: 1,
      title: 'Quarterly HIPAA Compliance Report',
      description: 'Comprehensive assessment of HIPAA compliance across all systems and processes.',
      type: 'hipaa',
      status: 'compliant',
      date: '2023-07-01',
      scheduled: true
    },
    {
      id: 2,
      title: 'Security Vulnerability Assessment',
      description: 'Detailed analysis of security vulnerabilities and remediation recommendations.',
      type: 'security',
      status: 'warning',
      date: '2023-06-15',
      scheduled: false
    },
    {
      id: 3,
      title: 'Patient Data Access Audit',
      description: 'Audit of all patient data access events for the past month.',
      type: 'access',
      status: 'compliant',
      date: '2023-06-01',
      scheduled: true
    },
    {
      id: 4,
      title: 'Data Protection Impact Assessment',
      description: 'Assessment of data protection measures and potential risks.',
      type: 'data',
      status: 'compliant',
      date: '2023-05-15',
      scheduled: false
    },
    {
      id: 5,
      title: 'Monthly HIPAA Training Compliance',
      description: 'Report on staff HIPAA training completion and compliance.',
      type: 'hipaa',
      status: 'warning',
      date: '2023-05-01',
      scheduled: true
    }
  ]);

  // Mock data for compliance policies
  const [policies, setPolicies] = useState([
    {
      id: 1,
      title: 'HIPAA Privacy Policy',
      description: 'Guidelines for handling protected health information (PHI) in compliance with HIPAA Privacy Rule.',
      category: 'hipaa',
      status: 'active',
      lastUpdated: '2023-06-15'
    },
    {
      id: 2,
      title: 'Data Breach Response Plan',
      description: 'Procedures for responding to data breaches and notifying affected parties.',
      category: 'security',
      status: 'active',
      lastUpdated: '2023-05-20'
    },
    {
      id: 3,
      title: 'Patient Rights and Access Policy',
      description: 'Guidelines for ensuring patient rights to access their health information.',
      category: 'privacy',
      status: 'pending',
      lastUpdated: '2023-07-10'
    },
    {
      id: 4,
      title: 'Security Risk Assessment Policy',
      description: 'Procedures for conducting regular security risk assessments.',
      category: 'security',
      status: 'active',
      lastUpdated: '2023-04-05'
    },
    {
      id: 5,
      title: 'Business Associate Agreement Policy',
      description: 'Guidelines for establishing agreements with business associates handling PHI.',
      category: 'hipaa',
      status: 'active',
      lastUpdated: '2023-03-22'
    }
  ]);

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Refresh compliance data
  const refreshComplianceData = useCallback(async () => {
    setRefreshing(true);
    
    // In a real application, you would fetch data from your API here
    // For now, we'll just simulate a refresh with a timeout
    
    setTimeout(() => {
      // Update with slightly different data to simulate a refresh
      setComplianceData(prev => ({
        ...prev,
        overallScore: Math.min(100, prev.overallScore + (Math.random() > 0.5 ? 1 : -1)),
        scoreChange: prev.scoreChange + (Math.random() > 0.5 ? 1 : 0),
        categories: prev.categories.map(cat => ({
          ...cat,
          score: Math.min(100, cat.score + (Math.random() > 0.7 ? 2 : -1))
        }))
      }));
      
      setRefreshing(false);
    }, 800);
  }, []);

  // Refresh audit logs
  const refreshAuditLogs = useCallback(() => {
    setRefreshing(true);
    
    // Simulate new log entries
    setTimeout(() => {
      const newLog = {
        id: auditLogs.length + 1,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'System',
        action: 'Compliance Check',
        category: 'system',
        status: 'success',
        details: 'Automated compliance check completed'
      };
      
      setAuditLogs([newLog, ...auditLogs]);
      setRefreshing(false);
    }, 800);
  }, [auditLogs]);

  // Refresh reports
  const refreshReports = useCallback(() => {
    setRefreshing(true);
    
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  // Refresh policies
  const refreshPolicies = useCallback(() => {
    setRefreshing(true);
    
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  // Initial data fetch
  useEffect(() => {
    // In a real application, you would fetch data from your API here
    setLoading(false);
  }, []);

  return (
    <Container maxWidth="xl">
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component={RouterLink}
            to="/admin/dashboard"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon fontSize="small" sx={{ mr: 0.5 }} />
            Compliance
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Compliance Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Monitor and manage HIPAA compliance, audit logs, and security policies
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refreshComplianceData}
              disabled={refreshing}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AssignmentIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              Generate Report
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Tabs */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
            mb: 4
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              px: 3,
              pt: 2,
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 3,
                py: 2,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem'
              }
            }}
          >
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview" />
            <Tab icon={<HistoryIcon />} iconPosition="start" label="Audit Logs" />
            <Tab icon={<AssignmentIcon />} iconPosition="start" label="Reports" />
            <Tab icon={<PolicyIcon />} iconPosition="start" label="Policies" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box sx={{ mb: 4 }}>
          {tabValue === 0 && (
            <ComplianceOverview
              complianceData={complianceData}
              onRefresh={refreshComplianceData}
            />
          )}
          {tabValue === 1 && (
            <AuditLogs
              auditLogs={auditLogs}
              onRefresh={refreshAuditLogs}
            />
          )}
          {tabValue === 2 && (
            <ComplianceReports
              reports={reports}
              onRefresh={refreshReports}
            />
          )}
          {tabValue === 3 && (
            <CompliancePolicies
              policies={policies}
              onRefresh={refreshPolicies}
            />
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Compliance;
