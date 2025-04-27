import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
} from '@mui/material';
import {
  VideoLibrary,
  Home,
  HelpCenter,
  ArrowBack,
  AccessTime,
  Visibility,
  ThumbUp,
  ThumbUpOutlined,
  Bookmark,
  BookmarkBorder,
  Share,
  Download,
  ContentCopy,
  Check,
  PlayArrow,
  PlayCircleOutline,
  VideoCall,
  School,
  Description,
  Comment,
  Info,
  OndemandVideo,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

// Sample video data (in a real app, this would come from an API)
const videoData = {
  id: 1,
  title: "Getting Started with SoulSpace",
  description: "A complete walkthrough of the SoulSpace platform and its features. Learn how to navigate the dashboard, set up your profile, connect wearable devices, and make the most of the platform's health monitoring capabilities.",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  thumbnail: "/images/tutorials/getting-started.jpg",
  duration: "8:45",
  views: 12500,
  likes: 843,
  category: "Getting Started",
  instructor: {
    name: "Dr. Sarah Johnson",
    title: "Chief Product Officer",
    avatar: "/images/avatars/instructor1.jpg"
  },
  publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
  lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
  tags: ["getting started", "dashboard", "profile setup", "navigation", "beginners"],
  chapters: [
    {
      title: "Introduction to SoulSpace",
      timestamp: "0:00",
      description: "Overview of the SoulSpace platform and its benefits"
    },
    {
      title: "Setting Up Your Account",
      timestamp: "1:15",
      description: "Creating and configuring your SoulSpace account"
    },
    {
      title: "Navigating the Dashboard",
      timestamp: "3:30",
      description: "Understanding the main dashboard and its features"
    },
    {
      title: "Connecting Wearable Devices",
      timestamp: "5:20",
      description: "How to connect and sync your health tracking devices"
    },
    {
      title: "Setting Health Goals",
      timestamp: "7:00",
      description: "Creating personalized health objectives"
    }
  ],
  relatedVideos: [
    {
      id: 2,
      title: "How to Book Your First Appointment",
      thumbnail: "/images/tutorials/booking-appointment.jpg",
      duration: "5:20",
      views: 8700,
      path: "/resources/video-tutorials/booking-appointment",
    },
    {
      id: 3,
      title: "Connecting Your Wearable Device",
      thumbnail: "/images/tutorials/wearable-connection.jpg",
      duration: "6:15",
      views: 7200,
      path: "/resources/video-tutorials/connecting-wearables",
    },
    {
      id: 8,
      title: "Using the AI Health Assistant",
      thumbnail: "/images/tutorials/ai-assistant.jpg",
      duration: "7:20",
      views: 4500,
      path: "/resources/video-tutorials/ai-assistant",
    }
  ],
  transcript: `
Welcome to SoulSpace! I'm Dr. Sarah Johnson, and in this video, I'll walk you through everything you need to know to get started with our platform.

SoulSpace is designed to be your comprehensive health companion, helping you monitor your health metrics, connect with healthcare providers, and take control of your wellness journey.

Let's start by setting up your account. If you haven't already created an account, you can do so by clicking the "Sign Up" button on the homepage. You'll need to provide some basic information like your name, email, and create a password. We also recommend completing your health profile with information about your medical history, current medications, and health goals.

Once your account is set up, you'll be taken to your dashboard. This is your health command center. At the top, you'll see your key health metrics if you've connected any wearable devices. Below that, you'll find your upcoming appointments, recent activity, and personalized health recommendations.

The navigation menu on the left gives you access to all the main features of SoulSpace. Let's go through each section:

The "Health Monitoring" section is where you can view detailed information about your health metrics, including historical data and trends. This is especially useful when you've connected wearable devices.

Speaking of which, let's talk about connecting your wearable devices. Click on the "Connected Devices" option in the settings menu. From here, you can add new devices by selecting your device type and following the pairing instructions. SoulSpace supports most major brands including Fitbit, Apple Watch, and Samsung Galaxy Watch.

Back to the navigation menu, the "Appointments" section is where you can schedule, view, and manage your healthcare appointments. You can book both in-person and virtual consultations here.

The "Medical Records" section stores all your health information, including test results, prescriptions, and doctor's notes. You can also upload documents like previous medical records.

Finally, the "Settings" section allows you to customize your SoulSpace experience, manage your profile, and set your privacy preferences.

One of the most powerful features of SoulSpace is the ability to set and track health goals. To do this, go to the "Health Goals" section. You can create goals related to activity, sleep, nutrition, or any other health metric you want to improve. The platform will help you track your progress and provide recommendations to help you achieve your goals.

That covers the basics of getting started with SoulSpace. In future tutorials, we'll dive deeper into specific features like booking appointments, using the AI health assistant, and getting the most out of your wearable device data.

If you have any questions, don't hesitate to reach out to our support team through the "Help & Support" section. Thanks for watching, and here's to your health journey with SoulSpace!
  `
};

const VideoTutorialDetail = () => {
  const theme = useTheme();
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Fetch video data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchVideo = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setVideo(videoData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching video:', error);
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  const handleLikeVideo = () => {
    setLiked(!liked);
    // In a real app, this would be an API call to like/unlike the video
  };

  const handleBookmarkVideo = () => {
    setBookmarked(!bookmarked);
    // In a real app, this would be an API call to bookmark/unbookmark the video
  };

  const handleShareVideo = () => {
    // In a real app, this would open a share dialog
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadVideo = () => {
    // In a real app, this would download the video
    alert('Video download functionality would be implemented here.');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!video) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            Video not found
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/resources/video-tutorials')}
            sx={{ mt: 2 }}
          >
            Back to Video Tutorials
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <Home fontSize="small" sx={{ mr: 0.5 }} />
            Home
          </Link>
          <Link component={RouterLink} to="/help" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpCenter fontSize="small" sx={{ mr: 0.5 }} />
            Help Center
          </Link>
          <Link component={RouterLink} to="/resources/video-tutorials" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <VideoLibrary fontSize="small" sx={{ mr: 0.5 }} />
            Video Tutorials
          </Link>
          <Typography color="text.primary" noWrap sx={{ maxWidth: 200 }}>
            {video.title}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Video Player */}
            <Card
              component={motion.div}
              variants={itemVariants}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                mb: 4,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '56.25%', // 16:9 aspect ratio
                  bgcolor: 'black',
                }}
              >
                <iframe
                  src={video.videoUrl}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                />
              </Box>
              <CardContent sx={{ p: 3 }}>
                {/* Video Header */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Button
                      startIcon={<ArrowBack />}
                      component={RouterLink}
                      to="/resources/video-tutorials"
                      sx={{ mb: 2 }}
                    >
                      Back to Video Tutorials
                    </Button>

                    <Chip
                      label={video.category}
                      size="small"
                      icon={<OndemandVideo fontSize="small" />}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    />
                  </Box>

                  <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                    {video.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {video.duration}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Visibility fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {video.views.toLocaleString()} views
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Published {formatDistanceToNow(video.publishedDate, { addSuffix: true })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updated {formatDistanceToNow(video.lastUpdated, { addSuffix: true })}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" color="text.secondary" paragraph>
                    {video.description}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {video.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={`#${tag}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: '4px',
                          height: 24,
                          fontSize: '0.75rem',
                        }}
                        component={RouterLink}
                        to={`/resources/video-tutorials/tag/${tag}`}
                        clickable
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Video Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant={liked ? 'contained' : 'outlined'}
                      startIcon={liked ? <ThumbUp /> : <ThumbUpOutlined />}
                      onClick={handleLikeVideo}
                    >
                      {liked ? 'Liked' : 'Like'} ({video.likes + (liked ? 1 : 0)})
                    </Button>
                    <Button
                      variant={bookmarked ? 'contained' : 'outlined'}
                      startIcon={bookmarked ? <Bookmark /> : <BookmarkBorder />}
                      onClick={handleBookmarkVideo}
                      color={bookmarked ? 'primary' : 'inherit'}
                    >
                      {bookmarked ? 'Saved' : 'Save'}
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={handleShareVideo}
                    >
                      Share
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={handleDownloadVideo}
                    >
                      Download
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Video Content Tabs */}
            <Card
              component={motion.div}
              variants={itemVariants}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                mb: 4,
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '& .MuiTab-root': {
                      py: 2,
                    },
                  }}
                >
                  <Tab label="Chapters" icon={<Description />} iconPosition="start" />
                  <Tab label="Transcript" icon={<School />} iconPosition="start" />
                  <Tab label="About Instructor" icon={<Info />} iconPosition="start" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                  {/* Chapters Tab */}
                  {tabValue === 0 && (
                    <List disablePadding>
                      {video.chapters.map((chapter, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            px: 0,
                            py: 2,
                            borderBottom: index < video.chapters.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Chip
                              label={chapter.timestamp}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontWeight: 500,
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={500}>
                                {chapter.title}
                              </Typography>
                            }
                            secondary={chapter.description}
                          />
                          <IconButton>
                            <PlayCircleOutline />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  )}

                  {/* Transcript Tab */}
                  {tabValue === 1 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Full Transcript
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {video.transcript}
                      </Typography>
                    </Box>
                  )}

                  {/* About Instructor Tab */}
                  {tabValue === 2 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box
                          component="img"
                          src={video.instructor.avatar}
                          alt={video.instructor.name}
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            mr: 2,
                            objectFit: 'cover',
                          }}
                        />
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {video.instructor.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {video.instructor.title}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" paragraph>
                        Dr. Sarah Johnson is the Chief Product Officer at SoulSpace, where she leads the development of health monitoring and telehealth features. She has over 15 years of experience in healthcare technology and is passionate about making healthcare more accessible through digital solutions.
                      </Typography>
                      <Typography variant="body2">
                        Dr. Johnson holds an MD from Stanford University and a Master's in Health Informatics from Johns Hopkins University. Before joining SoulSpace, she worked as a practicing physician and later as a health tech consultant for major healthcare organizations.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Related Videos */}
            <Card
              component={motion.div}
              variants={itemVariants}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                mb: 4,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Related Videos
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  {video.relatedVideos.map((relatedVideo, index) => (
                    <ListItem
                      key={index}
                      component={RouterLink}
                      to={relatedVideo.path}
                      sx={{
                        px: 0,
                        py: 2,
                        borderBottom: index < video.relatedVideos.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <Box
                        sx={{
                          width: 120,
                          height: 68,
                          borderRadius: 1,
                          overflow: 'hidden',
                          position: 'relative',
                          mr: 2,
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          component="img"
                          src={relatedVideo.thumbnail}
                          alt={relatedVideo.title}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 4,
                            right: 4,
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            px: 0.5,
                            py: 0.25,
                            borderRadius: 0.5,
                            fontSize: '0.7rem',
                          }}
                        >
                          {relatedVideo.duration}
                        </Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(0,0,0,0.3)',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '&:hover': {
                              opacity: 1,
                            },
                          }}
                        >
                          <PlayArrow sx={{ color: 'white' }} />
                        </Box>
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: 'text.primary',
                            '&:hover': { color: theme.palette.primary.main },
                            fontWeight: 500,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {relatedVideo.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {relatedVideo.views.toLocaleString()} views
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  component={RouterLink}
                  to="/resources/video-tutorials"
                  sx={{ mt: 2 }}
                >
                  View More Videos
                </Button>
              </CardContent>
            </Card>

            {/* Video Link */}
            <Card
              component={motion.div}
              variants={itemVariants}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Share This Video
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={window.location.href}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton onClick={handleCopyLink} size="small">
                          {copied ? <Check color="success" /> : <ContentCopy />}
                        </IconButton>
                      ),
                    }}
                    sx={{ mr: 1 }}
                  />
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Share />}
                  onClick={handleShareVideo}
                >
                  Share Video
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default VideoTutorialDetail;
