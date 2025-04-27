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
import axios from '../../utils/axios';

const PatientAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [primaryDoctor, setPrimaryDoctor] = useState('');

  const columns = [
    {
      field: 'patientName',
      headerName: 'Patient',
      flex: 1,
      valueGetter: (params) => params.row.patient?.name
    },
    {
      field: 'primaryDoctorName',
      headerName: 'Primary Doctor',
      flex: 1,
      valueGetter: (params) => params.row.primaryDoctor?.name
    },
    {
      field: 'assignedDoctors',
      headerName: 'Assigned Doctors',
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.row.doctors?.map((doctor) => (
            <Chip
              key={doctor._id}
              label={doctor.name}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )
    },
    {
      field: 'assignedDate',
      headerName: 'Assigned Date',
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.row.active ? 'Active' : 'Inactive'}
          color={params.row.active ? 'success' : 'default'}
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
          <IconButton onClick={() => handleEdit(params.row)}>
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
      const [assignmentsRes, patientsRes, doctorsRes] = await Promise.all([
        axios.get('/api/patient-assignments/hospital'),
        axios.get('/api/patients/hospital'),
        axios.get('/api/doctors/hospital')
      ]);

      setAssignments(assignmentsRes.data);
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching data');
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const assignmentData = {
        patient: selectedPatient,
        doctors: selectedDoctors,
        primaryDoctor: primaryDoctor
      };

      if (selectedAssignment) {
        await axios.put(`/api/patient-assignments/${selectedAssignment.id}`, assignmentData);
        setSuccess('Assignment updated successfully');
      } else {
        await axios.post('/api/patient-assignments', assignmentData);
        setSuccess('Assignment created successfully');
      }
      setOpenForm(false);
      fetchData();
      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving assignment');
    }
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setSelectedPatient(assignment.patient._id);
    setSelectedDoctors(assignment.doctors.map(d => d._id));
    setPrimaryDoctor(assignment.primaryDoctor._id);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`/api/patient-assignments/${id}`);
        setSuccess('Assignment deleted successfully');
        fetchData();
      } catch (error) {
        setError('Error deleting assignment');
      }
    }
  };

  const resetForm = () => {
    setSelectedPatient('');
    setSelectedDoctors([]);
    setPrimaryDoctor('');
    setSelectedAssignment(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Patient Assignments
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenForm(true);
          }}
          sx={{ mb: 3 }}
        >
          New Assignment
        </Button>

        <DataGrid
          rows={assignments}
          columns={columns}
          pageSize={10}
          autoHeight
          disableSelectionOnClick
        />

        <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {selectedAssignment ? 'Edit Assignment' : 'New Assignment'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Patient</InputLabel>
                    <Select
                      value={selectedPatient}
                      onChange={(e) => setSelectedPatient(e.target.value)}
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
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Primary Doctor</InputLabel>
                    <Select
                      value={primaryDoctor}
                      onChange={(e) => setPrimaryDoctor(e.target.value)}
                      label="Primary Doctor"
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
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Additional Doctors</InputLabel>
                    <Select
                      multiple
                      value={selectedDoctors}
                      onChange={(e) => setSelectedDoctors(e.target.value)}
                      label="Additional Doctors"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((doctorId) => (
                            <Chip
                              key={doctorId}
                              label={doctors.find(d => d.id === doctorId)?.name}
                              size="small"
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenForm(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                {selectedAssignment ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PatientAssignments;