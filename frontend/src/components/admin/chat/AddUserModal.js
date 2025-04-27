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
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  LocalHospital as HospitalIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useChat } from '../../../contexts/ChatContext';

const AddUserModal = ({ open, onClose, chat }) => {
  const theme = useTheme();
  const { addUserToGroup, getHospitalAdmins, loading } = useChat();
  
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  
  // Fetch hospital admins when modal opens
  useEffect(() => {
    if (open) {
      fetchHospitalAdmins();
    }
  }, [open]);
  
  // Filter admins based on search term and exclude existing participants
  useEffect(() => {
    if (!admins.length || !chat) return;
    
    // Filter out admins who are already in the group
    const availableAdmins = admins.filter(admin => 
      !chat.participants.some(participant => participant._id === admin._id)
    );
    
    if (!searchTerm.trim()) {
      setFilteredAdmins(availableAdmins);
      return;
    }
    
    const filtered = availableAdmins.filter(admin => 
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.hospital?.name && admin.hospital.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredAdmins(filtered);
  }, [searchTerm, admins, chat]);
  
  // Fetch hospital admins
  const fetchHospitalAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const data = await getHospitalAdmins();
      setAdmins(data);
      setLoadingAdmins(false);
    } catch (error) {
      console.error('Error fetching hospital admins:', error);
      setLoadingAdmins(false);
    }
  };
  
  // Handle adding a user to the group
  const handleAddUser = async (userId) => {
    if (!chat) return;
    
    try {
      setAddingUser(true);
      await addUserToGroup(chat._id, userId);
      setAddingUser(false);
      onClose();
    } catch (error) {
      console.error('Error adding user to group:', error);
      setAddingUser(false);
    }
  };
  
  if (!chat) return null;
  
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
          Add User to Group
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add hospital administrators to "{chat.groupName}"
        </Typography>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 2 }}>
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
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredAdmins.map((admin) => (
              <ListItem
                key={admin._id}
                button
                onClick={() => handleAddUser(admin._id)}
                disabled={addingUser}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar src={admin.profilePicture} alt={admin.name}>
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
                <IconButton
                  color="primary"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2)
                    }
                  }}
                >
                  <PersonAddIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {searchTerm
                ? 'No administrators found matching your search'
                : 'No available administrators to add'}
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

export default AddUserModal;
