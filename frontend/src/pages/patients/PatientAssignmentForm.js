import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { LocalHospital as DoctorIcon } from '@mui/icons-material';
import axios from '../../utils/axios';

const PatientAssignmentForm = ({ open, onClose, patient, onSubmit }) => {
  const theme = useTheme();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch doctors when the dialog opens
  useEffect(() => {
    if (open) {
      fetchDoctors();
    }
  }, [open]);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedDoctor('');
      setError('');
    }
  }, [open]);
  
  // Fetch doctors from the hospital
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/doctors/hospital');
      setDoctors(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!selectedDoctor) {
      setError('Please select a doctor');
      return;
    }
    
    onSubmit(selectedDoctor);
    onClose();
  };
  
  if (!patient) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Assign Doctor to Patient
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Patient Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mr: 2
                  }}
                >
                  {patient.name ? patient.name.charAt(0) : 'P'}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {patient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {patient.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Select Primary Doctor
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Doctor</InputLabel>
              <Select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                label="Doctor"
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor._id} value={doctor._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 30, 
                          height: 30, 
                          mr: 1, 
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main
                        }}
                      >
                        <DoctorIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {doctor.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doctor.profile?.specialization || 'General Practitioner'}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              The selected doctor will be assigned as the primary doctor for this patient.
              They will be responsible for the patient's overall care.
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={!selectedDoctor || loading}
        >
          Assign Doctor
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientAssignmentForm;
