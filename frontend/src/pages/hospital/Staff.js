import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Tooltip,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Psychology as PsychologyIcon,
  Healing as HealingIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import { useSelector } from 'react-redux';
import StaffForm from '../../components/hospital/StaffForm';
import StaffList from '../../components/hospital/StaffList';
import StaffStats from '../../components/hospital/StaffStats';

const Staff = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.userAuth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    byRole: {},
    byDepartment: {},
    byStatus: {},
    total: 0
  });

  // Fetch staff data
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/staff/hospital', config);
      setStaff(response.data);
      setFilteredStaff(response.data);

      // Fetch staff statistics
      const statsResponse = await axios.get('/api/staff/stats', config);
      setStats(statsResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setError('Failed to fetch staff data. Please try again.');
      setLoading(false);
    }
  }, [token]);

  // Initial data fetch
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStaff();
    setRefreshing(false);
  };

  // Handle search
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === '') {
      // Apply only filters when search is empty
      applyFilters(staff, roleFilter, departmentFilter, statusFilter);
    } else {
      // Apply search and filters
      const filtered = staff.filter(member => 
        (member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.department?.toLowerCase().includes(query) ||
        member.specialization?.toLowerCase().includes(query)) &&
        (roleFilter === 'all' || member.role === roleFilter) &&
        (departmentFilter === 'all' || member.department === departmentFilter) &&
        (statusFilter === 'all' || member.status === statusFilter)
      );
      setFilteredStaff(filtered);
    }
  };

  // Apply filters
  const applyFilters = (staffList, role, department, status) => {
    const filtered = staffList.filter(member => 
      (role === 'all' || member.role === role) &&
      (department === 'all' || member.department === department) &&
      (status === 'all' || member.status === status)
    );
    setFilteredStaff(filtered);
  };

  // Handle filter changes
  const handleRoleFilterChange = (event) => {
    const role = event.target.value;
    setRoleFilter(role);
    applyFilters(staff, role, departmentFilter, statusFilter);
  };

  const handleDepartmentFilterChange = (event) => {
    const department = event.target.value;
    setDepartmentFilter(department);
    applyFilters(staff, roleFilter, department, statusFilter);
  };

  const handleStatusFilterChange = (event) => {
    const status = event.target.value;
    setStatusFilter(status);
    applyFilters(staff, roleFilter, departmentFilter, status);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle add staff
  const handleAddStaff = async (staffData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post('/api/staff', staffData, config);
      setStaff([...staff, response.data]);
      setFilteredStaff([...filteredStaff, response.data]);
      setSuccess('Staff member added successfully');
      setOpenAddDialog(false);
      
      // Refresh stats
      const statsResponse = await axios.get('/api/staff/stats', config);
      setStats(statsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error adding staff:', error);
      setError(error.response?.data?.message || 'Failed to add staff member. Please try again.');
      setLoading(false);
    }
  };

  // Handle edit staff
  const handleEditStaff = async (staffData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.put(`/api/staff/${selectedStaff.id}`, staffData, config);
      
      // Update staff list
      const updatedStaff = staff.map(member => 
        member.id === selectedStaff.id ? response.data : member
      );
      setStaff(updatedStaff);
      
      // Update filtered staff list
      const updatedFilteredStaff = filteredStaff.map(member => 
        member.id === selectedStaff.id ? response.data : member
      );
      setFilteredStaff(updatedFilteredStaff);
      
      setSuccess('Staff member updated successfully');
      setOpenEditDialog(false);
      setSelectedStaff(null);
      
      // Refresh stats
      const statsResponse = await axios.get('/api/staff/stats', config);
      setStats(statsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error updating staff:', error);
      setError(error.response?.data?.message || 'Failed to update staff member. Please try again.');
      setLoading(false);
    }
  };

  // Handle delete staff
  const handleDeleteStaff = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/staff/${selectedStaff.id}`, config);
      
      // Update staff list
      const updatedStaff = staff.filter(member => member.id !== selectedStaff.id);
      setStaff(updatedStaff);
      
      // Update filtered staff list
      const updatedFilteredStaff = filteredStaff.filter(member => member.id !== selectedStaff.id);
      setFilteredStaff(updatedFilteredStaff);
      
      setSuccess('Staff member deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedStaff(null);
      
      // Refresh stats
      const statsResponse = await axios.get('/api/staff/stats', config);
      setStats(statsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error deleting staff:', error);
      setError(error.response?.data?.message || 'Failed to delete staff member. Please try again.');
      setLoading(false);
    }
  };

  // Handle view staff details
  const handleViewStaff = (staff) => {
    navigate(`/hospital/staff/${staff.id}`);
  };

  // Handle edit staff dialog
  const handleOpenEditDialog = (staff) => {
    setSelectedStaff(staff);
    setOpenEditDialog(true);
  };

  // Handle delete staff dialog
  const handleOpenDeleteDialog = (staff) => {
    setSelectedStaff(staff);
    setOpenDeleteDialog(true);
  };

  // Get unique departments from staff data
  const departments = [...new Set(staff.map(member => member.department).filter(Boolean))];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Page Header */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 3
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Staff Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your hospital staff, including doctors, nurses, pharmacists, and other personnel.
          </Typography>
        </Box>
        <Box sx={{ mt: { xs: 2, md: 0 }, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Add Staff
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Staff Statistics */}
      <StaffStats stats={stats} />

      {/* Search and Filter Bar */}
      <Card
        component={motion.div}
        variants={itemVariants}
        sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search staff by name, email, department..."
                value={searchQuery}
                onChange={handleSearch}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    onChange={handleRoleFilterChange}
                    label="Role"
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="doctor">Doctors</MenuItem>
                    <MenuItem value="nurse">Nurses</MenuItem>
                    <MenuItem value="pharmacist">Pharmacists</MenuItem>
                    <MenuItem value="receptionist">Receptionists</MenuItem>
                    <MenuItem value="lab_technician">Lab Technicians</MenuItem>
                    <MenuItem value="staff">Other Staff</MenuItem>
                  </Select>
                </FormControl>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    onChange={handleDepartmentFilterChange}
                    label="Department"
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="on_leave">On Leave</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card
        component={motion.div}
        variants={itemVariants}
        sx={{ borderRadius: 3, overflow: 'hidden' }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minWidth: 100
              }
            }}
          >
            <Tab label="All Staff" />
            <Tab label="Doctors" />
            <Tab label="Nurses" />
            <Tab label="Pharmacists" />
            <Tab label="Other Staff" />
          </Tabs>
        </Box>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredStaff.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No staff members found matching your criteria.
              </Typography>
            </Box>
          ) : (
            <StaffList
              staff={filteredStaff.filter(member => {
                if (tabValue === 0) return true;
                if (tabValue === 1) return member.role === 'doctor';
                if (tabValue === 2) return member.role === 'nurse';
                if (tabValue === 3) return member.role === 'pharmacist';
                if (tabValue === 4) return !['doctor', 'nurse', 'pharmacist'].includes(member.role);
                return true;
              })}
              onView={handleViewStaff}
              onEdit={handleOpenEditDialog}
              onDelete={handleOpenDeleteDialog}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Staff Member</DialogTitle>
        <DialogContent dividers>
          <StaffForm onSubmit={handleAddStaff} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Staff Member</DialogTitle>
        <DialogContent dividers>
          {selectedStaff && (
            <StaffForm onSubmit={handleEditStaff} initialData={selectedStaff} isEdit />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedStaff?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteStaff} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;
