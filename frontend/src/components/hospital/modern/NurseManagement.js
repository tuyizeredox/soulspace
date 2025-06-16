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
  Badge,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  LocalHospital as NurseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import axios from '../../../utils/axios';

const NurseManagement = () => {
  const theme = useTheme();
  const { user, token } = useSelector((state) => state.userAuth);
  
  // State management
  const [nurses, setNurses] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNurse, setEditingNurse] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [nurseToDelete, setNurseToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [nurseToAssign, setNurseToAssign] = useState(null);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'nurse',
    profile: {
      phone: '',
      department: '',
      shift: '',
      qualifications: '',
      experience: '',
      specialization: ''
    }
  });

  // Validation errors
  const [formErrors, setFormErrors] = useState({});

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
    'Maternity',
    'Oncology',
    'Radiology',
    'Laboratory',
    'Outpatient',
    'Inpatient'
  ];

  // Shifts list
  const shifts = [
    'Day Shift (7 AM - 7 PM)',
    'Night Shift (7 PM - 7 AM)',
    'Morning Shift (6 AM - 2 PM)',
    'Evening Shift (2 PM - 10 PM)',
    'Rotating Shift'
  ];

  // Specializations for nurses
  const nurseSpecializations = [
    'General Nursing',
    'Critical Care',
    'Emergency Nursing',
    'Pediatric Nursing',
    'Surgical Nursing',
    'Cardiac Nursing',
    'Oncology Nursing',
    'Mental Health Nursing',
    'Community Health',
    'Geriatric Nursing',
    'Obstetric Nursing',
    'Operating Room Nursing'
  ];

  // Fetch nurses data
  const fetchNurses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/nurses/hospital', config);
      setNurses(response.data || []);
    } catch (error) {
      console.error('Error fetching nurses:', error);
      setError(error.response?.data?.message || 'Failed to fetch nurses data. Please try again.');
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
      fetchNurses();
      fetchDoctors();
    }
  }, [fetchNurses, fetchDoctors, token]);

  // Filter nurses based on search and filters
  const filteredNurses = nurses.filter(nurse => {
    const matchesSearch = !searchQuery || 
      nurse.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nurse.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nurse.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nurse.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
      nurse.department === departmentFilter;
    
    const matchesStatus = statusFilter === 'all' || nurse.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nurse name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!editingNurse && !formData.password.trim()) {
      errors.password = 'Password is required for new nurses';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.profile.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!formData.profile.department.trim()) {
      errors.department = 'Department is required';
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
      if (editingNurse && !formData.password.trim()) {
        delete submitData.password;
      }
      
      if (editingNurse) {
        await axios.put(`/api/nurses/${editingNurse._id}`, submitData, config);
        setSuccess('Nurse updated successfully');
      } else {
        await axios.post('/api/nurses', submitData, config);
        setSuccess('Nurse created successfully');
      }
      
      setOpenDialog(false);
      resetForm();
      fetchNurses();
      
    } catch (error) {
      console.error('Error saving nurse:', error);
      setError(error.response?.data?.message || 'Failed to save nurse');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle delete nurse
  const handleDelete = async () => {
    if (!nurseToDelete) return;
    
    try {
      setSubmitLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.delete(`/api/nurses/${nurseToDelete._id}`, config);
      setSuccess('Nurse deleted successfully');
      setDeleteDialog(false);
      setNurseToDelete(null);
      fetchNurses();
      
    } catch (error) {
      console.error('Error deleting nurse:', error);
      setError(error.response?.data?.message || 'Failed to delete nurse');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle doctor assignment
  const handleAssignDoctors = async () => {
    if (!nurseToAssign) return;
    
    try {
      setSubmitLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.put(`/api/nurses/${nurseToAssign._id}/assign-doctors`, {
        doctorIds: selectedDoctors
      }, config);
      
      setSuccess('Doctors assigned successfully');
      setAssignDialog(false);
      setNurseToAssign(null);
      setSelectedDoctors([]);
      fetchNurses();
      
    } catch (error) {
      console.error('Error assigning doctors:', error);
      setError(error.response?.data?.message || 'Failed to assign doctors');
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
      role: 'nurse',
      profile: {
        phone: '',
        department: '',
        shift: '',
        qualifications: '',
        experience: '',
        specialization: ''
      }
    });
    setFormErrors({});
    setEditingNurse(null);
    setShowPassword(false);
  };

  const openEditDialog = (nurse) => {
    setEditingNurse(nurse);
    setFormData({
      name: nurse.name || '',
      email: nurse.email || '',
      password: '', // Don't populate password for editing
      role: nurse.role || 'nurse',
      profile: {
        phone: nurse.phone || '',
        department: nurse.department || '',
        shift: nurse.shift || '',
        qualifications: nurse.qualifications || '',
        experience: nurse.experience?.toString() || '',
        specialization: nurse.specialization || ''
      }
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const openAssignDialog = (nurse) => {
    setNurseToAssign(nurse);
    setSelectedDoctors(nurse.assignedDoctors?.map(d => d._id || d) || []);
    setAssignDialog(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('all');
    setStatusFilter('all');
  };

  // DataGrid columns
  const columns = [
    {
      field: 'name',
      headerName: 'Nurse',
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
                bgcolor: theme.palette.secondary.main,
                fontSize: '1rem'
              }}
            >
              {params.value?.charAt(0)?.toUpperCase() || 'N'}
            </Avatar>
          </Badge>
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
      field: 'department',
      headerName: 'Department',
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'General'} 
          size="small" 
          color="secondary"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      )
    },
    {
      field: 'specialization',
      headerName: 'Specialization',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'General Nursing'}
        </Typography>
      )
    },
    {
      field: 'shift',
      headerName: 'Shift',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value ? params.value.split(' ')[0] + ' ' + params.value.split(' ')[1] : 'Not assigned'}
        </Typography>
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
        <Typography variant="body2">
          {params.value ? `${params.value} years` : 'N/A'}
        </Typography>
      )
    },
    {
      field: 'assignedDoctors',
      headerName: 'Assigned Doctors',
      width: 150,
      renderCell: (params) => {
        const count = params.value?.length || 0;
        return (
          <Chip 
            label={`${count} doctor${count !== 1 ? 's' : ''}`}
            size="small" 
            color={count > 0 ? 'primary' : 'default'}
            variant="outlined"
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
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit Nurse">
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
          <Tooltip title="Assign Doctors">
            <IconButton 
              size="small" 
              onClick={() => openAssignDialog(params.row)}
              color="secondary"
              sx={{ 
                '&:hover': { 
                  bgcolor: alpha(theme.palette.secondary.main, 0.1) 
                } 
              }}
            >
              <AssignmentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Nurse">
            <IconButton 
              size="small" 
              onClick={() => {
                setNurseToDelete(params.row);
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

  if (loading && nurses.length === 0) {
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
          <Typography variant="h4" fontWeight={700} color="secondary.main" gutterBottom>
            Nurse Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage hospital nurses and their assignments
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchNurses}
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
              bgcolor: 'secondary.main',
              '&:hover': { bgcolor: 'secondary.dark' }
            }}
          >
            Add Nurse
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
                placeholder="Search nurses by name, email, department..."
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
                Showing {filteredNurses.length} of {nurses.length} nurses
              </Typography>
            </Grid>

            <Grid item xs={12} md={2}>
              {(departmentFilter !== 'all' || statusFilter !== 'all') && (
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
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      label="Department"
                    >
                      <MenuItem value="all">All Departments</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
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
          rows={filteredNurses.map((nurse, index) => ({ 
            ...nurse, 
            id: nurse._id || nurse.id || `nurse-${index}-${nurse.email || nurse.name || Math.random()}` 
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
              bgcolor: alpha(theme.palette.secondary.main, 0.05),
              borderBottom: `2px solid ${alpha(theme.palette.secondary.main, 0.1)}`
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: alpha(theme.palette.secondary.main, 0.02)
            }
          }}
        />
      </Paper>

      {/* Add/Edit Nurse Dialog */}
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
            {editingNurse ? 'Edit Nurse' : 'Add New Nurse'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {editingNurse ? 'Update nurse information' : 'Enter nurse details to add them to the system'}
          </Typography>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} color="secondary.main" gutterBottom>
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
                  label={editingNurse ? "New Password (leave blank to keep current)" : "Password"}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  required={!editingNurse}
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
                <Typography variant="subtitle1" fontWeight={600} color="secondary.main" gutterBottom sx={{ mt: 2 }}>
                  Professional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!formErrors.department}>
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
                  {formErrors.department && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {formErrors.department}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Specialization</InputLabel>
                  <Select
                    value={formData.profile.specialization}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      profile: { ...formData.profile, specialization: e.target.value }
                    })}
                    label="Specialization"
                  >
                    {nurseSpecializations.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Shift</InputLabel>
                  <Select
                    value={formData.profile.shift}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      profile: { ...formData.profile, shift: e.target.value }
                    })}
                    label="Shift"
                  >
                    {shifts.map((shift) => (
                      <MenuItem key={shift} value={shift}>
                        {shift}
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
                        <WorkIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Qualifications"
                  value={formData.profile.qualifications}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    profile: { ...formData.profile, qualifications: e.target.value }
                  })}
                  placeholder="e.g., BSN, RN, MSN"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon color="action" />
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
              sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
            >
              {submitLoading ? 'Saving...' : (editingNurse ? 'Update Nurse' : 'Add Nurse')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Assign Doctors Dialog */}
      <Dialog
        open={assignDialog}
        onClose={() => setAssignDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Assign Doctors to {nurseToAssign?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select doctors to assign to this nurse
          </Typography>
        </DialogTitle>
        <DialogContent>
          <List>
            {doctors.map((doctor) => (
              <ListItem key={doctor._id} dense>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedDoctors.includes(doctor._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDoctors([...selectedDoctors, doctor._id]);
                        } else {
                          setSelectedDoctors(selectedDoctors.filter(id => id !== doctor._id));
                        }
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Dr. {doctor.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doctor.specialization} - {doctor.department}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setAssignDialog(false)} disabled={submitLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignDoctors}
            variant="contained"
            disabled={submitLoading}
            startIcon={submitLoading ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
          >
            {submitLoading ? 'Assigning...' : 'Assign Doctors'}
          </Button>
        </DialogActions>
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
            Delete Nurse
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete nurse "{nurseToDelete?.name}"? 
            This action cannot be undone and will affect all related assignments.
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

export default NurseManagement;