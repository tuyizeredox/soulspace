import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  alpha,
  InputAdornment,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  HelpCenter as HelpCenterIcon,
  ContactSupport,
  Article,
  VideoLibrary,
  School,
  Forum,
  Email,
  Phone,
  Chat,
  QuestionAnswer,
  Healing,
  DevicesOther,
  Security,
  Payment,
  AccountCircle,
  CalendarMonth,
  Clear,
  Home,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

// FAQ data
const faqCategories = [
  {
    category: 'Account & Profile',
    icon: <AccountCircle />,
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'To create an account, click on the "Sign Up" button on the top right corner of the homepage. Fill in your personal details, create a password, and follow the verification steps sent to your email.'
      },
      {
        question: 'How do I update my profile information?',
        answer: 'You can update your profile by navigating to your account settings. Click on your profile picture in the top right corner, select "Profile", and then edit your information as needed.'
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'On the login page, click on "Forgot Password". Enter your registered email address, and we\'ll send you instructions to reset your password.'
      },
      {
        question: 'How do I upload a profile picture?',
        answer: 'Go to your profile settings, click on the profile picture placeholder or existing picture, and select "Upload Photo". You can then choose an image from your device.'
      }
    ]
  },
  {
    category: 'Appointments',
    icon: <CalendarMonth />,
    questions: [
      {
        question: 'How do I book an appointment?',
        answer: 'To book an appointment, go to the "Appointments" section in your dashboard, click on "Book New Appointment", select your preferred doctor or hospital, choose a date and time, and confirm your booking.'
      },
      {
        question: 'Can I reschedule or cancel my appointment?',
        answer: 'Yes, you can reschedule or cancel appointments through the "My Appointments" section. Please note that cancellations made less than 24 hours before the appointment may incur a fee.'
      },
      {
        question: 'How do I prepare for a virtual appointment?',
        answer: 'For virtual appointments, ensure you have a stable internet connection, a quiet environment, and a device with a working camera and microphone. Test your setup before the appointment time and be ready 5 minutes early.'
      },
      {
        question: 'What types of appointments are available?',
        answer: 'We offer both in-person and virtual appointments. In-person appointments take place at the hospital or clinic, while virtual appointments are conducted through our secure video conferencing system.'
      }
    ]
  },
  {
    category: 'Health Monitoring',
    icon: <Healing />,
    questions: [
      {
        question: 'How do I connect my wearable device?',
        answer: 'To connect your wearable device, go to "Settings" > "Connected Devices" and follow the instructions to pair your specific device. We support most major brands including Fitbit, Apple Watch, and Samsung Galaxy Watch.'
      },
      {
        question: 'What health metrics are tracked?',
        answer: 'Our platform tracks various health metrics including heart rate, sleep patterns, step count, blood pressure (with compatible devices), stress levels, and oxygen saturation (with compatible devices).'
      },
      {
        question: 'Is my health data secure?',
        answer: 'Yes, all your health data is encrypted and stored securely in compliance with HIPAA regulations. We never share your personal health information without your explicit consent.'
      },
      {
        question: 'How often is my health data updated?',
        answer: 'Health data from connected devices is typically synced in real-time or at regular intervals depending on your device settings. You can manually sync at any time by clicking the refresh button in the health dashboard.'
      }
    ]
  },
  {
    category: 'Technical Support',
    icon: <DevicesOther />,
    questions: [
      {
        question: 'The app is not working properly. What should I do?',
        answer: 'First, try refreshing the page or restarting the app. If the issue persists, clear your browser cache or reinstall the mobile app. If you still experience problems, please contact our technical support team.'
      },
      {
        question: 'Which browsers are supported?',
        answer: 'Our platform supports the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend keeping your browser updated to the latest version.'
      },
      {
        question: 'Is there a mobile app available?',
        answer: 'Yes, our mobile app is available for both iOS and Android devices. You can download it from the App Store or Google Play Store by searching for "SoulSpace Health".'
      },
      {
        question: 'How do I report a bug or technical issue?',
        answer: 'You can report bugs or technical issues through the "Help & Support" section in your account settings, or by emailing support@soulspace.com with details of the issue you\'re experiencing.'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    icon: <Security />,
    questions: [
      {
        question: 'How is my personal information protected?',
        answer: 'We employ industry-standard encryption and security measures to protect your personal information. Our platform is fully HIPAA compliant, and we regularly conduct security audits to ensure your data remains safe.'
      },
      {
        question: 'Who has access to my medical records?',
        answer: 'Only you and the healthcare providers directly involved in your care have access to your medical records. You can manage access permissions in your privacy settings.'
      },
      {
        question: 'Can I download or delete my data?',
        answer: 'Yes, you can request a download of all your personal data or request account deletion through the "Privacy & Data" section in your account settings. Data deletion requests are processed within 30 days.'
      },
      {
        question: 'How do I report a privacy concern?',
        answer: 'If you have any privacy concerns, please contact our Data Protection Officer at privacy@soulspace.com or through the "Privacy Concerns" form in the Help Center.'
      }
    ]
  },
  {
    category: 'Billing & Payments',
    icon: <Payment />,
    questions: [
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept major credit and debit cards (Visa, Mastercard, American Express), PayPal, and in some regions, direct insurance billing. Payment options may vary depending on your location.'
      },
      {
        question: 'How do I update my billing information?',
        answer: 'You can update your billing information in the "Billing & Payments" section of your account settings. Click on "Payment Methods" and follow the instructions to add, update, or remove payment methods.'
      },
      {
        question: 'Can I get a receipt for my payment?',
        answer: 'Yes, receipts are automatically generated and sent to your registered email address after each payment. You can also view and download all past receipts from the "Billing History" section.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard encryption and do not store your full credit card details on our servers. All payment processing is handled by secure, PCI-compliant payment processors.'
      }
    ]
  }
];

