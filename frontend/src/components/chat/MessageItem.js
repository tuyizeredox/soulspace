import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  useTheme,
  alpha,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon
} from '@mui/icons-material';

const MessageItem = ({ 
  message, 
  isUser, 
  senderAvatar, 
  senderName,
  showSender = true
}) => {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [audioElement, setAudioElement] = React.useState(null);
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get file icon based on type
  const getFileIcon = (filename) => {
    if (!filename) return <FileIcon />;
    
    const extension = filename.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return <ImageIcon />;
    } else if (['pdf'].includes(extension)) {
      return <PdfIcon />;
    } else {
      return <FileIcon />;
    }
  };
  
  // Handle audio playback
  const toggleAudioPlayback = (audioUrl) => {
    if (!audioElement) {
      const audio = new Audio(audioUrl);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };
  
  // Clean up audio on unmount
  React.useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);
  
  // Render message content based on type
  const renderMessageContent = () => {
    // For file attachments
    if (message.file) {
      // For image files that can be displayed
      if (message.file.contentType && message.file.contentType.startsWith('image/')) {
        return (
          <Box>
            {message.content && (
              <Typography variant="body1" mb={1}>{message.content}</Typography>
            )}
            <Box 
              component="img"
              src={message.file.url || `/api/files/${message.file.filename}`}
              alt="Attached image"
              sx={{ 
                maxWidth: '100%', 
                maxHeight: '200px',
                borderRadius: 1,
                mb: 1
              }}
            />
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {message.file.originalname || 'Image'}
              </Typography>
              <Tooltip title="Download">
                <IconButton 
                  size="small"
                  href={message.file.url || `/api/files/${message.file.filename}`}
                  download
                  target="_blank"
                  sx={{ color: isUser ? 'white' : 'primary.main', opacity: 0.7 }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        );
      }
      
      // For audio files
      if (message.file.contentType && message.file.contentType.startsWith('audio/')) {
        return (
          <Box>
            {message.content && (
              <Typography variant="body1" mb={1}>{message.content}</Typography>
            )}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                p: 1,
                borderRadius: 1,
                bgcolor: alpha(isUser ? 'white' : theme.palette.primary.main, 0.1)
              }}
            >
              <IconButton 
                size="small" 
                onClick={() => toggleAudioPlayback(message.file.url || `/api/files/${message.file.filename}`)}
                sx={{ color: isUser ? 'white' : 'primary.main' }}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <Typography variant="body2" ml={1} sx={{ flexGrow: 1 }}>
                {message.file.originalname || 'Voice message'}
              </Typography>
              <Tooltip title="Download">
                <IconButton 
                  size="small"
                  href={message.file.url || `/api/files/${message.file.filename}`}
                  download
                  target="_blank"
                  sx={{ color: isUser ? 'white' : 'primary.main', opacity: 0.7 }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        );
      }
      
      // For other file types
      return (
        <Box>
          {message.content && (
            <Typography variant="body1" mb={1}>{message.content}</Typography>
          )}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(isUser ? 'white' : theme.palette.primary.main, 0.1)
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getFileIcon(message.file.originalname)}
              <Typography variant="body2" ml={1} sx={{ wordBreak: 'break-all' }}>
                {message.file.originalname || 'Attachment'}
              </Typography>
            </Box>
            <Tooltip title="Download">
              <IconButton 
                size="small"
                href={message.file.url || `/api/files/${message.file.filename}`}
                download
                target="_blank"
                sx={{ color: isUser ? 'white' : 'primary.main', opacity: 0.7 }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      );
    }
    
    // For regular text messages
    return <Typography variant="body1">{message.content}</Typography>;
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      {!isUser && showSender && (
        <Avatar 
          src={senderAvatar}
          sx={{ mr: 1, mt: 1 }}
        >
          {senderName?.charAt(0) || 'U'}
        </Avatar>
      )}
      <Box
        sx={{
          maxWidth: '70%',
          p: 2,
          borderRadius: 2,
          bgcolor: isUser 
            ? alpha(theme.palette.primary.main, 0.8)
            : theme.palette.background.paper,
          color: isUser ? 'white' : 'inherit',
          boxShadow: 1
        }}
      >
        {renderMessageContent()}
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            textAlign: 'right',
            mt: 0.5,
            opacity: 0.7
          }}
        >
          {formatTime(message.timestamp)}
        </Typography>
      </Box>
    </Box>
  );
};

export default MessageItem;
