import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Box,
  Chip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  LocalHospital as HospitalIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useChat } from '../../../contexts/ChatContext';

const CreateGroupModal = ({ open, onClose }) => {
  const theme = useTheme();
  const { createGroupChat, getHospitalAdmins, loading } = useChat();

  const [groupName, setGroupName] = useState('');
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Fetch hospital admins when modal opens
  useEffect(() => {
    if (open) {
      fetchHospitalAdmins();
      // Reset form
      setGroupName('');
      setSelectedAdmins([]);
      setSearchTerm('');
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

  // Handle admin selection
  const handleAdminSelection = (admin) => {
    setSelectedAdmins(prev => {
      const isSelected = prev.some(a => a._id === admin._id);

      if (isSelected) {
        return prev.filter(a => a._id !== admin._id);
      } else {
        return [...prev, admin];
      }
    });
  };

  // Handle removing a selected admin
  const handleRemoveAdmin = (adminId) => {
    setSelectedAdmins(prev => prev.filter(admin => admin._id !== adminId));
  };

  // Handle creating the group
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedAdmins.length === 0) return;

    try {
      setCreatingGroup(true);
      const userIds = selectedAdmins.map(admin => admin._id);
      await createGroupChat(groupName, userIds);
      setCreatingGroup(false);
      onClose();
    } catch (error) {
      console.error('Error creating group chat:', error);
      setCreatingGroup(false);
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
          Create Group Chat
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect with multiple hospital administrators
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <TextField
          fullWidth
          label="Group Name"
          placeholder="Enter a name for your group"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          variant="outlined"
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GroupIcon />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2
            }
          }}
          sx={{ mb: 2 }}
        />

        {selectedAdmins.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedAdmins.map(admin => (
              <Chip
                key={admin._id}
                avatar={<Avatar src={admin.avatar}>{admin.name.charAt(0)}</Avatar>}
                label={admin.name}
                onDelete={() => handleRemoveAdmin(admin._id)}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        )}

        <TextField
          fullWidth
          placeholder="Search administrators to add..."
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
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {filteredAdmins.map((admin) => {
              const isSelected = selectedAdmins.some(a => a._id === admin._id);

              return (
                <ListItem
                  key={admin._id}
                  button
                  onClick={() => handleAdminSelection(admin)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemAvatar>
                    <Avatar src={admin.avatar} alt={admin.name}>
                      {admin.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={admin.name}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="body2" component="span" color="text.secondary">
                          {admin.email}
                        </Typography>
                        {admin.hospital && (
                          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                            <HospitalIcon sx={{ fontSize: 14, mr: 0.5, color: theme.palette.primary.main }} />
                            <Typography variant="body2" component="span" color="primary.main" fontWeight={500}>
                              {admin.hospital.name}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
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
        <Button
          onClick={handleCreateGroup}
          variant="contained"
          color="primary"
          disabled={!groupName.trim() || selectedAdmins.length === 0 || creatingGroup}
          startIcon={creatingGroup && <CircularProgress size={20} color="inherit" />}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          {creatingGroup ? 'Creating...' : 'Create Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupModal;
