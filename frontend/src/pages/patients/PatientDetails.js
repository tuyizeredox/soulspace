import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Box,
  Chip,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Cake,
  Home,
  LocalHospital,
  ContactEmergency,
  HealthAndSafety,
} from '@mui/icons-material';

const PatientDetails = ({ open, onClose, patient }) => {
  if (!patient) return null;

  const InfoRow = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {icon}
      <Typography variant="subtitle1" sx={{ ml: 2, mr: 1, fontWeight: 'bold' }}>
        {label}:
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Patient Details
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <InfoRow
                icon={<Person color="primary" />}
                label="Name"
                value={patient.name}
              />
              <InfoRow
                icon={<Email color="primary" />}
                label="Email"
                value={patient.email}
              />
              <InfoRow
                icon={<Phone color="primary" />}
                label="Phone"
                value={patient.phone}
              />
              <InfoRow
                icon={<Cake color="primary" />}
                label="Date of Birth"
                value={new Date(patient.dateOfBirth).toLocaleDateString()}
              />
              <InfoRow
                icon={<Home color="primary" />}
                label="Address"
                value={patient.address}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Medical Information
            </Typography>
            <Box sx={{ mb: 3 }}>
              <InfoRow
                icon={<LocalHospital color="primary" />}
                label="Medical History"
                value={patient.medicalHistory || 'No medical history recorded'}
              />
              <InfoRow
                icon={<ContactEmergency color="primary" />}
                label="Emergency Contact"
                value={patient.emergencyContact}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Insurance Information
            </Typography>
            <Box sx={{ mb: 3 }}>
              <InfoRow
                icon={<HealthAndSafety color="primary" />}
                label="Insurance Provider"
                value={patient.insuranceProvider || 'Not provided'}
              />
              <InfoRow
                icon={<HealthAndSafety color="primary" />}
                label="Insurance Number"
                value={patient.insuranceNumber || 'Not provided'}
              />
            </Box>
          </Grid>

          {patient.appointments && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Recent Appointments
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {patient.appointments.map((appointment, index) => (
                  <Chip
                    key={index}
                    label={`${new Date(appointment.date).toLocaleDateString()} - ${
                      appointment.type
                    }`}
                    color={appointment.status === 'completed' ? 'success' : 'primary'}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientDetails;
