import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Avatar,
  Button,
  useTheme,
  alpha,
  Link,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Star as StarIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';

const HospitalDetailsDialog = ({ open, onClose, hospital, onEdit }) => {
  const theme = useTheme();
  const [hospitalAdmins, setHospitalAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get user data from both auth systems
  const { user: oldUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: newUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = newUser || oldUser;
  const token = newToken || oldToken;

  console.log('HospitalDetailsDialog: User data', {
    role: user?.role,
    name: user?.name,
    hasToken: !!token
  });

  // Fetch hospital admins when the dialog opens
  useEffect(() => {
    if (open && hospital) {
      fetchHospitalAdmins();
    }
  }, [open, hospital]);

  const fetchHospitalAdmins = async () => {
    if (!hospital) return;

    try {
      setLoading(true);
      console.log('HospitalDetailsDialog: Fetching hospital admins with token:', !!token);

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const response = await axios.get(`/api/hospitals/${hospital.id}/admins?_t=${timestamp}`, config);

      if (response.data && Array.isArray(response.data)) {
        console.log(`Fetched ${response.data.length} admins for hospital details dialog`);
        setHospitalAdmins(response.data);
      }
    } catch (error) {
      console.error('Error fetching hospital admins for details dialog:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hospital) return null;

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      case 'maintenance':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.3 },
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
          backgroundColor: alpha(getTypeColor(hospital.type), 0.05),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={hospital.logo}
            alt={hospital.name}
            variant="rounded"
            sx={{
              bgcolor: !hospital.logo ? alpha(getTypeColor(hospital.type), 0.2) : undefined,
              color: !hospital.logo ? getTypeColor(hospital.type) : undefined,
              width: { xs: 48, sm: 64 },
              height: { xs: 48, sm: 64 },
              borderRadius: 2,
            }}
          >
            {!hospital.logo && <LocalHospitalIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {hospital.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={formatType(hospital.type)}
                size="small"
                sx={{
                  backgroundColor: alpha(getTypeColor(hospital.type), 0.1),
                  color: getTypeColor(hospital.type),
                  fontWeight: 600,
                  borderRadius: 1,
                }}
              />
              <Chip
                label={hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                size="small"
                color={getStatusColor(hospital.status)}
                sx={{ fontWeight: 600, borderRadius: 1 }}
              />
            </Box>
          </Box>
        </Box>
        <Box>
          <IconButton onClick={onClose} size="small" sx={{ ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Hospital Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Hospital Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Location
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hospital.address}, {hospital.city}, {hospital.state} {hospital.zipCode}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <PhoneIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Phone
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <Link href={`tel:${hospital.phone}`} underline="hover" color="inherit">
                      {hospital.phone}
                    </Link>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <EmailIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Email
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <Link href={`mailto:${hospital.email}`} underline="hover" color="inherit">
                      {hospital.email}
                    </Link>
                  </Typography>
                </Box>
              </Box>

              {hospital.website && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LanguageIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Website
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <Link href={hospital.website.startsWith('http') ? hospital.website : `https://${hospital.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            color="inherit">
                        {hospital.website}
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Capacity & Stats */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Capacity & Statistics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <PeopleIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Bed Capacity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hospital.beds} beds
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <MedicalServicesIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Doctors
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hospital.doctors} medical professionals
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <StarIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Rating
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hospital.rating} / 5.0
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocalHospitalIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Hospital ID
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hospital.id}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Admin Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Hospital Administrators
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {loading ? (
                  <CircularProgress size={20} thickness={4} />
                ) : (
                  <IconButton size="small" onClick={fetchHospitalAdmins} title="Refresh admins list">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                )}
                <Chip
                  label={`${hospitalAdmins.length || 1} Admin${hospitalAdmins.length > 1 ? 's' : ''}`}
                  size="small"
                  color="primary"
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </Box>

            {loading && hospitalAdmins.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Primary Admin */}
                {hospitalAdmins.find(admin => admin.isPrimary) ? (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 3,
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: { xs: 'center', sm: 'flex-start' },
                      gap: 1,
                      flex: 1
                    }}>
                      <Avatar
                        sx={{
                          width: { xs: 64, sm: 80 },
                          height: { xs: 64, sm: 80 },
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                          color: theme.palette.primary.main,
                        }}
                      >
                        <PersonIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {hospitalAdmins.find(admin => admin.isPrimary)?.name || hospital.adminName || 'No admin assigned'}
                      </Typography>
                      <Chip
                        label="Primary Administrator"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>

                    <Box sx={{ flex: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <EmailIcon color="primary" fontSize="small" sx={{ mt: 0.5 }} />
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                Email
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {hospitalAdmins.find(admin => admin.isPrimary)?.email ? (
                                  <Link href={`mailto:${hospitalAdmins.find(admin => admin.isPrimary)?.email}`} underline="hover" color="inherit">
                                    {hospitalAdmins.find(admin => admin.isPrimary)?.email}
                                  </Link>
                                ) : (
                                  'N/A'
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <PhoneIcon color="primary" fontSize="small" sx={{ mt: 0.5 }} />
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                Phone
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {hospitalAdmins.find(admin => admin.isPrimary)?.phone ? (
                                  <Link href={`tel:${hospitalAdmins.find(admin => admin.isPrimary)?.phone}`} underline="hover" color="inherit">
                                    {hospitalAdmins.find(admin => admin.isPrimary)?.phone}
                                  </Link>
                                ) : (
                                  'N/A'
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 3,
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: { xs: 'center', sm: 'flex-start' },
                      gap: 1,
                      flex: 1
                    }}>
                      <Avatar
                        sx={{
                          width: { xs: 64, sm: 80 },
                          height: { xs: 64, sm: 80 },
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                          color: theme.palette.primary.main,
                        }}
                      >
                        <PersonIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {hospital.adminName || 'No admin assigned'}
                      </Typography>
                      <Chip
                        label="Primary Administrator"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>

                    <Box sx={{ flex: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <EmailIcon color="primary" fontSize="small" sx={{ mt: 0.5 }} />
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                Email
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {hospital.adminEmail ? (
                                  <Link href={`mailto:${hospital.adminEmail}`} underline="hover" color="inherit">
                                    {hospital.adminEmail}
                                  </Link>
                                ) : (
                                  'N/A'
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <PhoneIcon color="primary" fontSize="small" sx={{ mt: 0.5 }} />
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                Phone
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {hospital.adminPhone ? (
                                  <Link href={`tel:${hospital.adminPhone}`} underline="hover" color="inherit">
                                    {hospital.adminPhone}
                                  </Link>
                                ) : (
                                  'N/A'
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                )}

                {/* Additional Admins */}
                {hospitalAdmins.filter(admin => !admin.isPrimary).length > 0 && (
                  <>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
                      Additional Administrators
                    </Typography>
                    <Grid container spacing={2}>
                      {hospitalAdmins.filter(admin => !admin.isPrimary).map((admin, index) => (
                        <Grid item xs={12} md={6} key={admin.id || index}>
                          <Box sx={{
                            display: 'flex',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.secondary.main, 0.05),
                            height: '100%',
                          }}>
                            <Avatar
                              sx={{
                                width: 48,
                                height: 48,
                                mr: 2,
                                bgcolor: alpha(theme.palette.secondary.main, 0.2),
                                color: theme.palette.secondary.main,
                              }}
                            >
                              <PersonIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {admin.name || 'Admin'}
                              </Typography>

                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <EmailIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {admin.email ? (
                                    <Link href={`mailto:${admin.email}`} underline="hover" color="inherit">
                                      {admin.email}
                                    </Link>
                                  ) : (
                                    'N/A'
                                  )}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <PhoneIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                <Typography variant="body2" color="text.secondary">
                                  {admin.phone ? (
                                    <Link href={`tel:${admin.phone}`} underline="hover" color="inherit">
                                      {admin.phone}
                                    </Link>
                                  ) : (
                                    'N/A'
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </>
            )}
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ borderRadius: 2, mr: 2 }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              onEdit(hospital);
              onClose();
            }}
            sx={{
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            Edit Hospital
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default HospitalDetailsDialog;
