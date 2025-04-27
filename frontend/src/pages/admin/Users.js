import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';

// Import components
import UserStats from '../../components/users/UserStats';
import UserFilters from '../../components/users/UserFilters';
import UserTable from '../../components/users/UserTable';
import UserForm from '../../components/users/UserForm';

// Default stats (will be replaced with real data from API)
const defaultStats = {
  totalUsers: 0,
  activeUsers: 0,
  newUsersToday: 0,
  usersByRole: [],
  usersByDevice: [],
  userActivity: {
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
    averageSessionTime: '0 minutes'
  },
  recentUsers: [],
  growthData: {
    months: [],
    userGrowth: []
  },
  growthRates: {
    totalUsers: '+0%',
    activeUsers: '+0%',
    newUsers: '+0%'
  }
};

const mockHospitals = [
  { id: 'hosp_123', name: 'General Hospital' },
  { id: 'hosp_456', name: 'Medical Center' },
  { id: 'hosp_789', name: 'Community Hospital' },
  { id: 'hosp_012', name: 'Specialty Clinic' },
  { id: 'hosp_345', name: 'Research Hospital' },
];

const Users = () => {
  const theme = useTheme();

  // Get user data from both auth systems
  const { user: oldUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: newUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = newUser || oldUser;
  const token = newToken || oldToken;

  console.log('Users: User data', {
    role: user?.role,
    name: user?.name,
    hasToken: !!token
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [stats, setStats] = useState(defaultStats);
  const [openUserForm, setOpenUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formMode, setFormMode] = useState('add');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    dateRange: [0, 30],
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Users: Fetching users with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const response = await axios.get('/api/users', config);
      console.log('Users: Fetched users successfully:', response.data.length);

      const formattedUsers = response.data.map(user => ({
        id: user._id,
        ...user,
        status: user.status || 'active', // Default status if not provided
        lastLogin: user.lastLogin || null,
      }));
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error fetching users: ' + (error.response?.data?.message || error.message));
      setLoading(false);

      // Use mock data for development if API fails
      const mockUsers = [
        {
          id: 'usr_123456789',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1 (555) 123-4567',
          role: 'patient',
          status: 'active',
          lastLogin: '2023-06-15 14:30',
          avatar: null,
        },
        {
          id: 'usr_234567890',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@hospital.com',
          phone: '+1 (555) 234-5678',
          role: 'doctor',
          status: 'active',
          lastLogin: '2023-06-15 10:15',
          avatar: null,
          hospital: 'hosp_123',
        },
        // Add more mock users as needed
      ];
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      console.log('Users: Fetching user stats with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const response = await axios.get('/api/users/stats', config);
      console.log('User stats:', response.data);
      setStats(response.data);
      setStatsLoading(false);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStatsLoading(false);
      // Keep using default stats if API fails
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...users];

    // Apply role filter
    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter(user => user.status === filters.status);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        user =>
          user.name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.id?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(result);
  }, [filters, searchTerm, users]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormMode('add');
    setOpenUserForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormMode('edit');
    setOpenUserForm(true);
  };

  const handleViewUserDetails = (user) => {
    // In a real app, this would navigate to a user details page
    console.log('View user details:', user);
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      console.log('Users: Deleting user with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      await axios.delete(`/api/users/${userId}`, config);
      fetchUsers();
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting user: ' + (error.response?.data?.message || error.message),
        severity: 'error',
      });
      setLoading(false);
    }
  };

  const handleChangeUserStatus = async (userId, status) => {
    try {
      setLoading(true);
      console.log('Users: Changing user status with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      await axios.put(`/api/users/${userId}/status`, { status }, config);
      fetchUsers();
      setSnackbar({
        open: true,
        message: `User status changed to ${status}`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error changing user status:', error);
      setSnackbar({
        open: true,
        message: 'Error changing user status: ' + (error.response?.data?.message || error.message),
        severity: 'error',
      });
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      setLoading(true);
      console.log('Users: Resetting password with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      await axios.post(`/api/users/${userId}/reset-password`, {}, config);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Password reset link sent to user',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      setSnackbar({
        open: true,
        message: 'Error sending password reset: ' + (error.response?.data?.message || error.message),
        severity: 'error',
      });
      setLoading(false);
    }
  };

  const handleUserFormSubmit = async (formData) => {
    try {
      setLoading(true);
      console.log('Users: Submitting user form with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      if (formMode === 'add') {
        await axios.post('/api/users', formData, config);
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success',
        });
      } else {
        await axios.put(`/api/users/${selectedUser.id}`, formData, config);
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
      }
      fetchUsers();
      setOpenUserForm(false);
    } catch (error) {
      console.error('Error submitting user form:', error);
      setSnackbar({
        open: true,
        message: formMode === 'add'
          ? 'Error creating user: ' + (error.response?.data?.message || error.message)
          : 'Error updating user: ' + (error.response?.data?.message || error.message),
        severity: 'error',
      });
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Container maxWidth="xl">
      <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <Box
          component={motion.div}
          variants={headerVariants}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage all users across the SoulSpace platform
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
            <Button
              variant="outlined"
              startIcon={<CloudDownloadIcon />}
              sx={{ borderRadius: 2 }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ borderRadius: 2 }}
            >
              Import
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddUser}
              sx={{
                borderRadius: 2,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
            >
              Add User
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* User Stats */}
        <UserStats
          stats={stats}
          loading={statsLoading}
          onRefresh={fetchUserStats}
        />

        {/* Filters */}
        <UserFilters onFilterChange={handleFilterChange} onSearch={handleSearch} />

        {/* User Table */}
        <UserTable
          users={filteredUsers}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onViewDetails={handleViewUserDetails}
          onChangeStatus={handleChangeUserStatus}
          onResetPassword={handleResetPassword}
        />

        {/* User Form Dialog */}
        <UserForm
          open={openUserForm}
          onClose={() => setOpenUserForm(false)}
          onSubmit={handleUserFormSubmit}
          user={selectedUser}
          mode={formMode}
          hospitals={mockHospitals}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Loading backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </Container>
  );
};

export default Users;