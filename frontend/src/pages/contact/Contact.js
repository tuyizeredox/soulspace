import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Stack,
  useTheme,
  alpha,
  Card,
  CardContent,
  Divider,
  Avatar,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Phone,
  Email,
  LocationOn,
  Send,
  AccessTime,
  CheckCircle,
  Support,
  QuestionAnswer,
  MedicalServices,
  Business,
  ArrowForward,
  HealthAndSafety,
  Healing,
} from '@mui/icons-material';

const ScrollReveal = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

const Contact = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // In a real implementation, this would send the message to the backend
    // where it would be stored and forwarded to the SuperAdmin
    console.log('Sending message to SuperAdmin:', formData);

    // Simulate API call to send message to SuperAdmin
    setTimeout(() => {
      // Success message after "sending" to SuperAdmin
      setSnackbar({
        open: true,
        message: 'Thank you! Your message has been sent to our SuperAdmin team.',
        severity: 'success',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: '',
        message: '',
      });
    }, 1000);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const contactInfo = [
    {
      icon: <Phone />,
      title: 'Phone Support',
      content: '+250784227283',
      link: 'tel:+250784227283',
      color: '#4f46e5',
      description: 'Available Monday-Friday, 8am-8pm EST',
    },
    {
      icon: <Email />,
      title: 'Email Us',
      content: 'soulspace@gmail.com',
      link: 'mailto:support@soulspace.com',
      color: '#ef4444',
      description: 'We respond to all emails within 24 hours',
    },
    {
      icon: <LocationOn />,
      title: 'Headquarters',
      content: 'Kigali, Rwanda, CA',
      link: 'https://maps.google.com',
      color: '#10b981',
      description: 'Visit us Monday-Friday, 9am-5pm PST',
    },
    {
      icon: <Support />,
      title: 'Technical Support',
      content: 'techsupportss@gmail.com',
      link: 'mailto:techsupport@soulspace.com',
      color: '#8b5cf6',
      description: 'For platform and technical assistance',
    },
  ];

  const faqItems = [
    {
      question: 'When will the SoulSpace wearable device be available?',
      answer: 'The SoulSpace wearable device is currently under development in 2025. We expect to launch it in 2027, at which point it will be available exclusively to our patients. We\'re working hard to create a cutting-edge health monitoring device with clinical-grade accuracy.',
    },
    {
      question: 'Is my health data secure?',
      answer: 'Yes, we take data security very seriously. We are designing our SoulSpace platform and upcoming wearable device with security as a top priority. All health data will be encrypted and stored in HIPAA-compliant systems. We will never share your information without your explicit consent.',
    },
    {
      question: 'How do I book an appointment?',
      answer: 'You can book appointments through your patient dashboard. Simply select your preferred hospital, doctor, date, and time. You can choose between in-person or telehealth appointments.',
    },
    {
      question: 'What insurance plans do you accept?',
      answer: 'We work with most major insurance providers. During the appointment booking process, you can enter your insurance information to verify coverage. When our SoulSpace wearable device launches in 2027, we plan to ensure it will be covered by most insurance plans.',
    },
  ];

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : alpha(theme.palette.primary.light, 0.1),
          py: 12,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("/pattern-dots.png")',
            opacity: 0.05,
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 800,
                    mb: 3,
                    background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Get in Touch
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.6 }}
                >
                  Have questions or need assistance? We're here to help! Reach out to our team and we'll respond as soon as possible.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Phone />}
                    href="tel:+15551234567"
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)',
                      '&:hover': {
                        boxShadow: '0 15px 30px rgba(79, 70, 229, 0.4)',
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Call Us
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Email />}
                    href="mailto:support@soulspace.com"
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 3,
                      borderColor: '#4f46e5',
                      color: '#4f46e5',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#4f46e5',
                        backgroundColor: alpha('#4f46e5', 0.1),
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Email Us
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2572&q=80"
                  alt="Contact Us"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    mx: 'auto',
                    display: 'block',
                    objectFit: 'cover',
                    aspectRatio: '16/9',
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 12 }}>
        <Grid container spacing={6}>
          {/* Contact Information */}
          <Grid item xs={12} md={5} lg={4}>
            <ScrollReveal>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
                Contact Information
              </Typography>
              <Stack spacing={3}>
                {contactInfo.map((info, index) => (
                  <Card
                    key={index}
                    sx={{
                      borderRadius: 4,
                      transition: 'all 0.3s ease',
                      border: `1px solid ${alpha(info.color, 0.2)}`,
                      boxShadow: `0 10px 30px ${alpha(info.color, 0.1)}`,
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 15px 35px ${alpha(info.color, 0.2)}`,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: info.color,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(info.color, 0.1),
                            color: info.color,
                            width: 56,
                            height: 56,
                            mr: 2,
                          }}
                        >
                          {React.cloneElement(info.icon, { sx: { fontSize: 28 } })}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: info.color }}>
                            {info.title}
                          </Typography>
                          <Typography
                            component="a"
                            href={info.link}
                            sx={{
                              color: theme.palette.text.primary,
                              textDecoration: 'none',
                              fontWeight: 500,
                              display: 'block',
                              mb: 1,
                              '&:hover': { color: info.color },
                            }}
                          >
                            {info.content}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {info.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>

              {/* Business Hours */}
              <Box sx={{ mt: 4, p: 3, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTime sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Business Hours
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Monday - Friday:</Typography>
                    <Typography fontWeight={500}>8:00 AM - 8:00 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Saturday:</Typography>
                    <Typography fontWeight={500}>9:00 AM - 5:00 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Sunday:</Typography>
                    <Typography fontWeight={500}>Closed</Typography>
                  </Box>
                </Stack>
              </Box>
            </ScrollReveal>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={7} lg={8}>
            <ScrollReveal delay={0.2}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
                Send Us a Message
              </Typography>
              <Paper
                component="form"
                onSubmit={handleSubmit}
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                      <InputLabel id="inquiry-type-label">Inquiry Type</InputLabel>
                      <Select
                        labelId="inquiry-type-label"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        label="Inquiry Type"
                        required
                      >
                        <MenuItem value=""><em>Select an option</em></MenuItem>
                        <MenuItem value="general">General Inquiry</MenuItem>
                        <MenuItem value="technical">Technical Support</MenuItem>
                        <MenuItem value="billing">Billing Question</MenuItem>
                        <MenuItem value="partnership">Partnership Opportunity</MenuItem>
                        <MenuItem value="feedback">Feedback</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Your Message"
                      name="message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      placeholder="Please provide as much detail as possible..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      endIcon={<Send />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 3,
                        background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)',
                        '&:hover': {
                          boxShadow: '0 15px 30px rgba(79, 70, 229, 0.4)',
                          transform: 'translateY(-3px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </ScrollReveal>
          </Grid>
        </Grid>
      </Container>

      {/* FAQ Section */}
      <Container maxWidth="lg" sx={{ mt: 12 }}>
        <ScrollReveal>
          <Typography
            variant="h2"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h5"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
          >
            Find quick answers to common questions
          </Typography>

          <Grid container spacing={4}>
            {faqItems.map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <ScrollReveal delay={index * 0.1}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 15px 35px ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          width: 40,
                          height: 40,
                          mr: 2,
                        }}
                      >
                        <QuestionAnswer sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {faq.question}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ pl: 7 }}>
                      {faq.answer}
                    </Typography>
                  </Paper>
                </ScrollReveal>
              </Grid>
            ))}
          </Grid>
        </ScrollReveal>
      </Container>

      {/* Support Options */}
      <Container maxWidth="lg" sx={{ my: 12 }}>
        <ScrollReveal>
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2
            }}
          >
            How Can We Help You?
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}
          >
            Choose the support option that works best for you
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                icon: <MedicalServices />,
                title: 'Healthcare Support',
                description: 'Get assistance with medical questions, appointment scheduling, and healthcare services.',
                color: '#4f46e5',
                action: 'Contact Medical Team',
                link: 'mailto:medical@soulspace.com'
              },
              {
                icon: <Support />,
                title: 'Technical Support',
                description: 'Troubleshoot issues with the platform, wearable devices, or account access.',
                color: '#ef4444',
                action: 'Get Technical Help',
                link: 'mailto:techsupport@soulspace.com'
              },
              {
                icon: <Business />,
                title: 'Business Inquiries',
                description: 'Explore partnership opportunities, integrations, or enterprise solutions.',
                color: '#10b981',
                action: 'Business Contact',
                link: 'mailto:business@soulspace.com'
              },
              {
                icon: <HealthAndSafety />,
                title: 'Insurance & Billing',
                description: 'Get help with insurance verification, billing questions, or payment options.',
                color: '#8b5cf6',
                action: 'Billing Support',
                link: 'mailto:billing@soulspace.com'
              },
            ].map((option, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <ScrollReveal delay={index * 0.1}>
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: 3,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: alpha(option.color, 0.1),
                        color: option.color,
                        width: 80,
                        height: 80,
                        mb: 2,
                        boxShadow: `0 8px 20px ${alpha(option.color, 0.3)}`,
                      }}
                    >
                      {React.cloneElement(option.icon, { sx: { fontSize: 40 } })}
                    </Avatar>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                      {option.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                      {option.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      component="a"
                      href={option.link}
                      endIcon={<ArrowForward />}
                      sx={{
                        borderColor: option.color,
                        color: option.color,
                        '&:hover': {
                          borderColor: option.color,
                          backgroundColor: alpha(option.color, 0.1),
                        },
                      }}
                    >
                      {option.action}
                    </Button>
                  </Box>
                </ScrollReveal>
              </Grid>
            ))}
          </Grid>
        </ScrollReveal>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
    </Box>
  );
};

export default Contact;
