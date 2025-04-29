import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  useTheme,
  Alert,
  CircularProgress,
  MobileStepper,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowBack, ArrowForward, CheckCircle } from '@mui/icons-material';
import axios from 'axios';

// Import components for each step
import AppointmentTypeSelection from '../../components/appointments/AppointmentTypeSelection';
import HospitalDoctorSelection from '../../components/appointments/HospitalDoctorSelection';
import DateTimeSelection from '../../components/appointments/DateTimeSelection';
import AdditionalOptions from '../../components/appointments/AdditionalOptions';
import AppointmentConfirmation from '../../components/appointments/AppointmentConfirmation';

const BookAppointment = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State for the stepper
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get appointment type from location state if available
  const initialAppointmentType = location.state?.appointmentType || '';

  // Auto-advance to next step if appointment type is pre-selected
  useEffect(() => {
    if (initialAppointmentType && activeStep === 0) {
      // Small delay to allow the component to render first
      const timer = setTimeout(() => {
        setActiveStep(1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialAppointmentType, activeStep]);

  // Form data state
  const [formData, setFormData] = useState({
    appointmentType: initialAppointmentType,
    hospital: '',
    doctor: '',
    date: null,
    time: '',
    reason: '',
    wearableDevice: {
      required: false,
      purchaseOption: '' // 'platform' or 'hospital'
    },
    pharmacy: {
      required: false,
      preferredPharmacy: '',
      deliveryOption: '' // 'delivery' or 'pickup'
    },
    insuranceInfo: {
      provider: '',
      policyNumber: '',
      additionalInfo: '',
      selfPay: false
    }
  });

  // Steps for the stepper
  const steps = [
    'Appointment Type',
    'Select Hospital & Doctor',
    'Choose Date & Time',
    'Additional Options',
    'Confirmation'
  ];

  // Handle next step
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle form data changes
  const handleFormChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value
    }));
  };

  // Handle nested form data changes
  const handleNestedFormChange = (parent, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [parent]: {
        ...prevData[parent],
        [field]: value
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Format time if available
      let formattedTime = '';
      if (formData.time) {
        if (typeof formData.time === 'string') {
          formattedTime = formData.time;
        } else if (formData.time instanceof Date) {
          const hours = formData.time.getHours().toString().padStart(2, '0');
          const minutes = formData.time.getMinutes().toString().padStart(2, '0');
          formattedTime = `${hours}:${minutes}`;
        }
      }

      // Prepare appointment data
      const appointmentData = {
        doctor: formData.doctor,
        hospital: formData.hospital,
        date: formData.date,
        time: formattedTime,
        type: formData.appointmentType === 'online' ? 'Online Consultation' : 'In-Person Visit',
        reason: formData.reason,
        isOnline: formData.appointmentType === 'online',
        wearableDevice: formData.wearableDevice.required ? formData.wearableDevice : null,
        pharmacy: formData.pharmacy.required ? formData.pharmacy : null,
        insuranceInfo: formData.insuranceInfo
      };

      // Submit appointment data to API - patient ID will be taken from authenticated user
      const response = await axios.post('/api/appointments', appointmentData);
      console.log('Appointment created successfully:', response.data);

      setSuccess('Appointment booked successfully!');
      // Move to confirmation step
      setActiveStep(steps.length - 1);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError(error.response?.data?.message || 'Error booking appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Validate current step before proceeding
  const validateStep = () => {
    switch (activeStep) {
      case 0: // Appointment Type
        return !!formData.appointmentType;
      case 1: // Hospital & Doctor
        return !!formData.hospital && !!formData.doctor;
      case 2: // Date & Time
        return !!formData.date && !!formData.time && !!formData.reason;
      case 3: // Additional Options
        return true; // Optional step, always valid
      default:
        return true;
    }
  };

  // Render content based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <AppointmentTypeSelection
            appointmentType={formData.appointmentType}
            onChange={(value) => handleFormChange('appointmentType', value)}
          />
        );
      case 1:
        return (
          <HospitalDoctorSelection
            hospital={formData.hospital}
            doctor={formData.doctor}
            onHospitalChange={(value) => handleFormChange('hospital', value)}
            onDoctorChange={(value) => handleFormChange('doctor', value)}
          />
        );
      case 2:
        return (
          <DateTimeSelection
            date={formData.date}
            time={formData.time}
            reason={formData.reason}
            onDateChange={(value) => handleFormChange('date', value)}
            onTimeChange={(value) => handleFormChange('time', value)}
            onReasonChange={(value) => handleFormChange('reason', value)}
          />
        );
      case 3:
        return (
          <AdditionalOptions
            appointmentType={formData.appointmentType}
            wearableDevice={formData.wearableDevice}
            pharmacy={formData.pharmacy}
            insuranceInfo={formData.insuranceInfo}
            onWearableChange={(field, value) => handleNestedFormChange('wearableDevice', field, value)}
            onPharmacyChange={(field, value) => handleNestedFormChange('pharmacy', field, value)}
            onInsuranceChange={(field, value) => handleNestedFormChange('insuranceInfo', field, value)}
          />
        );
      case 4:
        return (
          <AppointmentConfirmation
            formData={formData}
            success={success}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
            }}
          >
            Book an Appointment
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{
              mb: 4,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              maxWidth: { xs: '100%', md: '80%' }
            }}
          >
            Schedule an appointment with our healthcare professionals
          </Typography>
        </motion.div>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Desktop Stepper */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              mb: 4,
            }}
          >
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Box>

        {/* Mobile Stepper */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" align="center" gutterBottom>
              {steps[activeStep]}
            </Typography>
            <MobileStepper
              variant="dots"
              steps={steps.length}
              position="static"
              activeStep={activeStep}
              sx={{
                background: 'transparent',
                '& .MuiMobileStepper-dot': {
                  width: 12,
                  height: 12,
                  mx: 0.5
                },
                '& .MuiMobileStepper-dotActive': {
                  backgroundColor: theme.palette.primary.main
                }
              }}
              nextButton={null}
              backButton={null}
            />
            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Paper>
        </Box>

        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            mb: 4,
          }}
        >
          {renderStepContent()}

          {activeStep !== steps.length - 1 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: { xs: 2, sm: 0 },
                mt: 4
              }}
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<ArrowBack />}
                disabled={activeStep === 0 || loading}
                fullWidth={isMobile}
                sx={{ order: { xs: 2, sm: 1 } }}
              >
                Back
              </Button>
              {activeStep === steps.length - 2 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                  disabled={!validateStep() || loading}
                  fullWidth={isMobile}
                  sx={{ order: { xs: 1, sm: 2 } }}
                >
                  {loading ? 'Booking...' : 'Book Appointment'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                  disabled={!validateStep() || loading}
                  fullWidth={isMobile}
                  sx={{ order: { xs: 1, sm: 2 } }}
                >
                  Continue
                </Button>
              )}
            </Box>
          )}

          {activeStep === steps.length - 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/appointments')}
                sx={{
                  minWidth: { xs: '100%', sm: 200 },
                  py: { xs: 1.5, sm: 1 }
                }}
              >
                View My Appointments
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default BookAppointment;
