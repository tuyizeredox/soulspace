import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Avatar,
  IconButton,
  InputAdornment,
  Chip,
  Stack,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  PhotoCamera,
  Visibility,
  VisibilityOff,
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../../utils/axiosConfig';

const DoctorForm = ({ open, onClose, doctor, onSuccess, onError }) => {
  const theme = useTheme();
  const { token } = useSelector((state) => state.userAuth);
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    status: 'active',
    specialization: '',
    department: '',
    qualifications: '',
    experience: '',
    licenseNumber: '',
    bio: '',
    consultationFee: '',
    phone: '',
    isAvailableForAppointments: true,
    languages: [],
    awards: [],
    certifications: []
  });

  const [newLanguage, setNewLanguage] = useState('');
  const [newAward, setNewAward] = useState({ title: '', year: '', description: '' });
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuedBy: '',
    issuedDate: '',
    expiryDate: ''
  });

  // Predefined options
  const specializations = [
    'General Medicine',
    'Internal Medicine',
    'Family Medicine',
    'Cardiology',
    'Dermatology',
    'Emergency Medicine',
    'Endocrinology',
    'Gastroenterology',
    'Geriatrics',
    'Hematology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'General Surgery',
    'Cardiac Surgery',
    'Neurosurgery',
    'Orthopedic Surgery',
    'Plastic Surgery',
    'Urology',
    'Obstetrics and Gynecology',
    'Ophthalmology',
    'Otolaryngology',
    'Pathology',
    'Pulmonology',
    'Rheumatology',
    'Anesthesiology'
  ];

  const departments = [
    'Emergency',
    'ICU',
    'Surgery',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Radiology',
    'Laboratory',
    'Pharmacy',
    'Outpatient',
    'Inpatient',
    'Maternity',
    'Oncology',
    'Psychiatry'
  ];

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Arabic',
    'Hindi',
    'Chinese',
    'Japanese',
    'Korean',
    'Russian',
    'Dutch',
    'Swedish',
    'Norwegian'
  ];

  // Initialize form data
  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        email: doctor.email || '',
        password: '',
        status: doctor.status || 'active',
        specialization: doctor.specialization || '',
        department: doctor.department || '',
        qualifications: doctor.qualifications || '',
        experience: doctor.experience || '',
        licenseNumber: doctor.licenseNumber || '',
        bio: doctor.bio || '',
        consultationFee: doctor.consultationFee || '',
        phone: doctor.phone || '',
        isAvailableForAppointments: doctor.isAvailableForAppointments !== false,
        languages: doctor.languages || [],
        awards: doctor.awards || [],
        certifications: doctor.certifications || []
      });
    } else {
      // Reset form for new doctor
      setFormData({
        name: '',
        email: '',
        password: '',
        status: 'active',
        specialization: '',
        department: '',
        qualifications: '',
        experience: '',
        licenseNumber: '',
        bio: '',
        consultationFee: '',
        phone: '',
        isAvailableForAppointments: true,
        languages: [],
        awards: [],
        certifications: []
      });
    }
    setFormErrors({});
  }, [doctor, open]);

  // Validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Doctor name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!doctor && !formData.password.trim()) {
      errors.password = 'Password is required for new doctors';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!formData.specialization) {
      errors.specialization = 'Specialization is required';
    }

    if (formData.consultationFee && isNaN(formData.consultationFee)) {
      errors.consultationFee = 'Consultation fee must be a number';
    }

    if (formData.experience && isNaN(formData.experience)) {
      errors.experience = 'Experience must be a number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const submitData = {
        ...formData,
        experience: formData.experience ? parseInt(formData.experience) : 0,
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : 0,
        profile: {
          phone: formData.phone,
          specialization: formData.specialization,
          department: formData.department,
          qualifications: formData.qualifications,
          experience: formData.experience ? parseInt(formData.experience) : 0,
          bio: formData.bio,
          licenseNumber: formData.licenseNumber,
          consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : 0,
          languages: formData.languages,
          awards: formData.awards,
          certifications: formData.certifications
        }
      };

      // Remove password if editing and password is empty
      if (doctor && !formData.password.trim()) {
        delete submitData.password;
      }
      
      if (doctor) {
        await axios.put(`/api/doctors/${doctor._id || doctor.id}`, submitData, config);
        onSuccess('Doctor updated successfully');
      } else {
        await axios.post('/api/doctors', submitData, config);
        onSuccess('Doctor created successfully');
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error saving doctor:', error);
      onError(error.response?.data?.message || 'Failed to save doctor');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Language management
  const addLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== language)
    }));
  };

  // Award management
  const addAward = () => {
    if (newAward.title && newAward.year) {
      setFormData(prev => ({
        ...prev,
        awards: [...prev.awards, { ...newAward, year: parseInt(newAward.year) }]
      }));
      setNewAward({ title: '', year: '', description: '' });
    }
  };

  const removeAward = (index) => {
    setFormData(prev => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index)
    }));
  };

  // Certification management
  const addCertification = () => {
    if (newCertification.name && newCertification.issuedBy) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification]
      }));
      setNewCertification({
        name: '',
        issuedBy: '',
        issuedDate: '',
        expiryDate: ''
      });
    }
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight="bold">
              {doctor ? 'Edit Doctor' : 'Add New Doctor'}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ py: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  error={!!formErrors.password}
                  helperText={formErrors.password || (doctor ? 'Leave blank to keep current password' : '')}
                  required={!doctor}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              {/* Professional Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Professional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.specialization}>
                  <InputLabel>Specialization</InputLabel>
                  <Select
                    value={formData.specialization}
                    onChange={handleChange('specialization')}
                    label="Specialization"
                    required
                  >
                    {specializations.map(spec => (
                      <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                    ))}
                  </Select>
                  {formErrors.specialization && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {formErrors.specialization}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={formData.department}
                    onChange={handleChange('department')}
                    label="Department"
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Experience (Years)"
                  type="number"
                  value={formData.experience}
                  onChange={handleChange('experience')}
                  error={!!formErrors.experience}
                  helperText={formErrors.experience}
                  inputProps={{ min: 0, max: 50 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Number"
                  value={formData.licenseNumber}
                  onChange={handleChange('licenseNumber')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Consultation Fee ($)"
                  type="number"
                  value={formData.consultationFee}
                  onChange={handleChange('consultationFee')}
                  error={!!formErrors.consultationFee}
                  helperText={formErrors.consultationFee}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={handleChange('status')}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Qualifications"
                  multiline
                  rows={2}
                  value={formData.qualifications}
                  onChange={handleChange('qualifications')}
                  placeholder="Enter educational qualifications and degrees..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Biography"
                  multiline
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange('bio')}
                  placeholder="Brief professional biography..."
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isAvailableForAppointments}
                      onChange={handleChange('isAvailableForAppointments')}
                    />
                  }
                  label="Available for Appointments"
                />
              </Grid>

              {/* Languages */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Languages
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Add Language</InputLabel>
                      <Select
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        label="Add Language"
                        size="small"
                      >
                        {languages.filter(lang => !formData.languages.includes(lang)).map(lang => (
                          <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      onClick={addLanguage}
                      disabled={!newLanguage}
                      startIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Stack>
                </Box>
                
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {formData.languages.map((language, index) => (
                    <Chip
                      key={index}
                      label={language}
                      onDelete={() => removeLanguage(language)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Grid>

              {/* Awards */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Awards & Recognition
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Award Title"
                      value={newAward.title}
                      onChange={(e) => setNewAward(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Year"
                      type="number"
                      value={newAward.year}
                      onChange={(e) => setNewAward(prev => ({ ...prev, year: e.target.value }))}
                      inputProps={{ min: 1950, max: new Date().getFullYear() }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      value={newAward.description}
                      onChange={(e) => setNewAward(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={addAward}
                      disabled={!newAward.title || !newAward.year}
                      startIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>

                <Stack spacing={1}>
                  {formData.awards.map((award, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {award.title} ({award.year})
                        </Typography>
                        {award.description && (
                          <Typography variant="body2" color="text.secondary">
                            {award.description}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => removeAward(index)}
                        color="error"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
              }
            }}
          >
            {loading ? 'Saving...' : (doctor ? 'Update Doctor' : 'Create Doctor')}
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
};

export default DoctorForm;