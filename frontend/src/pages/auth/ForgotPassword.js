import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  Link,
  useTheme,
  alpha,
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';

const ForgotPassword = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement password reset logic
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStatus({
        type: 'success',
        message: 'Password reset link sent to your email. Please check your inbox.'
      });
      setLoading(false);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Failed to send reset link. Please try again.'
      });
      setLoading(false);
    }
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
        mt: 0, // Remove margin top
      }}
    >
      <Container maxWidth="sm">
        <Card
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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography
                component="h1"
                variant="h4"
                fontWeight="bold"
                gutterBottom
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Forgot Password
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                align="center"
                sx={{ mb: 4, maxWidth: 400 }}
              >
                Enter your email address and we'll send you a link to reset your password
              </Typography>

              {status.message && (
                <Alert
                  severity={status.type}
                  variant="filled"
                  sx={{
                    width: '100%',
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontWeight: 500,
                    }
                  }}
                >
                  {status.message}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
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
                    mb: 3,
                  }}
                >
                  {loading ? 'Sending Reset Link...' : 'Reset Password'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'none' }
                    }}
                  >
                    <ArrowBack fontSize="small" sx={{ mr: 0.5 }} />
                    Back to Login
                  </Link>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
