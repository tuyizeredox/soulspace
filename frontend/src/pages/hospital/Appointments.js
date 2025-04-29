import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  Divider,
  Card,
  CardContent,
  useTheme,
  alpha,
  Snackbar,
  Badge,
  Avatar,
  Stack,
  InputAdornment
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CalendarMonth as CalendarMonthIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { format, parseISO, isValid } from 'date-fns';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import { useSelector } from 'react-redux';

const HospitalAppointments = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.userAuth);

  // State for appointments and loading
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State for alerts and notifications
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // State for dialogs
  const [openForm, setOpenForm] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);

  // State for selected items
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // State for data
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  // State for filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [tabValue, setTabValue] = useState(0);

  // Constants
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

  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'error',
    completed: 'info'
  };

  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed'
  };

  // DataGrid columns configuration
  const columns = [
    {
      field: 'date',
      headerName: 'Date & Time',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const date = new Date(params.value);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarMonthIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 20 }} />
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {format(date, 'MMM dd, yyyy')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(date, 'h:mm a')}
              </Typography>
            </Box>
          </Box>
        );
      },
      sortComparator: (v1, v2) => new Date(v1) - new Date(v2)
    },
    {
      field: 'patient',
      headerName: 'Patient',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const patient = params.value;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 30, height: 30, mr: 1, bgcolor: theme.palette.primary.light }}>
              {patient?.name ? patient.name.charAt(0) : 'P'}
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
      },
      valueGetter: (params) => params.row.patient
    },
    {
      field: 'doctor',
      headerName: 'Doctor',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const doctor = params.value;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 30, height: 30, mr: 1, bgcolor: theme.palette.secondary.light }}>
              <DoctorIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {doctor?.name || 'Unassigned'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {doctor?.profile?.specialization || 'No specialization'}
              </Typography>
            </Box>
          </Box>
        );
      },
      valueGetter: (params) => params.row.doctor
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.info.main, 0.1),
            color: theme.palette.info.dark,
            fontWeight: 500
          }}
        />
      )
    },
    {
      field: 'reason',
      headerName: 'Reason',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Tooltip title={params.value || 'No reason provided'}>
          <Typography variant="body2" noWrap>
            {params.value || 'No reason provided'}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={statusLabels[params.value] || params.value}
          color={statusColors[params.value] || 'default'}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex' }}>
          {params.row.status === 'pending' && (
            <Tooltip title="Approve">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleApprove(params.row)}
                sx={{ mr: 0.5 }}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {params.row.status === 'pending' && (
            <Tooltip title="Reject">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleReject(params.row)}
                sx={{ mr: 0.5 }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleViewDetails(params.row)}
              sx={{ mr: 0.5 }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="default"
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];
  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchData();
  }, [statusFilter, tabValue]);

  // Function to fetch appointments and related data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Build query parameters for filtering
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (dateRange.startDate) {
        params.append('startDate', dateRange.startDate);
      }
      if (dateRange.endDate) {
        params.append('endDate', dateRange.endDate);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      // Make API requests in parallel
      const [appointmentsRes, doctorsRes, patientsRes] = await Promise.all([
        axios.get(`/api/appointments/hospital?${params.toString()}`),
        axios.get('/api/doctors/hospital'),
        axios.get('/api/patients/hospital')
      ]);

      // Update state with fetched data
      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);

      // Filter appointments based on tab value
      if (tabValue === 1) { // Pending
        setAppointments(appointmentsRes.data.filter(apt => apt.status === 'pending'));
      } else if (tabValue === 2) { // Confirmed
        setAppointments(appointmentsRes.data.filter(apt => apt.status === 'confirmed'));
      } else if (tabValue === 3) { // Completed
        setAppointments(appointmentsRes.data.filter(apt => apt.status === 'completed'));
      } else if (tabValue === 4) { // Cancelled
        setAppointments(appointmentsRes.data.filter(apt => apt.status === 'cancelled'));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data. Please try again.');
      setLoading(false);

      // Show error in snackbar
      setSnackbarMessage('Failed to load appointments. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [statusFilter, dateRange, searchQuery, tabValue]);

  // Function to refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData().finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  };

  // Function to handle form submission for creating/updating appointments
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError('');

      const formData = new FormData(event.target);
      const appointmentData = {
        patient: formData.get('patient'),
        doctor: formData.get('doctor'),
        date: formData.get('date'),
        type: formData.get('type'),
        reason: formData.get('reason'),
        notes: formData.get('notes')
      };

      // Validate required fields
      if (!appointmentData.patient || !appointmentData.doctor || !appointmentData.date || !appointmentData.type || !appointmentData.reason) {
        setError('Please fill in all required fields');
        return;
      }

      let response;
      if (selectedAppointment) {
        // Update existing appointment
        response = await axios.put(`/api/appointments/${selectedAppointment.id}`, appointmentData);
        setSnackbarMessage('Appointment updated successfully');
      } else {
        // Create new appointment - use the admin endpoint
        response = await axios.post('/api/appointments/admin', appointmentData);
        setSnackbarMessage('Appointment created successfully');
      }

      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving appointment:', error);
      setError(error.response?.data?.message || 'Error saving appointment');

      setSnackbarMessage('Failed to save appointment. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Function to handle appointment deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`/api/appointments/${id}`);

        setSnackbarMessage('Appointment deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        fetchData();
      } catch (error) {
        console.error('Error deleting appointment:', error);

        setSnackbarMessage('Failed to delete appointment. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  // Function to handle appointment approval
  const handleApprove = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenStatusDialog(true);
  };

  // Function to handle appointment rejection
  const handleReject = (appointment) => {
    setSelectedAppointment(appointment);
    setRejectionReason('');
    setOpenRejectDialog(true);
  };

  // Function to view appointment details
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDetailsDialog(true);
  };

  // Function to update appointment status
  const updateAppointmentStatus = async (appointmentId, status, doctorId = null, rejectionReason = null) => {
    try {
      const payload = {
        status,
        notes: `Status updated to ${status}`
      };

      // Add doctorId if provided
      if (doctorId) {
        payload.doctorId = doctorId;
      }

      // Add rejection reason if provided
      if (rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      await axios.put(`/api/appointments/${appointmentId}/status`, payload);

      // Show success message
      setSnackbarMessage(`Appointment ${status === 'confirmed' ? 'approved' : status} successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Close dialogs
      setOpenStatusDialog(false);
      setOpenRejectDialog(false);

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error updating appointment status:', error);

      setSnackbarMessage('Failed to update appointment status. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Function to confirm appointment approval
  const handleConfirmApproval = () => {
    if (selectedAppointment) {
      updateAppointmentStatus(selectedAppointment.id, 'confirmed', selectedDoctor || selectedAppointment.doctor?.id);
    }
  };

  // Function to confirm appointment rejection
  const handleConfirmRejection = () => {
    if (selectedAppointment && rejectionReason) {
      updateAppointmentStatus(selectedAppointment.id, 'cancelled', null, rejectionReason);
    } else {
      setError('Please provide a reason for rejection');
    }
  };

  // Function to handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Function to handle search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Function to apply search
  const applySearch = () => {
    fetchData();
  };

  // Function to clear filters
  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setDateRange({ startDate: '', endDate: '' });
    fetchData();
  };
  // Single return statement with conditional rendering
  return (
    <Container maxWidth="lg">
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ mt: 4, mb: 4 }}>
          {/* Header section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              Appointments Management
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedAppointment(null);
                  setOpenForm(true);
                }}
                sx={{ mr: 1 }}
              >
                New Appointment
              </Button>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={handleRefresh}
                  color="primary"
                  sx={{
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Tabs for filtering by status */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All Appointments" />
              <Tab
                label={
                  <Badge
                    badgeContent={appointments.filter(a => a.status === 'pending').length}
                    color="warning"
                    max={99}
                  >
                    Pending
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge
                    badgeContent={appointments.filter(a => a.status === 'confirmed').length}
                    color="success"
                    max={99}
                  >
                    Confirmed
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge
                    badgeContent={appointments.filter(a => a.status === 'completed').length}
                    color="info"
                    max={99}
                  >
                    Completed
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge
                    badgeContent={appointments.filter(a => a.status === 'cancelled').length}
                    color="error"
                    max={99}
                  >
                    Cancelled
                  </Badge>
                }
              />
            </Tabs>
          </Paper>

          {/* Search and filter section */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      applySearch();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={applySearch}
                    fullWidth
                  >
                    Filter
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                  >
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Appointments data grid */}
          <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={appointments}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              disableSelectionOnClick
              components={{
                Toolbar: GridToolbar,
              }}
              loading={refreshing}
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            />
          </Paper>

          {/* Appointment Form Dialog */}
          <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
              <DialogTitle>
                {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Patient</InputLabel>
                      <Select
                        name="patient"
                        defaultValue={selectedAppointment?.patient?._id || ''}
                        label="Patient"
                        required
                      >
                        {patients.map((patient) => (
                          <MenuItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Doctor</InputLabel>
                      <Select
                        name="doctor"
                        defaultValue={selectedAppointment?.doctor?._id || ''}
                        label="Doctor"
                        required
                      >
                        {doctors.map((doctor) => (
                          <MenuItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="date"
                      label="Date and Time"
                      type="datetime-local"
                      defaultValue={selectedAppointment?.date ? new Date(selectedAppointment.date).toISOString().slice(0, 16) : ''}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        name="type"
                        defaultValue={selectedAppointment?.type || ''}
                        label="Type"
                        required
                      >
                        {appointmentTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="reason"
                      label="Reason"
                      multiline
                      rows={2}
                      defaultValue={selectedAppointment?.reason || ''}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="notes"
                      label="Notes"
                      multiline
                      rows={2}
                      defaultValue={selectedAppointment?.notes || ''}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenForm(false)}>Cancel</Button>
                <Button type="submit" variant="contained">
                  {selectedAppointment ? 'Update' : 'Create'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          {/* Appointment Approval Dialog */}
          <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Approve Appointment</DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to approve this appointment?
              </Typography>

              {selectedAppointment && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Appointment Details:</Typography>
                  <Typography variant="body2">
                    <strong>Patient:</strong> {selectedAppointment.patient?.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {selectedAppointment.type}
                  </Typography>
                </Box>
              )}

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Assign Doctor</InputLabel>
                <Select
                  value={selectedDoctor || selectedAppointment?.doctor?._id || ''}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  label="Assign Doctor"
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.profile?.specialization || 'No specialization'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Note: If this is a new patient, they will be automatically registered to your hospital.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleConfirmApproval}
                disabled={!selectedDoctor && !selectedAppointment?.doctor?._id}
              >
                Approve
              </Button>
            </DialogActions>
          </Dialog>

          {/* Appointment Rejection Dialog */}
          <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Reject Appointment</DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                Please provide a reason for rejecting this appointment:
              </Typography>

              {selectedAppointment && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Appointment Details:</Typography>
                  <Typography variant="body2">
                    <strong>Patient:</strong> {selectedAppointment.patient?.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {selectedAppointment.type}
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Rejection Reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                error={!rejectionReason && error}
                helperText={!rejectionReason && error ? 'Reason is required' : ''}
                sx={{ mt: 2 }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Note: The patient will be notified with this reason.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleConfirmRejection}
                disabled={!rejectionReason}
              >
                Reject
              </Button>
            </DialogActions>
          </Dialog>

          {/* Appointment Details Dialog */}
          <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogContent>
              {selectedAppointment && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1 }} /> Patient Information
                        </Typography>
                        <Typography variant="body1">
                          <strong>Name:</strong> {selectedAppointment.patient?.name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong> {selectedAppointment.patient?.email}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Phone:</strong> {selectedAppointment.patient?.phone || 'Not provided'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <DoctorIcon sx={{ mr: 1 }} /> Doctor Information
                        </Typography>
                        <Typography variant="body1">
                          <strong>Name:</strong> {selectedAppointment.doctor?.name || 'Not assigned'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Specialization:</strong> {selectedAppointment.doctor?.profile?.specialization || 'Not specified'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarMonthIcon sx={{ mr: 1 }} /> Appointment Details
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Date:</strong> {format(new Date(selectedAppointment.date), 'MMMM dd, yyyy')}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Time:</strong> {format(new Date(selectedAppointment.date), 'h:mm a')}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Type:</strong> {selectedAppointment.type}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Status:</strong>
                              <Chip
                                label={statusLabels[selectedAppointment.status] || selectedAppointment.status}
                                color={statusColors[selectedAppointment.status] || 'default'}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Created:</strong> {new Date(selectedAppointment.createdAt).toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <AssignmentIcon sx={{ mr: 1 }} /> Reason & Notes
                        </Typography>
                        <Typography variant="subtitle2">Reason:</Typography>
                        <Typography variant="body2" paragraph>
                          {selectedAppointment.reason || 'No reason provided'}
                        </Typography>

                        <Typography variant="subtitle2">Notes:</Typography>
                        <Typography variant="body2">
                          {selectedAppointment.notes || 'No notes available'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
              {selectedAppointment && selectedAppointment.status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      setOpenDetailsDialog(false);
                      handleApprove(selectedAppointment);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      setOpenDetailsDialog(false);
                      handleReject(selectedAppointment);
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Container>
  );
  };

export default HospitalAppointments;