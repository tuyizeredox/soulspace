import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const PatientAssignment = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [primaryDoctor, setPrimaryDoctor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientsRes, doctorsRes, assignmentsRes] = await Promise.all([
        axios.get('/api/users?role=patient'),
        axios.get('/api/users?role=doctor'),
        axios.get('/api/patient-assignments')
      ]);

      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await axios.post('/api/patient-assignments', {
        patientId: selectedPatient,
        doctorIds: selectedDoctors,
        primaryDoctorId: primaryDoctor,
        hospitalId: localStorage.getItem('hospitalId')
      });

      setSuccess('Patient assigned successfully');
      setAssignments([...assignments, response.data]);
      
      // Reset form
      setSelectedPatient('');
      setSelectedDoctors([]);
      setPrimaryDoctor('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error assigning patient');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'patientName', headerName: 'Patient', flex: 1 },
    { field: 'doctors', headerName: 'Assigned Doctors', flex: 2,
      renderCell: (params) => (
        <Box>
          {params.value.map((doctor, index) => (
            <Chip
              key={index}
              label={doctor.name}
              size="small"
              sx={{ mr: 0.5 }}
            />
          ))}
        </Box>
      )
    },
    { field: 'primaryDoctor', headerName: 'Primary Doctor', flex: 1 },
    { field: 'assignedDate', headerName: 'Assigned Date', flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => handleRemoveAssignment(params.row.id)}
        >
          Remove
        </Button>
      )
    }
  ];

  const handleRemoveAssignment = async (assignmentId) => {
    try {
      await axios.delete(`/api/patient-assignments/${assignmentId}`);
      setAssignments(assignments.filter(a => a._id !== assignmentId));
      setSuccess('Assignment removed successfully');
    } catch (error) {
      setError('Error removing assignment');
    }
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
          Patient Assignment
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assign Patient to Doctors
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Patient</InputLabel>
                  <Select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    label="Select Patient"
                  >
                    {patients.map((patient) => (
                      <MenuItem key={patient._id} value={patient._id}>
                        {patient.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Assign Doctors</InputLabel>
                  <Select
                    multiple
                    value={selectedDoctors}
                    onChange={(e) => setSelectedDoctors(e.target.value)}
                    label="Assign Doctors"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((doctorId) => (
                          <Chip
                            key={doctorId}
                            label={doctors.find(d => d._id === doctorId)?.name}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor._id} value={doctor._id}>
                        {doctor.name} - {doctor.specialization}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Primary Doctor</InputLabel>
                  <Select
                    value={primaryDoctor}
                    onChange={(e) => setPrimaryDoctor(e.target.value)}
                    label="Primary Doctor"
                  >
                    {selectedDoctors.map((doctorId) => (
                      <MenuItem key={doctorId} value={doctorId}>
                        {doctors.find(d => d._id === doctorId)?.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleAssignment}
                  disabled={!selectedPatient || selectedDoctors.length === 0 || !primaryDoctor}
                >
                  Assign Patient
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Assignments
                </Typography>
                <DataGrid
                  rows={assignments.map(a => ({
                    id: a._id,
                    patientName: a.patient.name,
                    doctors: a.doctors,
                    primaryDoctor: a.primaryDoctor.name,
                    assignedDate: a.assignedDate
                  }))}
                  columns={columns}
                  pageSize={5}
                  autoHeight
                  disableSelectionOnClick
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PatientAssignment;
