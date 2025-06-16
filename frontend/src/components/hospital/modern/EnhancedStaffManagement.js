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
  CardHeader,
  LinearProgress,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Switch,
  FormControlLabel,
  Snackbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
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
  Schedule as ScheduleIcon,
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  DateRange as DateRangeIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import axios from '../../../utils/axiosConfig';

const EnhancedStaffManagement = () => {
  const theme = useTheme();
  const { user, token } = useSelector((state) => state.userAuth);
  
  // Main state management
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Analytics states
  const [staffStats, setStaffStats] = useState({});
  const [performanceData, setPerformanceData] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    department: 'all',
    role: 'all',
    status: 'all',
    shift: 'all'
  });
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
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
      address: '',
      skills: '',
      certifications: '',
      experience: ''
    }
  });
  
  const [formErrors, setFormErrors] = useState({});

  // Configuration data
  const staffRoles = [
    { value: 'pharmacist', label: 'Pharmacist', icon: '💊' },
    { value: 'receptionist', label: 'Receptionist', icon: '📞' },
    { value: 'technician', label: 'Technician', icon: '🔧' },
    { value: 'administrator', label: 'Administrator', icon: '📋' },
    { value: 'security', label: 'Security', icon: '🛡️' },
    { value: 'maintenance', label: 'Maintenance', icon: '🔨' },
    { value: 'cleaner', label: 'Cleaner', icon: '🧽' },
    { value: 'accountant', label: 'Accountant', icon: '💰' },
    { value: 'hr_manager', label: 'HR Manager', icon: '👥' },
    { value: 'it_support', label: 'IT Support', icon: '💻' },
    { value: 'nurse', label: 'Nurse', icon: '🩺' },
    { value: 'lab_technician', label: 'Lab Technician', icon: '🧪' }
  ];

  const departments = [
    'Administration', 'Human Resources', 'Finance', 'IT Support',
    'Security', 'Maintenance', 'Housekeeping', 'Pharmacy',
    'Laboratory', 'Radiology', 'Reception', 'Medical Records',
    'Supply Chain', 'Quality Assurance', 'Emergency Services'
  ];

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

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'success', icon: CheckCircleIcon },
    { value: 'inactive', label: 'Inactive', color: 'default', icon: InfoIcon },
    { value: 'on_leave', label: 'On Leave', color: 'warning', icon: WarningIcon },
    { value: 'suspended', label: 'Suspended', color: 'error', icon: ErrorIcon }
  ];

  // Fetch functions
  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.hospitalId) {
        setError('Your account is not associated with a hospital. Please contact support.');
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch staff list
      const staffResponse = await axios.get('/api/staff/hospital', config);
      setStaff(staffResponse.data || []);

      // Fetch staff statistics
      try {
        const statsResponse = await axios.get('/api/staff/stats', config);
        setStaffStats(statsResponse.data || {});
      } catch (statsError) {
        console.warn('Failed to fetch staff stats:', statsError);
      }

    } catch (error) {
      console.error('Error fetching staff data:', error);
      setError(error.response?.data?.message || 'Failed to fetch staff data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (token && user?.hospitalId) {
      fetchStaffData();
    }
  }, [fetchStaffData]);

  // Process analytics data
  useEffect(() => {
    if (staff.length > 0) {
      processAnalyticsData();
    }
  }, [staff]);

  const processAnalyticsData = () => {
    // Department distribution
    const deptCount = {};
    staff.forEach(member => {
      const dept = member.department || 'Unassigned';
      deptCount[dept] = (deptCount[dept] || 0) + 1;
    });
    
    const deptData = Object.entries(deptCount).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / staff.length) * 100).toFixed(1)
    }));
    setDepartmentStats(deptData);

    // Performance data (mock for now)
    const performanceData = departments.slice(0, 6).map(dept => ({
      department: dept,
      efficiency: Math.floor(Math.random() * 30) + 70,
      satisfaction: Math.floor(Math.random() * 20) + 80,
      attendance: Math.floor(Math.random() * 15) + 85
    }));
    setPerformanceData(performanceData);

    // Recent activities (mock)
    const activities = [
      { type: 'hire', message: 'New staff member John Doe joined Pharmacy', time: '2 hours ago' },
      { type: 'promotion', message: 'Jane Smith promoted to Senior Technician', time: '1 day ago' },
      { type: 'leave', message: 'Mike Johnson started medical leave', time: '2 days ago' },
      { type: 'training', message: '5 staff completed safety training', time: '3 days ago' }
    ];
    setRecentActivities(activities);
  };

  // Filter staff
  const filteredStaff = staff.filter(member => {
    const matchesSearch = !searchQuery || 
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = filters.department === 'all' || member.department === filters.department;
    const matchesRole = filters.role === 'all' || member.role === filters.role;
    const matchesStatus = filters.status === 'all' || member.status === filters.status;
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  // Form handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitLoading(true);
      
      const submitData = {
        ...formData,
        profile: {
          ...formData.profile,
          salary: formData.profile.salary ? parseFloat(formData.profile.salary) : undefined,
          hireDate: formData.profile.hireDate || undefined
        }
      };

      if (editingStaff && !formData.password.trim()) {
        delete submitData.password;
      }
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editingStaff) {
        await axios.put(`/api/staff/${editingStaff._id}`, submitData, config);
        showSnackbar('Staff member updated successfully', 'success');
      } else {
        await axios.post('/api/staff', submitData, config);
        showSnackbar('Staff member created successfully', 'success');
      }
      
      setOpenDialog(false);
      resetForm();
      fetchStaffData();
      
    } catch (error) {
      console.error('Error saving staff:', error);
      showSnackbar(error.response?.data?.message || 'Failed to save staff member', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;
    
    try {
      setSubmitLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`/api/staff/${staffToDelete._id}`, config);
      showSnackbar('Staff member deleted successfully', 'success');
      setDeleteDialog(false);
      setStaffToDelete(null);
      fetchStaffData();
      
    } catch (error) {
      console.error('Error deleting staff:', error);
      showSnackbar(error.response?.data?.message || 'Failed to delete staff member', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    
    if (!editingStaff && !formData.password.trim()) {
      errors.password = 'Password is required for new staff';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) errors.role = 'Role is required';
    if (!formData.profile.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.profile.department.trim()) errors.department = 'Department is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
        address: '',
        skills: '',
        certifications: '',
        experience: ''
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
      password: '',
      role: staffMember.role || '',
      profile: {
        phone: staffMember.phone || '',
        department: staffMember.department || '',
        position: staffMember.position || '',
        shift: staffMember.shift || '',
        salary: staffMember.salary?.toString() || '',
        hireDate: staffMember.hireDate ? format(parseISO(staffMember.hireDate), 'yyyy-MM-dd') : '',
        emergencyContact: staffMember.emergencyContact || '',
        address: staffMember.address || '',
        skills: staffMember.skills || '',
        certifications: staffMember.certifications || '',
        experience: staffMember.experience || ''
      }
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const getRoleInfo = (role) => {
    return staffRoles.find(r => r.value === role) || { label: role, icon: '👤' };
  };

  // Chart colors
  const chartColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '400px',
        gap: 2
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="textSecondary">
          Loading staff data...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error && !user?.hospitalId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Hospital ID Missing
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Your account is not associated with a hospital. Please log out and log in again.
          </Typography>
          <Button 
            variant="contained" 
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

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '100%', overflow: 'hidden' }}>
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
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Staff Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive staff management with analytics and insights
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={fetchStaffData}
              disabled={loading}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Add Staff
          </Button>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <IconButton 
              color="inherit" 
              size="small" 
              onClick={() => setError('')}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Main Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<DashboardIcon />} 
            label="Dashboard" 
            sx={{ textTransform: 'none', fontSize: '0.9rem' }}
          />
          <Tab 
            icon={<GroupIcon />} 
            label="Staff Directory" 
            sx={{ textTransform: 'none', fontSize: '0.9rem' }}
          />
          <Tab 
            icon={<AssessmentIcon />} 
            label="Analytics" 
            sx={{ textTransform: 'none', fontSize: '0.9rem' }}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <DashboardTab 
          staff={staff}
          staffStats={staffStats}
          departmentStats={departmentStats}
          recentActivities={recentActivities}
          theme={theme}
          chartColors={chartColors}
        />
      )}

      {activeTab === 1 && (
        <StaffDirectoryTab
          filteredStaff={filteredStaff}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          openEditDialog={openEditDialog}
          setStaffToDelete={setStaffToDelete}
          setDeleteDialog={setDeleteDialog}
          getRoleInfo={getRoleInfo}
          statusOptions={statusOptions}
          departments={departments}
          staffRoles={staffRoles}
          theme={theme}
        />
      )}

      {activeTab === 2 && (
        <AnalyticsTab
          staff={staff}
          departmentStats={departmentStats}
          performanceData={performanceData}
          theme={theme}
          chartColors={chartColors}
        />
      )}

      {/* Staff Form Dialog */}
      <StaffFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        editingStaff={editingStaff}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        handleSubmit={handleSubmit}
        submitLoading={submitLoading}
        departments={departments}
        staffRoles={staffRoles}
        shifts={shifts}
        theme={theme}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {staffToDelete?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={submitLoading}
            startIcon={submitLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Dashboard Tab Component
const DashboardTab = ({ staff, staffStats, departmentStats, recentActivities, theme, chartColors }) => {
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'active').length;
  const onLeave = staff.filter(s => s.status === 'on_leave').length;
  const newHires = staff.filter(s => {
    const hireDate = new Date(s.joinDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return hireDate > thirtyDaysAgo;
  }).length;

  return (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          height: '100%'
        }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">{totalStaff}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Staff</Typography>
            </Box>
            <GroupIcon sx={{ fontSize: 40, opacity: 0.8 }} />
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
          color: 'white',
          height: '100%'
        }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">{activeStaff}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Staff</Typography>
            </Box>
            <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
          color: 'white',
          height: '100%'
        }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">{onLeave}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>On Leave</Typography>
            </Box>
            <WarningIcon sx={{ fontSize: 40, opacity: 0.8 }} />
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
          color: 'white',
          height: '100%'
        }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">{newHires}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>New Hires (30d)</Typography>
            </Box>
            <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
          </CardContent>
        </Card>
      </Grid>

      {/* Department Distribution Chart */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: 400 }}>
          <CardHeader title="Department Distribution" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activities */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: 400 }}>
          <CardHeader title="Recent Activities" />
          <CardContent>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem key={index} divider={index < recentActivities.length - 1}>
                  <ListItemIcon>
                    {activity.type === 'hire' && <PersonIcon color="success" />}
                    {activity.type === 'promotion' && <TrendingUpIcon color="primary" />}
                    {activity.type === 'leave' && <WarningIcon color="warning" />}
                    {activity.type === 'training' && <AssignmentIcon color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.message}
                    secondary={activity.time}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Staff Directory Tab Component (simplified - would be quite long)
