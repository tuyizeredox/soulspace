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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Article,
  Search,
  ExpandMore,
  Home,
  HelpCenter,
  ArrowForward,
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
  Download,
  Print,
  Share,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

// Sample user guides
const userGuides = [
  {
    id: 1,
    category: 'Getting Started',
    icon: <Dashboard />,
    guides: [
      {
        id: 101,
        title: 'Creating Your Account',
        description: 'Learn how to create and set up your SoulSpace account',
        image: '/images/guides/account-setup.jpg',
        difficulty: 'Beginner',
        timeToRead: '5 min',
        path: '/resources/user-guides/creating-your-account',
      },
      {
        id: 102,
        title: 'Navigating the Dashboard',
        description: 'A comprehensive guide to using the SoulSpace dashboard',
        image: '/images/guides/dashboard.jpg',
        difficulty: 'Beginner',
        timeToRead: '8 min',
        path: '/resources/user-guides/navigating-dashboard',
      },
      {
        id: 103,
        title: 'Setting Up Your Profile',
        description: 'How to complete your profile and privacy settings',
        image: '/images/guides/profile-setup.jpg',
        difficulty: 'Beginner',
        timeToRead: '6 min',
        path: '/resources/user-guides/profile-setup',
      },
    ]
  },
  {
    id: 2,
    category: 'Appointments',
    icon: <CalendarMonth />,
    guides: [
      {
        id: 201,
        title: 'Booking Your First Appointment',
        description: 'Step-by-step guide to booking medical appointments',
        image: '/images/guides/booking-appointment.jpg',
        difficulty: 'Beginner',
        timeToRead: '7 min',
        path: '/resources/user-guides/booking-appointment',
      },
      {
        id: 202,
        title: 'Preparing for a Virtual Consultation',
        description: 'How to get ready for your online doctor appointment',
        image: '/images/guides/virtual-consultation.jpg',
        difficulty: 'Intermediate',
        timeToRead: '10 min',
        path: '/resources/user-guides/virtual-consultation',
      },
      {
        id: 203,
        title: 'Managing Your Appointment Calendar',
        description: 'Tips for organizing and managing your medical appointments',
        image: '/images/guides/appointment-calendar.jpg',
        difficulty: 'Beginner',
        timeToRead: '5 min',
        path: '/resources/user-guides/managing-appointments',
      },
    ]
  },
  {
    id: 3,
    category: 'Health Monitoring',
    icon: <MonitorHeart />,
    guides: [
      {
        id: 301,
        title: 'Connecting Your Wearable Device',
        description: 'How to connect and sync your health tracking devices',
        image: '/images/guides/wearable-connection.jpg',
        difficulty: 'Intermediate',
        timeToRead: '12 min',
        path: '/resources/user-guides/connecting-wearables',
      },
      {
        id: 302,
        title: 'Understanding Your Health Metrics',
        description: 'A guide to interpreting your health data and trends',
        image: '/images/guides/health-metrics.jpg',
        difficulty: 'Intermediate',
        timeToRead: '15 min',
        path: '/resources/user-guides/health-metrics',
      },
      {
        id: 303,
        title: 'Setting Health Goals',
        description: 'How to set and track personalized health objectives',
        image: '/images/guides/health-goals.jpg',
        difficulty: 'Beginner',
        timeToRead: '8 min',
        path: '/resources/user-guides/health-goals',
      },
    ]
  },
  {
    id: 4,
    category: 'Medical Records',
    icon: <MedicalServices />,
    guides: [
      {
        id: 401,
        title: 'Accessing Your Medical Records',
        description: 'How to view and download your health information',
        image: '/images/guides/medical-records.jpg',
        difficulty: 'Beginner',
        timeToRead: '6 min',
        path: '/resources/user-guides/accessing-records',
      },
      {
        id: 402,
        title: 'Sharing Records with Providers',
        description: 'Securely share your medical information with healthcare providers',
        image: '/images/guides/sharing-records.jpg',
        difficulty: 'Intermediate',
        timeToRead: '9 min',
        path: '/resources/user-guides/sharing-records',
      },
      {
        id: 403,
        title: 'Understanding Lab Results',
        description: 'How to interpret common laboratory test results',
        image: '/images/guides/lab-results.jpg',
        difficulty: 'Advanced',
        timeToRead: '14 min',
        path: '/resources/user-guides/lab-results',
      },
    ]
  },
];

