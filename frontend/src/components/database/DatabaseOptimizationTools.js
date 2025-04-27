import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  alpha,
  Divider,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Tune as TuneIcon,
  Build as BuildIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const DatabaseOptimizationTools = () => {
  const theme = useTheme();
  const [openOptimizeDialog, setOpenOptimizeDialog] = useState(false);
  const [openIndexDialog, setOpenIndexDialog] = useState(false);
  const [optimizationInProgress, setOptimizationInProgress] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

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

  // Mock optimization tools data
  const optimizationTools = [
    {
      id: 'query-optimizer',
      name: 'Query Optimizer',
      description: 'Analyze and optimize slow-running queries',
      icon: <SpeedIcon />,
      status: 'Ready',
      lastRun: '2 days ago',
      color: theme.palette.primary.main,
    },
    {
      id: 'index-manager',
      name: 'Index Manager',
      description: 'Create, rebuild, or remove database indexes',
      icon: <StorageIcon />,
      status: 'Ready',
      lastRun: '5 days ago',
      color: theme.palette.info.main,
    },
    {
      id: 'vacuum',
      name: 'Database Vacuum',
      description: 'Reclaim storage and optimize database files',
      icon: <TuneIcon />,
      status: 'Ready',
      lastRun: '1 week ago',
      color: theme.palette.success.main,
    },
    {
      id: 'maintenance',
      name: 'Maintenance Tasks',
      description: 'Run routine database maintenance operations',
      icon: <BuildIcon />,
      status: 'Ready',
      lastRun: '3 days ago',
      color: theme.palette.warning.main,
    },
  ];

  // Mock optimization recommendations
  const optimizationRecommendations = [
    {
      id: 1,
      title: 'Create index on users.email',
      description: 'This will improve login and user lookup performance by approximately 65%',
      impact: 'High',
      impactColor: theme.palette.success.main,
      type: 'Index',
    },
    {
      id: 2,
      title: 'Optimize query on appointments collection',
      description: 'Current query is scanning all documents. Adding a compound index will reduce query time by 78%',
      impact: 'High',
      impactColor: theme.palette.success.main,
      type: 'Query',
    },
    {
      id: 3,
      title: 'Run vacuum on medical_records collection',
      description: 'Collection has 15% fragmentation. Vacuum will reclaim approximately 2.8GB of space',
      impact: 'Medium',
      impactColor: theme.palette.warning.main,
      type: 'Maintenance',
    },
    {
      id: 4,
      title: 'Remove unused index on notifications.read_status',
      description: 'This index is not being used and is consuming 450MB of space',
      impact: 'Low',
      impactColor: theme.palette.info.main,
      type: 'Index',
    },
  ];

  // Mock index data
  const indexData = [
    {
      name: 'users_email_idx',
      collection: 'users',
      fields: 'email',
      size: '12.5 MB',
      usage: 'High (5,240 queries/day)',
      status: 'Optimal',
    },
    {
      name: 'appointments_doctor_date_idx',
      collection: 'appointments',
      fields: 'doctor_id, date',
      size: '28.2 MB',
      usage: 'High (3,850 queries/day)',
      status: 'Optimal',
    },
    {
      name: 'medical_records_patient_idx',
      collection: 'medical_records',
      fields: 'patient_id',
      size: '45.8 MB',
      usage: 'Medium (1,250 queries/day)',
      status: 'Needs rebuild',
    },
    {
      name: 'notifications_user_idx',
      collection: 'notifications',
      fields: 'user_id',
      size: '18.4 MB',
      usage: 'High (4,120 queries/day)',
      status: 'Optimal',
    },
    {
      name: 'notifications_read_status_idx',
      collection: 'notifications',
      fields: 'read_status',
      size: '450 KB',
      usage: 'Low (120 queries/day)',
      status: 'Unused',
    },
  ];

  // Handle dialog open/close
  const handleOpenOptimizeDialog = () => {
    setOpenOptimizeDialog(true);
  };

  const handleCloseOptimizeDialog = () => {
    setOpenOptimizeDialog(false);
  };

  const handleOpenIndexDialog = () => {
    setOpenIndexDialog(true);
  };

  const handleCloseIndexDialog = () => {
    setOpenIndexDialog(false);
  };

  // Handle optimization start
  const handleStartOptimization = () => {
    setOptimizationInProgress(true);
    setOptimizationProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setOptimizationProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setOptimizationInProgress(false);
            handleCloseOptimizeDialog();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 800);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Optimal':
        return theme.palette.success.main;
      case 'Needs rebuild':
        return theme.palette.warning.main;
      case 'Unused':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Optimal':
        return <CheckCircleIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
      case 'Needs rebuild':
        return <WarningIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />;
      case 'Unused':
        return <ErrorIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
      default:
        return <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
    }
  };

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
          Database Optimization Tools
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Tools and recommendations to optimize database performance
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Optimization Tools */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Optimization Tools
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Refresh
                </Button>
              </Box>
              <List sx={{ p: 0 }}>
                {optimizationTools.map((tool) => (
                  <Paper
                    key={tool.id}
                    elevation={0}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(tool.color, 0.05),
                      border: `1px solid ${alpha(tool.color, 0.1)}`,
                    }}
                  >
                    <ListItem
                      disablePadding
                      secondaryAction={
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          sx={{
                            borderRadius: 2,
                            backgroundColor: tool.color,
                            '&:hover': {
                              backgroundColor: alpha(tool.color, 0.8),
                            },
                          }}
                          onClick={tool.id === 'index-manager' ? handleOpenIndexDialog : handleOpenOptimizeDialog}
                        >
                          Run
                        </Button>
                      }
                      sx={{ px: 0 }}
                    >
                      <ListItemIcon sx={{ color: tool.color, minWidth: 40 }}>
                        {tool.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight={600}>
                            {tool.name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {tool.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Chip
                                label={tool.status}
                                size="small"
                                color="success"
                                sx={{ height: 20, fontSize: '0.625rem', mr: 1 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Last run: {tool.lastRun}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            </Box>
          </Grid>

          {/* Optimization Recommendations */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Optimization Recommendations
                </Typography>
                <Chip
                  label="4 recommendations"
                  size="small"
                  color="warning"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
              <List sx={{ p: 0 }}>
                {optimizationRecommendations.map((recommendation) => (
                  <Paper
                    key={recommendation.id}
                    elevation={0}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.paper, 0.4),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <ListItem
                      disablePadding
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: 2 }}
                          onClick={handleOpenOptimizeDialog}
                        >
                          Apply
                        </Button>
                      }
                      sx={{ px: 0 }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {recommendation.title}
                            </Typography>
                            <Chip
                              label={recommendation.type}
                              size="small"
                              color="primary"
                              sx={{ ml: 1, height: 20, fontSize: '0.625rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {recommendation.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ mr: 1 }}>
                                Impact:
                              </Typography>
                              <Chip
                                label={recommendation.impact}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.625rem',
                                  backgroundColor: alpha(recommendation.impactColor, 0.1),
                                  color: recommendation.impactColor,
                                  border: `1px solid ${alpha(recommendation.impactColor, 0.2)}`,
                                }}
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            </Box>
          </Grid>
        </Grid>

        {/* Optimization Dialog */}
        <Dialog
          open={openOptimizeDialog}
          onClose={optimizationInProgress ? undefined : handleCloseOptimizeDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Database Optimization</DialogTitle>
          <DialogContent>
            {optimizationInProgress ? (
              <Box sx={{ width: '100%', mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Optimization in progress... Please do not close this dialog.
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={optimizationProgress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    mb: 2,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {optimizationProgress}% Complete
                </Typography>
              </Box>
            ) : (
              <>
                <DialogContentText sx={{ mb: 2 }}>
                  Running database optimization may temporarily affect database performance. It is recommended to run this during off-peak hours.
                </DialogContentText>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This operation may take several minutes to complete depending on the database size.
                </Alert>
                <Typography variant="subtitle2" gutterBottom>
                  The following tasks will be performed:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Analyze and optimize slow queries" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Rebuild fragmented indexes" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Reclaim unused space" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Update database statistics" />
                  </ListItem>
                </List>
              </>
            )}
          </DialogContent>
          {!optimizationInProgress && (
            <DialogActions>
              <Button onClick={handleCloseOptimizeDialog}>Cancel</Button>
              <Button onClick={handleStartOptimization} variant="contained" color="primary">
                Start Optimization
              </Button>
            </DialogActions>
          )}
        </Dialog>

        {/* Index Manager Dialog */}
        <Dialog
          open={openIndexDialog}
          onClose={handleCloseIndexDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Index Manager</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Manage database indexes to optimize query performance.
            </DialogContentText>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Indexes
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Collection</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fields</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Usage</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {indexData.map((index, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{index.name}</TableCell>
                        <TableCell>{index.collection}</TableCell>
                        <TableCell>{index.fields}</TableCell>
                        <TableCell>{index.size}</TableCell>
                        <TableCell>{index.usage}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getStatusIcon(index.status)}
                            <Typography variant="body2" sx={{ ml: 0.5, color: getStatusColor(index.status) }}>
                              {index.status}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex' }}>
                            <Tooltip title="Rebuild Index">
                              <IconButton size="small">
                                <RefreshIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Index">
                              <IconButton size="small">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button variant="outlined" startIcon={<RefreshIcon />}>
                Refresh
              </Button>
              <Button variant="contained" color="primary">
                Create New Index
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseIndexDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DatabaseOptimizationTools;
