import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPatients,
  deletePatient,
  setSelectedPatient,
} from '../../store/slices/patientSlice';
import PatientForm from './PatientForm';
import PatientDetails from './PatientDetails';

const Patients = () => {
  const dispatch = useDispatch();
  const { patients, loading, error } = useSelector((state) => state.patient);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

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

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      await dispatch(deletePatient(patientId));
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleViewPatient(params.row)}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            color="secondary"
            size="small"
            onClick={() => handleEditPatient(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeletePatient(params.row._id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

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

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddPatient}
          sx={{ mb: 3 }}
        >
          Add New Patient
        </Button>

        <Card>
          <CardContent>
            <DataGrid
              rows={patients.map((patient) => ({
                id: patient._id,
                ...patient,
              }))}
              columns={columns}
              pageSize={10}
              autoHeight
              disableSelectionOnClick
            />
          </CardContent>
        </Card>

        <PatientForm
          open={openForm}
          onClose={() => setOpenForm(false)}
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

export default Patients;
