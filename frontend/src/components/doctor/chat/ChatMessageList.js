import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Paper,
  useTheme,
  alpha,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  GraphicEq as WaveformIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as GenericFileIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const ChatMessageList = ({ messages, currentUser, loading, messageStatus, messagesEndRef }) => {
  const theme = useTheme();
  const audioRefs = useRef({});
  const [playingAudio, setPlayingAudio] = React.useState(null);
  
  // Handle audio playback
  const toggleAudioPlayback = (audioId) => {
    const audioElement = audioRefs.current[audioId];
    
    if (!audioElement) return;
    
    if (playingAudio === audioId) {
      // Currently playing this audio, pause it
      audioElement.pause();
      setPlayingAudio(null);
    } else {
      // Pause any currently playing audio
      if (playingAudio && audioRefs.current[playingAudio]) {
        audioRefs.current[playingAudio].pause();
      }
      
      // Play the new audio
      audioElement.play();
      setPlayingAudio(audioId);
      
      // Add ended event listener
      audioElement.onended = () => {
        setPlayingAudio(null);
      };
    }
  };
  
  // Format timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  // Determine file icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <GenericFileIcon />;
    
    if (fileType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (fileType === 'application/pdf') {
      return <PdfIcon />;
    } else if (fileType.startsWith('audio/')) {
      return <WaveformIcon />;
    } else {
      return <GenericFileIcon />;
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };
  
  // Render a message attachment
  const renderAttachment = (attachment, messageId) => {
    const { type, url, name, size } = attachment;
    
    // Handle image attachments
    if (type && type.startsWith('image/')) {
      return (
        <Box
          sx={{
            mt: 1,
            maxWidth: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            '&:hover .download-button': {
              opacity: 1,
            },
          }}
        >
          <img
            src={url.startsWith('blob:') ? url : `http://localhost:5000${url}`}
            alt={name || 'Image attachment'}
            style={{
              maxWidth: '100%',
              maxHeight: 200,
              objectFit: 'contain',
              borderRadius: 8,
            }}
          />
          <Tooltip title="Download">
            <IconButton
              className="download-button"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                opacity: 0,
                transition: 'opacity 0.2s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                },
              }}
              onClick={() => window.open(url.startsWith('blob:') ? url : `http://localhost:5000${url}`, '_blank')}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }
    
    // Handle audio attachments
    if (type && type.startsWith('audio/')) {
      const audioId = `audio-${messageId}-${name}`;
      
      return (
        <Box
          sx={{
            mt: 1,
            display: 'flex',
            alignItems: 'center',
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            color="primary"
            onClick={() => toggleAudioPlayback(audioId)}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            {playingAudio === audioId ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.divider, 0.2),
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: playingAudio === audioId ? '50%' : '0%',
                  bgcolor: theme.palette.primary.main,
                  transition: 'width 0.1s linear',
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {name || 'Voice message'} ({formatFileSize(size || 0)})
            </Typography>
          </Box>
          
          <audio
            ref={(element) => {
              if (element) {
                audioRefs.current[audioId] = element;
              }
            }}
            src={url.startsWith('blob:') ? url : `http://localhost:5000${url}`}
            style={{ display: 'none' }}
          />
        </Box>
      );
    }
    
    // Handle other file types
    return (
      <Box
        sx={{
          mt: 1,
          display: 'flex',
          alignItems: 'center',
          p: 1,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.6),
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          }}
        >
          {getFileIcon(type)}
        </Box>
        
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Typography
            variant="body2"
            noWrap
            title={name}
          >
            {name || 'File attachment'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(size || 0)}
          </Typography>
        </Box>
        
        <Tooltip title="Download">
          <IconButton
            size="small"
            onClick={() => window.open(url.startsWith('blob:') ? url : `http://localhost:5000${url}`, '_blank')}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflow: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        bgcolor: alpha(theme.palette.background.default, 0.5),
      }}
    >
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 2,
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            {messageStatus || 'Loading messages...'}
          </Typography>
        </Box>
      ) : messages.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No messages yet. Start the conversation!
          </Typography>
        </Box>
      ) : (
        messages.map((message, index) => {
          const isOwn = message.sender?._id === currentUser?._id;
          const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender?._id !== message.sender?._id);
          
          return (
            <Box
              key={message._id}
              sx={{
                display: 'flex',
                flexDirection: isOwn ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 1,
                maxWidth: '85%',
                alignSelf: isOwn ? 'flex-end' : 'flex-start',
                opacity: message.isTemp ? 0.7 : 1,
              }}
            >
              {!isOwn && showAvatar ? (
                <Avatar
                  src={message.sender?.avatar}
                  alt={message.sender?.name}
                  sx={{ width: 32, height: 32 }}
                >
                  {message.sender?.name?.charAt(0)}
                </Avatar>
              ) : !isOwn ? (
                <Box sx={{ width: 32 }} />
              ) : null}
              
              <Box
                sx={{
                  maxWidth: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: isOwn
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    bgcolor: isOwn
                      ? theme.palette.primary.main
                      : theme.palette.background.paper,
                    color: isOwn ? 'white' : 'text.primary',
                    boxShadow: theme.shadows[1],
                  }}
                >
                  {message.content && (
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {message.content}
                    </Typography>
                  )}
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <Box sx={{ mt: message.content ? 1 : 0 }}>
                      {message.attachments.map((attachment, i) => (
                        <Box key={i}>
                          {renderAttachment(attachment, message._id)}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
                
                <Typography
                  variant="caption"
                  color={isOwn ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
                  sx={{
                    alignSelf: isOwn ? 'flex-end' : 'flex-start',
                    mt: 0.5,
                    mx: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {formatMessageTime(message.timestamp)}
                  {message.isTemp && ' • Sending...'}
                </Typography>
              </Box>
            </Box>
          );
        })
      )}
      
      {messageStatus && !loading && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            alignSelf: 'center',
            py: 1,
            px: 2,
            borderRadius: 10,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            mt: 1,
          }}
        >
          {messageStatus}
        </Typography>
      )}
      
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default ChatMessageList;
