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
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
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
          {(user.role === 'hospital_admin' || user.role === 'doctor') && (
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
          {(user.role === 'hospital_admin' || user.role === 'patient') && (
            <Grid item>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddAppointment}
              >
                Schedule Appointment
              </Button>
            </Grid>
          )}
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
