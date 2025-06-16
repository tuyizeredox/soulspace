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
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';

const StaffManagement = () => {
  const theme = useTheme();
  const { user, token } = useSelector((state) => state.userAuth);
  
  // State management
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    profile: {
      phone: '',
      department: '',
      position: '',
      shift: '',
      salary: '',
      hireDate: '',
      emergencyContact: '',
      address: ''
    }
  });

  // Validation errors
  const [formErrors, setFormErrors] = useState({});

  // Staff roles (excluding doctor, nurse, patient which have their own management)
  const staffRoles = [
    'pharmacist',
    'receptionist',
    'technician',
    'administrator',
    'security',
    'maintenance',
    'cleaner',
    'accountant',
    'hr_manager',
    'it_support'
  ];

  // Departments list
  const departments = [
    'Administration',
    'Human Resources',
    'Finance',
    'IT Support',
    'Security',
    'Maintenance',
    'Housekeeping',
    'Pharmacy',
    'Laboratory',
    'Radiology',
    'Reception',
    'Medical Records',
    'Supply Chain',
    'Quality Assurance'
  ];

  // Shifts list
  const shifts = [
    'Day Shift (8 AM - 4 PM)',
    'Evening Shift (4 PM - 12 AM)',
    'Night Shift (12 AM - 8 AM)',
    'Morning Shift (6 AM - 2 PM)',
    'Afternoon Shift (2 PM - 10 PM)',
    'Rotating Shift',
    'On-Call',
    'Regular Hours (9 AM - 5 PM)'
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active', color: 'success' },
    { value: 'inactive', label: 'Inactive', color: 'default' },
    { value: 'on_leave', label: 'On Leave', color: 'warning' },
    { value: 'suspended', label: 'Suspended', color: 'error' }
  ];

  // Fetch staff data
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/staff/hospital', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please try again later.');
      }
      
      const data = await response.json();
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setError(error.message || 'Failed to fetch staff data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchStaff();
    }
  }, [fetchStaff, token]);

  // Filter staff based on search and filters
  const filteredStaff = staff.filter(member => {
    const matchesSearch = !searchQuery || 
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
      member.department === departmentFilter;
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Staff name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!editingStaff && !formData.password.trim()) {
      errors.password = 'Password is required for new staff';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      errors.role = 'Role is required';
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
      
      const submitData = {
        ...formData,
        profile: {
          ...formData.profile,
          salary: formData.profile.salary ? parseFloat(formData.profile.salary) : undefined,
          hireDate: formData.profile.hireDate || undefined
        }
      };

      // Remove password if editing and password is empty
      if (editingStaff && !formData.password.trim()) {
        delete submitData.password;
      }
      
      const url = editingStaff 
        ? `/api/staff/${editingStaff._id}` 
        : '/api/staff';
      
      const method = editingStaff ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
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
      
      setSuccess(editingStaff ? 'Staff member updated successfully' : 'Staff member created successfully');
      setOpenDialog(false);
      resetForm();
      fetchStaff();
      
    } catch (error) {
      console.error('Error saving staff:', error);
      setError(error.message || 'Failed to save staff member');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle delete staff
  const handleDelete = async () => {
    if (!staffToDelete) return;
    
    try {
      setSubmitLoading(true);
      
      const response = await fetch(`/api/staff/${staffToDelete._id}`, {
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
      
      setSuccess('Staff member deleted successfully');
      setDeleteDialog(false);
      setStaffToDelete(null);
      fetchStaff();
      
    } catch (error) {
      console.error('Error deleting staff:', error);
      setError(error.message || 'Failed to delete staff member');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (staffId, newStatus) => {
    try {
      setSubmitLoading(true);
      
      const response = await fetch('/api/staff/update-status', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          staffId,
          status: newStatus
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      setSuccess(`Staff status updated to ${newStatus}`);
      fetchStaff();
      
    } catch (error) {
      console.error('Error updating staff status:', error);
      setError(error.message || 'Failed to update staff status');
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
      role: '',
      profile: {
        phone: '',
        department: '',
        position: '',
        shift: '',
        salary: '',
        hireDate: '',
        emergencyContact: '',
        address: ''
      }
    });
    setFormErrors({});
    setEditingStaff(null);
    setShowPassword(false);
  };

  const openEditDialog = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name || '',
      email: staffMember.email || '',
      password: '', // Don't populate password for editing
      role: staffMember.role || '',
      profile: {
        phone: staffMember.phone || '',
        department: staffMember.department || '',
        position: staffMember.position || '',
        shift: staffMember.shift || '',
        salary: staffMember.salary?.toString() || '',
        hireDate: staffMember.hireDate ? format(parseISO(staffMember.hireDate), 'yyyy-MM-dd') : '',
        emergencyContact: staffMember.emergencyContact || '',
        address: staffMember.address || ''
      }
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('all');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  // Get role display name
  const getRoleDisplayName = (role) => {
    return role?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'Staff';
  };

  // DataGrid columns
  const columns = [
    {
      field: 'name',
      headerName: 'Staff Member',
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
                  bgcolor: params.row.status === 'active' ? 'success.main' : 
                           params.row.status === 'on_leave' ? 'warning.main' :
                           params.row.status === 'suspended' ? 'error.main' : 'grey.400',
                  border: '2px solid white'
                }}
              />
            }
          >
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: theme.palette.warning.main,
                fontSize: '1rem'
              }}
            >
              {params.value?.charAt(0)?.toUpperCase() || 'S'}
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
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={getRoleDisplayName(params.value)} 
          size="small" 
          color="warning"
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
          <BusinessIcon color="action" fontSize="small" />
          <Typography variant="body2">{params.value || 'Not assigned'}</Typography>
        </Box>
      )
    },
    {
      field: 'position',
      headerName: 'Position',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'Not specified'}
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
      field: 'shift',
      headerName: 'Shift',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {params.value ? params.value.split(' ')[0] + ' ' + params.value.split(' ')[1] : 'Not assigned'}
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
        const statusConfig = statusOptions.find(s => s.value === status) || statusOptions[0];
        return (
          <Chip 
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
      field: 'hireDate',
      headerName: 'Hire Date',
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
          <Tooltip title="Edit Staff">
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
          
          {params.row.status === 'active' && (
            <Tooltip title="Set On Leave">
              <IconButton 
                size="small" 
                onClick={() => handleStatusUpdate(params.row._id, 'on_leave')}
                color="warning"
                sx={{ 
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.warning.main, 0.1) 
                  } 
                }}
              >
                <AssignmentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Delete Staff">
            <IconButton 
              size="small" 
              onClick={() => {
                setStaffToDelete(params.row);
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

  if (loading && staff.length === 0) {
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
          <Typography variant="h4" fontWeight={700} color="warning.main" gutterBottom>
            Staff Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage hospital staff members and their roles
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchStaff}
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
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              '&:hover': { bgcolor: 'warning.dark' }
            }}
          >
            Add Staff
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
                placeholder="Search staff by name, email, department, role..."
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
                Showing {filteredStaff.length} of {staff.length} staff members
              </Typography>
            </Grid>

            <Grid item xs={12} md={2}>
              {(departmentFilter !== 'all' || roleFilter !== 'all' || statusFilter !== 'all') && (
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
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      label="Role"
                    >
                      <MenuItem value="all">All Roles</MenuItem>
                      {staffRoles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {getRoleDisplayName(role)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
              </Grid>
            </Box>
          </Slide>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%', borderRadius: 2 }}>
        <DataGrid
          rows={filteredStaff.map((member, index) => ({ 
            ...member, 
            id: member._id || member.id || `staff-${index}-${member.email || member.name || Math.random()}` 
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
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              borderBottom: `2px solid ${alpha(theme.palette.warning.main, 0.1)}`
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: alpha(theme.palette.warning.main, 0.02)
            }
          }}
        />
      </Paper>

      {/* Add/Edit Staff Dialog */}
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
            {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {editingStaff ? 'Update staff member information' : 'Enter staff member details to add them to the system'}
          </Typography>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} color="warning.main" gutterBottom>
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
                  label={editingStaff ? "New Password (leave blank to keep current)" : "Password"}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  required={!editingStaff}
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
                <Typography variant="subtitle1" fontWeight={600} color="warning.main" gutterBottom sx={{ mt: 2 }}>
                  Professional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!formErrors.role}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    label="Role"
                  >
                    {staffRoles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.role && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {formErrors.role}
                    </Typography>
                  )}
                </FormControl>
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
                <TextField
                  fullWidth
                  label="Position/Title"
                  value={formData.profile.position}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    profile: { ...formData.profile, position: e.target.value }
                  })}
                  placeholder="e.g., Senior Pharmacist, Head of Security"
                />
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
                  label="Salary"
                  type="number"
                  value={formData.profile.salary}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    profile: { ...formData.profile, salary: e.target.value }
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Hire Date"
                  type="date"
                  value={formData.profile.hireDate}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    profile: { ...formData.profile, hireDate: e.target.value }
                  })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  value={formData.profile.emergencyContact}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    profile: { ...formData.profile, emergencyContact: e.target.value }
                  })}
                  placeholder="Emergency contact name and phone"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.profile.address}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    profile: { ...formData.profile, address: e.target.value }
                  })}
                  placeholder="Home address"
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
              sx={{ 
                bgcolor: 'warning.main', 
                color: 'warning.contrastText',
                '&:hover': { bgcolor: 'warning.dark' } 
              }}
            >
              {submitLoading ? 'Saving...' : (editingStaff ? 'Update Staff' : 'Add Staff')}
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
            Delete Staff Member
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete staff member "{staffToDelete?.name}"? 
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

export default StaffManagement;