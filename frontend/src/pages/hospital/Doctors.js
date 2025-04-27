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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from '../../utils/axios';

const HospitalDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'specialization', headerName: 'Specialization', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/doctors/hospital');
      setDoctors(response.data.map(doctor => ({
        id: doctor._id,
        ...doctor
      })));
      setLoading(false);
    } catch (error) {
      setError('Error fetching doctors');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = () => {
    setSelectedDoctor(null);
    setOpenForm(true);
  };

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await axios.delete(`/api/doctors/${id}`);
        setSuccess('Doctor deleted successfully');
        fetchDoctors();
      } catch (error) {
        setError('Error deleting doctor');
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const doctorData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        specialization: formData.get('specialization'),
        password: formData.get('password'),
      };

      if (selectedDoctor) {
        await axios.put(`/api/doctors/${selectedDoctor.id}`, doctorData);
        setSuccess('Doctor updated successfully');
      } else {
        await axios.post('/api/doctors', doctorData);
        setSuccess('Doctor added successfully');
      }
      setOpenForm(false);
      fetchDoctors();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving doctor');
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
          Doctors Management
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddDoctor}
          sx={{ mb: 3 }}
        >
          Add New Doctor
        </Button>

        <DataGrid
          rows={doctors}
          columns={columns}
          pageSize={10}
          autoHeight
          disableSelectionOnClick
        />

        <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {selectedDoctor ? 'Edit Doctor' : 'Add New Doctor'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Full Name"
                    defaultValue={selectedDoctor?.name || ''}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    type="email"
                    defaultValue={selectedDoctor?.email || ''}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="phone"
                    label="Phone"
                    defaultValue={selectedDoctor?.phone || ''}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="specialization"
                    label="Specialization"
                    defaultValue={selectedDoctor?.specialization || ''}
                    required
                  />
                </Grid>
                {!selectedDoctor && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      required
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenForm(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                {selectedDoctor ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Container>
  );
};

export default HospitalDoctors;