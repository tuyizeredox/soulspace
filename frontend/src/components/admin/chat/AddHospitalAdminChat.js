import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import axios from '../../../utils/axiosConfig';
import { useAuth } from '../../../contexts/AuthContext';
import { useSelector } from 'react-redux';

const AddHospitalAdminChat = ({ open, onClose, onAdminSelected }) => {
  const theme = useTheme();
  const { user: authUser } = useAuth();
  const { user: userAuthUser } = useSelector((state) => state.userAuth);
  const { user: oldAuthUser } = useSelector((state) => state.auth);

  // Use the user from any available auth source
  const user = authUser || userAuthUser || oldAuthUser;

  const [searchTerm, setSearchTerm] = useState('');
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Get token from all possible sources
  const getToken = useCallback(() => {
    const authToken = authUser?.token;
    const userAuthToken = localStorage.getItem('userToken');
    const oldAuthToken = localStorage.getItem('token');
    return authToken || userAuthToken || oldAuthToken;
  }, [authUser]);

  // Fetch hospital admins
  const fetchHospitalAdmins = useCallback(async () => {
    if (!user) {
      console.log('No user found, cannot fetch hospital admins');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      console.log('Fetching hospital admins with token:', !!token);

      // Make sure we have a valid token
      if (!token) {
        console.error('No authentication token available');
        setError('Authentication token missing. Please log in again.');
        return;
      }

      // Set the token in axios defaults as well for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Use the correct endpoint for fetching hospital admins
      const response = await axios.get('/api/chats/admins/hospital', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response && response.data) {
        console.log(`Successfully fetched ${response.data.length} hospital admins`);

        // Validate the data structure
        const validAdmins = response.data.filter(admin => admin && admin._id);

        if (validAdmins.length !== response.data.length) {
          console.warn(`Filtered out ${response.data.length - validAdmins.length} invalid admin entries`);
        }

        // Check for admins without hospital info
        const adminsWithoutHospital = validAdmins.filter(admin => !admin.hospital);
        if (adminsWithoutHospital.length > 0) {
          console.warn(`${adminsWithoutHospital.length} admins are missing hospital information:`,
            adminsWithoutHospital.map(a => ({ id: a._id, name: a.name })));
        }

        // Add a default hospital object if missing
        const adminsWithDefaultHospital = validAdmins.map(admin => {
          if (!admin.hospital) {
            return {
              ...admin,
              hospital: { name: 'Unknown Hospital' }
            };
          }
          return admin;
        });

        setAdmins(adminsWithDefaultHospital);
        setFilteredAdmins(adminsWithDefaultHospital);

        // Log a sample admin for debugging
        if (adminsWithDefaultHospital.length > 0) {
          const sampleAdmin = adminsWithDefaultHospital[0];
          console.log('Sample admin:', {
            id: sampleAdmin._id,
            name: sampleAdmin.name,
            hospital: sampleAdmin.hospital ?
              (typeof sampleAdmin.hospital === 'object' ? sampleAdmin.hospital.name : sampleAdmin.hospital)
              : 'No Hospital'
          });
        }
      } else {
        console.warn('Empty or invalid response when fetching hospital admins:', response);
        setError('No hospital administrators found. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching hospital admins:', error);

      // Provide more specific error messages based on the error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server responded with error:', error.response.status, error.response.data);

        if (error.response.status === 404 && error.response.data.message.includes('hospital')) {
          setError('Could not find your hospital information. Please contact your administrator to ensure your account is properly set up.');
        } else if (error.response.status === 401 || error.response.status === 403) {
          setError('Authentication failed. Please log in again.');
          // Redirect to login after a delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        } else {
          setError(`Failed to load hospital administrators: ${error.response.data.message || error.response.statusText}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setError('Failed to load hospital administrators: No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        setError(`Failed to load hospital administrators: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [user, getToken]);

  // Filter admins based on search term
  useEffect(() => {
    if (!admins.length) {
      setFilteredAdmins([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredAdmins(admins);
      return;
    }

    const searchLower = searchTerm.toLowerCase();

    const filtered = admins.filter(admin => {
      const nameMatch = admin.name && admin.name.toLowerCase().includes(searchLower);
      const emailMatch = admin.email && admin.email.toLowerCase().includes(searchLower);

      let hospitalMatch = false;
      if (admin.hospital) {
        const hospitalName = typeof admin.hospital === 'object'
          ? admin.hospital.name
          : admin.hospital.toString();
        hospitalMatch = hospitalName.toLowerCase().includes(searchLower);
      }

      return nameMatch || emailMatch || hospitalMatch;
    });

    setFilteredAdmins(filtered);
  }, [searchTerm, admins]);

  // Fetch admins when component mounts
  useEffect(() => {
    if (open) {
      fetchHospitalAdmins();
    }
  }, [open, fetchHospitalAdmins]);

  // Handle admin selection
  const handleSelectAdmin = (admin) => {
    setSelectedAdmin(admin);
  };

  // Handle starting a chat with the selected admin
  const handleStartChat = () => {
    if (selectedAdmin && onAdminSelected) {
      onAdminSelected(selectedAdmin);
    }
    handleClose();
  };

  // Handle dialog close
  const handleClose = () => {
    setSearchTerm('');
    setSelectedAdmin(null);
    onClose();
  };

  // Get hospital name - handles different data structures with better fallbacks
  const getHospitalName = (admin) => {
    if (!admin) return 'Unknown Admin';

    // Handle missing hospital data
    if (!admin.hospital) return 'No Hospital';

    // Handle different hospital data structures
    if (typeof admin.hospital === 'object') {
      // Check if hospital object has a name property
      if (admin.hospital.name) {
        return admin.hospital.name;
      }

      // If no name property, check for other identifiers
      if (admin.hospital._id) {
        return `Hospital ID: ${admin.hospital._id}`;
      }

      return 'Unknown Hospital';
    } else if (typeof admin.hospital === 'string') {
      return admin.hospital;
    } else {
      return 'Unknown Hospital';
    }
  };

  // Render hospital admin item
  const renderAdminItem = (admin) => {
    const isSelected = selectedAdmin && selectedAdmin._id === admin._id;
    const hospitalName = getHospitalName(admin);

    return (
      <ListItem
        key={admin._id}
        button
        selected={isSelected}
        onClick={() => handleSelectAdmin(admin)}
        sx={{
          borderRadius: 1,
          mb: 1,
          transition: 'all 0.2s',
          border: `1px solid ${isSelected
            ? alpha(theme.palette.primary.main, 0.5)
            : alpha(theme.palette.divider, 0.5)}`,
          bgcolor: isSelected
            ? alpha(theme.palette.primary.main, 0.1)
            : 'transparent',
          '&:hover': {
            bgcolor: isSelected
              ? alpha(theme.palette.primary.main, 0.15)
              : alpha(theme.palette.action.hover, 0.1)
          }
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: isSelected
                ? theme.palette.primary.main
                : theme.palette.secondary.light
            }}
          >
            {admin.name ? admin.name.charAt(0).toUpperCase() : <PersonIcon />}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Typography variant="subtitle2" fontWeight={500}>
              {admin.name}
              {admin.isPrimaryAdmin && (
                <Chip
                  size="small"
                  label="Primary"
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Typography>
          }
          secondary={
            <>
              <Typography variant="body2" color="text.secondary" noWrap>
                {admin.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <HospitalIcon sx={{ fontSize: '0.875rem', mr: 0.5, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary">
                  {hospitalName}
                </Typography>
              </Box>
            </>
          }
        />

        {isSelected && (
          <CheckIcon color="primary" sx={{ ml: 1 }} />
        )}
      </ListItem>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        Add Hospital Admin to Chat
      </DialogTitle>

      <Box sx={{ px: 3, pb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, email, or hospital..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm('')}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              bgcolor: alpha(theme.palette.common.black, 0.03)
            }
          }}
        />
      </Box>

      <Divider />

      <DialogContent sx={{ pt: 2, minHeight: 300 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error">{error}</Typography>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 2 }}
              onClick={fetchHospitalAdmins}
            >
              Try Again
            </Button>
          </Box>
        ) : filteredAdmins.length > 0 ? (
          <List sx={{ pt: 0 }}>
            {filteredAdmins.map(renderAdminItem)}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {searchTerm
                ? 'No hospital admins found matching your search.'
                : 'No hospital admins available.'}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleStartChat}
          variant="contained"
          disabled={!selectedAdmin}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }}
        >
          Start Chat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddHospitalAdminChat;
