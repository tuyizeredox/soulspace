import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Divider,
  useTheme,
  alpha,
  Skeleton,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  MonitorHeart as MonitorHeartIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Favorite as FavoriteIcon,
  Speed as SpeedIcon,
  Thermostat as ThermostatIcon,
  LocalHospital as BloodtypeIcon,
  FitnessCenter as FitnessCenterIcon,
  LocalHospital as LocalHospitalIcon,
  Medication as MedicationIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Chat as ChatIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarTodayIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { format, subDays, isToday, isYesterday } from 'date-fns';
import axios from '../../../utils/axiosConfig';

const EnhancedPatientManagement = () => {
  const theme = useTheme();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [wearableData, setWearableData] = useState({});
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  // Fetch patients data
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/doctors/my-patients');
        
        // Mock enhanced patient data with wearable device info
        const enhancedPatients = (response.data || []).map(patient => ({
          ...patient,
          wearableDevice: {
            connected: Math.random() > 0.3,
            deviceType: ['Apple Watch', 'Fitbit', 'Samsung Galaxy Watch', 'Garmin'][Math.floor(Math.random() * 4)],
            lastSync: new Date(Date.now() - Math.random() * 86400000 * 2),
            batteryLevel: Math.floor(Math.random() * 100),
            dataQuality: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)]
          },
          healthStatus: {
            riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
            lastCheckup: new Date(Date.now() - Math.random() * 86400000 * 30),
            nextAppointment: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 86400000 * 14) : null,
            chronicConditions: Math.random() > 0.7 ? ['Hypertension', 'Diabetes'][Math.floor(Math.random() * 2)] : null
          },
          currentVitals: {
            heartRate: Math.floor(Math.random() * 40) + 60,
            bloodPressure: `${Math.floor(Math.random() * 40) + 110}/${Math.floor(Math.random() * 20) + 70}`,
            temperature: (Math.random() * 2 + 97).toFixed(1),
            oxygenSaturation: Math.floor(Math.random() * 5) + 95,
            steps: Math.floor(Math.random() * 10000) + 2000,
            sleep: Math.floor(Math.random() * 4) + 6
          }
        }));
        
        setPatients(enhancedPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
        // Set mock data for development
        setPatients([
          {
            _id: '1',
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1234567890',
            age: 45,
            gender: 'Male',
            profile: { avatar: null },
            wearableDevice: {
              connected: true,
              deviceType: 'Apple Watch',
              lastSync: new Date(),
              batteryLevel: 85,
              dataQuality: 'Excellent'
            },
            healthStatus: {
              riskLevel: 'Medium',
              lastCheckup: subDays(new Date(), 15),
              nextAppointment: new Date(Date.now() + 86400000 * 7),
              chronicConditions: 'Hypertension'
            },
            currentVitals: {
              heartRate: 72,
              bloodPressure: '120/80',
              temperature: '98.6',
              oxygenSaturation: 98,
              steps: 8500,
              sleep: 7.5
            }
          },
          {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            phone: '+1234567891',
            age: 32,
            gender: 'Female',
            profile: { avatar: null },
            wearableDevice: {
              connected: true,
              deviceType: 'Fitbit',
              lastSync: subDays(new Date(), 1),
              batteryLevel: 45,
              dataQuality: 'Good'
            },
            healthStatus: {
              riskLevel: 'Low',
              lastCheckup: subDays(new Date(), 30),
              nextAppointment: null,
              chronicConditions: null
            },
            currentVitals: {
              heartRate: 68,
              bloodPressure: '115/75',
              temperature: '98.2',
              oxygenSaturation: 99,
              steps: 12000,
              sleep: 8
            }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'connected' && patient.wearableDevice?.connected) ||
                           (filterStatus === 'high-risk' && patient.healthStatus?.riskLevel === 'High') ||
                           (filterStatus === 'needs-checkup' && patient.healthStatus?.nextAppointment);
      
      return matchesSearch && matchesFilter;
    });
  }, [patients, searchTerm, filterStatus]);

  // Fetch patient prescriptions
  const fetchPatientPrescriptions = async (patientId) => {
    if (!patientId) return;
    
    try {
      setLoadingPrescriptions(true);
      
      // Fetch patient's prescriptions
      const prescriptionsResponse = await axios.get(`/api/prescriptions/patient/${patientId}`);
      const prescriptions = prescriptionsResponse.data || [];
      
      // Sort prescriptions by date (newest first)
      const sortedPrescriptions = prescriptions.sort((a, b) => 
        new Date(b.createdDate || b.createdAt) - new Date(a.createdDate || a.createdAt)
      );
      
      setPatientPrescriptions(sortedPrescriptions);
      
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
      setPatientPrescriptions([]);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  // Handle patient selection
  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);
    setShowPatientDialog(true);
    
    // Fetch patient prescriptions
    await fetchPatientPrescriptions(patient._id || patient.id);
    
    // Fetch detailed patient data
    try {
      // Mock wearable data
      const mockWearableData = {
        heartRate: Array.from({ length: 24 }, (_, i) => ({
          time: format(new Date(Date.now() - (23 - i) * 3600000), 'HH:mm'),
          value: Math.floor(Math.random() * 40) + 60
        })),
        steps: Array.from({ length: 7 }, (_, i) => ({
          day: format(subDays(new Date(), 6 - i), 'MMM dd'),
          value: Math.floor(Math.random() * 10000) + 2000
        })),
        sleep: Array.from({ length: 7 }, (_, i) => ({
          day: format(subDays(new Date(), 6 - i), 'MMM dd'),
          value: Math.floor(Math.random() * 4) + 6
        }))
      };
      
      setWearableData(mockWearableData);
      
      // Mock medical history
      setMedicalHistory([
        {
          date: subDays(new Date(), 15),
          type: 'Consultation',
          diagnosis: 'Hypertension monitoring',
          notes: 'Blood pressure stable, continue medication'
        },
        {
          date: subDays(new Date(), 45),
          type: 'Lab Results',
          diagnosis: 'Routine blood work',
          notes: 'All values within normal range'
        }
      ]);
      
      // Mock vitals history
      setVitalsHistory([
        { date: 'Today', heartRate: 72, bp: '120/80', temp: 98.6, spo2: 98 },
        { date: 'Yesterday', heartRate: 75, bp: '118/78', temp: 98.4, spo2: 97 },
        { date: '2 days ago', heartRate: 70, bp: '122/82', temp: 98.8, spo2: 98 }
      ]);
      
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'low': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'high': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  // Get device status
  const getDeviceStatus = (device) => {
    if (!device?.connected) return { color: 'error', text: 'Disconnected' };
    if (device.batteryLevel < 20) return { color: 'warning', text: 'Low Battery' };
    return { color: 'success', text: 'Connected' };
  };

  // Render patient card
  const renderPatientCard = (patient) => {
    const deviceStatus = getDeviceStatus(patient.wearableDevice);
    
    return (
      <Card
        key={patient._id}
        sx={{
          mb: 2,
          borderRadius: 3,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8]
          }
        }}
        onClick={() => handlePatientSelect(patient)}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={patient.profile?.avatar}
              sx={{
                width: 60,
                height: 60,
                mr: 2,
                bgcolor: theme.palette.primary.main
              }}
            >
              {patient.name?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {patient.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {patient.age} years • {patient.gender}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Chip
                  label={patient.healthStatus?.riskLevel || 'Unknown'}
                  size="small"
                  sx={{
                    bgcolor: alpha(getStatusColor(patient.healthStatus?.riskLevel), 0.1),
                    color: getStatusColor(patient.healthStatus?.riskLevel),
                    fontWeight: 600
                  }}
                />
                <Chip
                  icon={<MonitorHeartIcon />}
                  label={deviceStatus.text}
                  size="small"
                  color={deviceStatus.color}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          {/* Current Vitals */}
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <FavoriteIcon color="error" sx={{ mb: 0.5 }} />
                <Typography variant="h6" fontWeight={600}>
                  {patient.currentVitals?.heartRate}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  BPM
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <SpeedIcon color="primary" sx={{ mb: 0.5 }} />
                <Typography variant="h6" fontWeight={600}>
                  {patient.currentVitals?.bloodPressure}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  BP
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <ThermostatIcon color="warning" sx={{ mb: 0.5 }} />
                <Typography variant="h6" fontWeight={600}>
                  {patient.currentVitals?.temperature}°F
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Temp
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <FitnessCenterIcon color="success" sx={{ mb: 0.5 }} />
                <Typography variant="h6" fontWeight={600}>
                  {patient.currentVitals?.steps?.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Steps
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 2 }} />
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
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
            Patient Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Monitor your patients' health data, wearable devices, and medical history
          </Typography>

          {/* Search and Filters */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['all', 'connected', 'high-risk', 'needs-checkup'].map((filter) => (
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
          </Grid>
        </Box>
      </motion.div>

      {/* Patients List */}
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
              <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Patients Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try adjusting your search criteria' : 'No patients assigned to you yet'}
              </Typography>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Patient Details Dialog */}
      <Dialog
        open={showPatientDialog}
        onClose={() => {
          setShowPatientDialog(false);
          setSelectedPatient(null);
          setPatientPrescriptions([]);
          setActiveTab(0);
        }}
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
                src={selectedPatient?.profile?.avatar}
                sx={{ width: 50, height: 50, bgcolor: theme.palette.primary.main }}
              >
                {selectedPatient?.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  {selectedPatient?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Patient ID: {selectedPatient?._id?.slice(-8)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary">
                <ChatIcon />
              </IconButton>
              <IconButton color="primary">
                <VideoCallIcon />
              </IconButton>
              <IconButton color="primary">
                <PhoneIcon />
              </IconButton>
              <IconButton onClick={() => {
                setShowPatientDialog(false);
                setSelectedPatient(null);
                setPatientPrescriptions([]);
                setActiveTab(0);
              }}>
                <CloseIcon />
              </IconButton>
            </Box>
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
            <Tab label="Overview" />
            <Tab label="Wearable Data" />
            <Tab label="Vitals History" />
            <Tab label="Medical Records" />
            <Tab label="Medications" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Overview Tab */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                {/* Patient Info */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Patient Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Age" secondary={`${selectedPatient?.age} years`} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Gender" secondary={selectedPatient?.gender} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Email" secondary={selectedPatient?.email} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Phone" secondary={selectedPatient?.phone} />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Risk Level" 
                            secondary={
                              <Chip
                                label={selectedPatient?.healthStatus?.riskLevel}
                                size="small"
                                sx={{
                                  bgcolor: alpha(getStatusColor(selectedPatient?.healthStatus?.riskLevel), 0.1),
                                  color: getStatusColor(selectedPatient?.healthStatus?.riskLevel)
                                }}
                              />
                            }
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Current Vitals */}
                <Grid item xs={12} md={8}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Current Vitals
                      </Typography>
                      <Grid container spacing={2}>
                        {[
                          { label: 'Heart Rate', value: selectedPatient?.currentVitals?.heartRate, unit: 'BPM', icon: <FavoriteIcon />, color: 'error' },
                          { label: 'Blood Pressure', value: selectedPatient?.currentVitals?.bloodPressure, unit: '', icon: <SpeedIcon />, color: 'primary' },
                          { label: 'Temperature', value: selectedPatient?.currentVitals?.temperature, unit: '°F', icon: <ThermostatIcon />, color: 'warning' },
                          { label: 'Oxygen Sat', value: selectedPatient?.currentVitals?.oxygenSaturation, unit: '%', icon: <LocalHospitalIcon />, color: 'info' },
                          { label: 'Steps Today', value: selectedPatient?.currentVitals?.steps?.toLocaleString(), unit: '', icon: <FitnessCenterIcon />, color: 'success' },
                          { label: 'Sleep', value: selectedPatient?.currentVitals?.sleep, unit: 'hrs', icon: <TimelineIcon />, color: 'secondary' }
                        ].map((vital) => (
                          <Grid item xs={6} md={4} key={vital.label}>
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette[vital.color].main, 0.1),
                                textAlign: 'center'
                              }}
                            >
                              <Box sx={{ color: theme.palette[vital.color].main, mb: 1 }}>
                                {vital.icon}
                              </Box>
                              <Typography variant="h5" fontWeight={600}>
                                {vital.value} {vital.unit}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {vital.label}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Wearable Device Status */}
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Wearable Device Status
                      </Typography>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MonitorHeartIcon color="primary" />
                            <Box>
                              <Typography variant="subtitle2">
                                {selectedPatient?.wearableDevice?.deviceType}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Device Type
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box>
                            <Typography variant="subtitle2">
                              {selectedPatient?.wearableDevice?.connected ? 'Connected' : 'Disconnected'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Connection Status
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box>
                            <Typography variant="subtitle2">
                              {selectedPatient?.wearableDevice?.batteryLevel}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={selectedPatient?.wearableDevice?.batteryLevel}
                              sx={{ mt: 0.5 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Battery Level
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box>
                            <Typography variant="subtitle2">
                              {format(selectedPatient?.wearableDevice?.lastSync || new Date(), 'MMM dd, HH:mm')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Last Sync
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Wearable Data Tab */}
            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Heart Rate (Last 24 Hours)
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={wearableData.heartRate}>
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
                        Daily Steps (Last 7 Days)
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={wearableData.steps}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill={theme.palette.success.main} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Sleep Hours (Last 7 Days)
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={wearableData.sleep}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="value" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Vitals History Tab */}
            {activeTab === 2 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Vitals History
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Heart Rate</TableCell>
                          <TableCell>Blood Pressure</TableCell>
                          <TableCell>Temperature</TableCell>
                          <TableCell>SpO2</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vitalsHistory.map((vital, index) => (
                          <TableRow key={index}>
                            <TableCell>{vital.date}</TableCell>
                            <TableCell>{vital.heartRate} BPM</TableCell>
                            <TableCell>{vital.bp}</TableCell>
                            <TableCell>{vital.temp}°F</TableCell>
                            <TableCell>{vital.spo2}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}

            {/* Medical Records Tab */}
            {activeTab === 3 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Medical History
                  </Typography>
                  <List>
                    {medicalHistory.map((record, index) => (
                      <ListItem key={index} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            <AssignmentIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={record.diagnosis}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {format(record.date, 'MMM dd, yyyy')} • {record.type}
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {record.notes}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* Medications Tab */}
            {activeTab === 4 && (
              <Grid container spacing={3}>
                {/* Current Active Medications */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Active Prescriptions
                        </Typography>
                        <Chip 
                          label={patientPrescriptions.filter(p => p.status === 'active').length}
                          color="primary"
                          size="small"
                        />
                      </Box>
                      
                      {loadingPrescriptions ? (
                        <Box>
                          {[1, 2, 3].map((item) => (
                            <Box key={item} sx={{ mb: 2 }}>
                              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
                            </Box>
                          ))}
                        </Box>
                      ) : patientPrescriptions.filter(p => p.status === 'active').length > 0 ? (
                        <List>
                          {patientPrescriptions
                            .filter(p => p.status === 'active')
                            .slice(0, 5)
                            .map((prescription, index) => (
                            <ListItem key={prescription._id || index} divider>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                                  <MedicationIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box>
                                    <Typography variant="body1" fontWeight={600}>
                                      Prescription #{prescription.prescriptionNumber || prescription._id?.slice(-6)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {prescription.diagnosis}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Box sx={{ mt: 1 }}>
                                    {prescription.medications?.slice(0, 2).map((med, idx) => (
                                      <Chip
                                        key={idx}
                                        label={`${med.name} - ${med.dosage}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ mr: 1, mb: 0.5 }}
                                      />
                                    ))}
                                    {prescription.medications?.length > 2 && (
                                      <Chip
                                        label={`+${prescription.medications.length - 2} more`}
                                        size="small"
                                        variant="outlined"
                                        color="info"
                                      />
                                    )}
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                      Created: {prescription.createdDate && new Date(prescription.createdDate).getTime() 
                                        ? new Date(prescription.createdDate).toLocaleDateString()
                                        : 'N/A'
                                      }
                                    </Typography>
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Tooltip title="View Prescription Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => window.open(`/doctor/prescriptions?view=${prescription._id}`, '_blank')}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Alert severity="info">
                          No active prescriptions found for this patient.
                        </Alert>
                      )}
                      
                      <Button
                        variant="contained"
                        startIcon={<MedicationIcon />}
                        onClick={() => window.open('/doctor/prescriptions', '_blank')}
                        sx={{ mt: 2, borderRadius: 2 }}
                        fullWidth
                      >
                        Create New Prescription
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Prescription History */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Prescription History
                        </Typography>
                        <Chip 
                          label={patientPrescriptions.length}
                          color="default"
                          size="small"
                        />
                      </Box>
                      
                      {loadingPrescriptions ? (
                        <Box>
                          {[1, 2, 3].map((item) => (
                            <Box key={item} sx={{ mb: 2 }}>
                              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                            </Box>
                          ))}
                        </Box>
                      ) : patientPrescriptions.length > 0 ? (
                        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                          {patientPrescriptions.map((prescription, index) => (
                            <ListItem key={prescription._id || index} divider>
                              <ListItemAvatar>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: prescription.status === 'active' 
                                      ? theme.palette.success.main 
                                      : prescription.status === 'completed'
                                      ? theme.palette.info.main
                                      : theme.palette.grey[500]
                                  }}
                                >
                                  <MedicationIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>
                                      #{prescription.prescriptionNumber || prescription._id?.slice(-6)}
                                    </Typography>
                                    <Chip
                                      label={prescription.status}
                                      size="small"
                                      color={
                                        prescription.status === 'active' ? 'success' :
                                        prescription.status === 'completed' ? 'info' :
                                        prescription.status === 'cancelled' ? 'error' : 'default'
                                      }
                                      sx={{ textTransform: 'capitalize' }}
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {prescription.diagnosis}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {prescription.medications?.length || 0} medication(s) • {
                                        prescription.createdDate && new Date(prescription.createdDate).getTime() 
                                          ? new Date(prescription.createdDate).toLocaleDateString()
                                          : 'N/A'
                                      }
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Alert severity="info">
                          No prescription history found for this patient.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Current Medications Summary */}
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Current Medications Summary
                      </Typography>
                      
                      {loadingPrescriptions ? (
                        <Grid container spacing={2}>
                          {[1, 2, 3, 4].map((item) => (
                            <Grid item xs={12} sm={6} md={3} key={item}>
                              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Grid container spacing={2}>
                          {patientPrescriptions
                            .filter(p => p.status === 'active')
                            .flatMap(p => p.medications || [])
                            .slice(0, 8)
                            .map((medication, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardContent sx={{ p: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <MedicationIcon 
                                      fontSize="small" 
                                      sx={{ color: theme.palette.primary.main, mr: 1 }} 
                                    />
                                    <Typography variant="body2" fontWeight={600}>
                                      {medication.name}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    <strong>Dosage:</strong> {medication.dosage}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    <strong>Frequency:</strong> {medication.frequency}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    <strong>Duration:</strong> {medication.duration}
                                  </Typography>
                                  {medication.instructions && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                      <strong>Instructions:</strong> {medication.instructions}
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                      
                      {!loadingPrescriptions && patientPrescriptions.filter(p => p.status === 'active').length === 0 && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          No active medications found. Consider creating a new prescription if needed.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EnhancedPatientManagement;