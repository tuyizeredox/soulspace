import React from 'react';
import { Snackbar, Alert, Typography } from '@mui/material';

const AlertMessage = ({ open, onClose, severity, message }) => {
  if (!message) return null;
  
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%', borderRadius: 2 }}
      >
        <Typography variant="body2">{message}</Typography>
      </Alert>
    </Snackbar>
  );
};

export default AlertMessage;
