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
  Slide
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Schedule,
  LocalHospital as HospitalIcon,
  Bloodtype as BloodIcon,
  Warning as AllergyIcon,
  Assignment as HistoryIcon,
  ContactPhone as EmergencyIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import axios from '../../../utils/axiosConfig';

const PatientManagement = () => {
  const theme = useTheme();
  const { user, token } = useSelector((state) => state.userAuth);
  
  // State management
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  
  // Form data with comprehensive patient information
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    medicalHistory: '',
    assignedDoctor: '',
    status: 'pending'
  });

  // Validation errors
  const [formErrors, setFormErrors] = useState({});

  // Fetch patients data
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/patients/hospital', config);
      setPatients(response.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError(error.response?.data?.message || 'Failed to fetch patients data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch doctors for assignment
  const fetchDoctors = useCallback(async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/doctors/hospital', config);
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchPatients();
      fetchDoctors();
    }
  }, [fetchPatients, fetchDoctors, token]);

  // Listen for patient list updates from other components
  useEffect(() => {
    const handlePatientListUpdate = (event) => {
      console.log('Patient list update event received:', event.detail);
      // Refresh the patient list when an appointment is confirmed
      if (event.detail?.action === 'appointmentConfirmed') {
        setTimeout(() => {
          fetchPatients();
        }, 1000); // Small delay to ensure backend processing is complete
      }
    };

    window.addEventListener('patientListUpdated', handlePatientListUpdate);
    
    return () => {
      window.removeEventListener('patientListUpdated', handlePatientListUpdate);
    };
  }, [fetchPatients]);

  // Filter patients based on search and filters
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = !searchQuery || 
      patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    const matchesDoctor = doctorFilter === 'all' || 
      patient.assignedDoctor?._id === doctorFilter ||
      patient.assignedDoctor === doctorFilter ||
      patient.primaryDoctor?._id === doctorFilter;
    
    // Assignment status filtering
    const doctor = patient.assignedDoctor || patient.primaryDoctor;
    const hasDoctor = doctor && (typeof doctor === 'object' ? doctor.name : doctor !== 'Unassigned');
    const fromAppointment = patient.assignmentId || patient.primaryDoctor; // Indicates assignment from appointment
    
    let matchesAssignment = true;
    if (assignmentFilter === 'assigned') {
      matchesAssignment = hasDoctor;
    } else if (assignmentFilter === 'unassigned') {
      matchesAssignment = !hasDoctor;
    } else if (assignmentFilter === 'from_appointment') {
      matchesAssignment = hasDoctor && fromAppointment;
    }
    
    return matchesSearch && matchesStatus && matchesDoctor && matchesAssignment;
  });

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Patient name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
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
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const submitData = {
        ...formData,
        assignedDoctor: formData.assignedDoctor || undefined
      };
      
      if (editingPatient) {
        await axios.put(`/api/patients/${editingPatient._id}`, submitData, config);
        setSuccess('Patient updated successfully');
      } else {
        await axios.post('/api/patients', submitData, config);
        setSuccess('Patient created successfully');
      }
      
      setOpenDialog(false);
      resetForm();
      fetchPatients();
      
    } catch (error) {
      console.error('Error saving patient:', error);
      setError(error.response?.data?.message || 'Failed to save patient');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle delete patient
  const handleDelete = async () => {
    if (!patientToDelete) return;
    
    try {
      setSubmitLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.delete(`/api/patients/${patientToDelete._id}`, config);
      setSuccess('Patient deleted successfully');
      setDeleteDialog(false);
      setPatientToDelete(null);
      fetchPatients();
      
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError(error.response?.data?.message || 'Failed to delete patient');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Form helpers
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      medicalHistory: '',
      assignedDoctor: '',
      status: 'pending'
    });
    setFormErrors({});
    setEditingPatient(null);
  };

  const openEditDialog = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      medicalHistory: patient.medicalHistory || '',
      assignedDoctor: patient.assignedDoctor?._id || patient.assignedDoctor || '',
      status: patient.status || 'pending'
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDoctorFilter('all');
    setAssignmentFilter('all');
  };

  // DataGrid columns
  const columns = [
    {
      field: 'name',
      headerName: 'Patient',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: theme.palette.primary.main,
              fontSize: '1rem'
            }}
          >
            {params.value?.charAt(0)?.toUpperCase() || 'P'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'phone',
      headerName: 'Contact',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon color="action" fontSize="small" />
          <Typography variant="body2">{params.value || 'N/A'}</Typography>
        </Box>
      )
    },
    {
      field: 'assignedDoctor',
      headerName: 'Assigned Doctor',
      width: 220,
      renderCell: (params) => {
        const doctor = params.value || params.row.primaryDoctor;
        if (!doctor) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="No Doctor" 
                size="small" 
                variant="outlined"
                color="warning"
                icon={<AllergyIcon />}
              />
            </Box>
          );
        }
        
        const doctorName = typeof doctor === 'object' ? doctor.name : doctor;
        const specialization = typeof doctor === 'object' ? doctor.profile?.specialization : null;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: theme.palette.primary.main,
                fontSize: '0.875rem'
              }}
            >
              {doctorName?.charAt(0)?.toUpperCase() || 'D'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {doctorName}
              </Typography>
              {specialization && (
                <Typography variant="caption" color="text.secondary">
                  {specialization}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status & Assignment',
      width: 180,
      renderCell: (params) => {
        const status = params.value || 'pending';
        const doctor = params.row.assignedDoctor || params.row.primaryDoctor;
        const hasDoctor = doctor && (typeof doctor === 'object' ? doctor.name : doctor !== 'Unassigned');
        
        const statusColors = {
          pending: 'warning',
          active: 'success',
          inactive: 'default',
          discharged: 'info'
        };
        
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Chip 
              label={status.charAt(0).toUpperCase() + status.slice(1)} 
              size="small" 
              color={statusColors[status] || 'default'}
              variant="filled"
            />
            {hasDoctor ? (
              <Chip 
                label="Doctor Assigned" 
                size="small" 
                color="success"
                variant="outlined"
                icon={<HospitalIcon />}
              />
            ) : (
              <Chip 
                label="Needs Assignment" 
                size="small" 
                color="warning"
                variant="outlined"
                icon={<AllergyIcon />}
              />
            )}
          </Box>
        );
      }
    },
    {
      field: 'medicalHistory',
      headerName: 'Medical History',
      width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value || 'No medical history'}>
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
              'No history'
            }
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'assignmentSource',
      headerName: 'Assignment Source',
      width: 180,
      renderCell: (params) => {
        const doctor = params.row.assignedDoctor || params.row.primaryDoctor;
        const hasDoctor = doctor && (typeof doctor === 'object' ? doctor.name : doctor !== 'Unassigned');
        
        if (!hasDoctor) {
          return (
            <Typography variant="body2" color="text.secondary">
              No assignment
            </Typography>
          );
        }
        
        // Check if assignment came from appointment (this would be determined by your backend logic)
        const fromAppointment = params.row.assignmentId || params.row.primaryDoctor;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {fromAppointment ? (
              <>
                <CalendarIcon color="success" fontSize="small" />
                <Box>
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                    Via Appointment
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Auto-assigned
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <PersonIcon color="primary" fontSize="small" />
                <Box>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                    Manual Assignment
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Admin assigned
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        );
      }
    },
    {
      field: 'createdAt',
      headerName: 'Registered',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value ? format(parseISO(params.value), 'MMM dd, yyyy') : 'N/A'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit Patient">
            <IconButton 
              size="small" 
              onClick={() => openEditDialog(params.row)}
              color="primary"
              sx={{ 
                '&:hover': { 
                  bgcolor: alpha(theme.palette.primary.main, 0.1) 
                } 
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Patient">
            <IconButton 
              size="small" 
              onClick={() => {
                setPatientToDelete(params.row);
                setDeleteDialog(true);
              }}
              color="error"
              sx={{ 
                '&:hover': { 
                  bgcolor: alpha(theme.palette.error.main, 0.1) 
                } 
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  if (loading && patients.length === 0) {
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
              Patient Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage hospital patients and their medical information
            </Typography>
          </Box>
        </Box>

        {/* Patient Statistics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              textAlign: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <Typography variant="h4" color="primary.main" fontWeight={700}>
                {patients.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Patients
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              textAlign: 'center',
              backgroundColor: alpha(theme.palette.success.main, 0.05),
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
            }}>
              <Typography variant="h4" color="success.main" fontWeight={700}>
                {patients.filter(p => p.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Patients
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              textAlign: 'center',
              backgroundColor: alpha(theme.palette.success.main, 0.05),
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
            }}>
              <Typography variant="h4" color="success.main" fontWeight={700}>
                {patients.filter(p => {
                  const doctor = p.assignedDoctor || p.primaryDoctor;
                  return doctor && (typeof doctor === 'object' ? doctor.name : doctor !== 'Unassigned');
                }).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                With Doctors
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              textAlign: 'center',
              backgroundColor: alpha(theme.palette.warning.main, 0.05),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
            }}>
              <Typography variant="h4" color="warning.main" fontWeight={700}>
                {patients.filter(p => {
                  const doctor = p.assignedDoctor || p.primaryDoctor;
                  return !doctor || (typeof doctor === 'string' && doctor === 'Unassigned');
                }).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Need Assignment
              </Typography>
            </Card>
          </Grid>
        </Grid>
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPatients}
            disabled={loading}
            sx={{ minWidth: 'auto' }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Schedule />}
            onClick={() => window.open('/hospital/appointments', '_blank')}
            sx={{ minWidth: 'auto' }}
          >
            Manage Appointments
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            Add Patient
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      <Fade in={!!error}>
        <Box sx={{ mb: 2 }}>
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError('')}
              sx={{ mb: 2 }}
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
                placeholder="Search patients by name, email, or phone..."
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
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredPatients.length} of {patients.length} patients
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
                  {assignmentFilter === 'all' && (
                    <>
                      <Chip 
                        label={`${patients.filter(p => {
                          const doctor = p.assignedDoctor || p.primaryDoctor;
                          return doctor && (typeof doctor === 'object' ? doctor.name : doctor !== 'Unassigned');
                        }).length} assigned`}
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`${patients.filter(p => {
                          const doctor = p.assignedDoctor || p.primaryDoctor;
                          return !doctor || (typeof doctor === 'string' && doctor === 'Unassigned');
                        }).length} unassigned`}
                        size="small" 
                        color="warning" 
                        variant="outlined"
                      />
                    </>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              {(statusFilter !== 'all' || doctorFilter !== 'all' || assignmentFilter !== 'all') && (
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
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Assigned Doctor</InputLabel>
                    <Select
                      value={doctorFilter}
                      onChange={(e) => setDoctorFilter(e.target.value)}
                      label="Assigned Doctor"
                    >
                      <MenuItem value="all">All Doctors</MenuItem>
                      <MenuItem value="">Unassigned</MenuItem>
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor._id} value={doctor._id}>
                          {doctor.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Assignment Status</InputLabel>
                    <Select
                      value={assignmentFilter}
                      onChange={(e) => setAssignmentFilter(e.target.value)}
                      label="Assignment Status"
                    >
                      <MenuItem value="all">All Patients</MenuItem>
                      <MenuItem value="assigned">With Doctor</MenuItem>
                      <MenuItem value="unassigned">Need Assignment</MenuItem>
                      <MenuItem value="from_appointment">Via Appointment</MenuItem>
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
          rows={filteredPatients.map((patient, index) => ({ 
            ...patient, 
            id: patient._id || patient.id || `patient-${index}-${patient.email || patient.name || Math.random()}` 
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
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.02)
            }
          }}
        />
      </Paper>

      {/* Add/Edit Patient Dialog */}
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
            {editingPatient ? 'Edit Patient' : 'Add New Patient'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {editingPatient ? 'Update patient information' : 'Enter patient details to add them to the system'}
          </Typography>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Assigned Doctor (Optional)</InputLabel>
                  <Select
                    value={formData.assignedDoctor}
                    onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                    label="Assigned Doctor (Optional)"
                  >
                    <MenuItem value="">No Doctor Assigned</MenuItem>
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor._id} value={doctor._id}>
                        {doctor.name} - {doctor.specialization || 'General'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medical History"
                  multiline
                  rows={4}
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder="Enter patient's medical history, conditions, allergies, etc."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <HistoryIcon color="action" />
                      </InputAdornment>
                    )
                  }}
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
            >
              {submitLoading ? 'Saving...' : (editingPatient ? 'Update Patient' : 'Add Patient')}
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
            Delete Patient
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete patient "{patientToDelete?.name}"? 
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
  );
};

export default PatientManagement;