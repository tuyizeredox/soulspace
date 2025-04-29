import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Divider,
  Alert,
  FormHelperText,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Save as SaveIcon } from '@mui/icons-material';

const StaffForm = ({ onSubmit, initialData = null, isEdit = false }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff',
    department: '',
    specialization: '',
    phone: '',
    licenseNumber: '',
    address: '',
    emergencyContact: '',
    education: '',
    experience: '',
    certifications: '',
    password: '',
    confirmPassword: '',
    status: 'active'
  });

  // Load initial data if provided (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        role: initialData.role || 'staff',
        department: initialData.department || '',
        specialization: initialData.specialization || '',
        phone: initialData.phone || '',
        licenseNumber: initialData.licenseNumber || '',
        address: initialData.address || '',
        emergencyContact: initialData.emergencyContact || '',
        education: initialData.education || '',
        experience: initialData.experience || '',
        certifications: initialData.certifications || '',
        password: '',
        confirmPassword: '',
        status: initialData.status || 'active'
      });
    }
  }, [initialData]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!formData.name || !formData.email || !formData.role) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Validate password (only for new staff)
    if (!isEdit && (!formData.password || formData.password.length < 6)) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate password confirmation (only for new staff)
    if (!isEdit && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Prepare data for submission
    const submitData = { ...formData };
    
    // Remove confirmPassword field
    delete submitData.confirmPassword;
    
    // Remove password field if empty (for edit mode)
    if (isEdit && !submitData.password) {
      delete submitData.password;
    }

    try {
      // Call the onSubmit function passed from parent
      await onSubmit(submitData);
      
      // Reset form if not in edit mode
      if (!isEdit) {
        setFormData({
          name: '',
          email: '',
          role: 'staff',
          department: '',
          specialization: '',
          phone: '',
          licenseNumber: '',
          address: '',
          emergencyContact: '',
          education: '',
          experience: '',
          certifications: '',
          password: '',
          confirmPassword: '',
          status: 'active'
        });
      }
    } catch (error) {
      setError(error.message || 'An error occurred while submitting the form');
    } finally {
      setLoading(false);
    }
  };

  // Department options based on role
  const getDepartmentOptions = () => {
    switch (formData.role) {
      case 'doctor':
        return [
          'Cardiology',
          'Neurology',
          'Orthopedics',
          'Pediatrics',
          'Gynecology',
          'Dermatology',
          'Ophthalmology',
          'Oncology',
          'Psychiatry',
          'Radiology',
          'General Medicine',
          'Emergency Medicine',
          'Surgery'
        ];
      case 'nurse':
        return [
          'General Nursing',
          'Intensive Care',
          'Emergency',
          'Pediatric Nursing',
          'Geriatric Nursing',
          'Surgical Nursing',
          'Obstetric Nursing',
          'Psychiatric Nursing'
        ];
      case 'pharmacist':
        return [
          'Clinical Pharmacy',
          'Hospital Pharmacy',
          'Outpatient Pharmacy',
          'Pharmaceutical Research'
        ];
      case 'lab_technician':
        return [
          'Clinical Laboratory',
          'Pathology',
          'Microbiology',
          'Hematology',
          'Biochemistry',
          'Immunology'
        ];
      default:
        return [
          'Administration',
          'Reception',
          'Billing',
          'IT Support',
          'Maintenance',
          'Security',
          'Housekeeping',
          'Food Services'
        ];
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="nurse">Nurse</MenuItem>
              <MenuItem value="pharmacist">Pharmacist</MenuItem>
              <MenuItem value="receptionist">Receptionist</MenuItem>
              <MenuItem value="lab_technician">Lab Technician</MenuItem>
              <MenuItem value="staff">General Staff</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Department</InputLabel>
            <Select
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            >
              <MenuItem value="">None</MenuItem>
              {getDepartmentOptions().map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {(formData.role === 'doctor' || formData.role === 'nurse') && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        {['doctor', 'nurse', 'pharmacist'].includes(formData.role) && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="License Number"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
        )}
        {isEdit && (
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="on_leave">On Leave</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Additional Information
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            variant="outlined"
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Emergency Contact"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Education"
            name="education"
            value={formData.education}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Experience (years)"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Certifications"
            name="certifications"
            value={formData.certifications}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Account Information
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEdit}
            variant="outlined"
            helperText={isEdit ? "Leave blank to keep current password" : "Minimum 6 characters"}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required={!isEdit}
            variant="outlined"
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading}
          startIcon={<SaveIcon />}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          {isEdit ? 'Update Staff Member' : 'Add Staff Member'}
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default StaffForm;
