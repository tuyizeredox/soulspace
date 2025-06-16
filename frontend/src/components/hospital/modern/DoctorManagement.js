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
  LocalHospital as DoctorIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Work as WorkIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';

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
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
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
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Urology',
    'Ophthalmology',
    'ENT',
    'Anesthesiology',
    'Emergency Medicine',
    'Family Medicine',
    'Internal Medicine',
    'Obstetrics & Gynecology'
  ];

  // Departments list
  const departments = [
    'General',
    'Emergency',
    'ICU',
    'Surgery',
    'Pediatrics',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Radiology',
    'Laboratory',
    'Pharmacy',
    'Outpatient',
    'Inpatient'
  ];

  // Fetch doctors data
  const fetchDoctors = useCallback(async (abortController) => {
    try {
      setLoading(true);
      setError('');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      const requestId = Math.random().toString(36).substr(2, 9);
      console.log(`[${requestId}] Fetching doctors with token:`, token ? 'Token present' : 'No token');
      console.log(`[${requestId}] User info:`, user);

      // Try with native fetch to bypass axios interceptors
      const response = await fetch('/api/doctors/hospital', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`[${requestId}] Request completed successfully, status:`, response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      console.log('Doctors response content type:', contentType);
      
      // If not JSON, log the actual response text for debugging
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.log('Non-JSON response received:', responseText.substring(0, 500) + '...');
        
        // If it's an HTML response with a redirect, it might be an authentication issue
        if (responseText.includes('<html') && (responseText.includes('login') || responseText.includes('auth'))) {
          console.warn('Authentication issue detected, using empty data as fallback');
          // Use empty data as fallback instead of throwing an error
          setDoctors([]);
          setError('Authentication required. Please refresh the page or log in again.');
          return;
        } else {
          console.warn('Non-JSON response, using empty data as fallback');
          // Use empty data as fallback instead of throwing an error
          setDoctors([]);
          return;
        }
      }
      
      const data = await response.json();
      console.log('Doctors response:', data);
      setDoctors(data || []);
      
    } catch (error) {
      const requestId = Math.random().toString(36).substr(2, 9);
      console.error(`[${requestId}] Error fetching doctors:`, error);
      console.error(`[${requestId}] Error message:`, error.message);
      
      setError(error.message || 'Failed to fetch doctors data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    console.log('DoctorManagement useEffect triggered, token:', !!token);
    console.log('fetchDoctors function reference:', fetchDoctors);
    if (token) {
      console.log('Calling fetchDoctors...');
      fetchDoctors();
    }
  }, [fetchDoctors, token]);

  // Filter doctors based on search and filters
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchQuery || 
      doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.department?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialization = specializationFilter === 'all' || 
      doctor.specialization === specializationFilter;
    
    const matchesStatus = statusFilter === 'all' || doctor.status === statusFilter;
    
    return matchesSearch && matchesSpecialization && matchesStatus;
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
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
      
      let response;
      if (editingDoctor) {
        response = await fetch(`/api/doctors/${editingDoctor.id || editingDoctor._id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        setSuccess('Doctor updated successfully');
      } else {
        response = await fetch('/api/doctors', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        setSuccess('Doctor created successfully');
      }
      
      setOpenDialog(false);
      resetForm();
      fetchDoctors();
      
    } catch (error) {
      console.error('Error saving doctor:', error);
      setError(error.message || 'Failed to save doctor');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle delete doctor
  const handleDelete = async () => {
    if (!doctorToDelete) return;
    
    try {
      setSubmitLoading(true);
      
      const response = await fetch(`/api/doctors/${doctorToDelete.id || doctorToDelete._id}`, {
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
      
      setSuccess('Doctor deleted successfully');
      setDeleteDialog(false);
      setDoctorToDelete(null);
      fetchDoctors();
      
    } catch (error) {
      console.error('Error deleting doctor:', error);
      setError(error.message || 'Failed to delete doctor');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Form helpers
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'doctor',
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
      password: '', // Don't populate password for editing
      role: doctor.role || 'doctor',
      profile: {
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        department: doctor.department || '',
        qualifications: doctor.qualifications || '',
        experience: doctor.experience?.toString() || '',
        bio: doctor.bio || ''
      }
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSpecializationFilter('all');
    setStatusFilter('all');
  };

  // DataGrid columns
  const columns = [
    {
      field: 'name',
      headerName: 'Doctor',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: params.row.status === 'active' ? 'success.main' : 'grey.400',
                  border: '2px solid white'
                }}
              />
            }
          >
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
          </Badge>
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              Dr. {params.value}
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
        <Chip 
          label={params.value || 'General'} 
          size="small" 
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      )
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WorkIcon color="action" fontSize="small" />
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
      field: 'experience',
      headerName: 'Experience',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon color="warning" fontSize="small" />
          <Typography variant="body2">
            {params.value ? `${params.value} years` : 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'qualifications',
      headerName: 'Qualifications',
      width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value || 'No qualifications listed'}>
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
              (params.value.length > 25 ? `${params.value.substring(0, 25)}...` : params.value) : 
              'Not specified'
            }
          </Typography>
        </Tooltip>
      )
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
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
            Doctor Management (Modern v2.0)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage hospital doctors and their professional information
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchDoctors()}
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
                Showing {filteredDoctors.length} of {doctors.length} doctors
              </Typography>
            </Grid>

            <Grid item xs={12} md={2}>
              {(specializationFilter !== 'all' || statusFilter !== 'all') && (
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
                <Typography variant="subtitle1" fontWeight={600} color="primary.main" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DoctorIcon color="action" />
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
                  label={editingDoctor ? "New Password (leave blank to keep current)" : "Password"}
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              {/* Professional Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} color="primary.main" gutterBottom sx={{ mt: 2 }}>
                  Professional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <StarIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Qualifications"
                  value={formData.profile.qualifications}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    profile: { ...formData.profile, qualifications: e.target.value }
                  })}
                  placeholder="e.g., MBBS, MD, PhD"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio / Additional Information"
                  multiline
                  rows={3}
                  value={formData.profile.bio}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    profile: { ...formData.profile, bio: e.target.value }
                  })}
                  placeholder="Brief description about the doctor's expertise and background"
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
              {submitLoading ? 'Saving...' : (editingDoctor ? 'Update Doctor' : 'Add Doctor')}
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
            Delete Doctor
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete Dr. "{doctorToDelete?.name}"? 
            This action cannot be undone and will affect all related appointments and patient assignments.
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

export default DoctorManagement;