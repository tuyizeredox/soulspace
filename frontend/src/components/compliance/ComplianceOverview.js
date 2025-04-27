import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Divider,
  Button,
  useTheme,
  alpha,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ComplianceOverview = ({ complianceData, onRefresh }) => {
  const theme = useTheme();

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case 'non-compliant':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <InfoIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'non-compliant':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
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
            HIPAA Compliance Overview
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download Compliance Report">
              <IconButton
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Compliance Data">
              <IconButton
                size="small"
                onClick={onRefresh}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Overall Compliance Score */}
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Overall Compliance Score
                </Typography>
                <Chip
                  label={complianceData.overallStatus.toUpperCase()}
                  size="small"
                  icon={getStatusIcon(complianceData.overallStatus)}
                  sx={{
                    bgcolor: alpha(getStatusColor(complianceData.overallStatus), 0.1),
                    color: getStatusColor(complianceData.overallStatus),
                    fontWeight: 600
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h3" fontWeight={700} sx={{ mr: 1 }}>
                  {complianceData.overallScore}%
                </Typography>
                <Chip
                  label={`+${complianceData.scoreChange}%`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={complianceData.overallScore}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: getStatusColor(complianceData.overallStatus)
                  },
                  mb: 1
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Last assessment: {complianceData.lastAssessment}
              </Typography>
            </Box>
          </Grid>

          {/* Compliance Categories */}
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                height: '100%'
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Compliance Categories
              </Typography>
              {complianceData.categories.map((category, index) => (
                <Box key={index} sx={{ mb: index < complianceData.categories.length - 1 ? 2 : 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {category.score}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={category.score}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        bgcolor: getStatusColor(category.status)
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Compliance Alerts */}
          <Grid item xs={12} component={motion.div} variants={itemVariants}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Compliance Alerts
              </Typography>
              <Grid container spacing={2}>
                {complianceData.alerts.map((alert, index) => (
                  <Grid item xs={12} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(getStatusColor(alert.severity), 0.05),
                        border: `1px solid ${alpha(getStatusColor(alert.severity), 0.2)}`
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getStatusIcon(alert.severity)}
                        <Typography variant="subtitle2" fontWeight={600} sx={{ ml: 1 }}>
                          {alert.title}
                        </Typography>
                        <Chip
                          label={alert.severity.toUpperCase()}
                          size="small"
                          sx={{
                            ml: 'auto',
                            bgcolor: alpha(getStatusColor(alert.severity), 0.1),
                            color: getStatusColor(alert.severity),
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {alert.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Detected: {alert.detectedDate}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500
                          }}
                        >
                          Resolve
                        </Button>
                      </Box>
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

export default ComplianceOverview;
