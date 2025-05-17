import React, { memo } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  ArrowDownward as ArrowDownwardIcon,
  WifiOff as WifiOffIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as GenericFileIcon
} from '@mui/icons-material';

// Memoized message item component for better performance
const MessageItem = memo(({ 
  msg, 
  isCurrentUser, 
  isFirstInGroup, 
  isLastInGroup, 
  formatTime 
}) => {
  const theme = useTheme();
  
  // Format timestamp
  const messageTime = formatTime(msg.timestamp || msg.createdAt);
  
  // Determine if message is a system message
  const isSystemMessage = msg.isSystemMessage || msg.isWelcomeMessage;
  
  // Determine if message is a file
  const isFile = msg.fileUrl || (msg.content && msg.content.startsWith('file:'));
  
  // Get file details if it's a file message
  let fileDetails = null;
  if (isFile) {
    const fileUrl = msg.fileUrl || msg.content.replace('file:', '');
    const fileName = fileUrl.split('/').pop();
    const fileExt = fileName.split('.').pop().toLowerCase();
    
    fileDetails = {
      url: fileUrl,
      name: fileName,
      type: fileExt
    };
  }
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
        mb: 1,
        maxWidth: '100%'
      }}
    >
      {/* Sender name for first message in group */}
      {!isCurrentUser && isFirstInGroup && !isSystemMessage && (
        <Typography
          variant="caption"
          sx={{
            ml: 7,
            mb: 0.5,
            color: theme.palette.text.secondary
          }}
        >
          {msg.sender?.name || 'Doctor'}
        </Typography>
      )}
      
      {/* Message bubble */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          mb: 0.5
        }}
      >
        {/* Avatar for first message in group from others */}
        {!isCurrentUser && isFirstInGroup && !isSystemMessage && (
          <Avatar
            src={msg.sender?.avatar || '/assets/images/doctor-avatar.png'}
            alt={msg.sender?.name || 'Doctor'}
            sx={{
              width: 32,
              height: 32,
              mr: 1,
              bgcolor: theme.palette.primary.main
            }}
          />
        )}
        
        {/* Spacer to align messages when no avatar */}
        {!isCurrentUser && !isFirstInGroup && !isSystemMessage && (
          <Box sx={{ width: 32, mr: 1 }} />
        )}
        
        {/* System message */}
        {isSystemMessage ? (
          <Paper
            elevation={0}
            sx={{
              py: 1,
              px: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.info.light, 0.1),
              maxWidth: '80%',
              textAlign: 'center',
              mx: 'auto'
            }}
          >
            <Typography variant="body2" color="textSecondary">
              {msg.content}
            </Typography>
          </Paper>
        ) : (
          /* Regular message bubble */
          <Paper
            elevation={0}
            sx={{
              py: 1,
              px: 2,
              borderRadius: isCurrentUser 
                ? '20px 20px 4px 20px'
                : '20px 20px 20px 4px',
              backgroundColor: isCurrentUser
                ? theme.palette.primary.main
                : alpha(theme.palette.background.paper, 0.8),
              color: isCurrentUser
                ? theme.palette.primary.contrastText
                : theme.palette.text.primary,
              maxWidth: {
                xs: '80%',
                sm: '70%',
                md: '60%'
              },
              position: 'relative',
              ...(msg.sending && {
                opacity: 0.7
              }),
              ...(msg.failed && {
                borderColor: theme.palette.error.main,
                borderStyle: 'solid',
                borderWidth: 1
              })
            }}
          >
            {/* File content */}
            {isFile && fileDetails && (
              <Box sx={{ mb: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1
                  }}
                >
                  {/* File icon based on type */}
                  {['jpg', 'jpeg', 'png', 'gif'].includes(fileDetails.type) ? (
                    <ImageIcon color="action" />
                  ) : fileDetails.type === 'pdf' ? (
                    <PdfIcon color="error" />
                  ) : (
                    <GenericFileIcon color="primary" />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 1,
                      color: isCurrentUser
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                      wordBreak: 'break-all'
                    }}
                  >
                    {fileDetails.name}
                  </Typography>
                </Box>
                
                {/* Preview for images */}
                {['jpg', 'jpeg', 'png', 'gif'].includes(fileDetails.type) && (
                  <Box
                    component="img"
                    src={fileDetails.url}
                    alt={fileDetails.name}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      borderRadius: 1,
                      mb: 1
                    }}
                    loading="lazy" // Add lazy loading for images
                  />
                )}
                
                {/* Download button */}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ArrowDownwardIcon />}
                  onClick={() => window.open(fileDetails.url, '_blank')}
                  sx={{
                    borderColor: isCurrentUser
                      ? alpha(theme.palette.primary.contrastText, 0.5)
                      : theme.palette.primary.main,
                    color: isCurrentUser
                      ? theme.palette.primary.contrastText
                      : theme.palette.primary.main,
                    '&:hover': {
                      borderColor: isCurrentUser
                        ? theme.palette.primary.contrastText
                        : theme.palette.primary.dark,
                      backgroundColor: isCurrentUser
                        ? alpha(theme.palette.primary.contrastText, 0.1)
                        : alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  Download
                </Button>
              </Box>
            )}
            
            {/* Regular text message */}
            {!isFile && (
              <Typography
                variant="body1"
                sx={{
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.content}
              </Typography>
            )}
            
            {/* Time and status */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                mt: 0.5
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  color: isCurrentUser
                    ? alpha(theme.palette.primary.contrastText, 0.7)
                    : theme.palette.text.secondary,
                  ml: 0.5
                }}
              >
                {messageTime}
              </Typography>
              
              {/* Read status for current user's messages */}
              {isCurrentUser && (
                msg.read ? (
                  <DoneAllIcon
                    sx={{
                      ml: 0.5,
                      fontSize: '0.9rem',
                      color: alpha(theme.palette.primary.contrastText, 0.7)
                    }}
                  />
                ) : (
                  <DoneIcon
                    sx={{
                      ml: 0.5,
                      fontSize: '0.9rem',
                      color: alpha(theme.palette.primary.contrastText, 0.7)
                    }}
                  />
                )
              )}
            </Box>
            
            {/* Error indicator */}
            {msg.failed && (
              <Tooltip title="Failed to send. Will retry automatically.">
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.error.dark
                    },
                    width: 20,
                    height: 20
                  }}
                >
                  <WifiOffIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  // Only re-render if the message content or read status changes
  return (
    prevProps.msg._id === nextProps.msg._id &&
    prevProps.msg.content === nextProps.msg.content &&
    prevProps.msg.read === nextProps.msg.read &&
    prevProps.msg.failed === nextProps.msg.failed &&
    prevProps.isCurrentUser === nextProps.isCurrentUser &&
    prevProps.isFirstInGroup === nextProps.isFirstInGroup &&
    prevProps.isLastInGroup === nextProps.isLastInGroup
  );
});

export default MessageItem;
