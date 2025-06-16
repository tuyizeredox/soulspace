import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from '../../utils/axios';

const ApiTest = () => {
  const { token } = useSelector((state) => state.userAuth);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testEndpoint = async (name, url) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(url, config);
      
      setResults(prev => ({
        ...prev,
        [name]: {
          success: true,
          data: response.data,
          status: response.status
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          success: false,
          error: error.response?.data?.message || error.message,
          status: error.response?.status
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const endpoints = [
    { name: 'Test API', url: '/api/test' },
    { name: 'Test Auth', url: '/api/test-auth' },
    { name: 'Hospital Patients', url: '/api/patients/hospital' },
    { name: 'Hospital Doctors', url: '/api/doctors/hospital' },
    { name: 'Hospital Appointments', url: '/api/appointments/hospital' },
    { name: 'Hospital Staff', url: '/api/staff/hospital' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        API Endpoint Test
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Token available: {token ? 'Yes' : 'No'}
        {token && ` (Length: ${token.length})`}
      </Alert>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {endpoints.map(({ name, url }) => (
          <Button
            key={name}
            variant="outlined"
            onClick={() => testEndpoint(name, url)}
            disabled={loading[name]}
            startIcon={loading[name] ? <CircularProgress size={16} /> : null}
          >
            Test {name}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Object.entries(results).map(([name, result]) => (
          <Card key={name}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {name}
              </Typography>
              
              {result.success ? (
                <Alert severity="success">
                  <Typography variant="body2">
                    Status: {result.status}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Response: {JSON.stringify(result.data, null, 2)}
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="error">
                  <Typography variant="body2">
                    Status: {result.status || 'Network Error'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Error: {result.error}
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ApiTest;