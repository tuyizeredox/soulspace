import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import axios from 'axios';

const validationSchema = Yup.object({
  patientId: Yup.string().required('Patient is required'),
  doctorId: Yup.string().required('Doctor is required'),
  date: Yup.date().required('Date and time are required'),
  type: Yup.string().required('Appointment type is required'),
  reason: Yup.string().required('Reason is required'),
  notes: Yup.string(),
});

const appointmentTypes = [
  'General Checkup',
  'Consultation',
  'Follow-up',
  'Specialist Visit',
  'Emergency',
  'Vaccination',
  'Laboratory Test',
  'Imaging',
];

const AppointmentForm = ({ initialValues, onSubmit }) => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctorsAndPatients();
  }, []);

  const fetchDoctorsAndPatients = async () => {
    try {
      const [doctorsRes, patientsRes] = await Promise.all([
        axios.get('/api/doctors'),
        axios.get('/api/patients'),
      ]);
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const formik = useFormik({
    initialValues: initialValues || {
      patientId: '',
      doctorId: '',
      date: new Date(),
      type: '',
      reason: '',
      notes: '',
      status: 'pending',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await onSubmit(values);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Patient</InputLabel>
              <Select
                name="patientId"
                value={formik.values.patientId}
                onChange={formik.handleChange}
                error={
                  formik.touched.patientId && Boolean(formik.errors.patientId)
                }
                label="Patient"
              >
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {`${patient.firstName} ${patient.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Doctor</InputLabel>
              <Select
                name="doctorId"
                value={formik.values.doctorId}
                onChange={formik.handleChange}
                error={formik.touched.doctorId && Boolean(formik.errors.doctorId)}
                label="Doctor"
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {`Dr. ${doctor.firstName} ${doctor.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Date & Time"
                value={formik.values.date}
                onChange={(value) => formik.setFieldValue('date', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    helperText={formik.touched.date && formik.errors.date}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formik.values.type}
                onChange={formik.handleChange}
                error={formik.touched.type && Boolean(formik.errors.type)}
                label="Type"
              >
                {appointmentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="reason"
              label="Reason for Visit"
              multiline
              rows={2}
              value={formik.values.reason}
              onChange={formik.handleChange}
              error={formik.touched.reason && Boolean(formik.errors.reason)}
              helperText={formik.touched.reason && formik.errors.reason}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="notes"
              label="Additional Notes"
              multiline
              rows={3}
              value={formik.values.notes}
              onChange={formik.handleChange}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : initialValues ? (
                  'Update'
                ) : (
                  'Schedule'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default AppointmentForm;