// Support resources
const supportResources = [
  {
    title: 'User Guides',
    description: 'Step-by-step guides to help you navigate the platform',
    icon: <Article />,
    link: '/resources/user-guides'
  },
  {
    title: 'Video Tutorials',
    description: 'Visual instructions for using key features',
    icon: <VideoLibrary />,
    link: '/resources/video-tutorials'
  },
  {
    title: 'Knowledge Base',
    description: 'Detailed articles on all aspects of the platform',
    icon: <School />,
    link: '/resources/knowledge-base'
  },
  {
    title: 'Community Forum',
    description: 'Connect with other users and share experiences',
    icon: <Forum />,
    link: '/community'
  }
];

// Contact methods
const contactMethods = [
  {
    method: 'Email Support',
    description: 'Get help via email within 24 hours',
    icon: <Email />,
    contact: 'support@soulspace.com'
  },
  {
    method: 'Phone Support',
    description: 'Speak directly with our support team',
    icon: <Phone />,
    contact: '+1 (800) 555-1234'
  },
  {
    method: 'Live Chat',
    description: 'Chat with a support agent in real-time',
    icon: <Chat />,
    contact: 'Available 24/7'
  }
];

const HelpCenter = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
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
  
  // Filter FAQs based on search query and active category
  const filteredFaqs = faqCategories
    .filter(category => activeCategory === 'all' || category.category === activeCategory)
    .flatMap(category => 
      category.questions.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(faq => ({ ...faq, category: category.category, icon: category.icon }))
    );
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <Home fontSize="small" sx={{ mr: 0.5 }} />
            Home
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpCenterIcon fontSize="small" sx={{ mr: 0.5 }} />
            Help Center
          </Typography>
        </Breadcrumbs>
        
        {/* Header */}
        <Box 
          component={motion.div}
          variants={itemVariants}
          sx={{
            textAlign: 'center',
            mb: 6,
            position: 'relative',
            py: 5,
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
              How Can We Help You?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4,
                maxWidth: '800px',
                mx: 'auto',
                opacity: 0.9,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Find answers to your questions, browse our resources, or contact our support team
            </Typography>
            
            {/* Search Box */}
            <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: theme.palette.primary.main }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={clearSearch} edge="end" size="small">
                        <Clear />
                      </IconButton>
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
        
        {/* Category Filters */}
        <Box 
          component={motion.div}
          variants={itemVariants}
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            mb: 4,
            justifyContent: 'center'
          }}
        >
          <Chip
            label="All Categories"
            icon={<HelpCenterIcon />}
            onClick={() => handleCategoryChange('all')}
            color={activeCategory === 'all' ? 'primary' : 'default'}
            variant={activeCategory === 'all' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 500, px: 1 }}
          />
          {faqCategories.map((category) => (
            <Chip
              key={category.category}
              label={category.category}
              icon={category.icon}
              onClick={() => handleCategoryChange(category.category)}
              color={activeCategory === category.category ? 'primary' : 'default'}
              variant={activeCategory === category.category ? 'filled' : 'outlined'}
              sx={{ fontWeight: 500, px: 1 }}
            />
          ))}
        </Box>
        
        {/* FAQ Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper 
              component={motion.div}
              variants={itemVariants}
              sx={{ 
                p: { xs: 2, md: 3 }, 
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                mb: 4
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <QuestionAnswer sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h5" component="h2" fontWeight={600}>
                  Frequently Asked Questions
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <Accordion 
                    key={index} 
                    disableGutters 
                    elevation={0}
                    sx={{
                      mb: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '8px !important',
                      '&:before': {
                        display: 'none',
                      },
                      '&.Mui-expanded': {
                        margin: 0,
                        mb: 1,
                        borderRadius: '8px',
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        borderRadius: '8px',
                        '&.Mui-expanded': {
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 1, color: theme.palette.primary.main }}>
                          {faq.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {faq.question}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {faq.category}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body1" sx={{ pl: 4 }}>
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No results found for "{searchQuery}"
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try different keywords or browse the categories
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            {/* Contact Support */}
            <Paper 
              component={motion.div}
              variants={itemVariants}
              sx={{ 
                p: { xs: 2, md: 3 }, 
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                mb: 4
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ContactSupport sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h5" component="h2" fontWeight={600}>
                  Contact Support
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <List disablePadding>
                {contactMethods.map((method, index) => (
                  <ListItem 
                    key={index} 
                    disablePadding 
                    sx={{ 
                      mb: 2,
                      p: 2,
                      borderRadius: '8px',
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderColor: theme.palette.primary.main,
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: theme.palette.primary.main }}>
                      {method.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={500}>
                          {method.method}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {method.description}
                          </Typography>
                          <Typography variant="body2" color="primary" fontWeight={500} sx={{ mt: 0.5 }}>
                            {method.contact}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2, borderRadius: '8px', py: 1.5 }}
                component={RouterLink}
                to="/contact"
              >
                Submit a Support Ticket
              </Button>
            </Paper>
            
            {/* Resources */}
            <Paper 
              component={motion.div}
              variants={itemVariants}
              sx={{ 
                p: { xs: 2, md: 3 }, 
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h5" component="h2" fontWeight={600}>
                  Resources
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                {supportResources.map((resource, index) => (
                  <Grid item xs={12} key={index}>
                    <Card 
                      component={RouterLink} 
                      to={resource.link}
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      >
                        {resource.icon}
                      </Box>
                      <CardContent sx={{ flexGrow: 1, py: 1.5 }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {resource.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {resource.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HelpCenter;
