import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
  Link,
  Divider,
  Alert,
  Card,
  CardContent,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  Facebook,
  Apple,
  Login as LoginIcon,
  PersonAdd,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { login, clearError } from '../../store/slices/authSlice';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get auth state from Redux
  const { loading, error: reduxError, errorDetails } = useSelector((state) => state.auth);

  // Update local error state when Redux error changes
  useEffect(() => {
    if (reduxError) {
      setError(reduxError);

      // If we have error details with status, enhance the error message
      if (errorDetails?.status === 404) {
        setError('User not found. Please check your email or register a new account.');
      } else if (errorDetails?.status === 400) {
        setError('Invalid credentials. Please check your email and password.');
      }
    }
  }, [reduxError, errorDetails]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      // Clear previous messages
      setError('');
      setSuccess('');
      dispatch(clearError()); // Clear Redux errors

      try {
        console.log('Submitting login form with email:', values.email);

        // Disable form during submission
        setSubmitting(true);

        // Attempt login
        const result = await dispatch(login(values)).unwrap();

        console.log('Login successful, user:', result.user);
        console.log('Redirecting to:', result.redirectUrl);

        // Show success message
        setSuccess(`Welcome back, ${result.user.name}! Redirecting to your dashboard...`);

        // Add a delay to show the success message before redirecting
        setTimeout(() => {
          // Use navigate with replace to prevent back button from returning to login
          navigate(result.redirectUrl, { replace: true });
        }, 1500);

      } catch (err) {
        console.error('Login error:', err);
        setSubmitting(false);

        // Handle different error formats
        if (err.message) {
          setError(err.message);
        } else if (err.errors && err.errors.length > 0) {
          setError(err.errors[0].msg || 'Invalid credentials. Please try again.');
        } else if (err.status === 404) {
          setError('User not found. Please check your email or register a new account.');
        } else if (err.status === 400) {
          setError('Invalid credentials. Please check your email and password.');
        } else {
          setError('Login failed. Please try again or contact support if the problem persists.');
        }

        // Show error message in a toast or alert that's clearly visible
        // This ensures the user sees the error message
        const errorElement = document.getElementById('login-error-message');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        py: 8,
      }}
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Container maxWidth="sm">
        <Card
          component={motion.div}
          variants={itemVariants}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              zIndex: 1,
            }}
          />
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
              }}
              component={motion.div}
              variants={itemVariants}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  mb: 3,
                }}
              >
                <LoginIcon sx={{ fontSize: 36 }} />
              </Box>

              <Typography
                component="h1"
                variant="h3"
                gutterBottom
                sx={{ fontWeight: 700, textAlign: 'center' }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                align="center"
                sx={{ mb: 4, maxWidth: 400 }}
              >
                Sign in to continue to SoulSpace Health and access your personalized healthcare dashboard
              </Typography>
            </Box>

            {error && (
              <Alert
                id="login-error-message"
                severity="error"
                variant="filled"
                icon={<ErrorIcon fontSize="inherit" />}
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

            {success && (
              <Alert
                severity="success"
                variant="filled"
                icon={<CheckCircleIcon fontSize="inherit" />}
                sx={{
                  width: '100%',
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  },
                  boxShadow: 2,
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0.7)}`
                    },
                    '70%': {
                      boxShadow: `0 0 0 10px ${alpha(theme.palette.success.main, 0)}`
                    },
                    '100%': {
                      boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0)}`
                    }
                  }
                }}
              >
                {success}
              </Alert>
            )}

            <Box
              component={motion.div}
              variants={itemVariants}
              sx={{ width: '100%' }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault(); // Prevent default form submission
                  e.stopPropagation(); // Stop event propagation
                  if (!formik.isSubmitting) {
                    formik.handleSubmit(e);
                  }
                }}
                noValidate // Disable browser's native validation
                autoComplete="off" // Disable autocomplete for security
                style={{ width: '100%' }}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ mb: 3, textAlign: 'right' }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'none' }
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={formik.isSubmitting}
                  sx={{
                    mb: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '& .MuiCircularProgress-root': {
                      marginRight: 1
                    }
                  }}
                >
                  {formik.isSubmitting && (
                    <CircularProgress
                      size={24}
                      sx={{
                        color: theme.palette.common.white,
                        position: 'absolute',
                        left: 20,
                        opacity: 0.8
                      }}
                    />
                  )}
                  {formik.isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    OR CONTINUE WITH
                  </Typography>
                </Divider>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    mb: 4
                  }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Google />}
                    sx={{
                      py: 1.2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderWidth: 1.5,
                      '&:hover': {
                        borderWidth: 1.5,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    Google
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Facebook />}
                    sx={{
                      py: 1.2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderWidth: 1.5,
                      '&:hover': {
                        borderWidth: 1.5,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    Facebook
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Apple />}
                    sx={{
                      py: 1.2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderWidth: 1.5,
                      '&:hover': {
                        borderWidth: 1.5,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    Apple
                  </Button>
                </Box>
              </form>
            </Box>

            <Box
              sx={{
                mt: 2,
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
              component={motion.div}
              variants={itemVariants}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <PersonAdd fontSize="small" color="primary" />
                <Typography variant="body1" fontWeight={600}>
                  New to SoulSpace Health?
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create an account to access personalized healthcare services
              </Typography>
              <Button
                component={RouterLink}
                to="/register"
                variant="outlined"
                color="primary"
                fullWidth
                sx={{
                  borderRadius: 2,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderWidth: 1.5,
                  '&:hover': {
                    borderWidth: 1.5,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Create Account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
