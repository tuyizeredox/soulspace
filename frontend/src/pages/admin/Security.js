import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  VpnKey as VpnKeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from '../../utils/axios';
import { motion } from 'framer-motion';

const Security = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90
    },
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
    ipWhitelisting: false
  });
  
  const [securityLogs, setSecurityLogs] = useState([
    {
      id: 1,
      timestamp: '2023-07-20 14:32:45',
      event: 'Login Attempt',
      user: 'admin@example.com',
      status: 'success',
      ipAddress: '192.168.1.1',
      details: 'Successful login from Chrome on Windows'
    },
    {
      id: 2,
      timestamp: '2023-07-20 13:15:22',
      event: 'Password Change',
      user: 'doctor@example.com',
      status: 'success',
      ipAddress: '192.168.1.2',
      details: 'Password changed successfully'
    },
    {
      id: 3,
      timestamp: '2023-07-20 12:45:10',
      event: 'Login Attempt',
      user: 'unknown@example.com',
      status: 'failed',
      ipAddress: '192.168.1.3',
      details: 'Invalid credentials'
    },
    {
      id: 4,
      timestamp: '2023-07-20 11:30:05',
      event: 'Permission Change',
      user: 'admin@example.com',
      status: 'success',
      ipAddress: '192.168.1.1',
      details: 'Modified permissions for role: doctor'
    },
    {
      id: 5,
      timestamp: '2023-07-20 10:22:18',
      event: 'Account Lockout',
      user: 'nurse@example.com',
      status: 'warning',
      ipAddress: '192.168.1.4',
      details: 'Account locked after 5 failed attempts'
    }
  ]);

  const [vulnerabilities, setVulnerabilities] = useState([
    {
      id: 1,
      severity: 'high',
      description: 'Outdated SSL certificate',
      status: 'open',
      discoveredDate: '2023-07-15',
      affectedSystem: 'Web Server'
    },
    {
      id: 2,
      severity: 'medium',
      description: 'Weak password hashing algorithm',
      status: 'in_progress',
      discoveredDate: '2023-07-10',
      affectedSystem: 'Authentication System'
    },
    {
      id: 3,
      severity: 'low',
      description: 'Missing HTTP security headers',
      status: 'resolved',
      discoveredDate: '2023-07-05',
      affectedSystem: 'Web Application'
    }
  ]);

  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [editedSettings, setEditedSettings] = useState({...securitySettings});

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  useEffect(() => {
    // Simulate fetching security data
    setLoading(true);
    setTimeout(() => {
      // In a real app, you would fetch data from the server here
      setLoading(false);
    }, 1000);
  }, []);

  const handleSettingsChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setEditedSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSaveSettings = () => {
    // In a real app, you would save to the server here
    setSecuritySettings(editedSettings);
    setSuccess('Security settings updated successfully');
    setOpenSettingsDialog(false);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return theme.palette.success.main;
      case 'failed':
      case 'high':
        return theme.palette.error.main;
      case 'warning':
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
      case 'resolved':
        return <CheckCircleIcon />;
      case 'failed':
      case 'high':
        return <ErrorIcon />;
      case 'warning':
      case 'medium':
      case 'in_progress':
        return <WarningIcon />;
      case 'low':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{ mt: 4, mb: 4 }}
      >
        {/* Page Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4
          }}
          component={motion.div}
          variants={itemVariants}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon
              sx={{
                fontSize: 40,
                mr: 2,
                color: theme.palette.primary.main
              }}
            />
            <Typography variant="h4" component="h1" fontWeight={700}>
              System Security
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setOpenSettingsDialog(true)}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`
            }}
          >
            Edit Security Settings
          </Button>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Security Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ShieldIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Security Status
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    my: 3
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      mb: 2
                    }}
                  >
                    <Typography
                      variant="h3"
                      fontWeight={700}
                      sx={{ color: theme.palette.warning.main }}
                    >
                      B+
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" align="center">
                    Your system security is good, but there are some issues that need attention.
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <ErrorIcon sx={{ color: theme.palette.error.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="1 High Severity Issue"
                      secondary="Requires immediate attention"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon sx={{ color: theme.palette.warning.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="1 Medium Severity Issue"
                      secondary="Should be addressed soon"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon sx={{ color: theme.palette.info.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="1 Low Severity Issue"
                      secondary="Can be addressed in regular maintenance"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LockIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Authentication Settings
                  </Typography>
                </Box>
                <List>
                  <ListItem
                    secondaryAction={
                      <Chip
                        label={securitySettings.twoFactorAuth ? "Enabled" : "Disabled"}
                        color={securitySettings.twoFactorAuth ? "success" : "error"}
                        size="small"
                      />
                    }
                  >
                    <ListItemText
                      primary="Two-Factor Authentication"
                      secondary="Additional security layer for login"
                    />
                  </ListItem>
                  <ListItem
                    secondaryAction={
                      <Typography variant="body2" fontWeight={600}>
                        {securitySettings.passwordPolicy.minLength} characters
                      </Typography>
                    }
                  >
                    <ListItemText
                      primary="Minimum Password Length"
                      secondary="Required length for all passwords"
                    />
                  </ListItem>
                  <ListItem
                    secondaryAction={
                      <Typography variant="body2" fontWeight={600}>
                        {securitySettings.passwordPolicy.expiryDays} days
                      </Typography>
                    }
                  >
                    <ListItemText
                      primary="Password Expiry"
                      secondary="Days until password change required"
                    />
                  </ListItem>
                  <ListItem
                    secondaryAction={
                      <Typography variant="body2" fontWeight={600}>
                        {securitySettings.maxLoginAttempts} attempts
                      </Typography>
                    }
                  >
                    <ListItemText
                      primary="Max Login Attempts"
                      secondary="Before account lockout"
                    />
                  </ListItem>
                  <ListItem
                    secondaryAction={
                      <Typography variant="body2" fontWeight={600}>
                        {securitySettings.sessionTimeout} minutes
                      </Typography>
                    }
                  >
                    <ListItemText
                      primary="Session Timeout"
                      secondary="Inactivity period before logout"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VpnKeyIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Last Security Audit
                  </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2, mb: 2 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    Audit Date: July 15, 2023
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Performed by: Security Team
                  </Typography>
                  <Typography variant="body2">
                    Status: <Chip label="Completed" size="small" color="success" />
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  The last security audit identified several areas for improvement in the system's security posture.
                  Key findings included:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Strong encryption for patient data" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Regular security patches applied" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ErrorIcon sx={{ color: theme.palette.error.main }} />
                    </ListItemIcon>
                    <ListItemText primary="SSL certificate needs renewal" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon sx={{ color: theme.palette.warning.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Password policy needs strengthening" />
                  </ListItem>
                </List>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    View Full Report
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Security Vulnerabilities */}
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{ mb: 4 }}
        >
          <Paper
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
            }}
          >
            <Box
              sx={{
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: alpha(theme.palette.error.main, 0.05)
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Security Vulnerabilities
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                sx={{ borderRadius: 2 }}
              >
                Run New Scan
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Severity</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Affected System</TableCell>
                    <TableCell>Discovered</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vulnerabilities.map((vuln) => (
                    <TableRow key={vuln.id}>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(vuln.severity)}
                          label={vuln.severity.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: alpha(getStatusColor(vuln.severity), 0.1),
                            color: getStatusColor(vuln.severity),
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>{vuln.description}</TableCell>
                      <TableCell>{vuln.affectedSystem}</TableCell>
                      <TableCell>{vuln.discoveredDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={vuln.status === 'in_progress' ? 'In Progress' : 
                                 vuln.status.charAt(0).toUpperCase() + vuln.status.slice(1)}
                          size="small"
                          color={
                            vuln.status === 'resolved' ? 'success' :
                            vuln.status === 'in_progress' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {vuln.status !== 'resolved' && (
                          <Tooltip title="Mark as Resolved">
                            <IconButton size="small" color="success">
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* Security Logs */}
        <Box
          component={motion.div}
          variants={itemVariants}
        >
          <Paper
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
            }}
          >
            <Box
              sx={{
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Security Logs
              </Typography>
              <Button
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Export Logs
              </Button>
            </Box>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {securityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.event}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          sx={{
                            bgcolor: alpha(getStatusColor(log.status), 0.1),
                            color: getStatusColor(log.status),
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'flex-end',
                borderTop: `1px solid ${theme.palette.divider}`
              }}
            >
              <Button
                size="small"
                sx={{ mr: 1 }}
              >
                View All Logs
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Security Settings Dialog */}
      <Dialog
        open={openSettingsDialog}
        onClose={() => setOpenSettingsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Security Settings</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Authentication Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedSettings.twoFactorAuth}
                    onChange={handleSettingsChange}
                    name="twoFactorAuth"
                  />
                }
                label="Enable Two-Factor Authentication"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Password Policy
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Minimum Password Length"
                    type="number"
                    name="passwordPolicy.minLength"
                    value={editedSettings.passwordPolicy.minLength}
                    onChange={handleSettingsChange}
                    InputProps={{ inputProps: { min: 6, max: 30 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password Expiry (days)"
                    type="number"
                    name="passwordPolicy.expiryDays"
                    value={editedSettings.passwordPolicy.expiryDays}
                    onChange={handleSettingsChange}
                    InputProps={{ inputProps: { min: 0, max: 365 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedSettings.passwordPolicy.requireUppercase}
                        onChange={handleSettingsChange}
                        name="passwordPolicy.requireUppercase"
                      />
                    }
                    label="Require Uppercase Letters"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedSettings.passwordPolicy.requireLowercase}
                        onChange={handleSettingsChange}
                        name="passwordPolicy.requireLowercase"
                      />
                    }
                    label="Require Lowercase Letters"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedSettings.passwordPolicy.requireNumbers}
                        onChange={handleSettingsChange}
                        name="passwordPolicy.requireNumbers"
                      />
                    }
                    label="Require Numbers"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedSettings.passwordPolicy.requireSpecialChars}
                        onChange={handleSettingsChange}
                        name="passwordPolicy.requireSpecialChars"
                      />
                    }
                    label="Require Special Characters"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                name="sessionTimeout"
                value={editedSettings.sessionTimeout}
                onChange={handleSettingsChange}
                InputProps={{ inputProps: { min: 1, max: 1440 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Login Attempts"
                type="number"
                name="maxLoginAttempts"
                value={editedSettings.maxLoginAttempts}
                onChange={handleSettingsChange}
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedSettings.ipWhitelisting}
                    onChange={handleSettingsChange}
                    name="ipWhitelisting"
                  />
                }
                label="Enable IP Whitelisting"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Security;
