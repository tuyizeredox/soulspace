import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Box,
  Divider,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { useChat } from '../../../contexts/ChatContext';

const NewChatModal = ({ open, onClose }) => {
  const theme = useTheme();
  const { accessChat, getHospitalAdmins } = useChat();

  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Fetch hospital admins when modal opens
  useEffect(() => {
    if (open) {
      fetchHospitalAdmins();
    }
  }, [open]);

  // Filter admins based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAdmins(admins);
      return;
    }

    const filtered = admins.filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.hospital?.name && admin.hospital.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredAdmins(filtered);
  }, [searchTerm, admins]);

  // Fetch hospital admins
  const fetchHospitalAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const data = await getHospitalAdmins();
      setAdmins(data);
      setFilteredAdmins(data);
      setLoadingAdmins(false);
    } catch (error) {
      console.error('Error fetching hospital admins:', error);
      setLoadingAdmins(false);
    }
  };

  // Handle starting a chat with an admin
  const handleStartChat = async (admin) => {
    if (!admin || !admin._id) {
      console.error('Invalid admin data:', admin);
      return;
    }

    console.log('Starting chat with admin:', admin.name, 'ID:', admin._id);
    try {
      // Store the admin info for debugging
      console.log('Admin details:', {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        hospital: admin.hospital ? admin.hospital.name : 'No hospital',
        isPrimaryAdmin: admin.isPrimaryAdmin
      });

      const chatData = await accessChat(admin._id);

      if (chatData) {
        console.log('Chat created/accessed successfully:', chatData);
        onClose();
      } else {
        console.error('Failed to create/access chat with admin:', admin.name);
      }
    } catch (error) {
      console.error('Error starting chat with admin:', error);
    }
  };

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
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Start New Chat
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect with hospital administrators
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, or hospital..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              bgcolor: alpha(theme.palette.common.black, 0.03)
            }
          }}
          sx={{ mb: 2 }}
        />

        {loadingAdmins ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredAdmins.length > 0 ? (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredAdmins.map((admin) => (
              <ListItem
                key={admin._id || `admin-${Math.random()}`}
                onClick={() => handleStartChat(admin)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={admin.avatar}
                    alt={admin.name || 'Admin'}
                    sx={{
                      bgcolor: admin.isPrimaryAdmin
                        ? theme.palette.primary.main
                        : theme.palette.secondary.main
                    }}
                  >
                    {admin.name ? admin.name.charAt(0) : 'A'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2" component="span">
                        {admin.name || 'Unknown Admin'}
                      </Typography>
                      {admin.isPrimaryAdmin && (
                        <Chip
                          label="Primary"
                          size="small"
                          color="secondary"
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" component="span" color="text.secondary" noWrap>
                        {admin.email || 'No email provided'}
                      </Typography>

                      {admin.hospital ? (
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mt: 0.5,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          borderRadius: 1,
                          py: 0.5,
                          px: 1
                        }}>
                          <HospitalIcon sx={{ fontSize: 14, mr: 0.5, color: theme.palette.primary.main }} />
                          <Typography
                            variant="body2"
                            component="span"
                            color="primary.main"
                            fontWeight={600}
                            sx={{ mr: 0.5 }}
                          >
                            {admin.hospital.name || 'Unknown Hospital'}
                          </Typography>
                          {admin.hospital.city && (
                            <Typography variant="caption" color="text.secondary">
                              ({admin.hospital.city})
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mt: 0.5,
                          bgcolor: alpha(theme.palette.warning.main, 0.08),
                          borderRadius: 1,
                          py: 0.5,
                          px: 1
                        }}>
                          <HospitalIcon sx={{ fontSize: 14, mr: 0.5, color: theme.palette.warning.main }} />
                          <Typography variant="body2" component="span" color="warning.main" fontWeight={500}>
                            Hospital Info Missing
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {searchTerm ? 'No administrators found matching your search' : 'No hospital administrators available'}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewChatModal;
