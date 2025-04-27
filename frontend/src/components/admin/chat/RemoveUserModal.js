import React, { useState } from 'react';
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
  CircularProgress,
  Box,
  Divider,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  PersonRemove as PersonRemoveIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { useChat } from '../../../contexts/ChatContext';
import { useAuth } from '../../../contexts/AuthContext';

const RemoveUserModal = ({ open, onClose, chat }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { removeUserFromGroup } = useChat();
  
  const [removingUser, setRemovingUser] = useState(false);
  
  // Handle removing a user from the group
  const handleRemoveUser = async (userId) => {
    if (!chat) return;
    
    try {
      setRemovingUser(true);
      await removeUserFromGroup(chat._id, userId);
      setRemovingUser(false);
      onClose();
    } catch (error) {
      console.error('Error removing user from group:', error);
      setRemovingUser(false);
    }
  };
  
  if (!chat) return null;
  
  // Filter out the group admin if current user is not super admin
  const participants = chat.participants.filter(participant => {
    if (user?.role === 'super_admin') {
      return true;
    }
    return participant._id !== chat.groupAdmin?._id;
  });
  
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
          Remove User from Group
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Remove members from "{chat.groupName}"
        </Typography>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 2 }}>
        {participants.length > 0 ? (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {participants.map((participant) => (
              <ListItem
                key={participant._id}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.05)
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar src={participant.profilePicture} alt={participant.name}>
                    {participant.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={participant.name}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="body2" component="span" color="text.secondary">
                        {participant.email}
                      </Typography>
                      {participant.hospital && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                          <HospitalIcon sx={{ fontSize: 14, mr: 0.5, color: theme.palette.primary.main }} />
                          <Typography variant="body2" component="span" color="primary.main" fontWeight={500}>
                            {participant.hospital.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveUser(participant._id)}
                  disabled={removingUser}
                  sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.2)
                    }
                  }}
                >
                  {removingUser ? <CircularProgress size={24} color="error" /> : <PersonRemoveIcon />}
                </IconButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No users available to remove
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

export default RemoveUserModal;
