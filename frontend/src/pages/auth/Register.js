import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Link,
  useTheme,
  alpha,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Zoom,
  Backdrop,
} from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { motion } from 'framer-motion';
import {
  Person,
  Email,
  Phone,
  Home,
  MedicalServices,
  BloodtypeOutlined,
  HealthAndSafety,
  Lock,
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';
import api from '../../utils/axios';

const steps = [
  { label: 'Personal Information', icon: <Person /> },
  { label: 'Medical History', icon: <MedicalServices /> },
  { label: 'Account Setup', icon: <Lock /> }
];

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  phone: Yup.string().required('Phone number is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  address: Yup.string().required('Address is required'),
  emergencyContact: Yup.string().required('Emergency contact is required'),
  bloodType: Yup.string(),
  allergies: Yup.string(),
  chronicConditions: Yup.string(),
});

// Success dialog transition
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />
});

const Register = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      dateOfBirth: null,
      address: '',
      emergencyContact: '',
      bloodType: '',
      allergies: '',
      chronicConditions: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Format the date to ISO string for backend compatibility
        const formattedDate = values.dateOfBirth ? new Date(values.dateOfBirth).toISOString() : null;

        const userData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          phone: values.phone,
          dateOfBirth: formattedDate,
          address: values.address,
          emergencyContact: values.emergencyContact,
          bloodType: values.bloodType || '',
          allergies: values.allergies || '',
          chronicConditions: values.chronicConditions || '',
          role: 'patient'
        };

        console.log('Sending registration data:', userData);

        // Make sure the API endpoint matches the backend route
        const response = await api.post('/api/auth/register', userData);

        console.log('Registration response:', response.data);

        if (response.data) {
          // Show success message and dialog
          setSuccess(true);
          setSuccessDialogOpen(true);
          // We'll navigate to login after the user closes the dialog
        }
      } catch (error) {
        console.error('Registration failed:', error);

        // Detailed error logging for debugging
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
          console.error('Error request:', error.request);
        } else {
          console.error('Error message:', error.message);
        }

        // Handle different types of errors
        if (error.response) {
          // The server responded with an error
          if (error.response.data.errors) {
            // Validation errors
            const validationErrors = error.response.data.errors;
            validationErrors.forEach(err => {
              formik.setFieldError(err.param, err.msg);
            });
            setError('Please correct the errors in the form.');
          } else if (error.response.data.message) {
            // Server error message
            setError(error.response.data.message);
          } else {
            // Generic server error
            setError(`Server error (${error.response.status}). Please try again later.`);
          }
        } else if (error.request) {
          // The request was made but no response was received
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else {
          // Something happened in setting up the request
          setError(`An error occurred: ${error.message}. Please try again.`);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Tell us about yourself
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                InputProps={{
                  startAdornment: (
                    <Person color="action" sx={{ mr: 1 }} />
                  ),
                }}
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                InputProps={{
                  startAdornment: (
                    <Person color="action" sx={{ mr: 1 }} />
                  ),
                }}
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="phone"
                label="Phone Number"
                InputProps={{
                  startAdornment: (
                    <Phone color="action" sx={{ mr: 1 }} />
                  ),
                }}
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  value={formik.values.dateOfBirth}
                  onChange={(newValue) => {
                    formik.setFieldValue('dateOfBirth', newValue);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth),
                      helperText: formik.touched.dateOfBirth && formik.errors.dateOfBirth,
                      InputProps: {
                        startAdornment: (
                          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                            <HealthAndSafety color="action" />
                          </Box>
                        ),
                      }
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address"
                label="Address"
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <Home color="action" sx={{ mr: 1, mt: 1 }} />
                  ),
                }}
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Medical Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                This information helps us provide better care and faster emergency response.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="emergencyContact"
                label="Emergency Contact"
                placeholder="Name and phone number"
                InputProps={{
                  startAdornment: (
                    <Phone color="action" sx={{ mr: 1 }} />
                  ),
                }}
                value={formik.values.emergencyContact}
                onChange={formik.handleChange}
                error={
                  formik.touched.emergencyContact &&
                  Boolean(formik.errors.emergencyContact)
                }
                helperText={
                  formik.touched.emergencyContact &&
                  formik.errors.emergencyContact
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.bloodType && Boolean(formik.errors.bloodType)}>
                <InputLabel id="blood-type-label">Blood Type (Optional)</InputLabel>
                <Select
                  labelId="blood-type-label"
                  name="bloodType"
                  value={formik.values.bloodType}
                  onChange={formik.handleChange}
                  startAdornment={<BloodtypeOutlined color="action" sx={{ mr: 1 }} />}
                  label="Blood Type (Optional)"
                >
                  <MenuItem value=""><em>Unknown</em></MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
                {formik.touched.bloodType && formik.errors.bloodType && (
                  <FormHelperText>{formik.errors.bloodType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* Empty grid item for spacing */}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="allergies"
                label="Allergies (Optional)"
                placeholder="List any allergies you have"
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <MedicalServices color="action" sx={{ mr: 1, mt: 1 }} />
                  ),
                }}
                value={formik.values.allergies}
                onChange={formik.handleChange}
                error={formik.touched.allergies && Boolean(formik.errors.allergies)}
                helperText={formik.touched.allergies && formik.errors.allergies}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="chronicConditions"
                label="Chronic Conditions (Optional)"
                placeholder="List any chronic conditions you have"
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <HealthAndSafety color="action" sx={{ mr: 1, mt: 1 }} />
                  ),
                }}
                value={formik.values.chronicConditions}
                onChange={formik.handleChange}
                error={
                  formik.touched.chronicConditions &&
                  Boolean(formik.errors.chronicConditions)
                }
                helperText={
                  formik.touched.chronicConditions &&
                  formik.errors.chronicConditions
                }
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Create Your Account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Set up your login credentials to access your SoulSpace Health account.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                placeholder="your.email@example.com"
                InputProps={{
                  startAdornment: (
                    <Email color="action" sx={{ mr: 1 }} />
                  ),
                }}
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="password"
                label="Password"
                type="password"
                InputProps={{
                  startAdornment: (
                    <Lock color="action" sx={{ mr: 1 }} />
                  ),
                }}
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password || 'Password must be at least 6 characters'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                InputProps={{
                  startAdornment: (
                    <Lock color="action" sx={{ mr: 1 }} />
                  ),
                }}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={
                  formik.touched.confirmPassword &&
                  Boolean(formik.errors.confirmPassword)
                }
                helperText={
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  By creating an account, you agree to our{' '}
                  <Link href="#" sx={{ fontWeight: 600 }}>Terms of Service</Link>{' '}
                  and{' '}
                  <Link href="#" sx={{ fontWeight: 600 }}>Privacy Policy</Link>.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  const theme = useTheme();
  const [error, setError] = useState('');

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)} 0%, ${alpha(theme.palette.secondary.dark, 0.9)} 100%)`
          : `linear-gradient(135deg, ${alpha('#4f46e5', 0.9)} 0%, ${alpha('#2dd4bf', 0.9)} 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        py: 8,
        mt: 0,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("/pattern-dots.svg")',
          backgroundSize: '30px',
          opacity: 0.1,
          zIndex: 0,
        },
      }}
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >

        {error && (
          <Alert
            severity="error"
            variant="filled"
            sx={{
              width: '100%',
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontWeight: 500,
                fontSize: '0.95rem'
              },
              boxShadow: 2,
              animation: 'pulse 1.5s',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.7)}`
                },
                '70%': {
                  boxShadow: `0 0 0 10px ${alpha(theme.palette.error.main, 0)}`
                },
                '100%': {
                  boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}`
                }
              }
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <Typography
          component="h1"
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 800,
            color: 'white',
            mb: 3,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}
        >
          Join SoulSpace Health
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          sx={{
            mb: 4,
            maxWidth: 600,
            color: 'white',
            textShadow: '0 1px 5px rgba(0,0,0,0.2)',
            fontWeight: 500
          }}
        >
          Create your patient account to access personalized healthcare services,
          schedule appointments, and manage your medical records securely.
        </Typography>

        <Card
          sx={{
            width: '100%',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 10px 40px rgba(0,0,0,0.5)'
              : '0 20px 60px rgba(79, 70, 229, 0.25)',
            position: 'relative',
            backdropFilter: 'blur(10px)',
            background: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.9)
              : alpha(theme.palette.background.paper, 0.95),
            border: theme.palette.mode === 'dark'
              ? `1px solid ${alpha(theme.palette.common.white, 0.1)}`
              : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 8,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              zIndex: 1,
            }}
          />
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                pt: 3,
                pb: 5,
                '& .MuiStepLabel-label': {
                  mt: 1,
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  color: theme.palette.text.secondary,
                  '&.Mui-active': {
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  },
                  '&.Mui-completed': {
                    color: theme.palette.success.main,
                    fontWeight: 600,
                  }
                },
                '& .MuiStepConnector-line': {
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                },
                '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                  borderColor: theme.palette.primary.main,
                },
                '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                  borderColor: theme.palette.success.main,
                },
              }}
            >
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel StepIconComponent={() => (
                    <Box
                      component={motion.div}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{
                        scale: activeStep >= index ? 1 : 0.8,
                        opacity: activeStep >= index ? 1 : 0.5
                      }}
                      transition={{ duration: 0.3 }}
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: activeStep === index
                          ? theme.palette.primary.main
                          : activeStep > index
                            ? theme.palette.success.main
                            : alpha(theme.palette.primary.main, 0.1),
                        color: activeStep >= index ? 'white' : theme.palette.text.secondary,
                        transition: 'all 0.3s ease',
                        boxShadow: activeStep >= index
                          ? `0 4px 12px ${alpha(
                              activeStep === index ? theme.palette.primary.main : theme.palette.success.main,
                              0.3
                            )}`
                          : 'none',
                        border: `2px solid ${
                          activeStep === index
                            ? theme.palette.primary.main
                            : activeStep > index
                              ? theme.palette.success.main
                              : alpha(theme.palette.primary.main, 0.2)
                        }`,
                      }}
                    >
                      {step.icon}
                    </Box>
                  )}>
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box
              component={motion.div}
              key={activeStep}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              sx={{ minHeight: 300 }}
            >
              <form onSubmit={formik.handleSubmit}>
                {renderStepContent(activeStep)}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 4,
                    pt: 3,
                    borderTop: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {activeStep !== 0 ? (
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      startIcon={<ArrowBack />}
                      sx={{
                        borderRadius: 2,
                        py: 1.2,
                        fontWeight: 600,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateX(-4px)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Back
                    </Button>
                  ) : (
                    <Box></Box>
                  )}

                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                        '&:hover': {
                          background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                          boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.6)}`,
                          transform: 'translateY(-3px)'
                        },
                      }}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                          Creating Account...
                        </Box>
                      ) : (
                        'Complete Registration'
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<ArrowForward />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                        '&:hover': {
                          background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                          boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.6)}`,
                          transform: 'translateY(-3px)'
                        },
                      }}
                    >
                      Continue
                    </Button>
                  )}
                </Box>
              </form>
            </Box>
          </CardContent>
        </Card>

        <Box
          sx={{
            mt: 4,
            textAlign: 'center',
            p: 3,
            borderRadius: 3,
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(145deg, ${alpha(theme.palette.primary.dark, 0.1)} 0%, ${alpha(theme.palette.secondary.dark, 0.1)} 100%)`
              : `linear-gradient(145deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
            border: theme.palette.mode === 'dark'
              ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              : `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            boxShadow: theme.palette.mode === 'dark'
              ? `inset 0 1px 1px ${alpha(theme.palette.common.white, 0.1)}`
              : `inset 0 1px 1px ${alpha(theme.palette.common.white, 0.9)}`,
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.05,
              backgroundImage: 'url("/pattern-health.svg")',
              backgroundSize: '200px',
              zIndex: 0,
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mb: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Already have an account?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
              Sign in to continue to SoulSpace Health and access your personalized healthcare dashboard
            </Typography>
            <Box
              component={motion.div}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              width="100%"
            >
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                color="primary"
                fullWidth
                endIcon={<ArrowForward />}
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 8px 15px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          setSuccessDialogOpen(false);
          navigate('/login');
        }}
        aria-describedby="registration-success-dialog"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
              : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: theme.palette.mode === 'dark'
              ? `1px solid ${alpha(theme.palette.common.white, 0.1)}`
              : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            overflow: 'hidden',
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`,
          }}
        />
        <DialogTitle sx={{
          textAlign: 'center',
          pt: 5,
          pb: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Box
            component={motion.div}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              mb: 2,
              boxShadow: `0 8px 20px ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <CheckCircleOutline sx={{ fontSize: 50 }} />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Registration Successful!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="registration-success-dialog"
            sx={{
              textAlign: 'center',
              mb: 3,
              px: 3,
              fontSize: '1.1rem',
              color: theme.palette.text.secondary
            }}
          >
            Your account has been created successfully. You can now log in to access your personalized SoulSpace Health dashboard and start your wellness journey.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 5, px: 3 }}>
          <Button
            onClick={() => {
              setSuccessDialogOpen(false);
              navigate('/login');
            }}
            variant="contained"
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 700,
              background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`,
              boxShadow: `0 10px 25px ${alpha(theme.palette.success.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 12px 30px ${alpha(theme.palette.success.main, 0.4)}`,
                transform: 'translateY(-3px)'
              },
            }}
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(4px)',
          background: alpha(theme.palette.background.default, 0.7)
        }}
        open={loading || (success && !successDialogOpen)}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress
            color="primary"
            size={60}
            thickness={4}
            sx={{
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
              borderRadius: '50%',
              p: 1,
              mb: 2
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 600,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            {loading ? 'Creating Your Account...' : 'Registration Successful!'}
          </Typography>
        </Box>
      </Backdrop>
      </Container>
    </Box>
  );
};

export default Register;
