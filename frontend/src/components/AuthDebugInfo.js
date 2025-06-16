import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Chip } from '@mui/material';

const AuthDebugInfo = () => {
  const { user, token, isAuthenticated } = useSelector((state) => state.userAuth);

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
      <Typography variant="h6" gutterBottom>
        Authentication Debug Info
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <Chip 
          label={`Authenticated: ${isAuthenticated ? 'Yes' : 'No'}`} 
          color={isAuthenticated ? 'success' : 'error'} 
          size="small" 
        />
        <Chip 
          label={`Token: ${token ? 'Present' : 'Missing'}`} 
          color={token ? 'success' : 'error'} 
          size="small" 
        />
        <Chip 
          label={`User: ${user?.name || 'Not loaded'}`} 
          color={user ? 'success' : 'warning'} 
          size="small" 
        />
        <Chip 
          label={`Role: ${user?.role || 'Unknown'}`} 
          color={user?.role ? 'info' : 'warning'} 
          size="small" 
        />
      </Box>
      <Typography variant="body2">
        LocalStorage tokens: userToken={!!localStorage.getItem('userToken') ? 'Yes' : 'No'}, 
        token={!!localStorage.getItem('token') ? 'Yes' : 'No'}, 
        doctorToken={!!localStorage.getItem('doctorToken') ? 'Yes' : 'No'}
      </Typography>
    </Paper>
  );
};

export default AuthDebugInfo;