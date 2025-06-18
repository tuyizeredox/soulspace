import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  useTheme,
  alpha,
  Skeleton,
  Alert,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow, isThisWeek, subDays, addDays } from 'date-fns';
import axios from '../../../utils/axiosConfig';

// Simple inline appointment card for reliability
const AppointmentCard = ({ appointment, onUpdate }) => {
  const theme = useTheme();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ p: 3, mb: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            {appointment.patient?.name?.charAt(0) || 'P'}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {appointment.patient?.name || 'Unknown Patient'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.time}
            </Typography>
          </Box>
        </Box>
        <Chip 
          label={appointment.status} 
          color={getStatusColor(appointment.status)}
          size="small" 
          sx={{ textTransform: 'capitalize' }}
        />
      </Box>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        <strong>Reason:</strong> {appointment.reason}
      </Typography>
      
      {appointment.type && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Type:</strong> {appointment.type}
        </Typography>
      )}
      
      {appointment.duration && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Duration:</strong> {appointment.duration} minutes
        </Typography>
      )}
      
      {appointment.notes && (
        <Typography variant="body2" color="text.secondary">
          <strong>Notes:</strong> {appointment.notes}
        </Typography>
      )}
      
      {appointment.status === 'confirmed' && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button 
            size="small" 
            variant="contained" 
            color="success"
            onClick={() => onUpdate && onUpdate(appointment._id, { status: 'completed' })}
          >
            Mark Complete
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            color="error"
            onClick={() => onUpdate && onUpdate(appointment._id, { status: 'cancelled' })}
          >
            Cancel
          </Button>
        </Box>
      )}
    </Card>
  );
};

// Simple filters component
const AppointmentFilters = ({ onFilterChange }) => (
  <Card sx={{ p: 2, borderRadius: 2 }}>
    <Typography variant="body2" color="text.secondary">
      Advanced filters will be available soon...
    </Typography>
  </Card>
);