// Sample featured guide content
const featuredGuide = {
  title: 'Complete Guide to Virtual Consultations',
  description: 'Everything you need to know about preparing for and getting the most out of your virtual doctor appointments.',
  image: '/images/guides/virtual-consultation-featured.jpg',
  sections: [
    {
      title: 'Before Your Appointment',
      content: 'Prepare your device, test your camera and microphone, find a quiet and well-lit space, and have your medical information ready.'
    },
    {
      title: 'During the Consultation',
      content: 'Be on time, speak clearly, take notes, ask questions, and ensure you understand the doctor\'s recommendations.'
    },
    {
      title: 'After Your Visit',
      content: 'Review your notes, follow up on prescriptions, schedule any recommended tests, and book follow-up appointments if needed.'
    }
  ],
  path: '/resources/user-guides/virtual-consultation-complete',
};

const UserGuides = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  
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
  
  const handleCategoryExpand = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };
  
  // Filter guides based on search query
  const filteredGuides = userGuides.map(category => ({
    ...category,
    guides: category.guides.filter(guide => 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.guides.length > 0);

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
            <Article fontSize="small" sx={{ mr: 0.5 }} />
            User Guides
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
              User Guides
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
              Step-by-step instructions to help you navigate the SoulSpace platform
            </Typography>
            
            {/* Search Box */}
            <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search user guides..."
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
        
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Featured Guide */}
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
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={featuredGuide.image || 'https://via.placeholder.com/800x400'}
                    alt={featuredGuide.title}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      bgcolor: 'rgba(0,0,0,0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      p: 3,
                    }}
                  >
                    <Chip
                      label="Featured Guide"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        fontWeight: 600,
                      }}
                    />
                    <Typography
                      variant="h4"
                      component="h2"
                      color="white"
                      sx={{
                        fontWeight: 700,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                      }}
                    >
                      {featuredGuide.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="white"
                      sx={{
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        mt: 1,
                        maxWidth: '80%',
                      }}
                    >
                      {featuredGuide.description}
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  {featuredGuide.sections.map((section, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {section.title}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {section.content}
                      </Typography>
                      {index < featuredGuide.sections.length - 1 && (
                        <Divider sx={{ my: 2 }} />
                      )}
                    </Box>
                  ))}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 3,
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Download />}
                        variant="outlined"
                      >
                        Download PDF
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Print />}
                        variant="outlined"
                      >
                        Print
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Share />}
                        variant="outlined"
                      >
                        Share
                      </Button>
                    </Box>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      component={RouterLink}
                      to={featuredGuide.path}
                    >
                      Read Full Guide
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            
            {/* User Guides by Category */}
            <Typography
              variant="h5"
              component="h2"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 3 }}
            >
              Browse by Category
            </Typography>
            
            {filteredGuides.length > 0 ? (
              filteredGuides.map((category) => (
                <Accordion
                  key={category.id}
                  component={motion.div}
                  variants={itemVariants}
                  expanded={expandedCategory === category.id}
                  onChange={() => handleCategoryExpand(category.id)}
                  sx={{
                    mb: 2,
                    borderRadius: '12px !important',
                    overflow: 'hidden',
                    '&:before': {
                      display: 'none',
                    },
                    boxShadow: expandedCategory === category.id
                      ? '0 8px 25px rgba(0,0,0,0.1)'
                      : '0 2px 10px rgba(0,0,0,0.05)',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      bgcolor: expandedCategory === category.id
                        ? alpha(theme.palette.primary.main, 0.05)
                        : 'transparent',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          mr: 2,
                          color: theme.palette.primary.main,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {category.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        {category.category}
                      </Typography>
                      <Chip
                        label={`${category.guides.length} guides`}
                        size="small"
                        sx={{
                          ml: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <Divider />
                    <Grid container spacing={0}>
                      {category.guides.map((guide) => (
                        <Grid item xs={12} key={guide.id}>
                          <Box
                            component={RouterLink}
                            to={guide.path}
                            sx={{
                              display: 'flex',
                              p: 2,
                              borderBottom: `1px solid ${theme.palette.divider}`,
                              textDecoration: 'none',
                              color: 'inherit',
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                              },
                              '&:last-child': {
                                borderBottom: 'none',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: { xs: 80, sm: 120 },
                                height: { xs: 60, sm: 80 },
                                borderRadius: 1,
                                overflow: 'hidden',
                                mr: 2,
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={guide.image || 'https://via.placeholder.com/120x80'}
                                alt={guide.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {guide.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  mb: 1,
                                }}
                              >
                                {guide.description}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Chip
                                  label={guide.difficulty}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor:
                                      guide.difficulty === 'Beginner'
                                        ? alpha(theme.palette.success.main, 0.1)
                                        : guide.difficulty === 'Intermediate'
                                        ? alpha(theme.palette.warning.main, 0.1)
                                        : alpha(theme.palette.error.main, 0.1),
                                    color:
                                      guide.difficulty === 'Beginner'
                                        ? theme.palette.success.main
                                        : guide.difficulty === 'Intermediate'
                                        ? theme.palette.warning.main
                                        : theme.palette.error.main,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {guide.timeToRead} read
                                </Typography>
                              </Box>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                ml: 1,
                              }}
                            >
                              <ArrowForward
                                fontSize="small"
                                sx={{ color: theme.palette.primary.main }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))
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
                  No guides found for "{searchQuery}"
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try different keywords or browse all categories
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </Box>
            )}
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Quick Links */}
            <Paper
              component={motion.div}
              variants={itemVariants}
              sx={{
                p: 3,
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                mb: 4,
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Links
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {[
                  { text: 'Account Setup', icon: <Person />, path: '/resources/user-guides/account-setup' },
                  { text: 'Booking Appointments', icon: <CalendarMonth />, path: '/resources/user-guides/booking-appointments' },
                  { text: 'Wearable Devices', icon: <Devices />, path: '/resources/user-guides/wearable-devices' },
                  { text: 'Virtual Consultations', icon: <VideoCall />, path: '/resources/user-guides/virtual-consultations' },
                  { text: 'Privacy & Security', icon: <Security />, path: '/resources/user-guides/privacy-security' },
                ].map((item, index) => (
                  <ListItem
                    key={index}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: '8px',
                      mb: 1,
                      textDecoration: 'none',
                      color: 'text.primary',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
            
            {/* Popular Guides */}
            <Paper
              component={motion.div}
              variants={itemVariants}
              sx={{
                p: 3,
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                mb: 4,
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Popular Guides
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {[
                  { title: 'How to Book Your First Appointment', views: '2.4k', path: '/resources/user-guides/booking-appointment' },
                  { title: 'Connecting Your Apple Watch', views: '1.8k', path: '/resources/user-guides/apple-watch' },
                  { title: 'Understanding Your Lab Results', views: '1.5k', path: '/resources/user-guides/lab-results' },
                  { title: 'Setting Up Medication Reminders', views: '1.2k', path: '/resources/user-guides/medication-reminders' },
                  { title: 'Sharing Medical Records', views: '950', path: '/resources/user-guides/sharing-records' },
                ].map((guide, index) => (
                  <ListItem
                    key={index}
                    component={RouterLink}
                    to={guide.path}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: '8px',
                      mb: 1,
                      textDecoration: 'none',
                      color: 'text.primary',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <ListItemText
                      primary={guide.title}
                      primaryTypographyProps={{ fontWeight: 500 }}
                      secondary={`${guide.views} views`}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to="/resources/user-guides/all"
                sx={{ mt: 1 }}
              >
                View All Guides
              </Button>
            </Paper>
            
            {/* Need More Help */}
            <Paper
              component={motion.div}
              variants={itemVariants}
              sx={{
                p: 3,
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Need More Help?
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                Can't find what you're looking for in our guides? Our support team is here to help.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                component={RouterLink}
                to="/contact"
                sx={{ mb: 1 }}
              >
                Contact Support
              </Button>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to="/community"
              >
                Ask the Community
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default UserGuides;
