import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  InputAdornment,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
  Tab,
  Tabs,
  IconButton,
} from '@mui/material';
import {
  VideoLibrary,
  Search,
  Home,
  HelpCenter,
  PlayArrow,
  Dashboard,
  CalendarMonth,
  MonitorHeart,
  MedicalServices,
  Settings,
  Person,
  Devices,
  Security,
  Payment,
  Notifications,
  VideoCall,
  Message,
  Description,
  FilterList,
  Sort,
  PlayCircleOutline,
  AccessTime,
  Visibility,
  ThumbUp,
  Share,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

// Sample video tutorials
const videoCategories = [
  {
    id: 1,
    name: 'Getting Started',
    icon: <Dashboard />,
  },
  {
    id: 2,
    name: 'Appointments',
    icon: <CalendarMonth />,
  },
  {
    id: 3,
    name: 'Health Monitoring',
    icon: <MonitorHeart />,
  },
  {
    id: 4,
    name: 'Medical Records',
    icon: <MedicalServices />,
  },
  {
    id: 5,
    name: 'Settings & Privacy',
    icon: <Settings />,
  },
];

const videoTutorials = [
  {
    id: 1,
    title: 'Getting Started with SoulSpace',
    description: 'A complete walkthrough of the SoulSpace platform and its features',
    thumbnail: '/images/tutorials/getting-started.jpg',
    duration: '8:45',
    views: 12500,
    likes: 843,
    category: 'Getting Started',
    featured: true,
    path: '/resources/video-tutorials/getting-started',
  },
  {
    id: 2,
    title: 'How to Book Your First Appointment',
    description: 'Step-by-step guide to booking medical appointments through SoulSpace',
    thumbnail: '/images/tutorials/booking-appointment.jpg',
    duration: '5:20',
    views: 8700,
    likes: 621,
    category: 'Appointments',
    featured: true,
    path: '/resources/video-tutorials/booking-appointment',
  },
  {
    id: 3,
    title: 'Connecting Your Wearable Device',
    description: 'Learn how to connect and sync your health tracking devices with SoulSpace',
    thumbnail: '/images/tutorials/wearable-connection.jpg',
    duration: '6:15',
    views: 7200,
    likes: 512,
    category: 'Health Monitoring',
    featured: false,
    path: '/resources/video-tutorials/connecting-wearables',
  },
  {
    id: 4,
    title: 'Preparing for a Virtual Consultation',
    description: 'Tips and best practices for your online doctor appointments',
    thumbnail: '/images/tutorials/virtual-consultation.jpg',
    duration: '7:30',
    views: 6800,
    likes: 489,
    category: 'Appointments',
    featured: false,
    path: '/resources/video-tutorials/virtual-consultation',
  },
  {
    id: 5,
    title: 'Understanding Your Health Dashboard',
    description: 'A guide to interpreting your health metrics and trends',
    thumbnail: '/images/tutorials/health-dashboard.jpg',
    duration: '9:10',
    views: 5900,
    likes: 432,
    category: 'Health Monitoring',
    featured: false,
    path: '/resources/video-tutorials/health-dashboard',
  },
  {
    id: 6,
    title: 'Managing Your Medical Records',
    description: 'How to view, download, and share your health information',
    thumbnail: '/images/tutorials/medical-records.jpg',
    duration: '6:45',
    views: 5200,
    likes: 387,
    category: 'Medical Records',
    featured: false,
    path: '/resources/video-tutorials/medical-records',
  },
  {
    id: 7,
    title: 'Setting Up Privacy Preferences',
    description: 'Configure your privacy settings and control who can access your information',
    thumbnail: '/images/tutorials/privacy-settings.jpg',
    duration: '5:55',
    views: 4800,
    likes: 356,
    category: 'Settings & Privacy',
    featured: false,
    path: '/resources/video-tutorials/privacy-settings',
  },
  {
    id: 8,
    title: 'Using the AI Health Assistant',
    description: 'Get the most out of the AI-powered health assistant feature',
    thumbnail: '/images/tutorials/ai-assistant.jpg',
    duration: '7:20',
    views: 4500,
    likes: 342,
    category: 'Getting Started',
    featured: false,
    path: '/resources/video-tutorials/ai-assistant',
  },
];

// Featured video
const featuredVideo = {
  id: 1,
  title: 'Complete Guide to SoulSpace Platform',
  description: 'This comprehensive tutorial covers everything you need to know about using the SoulSpace platform, from setting up your account to booking appointments, connecting wearable devices, and managing your health records.',
  thumbnail: '/images/tutorials/complete-guide.jpg',
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  duration: '15:30',
  views: 24800,
  likes: 1876,
  category: 'Getting Started',
  path: '/resources/video-tutorials/complete-guide',
};

const VideoTutorials = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Filter videos based on search query and selected category
  const filteredVideos = videoTutorials.filter(video => 
    (selectedCategory === 'all' || video.category === selectedCategory) &&
    (video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     video.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <VideoLibrary fontSize="small" sx={{ mr: 0.5 }} />
            Video Tutorials
          </Typography>
        </Breadcrumbs>
        
        {/* Header */}
        <Box 
          component={motion.div}
          variants={itemVariants}
          sx={{
            textAlign: 'center',
            mb: 4,
            position: 'relative',
            py: 4,
            px: { xs: 2, md: 6 },
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
            color: 'white',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url(/images/pattern-dots.png)',
              backgroundSize: '200px',
              opacity: 0.1,
              zIndex: 0
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Video Tutorials
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                maxWidth: '800px',
                mx: 'auto',
                opacity: 0.9,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Visual guides to help you navigate the SoulSpace platform and make the most of its features
            </Typography>
            
            {/* Search Box */}
            <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search video tutorials..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: theme.palette.primary.main }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: 'white',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main
                    }
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
        
        {/* Featured Video */}
        <Box 
          component={motion.div}
          variants={itemVariants}
          sx={{ mb: 4 }}
        >
          <Card
            sx={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            }}
          >
            <Grid container>
              <Grid item xs={12} md={8}>
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '56.25%', // 16:9 aspect ratio
                    bgcolor: 'black',
                  }}
                >
                  <iframe
                    src={featuredVideo.videoUrl}
                    title={featuredVideo.title}
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
              </Grid>
              <Grid item xs={12} md={4}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label="Featured Video"
                      color="primary"
                      size="small"
                      sx={{ mb: 1, fontWeight: 600 }}
                    />
                    <Typography variant="h5" component="h2" fontWeight={700} gutterBottom>
                      {featuredVideo.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {featuredVideo.description}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 'auto' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        flexWrap: 'wrap',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {featuredVideo.duration}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Visibility fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {featuredVideo.views.toLocaleString()} views
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ThumbUp fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {featuredVideo.likes.toLocaleString()} likes
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Share />}
                        size="small"
                        fullWidth
                      >
                        Share
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<BookmarkBorder />}
                        size="small"
                        fullWidth
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Box>
        
        {/* Category Filters */}
        <Box 
          component={motion.div}
          variants={itemVariants}
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            mb: 3,
            justifyContent: 'center'
          }}
        >
          <Chip
            label="All Categories"
            icon={<VideoLibrary />}
            onClick={() => handleCategoryChange('all')}
            color={selectedCategory === 'all' ? 'primary' : 'default'}
            variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 500, px: 1 }}
          />
          {videoCategories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              icon={category.icon}
              onClick={() => handleCategoryChange(category.name)}
              color={selectedCategory === category.name ? 'primary' : 'default'}
              variant={selectedCategory === category.name ? 'filled' : 'outlined'}
              sx={{ fontWeight: 500, px: 1 }}
            />
          ))}
        </Box>
        
        {/* Tabs and Filters */}
        <Box 
          component={motion.div}
          variants={itemVariants}
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: { xs: 1, sm: 2 },
                py: 1,
              }
            }}
          >
            <Tab label="Most Popular" />
            <Tab label="Newest" />
            <Tab label="Beginner Friendly" />
          </Tabs>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<FilterList />}
              size="small"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Filter
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Sort />}
              size="small"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Sort
            </Button>
          </Box>
        </Box>
        
        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <Grid container spacing={3}>
            {filteredVideos.map((video) => (
              <Grid item xs={12} sm={6} md={4} key={video.id}>
                <Card
                  component={motion.div}
                  variants={itemVariants}
                  sx={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={video.thumbnail || 'https://via.placeholder.com/400x225'}
                      alt={video.title}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0.3)',
                        opacity: 0,
                        transition: 'opacity 0.3s',
                        '&:hover': {
                          opacity: 1,
                        },
                      }}
                    >
                      <IconButton
                        component={RouterLink}
                        to={video.path}
                        sx={{
                          color: 'white',
                          bgcolor: alpha(theme.palette.primary.main, 0.8),
                          '&:hover': {
                            bgcolor: theme.palette.primary.main,
                          },
                        }}
                      >
                        <PlayArrow sx={{ fontSize: 40 }} />
                      </IconButton>
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      {video.duration}
                    </Box>
                    {video.featured && (
                      <Chip
                        label="Featured"
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={video.category}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="subtitle1"
                      component={RouterLink}
                      to={video.path}
                      sx={{
                        fontWeight: 600,
                        textDecoration: 'none',
                        color: 'text.primary',
                        '&:hover': { color: theme.palette.primary.main },
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                    >
                      {video.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2,
                      }}
                    >
                      {video.description}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 'auto',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Visibility fontSize="small" sx={{ mr: 0.5, color: 'text.disabled', fontSize: '1rem' }} />
                          <Typography variant="caption" color="text.secondary">
                            {video.views.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ThumbUp fontSize="small" sx={{ mr: 0.5, color: 'text.disabled', fontSize: '1rem' }} />
                          <Typography variant="caption" color="text.secondary">
                            {video.likes.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton size="small">
                        <BookmarkBorder fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No videos found for "{searchQuery}"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try different keywords or browse all categories
            </Typography>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
        
        {/* Load More Button */}
        {filteredVideos.length > 0 && (
          <Box
            component={motion.div}
            variants={itemVariants}
            sx={{ textAlign: 'center', mt: 4 }}
          >
            <Button variant="outlined" size="large">
              Load More Videos
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default VideoTutorials;
