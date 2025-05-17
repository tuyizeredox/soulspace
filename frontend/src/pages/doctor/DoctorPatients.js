import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Button,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarIcon,
  MedicalServices as MedicalServicesIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  HealthAndSafety as HealthIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import axios from '../../utils/axiosConfig';

const DoctorPatients = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Get user data from Redux store
  const { user: oldAuthUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: userAuthUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = userAuthUser || oldAuthUser;
  const token = newToken || oldToken;

  // State variables
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [openPatientDetails, setOpenPatientDetails] = useState(false);

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
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  // Fetch patients data
  const fetchPatients = async () => {
    try {
      setRefreshing(true);

      // Ensure axios has the token in its default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('Fetching patients for doctor...');

      // Try multiple endpoints to ensure we get the data
      let response;
      let success = false;

      try {
        // First try the specific endpoint for doctor's patients
        response = await axios.get('/api/doctors/my-patients', config);
        if (response.data && Array.isArray(response.data)) {
          success = true;
          console.log(`Successfully fetched ${response.data.length} patients from /api/doctors/my-patients`);
        }
      } catch (err) {
        console.log('Failed to fetch from /api/doctors/my-patients:', err.message);

        // Try alternative endpoint
        try {
          const doctorId = user?.id || user?._id;
          if (doctorId) {
            response = await axios.get(`/api/doctors/${doctorId}/patients`, config);
            if (response.data && Array.isArray(response.data)) {
              success = true;
              console.log(`Successfully fetched ${response.data.length} patients from /api/doctors/${doctorId}/patients`);
            }
          }
        } catch (err) {
          console.log('Failed to fetch from alternative endpoint:', err.message);
        }
      }

      if (success && response.data) {
        console.log(`Fetched ${response.data.length} patients`);
        setPatients(response.data);
        setError('');
      } else {
        throw new Error('Could not fetch patients from any endpoint');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients. Please try again later.');

      // Use mock data for development/testing
      setPatients([
        {
          _id: 'p1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          gender: 'Male',
          age: 45,
          phone: '+1 (555) 123-4567',
          lastVisit: new Date('2023-05-15').toISOString(),
          upcomingAppointments: 1
        },
        {
          _id: 'p2',
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          gender: 'Female',
          age: 32,
          phone: '+1 (555) 987-6543',
          lastVisit: new Date('2023-06-02').toISOString(),
          upcomingAppointments: 0
        },
        {
          _id: 'p3',
          name: 'Michael Brown',
          email: 'michael.b@example.com',
          gender: 'Male',
          age: 58,
          phone: '+1 (555) 456-7890',
          lastVisit: new Date('2023-06-15').toISOString(),
          upcomingAppointments: 2
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Handle refresh
  const handleRefresh = () => {
    fetchPatients();
  };

  // Handle patient selection
  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setOpenPatientDetails(true);
  };

  // Handle chat with patient
  const handleChatWithPatient = (patientId, e) => {
    e.stopPropagation();
    navigate(`/doctor/patients/chat/${patientId}`);
  };

  // Handle view medical records
  const handleViewMedicalRecords = (patientId, e) => {
    e.stopPropagation();
    navigate(`/doctor/patient/${patientId}/records`);
  };

  // Handle schedule appointment
  const handleScheduleAppointment = (patientId, e) => {
    e.stopPropagation();
    navigate(`/doctor/appointments/new?patientId=${patientId}`);
  };

  // Filter patients based on search term and active tab
  const filteredPatients = patients.filter(patient => {
    // Search filter
    const matchesSearch =
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    // Tab filter
    if (activeTab === 0) {
      return matchesSearch; // All patients
    } else if (activeTab === 1) {
      return matchesSearch && patient.upcomingAppointments > 0; // With upcoming appointments
    } else if (activeTab === 2) {
      return matchesSearch && patient.lastVisit && new Date(patient.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Recent visits (last 30 days)
    }

    return matchesSearch;
  });

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Patient details dialog
  const PatientDetailsDialog = () => {
    if (!selectedPatient) return null;

    return (
      <Dialog
        open={openPatientDetails}
        onClose={() => setOpenPatientDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: theme.palette.primary.main
              }}
            >
              {getInitials(selectedPatient.name)}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedPatient.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPatient.gender}, {selectedPatient.age} years old
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">{selectedPatient.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">{selectedPatient.phone}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Medical Information
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Visit
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedPatient.lastVisit)}
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Upcoming Appointments
                </Typography>
                <Typography variant="body1">
                  {selectedPatient.upcomingAppointments || 0}
                </Typography>
              </Box>

              {selectedPatient.medicalHistory && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Medical History
                  </Typography>
                  <Typography variant="body1">
                    {selectedPatient.medicalHistory}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Recent Appointments
              </Typography>

              {selectedPatient.recentAppointments && selectedPatient.recentAppointments.length > 0 ? (
                selectedPatient.recentAppointments.map((appointment, index) => (
                  <Paper
                    key={appointment._id || index}
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">
                        {formatDate(appointment.date)}
                      </Typography>
                      <Chip
                        size="small"
                        label={appointment.status}
                        color={
                          appointment.status === 'completed' ? 'success' :
                          appointment.status === 'confirmed' ? 'primary' :
                          appointment.status === 'cancelled' ? 'error' : 'default'
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {appointment.reason || 'No reason provided'}
                    </Typography>
                    <Typography variant="body2">
                      Type: {appointment.type || 'In-person'}
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent appointments
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<ChatIcon />}
            onClick={() => {
              setOpenPatientDetails(false);
              navigate(`/doctor/patients/chat/${selectedPatient._id}`);
            }}
          >
            Enhanced Chat
          </Button>
          <Button
            startIcon={<CalendarIcon />}
            onClick={() => {
              setOpenPatientDetails(false);
              navigate(`/doctor/appointments/new?patientId=${selectedPatient._id}`);
            }}
          >
            Schedule Appointment
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenPatientDetails(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 3, md: 4 } }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 3
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              fontWeight={600}
              sx={{
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              My Patients
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card
            component={motion.div}
            variants={itemVariants}
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: theme.shadows[2]
            }}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search patients by name, email, or phone..."
                    variant="outlined"
                    size="medium"
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
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        minWidth: 'auto',
                        px: 2
                      }
                    }}
                  >
                    <Tab label="All Patients" />
                    <Tab label="Upcoming Appointments" />
                    <Tab label="Recent Visits" />
                  </Tabs>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Patients List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : filteredPatients.length > 0 ? (
            <Grid container spacing={2}>
              {filteredPatients.map((patient) => (
                <Grid item xs={12} sm={6} md={4} key={patient._id}>
                  <Card
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                      borderRadius: 3,
                      boxShadow: theme.shadows[2],
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8]
                      }
                    }}
                    onClick={() => handlePatientClick(patient)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            mr: 2,
                            bgcolor: theme.palette.primary.main
                          }}
                        >
                          {getInitials(patient.name)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {patient.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {patient.gender}, {patient.age} years
                          </Typography>
                        </Box>
                        {patient.upcomingAppointments > 0 && (
                          <Chip
                            size="small"
                            color="primary"
                            label={`${patient.upcomingAppointments} upcoming`}
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Last Visit
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(patient.lastVisit)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Contact
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {patient.phone}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                        <Tooltip title="Chat with Patient">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={(e) => handleChatWithPatient(patient._id, e)}
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2)
                              }
                            }}
                          >
                            <ChatIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Medical Records">
                          <IconButton
                            color="info"
                            size="small"
                            onClick={(e) => handleViewMedicalRecords(patient._id, e)}
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.info.main, 0.2)
                              }
                            }}
                          >
                            <AssignmentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Schedule Appointment">
                          <IconButton
                            color="success"
                            size="small"
                            onClick={(e) => handleScheduleAppointment(patient._id, e)}
                            sx={{
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.success.main, 0.2)
                              }
                            }}
                          >
                            <CalendarIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => handlePatientClick(patient)}
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card
              component={motion.div}
              variants={itemVariants}
              sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[2],
                textAlign: 'center',
                p: 4
              }}
            >
              <Box sx={{ mb: 2 }}>
                <PersonIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.5) }} />
              </Box>
              <Typography variant="h6" gutterBottom>
                No patients found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm ? 'Try adjusting your search criteria' : 'You have no patients assigned to you yet'}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleRefresh}
              >
                Refresh List
              </Button>
            </Card>
          )}
        </motion.div>
      </Box>

      {/* Patient Details Dialog */}
      <PatientDetailsDialog />
    </Container>
  );
};

export default DoctorPatients;
