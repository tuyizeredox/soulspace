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
  CircularProgress,
  Grid,
  Paper,
  InputAdornment,
  Tooltip,
  Divider,
  Snackbar,
  useTheme,
  alpha,
  Avatar,
  Chip,
  Badge,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  LocalPharmacy as PharmacyIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';

const HospitalPharmacists = () => {
  const theme = useTheme();

  // State for pharmacists and loading
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State for UI elements
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // State for dialogs
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPharmacist, setSelectedPharmacist] = useState(null);

  // State for form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    password: ''
  });

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  // Constants
  const statusColors = {
    active: 'success',
    Active: 'success',
    inactive: 'error',
    Inactive: 'error'
  };

  // DataGrid columns configuration
  const columns = [
    {
      field: 'name',
      headerName: 'Pharmacist',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const pharmacist = params.row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 1,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main
              }}
            >
              <PharmacyIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {pharmacist.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {pharmacist.email}
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
      field: 'licenseNumber',
      headerName: 'License Number',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'active' || params.value === 'Active' ? 'Active' : 'Inactive'}
          color={statusColors[params.value] || 'default'}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditPharmacist(params.row)}
              sx={{ mr: 0.5 }}
            >
              <EditIcon fontSize="small" />
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

  // Fetch pharmacists with filters
  const fetchPharmacists = useCallback(async () => {
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

      const response = await axios.get(`/api/pharmacists/hospital?${params.toString()}`);
      setPharmacists(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pharmacists:', error);
      setError('Error fetching pharmacists. Please try again.');
      setLoading(false);

      // Show error in snackbar
      setSnackbarMessage('Failed to load pharmacists. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [statusFilter, searchQuery]);

  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchPharmacists();
  }, [fetchPharmacists, tabValue]);

  // Function to refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPharmacists().finally(() => {
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
    fetchPharmacists();
  };

  // Function to clear filters
  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setTabValue(0);
  };

  // Function to add a new pharmacist
  const handleAddPharmacist = () => {
    setSelectedPharmacist(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      licenseNumber: '',
      password: ''
    });
    setOpenForm(true);
  };

  // Function to edit a pharmacist
  const handleEditPharmacist = (pharmacist) => {
    setSelectedPharmacist(pharmacist);
    setFormData({
      name: pharmacist.name,
      email: pharmacist.email,
      phone: pharmacist.phone || '',
      licenseNumber: pharmacist.licenseNumber || '',
      password: ''
    });
    setOpenForm(true);
  };

  // Function to open delete dialog
  const handleOpenDeleteDialog = (pharmacist) => {
    setSelectedPharmacist(pharmacist);
    setOpenDeleteDialog(true);
  };

  // Function to handle pharmacist deletion
  const handleDeletePharmacist = async () => {
    try {
      await axios.delete(`/api/pharmacists/${selectedPharmacist.id}`);

      setSnackbarMessage('Pharmacist removed successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setOpenDeleteDialog(false);
      fetchPharmacists();
    } catch (error) {
      console.error('Error deleting pharmacist:', error);
      setError(error.response?.data?.message || 'Error deleting pharmacist');
    }
  };

  // Function to handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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

      if (!selectedPharmacist && !formData.password) {
        setError('Password is required for new pharmacists');
        return;
      }

      // Create payload
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        licenseNumber: formData.licenseNumber
      };

      // Add password for new pharmacists
      if (!selectedPharmacist) {
        payload.password = formData.password;
      }

      let response;
      if (selectedPharmacist) {
        // Update existing pharmacist
        response = await axios.put(`/api/pharmacists/${selectedPharmacist.id}`, payload);
        setSnackbarMessage('Pharmacist updated successfully');
      } else {
        // Create new pharmacist
        response = await axios.post('/api/pharmacists', payload);
        setSnackbarMessage('Pharmacist added successfully');
      }

      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenForm(false);
      fetchPharmacists();
    } catch (error) {
      console.error('Error saving pharmacist:', error);
      setError(error.response?.data?.message || 'Error saving pharmacist');
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
              Pharmacists Management
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonAddIcon />}
                onClick={handleAddPharmacist}
                sx={{ mr: 1 }}
              >
                Add Pharmacist
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
              <Tab label="All Pharmacists" />
              <Tab
                label={
                  <Badge
                    badgeContent={pharmacists.filter(p => p.status === 'active' || p.status === 'Active').length}
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
                    badgeContent={pharmacists.filter(p => p.status === 'inactive' || p.status === 'Inactive').length}
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
                  placeholder="Search pharmacists by name, email or license number..."
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

          {/* Pharmacists data grid */}
          <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={pharmacists}
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

          {/* Pharmacist Form Dialog */}
          <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              {selectedPharmacist ? 'Edit Pharmacist' : 'Add New Pharmacist'}
            </DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ mt: 2 }}>
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
                    <TextField
                      fullWidth
                      label="License Number"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  {!selectedPharmacist && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenForm(false)}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" color="primary">
                {selectedPharmacist ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
            <DialogTitle>Remove Pharmacist</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to remove {selectedPharmacist?.name}? This action will mark the pharmacist as inactive.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
              <Button onClick={handleDeletePharmacist} color="error" variant="contained">
                Remove
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Container>
  );
};

export default HospitalPharmacists;