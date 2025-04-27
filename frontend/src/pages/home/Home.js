import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  Paper,
  Stack,
  Divider,
  alpha,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import HomeChatBot from '../../components/home/HomeChatBot';
import {
  MonitorHeart,
  Medication,
  Security,
  Speed,
  Psychology,
  ArrowForward,
  Star,
  EmojiEvents,
  WorkspacePremium,
  Groups,
  AutoGraph,
  PersonAdd,
  Settings,
  Facebook,
  Twitter,
  LinkedIn,
  WaterDrop,
  FitnessCenter,
  Restaurant,
  Bedtime,
  SelfImprovement,
  Air,
  Bloodtype,
  WbSunny,
  Favorite,
  TipsAndUpdates,
  DeviceHub,
  Watch,
  SmartToy,
  HealthAndSafety,
  LocalHospital,
  DirectionsRun,
  MonitorWeight,
  Spa,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import FloatingMedical from '../../components/3d/FloatingMedical';
import ParticleBackground from '../../components/animations/ParticleBackground';


const FeatureCard = ({ icon, title, description, index }) => {
  const theme = useTheme();

  // Generate a unique gradient for each card
  const gradients = [
    'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(45, 212, 191, 0.15) 100%)',
    'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)',
    'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
    'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%)',
    'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
  ];

  const iconColors = [
    '#4f46e5', // Indigo
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
  ];

  const cardIndex = index % gradients.length;
  const gradient = gradients[cardIndex];
  const iconColor = iconColors[cardIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          transition: 'all 0.3s ease',
          border: `1px solid ${alpha(iconColor, 0.2)}`,
          boxShadow: `0 10px 30px ${alpha(iconColor, 0.1)}`,
          background: gradient,
          overflow: 'hidden',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-12px)',
            boxShadow: `0 15px 35px ${alpha(iconColor, 0.2)}`,
            '& .feature-icon': {
              transform: 'scale(1.1) rotate(5deg)',
            },
            '& .feature-title': {
              color: iconColor,
            },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `radial-gradient(circle, ${alpha(iconColor, 0.2)} 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
          },
        }}
      >
        <CardContent sx={{ p: 3, zIndex: 1, position: 'relative' }}>
          <Box
            className="feature-icon"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.5,
              borderRadius: '16px',
              background: alpha(iconColor, 0.1),
              mb: 2,
              transition: 'transform 0.3s ease',
            }}
          >
            {React.cloneElement(icon, {
              sx: {
                fontSize: 40,
                color: iconColor,
                filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.2))',
              }
            })}
          </Box>
          <Typography
            variant="h6"
            gutterBottom
            className="feature-title"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 700,
              transition: 'color 0.3s ease',
              mb: 1.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.7,
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Unused component - kept for future implementation
const TestimonialCard = ({ name, role, image, content, rating }) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : 'background.paper',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={image}
            sx={{
              width: 56,
              height: 56,
              mr: 2,
              border: `2px solid ${theme.palette.primary.main}`,
            }}
          />
          <Box>
            <Typography variant="h6" gutterBottom>
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {role}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', mb: 2 }}>
          {[...Array(rating)].map((_, index) => (
            <Star key={index} sx={{ color: theme.palette.warning.main }} />
          ))}
        </Box>
        <Typography variant="body1" sx={{ flex: 1, fontStyle: 'italic' }}>
          "{content}"
        </Typography>
      </Card>
    </motion.div>
  );
};

// Unused component - kept for future implementation
const AchievementCard = ({ icon, title, value, description }) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          height: '100%',
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.light, 0.1),
          borderRadius: 2,
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {React.cloneElement(icon, {
            sx: { fontSize: 40, color: theme.palette.primary.main, mr: 2 }
          })}
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            {value}
          </Typography>
        </Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Paper>
    </motion.div>
  );
};

const ScrollReveal = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
};

// Unused component - kept for future implementation
const AnimatedNumber = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.replace(/,/g, ''));
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start > end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
};

// Health tips data
const healthTipsData = [
  {
    title: 'Stay Hydrated',
    content: 'Drink at least 8 glasses of water daily to maintain optimal health and support bodily functions.',
    iconName: 'WaterDrop',
    color: '#2196f3',
  },
  {
    title: 'Regular Exercise',
    content: 'Aim for at least 30 minutes of moderate exercise 5 days a week to improve cardiovascular health.',
    iconName: 'FitnessCenter',
    color: '#f44336',
  },
  {
    title: 'Balanced Diet',
    content: 'Include fruits, vegetables, whole grains, and lean proteins in your meals for better nutrition.',
    iconName: 'Restaurant',
    color: '#4caf50',
  },
  {
    title: 'Adequate Sleep',
    content: 'Get 7-9 hours of quality sleep each night to support mental and physical recovery.',
    iconName: 'Bedtime',
    color: '#9c27b0',
  },
  {
    title: 'Stress Management',
    content: 'Practice mindfulness, meditation, or deep breathing to reduce stress and improve mental health.',
    iconName: 'SelfImprovement',
    color: '#ff9800',
  },
  {
    title: 'Air Quality',
    content: 'Ensure good ventilation in your living spaces and spend time outdoors in nature when possible.',
    iconName: 'Air',
    color: '#00bcd4',
  },
];

// Wearable device monitoring data (sample)
const wearableData = {
  heartRate: {
    current: 72,
    min: 58,
    max: 142,
    labels: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'],
    data: [68, 72, 110, 95, 75, 72, 70],
  },
  bloodPressure: {
    systolic: 118,
    diastolic: 75,
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    systolicData: [120, 118, 122, 119, 121, 117, 118],
    diastolicData: [80, 78, 82, 79, 77, 75, 76],
  },
  oxygenLevel: {
    current: 98,
    min: 95,
    max: 99,
  },
  stressLevel: {
    current: 'Low',
    score: 25,
  },
  steps: {
    today: 8742,
    goal: 10000,
    weekly: [6500, 7200, 8100, 9500, 7800, 5400, 8742],
  },
};

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  // Removed unused variable: isMobile

  const features = [
    {
      icon: <MonitorHeart />,
      title: "Patient Monitoring",
      description: "Real-time monitoring of patient vitals and health metrics with instant alerts for critical changes."
    },
    {
      icon: <Medication />,
      title: "Prescription Management",
      description: "Digital prescription system with drug interaction checks and automated refill reminders."
    },
    {
      icon: <Security />,
      title: "Secure Records",
      description: "HIPAA-compliant secure storage and sharing of patient medical records and history."
    },
    {
      icon: <Speed />,
      title: "Quick Access",
      description: "Lightning-fast access to patient information, test results, and medical history."
    },
    {
      icon: <Psychology />,
      title: "AI-Powered Insights",
      description: "Advanced analytics and AI-driven insights for better patient care decisions."
    }
  ];

  // Unused array - kept for future implementation
  const achievements = [
    {
      icon: <EmojiEvents />,
      title: "Industry Recognition",
      value: "15+",
      description: "Awards for excellence in healthcare technology innovation"
    },
    {
      icon: <WorkspacePremium />,
      title: "Certifications",
      value: "ISO 27001",
      description: "Certified for highest security standards in healthcare"
    },
    {
      icon: <Groups />,
      title: "Global Reach",
      value: "25+",
      description: "Countries using our healthcare solutions"
    },
    {
      icon: <AutoGraph />,
      title: "Growth Rate",
      value: "200%",
      description: "Year-over-year growth in user adoption"
    }
  ];

  // Unused array - kept for future implementation
  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief of Medicine, Metro Hospital",
      image: "/testimonials/sarah.jpg",
      rating: 5,
      content: "SoulSpace has revolutionized how we manage patient care. The AI-powered insights have been invaluable for making informed decisions."
    },
    {
      name: "Dr. Michael Chen",
      role: "Family Practice Physician",
      image: "/testimonials/michael.jpg",
      rating: 5,
      content: "The interface is intuitive and the patient monitoring features are exceptional. It's transformed my practice workflow."
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Healthcare Administrator",
      image: "/testimonials/emily.jpg",
      rating: 5,
      content: "The security features and HIPAA compliance give us peace of mind. Best healthcare management system we've used."
    }
  ];

  return (
    <Box sx={{
      bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
      transition: 'background-color 0.3s ease',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <ParticleBackground />

      {/* AI Chatbot */}
      <HomeChatBot />



      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          backgroundImage: 'url("/0139-Diagnostic-AI-700x290px.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, rgba(79, 70, 229, 0.97) 0%, rgba(45, 212, 191, 0.90) 100%)`
              : `linear-gradient(135deg, rgba(79, 70, 229, 0.97) 0%, rgba(45, 212, 191, 0.90) 100%)`,
            zIndex: 1
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("/pattern-dots.png")',
            backgroundSize: '20px',
            opacity: 0.1,
            zIndex: 1,
            animation: 'moveBackground 60s linear infinite',
          },
          '@keyframes moveBackground': {
            '0%': { backgroundPosition: '0 0' },
            '100%': { backgroundPosition: '100px 100px' },
          },
          minHeight: { xs: 'auto', md: '100vh' },
          py: { xs: 12, md: 0 },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <ParticleBackground />

        {/* Floating Elements */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }}>
          {/* Medical Icons */}
          {[
            { icon: '⚕️', size: '2.5rem', left: '10%', top: '15%' },
            { icon: '🏥', size: '3rem', left: '85%', top: '25%' },
            { icon: '❤️', size: '2rem', left: '75%', top: '65%' },
            { icon: '🔬', size: '2.2rem', left: '15%', top: '75%' },
            { icon: '💊', size: '1.8rem', left: '45%', top: '85%' },
            { icon: '🩺', size: '2.3rem', left: '90%', top: '80%' },
          ].map((item, index) => (
            <motion.div
              key={index}
              style={{
                position: 'absolute',
                left: item.left,
                top: item.top,
                fontSize: item.size,
                opacity: 0.3,
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))',
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                rotate: [0, 5, 0, -5, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 5 + index,
                repeat: Infinity,
                delay: index * 0.7,
                ease: "easeInOut"
              }}
            >
              {item.icon}
            </motion.div>
          ))}

          {/* Glowing Orbs */}
          {[...Array(8)].map((_, index) => (
            <motion.div
              key={`orb-${index}`}
              style={{
                position: 'absolute',
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 90 + 5}%`,
                width: `${Math.random() * 30 + 10}px`,
                height: `${Math.random() * 30 + 10}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(165,243,252,0.7) 0%, rgba(79,70,229,0.1) 70%)`,
                boxShadow: '0 0 15px rgba(165,243,252,0.5)',
              }}
              animate={{
                x: [0, Math.random() * 50 - 25, 0],
                y: [0, Math.random() * 50 - 25, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: index * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </Box>

        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            zIndex: 2
          }}
        >
          <Grid container spacing={{ xs: 8, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Typography
                  variant="h1"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontSize: { xs: '2.5rem', md: '4.5rem' },
                    fontWeight: 800,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    mb: 4,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1
                  }}
                >
                  Revolutionize Your
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    style={{
                      display: 'block',
                      background: 'linear-gradient(45deg, #fff, #a5f3fc)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginTop: '0.2em'
                    }}
                  >
                    Healthcare Experience
                  </motion.span>
                </Typography>

                {/* Quick Stats */}
                <Box sx={{ mb: 4 }}>
                  <Grid container spacing={2}>
                    {[
                      { icon: <Speed />, label: 'Faster Workflow', value: '300%' },
                      { icon: <Groups />, label: 'Happy Patients', value: '50K+' },
                      { icon: <Security />, label: 'Data Security', value: '99.9%' }
                    ].map((stat, index) => (
                      <Grid item xs={4} key={index}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.8 + (index * 0.2) }}
                        >
                          <Paper
                            sx={{
                              p: 1.5,
                              textAlign: 'center',
                              background: alpha(theme.palette.background.paper, 0.1),
                              backdropFilter: 'blur(10px)',
                              borderRadius: 2,
                              border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                            }}
                          >
                            {React.cloneElement(stat.icon, { sx: { fontSize: 24, mb: 1, color: 'white' } })}
                            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
                              {stat.value}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {stat.label}
                            </Typography>
                          </Paper>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    maxWidth: '600px',
                    lineHeight: 1.8,
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  Experience the future of medical management with our comprehensive solution. Streamline your workflow, enhance patient care, and boost efficiency.
                </Typography>

                {/* Trust Badges */}
                <Box sx={{ mb: 4 }}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <Stack direction="row" spacing={3} alignItems="center">
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Trusted by:
                      </Typography>
                      {['HIPAA', 'ISO 27001', 'GDPR'].map((cert, index) => (
                        <Chip
                          key={index}
                          label={cert}
                          size="small"
                          icon={<Security sx={{ fontSize: 16 }} />}
                          sx={{
                            bgcolor: alpha(theme.palette.background.paper, 0.1),
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                            color: 'white',
                          }}
                        />
                      ))}
                    </Stack>
                  </motion.div>
                </Box>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={3}
                  sx={{
                    mt: { xs: 4, md: 6 },
                    width: '100%'
                  }}
                >
                  {!isAuthenticated && (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/register')}
                        endIcon={<ArrowForward />}
                        sx={{
                          py: 2.2,
                          px: 5,
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          borderRadius: 3,
                          background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
                          boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
                          textTransform: 'none',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 15px 30px rgba(79, 70, 229, 0.5)',
                            background: 'linear-gradient(90deg, #4338ca 0%, #0891b2 100%)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Get Started Free
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        sx={{
                          color: 'white',
                          borderColor: '#a5f3fc',
                          borderWidth: 2,
                          py: 2.2,
                          px: 5,
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          borderRadius: 3,
                          textTransform: 'none',
                          backdropFilter: 'blur(4px)',
                          '&:hover': {
                            borderColor: '#a5f3fc',
                            backgroundColor: 'rgba(165, 243, 252, 0.1)',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 10px 20px rgba(165, 243, 252, 0.2)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => navigate('/login')}
                      >
                        Login
                      </Button>
                    </>
                  )}
                  {isAuthenticated && (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/dashboard')}
                      endIcon={<ArrowForward />}
                      sx={{
                        py: 2.2,
                        px: 5,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        textTransform: 'none',
                        background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
                        boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 15px 30px rgba(79, 70, 229, 0.5)',
                          background: 'linear-gradient(90deg, #4338ca 0%, #0891b2 100%)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  )}
                </Stack>
              </motion.div>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                position: 'relative',
                order: { xs: 1, md: 2 },
                mb: { xs: 4, md: 0 },
                mt: { xs: 2, md: 0 }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  maxWidth: { xs: '260px', sm: '300px', md: '100%' },
                  mx: 'auto',
                  transform: { xs: 'scale(0.9)', md: 'scale(1)' },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    right: -20,
                    bottom: -20,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
                    borderRadius: '50%',
                    animation: 'pulse 3s infinite',
                  },
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(0.95)',
                      opacity: 0.5,
                    },
                    '50%': {
                      transform: 'scale(1)',
                      opacity: 0.8,
                    },
                    '100%': {
                      transform: 'scale(0.95)',
                      opacity: 0.5,
                    },
                  },
                }}
              >
                <FloatingMedical />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ my: { xs: 8, md: 12 } }}>
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
            Features
          </Typography>
        </ScrollReveal>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard {...feature} index={index} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{
        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : 'background.paper',
        py: { xs: 8, md: 12 }
      }}>
        <Container maxWidth="lg">
          <ScrollReveal>
            <Typography
              variant="h2"
              component="h2"
              textAlign="center"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              How It Works
            </Typography>
            <Typography
              variant="h5"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
            >
              Get started with SoulSpace in three simple steps
            </Typography>
          </ScrollReveal>

          <Grid container spacing={4}>
            {[
              {
                icon: <PersonAdd sx={{ fontSize: 48 }} />,
                title: "1. Create Your Account",
                description: "Sign up in minutes with our simple onboarding process"
              },
              {
                icon: <Settings sx={{ fontSize: 48 }} />,
                title: "2. Customize Your Setup",
                description: "Configure your workspace to match your practice needs"
              },
              {
                icon: <Speed sx={{ fontSize: 48 }} />,
                title: "3. Start Managing",
                description: "Begin streamlining your healthcare practice immediately"
              }
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      textAlign: 'center',
                      bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.light, 0.1),
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                      },
                    }}
                  >
                    <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>
                      {step.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {step.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {step.description}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Wearable Device Section */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 10, md: 16 },
          overflow: 'hidden',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(45, 212, 191, 0.2) 100%)'
            : 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(45, 212, 191, 0.1) 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("/pattern-dots.svg")',
            backgroundSize: '30px',
            opacity: 0.1,
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <ScrollReveal>
                <Typography
                  variant="h2"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3,
                  }}
                >
                  Real-Time Health Monitoring
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mb: 4, fontWeight: 500, lineHeight: 1.6 }}
                >
                  Stay connected to your health 24/7 with our advanced wearable devices
                </Typography>

                <Box sx={{ mb: 4 }}>
                  {[
                    { icon: <MonitorHeart />, title: 'Continuous Monitoring', description: 'Track vital signs in real-time with hospital-grade accuracy' },
                    { icon: <Favorite />, title: 'Heart Rate & ECG', description: 'Monitor heart rate, rhythm, and detect irregularities early' },
                    { icon: <WbSunny />, title: 'Blood Oxygen Levels', description: 'Keep track of SpO2 levels and receive alerts for concerning changes' },
                    { icon: <Psychology />, title: 'Stress Management', description: 'Monitor stress levels and receive guided breathing exercises' },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        mb: 2.5,
                        p: 2,
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: alpha(theme.palette.background.paper, 0.5),
                          transform: 'translateX(5px)',
                        }
                      }}
                    >
                      <Box
                        sx={{
                          mr: 2,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alpha('#4f46e5', 0.1),
                          color: '#4f46e5',
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
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
                  onClick={() => navigate('/register')}
                >
                  Get Your Wearable Device
                </Button>
              </ScrollReveal>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Box
                    component="img"
                    src="/wearable-device.png"
                    alt="Wearable Health Device"
                    sx={{
                      width: '100%',
                      maxWidth: 500,
                      height: 'auto',
                      borderRadius: 4,
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                      transform: 'perspective(1000px) rotateY(-5deg)',
                      mx: 'auto',
                      display: 'block',
                    }}
                  />

                  {/* Floating stats */}
                  {[
                    { label: 'Heart Rate', value: '72 BPM', color: '#ef4444', top: '15%', left: '-10%' },
                    { label: 'Blood Oxygen', value: '98%', color: '#3b82f6', bottom: '20%', left: '-5%' },
                    { label: 'Steps', value: '8,547', color: '#10b981', top: '10%', right: '-5%' },
                    { label: 'Sleep', value: '7.5 hrs', color: '#8b5cf6', bottom: '15%', right: '-10%' },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + (index * 0.2) }}
                      viewport={{ once: true }}
                      style={{
                        position: 'absolute',
                        top: stat.top,
                        left: stat.left,
                        bottom: stat.bottom,
                        right: stat.right,
                        zIndex: 2,
                      }}
                    >
                      <Paper
                        elevation={4}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.background.paper, 0.9)
                            : alpha(theme.palette.background.paper, 0.9),
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha(stat.color, 0.3)}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          minWidth: 100,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {stat.label}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: stat.color }}>
                          {stat.value}
                        </Typography>
                      </Paper>
                    </motion.div>
                  ))}
                </motion.div>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Health Tips Section */}
      <Box sx={{
        py: { xs: 8, md: 12 },
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.7)} 0%, ${alpha(theme.palette.secondary.dark, 0.7)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
        position: 'relative',
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
      }}>
        <Container maxWidth="lg">
          <ScrollReveal>
            <Typography
              variant="h2"
              component="h2"
              textAlign="center"
              gutterBottom
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                position: 'relative',
                zIndex: 1
              }}
            >
              Daily Health Tips
            </Typography>
            <Typography
              variant="h5"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 8, maxWidth: 800, mx: 'auto', position: 'relative', zIndex: 1 }}
            >
              Simple practices for a healthier lifestyle
            </Typography>
          </ScrollReveal>

          <Grid container spacing={4}>
            {healthTipsData.map((tip, index) => {
              // Dynamically select the icon based on iconName
              let IconComponent;
              switch(tip.iconName) {
                case 'WaterDrop': IconComponent = WaterDrop; break;
                case 'FitnessCenter': IconComponent = FitnessCenter; break;
                case 'Restaurant': IconComponent = Restaurant; break;
                case 'Bedtime': IconComponent = Bedtime; break;
                case 'SelfImprovement': IconComponent = SelfImprovement; break;
                case 'Air': IconComponent = Air; break;
                default: IconComponent = TipsAndUpdates;
              }

              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Paper
                      elevation={4}
                      sx={{
                        p: 4,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 4,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '4px',
                          background: tip.color,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(tip.color, 0.1),
                            color: tip.color,
                            width: 56,
                            height: 56,
                            mr: 2,
                            boxShadow: `0 4px 14px ${alpha(tip.color, 0.4)}`
                          }}
                        >
                          <IconComponent sx={{ fontSize: 30 }} />
                        </Avatar>
                        <Typography variant="h5" component="h3" sx={{ fontWeight: 700 }}>
                          {tip.title}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ mb: 2, flexGrow: 1 }}>
                        {tip.content}
                      </Typography>
                      <Button
                        variant="text"
                        endIcon={<ArrowForward />}
                        sx={{
                          alignSelf: 'flex-start',
                          color: tip.color,
                          '&:hover': {
                            bgcolor: alpha(tip.color, 0.1),
                          }
                        }}
                        onClick={() => navigate('/register')}
                      >
                        Learn more
                      </Button>
                    </Paper>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Wearable Device Integration Section */}
      <Container maxWidth="lg" sx={{ my: { xs: 8, md: 12 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <ScrollReveal>
              <Typography
                variant="h2"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3,
                }}
              >
                Smart Health Monitoring
              </Typography>
              <Typography
                variant="h5"
                sx={{ mb: 4, fontWeight: 500, lineHeight: 1.6 }}
              >
                Connect your wearable devices for real-time health tracking and personalized insights
              </Typography>

              <Box sx={{ mb: 4 }}>
                {[
                  { icon: <Favorite />, title: 'Heart Rate Monitoring', description: 'Track your heart rate in real-time with clinical-grade accuracy' },
                  { icon: <Bloodtype />, title: 'Blood Pressure Tracking', description: 'Monitor your blood pressure trends and receive alerts for concerning changes' },
                  { icon: <WbSunny />, title: 'Oxygen Level Monitoring', description: 'Keep track of your blood oxygen levels for optimal respiratory health' },
                  { icon: <Psychology />, title: 'Stress Management', description: 'Monitor stress levels and receive guided relaxation exercises' },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      mb: 2.5,
                      p: 2,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.light, 0.1),
                        transform: 'translateX(5px)',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.light, 0.2),
                        color: theme.palette.primary.main,
                        width: 48,
                        height: 48,
                        mr: 2,
                      }}
                    >
                      {item.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 25px rgba(79, 70, 229, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/register')}
              >
                Connect Your Device
              </Button>
            </ScrollReveal>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    right: -20,
                    bottom: -20,
                    background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, rgba(45, 212, 191, 0.05) 70%, transparent 100%)',
                    borderRadius: '50%',
                    zIndex: -1,
                  }
                }}
              >
                <Box
                  component="img"
                  src="/wearable-device.png"
                  alt="Smart Health Monitoring Device"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxWidth: 500,
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                    transition: 'all 0.5s ease',
                    '&:hover': {
                      transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
                    },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    bgcolor: 'white',
                    borderRadius: '50%',
                    p: 2,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 100,
                    height: 100,
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                      98<Typography variant="body2" component="span">%</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Oxygen
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -20,
                    left: -20,
                    bgcolor: 'white',
                    borderRadius: '50%',
                    p: 2,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 100,
                    height: 100,
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error" sx={{ fontWeight: 700 }}>
                      72<Typography variant="body2" component="span">bpm</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Heart Rate
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Integration Partners Section */}
      <Container maxWidth="lg" sx={{ my: { xs: 8, md: 12 } }}>
        <ScrollReveal>
          <Typography
            variant="h2"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Integration Partners
          </Typography>
          <Typography
            variant="h5"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
          >
            Seamlessly connect with your favorite healthcare tools
          </Typography>
        </ScrollReveal>

        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {[
            'Epic Systems',
            'Cerner',
            'Allscripts',
            'AthenaHealth',
            'NextGen',
            'eClinicalWorks'
          ].map((partner, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.light, 0.1),
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {partner}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FAQ Section */}
      <Box sx={{
        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : 'background.paper',
        py: { xs: 8, md: 12 }
      }}>
        <Container maxWidth="lg">
          <ScrollReveal>
            <Typography
              variant="h2"
              component="h2"
              textAlign="center"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Frequently Asked Questions
            </Typography>
          </ScrollReveal>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[
              {
                question: "Is SoulSpace HIPAA compliant?",
                answer: "Yes, SoulSpace is fully HIPAA compliant and maintains the highest standards of security for patient data protection."
              },
              {
                question: "Can I integrate with my existing systems?",
                answer: "SoulSpace offers seamless integration with major healthcare systems and can be customized to work with your specific setup."
              },
              {
                question: "What support options are available?",
                answer: "We provide 24/7 technical support, comprehensive documentation, and dedicated account managers for enterprise clients."
              },
              {
                question: "How long does implementation take?",
                answer: "Basic setup can be completed in minutes. Full enterprise implementation typically takes 2-4 weeks."
              }
            ].map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.light, 0.1),
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {faq.question}
                    </Typography>
                    <Typography color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ mt: { xs: 8, md: 12 }, mb: 8 }}>
        <ScrollReveal>
          <Paper
            sx={{
              p: { xs: 5, md: 8 },
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(45, 212, 191, 0.9) 100%)',
              color: 'white',
              borderRadius: 6,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(79, 70, 229, 0.3)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("/pattern-dots.png")',
                opacity: 0.1,
                zIndex: 0,
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography
                variant="h2"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  background: 'linear-gradient(90deg, #fff, #a5f3fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3,
                }}
              >
                Ready to Transform Your Healthcare?
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 5,
                  opacity: 0.9,
                  maxWidth: '700px',
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Join thousands of healthcare professionals who are revolutionizing patient care with SoulSpace
              </Typography>
              {!isAuthenticated && (
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: 'white',
                    color: '#4f46e5',
                    py: 2,
                    px: 6,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: '0 10px 20px rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.9),
                      transform: 'translateY(-4px)',
                      boxShadow: '0 15px 30px rgba(255, 255, 255, 0.4)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate('/register')}
                >
                  Start Your Free Trial Today
                </Button>
              )}
            </Box>
          </Paper>
        </ScrollReveal>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 6,
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.paper',
          color: theme.palette.text.primary,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <MonitorHeart sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    SoulSpace
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Transforming healthcare management with innovative solutions.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <IconButton
                    size="small"
                    sx={{
                      color: theme.palette.text.secondary,
                      bgcolor: alpha('#1DA1F2', 0.1),
                      '&:hover': {
                        color: '#1DA1F2',
                        bgcolor: alpha('#1DA1F2', 0.2),
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Twitter />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      color: theme.palette.text.secondary,
                      bgcolor: alpha('#0A66C2', 0.1),
                      '&:hover': {
                        color: '#0A66C2',
                        bgcolor: alpha('#0A66C2', 0.2),
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <LinkedIn />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      color: theme.palette.text.secondary,
                      bgcolor: alpha('#1877F2', 0.1),
                      '&:hover': {
                        color: '#1877F2',
                        bgcolor: alpha('#1877F2', 0.2),
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Facebook />
                  </IconButton>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Grid container spacing={4}>
                {[
                  {
                    title: 'Product',
                    items: ['Features', 'Pricing', 'Security', 'Updates'],
                  },
                  {
                    title: 'Company',
                    items: ['About Us', 'Careers', 'Press', 'Contact'],
                  },
                  {
                    title: 'Resources',
                    items: ['Blog', 'Newsletter', 'Events', 'Help Center'],
                  },
                ].map((section) => (
                  <Grid item xs={12} sm={4} key={section.title}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                      {section.title}
                    </Typography>
                    <Stack spacing={1}>
                      {section.items.map((item) => (
                        <Button
                          key={item}
                          sx={{
                            justifyContent: 'flex-start',
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.primary.main,
                            }
                          }}
                        >
                          {item}
                        </Button>
                      ))}
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            {new Date().getFullYear()} SoulSpace. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
