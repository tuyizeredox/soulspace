import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import axios from '../../utils/axios';

const HospitalAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const appointmentTypes = [
    'General Checkup',
    'Consultation',
    'Follow-up',
    'Specialist Visit',
    'Emergency',
    'Laboratory Test',
    'Imaging'
  ];
  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'error',
    completed: 'info'
  };
  const columns = [
    {
      field: 'date',
      headerName: 'Date & Time',
      flex: 1,
      valueFormatter: (params) => format(new Date(params.value), 'PPpp')
    },
    {
      field: 'patientName',
      headerName: 'Patient',
      flex: 1,
      valueGetter: (params) => params.row.patient?.name
    },
    {
      field: 'doctorName',
      headerName: 'Doctor',
      flex: 1,
      valueGetter: (params) => params.row.doctor?.name
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 1
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={statusColors[params.value] || 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleStatusUpdate(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, doctorsRes, patientsRes] = await Promise.all([
        axios.get('/api/appointments/hospital'),
        axios.get('/api/doctors/hospital'),
        axios.get('/api/patients/hospital')
      ]);
      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching data');
      setLoading(false);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const appointmentData = {
        patient: formData.get('patient'),
        doctor: formData.get('doctor'),
        date: formData.get('date'),
        type: formData.get('type'),
        reason: formData.get('reason'),
        notes: formData.get('notes')
      };
      if (selectedAppointment) {
        await axios.put(`/api/appointments/${selectedAppointment.id}`, appointmentData);
        setSuccess('Appointment updated successfully');
      } else {
        await axios.post('/api/appointments', appointmentData);
        setSuccess('Appointment created successfully');
      }
      setOpenForm(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving appointment');
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`/api/appointments/${id}`);
        setSuccess('Appointment deleted successfully');
        fetchData();
      } catch (error) {
        setError('Error deleting appointment');
      }
    }
  };
  // Move all functions inside the component
  const handleStatusUpdate = async (appointment) => {
    if (appointment.status === 'pending') {
      setCurrentAppointment(appointment);
      setOpenAssignDialog(true);
    } else {
      updateAppointmentStatus(appointment.id, 'completed');
    }
  };
  const updateAppointmentStatus = async (appointmentId, status, doctorId = null) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}/status`, {
        status,
        doctorId,
        notes: `Status updated to ${status}`
      });
      setSuccess(`Appointment ${status} successfully`);
      fetchData();
    } catch (error) {
      setError('Error updating appointment status');
    }
  };
  // Single return statement with conditional rendering
  return (
    <Container maxWidth="lg">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Appointments Management
          </Typography>
  
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
  
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedAppointment(null);
              setOpenForm(true);
            }}
            sx={{ mb: 3 }}
          >
            New Appointment
          </Button>
  
          <DataGrid
            rows={appointments}
            columns={columns}
            pageSize={10}
            autoHeight
            disableSelectionOnClick
          />
  
          {/* Appointment Form Dialog */}
          <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
              <DialogTitle>
                {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Patient</InputLabel>
                      <Select
                        name="patient"
                        defaultValue={selectedAppointment?.patient?._id || ''}
                        label="Patient"
                        required
                      >
                        {patients.map((patient) => (
                          <MenuItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Doctor</InputLabel>
                        <Select
                          name="doctor"
                          defaultValue={selectedAppointment?.doctor?._id || ''}
                          label="Doctor"
                          required
                        >
                          {doctors.map((doctor) => (
                            <MenuItem key={doctor.id} value={doctor.id}>
                              {doctor.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="date"
                        label="Date and Time"
                        type="datetime-local"
                        defaultValue={selectedAppointment?.date || ''}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          name="type"
                          defaultValue={selectedAppointment?.type || ''}
                          label="Type"
                          required
                        >
                          {appointmentTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="reason"
                        label="Reason"
                        multiline
                        rows={2}
                        defaultValue={selectedAppointment?.reason || ''}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="notes"
                        label="Notes"
                        multiline
                        rows={2}
                        defaultValue={selectedAppointment?.notes || ''}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenForm(false)}>Cancel</Button>
                  <Button type="submit" variant="contained">
                    {selectedAppointment ? 'Update' : 'Create'}
                  </Button>
                </DialogActions>
              </form>
            </Dialog>
          </Box>
        )}
      </Container>
    );
  };
  
export default HospitalAppointments;