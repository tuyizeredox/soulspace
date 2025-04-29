import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tab,
  Tabs,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';
import axios from 'axios';
import AppointmentForm from './AppointmentForm';
import AppointmentDetails from './AppointmentDetails';

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'success';
    case 'cancelled':
      return 'error';
    case 'completed':
      return 'info';
    default:
      return 'default';
  }
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  // Get user from both auth systems
  const { user: authUser } = useSelector((state) => state.auth);
  const { user: userAuthUser } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = userAuthUser || authUser;

  console.log('Appointments component - User from auth:', authUser);
  console.log('Appointments component - User from userAuth:', userAuthUser);
  console.log('Appointments component - Using user:', user);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      if (!user) {
        console.error('No user available to fetch appointments');
        setLoading(false);
        return;
      }

      // Get token from both auth systems
      const authToken = localStorage.getItem('token');
      const userAuthToken = localStorage.getItem('userToken');
      const token = userAuthToken || authToken;

      console.log('Fetching appointments for user role:', user?.role);
      console.log('User ID:', user?.id);
      console.log('Using token:', !!token);

      // Set up headers with token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      let response;

      if (user.role === 'patient') {
        // Use patient-specific endpoint
        // Use either id or _id, whichever is available
        const userId = user.id || user._id;
        console.log('Using patient endpoint for user ID:', userId);
        const url = `/api/appointments/patient?patientId=${userId}`;
        console.log('Request URL:', url);
        response = await axios.get(url, config);
        console.log('Patient appointments response:', response.data);
      } else if (user.role === 'hospital_admin') {
        // Use hospital admin endpoint
        console.log('Using hospital admin endpoint');
        response = await axios.get('/api/appointments/hospital', config);
      } else if (user.role === 'doctor') {
        // Use doctor endpoint or filter by doctor ID
        // Use either id or _id, whichever is available
        const doctorId = user.id || user._id;
        console.log('Using doctor endpoint for doctor ID:', doctorId);
        response = await axios.get(`/api/appointments?doctor=${doctorId}`, config);
      } else {
        // Default endpoint
        console.log('Using default endpoint');
        response = await axios.get('/api/appointments', config);
      }

      console.log('Raw appointments data:', response.data);
      console.log('Number of appointments:', response.data.length);

      // Transform data if needed
      const formattedAppointments = response.data.map(appointment => ({
        ...appointment,
        id: appointment._id || appointment.id, // Ensure id field exists for DataGrid
        patientName: appointment.patient?.name || 'Unknown Patient',
        doctorName: appointment.doctor?.name || 'Unknown Doctor'
      }));

      console.log('Formatted appointments:', formattedAppointments);
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const columns = [
    {
      field: 'date',
      headerName: 'Date & Time',
      width: 180,
      valueFormatter: (params) =>
        format(new Date(params.value), 'MMM dd, yyyy HH:mm'),
    },
    {
      field: 'patientName',
      headerName: 'Patient',
      width: 200,
      valueGetter: (params) => params.row.patient?.name || '',
    },
    {
      field: 'doctorName',
      headerName: 'Doctor',
      width: 200,
      valueGetter: (params) => params.row.doctor?.name || '',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
    },
    // Only show insurance and wearable device columns for hospital admin
    ...(user && user.role === 'hospital_admin' ? [
      {
        field: 'insurance',
        headerName: 'Insurance',
        width: 150,
        renderCell: (params) => {
          try {
            if (params.row.notes && typeof params.row.notes === 'string' && params.row.notes.startsWith('{')) {
              const parsedNotes = JSON.parse(params.row.notes);
              if (parsedNotes.insuranceInfo) {
                const isSelfPay = parsedNotes.insuranceInfo.provider === 'Self-Pay';
                return (
                  <Chip
                    size="small"
                    label={isSelfPay ? 'Self-Pay' : parsedNotes.insuranceInfo.provider}
                    color={isSelfPay ? 'warning' : 'success'}
                  />
                );
              }
            }
            return <Chip size="small" label="Unknown" color="default" />;
          } catch (e) {
            return <Chip size="small" label="Error" color="error" />;
          }
        },
      },
      {
        field: 'wearableDevice',
        headerName: 'Wearable Device',
        width: 150,
        renderCell: (params) => {
          try {
            if (params.row.notes && typeof params.row.notes === 'string' && params.row.notes.startsWith('{')) {
              const parsedNotes = JSON.parse(params.row.notes);
              if (parsedNotes.wearableDevice) {
                const isOwned = parsedNotes.wearableDevice.alreadyOwned;
                return (
                  <Chip
                    size="small"
                    label={isOwned ? 'Already Owned' : 'Requested'}
                    color={isOwned ? 'success' : 'info'}
                  />
                );
              }
            }
            return <Chip size="small" label="None" color="default" />;
          } catch (e) {
            return <Chip size="small" label="Error" color="error" />;
          }
        },
      }
    ] : []),
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleViewAppointment(params.row)}
          >
            <VisibilityIcon />
          </IconButton>
          {user && (user.role === 'hospital_admin' || user.role === 'doctor') && (
            <IconButton
              color="secondary"
              onClick={() => handleEditAppointment(params.row)}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDetails(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenForm(true);
  };

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setOpenForm(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      if (selectedAppointment) {
        await axios.put(`/api/appointments/${selectedAppointment.id}`, values);
      } else {
        await axios.post('/api/appointments', values);
      }
      fetchAppointments();
      setOpenForm(false);
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const getFilteredAppointments = () => {
    switch (tabValue) {
      case 0: // All
        return appointments;
      case 1: // Upcoming
        return appointments.filter(
          (app) => new Date(app.date) > new Date() && app.status !== 'cancelled'
        );
      case 2: // Pending
        return appointments.filter((app) => app.status === 'pending');
      case 3: // Completed
        return appointments.filter((app) => app.status === 'completed');
      default:
        return appointments;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center" mb={3}>
          <Grid item>
            <Typography variant="h4" gutterBottom>
              Appointments Management
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchAppointments}
              >
                Refresh
              </Button>

              {user && (user.role === 'hospital_admin' || user.role === 'patient') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddAppointment}
                >
                  Schedule Appointment
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="All Appointments" />
              <Tab label="Upcoming" />
              <Tab label="Pending" />
              <Tab label="Completed" />
            </Tabs>
          </Box>

          <Box sx={{ height: 600, width: '100%', p: 2 }}>
            <DataGrid
              rows={getFilteredAppointments()}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              loading={loading}
            />
          </Box>
        </Card>

        {/* Appointment Form Dialog */}
        <Dialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
          </DialogTitle>
          <DialogContent>
            <AppointmentForm
              initialValues={selectedAppointment}
              onSubmit={handleFormSubmit}
            />
          </DialogContent>
        </Dialog>

        {/* Appointment Details Dialog */}
        <Dialog
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogContent>
            <AppointmentDetails appointment={selectedAppointment} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetails(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Appointments;