const StaffDirectoryTab = ({ 
  filteredStaff, searchQuery, setSearchQuery, filters, setFilters, 
  showFilters, setShowFilters, viewMode, setViewMode, openEditDialog,
  setStaffToDelete, setDeleteDialog, getRoleInfo, statusOptions,
  departments, staffRoles, theme 
}) => {
  return (
    <Box>
      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search staff members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </Stack>
        
        {showFilters && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department}
                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                    label="Department"
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={filters.role}
                    onChange={(e) => setFilters({...filters, role: e.target.value})}
                    label="Role"
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    {staffRoles.map(role => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.icon} {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    {statusOptions.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ClearIcon />}
                  onClick={() => setFilters({ department: 'all', role: 'all', status: 'all' })}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Staff Grid */}
      <Grid container spacing={3}>
        {filteredStaff.map((staffMember) => (
          <Grid item xs={12} sm={6} lg={4} key={staffMember.id}>
            <StaffCard
              staff={staffMember}
              onEdit={() => openEditDialog(staffMember)}
              onDelete={() => {
                setStaffToDelete(staffMember);
                setDeleteDialog(true);
              }}
              getRoleInfo={getRoleInfo}
              statusOptions={statusOptions}
              theme={theme}
            />
          </Grid>
        ))}
      </Grid>

      {filteredStaff.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No staff members found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your search criteria or add new staff members.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

// Individual Staff Card Component
const StaffCard = ({ staff, onEdit, onDelete, getRoleInfo, statusOptions, theme }) => {
  const roleInfo = getRoleInfo(staff.role);
  const statusInfo = statusOptions.find(s => s.value === (staff.status || 'active'));
  
  return (
    <Card sx={{ 
      height: '100%',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8]
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{ 
              width: 50, 
              height: 50, 
              mr: 2,
              bgcolor: theme.palette.primary.main,
              fontSize: '1.2rem'
            }}
          >
            {staff.name?.charAt(0) || '?'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
              {staff.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {roleInfo.icon} {roleInfo.label}
            </Typography>
          </Box>
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              {staff.email}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              {staff.phone || 'N/A'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              {staff.department || 'Unassigned'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Chip
              label={statusInfo?.label || 'Active'}
              color={statusInfo?.color || 'default'}
              size="small"
              icon={<statusInfo.icon />}
            />
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={onEdit} color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={onDelete} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ staff, departmentStats, performanceData, theme, chartColors }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Department Performance" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Bar dataKey="efficiency" fill={chartColors[0]} />
                <Bar dataKey="satisfaction" fill={chartColors[1]} />
                <Bar dataKey="attendance" fill={chartColors[2]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Staff Distribution by Department" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="value" fill={chartColors[3]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Staff Form Dialog Component (simplified)
const StaffFormDialog = ({ 
  open, onClose, formData, setFormData, formErrors, editingStaff,
  showPassword, setShowPassword, handleSubmit, submitLoading,
  departments, staffRoles, shifts, theme 
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={editingStaff ? "New Password (leave blank to keep current)" : "Password"}
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                error={!!formErrors.password}
                helperText={formErrors.password}
                required={!editingStaff}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.role}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  label="Role"
                >
                  {staffRoles.map(role => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.icon} {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.profile.phone}
                onChange={(e) => setFormData({
                  ...formData, 
                  profile: {...formData.profile, phone: e.target.value}
                })}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.department}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.profile.department}
                  onChange={(e) => setFormData({
                    ...formData, 
                    profile: {...formData.profile, department: e.target.value}
                  })}
                  label="Department"
                >
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Add more form fields as needed */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={submitLoading}
            startIcon={submitLoading ? <CircularProgress size={16} /> : <PersonIcon />}
          >
            {editingStaff ? 'Update' : 'Create'} Staff Member
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EnhancedStaffManagement;