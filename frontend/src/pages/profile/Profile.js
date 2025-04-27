import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { updateProfile, resetProfileState } from '../../store/slices/profileSlice';
import { checkAuthStatus } from '../../store/slices/authSlice';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Divider,
  Paper,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Person,
  Phone,
  Email,
  Home,
  LocalHospital,
  MedicalServices,
  Bloodtype,
  Warning,
  ContactPhone,
  CalendarMonth,
  Badge,
  Security,
  Notifications,
  Settings,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { motion } from 'framer-motion';
import AvatarUpload from '../../components/profile/AvatarUpload';

// Blood type options
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user data from both auth systems
  const { user: oldUser, isAuthenticated: oldAuth } = useSelector((state) => state.auth);
  const { user: newUser, isAuthenticated: newAuth } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = newUser || oldUser;
  const isAuthenticated = newAuth || oldAuth;

  // Log authentication status for debugging
  console.log('Profile: Authentication status', {
    isAuthenticated,
    authSystem: newAuth ? 'userAuth' : (oldAuth ? 'auth' : 'none'),
    role: user?.role,
    name: user?.name,
    hasAvatar: !!user?.avatar
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.warn('Profile: User not authenticated, redirecting to login');
      toast.error('Please log in to view your profile');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const { loading, error, success, message } = useSelector((state) => state.profile);

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profile: {
      phone: '',
      dateOfBirth: null,
      address: '',
      emergencyContact: '',
      bloodType: '',
      allergies: '',
      chronicConditions: '',
    }
  });

  // State for form validation
  const [errors, setErrors] = useState({});

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Avatar upload is now handled by the AvatarUpload component

  // Extract first name and last name from full name (not used currently but kept for future use)
  /*
  const getNameParts = (fullName) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const parts = fullName.split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };
  */

  // Initialize form data from user object
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        profile: {
          phone: user.profile?.phone || '',
          dateOfBirth: user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth) : null,
          address: user.profile?.address || '',
          emergencyContact: user.profile?.emergencyContact || '',
          bloodType: user.profile?.bloodType || '',
          allergies: user.profile?.allergies || '',
          chronicConditions: user.profile?.chronicConditions || '',
        }
      });
    }
  }, [user]);

  // Handle success and error messages
  useEffect(() => {
    if (success) {
      setSnackbar({
        open: true,
        message: message || 'Profile updated successfully',
        severity: 'success',
      });
      setIsEditing(false);
      dispatch(checkAuthStatus()); // Refresh user data
      dispatch(resetProfileState());
    }

    if (error) {
      setSnackbar({
        open: true,
        message: error,
        severity: 'error',
      });
      dispatch(resetProfileState());
    }
  }, [success, error, message, dispatch]);

  // Handle tab change
  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      // Handle nested profile fields
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      // Handle top-level fields
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      profile: {
        ...formData.profile,
        dateOfBirth: date,
      },
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.profile.phone && !/^\+?[0-9]{10,15}$/.test(formData.profile.phone.replace(/[\\s-]/g, ''))) {
      newErrors['profile.phone'] = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Profile: Form submission triggered');

    // Check if this is from the avatar upload button
    const target = e.target;
    const isAvatarUpload = target.closest('label[aria-label="upload picture"]');

    if (isAvatarUpload) {
      console.log('Profile: Avatar upload button clicked, preventing form submission');
      return;
    }

    if (validateForm()) {
      console.log('Profile: Form validation passed, updating profile');
      dispatch(updateProfile(formData));
    } else {
      console.log('Profile: Form validation failed');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        profile: {
          phone: user.profile?.phone || '',
          dateOfBirth: user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth) : null,
          address: user.profile?.address || '',
          emergencyContact: user.profile?.emergencyContact || '',
          bloodType: user.profile?.bloodType || '',
          allergies: user.profile?.allergies || '',
          chronicConditions: user.profile?.chronicConditions || '',
        }
      });
    }

    setErrors({});
    setIsEditing(false);
  };

  // Avatar upload is now handled by the AvatarUpload component

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Name parts display functionality removed (not needed for current implementation)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <Container maxWidth="lg">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box sx={{ mt: 4, mb: 6 }}>
          <motion.div variants={itemVariants}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
              My Profile
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Manage your personal information and health data
            </Typography>
          </motion.div>

          <Grid container spacing={4} sx={{ mt: 1 }}>
            {/* Profile sidebar */}
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Use the standalone AvatarUpload component */}
                    <Box sx={{ mb: 2 }}>
                      <AvatarUpload
                        user={user}
                        size={120}
                        onUploadSuccess={(data) => {
                          console.log('Profile: Avatar upload success callback with data:', data);

                          // If we have an avatar URL in the response, update the user object
                          if (data.avatarUrl) {
                            console.log('Profile: Updating user avatar URL to:', data.avatarUrl);

                            // Update the user in the component state
                            // This is a hack to force a re-render with the new avatar
                            const event = new CustomEvent('user-avatar-updated', {
                              detail: { avatarUrl: data.avatarUrl }
                            });
                            window.dispatchEvent(event);
                          }

                          // Refresh user data after successful upload
                          dispatch(checkAuthStatus());

                          // Force a re-render of the component
                          setIsEditing(false);
                        }}
                      />
                    </Box>
                    <Typography variant="h5" color="white" fontWeight="bold">
                      {user?.name || 'User Name'}
                    </Typography>
                    <Chip
                      label={user?.role ? user.role.replace('_', ' ').toUpperCase() : 'USER'}
                      sx={{
                        mt: 1,
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                        {user?.email || 'email@example.com'}
                      </Typography>
                    </Box>

                    {user?.profile?.phone && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Phone
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Phone fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          {user.profile.phone}
                        </Typography>
                      </Box>
                    )}

                    {user?.profile?.bloodType && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Blood Type
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Bloodtype fontSize="small" sx={{ mr: 1, color: theme.palette.error.main }} />
                          {user.profile.bloodType}
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Edit />}
                        onClick={() => setIsEditing(true)}
                        disabled={isEditing}
                        sx={{ mb: 2 }}
                      >
                        Edit Profile
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Security />}
                        onClick={() => setTabValue(2)}
                      >
                        Security Settings
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Profile content */}
            <Grid item xs={12} md={8}>
              <motion.div variants={itemVariants}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      aria-label="profile tabs"
                      sx={{
                        '& .MuiTab-root': {
                          minHeight: 64,
                          fontWeight: 600,
                        },
                      }}
                    >
                      <Tab
                        icon={<Person />}
                        iconPosition="start"
                        label="Personal Info"
                        id="profile-tab-0"
                        aria-controls="profile-tabpanel-0"
                      />
                      <Tab
                        icon={<MedicalServices />}
                        iconPosition="start"
                        label="Medical Info"
                        id="profile-tab-1"
                        aria-controls="profile-tabpanel-1"
                      />
                      <Tab
                        icon={<Settings />}
                        iconPosition="start"
                        label="Settings"
                        id="profile-tab-2"
                        aria-controls="profile-tabpanel-2"
                      />
                    </Tabs>
                  </Box>

                  <CardContent>
                    {/* Form for profile data */}
                    <Box
                      component="form"
                      onSubmit={handleSubmit}
                      noValidate // Add noValidate to prevent browser validation
                    >
                      {/* Personal Info Tab */}
                      <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6">Personal Information</Typography>
                              {isEditing ? (
                                <Box>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Cancel />}
                                    onClick={handleCancelEdit}
                                    sx={{ mr: 1 }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Save />}
                                    type="submit"
                                    disabled={loading}
                                  >
                                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                                  </Button>
                                </Box>
                              ) : null}
                            </Box>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Full Name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              disabled={!isEditing}
                              error={!!errors.name}
                              helperText={errors.name}
                              InputProps={{
                                startAdornment: <Badge sx={{ mr: 1, color: theme.palette.primary.main }} />,
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              disabled={!isEditing}
                              error={!!errors.email}
                              helperText={errors.email}
                              InputProps={{
                                startAdornment: <Email sx={{ mr: 1, color: theme.palette.primary.main }} />,
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Phone"
                              name="profile.phone"
                              value={formData.profile.phone}
                              onChange={handleChange}
                              disabled={!isEditing}
                              error={!!errors['profile.phone']}
                              helperText={errors['profile.phone']}
                              InputProps={{
                                startAdornment: <Phone sx={{ mr: 1, color: theme.palette.primary.main }} />,
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <DatePicker
                                label="Date of Birth"
                                value={formData.profile.dateOfBirth}
                                onChange={handleDateChange}
                                disabled={!isEditing}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: <CalendarMonth sx={{ mr: 1, color: theme.palette.primary.main }} />,
                                    }}
                                  />
                                )}
                              />
                            </LocalizationProvider>
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Address"
                              name="profile.address"
                              multiline
                              rows={3}
                              value={formData.profile.address}
                              onChange={handleChange}
                              disabled={!isEditing}
                              InputProps={{
                                startAdornment: <Home sx={{ mr: 1, mt: 1, color: theme.palette.primary.main }} />,
                              }}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Emergency Contact"
                              name="profile.emergencyContact"
                              value={formData.profile.emergencyContact}
                              onChange={handleChange}
                              disabled={!isEditing}
                              InputProps={{
                                startAdornment: <ContactPhone sx={{ mr: 1, color: theme.palette.primary.main }} />,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </TabPanel>

                      {/* Medical Info Tab */}
                      <TabPanel value={tabValue} index={1}>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6">Medical Information</Typography>
                              {isEditing ? (
                                <Box>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Cancel />}
                                    onClick={handleCancelEdit}
                                    sx={{ mr: 1 }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Save />}
                                    type="submit"
                                    disabled={loading}
                                  >
                                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                                  </Button>
                                </Box>
                              ) : null}
                            </Box>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth disabled={!isEditing}>
                              <InputLabel id="blood-type-label">Blood Type</InputLabel>
                              <Select
                                labelId="blood-type-label"
                                id="blood-type"
                                name="profile.bloodType"
                                value={formData.profile.bloodType}
                                onChange={handleChange}
                                label="Blood Type"
                                startAdornment={<Bloodtype sx={{ mr: 1, color: theme.palette.error.main }} />}
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>
                                {BLOOD_TYPES.map((type) => (
                                  <MenuItem key={type} value={type}>
                                    {type}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ height: '100%' }} />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Allergies"
                              name="profile.allergies"
                              multiline
                              rows={3}
                              value={formData.profile.allergies}
                              onChange={handleChange}
                              disabled={!isEditing}
                              placeholder="List any allergies you have"
                              InputProps={{
                                startAdornment: <Warning sx={{ mr: 1, mt: 1, color: theme.palette.warning.main }} />,
                              }}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Chronic Conditions"
                              name="profile.chronicConditions"
                              multiline
                              rows={3}
                              value={formData.profile.chronicConditions}
                              onChange={handleChange}
                              disabled={!isEditing}
                              placeholder="List any chronic conditions you have"
                              InputProps={{
                                startAdornment: <LocalHospital sx={{ mr: 1, mt: 1, color: theme.palette.primary.main }} />,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </TabPanel>

                      {/* Settings Tab */}
                      <TabPanel value={tabValue} index={2}>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                              Account Settings
                            </Typography>
                          </Grid>

                          <Grid item xs={12}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                mb: 2
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Password
                              </Typography>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                Change your password to keep your account secure
                              </Typography>
                              <Button variant="outlined" startIcon={<Security />}>
                                Change Password
                              </Button>
                            </Paper>
                          </Grid>

                          <Grid item xs={12}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                mb: 2
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Notifications
                              </Typography>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                Manage your notification preferences
                              </Typography>
                              <Button variant="outlined" startIcon={<Notifications />}>
                                Notification Settings
                              </Button>
                            </Paper>
                          </Grid>

                          <Grid item xs={12}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                bgcolor: alpha(theme.palette.error.main, 0.05)
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight="bold" color="error" gutterBottom>
                                Delete Account
                              </Typography>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                Permanently delete your account and all associated data
                              </Typography>
                              <Button variant="outlined" color="error">
                                Delete Account
                              </Button>
                            </Paper>
                          </Grid>
                        </Grid>
                      </TabPanel>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </motion.div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
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

export default Profile;
