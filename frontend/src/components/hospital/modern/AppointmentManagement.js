import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  Tooltip,
  useTheme,
  alpha,
  Avatar,
  Divider,
  Stack,
  Paper,
  Fade,
  Slide,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Event as EventIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Done as DoneIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, parseISO, addDays, startOfDay } from 'date-fns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from '../../../utils/axiosConfig';

const AppointmentManagement = () => {
  const theme = useTheme();
  const { user, token } = useSelector((state) => state.userAuth);
  
  // State management
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    date: new Date(),
    type: '',
    reason: '',
    notes: '',
    status: 'pending'
  });

  // Validation errors
  const [formErrors, setFormErrors] = useState({});

  // Appointment types
  const appointmentTypes = [
    'General Checkup',
    'Consultation',
    'Follow-up',
    'Specialist Visit',
    'Emergency',
    'Laboratory Test',
    'Imaging',
    'Online Consultation',
    'In-Person Visit'
  ];

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'confirmed', label: 'Confirmed', color: 'info' },
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  // Fetch appointments data
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/appointments/hospital', config);
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.response?.data?.message || 'Failed to fetch appointments data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch doctors and patients for form
  const fetchFormData = useCallback(async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [doctorsRes, patientsRes] = await Promise.all([
        axios.get('/api/doctors/hospital', config),
        axios.get('/api/patients/hospital', config)
      ]);

      setDoctors(doctorsRes.data || []);
      setPatients(patientsRes.data || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAppointments();
      fetchFormData();
    }
  }, [fetchAppointments, fetchFormData, token]);

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchQuery || 
      appointment.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    const matchesDoctor = doctorFilter === 'all' || 
      appointment.doctor?._id === doctorFilter ||
      appointment.doctor === doctorFilter;
    
    const matchesType = typeFilter === 'all' || appointment.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesDoctor && matchesType;
  });

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.patient) {
      errors.patient = 'Patient is required';
    }
    
    if (!formData.doctor) {
      errors.doctor = 'Doctor is required';
    }
    
    if (!formData.date) {
      errors.date = 'Date and time is required';
    } else if (new Date(formData.date) < new Date()) {
      errors.date = 'Appointment date cannot be in the past';
    }

    if (!formData.type) {
      errors.type = 'Appointment type is required';
    }

    if (!formData.reason.trim()) {
      errors.reason = 'Reason for appointment is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitLoading(true);
      setError('');
      
      const submitData = {
        ...formData,
        date: new Date(formData.date).toISOString()
      };
      
      let response;
      if (editingAppointment) {
        response = await fetch(`/api/appointments/${editingAppointment._id}/status`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: formData.status,
            notes: formData.notes
          })
        });
      } else {
        response = await fetch('/api/appointments/admin', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      setSuccess(editingAppointment ? 'Appointment updated successfully' : 'Appointment created successfully');
      setOpenDialog(false);
      resetForm();
      fetchAppointments();
      
    } catch (error) {
      console.error('Error saving appointment:', error);
      setError(error.message || 'Failed to save appointment');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setSubmitLoading(true);
      
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      if (newStatus === 'confirmed') {
        setSuccess('Appointment confirmed successfully! The patient has been assigned to the doctor and added to the patient list.');
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('patientListUpdated', { 
          detail: { action: 'appointmentConfirmed', appointmentId } 
        }));
      } else {
        setSuccess(`Appointment ${newStatus} successfully`);
      }
      fetchAppointments();
      
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError(error.message || 'Failed to update appointment status');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle delete appointment
  const handleDelete = async () => {
    if (!appointmentToDelete) return;
    
    try {
      setSubmitLoading(true);
      
      const response = await fetch(`/api/appointments/${appointmentToDelete._id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      setSuccess('Appointment deleted successfully');
      setDeleteDialog(false);
      setAppointmentToDelete(null);
      fetchAppointments();
      
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError(error.message || 'Failed to delete appointment');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Form helpers
  const resetForm = () => {
    setFormData({
      patient: '',
      doctor: '',
      date: addDays(startOfDay(new Date()), 1),
      type: '',
      reason: '',
      notes: '',
      status: 'pending'
    });
    setFormErrors({});
    setEditingAppointment(null);
  };

  const openEditDialog = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient: appointment.patient?._id || appointment.patient || '',
      doctor: appointment.doctor?._id || appointment.doctor || '',
      date: appointment.date ? parseISO(appointment.date) : new Date(),
      type: appointment.type || '',
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      status: appointment.status || 'pending'
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDoctorFilter('all');
    setTypeFilter('all');
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <PendingIcon fontSize="small" />;
      case 'confirmed':
        return <CheckIcon fontSize="small" />;
      case 'completed':
        return <DoneIcon fontSize="small" />;
      case 'cancelled':
        return <CancelIcon fontSize="small" />;
      default:
        return <PendingIcon fontSize="small" />;
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: 'patient',
      headerName: 'Patient',
      width: 200,
      renderCell: (params) => {
        const patient = params.value;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: theme.palette.info.main,
                fontSize: '0.875rem'
              }}
            >
              {patient?.name?.charAt(0)?.toUpperCase() || 'P'}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {patient?.name || 'Unknown Patient'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {patient?.email || 'No email'}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'doctor',
      headerName: 'Doctor',
      width: 200,
      renderCell: (params) => {
        const doctor = params.value;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DoctorIcon color="primary" fontSize="small" />
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Dr. {doctor?.name || 'Unknown Doctor'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {doctor?.specialization || 'General'}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'date',
      headerName: 'Date & Time',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {format(parseISO(params.value), 'MMM dd, yyyy')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(parseISO(params.value), 'hh:mm a')}
          </Typography>
        </Box>
      )
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'General'} 
          size="small" 
          color="info"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      )
    },
    {
      field: 'reason',
      headerName: 'Reason',
      width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value || 'No reason provided'}>
          <Typography 
            variant="body2" 
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}
          >
            {params.value ? 
              (params.value.length > 30 ? `${params.value.substring(0, 30)}...` : params.value) : 
              'No reason'
            }
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const status = params.value || 'pending';
        const statusConfig = statusOptions.find(s => s.value === status) || statusOptions[0];
        return (
          <Chip 
            icon={getStatusIcon(status)}
            label={statusConfig.label} 
            size="small" 
            color={statusConfig.color}
            variant="filled"
            sx={{ fontWeight: 500 }}
          />
        );
      }
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value ? format(parseISO(params.value), 'MMM dd') : 'N/A'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.row.status === 'pending' && (
            <Tooltip title="Confirm">
              <IconButton 
                size="small" 
                onClick={() => {
                  console.log('Appointment row data:', params.row);
                  console.log('Appointment ID from DataGrid:', params.row.id);
                  console.log('Original appointment _id:', params.row._id);
                  // Use the original _id if available, otherwise use the DataGrid id
                  const appointmentId = params.row._id || params.row.id;
                  handleStatusUpdate(appointmentId, 'confirmed');
                }}
                color="success"
                sx={{ 
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.success.main, 0.1) 
                  } 
                }}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {params.row.status === 'confirmed' && (
            <Tooltip title="Complete">
              <IconButton 
                size="small" 
                onClick={() => {
                  const appointmentId = params.row._id || params.row.id;
                  handleStatusUpdate(appointmentId, 'completed');
                }}
                color="primary"
                sx={{ 
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.1) 
                  } 
                }}
              >
                <DoneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              onClick={() => openEditDialog(params.row)}
              color="info"
              sx={{ 
                '&:hover': { 
                  bgcolor: alpha(theme.palette.info.main, 0.1) 
                } 
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Cancel/Delete">
            <IconButton 
              size="small" 
              onClick={() => {
                if (params.row.status === 'pending' || params.row.status === 'confirmed') {
                  const appointmentId = params.row._id || params.row.id;
                  handleStatusUpdate(appointmentId, 'cancelled');
                } else {
                  setAppointmentToDelete(params.row);
                  setDeleteDialog(true);
                }
              }}
              color="error"
              sx={{ 
                '&:hover': { 
                  bgcolor: alpha(theme.palette.error.main, 0.1) 
                } 
              }}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  if (loading && appointments.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="info.main" gutterBottom>
              Appointment Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage hospital appointments and scheduling
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAppointments}
              disabled={loading}
              sx={{ minWidth: 'auto' }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}
              sx={{ 
                bgcolor: 'info.main',
                '&:hover': { bgcolor: 'info.dark' }
              }}
            >
              Schedule Appointment
            </Button>
          </Stack>
        </Box>

        {/* Alerts */}
        <Fade in={!!error}>
          <Box sx={{ mb: 2 }}>
            {error && (
              <Alert 
                severity="error" 
                onClose={() => setError('')}
                sx={{ mb: 2 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={() => {
                      setError('');
                      fetchAppointments();
                      fetchFormData();
                    }}
                  >
                    Retry
                  </Button>
                }
              >
                {error}
              </Alert>
            )}
          </Box>
        </Fade>
        
        <Fade in={!!success}>
          <Box sx={{ mb: 2 }}>
            {success && (
              <Alert 
                severity="success" 
                onClose={() => setSuccess('')}
                sx={{ mb: 2 }}
              >
                {success}
              </Alert>
            )}
          </Box>
        </Fade>

        {/* Search and Filters */}
        <Card sx={{ mb: 3, overflow: 'visible' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search appointments by patient, doctor, reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  fullWidth
                >
                  Filters
                </Button>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" textAlign="right">
                  Showing {filteredAppointments.length} of {appointments.length} appointments
                </Typography>
              </Grid>

              <Grid item xs={12} md={2}>
                {(statusFilter !== 'all' || doctorFilter !== 'all' || typeFilter !== 'all') && (
                  <Button
                    variant="text"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                    size="small"
                    fullWidth
                  >
                    Clear Filters
                  </Button>
                )}
              </Grid>
            </Grid>

            {/* Expandable Filters */}
            <Slide direction="down" in={showFilters} mountOnEnter unmountOnExit>
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        {statusOptions.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Doctor</InputLabel>
                      <Select
                        value={doctorFilter}
                        onChange={(e) => setDoctorFilter(e.target.value)}
                        label="Doctor"
                      >
                        <MenuItem value="all">All Doctors</MenuItem>
                        {doctors.map((doctor) => (
                          <MenuItem key={doctor._id} value={doctor._id}>
                            Dr. {doctor.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        label="Type"
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        {appointmentTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Slide>
          </CardContent>
        </Card>

        {/* Data Grid */}
        <Paper sx={{ height: 600, width: '100%', borderRadius: 2 }}>
          <DataGrid
            rows={filteredAppointments.map((appointment, index) => ({ 
              ...appointment, 
              id: appointment._id || appointment.id || `appointment-${index}-${appointment.date || Math.random()}` 
            }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            loading={loading}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderColor: alpha(theme.palette.divider, 0.5)
              },
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: alpha(theme.palette.info.main, 0.05),
                borderBottom: `2px solid ${alpha(theme.palette.info.main, 0.1)}`
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: alpha(theme.palette.info.main, 0.02)
              }
            }}
          />
        </Paper>

        {/* Add/Edit Appointment Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editingAppointment ? 'Update appointment details' : 'Create a new appointment for a patient'}
            </Typography>
          </DialogTitle>
          
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                {/* Patient and Doctor Selection */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600} color="info.main" gutterBottom>
                    Patient & Doctor Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!formErrors.patient}>
                    <InputLabel>Patient</InputLabel>
                    <Select
                      value={formData.patient}
                      onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                      label="Patient"
                      disabled={editingAppointment}
                    >
                      {patients.map((patient) => (
                        <MenuItem key={patient._id} value={patient._id}>
                          {patient.name} - {patient.email}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.patient && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {formErrors.patient}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!formErrors.doctor}>
                    <InputLabel>Doctor</InputLabel>
                    <Select
                      value={formData.doctor}
                      onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                      label="Doctor"
                      disabled={editingAppointment}
                    >
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor._id} value={doctor._id}>
                          Dr. {doctor.name} - {doctor.specialization || 'General'}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.doctor && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {formErrors.doctor}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Appointment Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600} color="info.main" gutterBottom sx={{ mt: 2 }}>
                    Appointment Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Date & Time"
                    value={formData.date}
                    onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                    disabled={editingAppointment}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        required
                        error={!!formErrors.date}
                        helperText={formErrors.date}
                      />
                    )}
                    minDateTime={new Date()}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!formErrors.type}>
                    <InputLabel>Appointment Type</InputLabel>
                    <Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      label="Appointment Type"
                      disabled={editingAppointment}
                    >
                      {appointmentTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.type && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {formErrors.type}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                {editingAppointment && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        label="Status"
                      >
                        {statusOptions.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Appointment"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    error={!!formErrors.reason}
                    helperText={formErrors.reason}
                    required
                    disabled={editingAppointment}
                    multiline
                    rows={2}
                    placeholder="Describe the reason for this appointment"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    multiline
                    rows={3}
                    placeholder="Any additional notes or special instructions"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button 
                onClick={() => setOpenDialog(false)}
                disabled={submitLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained"
                disabled={submitLoading}
                startIcon={submitLoading ? <CircularProgress size={16} /> : null}
                sx={{ bgcolor: 'info.main', '&:hover': { bgcolor: 'info.dark' } }}
              >
                {submitLoading ? 'Saving...' : (editingAppointment ? 'Update Appointment' : 'Schedule Appointment')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog}
          onClose={() => setDeleteDialog(false)}
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" color="error.main">
              Delete Appointment
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this appointment? 
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => setDeleteDialog(false)}
              disabled={submitLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              color="error"
              variant="contained"
              disabled={submitLoading}
              startIcon={submitLoading ? <CircularProgress size={16} /> : null}
            >
              {submitLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentManagement;