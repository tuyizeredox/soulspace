import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorForm = ({
  open,
  onClose,
  onSubmit,
  selectedDoctor,
  formik,
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [expertise, setExpertise] = useState(selectedDoctor?.expertise || []);
  const [newExpertise, setNewExpertise] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(selectedDoctor?.avatar || null);

  const steps = ['Basic Information', 'Credentials', 'Expertise & Schedule'];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAddExpertise = () => {
    if (newExpertise.trim() !== '') {
      setExpertise([...expertise, newExpertise.trim()]);
      setNewExpertise('');
    }
  };

  const handleDeleteExpertise = (index) => {
    const newExpertise = [...expertise];
    newExpertise.splice(index, 1);
    setExpertise(newExpertise);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add expertise to formik values
    const values = { ...formik.values, expertise };
    onSubmit(values);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {selectedDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ width: '100%', p: 3, pb: 0 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeStep === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Avatar
                        src={avatarPreview}
                        alt={formik.values.name || 'Doctor'}
                        sx={{
                          width: 100,
                          height: 100,
                          mb: 2,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                      >
                        {formik.values.name ? formik.values.name.charAt(0) : 'D'}
                      </Avatar>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        Upload Photo
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </Button>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Full Name"
                      value={formik.values.name || ''}
                      onChange={formik.handleChange}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      required
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email"
                      type="email"
                      value={formik.values.email || ''}
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="phone"
                      name="phone"
                      label="Phone Number"
                      value={formik.values.phone || ''}
                      onChange={formik.handleChange}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        id="status"
                        name="status"
                        value={formik.values.status || 'active'}
                        onChange={formik.handleChange}
                        label="Status"
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="onLeave">On Leave</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}

              {activeStep === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="specialization"
                      name="specialization"
                      label="Specialization"
                      value={formik.values.specialization || ''}
                      onChange={formik.handleChange}
                      error={formik.touched.specialization && Boolean(formik.errors.specialization)}
                      helperText={formik.touched.specialization && formik.errors.specialization}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="qualification"
                      name="qualification"
                      label="Qualification"
                      value={formik.values.qualification || ''}
                      onChange={formik.handleChange}
                      placeholder="e.g., MD, MBBS, MS"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="experience"
                      name="experience"
                      label="Years of Experience"
                      type="number"
                      value={formik.values.experience || ''}
                      onChange={formik.handleChange}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>

                  {!selectedDoctor && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="password"
                        name="password"
                        label="Password"
                        type="password"
                        value={formik.values.password || ''}
                        onChange={formik.handleChange}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                        required={!selectedDoctor}
                      />
                    </Grid>
                  )}
                </Grid>
              )}

              {activeStep === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Areas of Expertise
                    </Typography>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <TextField
                        fullWidth
                        value={newExpertise}
                        onChange={(e) => setNewExpertise(e.target.value)}
                        placeholder="Add expertise or skill"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddExpertise}
                        disabled={!newExpertise.trim()}
                        startIcon={<AddIcon />}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {expertise.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          onDelete={() => handleDeleteExpertise(index)}
                          color="primary"
                          variant="outlined"
                          deleteIcon={<DeleteIcon />}
                        />
                      ))}
                      {expertise.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          No expertise added yet. Add some skills or areas of expertise.
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Consultation Fee
                    </Typography>
                    <TextField
                      fullWidth
                      id="consultationFee"
                      name="consultationFee"
                      label="Consultation Fee"
                      type="number"
                      value={formik.values.consultationFee || ''}
                      onChange={formik.handleChange}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                        inputProps: { min: 0 },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Additional Information
                    </Typography>
                    <TextField
                      fullWidth
                      id="bio"
                      name="bio"
                      label="Doctor Bio"
                      multiline
                      rows={4}
                      value={formik.values.bio || ''}
                      onChange={formik.handleChange}
                      placeholder="Brief description about the doctor's background and expertise"
                    />
                  </Grid>
                </Grid>
              )}
            </motion.div>
          </AnimatePresence>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={onClose} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep > 0 && (
            <Button onClick={handleBack} sx={{ borderRadius: 2, mr: 1 }}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ borderRadius: 2 }}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: 2 }}
            >
              {selectedDoctor ? 'Update Doctor' : 'Add Doctor'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DoctorForm;
