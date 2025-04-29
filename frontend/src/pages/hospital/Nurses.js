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
  InputAdornment,
  Tooltip,
  Divider,
  Snackbar,
  useTheme,
  alpha,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MedicalServices as MedicalServicesIcon,
  LocalHospital as DoctorIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';

const HospitalNurses = () => {
  const theme = useTheme();

  // State for nurses and loading
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // State for UI elements
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // State for dialogs
  const [openForm, setOpenForm] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState(null);

  // State for form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    licenseNumber: '',
    password: '',
    assignedDoctors: []
  });

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  // Constants
  const statusColors = {
    active: 'success',
    inactive: 'error'
  };

  const departments = [
    'Emergency',
    'ICU',
    'Pediatrics',
    'Cardiology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'General',
    'Surgery',
    'Obstetrics',
    'Gynecology',
    'Psychiatry',
    'Radiology',
    'Anesthesiology'
  ];

  // DataGrid columns configuration
  const columns = [
    {
      field: 'name',
      headerName: 'Nurse',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const nurse = params.row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 1,
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main
              }}
            >
              <MedicalServicesIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {nurse.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {nurse.email}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Chip
          label={params.value || 'General'}
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
      field: 'licenseNumber',
      headerName: 'License Number',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'assignedDoctors',
      headerName: 'Assigned Doctors',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const count = params.value ? params.value.length : 0;
        const doctorDetails = params.row.assignedDoctorDetails || [];

        return (
          <Box>
            <Tooltip
              title={
                count > 0 ? (
                  <List dense sx={{ p: 0, width: 250 }}>
                    {doctorDetails.map((doctor, index) => (
                      <ListItem key={index} sx={{ px: 1, py: 0.5 }}>
                        <ListItemAvatar sx={{ minWidth: 36 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                            <DoctorIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={doctor.name}
                          secondary={doctor.specialization || 'General'}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : 'No doctors assigned'
              }
              arrow
            >
              <Chip
                label={`${count} Doctor${count !== 1 ? 's' : ''}`}
                size="small"
                color={count > 0 ? 'primary' : 'default'}
                variant={count > 0 ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            </Tooltip>
          </Box>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'active' ? 'Active' : 'Inactive'}
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
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditNurse(params.row)}
              sx={{ mr: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Assign Doctors">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => handleOpenAssignDialog(params.row)}
              sx={{ mr: 0.5 }}
            >
              <DoctorIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleOpenDeleteDialog(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Fetch nurses with filters
  const fetchNurses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Build query parameters for filtering
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      // Make API requests in parallel
      const [nursesRes, doctorsRes] = await Promise.all([
        axios.get(`/api/nurses/hospital?${params.toString()}`),
        axios.get('/api/doctors/hospital')
      ]);

      setNurses(nursesRes.data);
      setDoctors(doctorsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching nurses:', error);
      setError('Error fetching nurses. Please try again.');
      setLoading(false);

      // Show error in snackbar
      setSnackbarMessage('Failed to load nurses. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [statusFilter, searchQuery]);

  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchNurses();
  }, [fetchNurses, tabValue]);

  // Function to refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchNurses().finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  };

  // Function to handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);

    // Update status filter based on tab
    if (newValue === 0) { // All
      setStatusFilter('all');
    } else if (newValue === 1) { // Active
      setStatusFilter('active');
    } else if (newValue === 2) { // Inactive
      setStatusFilter('inactive');
    }
  };

  // Function to handle search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Function to apply search
  const applySearch = () => {
    fetchNurses();
  };

  // Function to clear filters
  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setTabValue(0);
  };

  // Function to add a new nurse
  const handleAddNurse = () => {
    setSelectedNurse(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      licenseNumber: '',
      password: '',
      assignedDoctors: []
    });
    setOpenForm(true);
  };

  // Function to edit a nurse
  const handleEditNurse = (nurse) => {
    setSelectedNurse(nurse);
    setFormData({
      name: nurse.name,
      email: nurse.email,
      phone: nurse.phone || '',
      department: nurse.department || '',
      licenseNumber: nurse.licenseNumber || '',
      password: '',
      assignedDoctors: nurse.assignedDoctors || []
    });
    setOpenForm(true);
  };

  // Function to open assign dialog
  const handleOpenAssignDialog = (nurse) => {
    setSelectedNurse(nurse);
    setFormData({
      ...formData,
      assignedDoctors: nurse.assignedDoctors || []
    });
    setOpenAssignDialog(true);
  };

  // Function to open delete dialog
  const handleOpenDeleteDialog = (nurse) => {
    setSelectedNurse(nurse);
    setOpenDeleteDialog(true);
  };

  // Function to handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Function to handle multi-select change
  const handleMultiSelectChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      assignedDoctors: value
    });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form data
      if (!formData.name || !formData.email) {
        setError('Name and email are required');
        return;
      }

      if (!selectedNurse && !formData.password) {
        setError('Password is required for new nurses');
        return;
      }

      // Create payload
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        licenseNumber: formData.licenseNumber,
        assignedDoctors: formData.assignedDoctors
      };

      // Add password for new nurses
      if (!selectedNurse) {
        payload.password = formData.password;
      }

      let response;
      if (selectedNurse) {
        // Update existing nurse
        response = await axios.put(`/api/nurses/${selectedNurse.id}`, payload);
        setSnackbarMessage('Nurse updated successfully');
      } else {
        // Create new nurse
        response = await axios.post('/api/nurses', payload);
        setSnackbarMessage('Nurse added successfully');
      }

      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenForm(false);
      fetchNurses();
    } catch (error) {
      console.error('Error saving nurse:', error);
      setError(error.response?.data?.message || 'Error saving nurse');
    }
  };

  // Function to handle doctor assignment
  const handleAssignDoctors = async () => {
    try {
      await axios.put(`/api/nurses/${selectedNurse.id}/assign-doctors`, {
        doctorIds: formData.assignedDoctors
      });

      setSnackbarMessage('Doctors assigned successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setOpenAssignDialog(false);
      fetchNurses();
    } catch (error) {
      console.error('Error assigning doctors:', error);
      setError(error.response?.data?.message || 'Error assigning doctors');
    }
  };

  // Function to handle nurse deletion
  const handleDeleteNurse = async () => {
    try {
      await axios.delete(`/api/nurses/${selectedNurse.id}`);

      setSnackbarMessage('Nurse removed successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setOpenDeleteDialog(false);
      fetchNurses();
    } catch (error) {
      console.error('Error deleting nurse:', error);
      setError(error.response?.data?.message || 'Error deleting nurse');
    }
  };

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
              Nurses Management
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonAddIcon />}
                onClick={handleAddNurse}
                sx={{ mr: 1 }}
              >
                Add Nurse
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
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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
              <Tab label="All Nurses" />
              <Tab
                label={
                  <Badge
                    badgeContent={nurses.filter(n => n.status === 'active').length}
                    color="success"
                    max={99}
                  >
                    Active
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge
                    badgeContent={nurses.filter(n => n.status === 'inactive').length}
                    color="error"
                    max={99}
                  >
                    Inactive
                  </Badge>
                }
              />
            </Tabs>
          </Paper>

          {/* Search section */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  placeholder="Search nurses by name, email or phone..."
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
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={applySearch}
                    fullWidth
                  >
                    Search
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

          {/* Nurses data grid */}
          <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={nurses}
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

          {/* Nurse Form Dialog */}
          <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              {selectedNurse ? 'Edit Nurse' : 'Add New Nurse'}
            </DialogTitle>
            <DialogContent>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Department</InputLabel>
                      <Select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="License Number"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  {!selectedNurse && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!selectedNurse}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Assigned Doctors</InputLabel>
                      <Select
                        multiple
                        name="assignedDoctors"
                        value={formData.assignedDoctors}
                        onChange={handleMultiSelectChange}
                        label="Assigned Doctors"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((doctorId) => {
                              const doctor = doctors.find(d => d.id === doctorId);
                              return (
                                <Chip
                                  key={doctorId}
                                  label={doctor ? doctor.name : 'Unknown Doctor'}
                                  size="small"
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {doctors.map((doctor) => (
                          <MenuItem key={doctor.id} value={doctor.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  mr: 1,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main
                                }}
                              >
                                <DoctorIcon fontSize="small" />
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" fontWeight={500}>
                                  {doctor.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {doctor.specialization || 'General'}
                                  </Typography>
                                  <Divider orientation="vertical" flexItem sx={{ height: 12 }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {doctor.department || 'General'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {doctor.phone || 'No phone'}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenForm(false)}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" color="primary">
                {selectedNurse ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Assign Doctors Dialog */}
          <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              Assign Doctors to {selectedNurse?.name}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select doctors to assign to this nurse. The nurse will assist these doctors with their patients.
                </Typography>

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Assigned Doctors</InputLabel>
                  <Select
                    multiple
                    value={formData.assignedDoctors}
                    onChange={handleMultiSelectChange}
                    label="Assigned Doctors"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((doctorId) => {
                          const doctor = doctors.find(d => d.id === doctorId);
                          return (
                            <Chip
                              key={doctorId}
                              label={doctor ? doctor.name : 'Unknown Doctor'}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              mr: 1,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main
                            }}
                          >
                            <DoctorIcon fontSize="small" />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {doctor.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {doctor.specialization || 'General'}
                              </Typography>
                              <Divider orientation="vertical" flexItem sx={{ height: 12 }} />
                              <Typography variant="caption" color="text.secondary">
                                {doctor.department || 'General'}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {doctor.phone || 'No phone'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {doctors.length === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No doctors available. Please add doctors first.
                  </Alert>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
              <Button
                onClick={handleAssignDoctors}
                variant="contained"
                color="primary"
                disabled={doctors.length === 0}
              >
                Assign
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
            <DialogTitle>Remove Nurse</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to remove {selectedNurse?.name}? This action will mark the nurse as inactive.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
              <Button onClick={handleDeleteNurse} color="error" variant="contained">
                Remove
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Container>
  );
};

export default HospitalNurses;
