import React from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography, // Add Typography import
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  hospital: Yup.object({
    name: Yup.string().required('Hospital name is required'),
    location: Yup.string().required('Location is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone is required'),
  }),
  admin: Yup.object({
    name: Yup.string().required('Admin name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  }),
});

const HospitalRegistrationForm = ({ open, onClose, onSubmit }) => {
  // Get user data from both auth systems
  const { user: oldUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: newUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = newUser || oldUser;
  const token = newToken || oldToken;

  console.log('HospitalRegistrationForm: User data', {
    role: user?.role,
    name: user?.name,
    hasToken: !!token
  });

  const formik = useFormik({
    initialValues: {
      hospital: {
        name: '',
        location: '',
        email: '',
        phone: '',
      },
      admin: {
        name: '',
        email: '',
        phone: '',
        password: '',
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
      formik.resetForm();
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Register New Hospital with Admin</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Hospital Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="hospital.name"
                  label="Hospital Name"
                  value={formik.values.hospital.name}
                  onChange={formik.handleChange}
                  error={formik.touched.hospital?.name && Boolean(formik.errors.hospital?.name)}
                  helperText={formik.touched.hospital?.name && formik.errors.hospital?.name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="hospital.location"
                  label="Location"
                  value={formik.values.hospital.location}
                  onChange={formik.handleChange}
                  error={formik.touched.hospital?.location && Boolean(formik.errors.hospital?.location)}
                  helperText={formik.touched.hospital?.location && formik.errors.hospital?.location}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="hospital.email"
                  label="Hospital Email"
                  value={formik.values.hospital.email}
                  onChange={formik.handleChange}
                  error={formik.touched.hospital?.email && Boolean(formik.errors.hospital?.email)}
                  helperText={formik.touched.hospital?.email && formik.errors.hospital?.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="hospital.phone"
                  label="Hospital Phone"
                  value={formik.values.hospital.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.hospital?.phone && Boolean(formik.errors.hospital?.phone)}
                  helperText={formik.touched.hospital?.phone && formik.errors.hospital?.phone}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>Admin Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="admin.name"
                  label="Admin Name"
                  value={formik.values.admin.name}
                  onChange={formik.handleChange}
                  error={formik.touched.admin?.name && Boolean(formik.errors.admin?.name)}
                  helperText={formik.touched.admin?.name && formik.errors.admin?.name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="admin.email"
                  label="Admin Email"
                  value={formik.values.admin.email}
                  onChange={formik.handleChange}
                  error={formik.touched.admin?.email && Boolean(formik.errors.admin?.email)}
                  helperText={formik.touched.admin?.email && formik.errors.admin?.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="admin.phone"
                  label="Admin Phone"
                  value={formik.values.admin.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.admin?.phone && Boolean(formik.errors.admin?.phone)}
                  helperText={formik.touched.admin?.phone && formik.errors.admin?.phone}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="password"
                  name="admin.password"
                  label="Admin Password"
                  value={formik.values.admin.password}
                  onChange={formik.handleChange}
                  error={formik.touched.admin?.password && Boolean(formik.errors.admin?.password)}
                  helperText={formik.touched.admin?.password && formik.errors.admin?.password}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Register Hospital
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default HospitalRegistrationForm;