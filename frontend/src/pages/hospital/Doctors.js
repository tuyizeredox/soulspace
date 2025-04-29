import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Tabs,
  Tab,
  InputAdornment,
  Tooltip,
  Paper,
  Divider,
  useTheme,
  alpha,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocalHospital as LocalHospitalIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarMonth as CalendarMonthIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import axios from '../../utils/axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

// Import our new components
import SimpleDoctorForm from '../../components/hospital/SimpleDoctorForm';
import DoctorCredentialsDialog from '../../components/hospital/DoctorCredentialsDialog';

const HospitalDoctors = () => {
  const theme = useTheme();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openProfile, setOpenProfile] = useState(false);
  const [doctorStats, setDoctorStats] = useState({
    totalDoctors: 0,
    activeDoctors: 0,
    onLeaveDoctors: 0,
    bySpecialization: [],
    byPerformance: [],
    topPerforming: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // State variables for the credentials dialog
  const [openCredentialsDialog, setOpenCredentialsDialog] = useState(false);
  const [newDoctorCredentials, setNewDoctorCredentials] = useState({
    name: '',
    email: '',
    password: '',
  });

  // List of specializations for filtering and form
  const specializations = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Obstetrics',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Urology',
    'General Medicine',
    'Surgery'
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active', color: theme.palette.success.main },
    { value: 'on_leave', label: 'On Leave', color: theme.palette.warning.main },
    { value: 'inactive', label: 'Inactive', color: theme.palette.error.main }
  ];

  // Enhanced columns with better rendering
  const columns = [
    {
      field: 'name',
      headerName: 'Doctor',
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={params.row.profileImage}
            sx={{
              mr: 2,
              bgcolor: !params.row.profileImage ? alpha(theme.palette.primary.main, 0.8) : undefined
            }}
          >
            {!params.row.profileImage && params.row.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight={500}>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.specialization}
            </Typography>
          </Box>
        </Box>
      ),
      minWidth: 200
    },
    {
      field: 'email',
      headerName: 'Contact',
      flex: 1.5,
      renderCell: (params) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <EmailIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
            <Typography variant="body2">{params.row.email}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PhoneIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
            <Typography
              variant="body2"
              sx={{
                color: params.row.phone && params.row.phone !== 'Not provided'
                  ? 'text.primary'
                  : 'text.secondary'
              }}
            >
              {params.row.phone || 'Not provided'}
            </Typography>
          </Box>
        </Box>
      ),
      minWidth: 200
    },
    {
      field: 'patients',
      headerName: 'Patients',
      type: 'number',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 0}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            fontWeight: 'bold'
          }}
        />
      )
    },
    {
      field: 'appointments',
      headerName: 'Appointments',
      type: 'number',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value || 0}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.info.main, 0.1),
            color: theme.palette.info.main,
            fontWeight: 'bold'
          }}
        />
      )
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 140,
      renderCell: (params) => {
        const rating = params.value || 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {[...Array(5)].map((_, index) => (
              index < Math.floor(rating) ?
                <StarIcon key={index} sx={{ color: theme.palette.warning.main, fontSize: 18 }} /> :
                <StarBorderIcon key={index} sx={{ color: theme.palette.warning.main, fontSize: 18 }} />
            ))}
            <Typography variant="body2" sx={{ ml: 1 }}>
              {rating.toFixed(1)}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const status = statusOptions.find(s => s.value === params.value) || statusOptions[0];
        return (
          <Chip
            label={status.label}
            size="small"
            sx={{
              bgcolor: alpha(status.color, 0.1),
              color: status.color,
              fontWeight: 'bold',
              borderRadius: '4px'
            }}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Profile">
            <IconButton
              color="info"
              onClick={() => handleViewProfile(params.row)}
              size="small"
              sx={{
                mr: 1,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chat with Doctor">
            <IconButton
              color="success"
              onClick={() => handleChatWithDoctor(params.row)}
              size="small"
              sx={{
                mr: 1,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
              }}
            >
              <ChatIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Doctor">
            <IconButton
              color="primary"
              onClick={() => handleEdit(params.row)}
              size="small"
              sx={{
                mr: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Doctor">
            <IconButton
              color="error"
              onClick={() => handleDelete(params.row.id)}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Function to fetch doctors with real data
  const fetchDoctors = async () => {
    try {
      setLoading(true);

      // Get doctors from the hospital
      const doctorsResponse = await axios.get('/api/doctors/hospital');

      // Get patients and appointments data
      const patientsResponse = await axios.get('/api/patients/hospital');
      const appointmentsResponse = await axios.get('/api/appointments/hospital');

      // Process the data to add real patient and appointment counts
      const processedDoctors = doctorsResponse.data.map(doctor => {
        // Find patients assigned to this doctor
        const doctorPatients = patientsResponse.data.filter(
          patient => patient.doctor === doctor._id
        );

        // Find appointments for this doctor
        const doctorAppointments = appointmentsResponse.data.filter(
          appointment => appointment.doctor === doctor._id
        );

        // Use real data if available, otherwise use placeholder data
        const patients = doctorPatients.length || 0;
        const appointments = doctorAppointments.length || 0;

        // Use real rating if available, otherwise use a placeholder
        const rating = doctor.rating || 4.5;

        // Use real status if available, otherwise use 'active'
        const status = doctor.status || 'active';

        // Add availability data if not present
        const availability = doctor.availability || [
          { day: 'Monday', startTime: '09:00', endTime: '17:00', available: true },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00', available: true },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00', available: true },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00', available: true },
          { day: 'Friday', startTime: '09:00', endTime: '17:00', available: true },
          { day: 'Saturday', startTime: '09:00', endTime: '13:00', available: false },
          { day: 'Sunday', startTime: '09:00', endTime: '13:00', available: false }
        ];

        return {
          id: doctor._id,
          ...doctor,
          patients,
          appointments,
          rating: parseFloat(rating),
          status,
          availability,
          // Store the actual patient and appointment objects for detailed views
          patientsList: doctorPatients,
          appointmentsList: doctorAppointments
        };
      });

      console.log('Processed doctors with real data:', processedDoctors);
      setDoctors(processedDoctors);

      // Calculate statistics for the dashboard
      calculateDoctorStats(processedDoctors);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors data:', error);

      // If we can't get real data, fall back to mock data
      try {
        const response = await axios.get('/api/doctors/hospital');

        // Process the data with mock statistics
        const processedDoctors = response.data.map(doctor => {
          // Generate placeholder stats
          const patients = Math.floor(Math.random() * 50);
          const appointments = Math.floor(Math.random() * 100);
          const rating = (3 + Math.random() * 2).toFixed(1); // Random rating between 3-5
          const status = statusOptions[Math.floor(Math.random() * statusOptions.length)].value;

          return {
            id: doctor._id,
            ...doctor,
            patients,
            appointments,
            rating: parseFloat(rating),
            status
          };
        });

        setDoctors(processedDoctors);
        calculateDoctorStats(processedDoctors);
        setError('Using placeholder data for statistics. Some features may be limited.');
      } catch (fallbackError) {
        console.error('Error fetching fallback doctor data:', fallbackError);
        setError('Error fetching doctors. Please try again.');
      }

      setLoading(false);
    }
  };

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchDoctors();
    }, 5 * 60 * 1000);

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Calculate statistics for the dashboard
  const calculateDoctorStats = (doctorData) => {
    // Total counts
    const totalDoctors = doctorData.length;
    const activeDoctors = doctorData.filter(d => d.status === 'active').length;
    const onLeaveDoctors = doctorData.filter(d => d.status === 'on_leave').length;

    // Group by specialization
    const specializationCounts = {};
    doctorData.forEach(doctor => {
      const spec = doctor.specialization || 'Unspecified';
      specializationCounts[spec] = (specializationCounts[spec] || 0) + 1;
    });

    const bySpecialization = Object.keys(specializationCounts).map(key => ({
      name: key,
      value: specializationCounts[key]
    }));

    // Performance data (based on patients and appointments)
    const byPerformance = doctorData
      .filter(d => d.patients > 0)
      .sort((a, b) => b.patients - a.patients)
      .slice(0, 5)
      .map(d => ({
        name: d.name,
        patients: d.patients,
        appointments: d.appointments
      }));

    // Top performing doctors (based on rating)
    const topPerforming = doctorData
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map(d => ({
        id: d.id,
        name: d.name,
        specialization: d.specialization,
        rating: d.rating,
        patients: d.patients
      }));

    setDoctorStats({
      totalDoctors,
      activeDoctors,
      onLeaveDoctors,
      bySpecialization,
      byPerformance,
      topPerforming
    });
  };

  // Handle tab change
  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  // Filter doctors based on search and filters
  const getFilteredDoctors = () => {
    return doctors.filter(doctor => {
      // Search term filter
      const matchesSearch = !searchTerm ||
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

      // Specialization filter
      const matchesSpecialization = !filterSpecialization ||
        doctor.specialization === filterSpecialization;

      // Status filter
      const matchesStatus = !filterStatus || doctor.status === filterStatus;

      return matchesSearch && matchesSpecialization && matchesStatus;
    });
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle specialization filter change
  const handleSpecializationChange = (event) => {
    setFilterSpecialization(event.target.value);
  };

  // Handle status filter change
  const handleStatusChange = (event) => {
    setFilterStatus(event.target.value);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterSpecialization('');
    setFilterStatus('');
  };

  // View doctor profile
  const handleViewProfile = (doctor) => {
    setSelectedDoctor(doctor);
    setOpenProfile(true);
  };

  // Add new doctor
  const handleAddDoctor = () => {
    setSelectedDoctor(null);
    setOpenForm(true);
  };

  // Edit doctor
  const handleEdit = (doctor) => {
    // Log the doctor data for debugging
    console.log('Editing doctor:', doctor);
    console.log('Doctor phone number:', doctor.phone);

    setSelectedDoctor(doctor);
    setOpenForm(true);
  };

  // Handle doctor form success
  const handleDoctorFormSuccess = (doctor, action, credentials) => {
    if (action === 'create') {
      setSuccess(`Doctor ${doctor.name} added successfully!`);

      // If credentials were provided, show the credentials dialog
      if (credentials) {
        setNewDoctorCredentials(credentials);
        setOpenCredentialsDialog(true);
      }
    } else {
      setSuccess(`Doctor ${doctor.name} updated successfully!`);
    }

    // Refresh the doctors list
    fetchDoctors();

    // If we were viewing a doctor's schedule, update the selected doctor
    if (tabValue === 2 && selectedDoctor && selectedDoctor.id === doctor.id) {
      setSelectedDoctor(doctor);
    }
  };

  // Delete doctor
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await axios.delete(`/api/doctors/${id}`);
        setSuccess('Doctor deleted successfully');
        fetchDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        setError('Error deleting doctor. Please try again.');
      }
    }
  };

  // Open chat with doctor using the hospital chat system
  const handleChatWithDoctor = async (doctor) => {
    try {
      setLoading(true);

      // Get token from localStorage
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Create or access a chat with the doctor
      const response = await axios.post('/api/chats',
        { userId: doctor.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response && response.data) {
        // Store the chat ID in localStorage for the chat page to use
        localStorage.setItem('selectedChatId', response.data._id);

        // Store additional information about the doctor for better UX
        localStorage.setItem('chatWithUser', JSON.stringify({
          id: doctor.id,
          name: doctor.name,
          role: 'doctor',
          specialization: doctor.specialization,
          profileImage: doctor.profileImage || null
        }));

        // Navigate to the hospital chat page
        window.location.href = '/hospital/chat';
      } else {
        setError('Failed to start chat with doctor');
      }
    } catch (error) {
      console.error('Error starting chat with doctor:', error);

      // Provide more specific error messages
      if (error.response) {
        setError(`Failed to start chat: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`Failed to start chat: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Success and error alerts */}
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Header with title and add button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={600} color="primary">
            Doctors Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddDoctor}
            sx={{ borderRadius: 2 }}
          >
            Add Doctor
          </Button>
        </Box>

        {/* Tabs for different views */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                mr: 1,
                fontWeight: 500,
              },
              '& .Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              },
            }}
          >
            <Tab label="All Doctors" />
            <Tab label="Dashboard" />
            <Tab label="Schedules" />
          </Tabs>
        </Box>

        {/* Search and filters */}
        <Box sx={{ mb: 3 }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="specialization-filter-label">Specialization</InputLabel>
                  <Select
                    labelId="specialization-filter-label"
                    value={filterSpecialization}
                    onChange={handleSpecializationChange}
                    label="Specialization"
                  >
                    <MenuItem value="">All Specializations</MenuItem>
                    {specializations.map(spec => (
                      <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={filterStatus}
                    onChange={handleStatusChange}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {statusOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={clearFilters}
                  startIcon={<FilterListIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Main content based on selected tab */}
        {tabValue === 0 && (
          <Box>
            <Card sx={{ borderRadius: 3, boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}` }}>
              <CardContent sx={{ p: 0 }}>
                <DataGrid
                  rows={getFilteredDoctors()}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[5, 10, 25]}
                  disableSelectionOnClick
                  // Using slots instead of deprecated components
                  slots={{
                    toolbar: () => (
                      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<FilterListIcon />}
                          sx={{ mr: 1 }}
                        >
                          Filter
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<SearchIcon />}
                        >
                          Search
                        </Button>
                      </Box>
                    ),
                  }}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                    '& .MuiDataGrid-cell': {
                      py: 1.5
                    }
                  }}
                  autoHeight
                />
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Dashboard Tab - Analytics */}
        {tabValue === 1 && (
          <Box>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600} color="text.secondary">
                        Total Doctors
                      </Typography>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                        <LocalHospitalIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="h3" fontWeight={700} color="primary">
                      {doctorStats.totalDoctors}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {doctorStats.activeDoctors} active, {doctorStats.onLeaveDoctors} on leave
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.info.main, 0.1)}`,
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600} color="text.secondary">
                        Total Patients
                      </Typography>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                        <AssignmentIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="h3" fontWeight={700} color="info.main">
                      {doctors.reduce((sum, doctor) => sum + (doctor.patients || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Assigned to all doctors
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.1)}`,
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600} color="text.secondary">
                        Appointments
                      </Typography>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                        <CalendarMonthIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="h3" fontWeight={700} color="success.main">
                      {doctors.reduce((sum, doctor) => sum + (doctor.appointments || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Total scheduled appointments
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.warning.main, 0.1)}`,
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600} color="text.secondary">
                        Avg. Rating
                      </Typography>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                        <StarIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="h3" fontWeight={700} color="warning.main">
                      {doctors.length > 0
                        ? (doctors.reduce((sum, doctor) => sum + (doctor.rating || 0), 0) / doctors.length).toFixed(1)
                        : '0.0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Average doctor rating
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Specialization Distribution */}
              <Grid item xs={12} md={6}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Doctors by Specialization
                    </Typography>
                    <Box sx={{ height: 300, mt: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={doctorStats.bySpecialization}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {doctorStats.bySpecialization.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={[
                                  theme.palette.primary.main,
                                  theme.palette.secondary.main,
                                  theme.palette.success.main,
                                  theme.palette.info.main,
                                  theme.palette.warning.main,
                                  theme.palette.error.main,
                                  ...Array(10).fill(0).map((_, i) =>
                                    alpha(theme.palette.primary.main, 0.7 - (i * 0.05))
                                  )
                                ][index % 16]}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value, name) => [`${value} doctors`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Doctor Performance */}
              <Grid item xs={12} md={6}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Top Performing Doctors
                    </Typography>
                    <Box sx={{ height: 300, mt: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={doctorStats.byPerformance}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="patients" fill={theme.palette.primary.main} name="Patients" />
                          <Bar dataKey="appointments" fill={theme.palette.info.main} name="Appointments" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Top Doctors Table */}
            <Card sx={{
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Top Rated Doctors
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Doctor</TableCell>
                        <TableCell>Specialization</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Patients</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {doctorStats.topPerforming.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={doctor.profileImage}
                                sx={{ mr: 2, bgcolor: alpha(theme.palette.primary.main, 0.8) }}
                              >
                                {doctor.name.charAt(0)}
                              </Avatar>
                              <Typography variant="body1" fontWeight={500}>
                                {doctor.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{doctor.specialization}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {[...Array(5)].map((_, index) => (
                                index < Math.floor(doctor.rating) ?
                                  <StarIcon key={index} sx={{ color: theme.palette.warning.main, fontSize: 18 }} /> :
                                  <StarBorderIcon key={index} sx={{ color: theme.palette.warning.main, fontSize: 18 }} />
                              ))}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {doctor.rating.toFixed(1)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{doctor.patients}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleViewProfile(doctor)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Schedules Tab */}
        {tabValue === 2 && (
          <Box>
            <Card sx={{
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              mb: 4
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Doctor Schedules
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Select a doctor to view and manage their schedule.
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="doctor-select-label">Select Doctor</InputLabel>
                  <Select
                    labelId="doctor-select-label"
                    value={selectedDoctor ? selectedDoctor.id : ''}
                    onChange={(e) => {
                      const doctor = doctors.find(d => d.id === e.target.value);
                      setSelectedDoctor(doctor || null);
                    }}
                    label="Select Doctor"
                  >
                    <MenuItem value="">
                      <em>Select a doctor</em>
                    </MenuItem>
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedDoctor ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        src={selectedDoctor.profileImage}
                        sx={{
                          width: 64,
                          height: 64,
                          mr: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.8)
                        }}
                      >
                        {selectedDoctor.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight={600}>
                          {selectedDoctor.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {selectedDoctor.specialization}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Weekly Schedule
                    </Typography>

                    <TableContainer component={Paper} sx={{ boxShadow: 'none', mb: 3 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Day</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Start Time</TableCell>
                            <TableCell>End Time</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(selectedDoctor.availability || [
                            { day: 'Monday', startTime: '09:00', endTime: '17:00', available: true },
                            { day: 'Tuesday', startTime: '09:00', endTime: '17:00', available: true },
                            { day: 'Wednesday', startTime: '09:00', endTime: '17:00', available: true },
                            { day: 'Thursday', startTime: '09:00', endTime: '17:00', available: true },
                            { day: 'Friday', startTime: '09:00', endTime: '17:00', available: true },
                            { day: 'Saturday', startTime: '09:00', endTime: '13:00', available: false },
                            { day: 'Sunday', startTime: '09:00', endTime: '13:00', available: false }
                          ]).map((schedule) => (
                            <TableRow key={schedule.day}>
                              <TableCell>{schedule.day}</TableCell>
                              <TableCell>
                                <Chip
                                  label={schedule.available ? 'Available' : 'Unavailable'}
                                  color={schedule.available ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{schedule.startTime}</TableCell>
                              <TableCell>{schedule.endTime}</TableCell>
                              <TableCell align="right">
                                <IconButton
                                  color="primary"
                                  size="small"
                                  onClick={() => {
                                    // Edit schedule functionality would go here
                                    alert(`Edit schedule for ${schedule.day}`);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Upcoming Appointments
                    </Typography>

                    {selectedDoctor.appointments > 0 ? (
                      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Patient</TableCell>
                              <TableCell>Date & Time</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {/* This would be real appointment data */}
                            {[...Array(Math.min(5, selectedDoctor.appointments))].map((_, index) => {
                              const date = new Date();
                              date.setDate(date.getDate() + index + 1);

                              return (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                                        P
                                      </Avatar>
                                      <Typography variant="body2">
                                        Patient {index + 1}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    {date.toLocaleDateString()} at {['09:00', '10:30', '13:00', '15:30', '16:45'][index % 5]}
                                  </TableCell>
                                  <TableCell>
                                    {['Check-up', 'Follow-up', 'Consultation', 'Procedure', 'Emergency'][index % 5]}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-show'][index % 5]}
                                      color={['info', 'success', 'success', 'error', 'warning'][index % 5]}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <IconButton
                                      color="info"
                                      size="small"
                                      sx={{ mr: 1 }}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      color="primary"
                                      size="small"
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: alpha(theme.palette.info.main, 0.05),
                        borderRadius: 2
                      }}>
                        <Typography variant="body1" color="text.secondary">
                          No upcoming appointments for this doctor.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2
                  }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Doctor Selected
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Please select a doctor from the dropdown to view their schedule.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* New Simple Doctor Form */}
        <SimpleDoctorForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          selectedDoctor={selectedDoctor}
          onSuccess={handleDoctorFormSuccess}
        />

        {/* Doctor Credentials Dialog */}
        <DoctorCredentialsDialog
          open={openCredentialsDialog}
          onClose={() => setOpenCredentialsDialog(false)}
          credentials={newDoctorCredentials}
          onSuccess={(message) => setSuccess(message)}
        />

        {/* Doctor Profile Dialog */}
        <Dialog
          open={openProfile}
          onClose={() => setOpenProfile(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          }}
        >
          {selectedDoctor && (
            <>
              <DialogTitle
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Doctor Profile
                </Typography>
                <IconButton onClick={() => setOpenProfile(false)} size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, mb: 4 }}>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mr: { md: 4 },
                    mb: { xs: 3, md: 0 },
                    minWidth: { md: 200 }
                  }}>
                    <Avatar
                      src={selectedDoctor.profileImage}
                      sx={{
                        width: 150,
                        height: 150,
                        mb: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.8)
                      }}
                    >
                      {selectedDoctor.name.charAt(0)}
                    </Avatar>

                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1
                    }}>
                      {[...Array(5)].map((_, index) => (
                        index < Math.floor(selectedDoctor.rating || 0) ?
                          <StarIcon key={index} sx={{ color: theme.palette.warning.main }} /> :
                          <StarBorderIcon key={index} sx={{ color: theme.palette.warning.main }} />
                      ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rating: {selectedDoctor.rating?.toFixed(1) || '0.0'} / 5.0
                    </Typography>

                    <Chip
                      label={statusOptions.find(s => s.value === selectedDoctor.status)?.label || 'Active'}
                      color={
                        selectedDoctor.status === 'active' ? 'success' :
                        selectedDoctor.status === 'on_leave' ? 'warning' : 'default'
                      }
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" fontWeight={600} gutterBottom>
                      {selectedDoctor.name}
                    </Typography>

                    <Typography variant="h6" color="primary" gutterBottom>
                      {selectedDoctor.specialization}
                    </Typography>

                    <Typography variant="body1" paragraph>
                      {selectedDoctor.bio || 'No bio available for this doctor.'}
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <EmailIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                          <Typography variant="body1">
                            {selectedDoctor.email}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <PhoneIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                          <Typography variant="body1">
                            {selectedDoctor.phone}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Qualifications
                        </Typography>
                        <Typography variant="body1">
                          {selectedDoctor.qualifications || 'Not specified'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Experience
                        </Typography>
                        <Typography variant="body1">
                          {selectedDoctor.experience} years
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      borderRadius: 2,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                      height: '100%'
                    }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Patient Statistics
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Total Patients
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {selectedDoctor.patients || 0}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Appointments
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {selectedDoctor.appointments || 0}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Avg. Appointments/Week
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {Math.round((selectedDoctor.appointments || 0) / 4)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      borderRadius: 2,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                      height: '100%'
                    }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Availability
                        </Typography>

                        {(selectedDoctor.availability || [
                          { day: 'Monday', startTime: '09:00', endTime: '17:00', available: true },
                          { day: 'Tuesday', startTime: '09:00', endTime: '17:00', available: true },
                          { day: 'Wednesday', startTime: '09:00', endTime: '17:00', available: true },
                          { day: 'Thursday', startTime: '09:00', endTime: '17:00', available: true },
                          { day: 'Friday', startTime: '09:00', endTime: '17:00', available: true },
                          { day: 'Saturday', startTime: '09:00', endTime: '13:00', available: false },
                          { day: 'Sunday', startTime: '09:00', endTime: '13:00', available: false }
                        ]).map((schedule) => (
                          <Box key={schedule.day} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {schedule.day}
                            </Typography>
                            {schedule.available ? (
                              <Typography variant="body2" color="success.main">
                                {schedule.startTime} - {schedule.endTime}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Not Available
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Patient List */}
                  <Grid item xs={12}>
                    <Card sx={{
                      borderRadius: 2,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
                    }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Assigned Patients
                        </Typography>

                        {selectedDoctor.patientsList && selectedDoctor.patientsList.length > 0 ? (
                          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Patient Name</TableCell>
                                  <TableCell>Age</TableCell>
                                  <TableCell>Gender</TableCell>
                                  <TableCell>Contact</TableCell>
                                  <TableCell align="right">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {selectedDoctor.patientsList.slice(0, 5).map((patient) => (
                                  <TableRow key={patient._id}>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                                          {patient.name ? patient.name.charAt(0) : 'P'}
                                        </Avatar>
                                        <Typography variant="body2">
                                          {patient.name}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>{patient.age || 'N/A'}</TableCell>
                                    <TableCell>{patient.gender || 'N/A'}</TableCell>
                                    <TableCell>{patient.phone || patient.email || 'N/A'}</TableCell>
                                    <TableCell align="right">
                                      <Tooltip title="View Patient">
                                        <IconButton size="small" color="info">
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              No patients assigned to this doctor yet.
                            </Typography>
                          </Box>
                        )}

                        {selectedDoctor.patientsList && selectedDoctor.patientsList.length > 5 && (
                          <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Button
                              variant="text"
                              color="primary"
                              size="small"
                            >
                              View All {selectedDoctor.patientsList.length} Patients
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Upcoming Appointments */}
                  <Grid item xs={12}>
                    <Card sx={{
                      borderRadius: 2,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
                    }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Upcoming Appointments
                        </Typography>

                        {selectedDoctor.appointmentsList && selectedDoctor.appointmentsList.length > 0 ? (
                          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Patient</TableCell>
                                  <TableCell>Date & Time</TableCell>
                                  <TableCell>Type</TableCell>
                                  <TableCell>Status</TableCell>
                                  <TableCell align="right">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {selectedDoctor.appointmentsList.slice(0, 5).map((appointment) => (
                                  <TableRow key={appointment._id}>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                                          {appointment.patient?.name ? appointment.patient.name.charAt(0) : 'P'}
                                        </Avatar>
                                        <Typography variant="body2">
                                          {appointment.patient?.name || 'Unknown Patient'}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time || 'N/A'}
                                    </TableCell>
                                    <TableCell>{appointment.type || 'Regular'}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={appointment.status || 'Scheduled'}
                                        size="small"
                                        color={
                                          appointment.status === 'completed' ? 'success' :
                                          appointment.status === 'cancelled' ? 'error' :
                                          appointment.status === 'no-show' ? 'warning' : 'info'
                                        }
                                        sx={{ fontSize: '0.7rem' }}
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Tooltip title="View Appointment">
                                        <IconButton size="small" color="info">
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              No upcoming appointments for this doctor.
                            </Typography>
                          </Box>
                        )}

                        {selectedDoctor.appointmentsList && selectedDoctor.appointmentsList.length > 5 && (
                          <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Button
                              variant="text"
                              color="primary"
                              size="small"
                            >
                              View All {selectedDoctor.appointmentsList.length} Appointments
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </DialogContent>

              <DialogActions sx={{ p: 2 }}>
                <Button
                  onClick={() => setOpenProfile(false)}
                  sx={{ borderRadius: 2 }}
                >
                  Close
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => {
                    setOpenProfile(false);
                    handleChatWithDoctor(selectedDoctor);
                  }}
                  startIcon={<ChatIcon />}
                  sx={{ borderRadius: 2, mr: 1 }}
                >
                  Chat with Doctor
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setOpenProfile(false);
                    handleEdit(selectedDoctor);
                  }}
                  startIcon={<EditIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Edit Doctor
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default HospitalDoctors;
