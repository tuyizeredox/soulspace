import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Box,
  Divider,
  useTheme
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useChat } from '../../../contexts/ChatContext';

const EditGroupModal = ({ open, onClose, chat }) => {
  const theme = useTheme();
  const { renameGroupChat, loading } = useChat();
  
  const [groupName, setGroupName] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Set initial group name when modal opens
  useEffect(() => {
    if (open && chat) {
      setGroupName(chat.groupName || '');
    }
  }, [open, chat]);
  
  // Handle renaming the group
  const handleRenameGroup = async () => {
    if (!groupName.trim() || !chat) return;
    
    try {
      setUpdating(true);
      await renameGroupChat(chat._id, groupName);
      setUpdating(false);
      onClose();
    } catch (error) {
      console.error('Error renaming group chat:', error);
      setUpdating(false);
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
          Edit Group
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update group information
        </Typography>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          fullWidth
          label="Group Name"
          placeholder="Enter a new name for your group"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          variant="outlined"
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <EditIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
            ),
            sx: {
              borderRadius: 2
            }
          }}
        />
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
          onClick={handleRenameGroup}
          variant="contained"
          color="primary"
          disabled={!groupName.trim() || groupName === chat.groupName || updating}
          startIcon={updating && <CircularProgress size={20} color="inherit" />}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          {updating ? 'Updating...' : 'Update Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditGroupModal;
