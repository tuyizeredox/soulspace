import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from '../../utils/axios';

const SimpleDoctorForm = ({ open, onClose, selectedDoctor, onSuccess }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // List of specializations
  const specializations = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Obstetrics',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Urology',
    'General Medicine',
    'Surgery'
  ];

  // List of departments
  const departments = [
    'General',
    'Emergency',
    'Intensive Care',
    'Outpatient',
    'Inpatient',
    'Surgery',
    'Pediatrics',
    'Obstetrics',
    'Cardiology',
    'Neurology',
    'Oncology',
    'Radiology',
    'Laboratory',
    'Pharmacy',
    'Rehabilitation'
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active', color: theme.palette.success.main },
    { value: 'on_leave', label: 'On Leave', color: theme.palette.warning.main },
    { value: 'inactive', label: 'Inactive', color: theme.palette.error.main }
  ];

  // Generate a random password
  const generateRandomPassword = (length = 10) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  // Validation schema - fixed to avoid "branch is not a function" error
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone is required'),
    specialization: Yup.string().required('Specialization is required'),
    department: Yup.string().required('Department is required'),
    qualifications: Yup.string().required('Qualifications are required'),
    experience: Yup.number().required('Experience is required').min(0, 'Experience cannot be negative'),
    status: Yup.string().required('Status is required'),
    // Simple validation for password - required for new doctors
    password: Yup.string().test({
      name: 'password-required-for-new',
      test: function(value) {
        // If it's a new doctor, password is required
        if (this.parent.isNewDoctor && !value) {
          return this.createError({
            path: 'password',
            message: 'Password is required for new doctors'
          });
        }
        return true;
      }
    }),
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: selectedDoctor?.name || '',
      email: selectedDoctor?.email || '',
      // Ensure phone is properly initialized from the doctor data
      phone: selectedDoctor?.phone || '',
      specialization: selectedDoctor?.specialization || '',
      department: selectedDoctor?.department || 'General',
      qualifications: selectedDoctor?.qualifications || '',
      experience: selectedDoctor?.experience || 0,
      bio: selectedDoctor?.bio || '',
      status: selectedDoctor?.status || 'active',
      password: selectedDoctor ? '' : '', // Empty by default so user can enter their own
      isNewDoctor: !selectedDoctor,
      availability: selectedDoctor?.availability || [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', available: true },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', available: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', available: true },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', available: true },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', available: true },
        { day: 'Saturday', startTime: '09:00', endTime: '13:00', available: false },
        { day: 'Sunday', startTime: '09:00', endTime: '13:00', available: false }
      ]
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');

        // Check if password is provided for new doctors
        if (!selectedDoctor && !values.password) {
          setError('Password is required for new doctors');
          setLoading(false);
          return;
        }

        // Create data object that matches the backend API expectations
        const doctorData = {
          name: values.name,
          email: values.email,
          status: values.status,
          // Put all profile-related fields in the profile object as expected by backend
          profile: {
            phone: values.phone,
            specialization: values.specialization,
            qualifications: values.qualifications,
            experience: values.experience,
            bio: values.bio,
            department: values.department || 'General'
          }
        };

        // Log the data being sent
        console.log('Sending doctor data to API:', doctorData);
        console.log('Phone number being sent:', doctorData.profile.phone);

        // Add password only for new doctors or if it's provided for existing ones
        if (!selectedDoctor || (selectedDoctor && values.password)) {
          doctorData.password = values.password;
        }

        // Add availability if present
        if (values.availability) {
          doctorData.availability = values.availability;
        }

        // Debug log
        console.log('Submitting doctor data:', doctorData);

        let response;
        if (selectedDoctor) {
          // Log the selected doctor data for debugging
          console.log('Selected doctor data:', selectedDoctor);
          console.log('Selected doctor phone:', selectedDoctor.phone);

          response = await axios.put(`/api/doctors/${selectedDoctor.id}`, doctorData);

          // Log the response data
          console.log('Update response data:', response.data);
          console.log('Updated doctor phone:', response.data.phone);

          // Call success callback with updated doctor and action type
          onSuccess(response.data, 'update', null);
        } else {
          response = await axios.post('/api/doctors', doctorData);

          // For new doctors, pass credentials to the success callback
          const credentials = {
            name: values.name,
            email: values.email,
            password: values.password,
          };

          console.log('Doctor created successfully:', response.data);
          onSuccess(response.data, 'create', credentials);
        }

        // Close the form
        onClose();
      } catch (error) {
        console.error('Error saving doctor:', error);

        // More detailed error logging
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
          setError(error.response.data?.message || `Server error: ${error.response.status}`);
        } else if (error.request) {
          console.error('Error request:', error.request);
          setError('No response received from server. Please check your connection.');
        } else {
          console.error('Error message:', error.message);
          setError(`Error: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Dialog
      open={open}
      onClose={loading ? null : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
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
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Full Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone Number"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  // Ensure phone is not empty on blur
                  if (!e.target.value.trim()) {
                    formik.setFieldValue('phone', '');
                  }
                  formik.handleBlur(e);
                }}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                required
                disabled={loading}
                placeholder="Enter phone number"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  label="Status"
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Professional Details */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel id="specialization-label">Specialization</InputLabel>
                <Select
                  labelId="specialization-label"
                  id="specialization"
                  name="specialization"
                  value={formik.values.specialization}
                  onChange={formik.handleChange}
                  label="Specialization"
                >
                  {specializations.map(spec => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  id="department"
                  name="department"
                  value={formik.values.department}
                  onChange={formik.handleChange}
                  label="Department"
                >
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="qualifications"
                name="qualifications"
                label="Qualifications"
                value={formik.values.qualifications}
                onChange={formik.handleChange}
                error={formik.touched.qualifications && Boolean(formik.errors.qualifications)}
                helperText={formik.touched.qualifications && formik.errors.qualifications}
                placeholder="e.g., MD, MBBS, MS"
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="experience"
                name="experience"
                label="Years of Experience"
                type="number"
                value={formik.values.experience}
                onChange={formik.handleChange}
                error={formik.touched.experience && Boolean(formik.errors.experience)}
                helperText={formik.touched.experience && formik.errors.experience}
                InputProps={{ inputProps: { min: 0 } }}
                required
                disabled={loading}
              />
            </Grid>

            {/* Password field for new doctors */}
            {!selectedDoctor && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Login Password"
                  type="text"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password || "Enter a password or use the generate button"}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder="Enter password or generate one"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          onClick={() => {
                            formik.setFieldValue('password', generateRandomPassword(10));
                          }}
                          disabled={loading}
                          startIcon={<RefreshIcon />}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          Generate
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="bio"
                name="bio"
                label="Doctor Bio"
                multiline
                rows={3}
                value={formik.values.bio}
                onChange={formik.handleChange}
                placeholder="Brief description about the doctor's background and expertise"
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ borderRadius: 2 }}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading
              ? 'Saving...'
              : selectedDoctor
                ? 'Update Doctor'
                : 'Add Doctor'
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SimpleDoctorForm;
