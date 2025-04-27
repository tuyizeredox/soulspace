import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
  Link,
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
  Login as LoginIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ArrowForward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginUser, clearAuthError, clearAuthSuccess } from '../../store/slices/userAuthSlice';

const NewLogin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Local state
  const [showPassword, setShowPassword] = useState(false);

  // Get auth state from Redux
  const { loading, error, success, errorDetails, isAuthenticated, user } = useSelector(
    (state) => state.userAuth
  );

  // Form validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  // Initialize form with Formik
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      // Clear any previous errors or success messages
      dispatch(clearAuthError());
      dispatch(clearAuthSuccess());

      // Dispatch login action
      try {
        console.log('Submitting login form with email:', values.email);
        const result = await dispatch(loginUser(values)).unwrap();

        console.log('Login successful, redirecting to:', result.redirectUrl);

        // Show success message with toast
        toast.success('Login successful! Redirecting to dashboard...', {
          position: 'top-right',
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Add a short delay to show the success message before redirecting
        setTimeout(() => {
          // Determine the correct redirect URL based on user role
          const redirectUrl = result.redirectUrl ||
            (result.user?.role === 'super_admin' ? '/admin/dashboard' : '/dashboard');

          console.log('Navigating to:', redirectUrl);
          navigate(redirectUrl, { replace: true });
        }, 1000);
      } catch (err) {
        console.error('Login submission error:', err);
        // Show error toast for network errors
        if (!err.status) {
          toast.error('Network error. Please check your internet connection.', {
            position: 'top-right',
            autoClose: 5000,
          });
        }
        // Other errors are handled by the Redux slice
      }
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectUrl = user.role === 'super_admin' ? '/admin/dashboard' : '/dashboard';
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
      dispatch(clearAuthSuccess());
    };
  }, [dispatch]);

  // Toggle password visibility
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

  // Get appropriate error message based on status code
  const getErrorMessage = () => {
    if (!error) return null;

    if (errorDetails?.status === 404) {
      return 'User not found. Please check your email or register a new account.';
    } else if (errorDetails?.status === 401) {
      return 'Invalid credentials. Please check your email and password.';
    } else if (errorDetails?.status === 400) {
      return 'Invalid input. Please check your email and password.';
    } else if (errorDetails?.status === 500) {
      return 'Server error. Please try again later.';
    }

    return error;
  };

  return (
    <>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
    />
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)', // Subtract header height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)} 0%, ${alpha(theme.palette.secondary.dark, 0.9)} 100%)`
          : `linear-gradient(135deg, ${alpha('#4f46e5', 0.9)} 0%, ${alpha('#2dd4bf', 0.9)} 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        py: 8,
        mt: 0, // Remove margin top
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
            transform: 'translateZ(0)',
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
              boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.5)}`,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.2) 80%, rgba(255,255,255,0) 100%)',
                animation: 'shimmer 2s infinite linear',
              },
              '@keyframes shimmer': {
                '0%': {
                  transform: 'translateX(-100%)',
                },
                '100%': {
                  transform: 'translateX(100%)',
                },
              },
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
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: 'white',
                  mb: 3,
                  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                    zIndex: 1,
                  },
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    '50%': {
                      transform: 'scale(1.05)',
                      boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.6)}`,
                    },
                    '100%': {
                      transform: 'scale(1)',
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                  },
                }}
              >
                <LoginIcon sx={{ fontSize: 40, zIndex: 2 }} />
              </Box>

              <Typography
                component={motion.h1}
                variant="h3"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  textShadow: theme.palette.mode === 'dark' ? '0 2px 10px rgba(0,0,0,0.5)' : 'none',
                }}
                variants={{
                  hidden: { opacity: 0, y: -20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      ease: "easeOut"
                    }
                  }
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                align="center"
                sx={{
                  mb: 4,
                  maxWidth: 400,
                  fontSize: '1.1rem',
                  lineHeight: 1.5,
                  fontWeight: 500,
                  opacity: 0.9
                }}
                component={motion.p}
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      delay: 0.2,
                      ease: "easeOut"
                    }
                  }
                }}
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
                onClose={() => dispatch(clearAuthError())}
              >
                {getErrorMessage()}
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
                onSubmit={formik.handleSubmit}
                noValidate
                autoComplete="off"
                style={{ width: '100%' }}
              >
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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
                  onBlur={formik.handleBlur}
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
                  disabled={loading}
                  sx={{
                    mb: 3,
                    py: 1.8,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                      boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.6)}`,
                      transform: 'translateY(-3px)'
                    },
                    '&:active': {
                      transform: 'translateY(-1px)',
                      boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'all 0.5s ease',
                    },
                    '&:hover::after': {
                      left: '100%',
                    },
                  }}
                  component={motion.button}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress
                        size={26}
                        sx={{
                          color: 'white',
                          mr: 1.5,
                        }}
                      />
                      <Typography variant="button" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        Signing In...
                      </Typography>
                    </Box>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </Box>

            <Box
              sx={{
                mt: 3,
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
              component={motion.div}
              variants={itemVariants}
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
                  New to SoulSpace Health?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                  Create an account to access personalized healthcare services and start your wellness journey today
                </Typography>
                <Box
                  component={motion.div}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  width="100%"
                >
                  <Button
                    component={RouterLink}
                    to="/register"
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
                    Create Account
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
    </>
  );
};

export default NewLogin;
