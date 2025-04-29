import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  useTheme,
  alpha,
  Badge,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  LocalHospital as LocalHospitalIcon,
  Person as PersonIcon,
  Event as EventIcon,
  MedicalServices as MedicalServicesIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import axios from '../../utils/axios';
import PatientForm from '../patients/PatientForm';
import PatientDetails from '../patients/PatientDetails';
import PatientAssignmentForm from '../patients/PatientAssignmentForm';

const HospitalPatients = () => {
  const theme = useTheme();

  // State for patients and loading
  const [patients, setPatients] = useState([]);
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
  const [openDetails, setOpenDetails] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  // State for menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuPatient, setMenuPatient] = useState(null);

  // Constants
  const statusColors = {
    active: 'success',
    pending: 'warning',
    inactive: 'error'
  };

  const statusLabels = {
    active: 'Active',
    pending: 'Pending',
    inactive: 'Inactive'
  };

  // DataGrid columns configuration
  const columns = [
    {
      field: 'name',
      headerName: 'Patient',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const patient = params.row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              {patient.name ? patient.name.charAt(0) : 'P'}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {patient.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {patient.email}
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
      field: 'primaryDoctor',
      headerName: 'Primary Doctor',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const doctor = params.value;
        return doctor ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                mr: 1,
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main
              }}
            >
              <LocalHospitalIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2">
                {doctor.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {doctor.profile?.specialization || 'General'}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Chip
            label="Not Assigned"
            size="small"
            variant="outlined"
            color="default"
          />
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
          label={statusLabels[params.value] || params.value}
          color={statusColors[params.value] || 'default'}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      )
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => {
        const patient = params.row;
        const hasInsurance = patient.profile?.insuranceProvider && patient.profile.insuranceProvider !== 'Self-Pay';

        return (
          <Chip
            label={hasInsurance ? patient.profile?.insuranceProvider || 'Insured' : 'Self-Pay'}
            color={hasInsurance ? 'success' : 'warning'}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        );
      }
    },
    {
      field: 'createdAt',
      headerName: 'Registered',
      flex: 0.8,
      minWidth: 150,
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        return format(new Date(params.value), 'MMM dd, yyyy');
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleViewPatient(params.row)}
              sx={{ mr: 0.5 }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More Actions">
            <IconButton
              size="small"
              onClick={(event) => handleMenuOpen(event, params.row)}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Fetch patients with filters
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Build query parameters for filtering
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (doctorFilter) {
        params.append('doctorId', doctorFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (insuranceFilter !== 'all') {
        params.append('insurance', insuranceFilter);
      }

      // Make API requests in parallel
      const [patientsRes, doctorsRes] = await Promise.all([
        axios.get(`/api/patients/hospital?${params.toString()}`),
        axios.get('/api/doctors/hospital')
      ]);

      // Map the response data to include id field for DataGrid
      setPatients(patientsRes.data.map(patient => ({
        id: patient._id,
        ...patient
      })));
      setDoctors(doctorsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Error fetching patients. Please try again.');
      setLoading(false);

      // Show error in snackbar
      setSnackbarMessage('Failed to load patients. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [statusFilter, doctorFilter, searchQuery, insuranceFilter]);

  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients, tabValue]);

  // Function to refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPatients().finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  };

  // Function to handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);

    // Reset all filters first
    setStatusFilter('all');
    setInsuranceFilter('all');

    // Update filters based on tab
    if (newValue === 0) { // All
      // Keep all filters as 'all'
    } else if (newValue === 1) { // Active
      setStatusFilter('active');
    } else if (newValue === 2) { // Pending
      setStatusFilter('pending');
    } else if (newValue === 3) { // Inactive
      setStatusFilter('inactive');
    } else if (newValue === 4) { // Insured
      setInsuranceFilter('insured');
    } else if (newValue === 5) { // Self-Pay
      setInsuranceFilter('self-pay');
    }
  };

  // Function to handle search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Function to apply search
  const applySearch = () => {
    fetchPatients();
  };

  // Function to clear filters
  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setDoctorFilter('');
    setInsuranceFilter('all');
    setTabValue(0);
  };

  // Function to handle menu open
  const handleMenuOpen = (event, patient) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuPatient(patient);
  };

  // Function to handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuPatient(null);
  };

  // Function to add a new patient
  const handleAddPatient = () => {
    setSelectedPatient(null);
    setOpenForm(true);
  };

  // Function to edit a patient
  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setOpenForm(true);
    handleMenuClose();
  };

  // Function to view patient details
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setOpenDetails(true);
  };

  // Function to open delete confirmation dialog
  const handleDeleteConfirmation = (patient) => {
    setSelectedPatient(patient);
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  // Function to delete a patient
  const handleDeletePatient = async () => {
    try {
      await axios.delete(`/api/patients/${selectedPatient._id}`);

      setSnackbarMessage('Patient removed successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setOpenDeleteDialog(false);
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);

      setSnackbarMessage('Failed to remove patient. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Function to handle doctor assignment
  const handleAssignDoctor = (patient) => {
    setSelectedPatient(patient);
    setOpenAssignDialog(true);
    handleMenuClose();
  };

  // Function to submit doctor assignment
  const handleAssignmentSubmit = async (doctorId) => {
    try {
      await axios.put(`/api/patients/${selectedPatient._id}`, {
        assignedDoctor: doctorId
      });

      setSnackbarMessage('Doctor assigned successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      fetchPatients();
    } catch (error) {
      console.error('Error assigning doctor:', error);

      setSnackbarMessage('Failed to assign doctor. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (values) => {
    try {
      if (selectedPatient) {
        // Update existing patient
        await axios.put(`/api/patients/${selectedPatient.id}`, values);
        setSnackbarMessage('Patient updated successfully');
      } else {
        // Create new patient
        await axios.post('/api/patients', values);
        setSnackbarMessage('Patient added successfully');
      }

      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenForm(false);
      fetchPatients();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving patient');
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
              Patients Management
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonAddIcon />}
                onClick={handleAddPatient}
                sx={{ mr: 1 }}
              >
                Add Patient
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
              <Tab label="All Patients" />
              <Tab
                label={
                  <Badge
                    badgeContent={patients.filter(p => p.status === 'active').length}
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
                    badgeContent={patients.filter(p => p.status === 'pending').length}
                    color="warning"
                    max={99}
                  >
                    Pending
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge
                    badgeContent={patients.filter(p => p.status === 'inactive').length}
                    color="error"
                    max={99}
                  >
                    Inactive
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge
                    badgeContent={patients.filter(p => p.profile?.insuranceProvider && p.profile.insuranceProvider !== 'Self-Pay').length}
                    color="success"
                    max={99}
                  >
                    Insured
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge
                    badgeContent={patients.filter(p => !p.profile?.insuranceProvider || p.profile.insuranceProvider === 'Self-Pay').length}
                    color="warning"
                    max={99}
                  >
                    Self-Pay
                  </Badge>
                }
              />
            </Tabs>
          </Paper>

          {/* Search and filter section */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  placeholder="Search patients by name, email or phone..."
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
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Doctor</InputLabel>
                  <Select
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                    label="Filter by Doctor"
                  >
                    <MenuItem value="">All Doctors</MenuItem>
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor._id} value={doctor._id}>
                        {doctor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>Insurance Status</InputLabel>
                  <Select
                    value={insuranceFilter}
                    onChange={(e) => setInsuranceFilter(e.target.value)}
                    label="Insurance Status"
                  >
                    <MenuItem value="all">All Patients</MenuItem>
                    <MenuItem value="insured">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip size="small" label="Insured" color="success" sx={{ mr: 1 }} />
                        Insured Patients
                      </Box>
                    </MenuItem>
                    <MenuItem value="self-pay">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip size="small" label="Self-Pay" color="warning" sx={{ mr: 1 }} />
                        Self-Pay Patients
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={applySearch}
                    fullWidth
                  >
                    Filter
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

          {/* Patients data grid */}
          <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={patients}
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

          {/* Context menu for patient actions */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleEditPatient(menuPatient)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Patient</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleAssignDoctor(menuPatient)}>
              <ListItemIcon>
                <AssignmentIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Assign Doctor</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleDeleteConfirmation(menuPatient)}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: theme.palette.error.main }}>Remove Patient</ListItemText>
            </MenuItem>
          </Menu>

          {/* Patient Form Dialog */}
          <PatientForm
            open={openForm}
            onClose={() => setOpenForm(false)}
            onSubmit={handleSubmit}
            initialValues={selectedPatient}
          />

          {/* Patient Details Dialog */}
          <PatientDetails
            open={openDetails}
            onClose={() => setOpenDetails(false)}
            patient={selectedPatient}
          />

          {/* Patient Assignment Dialog */}
          <PatientAssignmentForm
            open={openAssignDialog}
            onClose={() => setOpenAssignDialog(false)}
            patient={menuPatient || selectedPatient}
            onSubmit={handleAssignmentSubmit}
          />

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
          >
            <DialogTitle>Remove Patient</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to remove {selectedPatient?.name} from your patient list?
                This action will mark the patient as inactive and remove any doctor assignments.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
              <Button onClick={handleDeletePatient} color="error" variant="contained">
                Remove
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Container>
  );
};

export default HospitalPatients;