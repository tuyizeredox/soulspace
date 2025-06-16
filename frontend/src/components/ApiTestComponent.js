import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import axios from '../utils/axios';

const ApiTestComponent = () => {
  const { token } = useSelector((state) => state.userAuth);
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testBasicConnection = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/test');
      setTestResult(`✅ Basic connection successful: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setTestResult(`❌ Basic connection failed: ${error.message}`);
    }
    setLoading(false);
  };

  const testAuthConnection = async () => {
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get('/api/test-auth', config);
      setTestResult(`✅ Auth connection successful: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setTestResult(`❌ Auth connection failed: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  const testDoctorsEndpoint = async () => {
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get('/api/doctors/hospital', config);
      setTestResult(`✅ Doctors endpoint successful: Found ${response.data?.length || 0} doctors`);
    } catch (error) {
      setTestResult(`❌ Doctors endpoint failed: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: 'warning.light' }}>
      <Typography variant="h6" gutterBottom>
        API Connection Test
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={testBasicConnection}
          disabled={loading}
        >
          Test Basic Connection
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={testAuthConnection}
          disabled={loading || !token}
        >
          Test Auth Connection
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={testDoctorsEndpoint}
          disabled={loading || !token}
        >
          Test Doctors Endpoint
        </Button>
      </Box>
      {testResult && (
        <Alert severity={testResult.startsWith('✅') ? 'success' : 'error'}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {testResult}
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default ApiTestComponent;