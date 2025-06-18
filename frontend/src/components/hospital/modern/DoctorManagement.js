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
  Tab,
  Tabs
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
  LocalHospital as HospitalIcon,
  School as EducationIcon,
  Work as ExperienceIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import axios from '../../../utils/axiosConfig';
import DoctorScheduleManagement from '../doctor/DoctorScheduleManagement';
import ScheduleApprovalQueue from '../doctor/ScheduleApprovalQueue';

const DoctorManagement = () => {
  const theme = useTheme();
  const { user, token } = useSelector((state) => state.userAuth);
  
  // State management
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Tab management
  const [activeTab, setActiveTab] = useState(0);
  
  // Schedule management states
  const [pendingSchedules, setPendingSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    status: 'active',
    profile: {
      phone: '',
      specialization: '',
      department: '',
      qualifications: '',
      experience: '',
      bio: ''
    }
  });

  // Validation errors
  const [formErrors, setFormErrors] = useState({});

  // Specializations list
  const specializations = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Hematology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Urology'
  ];

  // Departments list
  const departments = [
    'Emergency',
    'ICU',
    'Surgery',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Radiology',
    'Laboratory',
    'Pharmacy',
    'Outpatient',
    'Inpatient'
  ];

  // Fetch doctors data
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching doctors - User:', user);
      console.log('User hospitalId:', user?.hospitalId);
      console.log('Token exists:', !!token);

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/doctors/hospital', config);
      console.log('Doctors fetch successful:', response.data?.length || 0, 'doctors');
      console.log('Sample doctor data:', response.data?.[0]);
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(error.response?.data?.message || 'Failed to fetch doctors data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && user) {
      if (!user.hospitalId) {
        setError('Your account is not associated with a hospital. Please contact support.');
        setLoading(false);
        return;
      }
      fetchDoctors();
    }
  }, [token]);

  // Filter doctors based on search and filters
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchQuery || 
      doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doctor.status === statusFilter;
    
    const matchesSpecialization = specializationFilter === 'all' || 
      doctor.specialization === specializationFilter;
    
    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Doctor name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!editingDoctor && !formData.password.trim()) {
      errors.password = 'Password is required for new doctors';
    }
    
    if (!formData.profile.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!formData.profile.specialization.trim()) {
      errors.specialization = 'Specialization is required';
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
        profile: {
          ...formData.profile,
          experience: formData.profile.experience ? parseInt(formData.profile.experience) : 0
        }
      };

      // Remove password if editing and password is empty
      if (editingDoctor && !formData.password.trim()) {
        delete submitData.password;
      }
      
      if (editingDoctor) {
        await axios.put(`/api/doctors/${editingDoctor.id || editingDoctor._id}`, submitData, config);
        setSuccess('Doctor updated successfully');
      } else {
        await axios.post('/api/doctors', submitData, config);
        setSuccess('Doctor created successfully');
      }
      
      setOpenDialog(false);
      resetForm();
      fetchDoctors();
      
    } catch (error) {
      console.error('Error saving doctor:', error);
      setError(error.response?.data?.message || 'Failed to save doctor');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle delete doctor
  const handleDelete = async () => {
    if (!doctorToDelete) return;
    
    try {
      setSubmitLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.delete(`/api/doctors/${doctorToDelete.id || doctorToDelete._id}`, config);
      setSuccess('Doctor deleted successfully');
      setDeleteDialog(false);
      setDoctorToDelete(null);
      fetchDoctors();
      
    } catch (error) {
      console.error('Error deleting doctor:', error);
      setError(error.response?.data?.message || 'Failed to delete doctor');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Fetch pending schedule requests
  const fetchPendingSchedules = useCallback(async () => {
    try {
      setScheduleLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/doctors/schedule-requests/pending', config);
      setPendingSchedules(response.data || []);
    } catch (error) {
      console.error('Error fetching pending schedules:', error);
      // Don't show error for schedules, just log it
    } finally {
      setScheduleLoading(false);
    }
  }, [token]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      // Schedule Management tab
      fetchPendingSchedules();
    }
  };

  // Handle schedule success/error
  const handleScheduleSuccess = (message) => {
    setSuccess(message);
    fetchPendingSchedules();
  };

  const handleScheduleError = (message) => {
    setError(message);
  };

  const handleScheduleRefresh = () => {
    fetchPendingSchedules();
    fetchDoctors();
  };

  // Form helpers
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      status: 'active',
      profile: {
        phone: '',
        specialization: '',
        department: '',
        qualifications: '',
        experience: '',
        bio: ''
      }
    });
    setFormErrors({});
    setEditingDoctor(null);
    setShowPassword(false);
  };

  const openEditDialog = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      password: '',
      status: doctor.status || 'active',
      profile: {
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        department: doctor.department || '',
        qualifications: doctor.qualifications || '',
        experience: doctor.experience || '',
        bio: doctor.bio || ''
      }
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSpecializationFilter('all');
  };

  // DataGrid columns
  const columns = [
    {
      field: 'name',
      headerName: 'Doctor',
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
            {params.value?.charAt(0)?.toUpperCase() || 'D'}
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
      field: 'specialization',
      headerName: 'Specialization',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HospitalIcon color="action" fontSize="small" />
          <Typography variant="body2">{params.value || 'General'}</Typography>
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
      field: 'department',
      headerName: 'Department',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">{params.value || 'General'}</Typography>
      )
    },
    {
      field: 'experience',
      headerName: 'Experience',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ExperienceIcon color="action" fontSize="small" />
          <Typography variant="body2">
            {params.value ? `${params.value} years` : 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const status = params.value || 'active';
        const colors = {
          active: 'success',
          inactive: 'default'
        };
        return (
          <Chip 
            label={status.charAt(0).toUpperCase() + status.slice(1)} 
            size="small" 
            color={colors[status] || 'default'}
            variant="filled"
          />
        );
      }
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
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
          <Tooltip title="Edit Doctor">
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
          <Tooltip title="Delete Doctor">
            <IconButton 
              size="small" 
              onClick={() => {
                setDoctorToDelete(params.row);
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

  // Debug: Show user data
  if (!user?.hospitalId && user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Hospital ID Missing
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Your account is not associated with a hospital. Please log out and log in again, or contact support.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Current User Data:</strong>
          </Typography>
          <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
          >
            Logout and Login Again
          </Button>
        </Alert>
      </Box>
    );
  }

  if (loading && doctors.length === 0) {
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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            Doctor Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage hospital doctors and their information
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDoctors}
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
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            Add Doctor
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
                    fetchDoctors();
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

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              py: 2
            }
          }}
        >
          <Tab 
            label="Doctor Management" 
            icon={<PersonIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Schedule Management" 
            icon={<ScheduleIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Schedule Approvals" 
            icon={<AssignmentIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Search and Filters */}
      <Card sx={{ mb: 3, overflow: 'visible' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search doctors by name, email, specialization..."
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
                    bgcolor: alpha(theme.palette.background.paper, 0.8)
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
            
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {filteredDoctors.length} of {doctors.length} doctors
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              {(searchQuery || statusFilter !== 'all' || specializationFilter !== 'all') && (
                <Button
                  variant="outlined"
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
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Specialization</InputLabel>
                    <Select
                      value={specializationFilter}
                      onChange={(e) => setSpecializationFilter(e.target.value)}
                      label="Specialization"
                    >
                      <MenuItem value="all">All Specializations</MenuItem>
                      {specializations.map((spec) => (
                        <MenuItem key={spec} value={spec}>
                          {spec}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
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
          rows={filteredDoctors.map((doctor, index) => ({ 
            ...doctor, 
            id: doctor.id || doctor._id || `doctor-${index}-${doctor.email || doctor.name || Math.random()}` 
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
        </>
      )}

      {/* Schedule Management Tab */}
      {activeTab === 1 && (
        <Box sx={{ mt: 2 }}>
          <DoctorScheduleManagement
            doctors={doctors}
            onRefresh={handleScheduleRefresh}
            onSuccess={handleScheduleSuccess}
            onError={handleScheduleError}
          />
        </Box>
      )}

      {/* Schedule Approvals Tab */}
      {activeTab === 2 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Pending Schedule Approvals
          </Typography>
          {scheduleLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ScheduleApprovalQueue
              pendingSchedules={pendingSchedules}
              onRefresh={handleScheduleRefresh}
              onSuccess={handleScheduleSuccess}
              onError={handleScheduleError}
            />
          )}
        </Box>
      )}

      {/* Add/Edit Doctor Dialog */}
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
            {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {editingDoctor ? 'Update doctor information' : 'Enter doctor details to add them to the system'}
          </Typography>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Basic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
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
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={editingDoctor ? "New Password (leave empty to keep current)" : "Password"}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  required={!editingDoctor}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
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
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Professional Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Professional Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.profile.phone}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    profile: { ...formData.profile, phone: e.target.value }
                  })}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!formErrors.specialization}>
                  <InputLabel>Specialization</InputLabel>
                  <Select
                    value={formData.profile.specialization}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      profile: { ...formData.profile, specialization: e.target.value }
                    })}
                    label="Specialization"
                  >
                    {specializations.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.specialization && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {formErrors.specialization}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={formData.profile.department}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      profile: { ...formData.profile, department: e.target.value }
                    })}
                    label="Department"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  type="number"
                  value={formData.profile.experience}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    profile: { ...formData.profile, experience: e.target.value }
                  })}
                  InputProps={{
                    inputProps: { min: 0, max: 50 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Qualifications"
                  multiline
                  rows={2}
                  value={formData.profile.qualifications}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    profile: { ...formData.profile, qualifications: e.target.value }
                  })}
                  placeholder="e.g., MBBS, MD, Fellowship in Cardiology"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={formData.profile.bio}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    profile: { ...formData.profile, bio: e.target.value }
                  })}
                  placeholder="Brief professional bio..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 0 }}>
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
              startIcon={submitLoading ? <CircularProgress size={20} /> : null}
            >
              {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete Dr. {doctorToDelete?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} disabled={submitLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            color="error" 
            variant="contained"
            disabled={submitLoading}
            startIcon={submitLoading ? <CircularProgress size={20} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorManagement;