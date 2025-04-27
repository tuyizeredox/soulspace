import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import axios from '../../utils/axiosConfig';

const LoginTest = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [response, setResponse] = useState(null);

  const handleTestLogin = async (endpoint) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setResponse(null);

    try {
      console.log(`Testing login with endpoint: /api/auth/${endpoint}`);
      console.log('Credentials:', { email, password });

      const response = await axios.post(`/api/auth/${endpoint}`, { email, password });
      
      console.log('Login response:', response.data);
      setSuccess(`Login successful with ${endpoint} endpoint!`);
      setResponse(response.data);
    } catch (err) {
      console.error(`Login error with ${endpoint} endpoint:`, err);
      
      if (err.response) {
        setError(`Error (${err.response.status}): ${err.response.data.message || 'Unknown error'}`);
        setResponse(err.response.data);
      } else if (err.request) {
        setError('No response received from server. Check if the server is running.');
      } else {
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Login API Test Tool
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Use this tool to test the login API endpoints directly
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            variant="outlined"
            placeholder="Enter your email"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
            placeholder="Enter your password"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={() => handleTestLogin('login')}
            disabled={loading || !email || !password}
            sx={{
              py: 1,
              px: 3,
              borderRadius: 2,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Test /login Endpoint'}
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleTestLogin('signin')}
            disabled={loading || !email || !password}
            sx={{
              py: 1,
              px: 3,
              borderRadius: 2,
              boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Test /signin Endpoint'}
          </Button>
        </Box>

        {response && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Response:
            </Typography>
            <Paper
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.03),
                maxHeight: 300,
                overflow: 'auto',
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </Paper>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default LoginTest;
