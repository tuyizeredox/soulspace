import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  LocalHospital as LocalHospitalIcon,
  History as HistoryIcon,
  Medication as MedicationIcon,
  Warning as WarningIcon,
  Chat as ChatIcon,
  VideoCall as VideoCallIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../../utils/axiosConfig';

const PatientQuickView = ({ open, onClose, patient, appointment }) => {
  const theme = useTheme();
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  // Fetch detailed patient information
  useEffect(() => {
    const fetchPatientDetails = async () => {
      const patientId = patient?._id || patient?.id;
      if (!open || !patientId) return;
      
      try {
        setLoading(true);
        
        // Fetch patient details, medical history, and prescriptions
        const [patientRes, historyRes, prescriptionsRes] = await Promise.all([
          axios.get(`/api/patients/${patientId}`),
          axios.get(`/api/medical-records/patient/${patientId}`),
          axios.get(`/api/prescriptions/patient/${patientId}`)
        ]);

        setPatientDetails(patientRes.data);
        setMedicalHistory(historyRes.data || []);
        setPatientPrescriptions(prescriptionsRes.data || []);
      } catch (error) {
        console.error('Error fetching patient details:', error);
        
        // Set mock data for development
        setPatientDetails({
          ...patient,
          age: 35,
          gender: 'Male',
          phone: '+1 (555) 123-4567',
          email: 'patient@example.com',
          address: '123 Main St, City, State 12345',
          bloodType: 'O+',
          allergies: ['Penicillin', 'Shellfish'],
          emergencyContact: {
            name: 'Jane Doe',
            relationship: 'Spouse',
            phone: '+1 (555) 987-6543'
          }
        });
        
        setMedicalHistory([
          {
            _id: '1',
            date: '2024-01-15',
            diagnosis: 'Hypertension',
            treatment: 'Prescribed Lisinopril 10mg',
            doctor: 'Dr. Smith'
          },
          {
            _id: '2',
            date: '2024-01-01',
            diagnosis: 'Annual Checkup',
            treatment: 'Routine examination, all normal',
            doctor: 'Dr. Johnson'
          }
        ]);
        
        setPatientPrescriptions([
          {
            _id: '1',
            prescriptionNumber: 'RX-2024-001',
            status: 'active',
            diagnosis: 'Hypertension',
            createdDate: '2024-01-15',
            medications: [
              {
                name: 'Lisinopril',
                dosage: '10mg',
                frequency: 'Once daily',
                duration: '30 days'
              }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [open, patient]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (!patient) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontSize: '1.5rem',
                fontWeight: 600
              }}
            >
              {patient.name?.charAt(0) || 'P'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {patient.name || 'Unknown Patient'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Patient ID: {(patient._id || patient.id)?.slice(-8) || 'N/A'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <Box>
            <Skeleton variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
          </Box>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Basic Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CakeIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            Age: {patientDetails?.age || calculateAge(patientDetails?.dateOfBirth) || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            Gender: {patientDetails?.gender || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <LocalHospitalIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            Blood Type: {patientDetails?.bloodType || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {patientDetails?.phone || 'No phone number'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {patientDetails?.email || 'No email'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Allergies & Warnings */}
              {patientDetails?.allergies?.length > 0 && (
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.warning.main}` }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <WarningIcon color="warning" />
                        <Typography variant="h6" fontWeight={600} color="warning.main">
                          Allergies & Warnings
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {patientDetails.allergies.map((allergy, index) => (
                          <Chip
                            key={index}
                            label={allergy}
                            color="warning"
                            variant="outlined"
                            icon={<WarningIcon />}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Current Appointment */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Current Appointment
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Date: {new Date(appointment?.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Time: {appointment?.time || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Type: {appointment?.type || 'Consultation'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Reason: {appointment?.reason || 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Medical History */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Recent Medical History
                    </Typography>
                    {medicalHistory.length > 0 ? (
                      <List>
                        {medicalHistory.slice(0, 3).map((record, index) => (
                          <ListItem key={record._id} divider={index < 2}>
                            <ListItemIcon>
                              <HistoryIcon color="action" />
                            </ListItemIcon>
                            <ListItemText
                              primary={record.diagnosis}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {new Date(record.date).toLocaleDateString()} • {record.doctor}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {record.treatment}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No medical history available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Current Medications */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Current Medications
                      </Typography>
                      <Chip 
                        label={patientPrescriptions.filter(p => p.status === 'active').length}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    
                    {patientPrescriptions.filter(p => p.status === 'active').length > 0 ? (
                      <List>
                        {patientPrescriptions
                          .filter(p => p.status === 'active')
                          .slice(0, 3)
                          .map((prescription, index) => (
                          <ListItem key={prescription._id} divider={index < 2}>
                            <ListItemIcon>
                              <MedicationIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`Prescription #${prescription.prescriptionNumber || prescription._id?.slice(-6)}`}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {prescription.diagnosis} • {prescription.createdDate && new Date(prescription.createdDate).getTime() 
                                      ? new Date(prescription.createdDate).toLocaleDateString()
                                      : 'N/A'
                                    }
                                  </Typography>
                                  <Box sx={{ mt: 0.5 }}>
                                    {prescription.medications?.slice(0, 2).map((med, idx) => (
                                      <Chip
                                        key={idx}
                                        label={`${med.name} - ${med.dosage}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ mr: 1, mb: 0.5 }}
                                      />
                                    ))}
                                    {prescription.medications?.length > 2 && (
                                      <Chip
                                        label={`+${prescription.medications.length - 2} more`}
                                        size="small"
                                        variant="outlined"
                                        color="info"
                                      />
                                    )}
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No active medications
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Emergency Contact */}
              {patientDetails?.emergencyContact && (
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Emergency Contact
                      </Typography>
                      <Typography variant="body2">
                        <strong>{patientDetails.emergencyContact.name}</strong> ({patientDetails.emergencyContact.relationship})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {patientDetails.emergencyContact.phone}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </motion.div>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          variant="outlined"
          startIcon={<ChatIcon />}
          onClick={() => {
            const patientId = patient._id || patient.id;
            if (patientId) {
              window.location.href = `/doctor/patients/chat/${patientId}`;
            }
          }}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Message Patient
        </Button>
        <Button
          variant="outlined"
          startIcon={<VideoCallIcon />}
          onClick={() => {
            // Handle video call
            console.log('Start video call with patient');
          }}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Video Call
        </Button>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientQuickView;