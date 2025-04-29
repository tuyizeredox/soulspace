import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  PersonAdd as PersonAddIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  Medication as MedicationIcon
} from '@mui/icons-material';
import { useChat } from '../../contexts/ChatContext';
import axios from '../../utils/axiosConfig';
import { getAvatarUrl, getInitials } from '../../utils/avatarUtils';

const AddHospitalUserChat = ({ open, onClose }) => {
  const theme = useTheme();
  const { addUserToGroup, createGroupChat } = useChat();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [userType, setUserType] = useState('doctors');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupMode, setGroupMode] = useState(false);

  // Fetch users when modal opens
  useEffect(() => {
    if (open) {
      fetchUsers(userType);
    }
  }, [open, userType]);

  // Filter users based on search term
  useEffect(() => {
    if (!users.length) {
      setFilteredUsers([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('userToken') || localStorage.getItem('token');
  };

  // Fetch users based on type
  const fetchUsers = async (type) => {
    try {
      setLoadingUsers(true);
      const token = getToken();

      let endpoint;
      switch (type) {
        case 'doctors':
          endpoint = '/api/doctors/hospital';
          break;
        case 'patients':
          endpoint = '/api/patients/hospital';
          break;
        case 'pharmacists':
          endpoint = '/api/pharmacists/hospital';
          break;
        case 'nurses':
          endpoint = '/api/nurses/hospital';
          break;
        default:
          endpoint = '/api/doctors/hospital';
      }

      const response = await axios.get(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response && response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }

      setLoadingUsers(false);
    } catch (error) {
      console.error(`Error fetching ${userType}:`, error);
      setLoadingUsers(false);
    }
  };

  // Handle user type change
  const handleUserTypeChange = (event, newValue) => {
    setUserType(newValue);
    setSearchTerm('');
    setSelectedUsers([]);
  };

  // Handle starting a chat with a user
  const handleStartChat = async (user) => {
    if (!user || !user.id) {
      console.error('Invalid user selected');
      return;
    }

    try {
      setAddingUser(true);
      const token = getToken();

      // Create or access a chat with the selected user
      const response = await axios.post('/api/chats',
        { userId: user.id },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (response && response.data) {
        // Store the chat ID in localStorage for the chat page to use
        localStorage.setItem('selectedChatId', response.data._id);

        // Close the modal and refresh the page to show the new chat
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error starting chat with user:', error);
    } finally {
      setAddingUser(false);
    }
  };

  // Toggle user selection for group chat
  const toggleUserSelection = (user) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);

    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Handle creating a group chat
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      return;
    }

    try {
      setCreatingGroup(true);
      const userIds = selectedUsers.map(user => user.id);
      await createGroupChat(groupName, userIds);

      // Close the modal and refresh the page to show the new group
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error creating group chat:', error);
    } finally {
      setCreatingGroup(false);
    }
  };

  // Get icon based on user type
  const getUserTypeIcon = () => {
    switch (userType) {
      case 'doctors':
        return <MedicalIcon />;
      case 'patients':
        return <PersonIcon />;
      case 'pharmacists':
        return <MedicationIcon />;
      case 'nurses':
        return <HospitalIcon />;
      default:
        return <PersonIcon />;
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
      <DialogTitle
        sx={{
          pb: 1,
          pt: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.15)})`,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          mb: 2
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            color: theme.palette.primary.dark,
            mb: 1
          }}
        >
          {groupMode ? 'Create Group Chat' : 'Start New Conversation'}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: alpha(theme.palette.text.primary, 0.7),
            fontSize: '0.95rem'
          }}
        >
          {groupMode
            ? 'Create a group chat with multiple users for team collaboration'
            : 'Connect with doctors, patients, and other hospital staff for direct communication'}
        </Typography>
      </DialogTitle>

      <Box
        sx={{
          px: 3,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Button
          variant={groupMode ? "outlined" : "contained"}
          color="primary"
          onClick={() => setGroupMode(false)}
          sx={{
            mb: 2,
            borderRadius: '20px 0 0 20px',
            px: 3,
            py: 1,
            fontWeight: 500,
            borderColor: theme.palette.primary.main,
            ...(groupMode ? {} : {boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.25)}`})
          }}
        >
          Individual Chat
        </Button>
        <Button
          variant={groupMode ? "contained" : "outlined"}
          color="primary"
          onClick={() => setGroupMode(true)}
          sx={{
            mb: 2,
            borderRadius: '0 20px 20px 0',
            px: 3,
            py: 1,
            fontWeight: 500,
            borderColor: theme.palette.primary.main,
            ...(groupMode ? {boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.25)}`} : {})
          }}
        >
          Group Chat
        </Button>
      </Box>

      {groupMode && (
        <Box
          sx={{
            px: 3,
            mb: 3,
            py: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mb: 1.5, color: theme.palette.primary.dark }}
          >
            Group Details
          </Typography>
          <TextField
            fullWidth
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            variant="outlined"
            placeholder="Enter a name for your group"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'white'
              }
            }}
          />
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Selected Members ({selectedUsers.length})
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              minHeight: '40px',
              p: selectedUsers.length > 0 ? 1 : 0,
              bgcolor: selectedUsers.length > 0 ? 'white' : 'transparent',
              borderRadius: 2,
              border: selectedUsers.length > 0 ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 'none'
            }}
          >
            {selectedUsers.map(user => (
              <Chip
                key={user.id}
                label={user.name}
                onDelete={() => toggleUserSelection(user)}
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.8)
                    }}
                  >
                    {getInitials(user.name)}
                  </Avatar>
                }
                color="primary"
                variant="outlined"
                size="medium"
                sx={{
                  borderRadius: '16px',
                  '& .MuiChip-deleteIcon': {
                    color: theme.palette.primary.main,
                    '&:hover': {
                      color: theme.palette.primary.dark
                    }
                  }
                }}
              />
            ))}
            {selectedUsers.length === 0 && (
              <Typography
                variant="body2"
                sx={{
                  color: alpha(theme.palette.text.secondary, 0.7),
                  fontStyle: 'italic',
                  p: 1
                }}
              >
                Select users from the list below to add to your group
              </Typography>
            )}
          </Box>
        </Box>
      )}

      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          px: 3,
          mb: 2
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{
            mb: 1.5,
            color: theme.palette.text.primary
          }}
        >
          {groupMode ? 'Add Members to Group' : 'Select User to Chat With'}
        </Typography>
        <Tabs
          value={userType}
          onChange={handleUserTypeChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              borderRadius: '20px',
              mr: 1,
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'none',
              transition: 'all 0.2s'
            },
            '& .Mui-selected': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            },
            '& .MuiTabs-indicator': {
              display: 'none'
            }
          }}
        >
          <Tab
            label="Doctors"
            value="doctors"
            icon={<MedicalIcon sx={{ fontSize: '1.2rem' }} />}
            iconPosition="start"
          />
          <Tab
            label="Patients"
            value="patients"
            icon={<PersonIcon sx={{ fontSize: '1.2rem' }} />}
            iconPosition="start"
          />
          <Tab
            label="Pharmacists"
            value="pharmacists"
            icon={<MedicationIcon sx={{ fontSize: '1.2rem' }} />}
            iconPosition="start"
          />
          <Tab
            label="Nurses"
            value="nurses"
            icon={<HospitalIcon sx={{ fontSize: '1.2rem' }} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <Box sx={{ px: 3, pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: alpha(theme.palette.common.black, 0.04),
            borderRadius: 3,
            p: '4px 12px',
            mb: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
            }
          }}
        >
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <SearchIcon color="primary" />
          </IconButton>
          <TextField
            fullWidth
            variant="standard"
            placeholder={`Search ${userType} by name or email...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '1rem',
                py: 0.5
              }
            }}
          />
          {searchTerm && (
            <IconButton
              sx={{ p: '10px' }}
              aria-label="clear"
              onClick={() => setSearchTerm('')}
            >
              <ClearIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <DialogContent sx={{ pt: 0, px: { xs: 2, sm: 3 } }}>
        {loadingUsers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6, flexDirection: 'column' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Loading {userType}...
            </Typography>
          </Box>
        ) : filteredUsers.length > 0 ? (
          <List
            sx={{
              p: 0,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              overflow: 'hidden',
              bgcolor: alpha(theme.palette.background.paper, 0.7)
            }}
          >
            {filteredUsers.map((user) => (
              <ListItem
                key={user.id}
                sx={{
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  py: 1.5,
                  px: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`
                  },
                  ...(groupMode && selectedUsers.some(u => u.id === user.id) ? {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderLeft: `4px solid ${theme.palette.primary.main}`
                  } : {
                    borderLeft: `4px solid transparent`
                  })
                }}
                onClick={groupMode ? () => toggleUserSelection(user) : undefined}
              >
                <ListItemAvatar>
                  <Avatar
                    src={user.profileImage}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.8),
                      width: 48,
                      height: 48,
                      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`
                    }}
                  >
                    {getInitials(user.name)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ color: theme.palette.text.primary }}
                    >
                      {user.name}
                      {userType === 'doctors' && user.specialization && (
                        <Chip
                          label={user.specialization}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: alpha(theme.palette.text.secondary, 0.9),
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        {userType === 'doctors' ? (
                          <MedicalIcon fontSize="small" color="primary" sx={{ opacity: 0.7, fontSize: '0.9rem' }} />
                        ) : userType === 'patients' ? (
                          <PersonIcon fontSize="small" color="info" sx={{ opacity: 0.7, fontSize: '0.9rem' }} />
                        ) : userType === 'pharmacists' ? (
                          <MedicationIcon fontSize="small" color="success" sx={{ opacity: 0.7, fontSize: '0.9rem' }} />
                        ) : (
                          <HospitalIcon fontSize="small" color="secondary" sx={{ opacity: 0.7, fontSize: '0.9rem' }} />
                        )}
                        {user.email}
                      </Typography>
                    </Box>
                  }
                  sx={{ ml: 1 }}
                />
                {!groupMode && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleStartChat(user)}
                    disabled={addingUser}
                    startIcon={addingUser ? <CircularProgress size={16} /> : <PersonAddIcon />}
                    sx={{
                      borderRadius: 6,
                      textTransform: 'none',
                      px: 2,
                      py: 1,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                      '&:hover': {
                        boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Chat
                  </Button>
                )}
                {groupMode && selectedUsers.some(u => u.id === user.id) && (
                  <Chip
                    label="Selected"
                    color="primary"
                    size="small"
                    sx={{
                      borderRadius: 6,
                      fontWeight: 500
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              borderRadius: 2,
              border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`
            }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              {searchTerm
                ? `No ${userType} found matching your search`
                : `No ${userType} available`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? 'Try a different search term or select another category'
                : 'Please check back later or select another category'}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.5)
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            px: 3,
            py: 1,
            fontWeight: 500,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          Cancel
        </Button>

        {groupMode && (
          <Button
            onClick={handleCreateGroup}
            variant="contained"
            color="primary"
            disabled={creatingGroup || !groupName.trim() || selectedUsers.length === 0}
            startIcon={creatingGroup ? <CircularProgress size={20} /> : null}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 3,
              py: 1,
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
              },
              '&.Mui-disabled': {
                bgcolor: alpha(theme.palette.primary.main, 0.4),
                color: 'white'
              }
            }}
          >
            {creatingGroup ? 'Creating...' : `Create Group (${selectedUsers.length} members)`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddHospitalUserChat;
