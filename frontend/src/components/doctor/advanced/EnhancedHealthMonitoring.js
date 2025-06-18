import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  Divider,
  useTheme,
  alpha,
  Skeleton,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  MonitorHeart as MonitorHeartIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Favorite as FavoriteIcon,
  Speed as SpeedIcon,
  Thermostat as ThermostatIcon,
  LocalHospital as LocalHospitalIcon,
  FitnessCenter as FitnessCenterIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ReportProblem as EmergencyIcon,
  Bluetooth as BluetoothIcon,
  Battery3Bar as BatteryIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, isToday, isYesterday, subHours } from 'date-fns';
import axios from '../../../utils/axiosConfig';

const EnhancedHealthMonitoring = () => {
  const theme = useTheme();
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [realTimeData, setRealTimeData] = useState({});
  const [monitoringSettings, setMonitoringSettings] = useState({
    realTimeUpdates: true,
    alertsEnabled: true,
    autoRefresh: true,
    refreshInterval: 30
  });
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch monitoring data
  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        setLoading(true);
        
        // Mock patients with real-time monitoring data
        const mockPatients = [
          {
            _id: '1',
            name: 'John Doe',
            age: 45,
            gender: 'Male',
            wearableDevice: {
              connected: true,
              deviceType: 'Apple Watch',
              lastSync: new Date(),
              batteryLevel: 85,
              signalStrength: 'Strong'
            },
            currentVitals: {
              heartRate: 72,
              bloodPressure: '120/80',
              temperature: 98.6,
              oxygenSaturation: 98,
              steps: 8500,
              sleep: 7.5,
              stress: 'Low'
            },
            alerts: [
              {
                id: 1,
                type: 'warning',
                message: 'Heart rate elevated for 10 minutes',
                timestamp: subHours(new Date(), 2),
                severity: 'medium'
              }
            ],
            trends: {
              heartRate: 'stable',
              bloodPressure: 'improving',
              activity: 'increasing'
            },
            riskLevel: 'Medium'
          },
          {
            _id: '2',
            name: 'Jane Smith',
            age: 32,
            gender: 'Female',
            wearableDevice: {
              connected: true,
              deviceType: 'Fitbit',
              lastSync: subHours(new Date(), 1),
              batteryLevel: 45,
              signalStrength: 'Good'
            },
            currentVitals: {
              heartRate: 68,
              bloodPressure: '115/75',
              temperature: 98.2,
              oxygenSaturation: 99,
              steps: 12000,
              sleep: 8,
              stress: 'Low'
            },
            alerts: [],
            trends: {
              heartRate: 'stable',
              bloodPressure: 'stable',
              activity: 'stable'
            },
            riskLevel: 'Low'
          },
          {
            _id: '3',
            name: 'Robert Johnson',
            age: 58,
            gender: 'Male',
            wearableDevice: {
              connected: false,
              deviceType: 'Samsung Galaxy Watch',
              lastSync: subHours(new Date(), 6),
              batteryLevel: 0,
              signalStrength: 'None'
            },
            currentVitals: {
              heartRate: null,
              bloodPressure: null,
              temperature: null,
              oxygenSaturation: null,
              steps: null,
              sleep: null,
              stress: null
            },
            alerts: [
              {
                id: 2,
                type: 'error',
                message: 'Device disconnected for 6 hours',
                timestamp: subHours(new Date(), 6),
                severity: 'high'
              }
            ],
            trends: {
              heartRate: 'unknown',
              bloodPressure: 'unknown',
              activity: 'unknown'
            },
            riskLevel: 'High'
          }
        ];

        setPatients(mockPatients);
        
        // Set alerts
        const allAlerts = mockPatients.flatMap(patient => 
          patient.alerts.map(alert => ({
            ...alert,
            patientName: patient.name,
            patientId: patient._id
          }))
        );
        setAlerts(allAlerts);

      } catch (error) {
        console.error('Error fetching monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonitoringData();
  }, []);

  // Real-time data simulation
  useEffect(() => {
    if (!monitoringSettings.realTimeUpdates || !monitoringSettings.autoRefresh) return;

    const interval = setInterval(() => {
      setPatients(prev => prev.map(patient => {
        if (!patient.wearableDevice.connected) return patient;

        return {
          ...patient,
          currentVitals: {
            ...patient.currentVitals,
            heartRate: patient.currentVitals.heartRate + Math.floor(Math.random() * 6) - 3,
            steps: patient.currentVitals.steps + Math.floor(Math.random() * 100)
          }
        };
      }));
    }, monitoringSettings.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [monitoringSettings]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      switch (filterStatus) {
        case 'connected':
          return patient.wearableDevice.connected;
        case 'disconnected':
          return !patient.wearableDevice.connected;
        case 'alerts':
          return patient.alerts.length > 0;
        case 'high-risk':
          return patient.riskLevel === 'High';
        default:
          return true;
      }
    });
  }, [patients, filterStatus]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'low': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'high': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
      case 'improving':
        return <TrendingUpIcon color="success" />;
      case 'decreasing':
      case 'declining':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingUpIcon color="disabled" />;
    }
  };

  // Get alert severity color
  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  // Handle patient monitoring
  const handlePatientMonitor = (patient) => {
    setSelectedPatient(patient);
    setShowPatientDialog(true);
    
    // Generate real-time data for the selected patient
    const mockRealTimeData = {
      heartRate: Array.from({ length: 20 }, (_, i) => ({
        time: format(subHours(new Date(), 20 - i), 'HH:mm'),
        value: Math.floor(Math.random() * 20) + 60
      })),
      bloodPressure: Array.from({ length: 10 }, (_, i) => ({
        time: format(subHours(new Date(), 10 - i), 'HH:mm'),
        systolic: Math.floor(Math.random() * 30) + 110,
        diastolic: Math.floor(Math.random() * 20) + 70
      })),
      activity: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        steps: Math.floor(Math.random() * 500) + 100
      }))
    };
    
    setRealTimeData(mockRealTimeData);
  };

  // Render patient monitoring card
  const renderPatientCard = (patient) => {
    const isConnected = patient.wearableDevice.connected;
    const hasAlerts = patient.alerts.length > 0;
    
    return (
      <Card
        key={patient._id}
        sx={{
          mb: 2,
          borderRadius: 3,
          border: hasAlerts ? `2px solid ${theme.palette.warning.main}` : 'none',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8]
          }
        }}
        onClick={() => handlePatientMonitor(patient)}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Badge
              badgeContent={patient.alerts.length}
              color="error"
              invisible={!hasAlerts}
            >
              <Avatar
                sx={{
                  width: 50,
                  height: 50,
                  mr: 2,
                  bgcolor: getStatusColor(patient.riskLevel)
                }}
              >
                {patient.name.charAt(0)}
              </Avatar>
            </Badge>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {patient.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {patient.age} years • {patient.gender}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Chip
                  label={patient.riskLevel}
                  size="small"
                  sx={{
                    bgcolor: alpha(getStatusColor(patient.riskLevel), 0.1),
                    color: getStatusColor(patient.riskLevel),
                    fontWeight: 600
                  }}
                />
                <Chip
                  icon={isConnected ? <BluetoothIcon /> : <WarningIcon />}
                  label={isConnected ? 'Connected' : 'Disconnected'}
                  size="small"
                  color={isConnected ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Last sync
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {format(patient.wearableDevice.lastSync, 'HH:mm')}
              </Typography>
            </Box>
          </Box>

          {/* Device Status */}
          <Box sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.grey[500], 0.1), borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {patient.wearableDevice.deviceType}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BatteryIcon color={patient.wearableDevice.batteryLevel > 20 ? 'success' : 'error'} />
                <Typography variant="caption">
                  {patient.wearableDevice.batteryLevel}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Signal: {patient.wearableDevice.signalStrength}
            </Typography>
          </Box>

          {/* Current Vitals */}
          {isConnected && patient.currentVitals.heartRate ? (
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <FavoriteIcon color="error" sx={{ mb: 0.5 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {patient.currentVitals.heartRate}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    BPM
                  </Typography>
                  {getTrendIcon(patient.trends.heartRate)}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <SpeedIcon color="primary" sx={{ mb: 0.5 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {patient.currentVitals.bloodPressure}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    BP
                  </Typography>
                  {getTrendIcon(patient.trends.bloodPressure)}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <FitnessCenterIcon color="success" sx={{ mb: 0.5 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {patient.currentVitals.steps?.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Steps
                  </Typography>
                  {getTrendIcon(patient.trends.activity)}
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="warning" sx={{ mt: 1 }}>
              No real-time data available - Device disconnected
            </Alert>
          )}

          {/* Alerts */}
          {hasAlerts && (
            <Box sx={{ mt: 2 }}>
              {patient.alerts.slice(0, 2).map((alert) => (
                <Alert
                  key={alert.id}
                  severity={getAlertColor(alert.severity)}
                  sx={{ mb: 1, fontSize: '0.875rem' }}
                >
                  {alert.message}
                </Alert>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 2 }} />
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rectangular" height={250} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Health Monitoring Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Real-time monitoring of patient health data from wearable devices
          </Typography>

          {/* Controls */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['all', 'connected', 'disconnected', 'alerts', 'high-risk'].map((filter) => (
                  <Chip
                    key={filter}
                    label={filter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    onClick={() => setFilterStatus(filter)}
                    color={filterStatus === filter ? 'primary' : 'default'}
                    variant={filterStatus === filter ? 'filled' : 'outlined'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={monitoringSettings.realTimeUpdates}
                      onChange={(e) => setMonitoringSettings(prev => ({
                        ...prev,
                        realTimeUpdates: e.target.checked
                      }))}
                    />
                  }
                  label="Real-time Updates"
                />
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => window.location.reload()}
                  sx={{ borderRadius: 2 }}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MonitorHeartIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight={700}>
                    {patients.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Patients
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight={700}>
                    {patients.filter(p => p.wearableDevice.connected).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connected Devices
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <WarningIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight={700}>
                    {alerts.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Alerts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EmergencyIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight={700}>
                    {patients.filter(p => p.riskLevel === 'High').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Risk Patients
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </motion.div>

      {/* Patients Monitoring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {filteredPatients.length > 0 ? (
          <Grid container spacing={2}>
            {filteredPatients.map((patient) => (
              <Grid item xs={12} lg={6} key={patient._id}>
                {renderPatientCard(patient)}
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <MonitorHeartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Patients Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No patients match the current filter criteria
              </Typography>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Patient Monitoring Dialog */}
      <Dialog
        open={showPatientDialog}
        onClose={() => setShowPatientDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{ width: 50, height: 50, bgcolor: theme.palette.primary.main }}
              >
                {selectedPatient?.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  {selectedPatient?.name} - Real-time Monitoring
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPatient?.wearableDevice?.deviceType} • Last sync: {format(selectedPatient?.wearableDevice?.lastSync || new Date(), 'HH:mm')}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setShowPatientDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
          >
            <Tab label="Real-time Data" />
            <Tab label="Trends" />
            <Tab label="Alerts" />
            <Tab label="Device Status" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Real-time Data Tab */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Heart Rate (Last 20 Hours)
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={realTimeData.heartRate}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="value" stroke={theme.palette.error.main} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Blood Pressure Trends
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={realTimeData.bloodPressure}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="systolic" stroke={theme.palette.primary.main} strokeWidth={2} />
                          <Line type="monotone" dataKey="diastolic" stroke={theme.palette.secondary.main} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Hourly Activity
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={realTimeData.activity}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="steps" fill={theme.palette.success.main} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Other tabs content would go here */}
            {activeTab === 1 && (
              <Alert severity="info">
                Trends analysis coming soon...
              </Alert>
            )}

            {activeTab === 2 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Patient Alerts
                  </Typography>
                  {selectedPatient?.alerts?.length > 0 ? (
                    <List>
                      {selectedPatient.alerts.map((alert) => (
                        <ListItem key={alert.id}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: theme.palette[getAlertColor(alert.severity)].main }}>
                              <WarningIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={alert.message}
                            secondary={format(alert.timestamp, 'MMM dd, yyyy HH:mm')}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="success">
                      No active alerts for this patient
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 3 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Device Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <List>
                        <ListItem>
                          <ListItemText primary="Device Type" secondary={selectedPatient?.wearableDevice?.deviceType} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Connection Status" secondary={selectedPatient?.wearableDevice?.connected ? 'Connected' : 'Disconnected'} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Battery Level" secondary={`${selectedPatient?.wearableDevice?.batteryLevel}%`} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Signal Strength" secondary={selectedPatient?.wearableDevice?.signalStrength} />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EnhancedHealthMonitoring;