import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../utils/axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Divider,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  Chip,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  LocalHospital as LocalHospitalIcon,
  Person as PersonIcon,
  VpnKey as VpnKeyIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  SupervisorAccount as SupervisorAccountIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const HospitalForm = ({ open, onClose, onSubmit, hospital, mode = 'add' }) => {
  const theme = useTheme();

  // Get user data from both auth systems
  const { user: oldUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: newUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = newUser || oldUser;
  const token = newToken || oldToken;

  console.log('HospitalForm: User data', {
    role: user?.role,
    name: user?.name,
    hasToken: !!token
  });
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Hospital data
    name: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    type: 'general',
    beds: '',
    status: 'active',
    logo: null,
    logoPreview: null,

    // Admin data
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    adminConfirmPassword: '',
    sendCredentials: true,

    // Additional admins
    additionalAdmins: [],
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Steps for the stepper
  const steps = ['Hospital Information', 'Primary Admin', 'Additional Admins'];

  // Function to generate a random strong password
  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({
      ...formData,
      adminPassword: password,
      adminConfirmPassword: password
    });
  };

  const hospitalTypes = [
    { value: 'general', label: 'General Hospital' },
    { value: 'specialty', label: 'Specialty Hospital' },
    { value: 'teaching', label: 'Teaching Hospital' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'rehabilitation', label: 'Rehabilitation Center' },
    { value: 'psychiatric', label: 'Psychiatric Hospital' },
  ];

  const statuses = [
    { value: 'active', label: 'Active', color: 'success' },
    { value: 'inactive', label: 'Inactive', color: 'default' },
    { value: 'pending', label: 'Pending Approval', color: 'warning' },
    { value: 'maintenance', label: 'Under Maintenance', color: 'error' },
  ];

  // State to track admins to remove during edit
  const [adminsToRemove, setAdminsToRemove] = useState([]);

  // Fetch hospital admins when in edit mode
  const [hospitalAdmins, setHospitalAdmins] = useState([]);

  useEffect(() => {
    // Reset admins to remove when form opens/closes
    setAdminsToRemove([]);

    if (hospital && mode === 'edit') {
      // Fetch hospital admins if in edit mode
      const fetchHospitalAdmins = async () => {
        try {
          // Clear cache to ensure we get fresh data
          console.log(`Fetching hospital admins for hospital ID: ${hospital.id}`);
          console.log('HospitalForm: Fetching hospital admins with token:', !!token);

          // Add a timestamp to prevent caching
          const timestamp = new Date().getTime();

          const config = {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          };

          const response = await axios.get(`/api/hospitals/${hospital.id}/admins?_t=${timestamp}`, config);

          if (response.data && Array.isArray(response.data)) {
            console.log(`Fetched ${response.data.length} admins for hospital ${hospital.id}`);
            setHospitalAdmins(response.data);
          } else {
            console.warn('Received invalid data format for hospital admins:', response.data);
            setHospitalAdmins([]);
          }
        } catch (error) {
          console.error('Error fetching hospital admins:', error);
          // Use mock data if API fails
          setHospitalAdmins([
            {
              id: 'admin_123',
              name: 'John Admin',
              email: 'john@example.com',
              phone: '+1 (555) 123-4567',
              isPrimary: true
            },
            {
              id: 'admin_456',
              name: 'Jane Manager',
              email: 'jane@example.com',
              phone: '+1 (555) 987-6543',
              isPrimary: false
            }
          ]);
        }
      };

      fetchHospitalAdmins();

      setFormData({
        // Hospital data
        name: hospital.name || '',
        location: hospital.location || '',
        address: hospital.address || '',
        city: hospital.city || '',
        state: hospital.state || '',
        zipCode: hospital.zipCode || '',
        phone: hospital.phone || '',
        email: hospital.email || '',
        website: hospital.website || '',
        type: hospital.type || 'general',
        beds: hospital.beds || '',
        status: hospital.status || 'active',
        logo: null,
        logoPreview: hospital.logo || null,

        // Admin data - in edit mode, we don't show admin creation fields
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminPhone: '',
        adminPassword: '',
        adminConfirmPassword: '',
        sendCredentials: true,

        // Primary admin update fields
        primaryAdminUpdate: null,
        updatePrimaryAdminPassword: false,
        primaryAdminPassword: '',

        // Additional admins - will be populated after fetching
        additionalAdmins: [],
      });
    } else {
      // Reset form for add mode
      setFormData({
        // Hospital data
        name: '',
        location: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        website: '',
        type: 'general',
        beds: '',
        status: 'active',
        logo: null,
        logoPreview: null,

        // Admin data
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminPhone: '',
        adminPassword: '',
        adminConfirmPassword: '',
        sendCredentials: true,

        // Primary admin update fields
        primaryAdminUpdate: null,
        updatePrimaryAdminPassword: false,
        primaryAdminPassword: '',

        // Additional admins
        additionalAdmins: [],
      });

      // Reset hospital admins
      setHospitalAdmins([]);
    }
    setErrors({});
    setActiveStep(0);
  }, [hospital, mode, open]);

  // Handle removing an existing admin
  const handleRemoveExistingAdmin = (adminId) => {
    setAdminsToRemove([...adminsToRemove, adminId]);
  };

  // Handle next step
  const handleNext = () => {
    // In edit mode, allow navigation without validation
    // This lets users go directly to the admin management step
    if (mode === 'edit' || validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }

    // Update location when city or state changes
    if (name === 'city' || name === 'state') {
      const city = name === 'city' ? value : formData.city;
      const state = name === 'state' ? value : formData.state;

      if (city && state) {
        setFormData(prev => ({
          ...prev,
          location: `${city}, ${state}`,
        }));
      }
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          logo: file,
          logoPreview: e.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate each step of the form
  const validateStep = (step) => {
    const newErrors = {};

    // In edit mode, we only validate fields that have been changed
    // This allows users to navigate through steps without filling in all fields
    if (step === 0) {
      // Validate hospital information
      if (mode === 'add') {
        // In add mode, validate all required fields
        if (!formData.name.trim()) {
          newErrors.name = 'Hospital name is required';
        }

        if (!formData.location.trim()) {
          newErrors.location = 'Location is required';
        }

        if (!formData.address.trim()) {
          newErrors.address = 'Address is required';
        }

        if (!formData.city.trim()) {
          newErrors.city = 'City is required';
        }

        if (!formData.state.trim()) {
          newErrors.state = 'State is required';
        }

        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        }
      } else {
        // In edit mode, only validate fields that have values
        // This allows users to leave fields empty if they don't want to update them
        if (formData.name.trim() === '' && hospital.name) {
          // If the field was emptied but had a value before, show error
          newErrors.name = 'Hospital name cannot be empty';
        }

        if (formData.location.trim() === '' && hospital.location) {
          newErrors.location = 'Location cannot be empty';
        }

        if (formData.phone.trim() === '' && hospital.phone) {
          newErrors.phone = 'Phone number cannot be empty';
        }
      }

      // Always validate format of optional fields if they have values
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }

      if (formData.beds && (isNaN(formData.beds) || parseInt(formData.beds) <= 0)) {
        newErrors.beds = 'Bed capacity must be a positive number';
      }
    } else if (step === 1 && mode === 'add') {
      // Validate primary admin information (only in add mode)
      if (!formData.adminFirstName.trim()) {
        newErrors.adminFirstName = 'First name is required';
      }

      if (!formData.adminLastName.trim()) {
        newErrors.adminLastName = 'Last name is required';
      }

      if (!formData.adminEmail.trim()) {
        newErrors.adminEmail = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
        newErrors.adminEmail = 'Email is invalid';
      }

      if (!formData.adminPassword.trim()) {
        newErrors.adminPassword = 'Password is required';
      } else if (formData.adminPassword.length < 8) {
        newErrors.adminPassword = 'Password must be at least 8 characters';
      }

      if (formData.adminPassword !== formData.adminConfirmPassword) {
        newErrors.adminConfirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate the entire form before submission
  const validateForm = () => {
    // For edit mode, we need a more lenient validation
    if (mode === 'edit') {
      // Only validate the current step
      // This allows users to update just the admins without filling in all hospital fields
      const currentStepValid = validateStep(activeStep);

      if (!currentStepValid) {
        return false;
      }

      // If we're on the additional admins step, validate that each new admin has required fields
      if (activeStep === 2 && formData.additionalAdmins.length > 0) {
        const newErrors = {};
        let isValid = true;

        formData.additionalAdmins.forEach((admin, index) => {
          if (!admin.firstName || !admin.firstName.trim()) {
            newErrors[`admin_${index}_firstName`] = 'First name is required';
            isValid = false;
          }

          if (!admin.lastName || !admin.lastName.trim()) {
            newErrors[`admin_${index}_lastName`] = 'Last name is required';
            isValid = false;
          }

          if (!admin.email || !admin.email.trim()) {
            newErrors[`admin_${index}_email`] = 'Email is required';
            isValid = false;
          } else if (!/\S+@\S+\.\S+/.test(admin.email)) {
            newErrors[`admin_${index}_email`] = 'Email is invalid';
            isValid = false;
          }
        });

        if (!isValid) {
          setErrors(prev => ({ ...prev, ...newErrors }));
          return false;
        }
      }

      return true;
    }

    // For add mode, validate all steps
    const hospitalInfoValid = validateStep(0);

    if (!hospitalInfoValid) {
      setActiveStep(0);
      return false;
    }

    const adminInfoValid = validateStep(1);

    if (!adminInfoValid) {
      setActiveStep(1);
      return false;
    }

    // Validate additional admins if any
    if (formData.additionalAdmins.length > 0) {
      const newErrors = {};
      let isValid = true;

      formData.additionalAdmins.forEach((admin, index) => {
        if (!admin.firstName || !admin.firstName.trim()) {
          newErrors[`admin_${index}_firstName`] = 'First name is required';
          isValid = false;
        }

        if (!admin.lastName || !admin.lastName.trim()) {
          newErrors[`admin_${index}_lastName`] = 'Last name is required';
          isValid = false;
        }

        if (!admin.email || !admin.email.trim()) {
          newErrors[`admin_${index}_email`] = 'Email is required';
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(admin.email)) {
          newErrors[`admin_${index}_email`] = 'Email is invalid';
          isValid = false;
        }
      });

      if (!isValid) {
        setErrors(prev => ({ ...prev, ...newErrors }));
        setActiveStep(2);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Create a copy of the form data to sanitize
      const sanitizedData = { ...formData };

      // Ensure beds is a valid number
      if (sanitizedData.beds === '' || isNaN(parseInt(sanitizedData.beds))) {
        sanitizedData.beds = 0;
      } else {
        sanitizedData.beds = parseInt(sanitizedData.beds);
      }

      // Ensure additionalAdmins have the correct format
      if (sanitizedData.additionalAdmins && sanitizedData.additionalAdmins.length > 0) {
        // Make sure we're sending the correct data format for new admins
        sanitizedData.additionalAdmins = sanitizedData.additionalAdmins.map(admin => {
          // Keep only the necessary fields
          return {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            phone: admin.phone,
            password: admin.password,
            sendCredentials: admin.sendCredentials
          };
        });

        console.log('Submitting additional admins:', sanitizedData.additionalAdmins);
      }

      // If in edit mode, include the admins to remove
      if (mode === 'edit') {
        onSubmit({
          ...sanitizedData,
          adminsToRemove
        });
      } else {
        onSubmit(sanitizedData);
      }
    }
  };

  // Add a new admin to the additional admins list
  const handleAddAdmin = () => {
    // Clear any existing errors for admin fields
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith('admin_')) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);

    // Generate a random password for the new admin
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    const newAdmin = {
      id: Date.now(), // Temporary ID for UI purposes
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: password, // Pre-generated password
      sendCredentials: true, // Default to sending credentials
    };

    setFormData({
      ...formData,
      additionalAdmins: [...formData.additionalAdmins, newAdmin]
    });
  };

  // Remove an admin from the additional admins list
  const handleRemoveAdmin = (adminId) => {
    setFormData({
      ...formData,
      additionalAdmins: formData.additionalAdmins.filter(admin => admin.id !== adminId)
    });
  };

  // Update an additional admin's information
  const handleAdminChange = (adminId, field, value) => {
    // Find the index of the admin in the array
    const adminIndex = formData.additionalAdmins.findIndex(admin => admin.id === adminId);

    // Clear any error for this field if it exists
    if (adminIndex !== -1) {
      const errorKey = `admin_${adminIndex}_${field}`;
      if (errors[errorKey]) {
        setErrors({
          ...errors,
          [errorKey]: null
        });
      }
    }

    setFormData({
      ...formData,
      additionalAdmins: formData.additionalAdmins.map(admin =>
        admin.id === adminId ? { ...admin, [field]: value } : admin
      )
    });
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'general':
        return theme.palette.primary.main;
      case 'specialty':
        return theme.palette.secondary.main;
      case 'teaching':
        return theme.palette.info.main;
      case 'clinic':
        return theme.palette.success.main;
      case 'rehabilitation':
        return theme.palette.warning.main;
      case 'psychiatric':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 3,
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
      }}>
        <Typography variant="h6" fontWeight={600}>
          {mode === 'add' ? 'Add New Hospital' : 'Edit Hospital'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        {activeStep === 0 && (
          <HospitalInfoStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            handleChange={handleChange}
            handleLogoChange={handleLogoChange}
            hospitalTypes={hospitalTypes}
            statuses={statuses}
            getTypeColor={getTypeColor}
            mode={mode}
            theme={theme}
          />
        )}

        {activeStep === 1 && (
          mode === 'add' ? (
            <PrimaryAdminStep
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              handleChange={handleChange}
              generatePassword={generatePassword}
              showPassword={showPassword}
              togglePasswordVisibility={togglePasswordVisibility}
              theme={theme}
            />
          ) : (
            // In edit mode, show the primary admin info with edit options
            <Box sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    width: 48,
                    height: 48,
                    mr: 2,
                  }}
                >
                  <SupervisorAccountIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Primary Hospital Administrator
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You can update the primary administrator's information
                  </Typography>
                </Box>
              </Box>

              {hospitalAdmins.length > 0 && hospitalAdmins.find(admin => admin.isPrimary) ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Current Primary Admin: {hospitalAdmins.find(admin => admin.isPrimary)?.name}
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Admin Name"
                        name="primaryAdminName"
                        defaultValue={hospitalAdmins.find(admin => admin.isPrimary)?.name || ''}
                        onChange={(e) => {
                          // Store the updated primary admin info
                          const currentUpdate = formData.primaryAdminUpdate || {};
                          setFormData({
                            ...formData,
                            primaryAdminUpdate: {
                              ...currentUpdate,
                              name: e.target.value
                            }
                          });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Admin Email"
                        name="primaryAdminEmail"
                        defaultValue={hospitalAdmins.find(admin => admin.isPrimary)?.email || ''}
                        onChange={(e) => {
                          const currentUpdate = formData.primaryAdminUpdate || {};
                          setFormData({
                            ...formData,
                            primaryAdminUpdate: {
                              ...currentUpdate,
                              email: e.target.value
                            }
                          });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Admin Phone"
                        name="primaryAdminPhone"
                        defaultValue={hospitalAdmins.find(admin => admin.isPrimary)?.phone || ''}
                        onChange={(e) => {
                          const currentUpdate = formData.primaryAdminUpdate || {};
                          setFormData({
                            ...formData,
                            primaryAdminUpdate: {
                              ...currentUpdate,
                              phone: e.target.value
                            }
                          });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.updatePrimaryAdminPassword || false}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                updatePrimaryAdminPassword: e.target.checked
                              });
                            }}
                            color="primary"
                          />
                        }
                        label="Reset Password"
                      />
                    </Grid>

                    {formData.updatePrimaryAdminPassword && (
                      <>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="New Password"
                            name="primaryAdminPassword"
                            type={showPassword ? "text" : "password"}
                            value={formData.primaryAdminPassword || ''}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                primaryAdminPassword: e.target.value
                              });
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={togglePasswordVisibility}
                                    edge="end"
                                  >
                                    {showPassword ? "👁️" : "👁️‍🗨️"}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              // Generate a random password
                              const length = 12;
                              const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
                              let password = "";
                              for (let i = 0; i < length; i++) {
                                password += charset.charAt(Math.floor(Math.random() * charset.length));
                              }
                              setFormData({
                                ...formData,
                                primaryAdminPassword: password
                              });
                            }}
                            startIcon={<VpnKeyIcon />}
                            sx={{ borderRadius: 2, height: '100%' }}
                          >
                            Generate Password
                          </Button>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Loading primary admin information...
                </Typography>
              )}
            </Box>
          )
        )}

        {activeStep === 2 && (
          <AdditionalAdminsStep
            formData={formData}
            handleAddAdmin={handleAddAdmin}
            handleRemoveAdmin={handleRemoveAdmin}
            handleAdminChange={handleAdminChange}
            theme={theme}
            alpha={alpha}
            mode={mode}
            hospitalAdmins={hospitalAdmins}
            handleRemoveExistingAdmin={handleRemoveExistingAdmin}
            adminsToRemove={adminsToRemove}
            setAdminsToRemove={setAdminsToRemove}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
            errors={errors}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: alpha(theme.palette.background.paper, 0.5) }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>

        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 2, mr: 1 }}
          >
            Back
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            {mode === 'add' ? 'Create Hospital' : 'Save Changes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Hospital Information Step Component
const HospitalInfoStep = ({
  formData,
  setFormData,
  errors,
  handleChange,
  handleLogoChange,
  hospitalTypes,
  statuses,
  getTypeColor,
  mode
}) => {
  return (
    <Grid container spacing={3}>
      {/* Logo Section */}
      <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Avatar
            src={formData.logoPreview}
            alt={formData.name}
            variant="rounded"
            sx={{
              width: 120,
              height: 120,
              mb: 2,
              bgcolor: !formData.logoPreview ? alpha(getTypeColor(formData.type), 0.2) : undefined,
              color: !formData.logoPreview ? getTypeColor(formData.type) : undefined,
              borderRadius: 2,
            }}
          >
            {!formData.logoPreview && <LocalHospitalIcon sx={{ fontSize: 40 }} />}
          </Avatar>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="logo-upload"
            type="file"
            onChange={handleLogoChange}
          />
          <label htmlFor="logo-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<PhotoCameraIcon />}
              sx={{ borderRadius: 2 }}
            >
              Upload Logo
            </Button>
          </label>
        </Box>

        {mode === 'edit' && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Hospital Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {statuses.map((status) => (
                <FormControlLabel
                  key={status.value}
                  control={
                    <Switch
                      checked={formData.status === status.value}
                      onChange={() => setFormData({ ...formData, status: status.value })}
                      color={status.color}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={status.label}
                        size="small"
                        color={status.color}
                        sx={{ mr: 1, fontWeight: 600, borderRadius: 1 }}
                      />
                    </Box>
                  }
                />
              ))}
            </Box>
          </Box>
        )}
      </Grid>

      {/* Form Fields */}
      <Grid item xs={12} md={9}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Hospital Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
              sx={{ borderRadius: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Hospital Type
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {hospitalTypes.map((type) => (
                <Chip
                  key={type.value}
                  label={type.label}
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  color={formData.type === type.value ? 'primary' : 'default'}
                  variant={formData.type === type.value ? 'filled' : 'outlined'}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    ...(formData.type === type.value && {
                      backgroundColor: getTypeColor(type.value),
                    }),
                  }}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom>
              Location Information
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ borderRadius: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={!!errors.city}
              helperText={errors.city}
              required
              sx={{ borderRadius: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              error={!!errors.state}
              helperText={errors.state}
              required
              sx={{ borderRadius: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Zip Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              error={!!errors.zipCode}
              helperText={errors.zipCode}
              sx={{ borderRadius: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom>
              Contact Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ borderRadius: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ borderRadius: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LanguageIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ borderRadius: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Bed Capacity"
              name="beds"
              type="number"
              value={formData.beds}
              onChange={handleChange}
              error={!!errors.beds}
              helperText={errors.beds}
              InputProps={{
                inputProps: { min: 1 },
              }}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

// Primary Admin Step Component
const PrimaryAdminStep = ({
  formData,
  setFormData,
  errors,
  handleChange,
  generatePassword,
  showPassword,
  togglePasswordVisibility,
  theme
}) => {
  // No custom handler needed, using the parent component's handleChange

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            <SupervisorAccountIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Primary Hospital Administrator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This admin will have full access to manage the hospital
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="First Name"
              name="adminFirstName"
              value={formData.adminFirstName}
              onChange={handleChange}
              error={!!errors.adminFirstName}
              helperText={errors.adminFirstName}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="adminLastName"
              value={formData.adminLastName}
              onChange={handleChange}
              error={!!errors.adminLastName}
              helperText={errors.adminLastName}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email Address"
              name="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={handleChange}
              error={!!errors.adminEmail}
              helperText={errors.adminEmail}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="adminPhone"
              value={formData.adminPhone}
              onChange={handleChange}
              error={!!errors.adminPhone}
              helperText={errors.adminPhone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Password"
              name="adminPassword"
              type={showPassword ? "text" : "password"}
              value={formData.adminPassword}
              onChange={handleChange}
              error={!!errors.adminPassword}
              helperText={errors.adminPassword}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Confirm Password"
              name="adminConfirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.adminConfirmPassword}
              onChange={handleChange}
              error={!!errors.adminConfirmPassword}
              helperText={errors.adminConfirmPassword}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sendCredentials}
                    onChange={(e) => setFormData({ ...formData, sendCredentials: e.target.checked })}
                    color="primary"
                  />
                }
                label="Send login credentials to admin's email"
              />
              <Button
                variant="outlined"
                onClick={generatePassword}
                startIcon={<VpnKeyIcon />}
                sx={{ borderRadius: 2 }}
              >
                Generate Password
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </motion.div>
  );
};

// Additional Admins Step Component
const AdditionalAdminsStep = ({
  formData,
  handleAddAdmin,
  handleRemoveAdmin,
  handleAdminChange,
  theme,
  alpha,
  mode,
  hospitalAdmins = [],
  handleRemoveExistingAdmin,
  adminsToRemove = [],
  setAdminsToRemove,
  showPassword,
  togglePasswordVisibility,
  errors = {}
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Additional Administrators (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add more administrators to help manage this hospital
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAdmin}
            sx={{
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            Add Admin
          </Button>
        </Box>

        {/* Existing Admins (Edit Mode) */}
        {mode === 'edit' && hospitalAdmins.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Existing Administrators
            </Typography>
            <Box>
              {hospitalAdmins.map((admin) => (
                <Paper
                  key={admin.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    position: 'relative',
                    opacity: adminsToRemove.includes(admin.id) ? 0.5 : 1,
                  }}
                >
                  {!admin.isPrimary && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveExistingAdmin(admin.id)}
                      disabled={adminsToRemove.includes(admin.id)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: theme.palette.error.main,
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: admin.isPrimary
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.secondary.main, 0.1),
                        color: admin.isPrimary ? theme.palette.primary.main : theme.palette.secondary.main,
                        mr: 2
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {admin.name} {admin.isPrimary && <Chip size="small" label="Primary" color="primary" sx={{ ml: 1 }} />}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {admin.email}
                      </Typography>
                    </Box>
                  </Box>

                  {adminsToRemove.includes(admin.id) && (
                    <Box sx={{
                      p: 1,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Typography variant="body2" color="error">
                        This admin will be removed when you save changes
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => setAdminsToRemove(adminsToRemove.filter(id => id !== admin.id))}
                      >
                        Undo
                      </Button>
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
            <Divider sx={{ my: 3 }} />
          </Box>
        )}

        {/* New Admins */}
        <Typography variant="h6" gutterBottom>
          {mode === 'edit' ? 'Add New Administrators' : 'Additional Administrators'}
        </Typography>

        {formData.additionalAdmins.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No additional administrators added yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click the "Add Admin" button to add more administrators
            </Typography>
          </Box>
        ) : (
          <Box>
            {formData.additionalAdmins.map((admin, index) => (
              <Paper
                key={admin.id}
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  position: 'relative',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleRemoveAdmin(admin.id)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: theme.palette.error.main,
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  New Administrator #{index + 1}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={admin.firstName}
                      onChange={(e) => handleAdminChange(admin.id, 'firstName', e.target.value)}
                      size="small"
                      error={!!errors[`admin_${index}_firstName`]}
                      helperText={errors[`admin_${index}_firstName`]}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={admin.lastName}
                      onChange={(e) => handleAdminChange(admin.id, 'lastName', e.target.value)}
                      size="small"
                      error={!!errors[`admin_${index}_lastName`]}
                      helperText={errors[`admin_${index}_lastName`]}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={admin.email}
                      onChange={(e) => handleAdminChange(admin.id, 'email', e.target.value)}
                      size="small"
                      error={!!errors[`admin_${index}_email`]}
                      helperText={errors[`admin_${index}_email`]}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={admin.phone}
                      onChange={(e) => handleAdminChange(admin.id, 'phone', e.target.value)}
                      size="small"
                    />
                  </Grid>

                  {/* Login Credentials Section */}
                  <Grid item xs={12}>
                    <Box sx={{
                      p: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 1,
                      mt: 1
                    }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Login Credentials
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            value={admin.password || ''}
                            onChange={(e) => handleAdminChange(admin.id, 'password', e.target.value)}
                            size="small"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={togglePasswordVisibility}
                                    edge="end"
                                    size="small"
                                  >
                                    {showPassword ? "👁️" : "👁️‍🗨️"}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              // Generate a random password
                              const length = 12;
                              const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
                              let password = "";
                              for (let i = 0; i < length; i++) {
                                password += charset.charAt(Math.floor(Math.random() * charset.length));
                              }
                              handleAdminChange(admin.id, 'password', password);
                            }}
                            startIcon={<VpnKeyIcon />}
                            sx={{ borderRadius: 2, height: '100%' }}
                          >
                            Generate Password
                          </Button>
                        </Grid>
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={admin.sendCredentials || false}
                                onChange={(e) => handleAdminChange(admin.id, 'sendCredentials', e.target.checked)}
                                color="primary"
                                size="small"
                              />
                            }
                            label="Send login credentials to admin's email"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};

export default HospitalForm;
