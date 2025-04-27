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
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const Prescription = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '', notes: '' }]);
  const [deliveryOption, setDeliveryOption] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientsRes, prescriptionsRes] = await Promise.all([
        axios.get('/api/patient-assignments/doctor/' + localStorage.getItem('userId')),
        axios.get('/api/prescriptions/doctor/' + localStorage.getItem('userId'))
      ]);

      setPatients(patientsRes.data.map(a => a.patient));
      setPrescriptions(prescriptionsRes.data);
    } catch (error) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', notes: '' }]);
  };

  const handleRemoveMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const prescriptionData = {
        patient: selectedPatient,
        diagnosis,
        medications,
        deliveryOption,
        deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : null
      };

      await axios.post('/api/prescriptions', prescriptionData);
      
      setSuccess('Prescription created successfully');
      fetchData();
      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating prescription');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient('');
    setDiagnosis('');
    setMedications([{ name: '', dosage: '', frequency: '', duration: '', notes: '' }]);
    setDeliveryOption('pickup');
    setDeliveryAddress({
      street: '',
      city: '',
      state: '',
      zipCode: ''
    });
  };

  const columns = [
    { field: 'patientName', headerName: 'Patient', flex: 1 },
    { field: 'diagnosis', headerName: 'Diagnosis', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setSelectedPrescription(params.row);
            setOpenDialog(true);
          }}
        >
          View Details
        </Button>
      )
    }
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
          Prescriptions
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  New Prescription
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

                <TextField
                  fullWidth
                  label="Diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />

                {medications.map((medication, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">Medication {index + 1}</Typography>
                      {index > 0 && (
                        <IconButton size="small" onClick={() => handleRemoveMedication(index)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>

                    <TextField
                      fullWidth
                      label="Medication Name"
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Dosage"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Frequency"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Duration"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Notes"
                      value={medication.notes}
                      onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                      multiline
                      rows={2}
                    />
                  </Card>
                ))}

                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddMedication}
                  sx={{ mb: 2 }}
                >
                  Add Medication
                </Button>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Delivery Option</InputLabel>
                  <Select
                    value={deliveryOption}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    label="Delivery Option"
                  >
                    <MenuItem value="pickup">Pickup</MenuItem>
                    <MenuItem value="delivery">Home Delivery</MenuItem>
                  </Select>
                </FormControl>

                {deliveryOption === 'delivery' && (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="City"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="State"
                      value={deliveryAddress.state}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      value={deliveryAddress.zipCode}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                    />
                  </Box>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={!selectedPatient || !diagnosis || medications.some(m => !m.name || !m.dosage)}
                >
                  Create Prescription
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Prescription History
                </Typography>
                <DataGrid
                  rows={prescriptions.map(p => ({
                    id: p._id,
                    patientName: p.patient.name,
                    diagnosis: p.diagnosis,
                    status: p.status,
                    date: p.createdAt,
                    ...p
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

      {/* Prescription Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Prescription Details
        </DialogTitle>
        <DialogContent>
          {selectedPrescription && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Patient</Typography>
                <Typography>{selectedPrescription.patientName}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Diagnosis</Typography>
                <Typography>{selectedPrescription.diagnosis}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Medications</Typography>
                {selectedPrescription.medications.map((med, index) => (
                  <Card key={index} variant="outlined" sx={{ mt: 1, p: 2 }}>
                    <Typography variant="subtitle2">{med.name}</Typography>
                    <Typography>Dosage: {med.dosage}</Typography>
                    <Typography>Frequency: {med.frequency}</Typography>
                    <Typography>Duration: {med.duration}</Typography>
                    {med.notes && <Typography>Notes: {med.notes}</Typography>}
                  </Card>
                ))}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Status</Typography>
                <Typography>{selectedPrescription.status}</Typography>
              </Grid>
              {selectedPrescription.insuranceDetails && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Insurance Details</Typography>
                  <Typography>Provider: {selectedPrescription.insuranceDetails.provider}</Typography>
                  <Typography>Policy Number: {selectedPrescription.insuranceDetails.policyNumber}</Typography>
                  <Typography>Coverage: {selectedPrescription.insuranceDetails.coverage}</Typography>
                  <Typography>Verified: {selectedPrescription.insuranceDetails.verified ? 'Yes' : 'No'}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Prescription;
