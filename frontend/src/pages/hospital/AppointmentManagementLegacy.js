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
  Tabs,
  Tab
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
  Check as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import axios from '../../utils/axios';

const AppointmentManagement = () => {
  const theme = useTheme();
  const { user, token } = useSelector((state) => state.userAuth);
  
  // State
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    type: 'consultation',
    reason: '',
    notes: '',
    status: 'pending'
  });

  // Appointment types
  const appointmentTypes = [
    'consultation',
    'checkup',
    'follow-up',
    'emergency',
    'surgery',
    'therapy'
  ];

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'confirmed', label: 'Confirmed', color: 'info' },
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [appointmentsRes, doctorsRes, patientsRes] = await Promise.all([
        axios.get('/api/appointments/hospital', config),
        axios.get('/api/doctors/hospital', config),
        axios.get('/api/patients/hospital', config)
      ]);
      
      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter appointments
  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Filter by tab
    if (tabValue === 1) filtered = filtered.filter(apt => apt.status === 'pending');
    else if (tabValue === 2) filtered = filtered.filter(apt => apt.status === 'confirmed');
    else if (tabValue === 3) filtered = filtered.filter(apt => apt.status === 'completed');
    else if (tabValue === 4) filtered = filtered.filter(apt => apt.status === 'cancelled');

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(apt => {
        const patient = patients.find(p => p._id === apt.patientId);
        const doctor = doctors.find(d => d._id === apt.doctorId);
        return (
          patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.reason?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Filter by doctor
    if (doctorFilter !== 'all') {
      filtered = filtered.filter(apt => apt.doctorId === doctorFilter);
    }

    return filtered;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const appointmentData = {
        ...formData,
        appointmentDateTime: `${formData.appointmentDate}T${formData.appointmentTime}`
      };
      
      if (editingAppointment) {
        await axios.put(`/api/appointments/${editingAppointment._id}/status`, 
          { status: formData.status }, config);
        setSuccess('Appointment updated successfully');
      } else {
        await axios.post('/api/appointments/admin', appointmentData, config);
        setSuccess('Appointment created successfully');
      }
      
      setOpenDialog(false);
      resetForm();
      fetchData();
      
    } catch (error) {
      console.error('Error saving appointment:', error);
      setError(error.response?.data?.message || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!token || !appointmentToDelete) return;
    
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`/api/appointments/${appointmentToDelete._id}`, config);
      setSuccess('Appointment deleted successfully');
      setDeleteDialog(false);
      setAppointmentToDelete(null);
      fetchData();
      
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError(error.response?.data?.message || 'Failed to delete appointment');
    } finally {
      setLoading(false);
    }
  };

  // Quick status update
  const updateStatus = async (appointmentId, newStatus) => {
    if (!token) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/appointments/${appointmentId}/status`, 
        { status: newStatus }, config);
      setSuccess(`Appointment ${newStatus} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Form helpers
  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      type: 'consultation',
      reason: '',
      notes: '',
      status: 'pending'
    });
    setEditingAppointment(null);
  };

  const openEditDialog = (appointment) => {
    setEditingAppointment(appointment);
    const appointmentDate = appointment.appointmentDateTime ? 
      format(parseISO(appointment.appointmentDateTime), 'yyyy-MM-dd') : '';
    const appointmentTime = appointment.appointmentDateTime ? 
      format(parseISO(appointment.appointmentDateTime), 'HH:mm') : '';
    
    setFormData({
      patientId: appointment.patientId || '',
      doctorId: appointment.doctorId || '',
      appointmentDate,
      appointmentTime,
      type: appointment.type || 'consultation',
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      status: appointment.status || 'pending'
    });
    setOpenDialog(true);
  };

  // DataGrid columns
  const columns = [
    {
      field: 'patient',
      headerName: 'Patient',
      width: 180,
      renderCell: (params) => {
        const patient = patients.find(p => p._id === params.row.patientId);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {patient?.name || 'Unknown'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {patient?.phone || ''}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'doctor',
      headerName: 'Doctor',
      width: 180,
      renderCell: (params) => {
        const doctor = doctors.find(d => d._id === params.row.doctorId);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <DoctorIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {doctor?.name || 'Unassigned'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {doctor?.specialization || ''}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'appointmentDateTime',
      headerName: 'Date & Time',
      width: 160,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.value ? format(parseISO(params.value), 'MMM dd, yyyy') : 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.value ? format(parseISO(params.value), 'hh:mm a') : ''}
          </Typography>
        </Box>
      )
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'consultation'} 
          size="small" 
          variant="outlined"
        />
      )
    },
    {
      field: 'reason',
      headerName: 'Reason',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value || 'No reason provided'}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const statusOption = statusOptions.find(s => s.value === params.value);
        return (
          <Chip 
            label={statusOption?.label || params.value} 
            size="small" 
            color={statusOption?.color || 'default'}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.row.status === 'pending' && (
            <>
              <Tooltip title="Confirm">
                <IconButton 
                  size="small" 
                  onClick={() => updateStatus(params.row._id, 'confirmed')}
                  color="success"
                >
                  <CheckIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton 
                  size="small" 
                  onClick={() => updateStatus(params.row._id, 'cancelled')}
                  color="error"
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          {params.row.status === 'confirmed' && (
            <Tooltip title="Mark Complete">
              <IconButton 
                size="small" 
                onClick={() => updateStatus(params.row._id, 'completed')}
                color="success"
              >
                <CheckIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              onClick={() => openEditDialog(params.row)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={() => {
                setAppointmentToDelete(params.row);
                setDeleteDialog(true);
              }}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const filteredAppointments = getFilteredAppointments();

  if (loading && appointments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={600} color="primary">
            Appointment Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
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
            >
              Add Appointment
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`All (${appointments.length})`} />
            <Tab label={`Pending (${appointments.filter(a => a.status === 'pending').length})`} />
            <Tab label={`Confirmed (${appointments.filter(a => a.status === 'confirmed').length})`} />
            <Tab label={`Completed (${appointments.filter(a => a.status === 'completed').length})`} />
            <Tab label={`Cancelled (${appointments.filter(a => a.status === 'cancelled').length})`} />
          </Tabs>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
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
                        {doctor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Showing: {filteredAppointments.length} appointments
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Data Grid */}
        <Card>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredAppointments.map(appointment => ({ ...appointment, id: appointment._id }))}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              loading={loading}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderBottom: `2px solid ${theme.palette.primary.main}`
                }
              }}
            />
          </Box>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Patient</InputLabel>
                    <Select
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                      label="Patient"
                    >
                      {patients.map((patient) => (
                        <MenuItem key={patient._id} value={patient._id}>
                          {patient.name} - {patient.phone}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Doctor</InputLabel>
                    <Select
                      value={formData.doctorId}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                      label="Doctor"
                    >
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor._id} value={doctor._id}>
                          {doctor.name} - {doctor.specialization}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      label="Type"
                    >
                      {appointmentTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Visit"
                    multiline
                    rows={2}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {editingAppointment ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this appointment? 
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
};

export default AppointmentManagement;