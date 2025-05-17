import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Alert,
  useTheme,
  alpha,
  Tabs,
  Tab
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  VolumeUp as VolumeUpIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const SettingsPage = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  
  // State variables
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    push: true,
    appointments: true,
    labResults: true,
    prescriptions: true,
    messages: true
  });
  const [privacySettings, setPrivacySettings] = useState({
    shareDataWithDoctor: true,
    shareDataWithHospital: true,
    allowAnonymousDataForResearch: false,
    showProfilePicture: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle profile data change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  // Handle password data change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  // Handle notification settings change
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };
  
  // Handle privacy settings change
  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacySettings({
      ...privacySettings,
      [name]: checked
    });
  };
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };
  
  // Save profile
  const handleSaveProfile = () => {
    // In a real app, this would be an API call
    setSnackbar({
      open: true,
      message: 'Profile updated successfully',
      severity: 'success'
    });
  };
  
  // Change password
  const handleChangePassword = () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match',
        severity: 'error'
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 8 characters long',
        severity: 'error'
      });
      return;
    }
    
    // In a real app, this would be an API call
    setSnackbar({
      open: true,
      message: 'Password changed successfully',
      severity: 'success'
    });
    
    // Clear password fields
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };
  
  // Save notification settings
  const handleSaveNotificationSettings = () => {
    // In a real app, this would be an API call
    setSnackbar({
      open: true,
      message: 'Notification settings updated successfully',
      severity: 'success'
    });
  };
  
  // Save privacy settings
  const handleSavePrivacySettings = () => {
    // In a real app, this would be an API call
    setSnackbar({
      open: true,
      message: 'Privacy settings updated successfully',
      severity: 'success'
    });
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Settings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              position: 'sticky',
              top: 80
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  src={user?.avatar || ''}
                  alt={user?.name || 'User'}
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 2,
                    border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'user@example.com'}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Change Photo
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Tabs
                orientation="vertical"
                variant="scrollable"
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  borderRight: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    textTransform: 'none',
                    minHeight: 48,
                    fontWeight: 500
                  }
                }}
              >
                <Tab 
                  label="Profile Information" 
                  icon={<PersonIcon />} 
                  iconPosition="start"
                  sx={{ borderRadius: 2 }}
                />
                <Tab 
                  label="Security" 
                  icon={<SecurityIcon />} 
                  iconPosition="start"
                  sx={{ borderRadius: 2 }}
                />
                <Tab 
                  label="Notifications" 
                  icon={<NotificationsIcon />} 
                  iconPosition="start"
                  sx={{ borderRadius: 2 }}
                />
                <Tab 
                  label="Privacy" 
                  icon={<LockIcon />} 
                  iconPosition="start"
                  sx={{ borderRadius: 2 }}
                />
              </Tabs>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={9}>
          {/* Profile Information */}
          {activeTab === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Profile Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    variant="outlined"
                    margin="normal"
                    type="email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={profileData.city}
                    onChange={handleProfileChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={profileData.state}
                    onChange={handleProfileChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Zip Code"
                    name="zipCode"
                    value={profileData.zipCode}
                    onChange={handleProfileChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </Paper>
          )}
          
          {/* Security */}
          {activeTab === 1 && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Security
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Change Password
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Ensure your account is using a strong password for security.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    variant="outlined"
                    margin="normal"
                    type={showPassword.current ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility('current')}
                          edge="end"
                        >
                          {showPassword.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    variant="outlined"
                    margin="normal"
                    type={showPassword.new ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility('new')}
                          edge="end"
                        >
                          {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    variant="outlined"
                    margin="normal"
                    type={showPassword.confirm ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility('confirm')}
                          edge="end"
                        >
                          {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      )
                    }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleChangePassword}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3
                  }}
                >
                  Change Password
                </Button>
              </Box>
              
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Two-Factor Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add an extra layer of security to your account by enabling two-factor authentication.
              </Typography>
              
              <Button
                variant="outlined"
                color="primary"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none'
                }}
              >
                Enable Two-Factor Authentication
              </Button>
            </Paper>
          )}
          
          {/* Notifications */}
          {activeTab === 2 && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Notification Settings
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Notification Methods
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Choose how you want to receive notifications.
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.email}
                          onChange={handleNotificationChange}
                          name="email"
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive notifications via email"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.sms}
                          onChange={handleNotificationChange}
                          name="sms"
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="SMS Notifications"
                    secondary="Receive notifications via text message"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.push}
                          onChange={handleNotificationChange}
                          name="push"
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive notifications on your device"
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Notification Types
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Choose which types of notifications you want to receive.
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.appointments}
                          onChange={handleNotificationChange}
                          name="appointments"
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Appointment Reminders"
                    secondary="Notifications about upcoming appointments"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.labResults}
                          onChange={handleNotificationChange}
                          name="labResults"
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Lab Results"
                    secondary="Notifications when new lab results are available"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.prescriptions}
                          onChange={handleNotificationChange}
                          name="prescriptions"
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Prescription Updates"
                    secondary="Notifications about prescription refills and updates"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.messages}
                          onChange={handleNotificationChange}
                          name="messages"
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Messages"
                    secondary="Notifications when you receive new messages"
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveNotificationSettings}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3
                  }}
                >
                  Save Notification Settings
                </Button>
              </Box>
            </Paper>
          )}
          
          {/* Privacy */}
          {activeTab === 3 && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LockIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Privacy Settings
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Data Sharing
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Control how your health data is shared with healthcare providers.
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={privacySettings.shareDataWithDoctor}
                          onChange={handlePrivacyChange}
                          name="shareDataWithDoctor"
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Share Data with Doctor"
                    secondary="Allow your assigned doctor to access your health data"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={privacySettings.shareDataWithHospital}
                          onChange={handlePrivacyChange}
                          name="shareDataWithHospital"
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Share Data with Hospital"
                    secondary="Allow your hospital to access your health data"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={privacySettings.allowAnonymousDataForResearch}
                          onChange={handlePrivacyChange}
                          name="allowAnonymousDataForResearch"
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Anonymous Data for Research"
                    secondary="Allow your anonymized data to be used for medical research"
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Profile Visibility
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Control how your profile information is displayed.
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={privacySettings.showProfilePicture}
                          onChange={handlePrivacyChange}
                          name="showProfilePicture"
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Show Profile Picture"
                    secondary="Display your profile picture to healthcare providers"
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSavePrivacySettings}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3
                  }}
                >
                  Save Privacy Settings
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage;
