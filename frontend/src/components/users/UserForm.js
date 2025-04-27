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
  Divider,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getAvatarUrl, getInitials as getAvatarInitials } from '../../utils/avatarUtils';

const UserForm = ({ open, onClose, onSubmit, user, mode = 'add', hospitals = [] }) => {
  const theme = useTheme();

  // Get user data from both auth systems
  const { user: oldUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: newUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const currentUser = newUser || oldUser;
  const token = newToken || oldToken;

  console.log('UserForm: User data', {
    role: currentUser?.role,
    name: currentUser?.name,
    hasToken: !!token
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'patient',
    hospital: '',
    status: 'active',
    sendInvite: true,
    avatar: null,
    avatarPreview: null,
  });
  const [errors, setErrors] = useState({});

  const roles = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'hospital_admin', label: 'Hospital Admin' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'patient', label: 'Patient' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'insurance_provider', label: 'Insurance Provider' },
    { value: 'emergency_responder', label: 'Emergency Responder' },
  ];

  const statuses = [
    { value: 'active', label: 'Active', color: 'success' },
    { value: 'inactive', label: 'Inactive', color: 'default' },
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'suspended', label: 'Suspended', color: 'error' },
  ];

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'patient',
        hospital: user.hospital || '',
        status: user.status || 'active',
        sendInvite: false,
        avatar: null,
        avatarPreview: user.avatar || null,
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'patient',
        hospital: '',
        status: 'active',
        sendInvite: true,
        avatar: null,
        avatarPreview: null,
      });
    }
    setErrors({});
  }, [user, mode, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          avatar: file,
          avatarPreview: e.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.role === 'hospital_admin' && !formData.hospital) {
      newErrors.hospital = 'Hospital is required for Hospital Admin';
    }

    if (formData.role === 'doctor' && !formData.hospital) {
      newErrors.hospital = 'Hospital is required for Doctor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };



  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return theme.palette.error.main;
      case 'hospital_admin':
        return theme.palette.warning.main;
      case 'doctor':
        return theme.palette.info.main;
      case 'patient':
        return theme.palette.primary.main;
      case 'pharmacist':
        return theme.palette.success.main;
      case 'insurance_provider':
        return theme.palette.secondary.main;
      case 'emergency_responder':
        return theme.palette.error.light;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 3,
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
      }}>
        <Typography variant="h6" fontWeight={600}>
          {mode === 'add' ? 'Add New User' : 'Edit User'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Avatar Section */}
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Avatar
                src={formData.avatarPreview || (user?.avatar ? getAvatarUrl(user) : null)}
                alt={formData.name}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  bgcolor: alpha(getRoleColor(formData.role), 0.2),
                  color: getRoleColor(formData.role),
                  fontSize: 40,
                }}
                slotProps={{
                  img: {
                    onError: (e) => {
                      console.error('UserForm: Error loading avatar image:', e.target.src);
                      // Hide the image and show initials instead
                      e.target.style.display = 'none';
                    }
                  }
                }}
              >
                {formData.name ? getAvatarInitials(formData.name) : 'U'}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Upload Photo
                </Button>
              </label>
            </Box>

            {mode === 'edit' && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  User Status
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {statuses.map((status) => (
                    <FormControlLabel
                      key={status.value}
                      control={
                        <Switch
                          checked={formData.status === status.value}
                          onChange={() => setFormData({ ...formData, status: status.value })}
                          color={status.color}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip
                            label={status.label}
                            size="small"
                            color={status.color}
                            sx={{ mr: 1, fontWeight: 600, borderRadius: 1 }}
                          />
                        </Box>
                      }
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Grid>

          {/* Form Fields */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  sx={{ borderRadius: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  sx={{ borderRadius: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Role"
                    required
                    sx={{ borderRadius: 2 }}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.hospital}>
                  <InputLabel id="hospital-label">Hospital</InputLabel>
                  <Select
                    labelId="hospital-label"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleChange}
                    label="Hospital"
                    disabled={!['hospital_admin', 'doctor'].includes(formData.role)}
                    required={['hospital_admin', 'doctor'].includes(formData.role)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {hospitals.map((hospital) => (
                      <MenuItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.hospital && (
                    <Typography variant="caption" color="error">
                      {errors.hospital}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {mode === 'add' && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.sendInvite}
                        onChange={handleSwitchChange}
                        name="sendInvite"
                        color="primary"
                      />
                    }
                    label="Send invitation email to user"
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: alpha(theme.palette.background.paper, 0.5) }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{
            borderRadius: 2,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          }}
        >
          {mode === 'add' ? 'Create User' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;