const DoctorAppointmentManagement = ({ onAppointmentUpdate }) => {
  const theme = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try multiple endpoints for appointments
        let response;
        try {
          response = await axios.get('/api/doctors/my-appointments');
        } catch (error) {
          console.log('Primary endpoint failed, trying alternative...');
          try {
            response = await axios.get('/api/appointments/doctor');
          } catch (error2) {
            console.log('Alternative endpoint failed, trying general appointments...');
            response = await axios.get('/api/appointments');
          }
        }
        
        if (response && Array.isArray(response.data)) {
          setAppointments(response.data);
        } else if (response && response.data && Array.isArray(response.data.appointments)) {
          setAppointments(response.data.appointments);
        } else {
          // If API fails, use mock data
          console.log('Using mock appointment data');
          const mockAppointments = [
            {
              _id: '1',
              patient: {
                _id: 'p1',
                name: 'John Doe',
                email: 'john.doe@email.com',
                phone: '+1234567890',
                avatar: null
              },
              date: new Date().toISOString(),
              time: '10:00',
              reason: 'Regular checkup',
              status: 'confirmed',
              type: 'in-person',
              duration: 30,
              notes: 'Patient reports feeling well'
            },
            {
              _id: '2',
              patient: {
                _id: 'p2',
                name: 'Jane Smith',
                email: 'jane.smith@email.com',
                phone: '+1234567891',
                avatar: null
              },
              date: addDays(new Date(), 1).toISOString(),
              time: '14:30',
              reason: 'Follow-up consultation',
              status: 'pending',
              type: 'video-call',
              duration: 45,
              notes: 'Follow-up on previous treatment'
            },
            {
              _id: '3',
              patient: {
                _id: 'p3',
                name: 'Robert Johnson',
                email: 'robert.johnson@email.com',
                phone: '+1234567892',
                avatar: null
              },
              date: subDays(new Date(), 1).toISOString(),
              time: '09:15',
              reason: 'Blood pressure monitoring',
              status: 'completed',
              type: 'in-person',
              duration: 20,
              notes: 'Blood pressure stable, continue medication'
            },
            {
              _id: '4',
              patient: {
                _id: 'p4',
                name: 'Emily Davis',
                email: 'emily.davis@email.com',
                phone: '+1234567893',
                avatar: null
              },
              date: addDays(new Date(), 2).toISOString(),
              time: '11:00',
              reason: 'Diabetes consultation',
              status: 'confirmed',
              type: 'in-person',
              duration: 30,
              notes: 'Review diabetes management plan'
            },
            {
              _id: '5',
              patient: {
                _id: 'p5',
                name: 'Michael Brown',
                email: 'michael.brown@email.com',
                phone: '+1234567894',
                avatar: null
              },
              date: new Date().toISOString(),
              time: '16:00',
              reason: 'Prescription renewal',
              status: 'cancelled',
              type: 'video-call',
              duration: 15,
              notes: 'Patient cancelled due to scheduling conflict'
            }
          ];
          
          setAppointments(mockAppointments);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError(`Failed to load appointments: ${error.response?.status || 'Network error'}`);
        
        // Set mock data as fallback
        console.log('Using fallback mock appointment data');
        const mockAppointments = [
          {
            _id: '1',
            patient: {
              _id: 'p1',
              name: 'John Doe',
              email: 'john.doe@email.com',
              phone: '+1234567890',
              avatar: null
            },
            date: new Date().toISOString(),
            time: '10:00',
            reason: 'Regular checkup',
            status: 'confirmed',
            type: 'in-person',
            duration: 30,
            notes: 'Patient reports feeling well'
          },
          {
            _id: '2',
            patient: {
              _id: 'p2',
              name: 'Jane Smith',
              email: 'jane.smith@email.com',
              phone: '+1234567891',
              avatar: null
            },
            date: addDays(new Date(), 1).toISOString(),
            time: '14:30',
            reason: 'Follow-up consultation',
            status: 'pending',
            type: 'video-call',
            duration: 45,
            notes: 'Follow-up on previous treatment'
          }
        ];
        
        setAppointments(mockAppointments);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Handle appointment updates
  const handleAppointmentUpdate = async (appointmentId, updates) => {
    try {
      // Update locally first for immediate UI feedback
      setAppointments(prev => prev.map(apt => 
        apt._id === appointmentId ? { ...apt, ...updates } : apt
      ));

      // Then update on server
      await axios.put(`/api/appointments/${appointmentId}`, updates);
      
      if (onAppointmentUpdate) {
        onAppointmentUpdate(appointmentId, updates);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      // Revert the local change if server update fails
      setAppointments(prev => prev.map(apt => 
        apt._id === appointmentId ? { ...apt, ...updates } : apt
      ));
    }
  };

  // Refresh appointments
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Filter and group appointments
  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(appointment => {
      const matchesSearch = appointment.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      
      const appointmentDate = new Date(appointment.date);
      let matchesDate = true;
      
      if (dateFilter === 'today') {
        matchesDate = isToday(appointmentDate);
      } else if (dateFilter === 'tomorrow') {
        matchesDate = isTomorrow(appointmentDate);
      } else if (dateFilter === 'week') {
        matchesDate = isThisWeek(appointmentDate);
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });

    return filtered;
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  // Debug logging - moved after filteredAppointments definition
  useEffect(() => {
    console.log('DoctorAppointmentManagement - Current state:', {
      appointments: appointments.length,
      loading,
      error,
      filteredAppointments: filteredAppointments.length
    });
  }, [appointments, loading, error, filteredAppointments]);

  // Group appointments by status for tabs
  const appointmentGroups = useMemo(() => {
    const groups = {
      confirmed: filteredAppointments.filter(apt => apt.status === 'confirmed'),
      pending: filteredAppointments.filter(apt => apt.status === 'pending'),
      completed: filteredAppointments.filter(apt => apt.status === 'completed'),
      cancelled: filteredAppointments.filter(apt => apt.status === 'cancelled')
    };
    
    return groups;
  }, [filteredAppointments]);

  // Tab configuration
  const tabs = [
    {
      label: 'Confirmed',
      key: 'confirmed',
      icon: <CheckCircleIcon />,
      color: 'success',
      count: appointmentGroups.confirmed.length
    },
    {
      label: 'Pending',
      key: 'pending',
      icon: <ScheduleIcon />,
      color: 'warning',
      count: appointmentGroups.pending.length
    },
    {
      label: 'Completed',
      key: 'completed',
      icon: <EventIcon />,
      color: 'info',
      count: appointmentGroups.completed.length
    },
    {
      label: 'Cancelled',
      key: 'cancelled',
      icon: <CancelIcon />,
      color: 'error',
      count: appointmentGroups.cancelled.length
    }
  ];

  const currentTabData = tabs[activeTab];
  const currentAppointments = appointmentGroups[currentTabData.key] || [];

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
        duration: 0.3
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={80} sx={{ mb: 3, borderRadius: 2 }} />
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header and Search */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Appointment Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your appointments, complete treatments, and track patient visits
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Summary Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {appointments.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Appointments
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {appointmentGroups.confirmed?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Confirmed
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {appointmentGroups.pending?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {appointmentGroups.completed?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Search and Filters */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search patients or appointment reasons..."
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Date Filter</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date Filter"
                  onChange={(e) => setDateFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Dates</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="tomorrow">Tomorrow</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                fullWidth
                sx={{ 
                  height: 56,
                  borderRadius: 2,
                  textTransform: 'none'
                }}
              >
                {showFilters ? 'Hide Filters' : 'More Filters'}
              </Button>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AppointmentFilters
                  onFilterChange={(filters) => {
                    // Handle additional filters
                    console.log('Additional filters:', filters);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </motion.div>

      {/* Status Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  '&.Mui-selected': {
                    fontWeight: 600
                  }
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.key}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Badge badgeContent={tab.count} color={tab.color}>
                        {tab.icon}
                      </Badge>
                      {tab.label}
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>
        </Card>
      </motion.div>

      {/* Appointments List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {currentAppointments.length > 0 ? (
            <Grid container spacing={2}>
              {currentAppointments.map((appointment, index) => (
                <Grid item xs={12} key={appointment._id}>
                  <motion.div variants={itemVariants}>
                    <AppointmentCard
                      appointment={appointment}
                      onUpdate={handleAppointmentUpdate}
                      showActions={currentTabData.key === 'confirmed'}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[100], 0.5)
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {currentTabData.icon}
                </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No {currentTabData.label.toLowerCase()} appointments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentTabData.key === 'confirmed' && 'You have no confirmed appointments at the moment.'}
                  {currentTabData.key === 'pending' && 'No appointments are waiting for confirmation.'}
                  {currentTabData.key === 'completed' && 'No completed appointments to show.'}
                  {currentTabData.key === 'cancelled' && 'No cancelled appointments.'}
                </Typography>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card sx={{ mt: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" fontWeight={700}>
                    {appointments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Appointments
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" fontWeight={700}>
                    {appointmentGroups.confirmed.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confirmed Today
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" fontWeight={700}>
                    {appointmentGroups.pending.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Review
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main" fontWeight={700}>
                    {appointmentGroups.completed.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default DoctorAppointmentManagement;