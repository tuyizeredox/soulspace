import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Rating,
  Divider,
  Alert,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const TreatmentCompletion = ({ open, onClose, onComplete, appointment, loading }) => {
  const theme = useTheme();
  const [treatmentData, setTreatmentData] = useState({
    diagnosis: '',
    treatment: '',
    medications: [],
    followUpRequired: false,
    followUpDate: '',
    notes: '',
    severity: 'mild',
    patientCondition: 'stable',
    recommendations: [],
    nextAppointment: '',
    rating: 5
  });

  const [newMedication, setNewMedication] = useState('');
  const [newRecommendation, setNewRecommendation] = useState('');

  // Common medications for autocomplete
  const commonMedications = [
    'Paracetamol 500mg',
    'Ibuprofen 400mg',
    'Amoxicillin 500mg',
    'Aspirin 75mg',
    'Metformin 500mg',
    'Lisinopril 10mg',
    'Atorvastatin 20mg',
    'Omeprazole 20mg',
    'Salbutamol Inhaler',
    'Vitamin D3 1000IU'
  ];

  // Common recommendations
  const commonRecommendations = [
    'Rest for 2-3 days',
    'Drink plenty of fluids',
    'Take medication as prescribed',
    'Follow up in 1 week',
    'Avoid strenuous activities',
    'Monitor symptoms',
    'Return if symptoms worsen',
    'Complete the full course of antibiotics'
  ];

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      setTreatmentData(prev => ({
        ...prev,
        medications: [...prev.medications, newMedication.trim()]
      }));
      setNewMedication('');
    }
  };

  const handleRemoveMedication = (index) => {
    setTreatmentData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleAddRecommendation = () => {
    if (newRecommendation.trim()) {
      setTreatmentData(prev => ({
        ...prev,
        recommendations: [...prev.recommendations, newRecommendation.trim()]
      }));
      setNewRecommendation('');
    }
  };

  const handleRemoveRecommendation = (index) => {
    setTreatmentData(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!treatmentData.diagnosis.trim()) {
      alert('Please provide a diagnosis');
      return;
    }
    
    onComplete(treatmentData);
  };

  const handleClose = () => {
    setTreatmentData({
      diagnosis: '',
      treatment: '',
      medications: [],
      followUpRequired: false,
      followUpDate: '',
      notes: '',
      severity: 'mild',
      patientCondition: 'stable',
      recommendations: [],
      nextAppointment: '',
      rating: 5
    });
    setNewMedication('');
    setNewRecommendation('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Complete Treatment
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Patient: {appointment?.patient?.name} • {new Date(appointment?.date).toLocaleDateString()}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Grid container spacing={3}>
            {/* Diagnosis */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis *"
                multiline
                rows={2}
                value={treatmentData.diagnosis}
                onChange={(e) => setTreatmentData(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Enter the primary diagnosis..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            {/* Treatment & Severity */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Treatment Provided"
                multiline
                rows={3}
                value={treatmentData.treatment}
                onChange={(e) => setTreatmentData(prev => ({ ...prev, treatment: e.target.value }))}
                placeholder="Describe the treatment provided..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={treatmentData.severity}
                  label="Severity"
                  onChange={(e) => setTreatmentData(prev => ({ ...prev, severity: e.target.value }))}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="mild">Mild</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="severe">Severe</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Medications */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Medications Prescribed
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs>
                    <Autocomplete
                      freeSolo
                      options={commonMedications}
                      value={newMedication}
                      onChange={(e, newValue) => setNewMedication(newValue || '')}
                      onInputChange={(e, newInputValue) => setNewMedication(newInputValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Add medication..."
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={handleAddMedication}
                      startIcon={<AddIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {treatmentData.medications.map((medication, index) => (
                  <Chip
                    key={index}
                    label={medication}
                    onDelete={() => handleRemoveMedication(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Recommendations */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Recommendations
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs>
                    <Autocomplete
                      freeSolo
                      options={commonRecommendations}
                      value={newRecommendation}
                      onChange={(e, newValue) => setNewRecommendation(newValue || '')}
                      onInputChange={(e, newInputValue) => setNewRecommendation(newInputValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Add recommendation..."
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={handleAddRecommendation}
                      startIcon={<AddIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {treatmentData.recommendations.map((recommendation, index) => (
                  <Chip
                    key={index}
                    label={recommendation}
                    onDelete={() => handleRemoveRecommendation(index)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Patient Condition & Follow-up */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Patient Condition</InputLabel>
                <Select
                  value={treatmentData.patientCondition}
                  label="Patient Condition"
                  onChange={(e) => setTreatmentData(prev => ({ ...prev, patientCondition: e.target.value }))}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="stable">Stable</MenuItem>
                  <MenuItem value="improving">Improving</MenuItem>
                  <MenuItem value="deteriorating">Deteriorating</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Next Appointment"
                type="date"
                value={treatmentData.nextAppointment}
                onChange={(e) => setTreatmentData(prev => ({ ...prev, nextAppointment: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            {/* Additional Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={3}
                value={treatmentData.notes}
                onChange={(e) => setTreatmentData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes or observations..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            {/* Treatment Rating */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Treatment Success Rating:
                </Typography>
                <Rating
                  value={treatmentData.rating}
                  onChange={(e, newValue) => setTreatmentData(prev => ({ ...prev, rating: newValue }))}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary">
                  ({treatmentData.rating}/5)
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              Completing this treatment will mark the appointment as finished and notify the patient.
              All information will be saved to the patient's medical record.
            </Typography>
          </Alert>
        </motion.div>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading || !treatmentData.diagnosis.trim()}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {loading ? 'Completing...' : 'Complete Treatment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TreatmentCompletion;