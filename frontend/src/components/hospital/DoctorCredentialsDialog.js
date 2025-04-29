import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
  Card,
  CardContent
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  Email as EmailIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const DoctorCredentialsDialog = ({ open, onClose, credentials, onSuccess }) => {
  const theme = useTheme();

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(credentials.password);
    onSuccess('Password copied to clipboard!');
  };

  const handleEmailCredentials = () => {
    // Open email client with pre-filled credentials
    const subject = encodeURIComponent('Your Hospital Portal Login Credentials');
    const body = encodeURIComponent(
      `Dear ${credentials.name},\n\n` +
      `Your account has been created in our hospital management system. Here are your login credentials:\n\n` +
      `Username: ${credentials.email}\n` +
      `Password: ${credentials.password}\n\n` +
      `Please login at: ${window.location.origin}/login\n\n` +
      `For security reasons, you will be required to change your password on first login.\n\n` +
      `Best regards,\n` +
      `Hospital Administration`
    );
    window.open(`mailto:${credentials.email}?subject=${subject}&body=${body}`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: alpha(theme.palette.success.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600} color="success.main">
            Doctor Created Successfully
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, pt: 3 }}>
        <Typography variant="body1" paragraph>
          The doctor account has been created successfully. Please share these login credentials with the doctor:
        </Typography>
        
        <Card 
          sx={{ 
            mb: 3, 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 2
          }}
        >
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Name
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {credentials.name}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Email (Username)
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {credentials.email}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Password
              </Typography>
              <TextField
                fullWidth
                value={credentials.password}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        color="primary"
                        onClick={handleCopyPassword}
                        startIcon={<ContentCopyIcon />}
                      >
                        Copy
                      </Button>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </Box>
          </CardContent>
        </Card>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <InfoIcon fontSize="small" color="info" sx={{ mr: 1, mt: 0.3 }} />
          <Typography variant="body2" color="text.secondary">
            The doctor will be required to change this password on first login for security reasons.
            Make sure to share these credentials securely with the doctor.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{ borderRadius: 2, mr: 1 }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EmailIcon />}
          onClick={handleEmailCredentials}
          sx={{ borderRadius: 2 }}
        >
          Email Credentials
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DoctorCredentialsDialog;
