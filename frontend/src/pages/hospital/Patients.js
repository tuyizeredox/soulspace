import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from '../../utils/axios';
import PatientForm from '../patients/PatientForm';
import PatientDetails from '../patients/PatientDetails';

const HospitalPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'assignedDoctor', headerName: 'Assigned Doctor', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleViewPatient(params.row)}>
            <VisibilityIcon />
          </IconButton>
          <IconButton onClick={() => handleEditPatient(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeletePatient(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/patients/hospital');
      setPatients(response.data.map(patient => ({
        id: patient._id,
        ...patient
      })));
      setLoading(false);
    } catch (error) {
      setError('Error fetching patients');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setOpenForm(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setOpenForm(true);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setOpenDetails(true);
  };

  const handleDeletePatient = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await axios.delete(`/api/patients/${id}`);
        setSuccess('Patient deleted successfully');
        fetchPatients();
      } catch (error) {
        setError('Error deleting patient');
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedPatient) {
        await axios.put(`/api/patients/${selectedPatient.id}`, values);
        setSuccess('Patient updated successfully');
      } else {
        await axios.post('/api/patients', values);
        setSuccess('Patient added successfully');
      }
      setOpenForm(false);
      fetchPatients();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving patient');
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
          Patients Management
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddPatient}
          sx={{ mb: 3 }}
        >
          Add New Patient
        </Button>

        <DataGrid
          rows={patients}
          columns={columns}
          pageSize={10}
          autoHeight
          disableSelectionOnClick
        />

        <PatientForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={handleSubmit}
          initialValues={selectedPatient}
        />

        <PatientDetails
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          patient={selectedPatient}
        />
      </Box>
    </Container>
  );
};

export default HospitalPatients;