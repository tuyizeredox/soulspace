import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
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
  IconButton,
} from '@mui/material';
import {
  School,
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
  Bookmark,
  BookmarkBorder,
  Article,
  MenuBook,
  LocalHospital,
  Psychology,
  Healing,
  HealthAndSafety,
  Medication,
  Science,
  Favorite,
  AccessTime,
  Visibility,
  ThumbUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

// Sample knowledge base categories
const kbCategories = [
  {
    id: 1,
    name: 'Getting Started',
    icon: <Dashboard />,
    description: 'Basic information about using the SoulSpace platform',
    articles: 12,
  },
  {
    id: 2,
    name: 'Appointments',
    icon: <CalendarMonth />,
    description: 'Managing your medical appointments',
    articles: 15,
  },
  {
    id: 3,
    name: 'Health Monitoring',
    icon: <MonitorHeart />,
    description: 'Tracking and understanding your health metrics',
    articles: 18,
  },
  {
    id: 4,
    name: 'Medical Records',
    icon: <MedicalServices />,
    description: 'Accessing and managing your health information',
    articles: 10,
  },
  {
    id: 5,
    name: 'Wearable Devices',
    icon: <Devices />,
    description: 'Connecting and using health tracking devices',
    articles: 14,
  },
  {
    id: 6,
    name: 'Privacy & Security',
    icon: <Security />,
    description: 'Protecting your personal health information',
    articles: 8,
  },
  {
    id: 7,
    name: 'Billing & Insurance',
    icon: <Payment />,
    description: 'Understanding payments and insurance coverage',
    articles: 9,
  },
  {
    id: 8,
    name: 'Telehealth',
    icon: <VideoCall />,
    description: 'Virtual consultations and online care',
    articles: 11,
  },
];

// Sample popular articles
const popularArticles = [
  {
    id: 101,
    title: 'Understanding Your Health Dashboard',
    category: 'Health Monitoring',
    views: 12500,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    path: '/resources/knowledge-base/health-dashboard',
  },
  {
    id: 102,
    title: 'How to Connect Your Apple Watch',
    category: 'Wearable Devices',
    views: 10800,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
    path: '/resources/knowledge-base/apple-watch-connection',
  },
  {
    id: 103,
    title: 'Preparing for Your Virtual Consultation',
    category: 'Telehealth',
    views: 9200,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    path: '/resources/knowledge-base/virtual-consultation-prep',
  },
  {
    id: 104,
    title: 'Sharing Medical Records with Providers',
    category: 'Medical Records',
    views: 8500,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    path: '/resources/knowledge-base/sharing-medical-records',
  },
  {
    id: 105,
    title: 'Understanding Lab Results',
    category: 'Medical Records',
    views: 7900,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    path: '/resources/knowledge-base/understanding-lab-results',
  },
];

// Sample recent articles
const recentArticles = [
  {
    id: 201,
    title: 'New Features: AI Health Recommendations',
    category: 'Health Monitoring',
    summary: 'Learn about our new AI-powered health recommendations feature that provides personalized insights based on your health data.',
    publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    readTime: '5 min',
    path: '/resources/knowledge-base/ai-health-recommendations',
  },
  {
    id: 202,
    title: 'How to Use the Medication Reminder System',
    category: 'Health Monitoring',
    summary: 'A comprehensive guide to setting up and managing medication reminders to ensure you never miss a dose.',
    publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
    readTime: '7 min',
    path: '/resources/knowledge-base/medication-reminders',
  },
  {
    id: 203,
    title: 'Understanding Health Insurance Coverage',
    category: 'Billing & Insurance',
    summary: 'A detailed explanation of how health insurance works with SoulSpace and what services are typically covered.',
    publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 days ago
    readTime: '10 min',
    path: '/resources/knowledge-base/insurance-coverage',
  },
];

// Sample featured article
const featuredArticle = {
  id: 301,
  title: 'Complete Guide to Preventive Health Monitoring',
  category: 'Health Monitoring',
  summary: 'Learn how to use SoulSpace to monitor your health proactively and prevent potential health issues before they become serious.',
  content: [
    {
      title: 'Why Preventive Health Monitoring Matters',
      text: 'Preventive health monitoring allows you to track key health metrics over time, identify trends, and take action before small issues become serious problems. Regular monitoring can help you maintain optimal health and potentially avoid costly medical interventions down the road.'
    },
    {
      title: 'Key Health Metrics to Track',
      text: 'Focus on tracking these essential health metrics: blood pressure, heart rate, sleep quality, activity levels, weight, and stress levels. SoulSpace makes it easy to monitor these metrics through connected wearable devices or manual entry.'
    },
    {
      title: 'Setting Up Health Goals',
      text: 'Establish personalized health goals based on your current metrics and recommendations from healthcare providers. SoulSpace allows you to set targets for each metric and tracks your progress over time.'
    },
    {
      title: 'Understanding Your Health Trends',
      text: 'The SoulSpace dashboard provides visual representations of your health data, making it easy to spot trends and patterns. Learn how to interpret these trends and when to share concerning changes with your healthcare provider.'
    }
  ],
  publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 days ago
  readTime: '12 min',
  views: 15600,
  likes: 943,
  path: '/resources/knowledge-base/preventive-health-monitoring',
};

const KnowledgeBase = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
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
  
  // Filter categories based on search query
  const filteredCategories = kbCategories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
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
            <School fontSize="small" sx={{ mr: 0.5 }} />
            Knowledge Base
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
              Knowledge Base
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
              Detailed articles and guides on all aspects of the SoulSpace platform
            </Typography>
            
            {/* Search Box */}
            <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search the knowledge base..."
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
            {/* Featured Article */}
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
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label="Featured Article"
                      color="primary"
                      size="small"
                      sx={{ mb: 1, fontWeight: 600 }}
                    />
                    <Typography variant="h4" component="h2" fontWeight={700} gutterBottom>
                      {featuredArticle.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      <Chip
                        label={featuredArticle.category}
                        size="small"
                        icon={<MonitorHeart fontSize="small" />}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {featuredArticle.readTime} read
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Visibility fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {featuredArticle.views.toLocaleString()} views
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary" paragraph>
                      {featuredArticle.summary}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  {featuredArticle.content.map((section, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {section.title}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {section.text}
                      </Typography>
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
                      to={featuredArticle.path}
                    >
                      Read Full Article
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            
            {/* Recent Articles */}
            <Box component={motion.div} variants={itemVariants} sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" fontWeight={700} gutterBottom>
                Recent Articles
              </Typography>
              <Grid container spacing={3}>
                {recentArticles.map((article) => (
                  <Grid item xs={12} md={4} key={article.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '12px',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Chip
                          label={article.category}
                          size="small"
                          sx={{
                            mb: 1,
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                          }}
                        />
                        <Typography
                          variant="subtitle1"
                          component={RouterLink}
                          to={article.path}
                          sx={{
                            fontWeight: 600,
                            textDecoration: 'none',
                            color: 'text.primary',
                            '&:hover': { color: theme.palette.primary.main },
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {article.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {article.summary}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(article.publishedDate, { addSuffix: true })}
                          </Typography>
                          <Box sx={{ flexGrow: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            {article.readTime} read
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            {/* Browse by Category */}
            <Box component={motion.div} variants={itemVariants}>
              <Typography variant="h5" component="h2" fontWeight={700} gutterBottom>
                Browse by Category
              </Typography>
              <Grid container spacing={3}>
                {filteredCategories.map((category) => (
                  <Grid item xs={12} sm={6} md={4} key={category.id}>
                    <Card
                      component={RouterLink}
                      to={`/resources/knowledge-base/category/${category.id}`}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            mb: 2,
                          }}
                        >
                          {React.cloneElement(category.icon, { sx: { fontSize: 30 } })}
                        </Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {category.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {category.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                          <Chip
                            label={`${category.articles} articles`}
                            size="small"
                            sx={{
                              height: 24,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }}
                          />
                          <Box sx={{ flexGrow: 1 }} />
                          <ArrowForward fontSize="small" sx={{ color: theme.palette.primary.main }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Popular Articles */}
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
                Popular Articles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {popularArticles.map((article, index) => (
                  <ListItem
                    key={article.id}
                    component={RouterLink}
                    to={article.path}
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
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        mr: 2,
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </Box>
                    <ListItemText
                      primary={article.title}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        variant: 'body2',
                      }}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mr: 1 }}
                          >
                            {article.category}
                          </Typography>
                          <Box
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              bgcolor: 'text.disabled',
                              mx: 0.5,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {article.views.toLocaleString()} views
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to="/resources/knowledge-base/popular"
                sx={{ mt: 1 }}
              >
                View All Popular Articles
              </Button>
            </Paper>
            
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
                  { text: 'Getting Started Guide', icon: <MenuBook />, path: '/resources/knowledge-base/getting-started' },
                  { text: 'Telehealth FAQ', icon: <VideoCall />, path: '/resources/knowledge-base/telehealth-faq' },
                  { text: 'Insurance Coverage', icon: <Payment />, path: '/resources/knowledge-base/insurance-coverage' },
                  { text: 'Privacy Policy', icon: <Security />, path: '/resources/knowledge-base/privacy-policy' },
                  { text: 'Terms of Service', icon: <Description />, path: '/resources/knowledge-base/terms-of-service' },
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
                Can't find what you're looking for in our knowledge base? Our support team is here to help.
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

export default KnowledgeBase;
