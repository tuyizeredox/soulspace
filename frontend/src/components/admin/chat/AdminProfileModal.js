import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Divider,
  Grid,
  Paper,
  Chip,
  IconButton,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocalHospital as HospitalIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from '../../../utils/axios';
import { useAuth } from '../../../contexts/AuthContext';
import { getAvatarUrl, getInitials } from '../../../utils/avatarUtils';

const AdminProfileModal = ({ open, onClose, admin }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState(null);

  // Get token from user object
  const token = user?.token || localStorage.getItem('token') || localStorage.getItem('userToken');

  useEffect(() => {
    if (open && admin) {
      setAdminData(admin);

      // If admin doesn't have hospital info, try to fetch it
      if (!admin.hospital && admin._id) {
        fetchAdminDetails(admin._id);
      }
    }
  }, [open, admin]);

  const fetchAdminDetails = async (adminId) => {
    try {
      setLoading(true);
      setError(null);

      // Make sure we're using the correct ID format
      // MongoDB ObjectId is typically stored as a string in the format: 680921233cd3517d151b195a
      // Remove any non-alphanumeric characters to ensure clean ID
      const cleanAdminId = adminId.toString().replace(/[^a-zA-Z0-9]/g, '');

      console.log(`Fetching details for admin ID: ${cleanAdminId}`);

      // Configure headers with auth token
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      // Fetch detailed admin info including hospital
      const response = await axios.get(`/api/users/${cleanAdminId}`, config);

      if (response.data) {
        console.log('Successfully fetched admin details:', response.data);
        setAdminData({
          ...admin,
          ...response.data,
          // Keep the original admin data but add any new fields
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching admin details:', err);
      setError('Could not load complete admin information');
      setLoading(false);
    }
  };

  if (!admin) return null;

  // Use the enhanced adminData if available, otherwise use the original admin
  const displayAdmin = adminData || admin;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 24
        }
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 0, pb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={getAvatarUrl(displayAdmin)}
            alt={displayAdmin.name}
            sx={{ width: 120, height: 120, mb: 2, boxShadow: 3, bgcolor: theme.palette.primary.main }}
            slotProps={{
              img: {
                onError: (e) => {
                  console.error('AdminProfileModal: Error loading avatar image:', e.target.src);
                  // Hide the image and show initials instead
                  e.target.style.display = 'none';
                }
              }
            }}
          >
            {getInitials(displayAdmin.name)}
          </Avatar>

          <Typography variant="h5" fontWeight={600} gutterBottom>
            {displayAdmin.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Chip
              label={displayAdmin.role === 'hospital_admin' ? 'Hospital Admin' : displayAdmin.role}
              color="primary"
              sx={{ mr: 1 }}
            />
            {displayAdmin.isPrimaryAdmin ? (
              <Chip
                label="Primary Admin"
                color="secondary"
              />
            ) : (
              <Chip
                label="Secondary Admin"
                color="default"
                variant="outlined"
              />
            )}
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Loading additional information...
              </Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'error.main' }}>
              <InfoIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Hospital Information
            </Typography>

            {displayAdmin.hospital ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HospitalIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {displayAdmin.hospital.name}
                  </Typography>
                </Box>

                {displayAdmin.hospital.city && displayAdmin.hospital.state && (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 4 }}>
                    <LocationIcon sx={{ color: theme.palette.text.secondary, fontSize: 18, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {displayAdmin.hospital.city}, {displayAdmin.hospital.state}
                    </Typography>
                  </Box>
                )}

                {displayAdmin.isPrimaryAdmin && (
                  <Box sx={{ mt: 2, p: 1, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 1 }}>
                    <Typography variant="body2" color="secondary.main" fontWeight={500}>
                      Primary Administrator
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      This user is the primary administrator for this hospital and has full management privileges.
                    </Typography>
                  </Box>
                )}
              </Paper>
            ) : loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HospitalIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="warning.main">
                    Hospital Information Unavailable
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 1 }}>
                  The hospital information for this administrator could not be retrieved. All hospital admins should be associated with a hospital.
                </Typography>

                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ mt: 2, ml: 4 }}
                  onClick={() => fetchAdminDetails(displayAdmin._id)}
                  disabled={loading}
                >
                  Retry Loading Hospital Info
                </Button>
              </Paper>
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Contact Information
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 20 }} />
              <Typography variant="body1">
                {displayAdmin.email}
              </Typography>
            </Box>

            {displayAdmin.phone ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 20 }} />
                <Typography variant="body1">
                  {displayAdmin.phone}
                </Typography>
              </Box>
            ) : displayAdmin.profile?.phone ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 20 }} />
                <Typography variant="body1">
                  {displayAdmin.profile.phone}
                </Typography>
              </Box>
            ) : null}

            {displayAdmin.hospital && (
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Hospital Contact
                </Typography>

                {displayAdmin.hospital.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">
                      {displayAdmin.hospital.phone}
                    </Typography>
                  </Box>
                )}

                {displayAdmin.hospital.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">
                      {displayAdmin.hospital.email}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminProfileModal;
