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
  Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from '../../utils/axios';

const HospitalPharmacists = () => {
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedPharmacist, setSelectedPharmacist] = useState(null);

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'licenseNumber', headerName: 'License Number', flex: 1 },
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

  const fetchPharmacists = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/pharmacists/hospital');
      setPharmacists(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching pharmacists');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacists();
  }, []);

  const handleAddPharmacist = () => {
    setSelectedPharmacist(null);
    setOpenForm(true);
  };

  const handleEdit = (pharmacist) => {
    setSelectedPharmacist(pharmacist);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pharmacist?')) {
      try {
        await axios.delete(`/api/pharmacists/${id}`);
        setSuccess('Pharmacist deleted successfully');
        fetchPharmacists();
      } catch (error) {
        setError('Error deleting pharmacist');
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const pharmacistData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        licenseNumber: formData.get('licenseNumber'),
        password: formData.get('password'),
      };

      if (selectedPharmacist) {
        await axios.put(`/api/pharmacists/${selectedPharmacist.id}`, pharmacistData);
        setSuccess('Pharmacist updated successfully');
      } else {
        await axios.post('/api/pharmacists', pharmacistData);
        setSuccess('Pharmacist added successfully');
      }
      setOpenForm(false);
      fetchPharmacists();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving pharmacist');
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
          Pharmacists Management
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddPharmacist}
          sx={{ mb: 3 }}
        >
          Add New Pharmacist
        </Button>

        <DataGrid
          rows={pharmacists}
          columns={columns}
          pageSize={10}
          autoHeight
          disableSelectionOnClick
        />

        <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {selectedPharmacist ? 'Edit Pharmacist' : 'Add New Pharmacist'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Full Name"
                    defaultValue={selectedPharmacist?.name || ''}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    type="email"
                    defaultValue={selectedPharmacist?.email || ''}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="phone"
                    label="Phone"
                    defaultValue={selectedPharmacist?.phone || ''}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="licenseNumber"
                    label="License Number"
                    defaultValue={selectedPharmacist?.licenseNumber || ''}
                    required
                  />
                </Grid>
                {!selectedPharmacist && (
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
                {selectedPharmacist ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Container>
  );
};

export default HospitalPharmacists;