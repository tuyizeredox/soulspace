import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';

const TestApi = () => {
  const [rootTestResult, setRootTestResult] = useState(null);
  const [authTestResult, setAuthTestResult] = useState(null);
  const [loginTestResult, setLoginTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testRootEndpoint = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/test');
      console.log('Root test response:', response.data);
      setRootTestResult(response.data);
    } catch (err) {
      console.error('Root test error:', err);
      setError(`Root test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuthEndpoint = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/auth/test');
      console.log('Auth test response:', response.data);
      setAuthTestResult(response.data);
    } catch (err) {
      console.error('Auth test error:', err);
      setError(`Auth test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLoginEndpoint = async () => {
    setLoading(true);
    setError(null);
    try {
      // Just test if the endpoint exists, don't actually try to login
      const response = await axios.post('/api/auth/login', {}, {
        validateStatus: function (status) {
          // Consider any status as valid for this test
          // We just want to see if the endpoint exists
          return status < 500;
        }
      });
      console.log('Login test response:', response.status, response.data);
      setLoginTestResult({
        status: response.status,
        data: response.data
      });
    } catch (err) {
      console.error('Login test error:', err);
      setError(`Login test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          API Connection Test
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Base URL: {axios.defaults.baseURL || 'Not set'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={testRootEndpoint}
            disabled={loading}
          >
            Test Root API
          </Button>

          <Button
            variant="contained"
            onClick={testAuthEndpoint}
            disabled={loading}
          >
            Test Auth API
          </Button>

          <Button
            variant="contained"
            onClick={testLoginEndpoint}
            disabled={loading}
            color="primary"
          >
            Test Login Endpoint
          </Button>
        </Box>

        {rootTestResult && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">Root Test Result:</Typography>
            <pre>{JSON.stringify(rootTestResult, null, 2)}</pre>
          </Box>
        )}

        {authTestResult && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">Auth Test Result:</Typography>
            <pre>{JSON.stringify(authTestResult, null, 2)}</pre>
          </Box>
        )}

        {loginTestResult && (
          <Box>
            <Typography variant="h6">Login Test Result:</Typography>
            <Typography>Status: {loginTestResult.status}</Typography>
            <pre>{JSON.stringify(loginTestResult.data, null, 2)}</pre>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TestApi;
