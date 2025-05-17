import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  useTheme,
  alpha,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Help as HelpIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  VideoCall as VideoCallIcon,
  Article as ArticleIcon,
  Healing as HealingIcon,
  CalendarMonth as CalendarIcon,
  MedicalServices as MedicalIcon,
  Security as SecurityIcon,
  Payments as PaymentsIcon,
  Send as SendIcon,
  SmartToy as SmartToyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HelpCenterPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // FAQ data
  const faqData = [
    {
      category: 'Account & Profile',
      icon: <SecurityIcon color="primary" />,
      questions: [
        {
          question: 'How do I update my personal information?',
          answer: 'You can update your personal information by going to Settings > Profile Information. From there, you can edit your name, contact information, and address details. Don\'t forget to click "Save Changes" when you\'re done.'
        },
        {
          question: 'How do I change my password?',
          answer: 'To change your password, go to Settings > Security. Enter your current password, then enter and confirm your new password. For security reasons, choose a strong password that includes a mix of letters, numbers, and special characters.'
        },
        {
          question: 'What should I do if I forget my password?',
          answer: 'If you forget your password, click on the "Forgot Password" link on the login page. You\'ll receive an email with instructions to reset your password. If you don\'t receive the email, check your spam folder or contact our support team.'
        }
      ]
    },
    {
      category: 'Appointments',
      icon: <CalendarIcon color="secondary" />,
      questions: [
        {
          question: 'How do I schedule an appointment?',
          answer: 'To schedule an appointment, navigate to the Appointments section and click on "Book Appointment." Select your preferred doctor, date, and time, then confirm your booking. You\'ll receive a confirmation email with the details of your appointment.'
        },
        {
          question: 'How do I cancel or reschedule an appointment?',
          answer: 'To cancel or reschedule an appointment, go to My Appointments, find the appointment you want to modify, and click on "Cancel" or "Reschedule." Please note that some appointments may have cancellation policies, so check the details before making changes.'
        },
        {
          question: 'What is the difference between in-person and virtual appointments?',
          answer: 'In-person appointments take place at the hospital or clinic, while virtual appointments are conducted online through video calls. Both types provide quality care, but virtual appointments offer convenience for follow-ups and minor consultations without requiring travel.'
        }
      ]
    },
    {
      category: 'Medical Records',
      icon: <MedicalIcon color="error" />,
      questions: [
        {
          question: 'How can I access my medical records?',
          answer: 'Your medical records are available in the Medical Records section of your dashboard. You can view your history, lab results, and prescriptions. If you need official copies, you can download or print them directly from the platform.'
        },
        {
          question: 'Are my medical records secure?',
          answer: 'Yes, your medical records are highly secure. We use industry-standard encryption and follow HIPAA compliance guidelines to protect your health information. Only authorized healthcare providers and you have access to your complete records.'
        },
        {
          question: 'How do I share my medical records with another doctor?',
          answer: 'To share your medical records with another doctor, go to Medical Records, select the records you want to share, and click on "Share." You can then enter the doctor\'s information or generate a secure link that expires after a set period.'
        }
      ]
    },
    {
      category: 'Billing & Insurance',
      icon: <PaymentsIcon color="success" />,
      questions: [
        {
          question: 'How do I update my insurance information?',
          answer: 'To update your insurance information, go to Settings > Billing & Insurance. You can add or update your insurance provider, policy number, and other relevant details. Make sure to keep this information current to avoid billing issues.'
        },
        {
          question: 'How can I view my billing history?',
          answer: 'Your billing history is available in the Billing section of your dashboard. You can view past invoices, payments, and any outstanding balances. You can also download invoices for your records or for insurance reimbursement purposes.'
        },
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept various payment methods including credit/debit cards, HSA/FSA cards, and bank transfers. For some services, we also offer payment plans. All payment information is securely processed and stored according to PCI compliance standards.'
        }
      ]
    },
    {
      category: 'Technical Support',
      icon: <HelpIcon color="info" />,
      questions: [
        {
          question: 'What should I do if I encounter technical issues?',
          answer: 'If you encounter technical issues, try refreshing the page or logging out and back in. Clear your browser cache or try using a different browser. If the problem persists, contact our technical support team with details about the issue and any error messages you received.'
        },
        {
          question: 'How do I ensure the best experience for virtual appointments?',
          answer: 'For the best virtual appointment experience, use a stable internet connection, preferably wired rather than Wi-Fi. Test your camera and microphone before the appointment. Find a quiet, well-lit space, and join the call a few minutes early to resolve any technical issues.'
        },
        {
          question: 'Is the platform compatible with all devices?',
          answer: 'Our platform is compatible with most modern devices including computers, tablets, and smartphones. We support recent versions of Chrome, Firefox, Safari, and Edge browsers. For mobile devices, we recommend using our dedicated app for the best experience.'
        }
      ]
    }
  ];
  
  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle FAQ expansion
  const handleFaqChange = (panel) => (event, isExpanded) => {
    setExpandedFaq(isExpanded ? panel : false);
  };
  
  // Filter FAQs based on search query
  const filteredFaqs = searchQuery
    ? faqData.map(category => ({
        ...category,
        questions: category.questions.filter(
          item => 
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqData;
  
  // Handle contact form change
  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm({
      ...contactForm,
      [name]: value
    });
  };
  
  // Handle contact form submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    // In a real app, this would be an API call
    setSnackbar({
      open: true,
      message: 'Your message has been sent. We\'ll get back to you soon!',
      severity: 'success'
    });
    
    // Clear form
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Help Center
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Find answers to your questions and get support
        </Typography>
      </Box>
      
      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight={600}>
          How can we help you today?
        </Typography>
        <TextField
          fullWidth
          placeholder="Search for help topics..."
          value={searchQuery}
          onChange={handleSearch}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            sx: { 
              borderRadius: 3,
              bgcolor: theme.palette.background.paper
            }
          }}
        />
      </Paper>
      
      {/* Quick Help Categories */}
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Popular Help Topics
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                cursor: 'pointer'
              }
            }}
            onClick={() => setSearchQuery('appointment')}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <CalendarIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                Appointments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                cursor: 'pointer'
              }
            }}
            onClick={() => setSearchQuery('medical records')}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <MedicalIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                Medical Records
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                cursor: 'pointer'
              }
            }}
            onClick={() => setSearchQuery('billing')}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <PaymentsIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                Billing
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                cursor: 'pointer'
              }
            }}
            onClick={() => setSearchQuery('password')}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <SecurityIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                Account Security
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                cursor: 'pointer'
              }
            }}
            onClick={() => setSearchQuery('virtual')}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <VideoCallIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                Virtual Visits
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                cursor: 'pointer'
              }
            }}
            onClick={() => navigate('/patient/ai-assistant')}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <SmartToyIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                AI Assistant
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* FAQs */}
      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 4 }}>
        Frequently Asked Questions
      </Typography>
      
      {filteredFaqs.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            textAlign: 'center',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Typography variant="body1" color="text.secondary" paragraph>
            No results found for "{searchQuery}"
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSearchQuery('')}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Clear Search
          </Button>
        </Paper>
      ) : (
        filteredFaqs.map((category, categoryIndex) => (
          <Box key={categoryIndex} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {category.icon}
              <Typography variant="subtitle1" fontWeight={600} sx={{ ml: 1 }}>
                {category.category}
              </Typography>
            </Box>
            
            {category.questions.map((faq, faqIndex) => (
              <Accordion
                key={faqIndex}
                expanded={expandedFaq === `${categoryIndex}-${faqIndex}`}
                onChange={handleFaqChange(`${categoryIndex}-${faqIndex}`)}
                elevation={0}
                sx={{
                  mb: 1,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: '12px !important',
                  '&:before': {
                    display: 'none',
                  },
                  '&.Mui-expanded': {
                    margin: 0,
                    mb: 1,
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    borderRadius: 3,
                    '&.Mui-expanded': {
                      minHeight: 48,
                    }
                  }}
                >
                  <Typography fontWeight={500}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ))
      )}
      
      {/* Contact Support */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Contact Support
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
            </Typography>
            
            <form onSubmit={handleContactSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactFormChange}
                    variant="outlined"
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactFormChange}
                    variant="outlined"
                    margin="normal"
                    type="email"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactFormChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactFormChange}
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3
                    }}
                  >
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Other Ways to Get Help
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose the option that works best for you.
            </Typography>
            
            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <PhoneIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Call Us"
                  secondary="Available Monday-Friday, 9am-5pm"
                />
                <Chip
                  label="1-800-HEALTH"
                  variant="outlined"
                  color="primary"
                  size="small"
                />
              </ListItem>
              <Divider component="li" />
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Email Support"
                  secondary="We'll respond within 24 hours"
                />
                <Chip
                  label="support@soulspace.com"
                  variant="outlined"
                  color="primary"
                  size="small"
                />
              </ListItem>
              <Divider component="li" />
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <ChatIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Live Chat"
                  secondary="Chat with our support team in real-time"
                />
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Start Chat
                </Button>
              </ListItem>
              <Divider component="li" />
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <SmartToyIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="AI Assistant"
                  secondary="Get instant answers to common questions"
                />
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => navigate('/patient/ai-assistant')}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Ask AI
                </Button>
              </ListItem>
            </List>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Need Immediate Medical Assistance?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                If you're experiencing a medical emergency, please call 911 or go to your nearest emergency room.
              </Typography>
              <Button
                variant="contained"
                color="error"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none'
                }}
              >
                Emergency Resources
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HelpCenterPage;
