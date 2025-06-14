import React, { useState, useEffect, useRef } from 'react';
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
  useMediaQuery,
} from '@mui/material';
import SEOMetaTags from '../../components/seo/SEOMetaTags';
import HomeChatBot from '../../components/home/HomeChatBot';
// Import all required icons
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
  HealthAndSafety,
  LocalHospital,
  DirectionsRun,
  EventAvailable,
} from '@mui/icons-material';

// Import icons used in the Virtual Consultation and AI Health Assistant sections
// These are imported separately to ensure they're properly recognized
import VideoCall from '@mui/icons-material/VideoCall';
import Person from '@mui/icons-material/Person';
import SmartToy from '@mui/icons-material/SmartToy';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import FloatingMedical from '../../components/3d/FloatingMedical';
import GamifiedBackground from '../../components/animations/GamifiedBackground';


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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -12, transition: { duration: 0.2 } }}
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
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(iconColor, 0.2)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
            : gradient,
          backdropFilter: 'blur(10px)',
          overflow: 'hidden',
          position: 'relative',
          '&:hover': {
            boxShadow: `0 15px 35px ${alpha(iconColor, 0.2)}`,
            '& .feature-icon': {
              transform: 'scale(1.1) rotate(5deg)',
              boxShadow: `0 10px 25px ${alpha(iconColor, 0.4)}`,
            },
            '& .feature-title': {
              color: iconColor,
            },
            '&::after': {
              opacity: 1,
            }
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
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${iconColor}, transparent)`,
            opacity: 0.3,
            transition: 'opacity 0.3s ease',
          }
        }}
      >
        <CardContent sx={{ p: 3, zIndex: 1, position: 'relative' }}>
          <Box
            className="feature-icon"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              borderRadius: '20px',
              background: alpha(iconColor, 0.1),
              mb: 2.5,
              transition: 'all 0.3s ease',
              boxShadow: `0 5px 15px ${alpha(iconColor, 0.2)}`,
            }}
          >
            {React.cloneElement(icon, {
              sx: {
                fontSize: 40,
                color: iconColor,
                filter: `drop-shadow(0 2px 5px ${alpha(iconColor, 0.5)})`,
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
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -5,
                left: 0,
                width: '40px',
                height: '2px',
                background: iconColor,
                borderRadius: '2px',
              }
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

// Components removed to fix linting errors

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

// Component removed to fix linting errors

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

// Data removed to fix linting errors

// Component removed to fix linting errors

// Component removed to fix linting errors

// Component removed to fix linting errors

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Commented out to fix linting error

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
      <SEOMetaTags 
        title="SoulSpace Health - Advanced Healthcare Management System"
        description="SoulSpace Health provides comprehensive healthcare management solutions with AI-powered insights, patient monitoring, and secure medical records."
        keywords="healthcare, medical management, patient monitoring, health records, AI healthcare, medical system, healthcare platform"
        canonicalUrl="/"
        ogImage="/favicons/favicon-512x512.png"
      />
      <GamifiedBackground />

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
          // Adjusted height for better responsiveness
          minHeight: { 
            xs: 'auto', 
            sm: 'calc(100vh - 64px)', 
            md: '90vh', 
            lg: '85vh' 
          },
          // Improved padding for different screen sizes
          py: { xs: 6, sm: 8, md: 6, lg: 8 },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <GamifiedBackground />

        {/* Floating Elements - Reduced quantity and opacity for less distraction */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }}>
          {/* Medical Icons - Reduced number and made more subtle */}
          {[
            { icon: '⚕️', size: '2rem', left: '10%', top: '15%' },
            { icon: '🏥', size: '2.5rem', left: '85%', top: '25%' },
            { icon: '❤️', size: '1.8rem', left: '75%', top: '65%' },
            { icon: '🔬', size: '2rem', left: '15%', top: '75%' },
          ].map((item, index) => (
            <motion.div
              key={index}
              style={{
                position: 'absolute',
                left: item.left,
                top: item.top,
                fontSize: item.size,
                opacity: 0.2, // Reduced opacity
                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))',
              }}
              animate={{
                y: [0, -15, 0], // Reduced movement
                x: [0, 8, 0],
                rotate: [0, 3, 0, -3, 0],
                opacity: [0.2, 0.4, 0.2],
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

          {/* Glowing Orbs - Reduced number and size */}
          {[...Array(5)].map((_, index) => (
            <motion.div
              key={`orb-${index}`}
              style={{
                position: 'absolute',
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 90 + 5}%`,
                width: `${Math.random() * 20 + 8}px`, // Smaller orbs
                height: `${Math.random() * 20 + 8}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(165,243,252,0.6) 0%, rgba(79,70,229,0.1) 70%)`,
                boxShadow: '0 0 12px rgba(165,243,252,0.4)',
              }}
              animate={{
                x: [0, Math.random() * 40 - 20, 0], // Reduced movement
                y: [0, Math.random() * 40 - 20, 0],
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: Math.random() * 4 + 4,
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
            zIndex: 2,
            px: { xs: 2, sm: 3, md: 4 } // Added horizontal padding for better spacing
          }}
        >
          <Grid 
            container 
            spacing={{ xs: 4, sm: 5, md: 6 }} // Improved spacing between grid items
            alignItems="center"
          >
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
                    // Optimized font sizes for better readability on different devices
                    fontSize: { 
                      xs: '2rem', 
                      sm: '2.4rem', 
                      md: '2.8rem', 
                      lg: '3.5rem' 
                    },
                    fontWeight: 800,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    mb: { xs: 2, sm: 2.5, md: 3 }, // Reduced bottom margin
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2 // Improved line height for better readability
                  }}
                >
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Revolutionize Your
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    style={{
                      display: 'block',
                      background: 'linear-gradient(45deg, #fff, #a5f3fc)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginTop: '0.2em',
                      position: 'relative'
                    }}
                  >
                    Healthcare Experience
                    <Box
                      component="span"
                      sx={{
                        position: 'absolute',
                        width: { xs: '40px', sm: '50px', md: '60px' }, // Responsive size
                        height: { xs: '40px', sm: '50px', md: '60px' },
                        right: { xs: '-5px', sm: '-10px', md: '-20px' },
                        top: { xs: '-10px', sm: '-15px', md: '-20px' },
                        background: 'url("/sparkle.svg")',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        display: { xs: 'none', sm: 'block' },
                        animation: 'sparkle 2s ease-in-out infinite',
                        '@keyframes sparkle': {
                          '0%': { transform: 'scale(1) rotate(0deg)', opacity: 0.7 },
                          '50%': { transform: 'scale(1.2) rotate(15deg)', opacity: 1 },
                          '100%': { transform: 'scale(1) rotate(0deg)', opacity: 0.7 },
                        }
                      }}
                    />
                  </motion.span>
                </Typography>

                {/* Quick Stats - Improved for better professional look */}
                <Box sx={{ mb: { xs: 2.5, md: 3.5 } }}>
                  <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
                    {[
                      { icon: <Speed />, label: 'Faster Workflow', value: '300%', color: '#4f46e5' },
                      { icon: <Groups />, label: 'Happy Patients', value: '50K+', color: '#06b6d4' },
                      { icon: <Security />, label: 'Data Security', value: '99.9%', color: '#a5f3fc' }
                    ].map((stat, index) => (
                      <Grid item xs={4} key={index}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.8 + (index * 0.2) }}
                          whileHover={{
                            y: -3, // Reduced hover movement
                            transition: { duration: 0.2 }
                          }}
                        >
                          <Paper
                            sx={{
                              p: { xs: 1.2, sm: 1.5, md: 1.8 }, // Better padding for different screens
                              textAlign: 'center',
                              background: alpha(theme.palette.background.paper, 0.1),
                              backdropFilter: 'blur(10px)',
                              borderRadius: 2,
                              border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                              position: 'relative',
                              overflow: 'hidden',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: '2px',
                                background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                                animation: `pulse-${index} 2s infinite`,
                              },
                              [`@keyframes pulse-${index}`]: {
                                '0%': { opacity: 0.5, transform: 'scaleX(0.5)' },
                                '50%': { opacity: 1, transform: 'scaleX(1)' },
                                '100%': { opacity: 0.5, transform: 'scaleX(0.5)' },
                              }
                            }}
                          >
                            {React.cloneElement(stat.icon, {
                              sx: {
                                fontSize: { xs: 18, sm: 20, md: 24 }, // Better icon sizing
                                mb: { xs: 0.5, sm: 0.75, md: 1 },
                                color: 'white',
                                filter: `drop-shadow(0 0 3px ${stat.color})`
                              }
                            })}
                            <Typography
                              variant="h6"
                              sx={{
                                fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }, // Better font sizing
                                fontWeight: 700,
                                textShadow: `0 0 8px ${stat.color}`
                              }}
                            >
                              {stat.value}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                opacity: 0.9, // Increased opacity for better readability
                                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                                display: 'block'
                              }}
                            >
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
                    mb: { xs: 2.5, sm: 3, md: 3.5 }, // Better spacing
                    opacity: 0.95, // Increased opacity for better readability
                    maxWidth: '600px',
                    lineHeight: 1.6, // Improved line height
                    // Better font sizing for different screens
                    fontSize: { 
                      xs: '0.9rem', 
                      sm: '1rem', 
                      md: '1.1rem', 
                      lg: '1.2rem' 
                    },
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                    position: 'relative',
                    pl: { md: 2 }, // Added left padding for desktop to accommodate the line
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '0',
                      bottom: '0',
                      width: '3px',
                      background: 'linear-gradient(to bottom, #4f46e5, #06b6d4)',
                      borderRadius: '4px',
                      display: { xs: 'none', md: 'block' }
                    }
                  }}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                  >
                    Experience the future of medical management with our comprehensive solution. Streamline your workflow, enhance patient care, and boost efficiency with AI-powered insights.
                  </motion.span>
                </Typography>

                {/* Trust Badges - Improved for better professional look */}
                <Box sx={{ mb: { xs: 2.5, sm: 3, md: 3.5 } }}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 1, sm: 2, md: 3 }}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      sx={{
                        p: { xs: 1.5, sm: 1.8, md: 2 }, // Better padding
                        borderRadius: 2,
                        background: alpha(theme.palette.background.paper, 0.05),
                        backdropFilter: 'blur(8px)',
                        border: `1px dashed ${alpha(theme.palette.common.white, 0.2)}`,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.95, // Increased opacity
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' }, // Better font sizing
                          textShadow: '0 0 5px rgba(255,255,255,0.3)'
                        }}
                      >
                        Trusted by:
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={{ xs: 1, sm: 1.5, md: 2 }}
                        flexWrap="wrap"
                        sx={{
                          '& .MuiChip-root': {
                            my: { xs: 0.5, sm: 0 }
                          }
                        }}
                      >
                        {[
                          { label: 'HIPAA', color: '#4f46e5' },
                          { label: 'ISO 27001', color: '#06b6d4' },
                          { label: 'GDPR', color: '#a5f3fc' }
                        ].map((cert, index) => (
                          <Chip
                            key={index}
                            label={cert.label}
                            size="small"
                            icon={<Security sx={{ fontSize: { xs: 14, sm: 16 } }} />} // Responsive icon size
                            sx={{
                              bgcolor: alpha(cert.color, 0.2),
                              backdropFilter: 'blur(10px)',
                              border: `1px solid ${alpha(cert.color, 0.4)}`,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' }, // Better font sizing
                              height: { xs: 24, sm: 28, md: 32 }, // Better height for different screens
                              '& .MuiChip-icon': {
                                color: cert.color
                              },
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: alpha(cert.color, 0.3),
                                transform: 'translateY(-2px)'
                              }
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </motion.div>
                </Box>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 2, sm: 2.5, md: 3 }}
                    sx={{
                      mt: { xs: 2.5, sm: 3, md: 4 }, // Reduced top margin
                      width: '100%'
                    }}
                  >
                    {!isAuthenticated && (
                      <>
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => navigate('/register')}
                          endIcon={
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: { xs: 22, sm: 24, md: 28 }, // Responsive icon container
                              height: { xs: 22, sm: 24, md: 28 },
                              borderRadius: '50%',
                              bgcolor: 'rgba(255,255,255,0.2)',
                              ml: 1
                            }}>
                              <ArrowForward sx={{ fontSize: { xs: 14, sm: 16, md: 18 } }} /> {/* Responsive icon size */}
                            </Box>
                          }
                          sx={{
                            // Better padding for different screen sizes
                            py: { xs: 1.5, sm: 1.7, md: 2 },
                            px: { xs: 2.5, sm: 3, md: 4 },
                            // Better font sizes
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                            fontWeight: 700,
                            borderRadius: 3,
                            background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
                            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)', // Reduced shadow
                            textTransform: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                              animation: 'shine 3s infinite',
                            },
                            '@keyframes shine': {
                              '0%': { left: '-100%' },
                              '20%': { left: '100%' },
                              '100%': { left: '100%' },
                            },
                            '&:hover': {
                              transform: 'translateY(-3px)', // Reduced hover movement
                              boxShadow: '0 12px 25px rgba(79, 70, 229, 0.5)',
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
                            // Better padding for different screen sizes
                            py: { xs: 1.5, sm: 1.7, md: 2 },
                            px: { xs: 2.5, sm: 3, md: 4 },
                            // Better font sizes
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                            fontWeight: 700,
                            borderRadius: 3,
                            textTransform: 'none',
                            backdropFilter: 'blur(4px)',
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: -2,
                              left: -2,
                              right: -2,
                              bottom: -2,
                              borderRadius: '16px',
                              background: 'linear-gradient(90deg, #4f46e5, #06b6d4, #4f46e5)',
                              backgroundSize: '200% 200%',
                              animation: 'gradient-border 3s linear infinite',
                              zIndex: -1,
                              opacity: 0.5,
                            },
                            '@keyframes gradient-border': {
                              '0%': { backgroundPosition: '0% 50%' },
                              '50%': { backgroundPosition: '100% 50%' },
                              '100%': { backgroundPosition: '0% 50%' },
                            },
                            '&:hover': {
                              borderColor: '#a5f3fc',
                              backgroundColor: 'rgba(165, 243, 252, 0.1)',
                              transform: 'translateY(-3px)', // Reduced hover movement
                              boxShadow: '0 8px 16px rgba(165, 243, 252, 0.2)', // Reduced shadow
                              '&::before': {
                                opacity: 0.8,
                              }
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
                        endIcon={
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: { xs: 22, sm: 24, md: 28 }, // Responsive icon container
                            height: { xs: 22, sm: 24, md: 28 },
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.2)',
                            ml: 1
                          }}>
                            <ArrowForward sx={{ fontSize: { xs: 14, sm: 16, md: 18 } }} /> {/* Responsive icon size */}
                          </Box>
                        }
                        sx={{
                          // Better padding for different screen sizes
                          py: { xs: 1.5, sm: 1.7, md: 2 },
                          px: { xs: 2.5, sm: 3, md: 4 },
                          // Better font sizes
                          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                          fontWeight: 700,
                          borderRadius: 3,
                          textTransform: 'none',
                          background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
                          boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)', // Reduced shadow
                          position: 'relative',
                          overflow: 'hidden',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                            animation: 'shine 3s infinite',
                          },
                          '@keyframes shine': {
                            '0%': { left: '-100%' },
                            '20%': { left: '100%' },
                            '100%': { left: '100%' },
                          },
                          '&:hover': {
                            transform: 'translateY(-3px)', // Reduced hover movement
                            boxShadow: '0 12px 25px rgba(79, 70, 229, 0.5)',
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
              </motion.div>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                position: 'relative',
                order: { xs: 1, md: 2 },
                mb: { xs: 3, md: 0 }, // Reduced bottom margin on mobile
                mt: { xs: 1, md: 0 }, // Reduced top margin on mobile
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  // Better responsive sizing
                  width: { xs: '240px', sm: '280px', md: '90%', lg: '95%' },
                  maxWidth: { xs: '280px', sm: '320px', md: '450px', lg: '500px' },
                  height: { xs: '240px', sm: '280px', md: '350px', lg: '400px' },
                  mx: 'auto',
                  // Better scaling for different devices
                  transform: { 
                    xs: 'scale(0.9)', 
                    sm: 'scale(0.95)', 
                    md: 'scale(1)' 
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -15,
                    left: -15,
                    right: -15,
                    bottom: -15,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
                    borderRadius: '50%',
                    animation: 'pulse 3s infinite',
                  },
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(0.97)',
                      opacity: 0.5,
                    },
                    '50%': {
                      transform: 'scale(1)',
                      opacity: 0.7,
                    },
                    '100%': {
                      transform: 'scale(0.97)',
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

      {/* Mission, Objectives, and Goals Section */}
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
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
                zIndex: 1,
                textShadow: '0 10px 30px rgba(0,0,0,0.1)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 4,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                }
              }}
            >
              Our Mission
            </Typography>
            <Typography
              variant="h5"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 6, maxWidth: 800, mx: 'auto', position: 'relative', zIndex: 1 }}
            >
              Transforming healthcare through technology, compassion, and innovation
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {/* Mission Card */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 30, rotateY: 25 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{
                  y: -10,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                  transition: { duration: 0.3 }
                }}
              >
                <Paper
                  elevation={6}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
                      : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.2)}`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`,
                    }
                  }}
                >
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        width: 60,
                        height: 60,
                        mr: 2,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'rotate(10deg)',
                        }
                      }}
                    >
                      <HealthAndSafety sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.text.primary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Our Mission
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2, flexGrow: 1, lineHeight: 1.7 }}>
                    To revolutionize healthcare management by creating an integrated ecosystem of innovative digital solutions and our proprietary SoulSpace wearable device (currently in development). Conceived in 2023 by Tuyizere Dieudonne (CEO) and Aristote (President) while in Senior 4, and now being developed as they complete Senior 6, our mission is to empower healthcare providers and improve patient outcomes by making quality healthcare more accessible, efficient, and personalized through cutting-edge technology.
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>

            {/* Objectives Card */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 30, rotateY: -25 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{
                  y: -10,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                  transition: { duration: 0.3 }
                }}
              >
                <Paper
                  elevation={6}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.2)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
                      : `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 10px 30px ${alpha(theme.palette.info.main, 0.2)}`,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      background: `linear-gradient(90deg, ${theme.palette.info.main}, transparent)`,
                    }
                  }}
                >
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        width: 60,
                        height: 60,
                        mr: 2,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.info.main, 0.4)}`,
                        border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'rotate(10deg)',
                        }
                      }}
                    >
                      <TipsAndUpdates sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.text.primary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Our Objectives
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2, flexGrow: 1 }}>
                    <Box component="ul" sx={{
                      paddingLeft: '20px',
                      marginTop: '0',
                      '& li': {
                        mb: 1.5,
                        position: 'relative',
                        '&::marker': {
                          color: theme.palette.info.main,
                        }
                      }
                    }}>
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        viewport={{ once: true }}
                      >
                        Develop our proprietary SoulSpace wearable device by 2027
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        viewport={{ once: true }}
                      >
                        Streamline healthcare workflows and reduce administrative burden
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                        viewport={{ once: true }}
                      >
                        Enhance communication between patients and healthcare providers
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                        viewport={{ once: true }}
                      >
                        Create an integrated ecosystem for real-time health monitoring
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.8 }}
                        viewport={{ once: true }}
                      >
                        Ensure the highest standards of data security and patient privacy
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.9 }}
                        viewport={{ once: true }}
                      >
                        Leverage AI to deliver personalized healthcare insights
                      </motion.li>
                    </Box>
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>

            {/* Goals Card */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 30, rotateY: 25 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{
                  y: -10,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                  transition: { duration: 0.3 }
                }}
              >
                <Paper
                  elevation={6}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
                      : `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 10px 30px ${alpha(theme.palette.success.main, 0.2)}`,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      background: `linear-gradient(90deg, ${theme.palette.success.main}, transparent)`,
                    }
                  }}
                >
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        width: 60,
                        height: 60,
                        mr: 2,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.success.main, 0.4)}`,
                        border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'rotate(10deg)',
                        }
                      }}
                    >
                      <EmojiEvents sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.text.primary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Our Goals
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2, flexGrow: 1 }}>
                    <Box component="ul" sx={{
                      paddingLeft: '20px',
                      marginTop: '0',
                      '& li': {
                        mb: 1.5,
                        position: 'relative',
                        '&::marker': {
                          color: theme.palette.success.main,
                        }
                      }
                    }}>
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                        viewport={{ once: true }}
                      >
                        Successfully launch our SoulSpace wearable device by Q1 2027
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                        viewport={{ once: true }}
                      >
                        Complete clinical trials for our wearable technology by end of 2026
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.8 }}
                        viewport={{ once: true }}
                      >
                        Establish partnerships with 50+ hospitals by 2026
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.9 }}
                        viewport={{ once: true }}
                      >
                        Develop AI algorithms that can predict health issues with 90%+ accuracy
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 1.0 }}
                        viewport={{ once: true }}
                      >
                        Create a seamless data ecosystem between patients, providers, and our platform
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 1.1 }}
                        viewport={{ once: true }}
                      >
                        Achieve the highest standards of data security certification
                      </motion.li>
                    </Box>
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Partner Hospitals Section */}
      <Box
        sx={{
          py: { xs: 10, md: 16 },
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(241, 245, 249, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)',
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
            backgroundSize: '20px',
            opacity: 0.05,
            zIndex: 0,
            animation: 'moveBackground 60s linear infinite',
          },
          '@keyframes moveBackground': {
            '0%': { backgroundPosition: '0 0' },
            '100%': { backgroundPosition: '100px 100px' },
          },
        }}
      >
        {/* Floating Elements */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
          {/* Animated Medical Icons */}
          {[
            { icon: '⚕️', size: '2.5rem', left: '5%', top: '15%' },
            { icon: '🏥', size: '3rem', left: '90%', top: '20%' },
            { icon: '❤️', size: '2rem', left: '80%', top: '70%' },
            { icon: '🔬', size: '2.2rem', left: '10%', top: '75%' },
          ].map((item, index) => (
            <motion.div
              key={index}
              style={{
                position: 'absolute',
                left: item.left,
                top: item.top,
                fontSize: item.size,
                opacity: 0.3,
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.7))',
              }}
              animate={{
                y: [0, -15, 0],
                x: [0, 5, 0],
                rotate: [0, 5, 0, -5, 0],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4 + index,
                repeat: Infinity,
                delay: index * 0.5,
                ease: "easeInOut"
              }}
            >
              {item.icon}
            </motion.div>
          ))}
        </Box>

        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
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
                zIndex: 1,
                textShadow: '0 10px 30px rgba(0,0,0,0.1)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 4,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                }
              }}
            >
              Our Partner Hospitals
            </Typography>
            <Typography
              variant="h5"
              textAlign="center"
              color="text.secondary"
              sx={{ 
                mb: 8, 
                maxWidth: 800, 
                mx: 'auto', 
                position: 'relative', 
                zIndex: 1,
                lineHeight: 1.6,
                fontWeight: 500
              }}
            >
              We collaborate with leading healthcare institutions to provide exceptional care and innovative medical solutions for our patients
            </Typography>
          </motion.div>

          {/* Hospital Cards */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={4} justifyContent="center">
              {[
                { 
                  name: 'King Faisal Hospital', 
                  logo: '/hospitals/king-faisali.svg',
                  specialties: ['Cardiology', 'Neurology', 'Oncology'],
                  location: 'Kigali, Rwanda',
                  rating: 4.9,
                  color: '#4f46e5'
                },
                { 
                  name: 'Nyarugenge District Hospital', 
                  logo: '/hospitals/nyarugenge.svg',
                  specialties: ['Pediatrics', 'Obstetrics', 'General Surgery'],
                  location: 'Nyarugenge, Rwanda',
                  rating: 4.7,
                  color: '#06b6d4'
                },
                { 
                  name: 'Mayo Clinic', 
                  logo: '/hospitals/mayo-clinic.svg',
                  specialties: ['Cardiology', 'Neurology', 'Oncology'],
                  location: 'Rochester, MN',
                  rating: 4.9,
                  color: '#8b5cf6'
                },
                { 
                  name: 'Cleveland Clinic', 
                  logo: '/hospitals/cleveland-clinic.svg',
                  specialties: ['Orthopedics', 'Gastroenterology', 'Urology'],
                  location: 'Cleveland, OH',
                  rating: 4.8,
                  color: '#ec4899'
                },
              ].map((hospital, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ 
                      y: -10, 
                      transition: { duration: 0.2 },
                      boxShadow: `0 20px 40px ${alpha(hospital.color, 0.2)}`
                    }}
                  >
                    <Paper
                      elevation={4}
                      sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: `0 20px 40px ${alpha(hospital.color, 0.3)}`,
                        },
                        position: 'relative',
                        border: `1px solid ${alpha(hospital.color, 0.2)}`,
                        background: theme.palette.mode === 'dark'
                          ? `linear-gradient(135deg, ${alpha(hospital.color, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
                          : `linear-gradient(135deg, ${alpha(hospital.color, 0.05)} 0%, white 100%)`,
                      }}
                    >
                      {/* Hospital Image */}
                      <Box
                        sx={{
                          height: 180,
                          width: '100%',
                          position: 'relative',
                          overflow: 'hidden',
                          background: alpha(hospital.color, 0.05),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 3
                        }}
                      >
                        <Box
                          component="img"
                          src={hospital.logo}
                          alt={hospital.name}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            transition: 'transform 0.5s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            },
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            bgcolor: 'white',
                            borderRadius: 10,
                            px: 1,
                            py: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          }}
                        >
                          <Star sx={{ color: '#f59e0b', fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2" fontWeight="bold">
                            {hospital.rating}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Hospital Info */}
                      <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: hospital.color }}>
                          {hospital.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LocalHospital sx={{ fontSize: 18, color: hospital.color, mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {hospital.location}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                          Top Specialties:
                        </Typography>
                        <Box sx={{ mb: 2, flexGrow: 1 }}>
                          {hospital.specialties.map((specialty, i) => (
                            <Chip
                              key={i}
                              label={specialty}
                              size="small"
                              sx={{
                                mr: 0.5,
                                mb: 0.5,
                                bgcolor: alpha(hospital.color, 0.1),
                                color: hospital.color,
                                fontWeight: 500,
                              }}
                            />
                          ))}
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          endIcon={<ArrowForward />}
                          sx={{
                            borderColor: hospital.color,
                            color: hospital.color,
                            '&:hover': {
                              borderColor: hospital.color,
                              bgcolor: alpha(hospital.color, 0.1),
                            },
                            alignSelf: 'flex-start',
                            borderRadius: 2,
                          }}
                          onClick={() => navigate('/register')}
                        >
                          View Doctors
                        </Button>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Spacer */}
          <Box sx={{ mt: 10 }} />

          {/* View All Hospitals Button with Enhanced Styling */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              position: 'relative', 
              zIndex: 1,
              my: 6,
              pb: 4
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<LocalHospital />}
                endIcon={<ArrowForward />}
                onClick={() => navigate('/hospitals')}
                sx={{
                  py: 2,
                  px: 5,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
                  boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
                  textTransform: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shine 3s infinite',
                  },
                  '@keyframes shine': {
                    '0%': { left: '-100%' },
                    '20%': { left: '100%' },
                    '100%': { left: '100%' },
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 15px 30px rgba(79, 70, 229, 0.5)',
                    background: 'linear-gradient(90deg, #4338ca 0%, #0891b2 100%)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                View All Partner Hospitals
              </Button>
            </motion.div>
          </Box>
          
          {/* Decorative Elements */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 4,
            opacity: 0.6
          }}>
            <Box sx={{ 
              width: '100px', 
              height: '4px', 
              borderRadius: '2px', 
              background: 'linear-gradient(90deg, #4f46e5, #06b6d4)' 
            }} />
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.default, 0.6)
            : alpha(theme.palette.grey[50], 0.8),
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
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
                zIndex: 1,
                textShadow: '0 10px 30px rgba(0,0,0,0.1)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 4,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                }
              }}
            >
              Key Features
            </Typography>
            <Typography
              variant="h5"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 6, maxWidth: 800, mx: 'auto', position: 'relative', zIndex: 1 }}
            >
              Discover what makes SoulSpace the leading healthcare platform
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FeatureCard {...feature} index={index} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

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

      {/* Virtual Consultation Section */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 10, md: 16 },
          overflow: 'hidden',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(45, 212, 191, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%)'
            : 'linear-gradient(135deg, rgba(45, 212, 191, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)',
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
            <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
              <Box sx={{ position: 'relative' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Box
                    component="img"
                    src="/virtual-consultation.svg"
                    alt="Virtual Doctor Consultation"
                    sx={{
                      width: '100%',
                      maxWidth: 500,
                      height: 'auto',
                      borderRadius: 4,
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                      transform: 'perspective(1000px) rotateY(5deg)',
                      mx: 'auto',
                      display: 'block',
                    }}
                  />

                  {/* Floating elements */}
                  {[
                    { label: 'Available Now', icon: <EventAvailable />, color: '#10b981', top: '10%', left: '-10%' },
                    { label: 'Secure Connection', icon: <Security />, color: '#3b82f6', bottom: '20%', left: '-5%' },
                    { label: 'HD Video', icon: <VideoCall />, color: '#f59e0b', top: '10%', right: '-5%' },
                    { label: 'Instant Prescriptions', icon: <Medication />, color: '#8b5cf6', bottom: '15%', right: '-10%' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + (index * 0.2) }}
                      viewport={{ once: true }}
                      style={{
                        position: 'absolute',
                        top: item.top,
                        left: item.left,
                        bottom: item.bottom,
                        right: item.right,
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
                          border: `1px solid ${alpha(item.color, 0.3)}`,
                          display: 'flex',
                          alignItems: 'center',
                          minWidth: 130,
                        }}
                      >
                        <Box
                          sx={{
                            mr: 1,
                            color: item.color,
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                      </Paper>
                    </motion.div>
                  ))}
                </motion.div>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
              <ScrollReveal>
                <Typography
                  variant="h2"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(90deg, #06b6d4, #4f46e5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3,
                  }}
                >
                  Virtual Doctor Consultations
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mb: 4, fontWeight: 500, lineHeight: 1.6 }}
                >
                  Connect with top doctors from your preferred hospitals for online consultations anytime, anywhere
                </Typography>

                <Box sx={{ mb: 4 }}>
                  {[
                    { icon: <LocalHospital />, title: 'Choose Your Hospital', description: 'Select from our network of trusted hospitals and healthcare providers' },
                    { icon: <Person />, title: 'Select Your Doctor', description: 'Browse doctor profiles, specialties, and ratings to find the perfect match' },
                    { icon: <EventAvailable />, title: 'Book Instantly', description: 'Schedule same-day appointments or book in advance at your convenience' },
                    { icon: <VideoCall />, title: 'Connect Virtually', description: 'Enjoy high-quality video consultations from the comfort of your home' },
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
                          bgcolor: alpha('#06b6d4', 0.1),
                          color: '#06b6d4',
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
                    background: 'linear-gradient(90deg, #06b6d4 0%, #4f46e5 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)',
                    '&:hover': {
                      boxShadow: '0 15px 30px rgba(6, 182, 212, 0.4)',
                      transform: 'translateY(-3px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => navigate('/register')}
                >
                  Book a Virtual Consultation
                </Button>
              </ScrollReveal>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* In-Person Appointment Section */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 10, md: 16 },
          overflow: 'hidden',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)'
            : 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
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
            <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 1 } }}>
              <ScrollReveal>
                <Typography
                  variant="h2"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(90deg, #ec4899, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3,
                  }}
                >
                  In-Person Hospital Visits
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mb: 4, fontWeight: 500, lineHeight: 1.6 }}
                >
                  Schedule face-to-face appointments with specialists at your preferred hospitals
                </Typography>

                <Box sx={{ mb: 4 }}>
                  {[
                    { icon: <LocalHospital />, title: 'Select Hospital', description: 'Choose from our network of top-rated hospitals and medical centers in your area' },
                    { icon: <Person />, title: 'Find Specialists', description: 'Browse through profiles of experienced doctors and specialists by department' },
                    { icon: <EventAvailable />, title: 'Flexible Scheduling', description: 'Book appointments that fit your schedule with real-time availability' },
                    { icon: <HealthAndSafety />, title: 'Comprehensive Care', description: 'Access full medical services including tests, treatments, and follow-ups' },
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
                          bgcolor: alpha('#ec4899', 0.1),
                          color: '#ec4899',
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
                    background: 'linear-gradient(90deg, #ec4899 0%, #f59e0b 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    boxShadow: '0 10px 20px rgba(236, 72, 153, 0.3)',
                    '&:hover': {
                      boxShadow: '0 15px 30px rgba(236, 72, 153, 0.4)',
                      transform: 'translateY(-3px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => navigate('/register')}
                >
                  Schedule Hospital Visit
                </Button>
              </ScrollReveal>
            </Grid>

            <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 2 } }}>
              <Box sx={{ position: 'relative' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Box
                    component="img"
                    src="/hospital-visit.svg"
                    alt="Hospital Visit"
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

                  {/* Floating elements */}
                  {[
                    { label: 'Top Specialists', icon: <Star />, color: '#f59e0b', top: '10%', right: '-5%' },
                    { label: 'Modern Facilities', icon: <LocalHospital />, color: '#ec4899', bottom: '20%', right: '-10%' },
                    { label: 'Same-Day Appointments', icon: <EventAvailable />, color: '#8b5cf6', top: '10%', left: '-5%' },
                    { label: 'Insurance Accepted', icon: <HealthAndSafety />, color: '#10b981', bottom: '15%', left: '-10%' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + (index * 0.2) }}
                      viewport={{ once: true }}
                      style={{
                        position: 'absolute',
                        top: item.top,
                        left: item.left,
                        bottom: item.bottom,
                        right: item.right,
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
                          border: `1px solid ${alpha(item.color, 0.3)}`,
                          display: 'flex',
                          alignItems: 'center',
                          minWidth: 130,
                        }}
                      >
                        <Box
                          sx={{
                            mr: 1,
                            color: item.color,
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.label}
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

      {/* Gamification Section */}
      <Box sx={{
        py: { xs: 8, md: 12 },
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha('#7c3aed', 0.2)} 0%, ${alpha('#3b82f6', 0.2)} 100%)`
          : `linear-gradient(135deg, ${alpha('#7c3aed', 0.05)} 0%, ${alpha('#3b82f6', 0.05)} 100%)`,
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
                background: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                position: 'relative',
                zIndex: 1
              }}
            >
              Your Health Journey
            </Typography>
            <Typography
              variant="h5"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 6, maxWidth: 800, mx: 'auto', position: 'relative', zIndex: 1 }}
            >
              Simple steps to better healthcare management
            </Typography>
          </ScrollReveal>

          {/* Health Journey Steps - Simplified */}
          <Box sx={{ position: 'relative', mb: 8 }}>
            {/* Simple Path Line */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '5%',
                right: '5%',
                height: '4px',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2,
                zIndex: 0,
                display: { xs: 'none', md: 'block' },
              }}
            />

            {/* Simple Journey Dots */}
            {[0, 1, 2, 3].map((step) => (
              <Box
                key={`dot-${step}`}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: `${15 + step * 23.3}%`,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  border: '2px solid #7c3aed',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  display: { xs: 'none', md: 'block' },
                }}
              />
            ))}

            <Grid container spacing={4} justifyContent="center">
              {[
                {
                  icon: <PersonAdd />,
                  title: 'Join',
                  description: 'Create your account and set up your health profile',
                  color: '#7c3aed',
                  completed: true
                },
                {
                  icon: <MonitorHeart />,
                  title: 'Connect',
                  description: 'Link your wearable devices for real-time health tracking',
                  color: '#8b5cf6',
                  completed: false
                },
                {
                  icon: <LocalHospital />,
                  title: 'Consult',
                  description: 'Book your first appointment with a healthcare provider',
                  color: '#6366f1',
                  completed: false
                },
                {
                  icon: <DirectionsRun />,
                  title: 'Engage',
                  description: 'Complete health activities and follow recommendations',
                  color: '#3b82f6',
                  completed: false
                }
              ].map((step, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    whileHover={{
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1,
                        overflow: 'hidden',
                        background: theme.palette.mode === 'dark'
                          ? `linear-gradient(135deg, ${alpha(step.color, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
                          : `linear-gradient(135deg, ${alpha(step.color, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                        border: step.completed ? `2px solid ${step.color}` : `1px solid ${alpha(step.color, 0.2)}`,
                      }}
                    >
                      {step.completed && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: step.color,
                            fontWeight: 'bold',
                          }}
                        >
                          ✓
                        </Box>
                      )}

                      {/* Step Number */}
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'white',
                          color: step.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          mb: 2,
                          border: `2px solid ${step.color}`,
                        }}
                      >
                        {index + 1}
                      </Box>

                      {/* Icon */}
                      <Avatar
                        sx={{
                          width: 70,
                          height: 70,
                          bgcolor: alpha(step.color, 0.1),
                          color: step.color,
                          mb: 2,
                          border: step.completed ? `2px solid ${step.color}` : 'none',
                        }}
                      >
                        {React.cloneElement(step.icon, { sx: { fontSize: 35 } })}
                      </Avatar>

                      {/* Title */}
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                          fontWeight: 700,
                          color: step.color,
                          mt: 1,
                        }}
                      >
                        {step.title}
                      </Typography>

                      {/* Description */}
                      <Typography variant="body1" sx={{ color: 'text.secondary', flexGrow: 1 }}>
                        {step.description}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Health Benefits Section */}
          <Box sx={{ mt: 8 }}>
            <Typography
              variant="h3"
              textAlign="center"
              sx={{
                mb: 2,
                fontWeight: 800,
                background: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Health Benefits
            </Typography>

            <Typography
              variant="h5"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}
            >
              Discover how our platform helps improve your healthcare experience
            </Typography>

            <Grid container spacing={3}>
              {[
                {
                  title: 'Real-time Monitoring',
                  description: 'Track your vital signs and health metrics in real-time with our advanced monitoring system',
                  icon: <MonitorHeart />,
                  color: '#3b82f6'
                },
                {
                  title: 'Better Sleep',
                  description: 'Get insights and recommendations to improve your sleep quality and overall rest',
                  icon: <Bedtime />,
                  color: '#8b5cf6'
                },
                {
                  title: 'Heart Health',
                  description: 'Monitor your heart rate and receive alerts for any concerning patterns',
                  icon: <Favorite />,
                  color: '#ec4899'
                },
                {
                  title: 'Appointment Management',
                  description: 'Easily schedule, track, and manage all your healthcare appointments in one place',
                  icon: <EventAvailable />,
                  color: '#10b981'
                },
                {
                  title: 'Health Assessments',
                  description: 'Complete comprehensive health assessments to better understand your overall wellbeing',
                  icon: <HealthAndSafety />,
                  color: '#f59e0b'
                },
                {
                  title: 'Medication Tracking',
                  description: 'Never miss a dose with our medication reminder and tracking system',
                  icon: <Medication />,
                  color: '#ef4444'
                }
              ].map((benefit, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{
                      y: -8,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        border: `1px solid ${alpha(benefit.color, 0.2)}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: alpha(benefit.color, 0.1),
                            color: benefit.color,
                            mr: 2,
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          {React.cloneElement(benefit.icon, { sx: { fontSize: 30 } })}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {benefit.title}
                        </Typography>
                      </Box>

                      <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                        {benefit.description}
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="text"
                          endIcon={<ArrowForward />}
                          sx={{
                            color: benefit.color,
                            '&:hover': {
                              bgcolor: alpha(benefit.color, 0.1)
                            }
                          }}
                          onClick={() => navigate('/register')}
                        >
                          Learn more
                        </Button>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Call to Action */}
          <Box
            sx={{
              mt: 8,
              textAlign: 'center',
              p: 4,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Start Your Health Journey Today
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary', maxWidth: 700, mx: 'auto' }}>
              Join thousands of users who are improving their healthcare experience with SoulSpace
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/register')}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 3,
                background: 'linear-gradient(90deg, #7c3aed 0%, #3b82f6 100%)',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                boxShadow: '0 10px 20px rgba(124, 58, 237, 0.3)',
                '&:hover': {
                  boxShadow: '0 15px 30px rgba(124, 58, 237, 0.4)',
                  transform: 'translateY(-3px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Join Now - It's Free
            </Button>
          </Box>
        </Container>
      </Box>

      {/* AI Health Assistant Section */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 10, md: 16 },
          overflow: 'hidden',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)'
            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
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
                    background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3,
                  }}
                >
                  AI Health Assistant
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mb: 4, fontWeight: 500, lineHeight: 1.6 }}
                >
                  Your personal health companion powered by advanced artificial intelligence
                </Typography>

                <Box sx={{ mb: 4 }}>
                  {[
                    { icon: <TipsAndUpdates />, title: 'Personalized Health Tips', description: 'Receive customized health recommendations based on your profile and health data' },
                    { icon: <Psychology />, title: 'Symptom Analysis', description: 'Describe your symptoms and get AI-powered insights and guidance' },
                    { icon: <Medication />, title: 'Medication Reminders', description: 'Never miss a dose with smart medication tracking and reminders' },
                    { icon: <SmartToy />, title: '24/7 Availability', description: 'Get answers to your health questions anytime, day or night' },
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
                          bgcolor: alpha('#8b5cf6', 0.1),
                          color: '#8b5cf6',
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
                  startIcon={<SmartToy />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)',
                    '&:hover': {
                      boxShadow: '0 15px 30px rgba(139, 92, 246, 0.4)',
                      transform: 'translateY(-3px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => navigate('/register')}
                >
                  Try AI Health Assistant
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
                  {/* AI Assistant Chat Interface */}
                  <Paper
                    elevation={8}
                    sx={{
                      width: '100%',
                      maxWidth: 500,
                      mx: 'auto',
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                      transform: 'perspective(1000px) rotateY(-5deg)',
                    }}
                  >
                    {/* Chat header */}
                    <Box
                      sx={{
                        p: 2,
                        background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: 'white',
                          color: '#8b5cf6',
                          mr: 2,
                        }}
                      >
                        <SmartToy />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          Health AI Assistant
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Online • Ready to help
                        </Typography>
                      </Box>
                    </Box>

                    {/* Chat messages */}
                    <Box
                      sx={{
                        p: 2,
                        height: 350,
                        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.9) : 'white',
                        overflowY: 'auto',
                      }}
                    >
                      {/* AI message */}
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: '#8b5cf6',
                            width: 36,
                            height: 36,
                            mr: 1,
                          }}
                        >
                          <SmartToy fontSize="small" />
                        </Avatar>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            borderTopLeftRadius: 0,
                            bgcolor: alpha('#8b5cf6', 0.1),
                            maxWidth: '80%',
                          }}
                        >
                          <Typography variant="body2">
                            Hello! I'm your AI Health Assistant. How can I help you today?
                          </Typography>
                        </Paper>
                      </Box>

                      {/* User message */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            borderTopRightRadius: 0,
                            bgcolor: alpha('#4f46e5', 0.1),
                            maxWidth: '80%',
                          }}
                        >
                          <Typography variant="body2">
                            I've been having headaches and feeling tired lately. What could be causing this?
                          </Typography>
                        </Paper>
                        <Avatar
                          sx={{
                            bgcolor: '#4f46e5',
                            width: 36,
                            height: 36,
                            ml: 1,
                          }}
                        >
                          U
                        </Avatar>
                      </Box>

                      {/* AI response */}
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: '#8b5cf6',
                            width: 36,
                            height: 36,
                            mr: 1,
                          }}
                        >
                          <SmartToy fontSize="small" />
                        </Avatar>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            borderTopLeftRadius: 0,
                            bgcolor: alpha('#8b5cf6', 0.1),
                            maxWidth: '80%',
                          }}
                        >
                          <Typography variant="body2">
                            There could be several reasons for headaches and fatigue, including:
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, mt: 1, mb: 1 }}>
                            <li>Dehydration</li>
                            <li>Stress or anxiety</li>
                            <li>Poor sleep quality</li>
                            <li>Eye strain</li>
                          </Box>
                          <Typography variant="body2">
                            I recommend drinking more water, taking regular breaks, and ensuring you get 7-8 hours of sleep. Would you like me to suggest some relaxation techniques?
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>

                    {/* Chat input */}
                    <Box
                      sx={{
                        p: 2,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.9) : 'white',
                      }}
                    >
                      <Box
                        component="input"
                        placeholder="Type your health question..."
                        sx={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          p: 1.5,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.divider, 0.05),
                          color: 'text.primary',
                          fontSize: '0.9rem',
                        }}
                      />
                      <IconButton
                        sx={{
                          ml: 1,
                          bgcolor: '#8b5cf6',
                          color: 'white',
                          '&:hover': {
                            bgcolor: '#7c3aed',
                          },
                        }}
                      >
                        <ArrowForward />
                      </IconButton>
                    </Box>
                  </Paper>

                  {/* Floating elements */}
                  {[
                    { label: 'AI-Powered', icon: <Psychology />, color: '#ec4899', top: '5%', right: '-5%' },
                    { label: 'HIPAA Compliant', icon: <Security />, color: '#8b5cf6', bottom: '10%', left: '-5%' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + (index * 0.2) }}
                      viewport={{ once: true }}
                      style={{
                        position: 'absolute',
                        top: item.top,
                        left: item.left,
                        bottom: item.bottom,
                        right: item.right,
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
                          border: `1px solid ${alpha(item.color, 0.3)}`,
                          display: 'flex',
                          alignItems: 'center',
                          minWidth: 130,
                        }}
                      >
                        <Box
                          sx={{
                            mr: 1,
                            color: item.color,
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.label}
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
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
                zIndex: 1,
                textShadow: '0 10px 30px rgba(0,0,0,0.1)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 4,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                }
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
          </motion.div>

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
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    whileHover={{
                      y: -10,
                      transition: { duration: 0.2 }
                    }}
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
                        border: `1px solid ${alpha(tip.color, 0.3)}`,
                        background: theme.palette.mode === 'dark'
                          ? `linear-gradient(135deg, ${alpha(tip.color, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
                          : `linear-gradient(135deg, ${alpha(tip.color, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        boxShadow: `0 10px 30px ${alpha(tip.color, 0.2)}`,
                        '&:hover': {
                          boxShadow: `0 15px 40px ${alpha(tip.color, 0.3)}`,
                          '& .tip-icon': {
                            transform: 'scale(1.1) rotate(5deg)',
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '4px',
                          background: `linear-gradient(90deg, ${tip.color}, transparent)`,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                          className="tip-icon"
                          sx={{
                            bgcolor: alpha(tip.color, 0.1),
                            color: tip.color,
                            width: 60,
                            height: 60,
                            mr: 2,
                            boxShadow: `0 4px 14px ${alpha(tip.color, 0.4)}`,
                            transition: 'transform 0.3s ease',
                            border: `2px solid ${alpha(tip.color, 0.3)}`,
                          }}
                        >
                          <IconComponent sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography
                          variant="h5"
                          component="h3"
                          sx={{
                            fontWeight: 700,
                            background: `linear-gradient(90deg, ${tip.color}, ${theme.palette.text.primary})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {tip.title}
                        </Typography>
                      </Box>

                      <Typography variant="body1" sx={{ mb: 3, flexGrow: 1, lineHeight: 1.7 }}>
                        {tip.content}
                      </Typography>

                      {/* Quick Tips */}
                      <Box
                        sx={{
                          mb: 3,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(tip.color, 0.05),
                          border: `1px dashed ${alpha(tip.color, 0.3)}`,
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, color: tip.color }}>
                          Quick Tips:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {[
                            tip.iconName === 'WaterDrop' ? 'Drink 8 glasses daily' : null,
                            tip.iconName === 'FitnessCenter' ? '30 min exercise daily' : null,
                            tip.iconName === 'Restaurant' ? 'Eat colorful foods' : null,
                            tip.iconName === 'Bedtime' ? '7-8 hours of sleep' : null,
                            tip.iconName === 'SelfImprovement' ? '10 min meditation' : null,
                            tip.iconName === 'Air' ? 'Fresh air breaks' : null
                          ].filter(Boolean).map((quickTip, i) => (
                            <Chip
                              key={i}
                              label={quickTip}
                              size="small"
                              sx={{
                                bgcolor: alpha(tip.color, 0.1),
                                color: tip.color,
                                fontWeight: 500,
                                border: `1px solid ${alpha(tip.color, 0.2)}`,
                                boxShadow: `0 2px 5px ${alpha(tip.color, 0.1)}`,
                                '&:hover': {
                                  bgcolor: alpha(tip.color, 0.2),
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      <Button
                        variant="outlined"
                        endIcon={<ArrowForward />}
                        sx={{
                          alignSelf: 'flex-start',
                          color: tip.color,
                          borderColor: alpha(tip.color, 0.5),
                          mt: 'auto',
                          borderRadius: 2,
                          px: 2,
                          py: 1,
                          '&:hover': {
                            bgcolor: alpha(tip.color, 0.1),
                            borderColor: tip.color,
                            transform: 'translateY(-3px)',
                            boxShadow: `0 5px 10px ${alpha(tip.color, 0.2)}`,
                          },
                          transition: 'all 0.3s ease',
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
      <Box
        sx={{
          py: { xs: 10, md: 16 },
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(241, 245, 249, 0.8) 0%, rgba(248, 250, 252, 0.95) 100%)',
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
            backgroundSize: '20px',
            opacity: 0.05,
            zIndex: 0,
          },
        }}
      >
        {/* Floating Elements */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
          {/* Animated Question Mark Icons */}
          {[
            { icon: '❓', size: '2.5rem', left: '5%', top: '15%' },
            { icon: '❔', size: '3rem', left: '90%', top: '20%' },
            { icon: '❓', size: '2rem', left: '80%', top: '70%' },
            { icon: '❔', size: '2.2rem', left: '10%', top: '75%' },
          ].map((item, index) => (
            <motion.div
              key={index}
              style={{
                position: 'absolute',
                left: item.left,
                top: item.top,
                fontSize: item.size,
                opacity: 0.2,
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.7))',
              }}
              animate={{
                y: [0, -15, 0],
                x: [0, 5, 0],
                rotate: [0, 5, 0, -5, 0],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4 + index,
                repeat: Infinity,
                delay: index * 0.5,
                ease: "easeInOut"
              }}
            >
              {item.icon}
            </motion.div>
          ))}
        </Box>
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
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
                zIndex: 1,
                textShadow: '0 10px 30px rgba(0,0,0,0.1)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 4,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                }
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography
              variant="h5"
              textAlign="center"
              color="text.secondary"
              sx={{ 
                mb: 8, 
                maxWidth: 800, 
                mx: 'auto', 
                position: 'relative', 
                zIndex: 1,
                lineHeight: 1.6,
                fontWeight: 500
              }}
            >
              Find answers to common questions about our healthcare platform and services
            </Typography>
          </motion.div>

          <Grid container spacing={4} sx={{ mt: 2 }}>
            {[
              {
                question: "Is SoulSpace HIPAA compliant?",
                answer: "Yes, SoulSpace is fully HIPAA compliant and maintains the highest standards of security for patient data protection. We regularly undergo security audits and implement industry-leading encryption methods.",
                icon: <Security sx={{ fontSize: 40 }} />,
                color: '#4f46e5'
              },
              {
                question: "Can I integrate with my existing systems?",
                answer: "SoulSpace offers seamless integration with major healthcare systems and can be customized to work with your specific setup. Our API documentation and integration team will help you connect your existing infrastructure.",
                icon: <Settings sx={{ fontSize: 40 }} />,
                color: '#06b6d4'
              },
              {
                question: "What support options are available?",
                answer: "We offer 24/7 technical support, comprehensive training, and dedicated account managers for all our healthcare partners. Our support team includes healthcare professionals who understand your specific needs.",
                icon: <PersonAdd sx={{ fontSize: 40 }} />,
                color: '#8b5cf6'
              },
              {
                question: "How long does implementation take?",
                answer: "Basic setup can be completed in minutes. Full enterprise implementation typically takes 2-4 weeks, depending on the complexity of your requirements and existing systems integration needs.",
                icon: <Speed sx={{ fontSize: 40 }} />,
                color: '#ec4899'
              }
            ].map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -10, 
                    transition: { duration: 0.2 },
                    boxShadow: `0 20px 40px ${alpha(faq.color, 0.2)}`
                  }}
                >
                  <Paper
                    elevation={4}
                    sx={{
                      p: 4,
                      height: '100%',
                      borderRadius: 4,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 15px 30px ${alpha(faq.color, 0.3)}`,
                      },
                      position: 'relative',
                      border: `1px solid ${alpha(faq.color, 0.2)}`,
                      background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${alpha(faq.color, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
                        : `linear-gradient(135deg, ${alpha(faq.color, 0.05)} 0%, white 100%)`,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: alpha(faq.color, 0.1),
                        zIndex: 0,
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, position: 'relative', zIndex: 1 }}>
                      <Box
                        sx={{
                          mr: 2,
                          p: 1.5,
                          borderRadius: 2,
                          background: alpha(faq.color, 0.1),
                          color: faq.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {faq.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        fontWeight="bold" 
                        sx={{ 
                          color: faq.color,
                          mt: 1
                        }}
                      >
                        {faq.question}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{
                        pl: 7,
                        position: 'relative',
                        zIndex: 1,
                        lineHeight: 1.7
                      }}
                    >
                      {faq.answer}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          
          {/* Additional Help Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <Button
                variant="outlined"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  borderColor: '#4f46e5',
                  color: '#4f46e5',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: '#4f46e5',
                    backgroundColor: alpha('#4f46e5', 0.05),
                    transform: 'translateY(-3px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/contact')}
              >
                Still Have Questions? Contact Us
              </Button>
            </motion.div>
          </Box>
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
              boxShadow: '0 20px 40px rgba(79, 70, 229, 0.4)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("/pattern-dots.png")',
                backgroundSize: '20px',
                opacity: 0.1,
                zIndex: 0,
              }
            }}
          >
            {/* Floating Elements */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }}>
              {/* Animated Icons */}
              {[
                { icon: '⚕️', size: '2.5rem', left: '5%', top: '15%' },
                { icon: '🏥', size: '3rem', left: '90%', top: '20%' },
                { icon: '❤️', size: '2rem', left: '80%', top: '70%' },
                { icon: '🔬', size: '2.2rem', left: '10%', top: '75%' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: item.left,
                    top: item.top,
                    fontSize: item.size,
                    opacity: 0.4,
                    filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.7))',
                  }}
                  animate={{
                    y: [0, -15, 0],
                    x: [0, 5, 0],
                    rotate: [0, 5, 0, -5, 0],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{
                    duration: 4 + index,
                    repeat: Infinity,
                    delay: index * 0.5,
                    ease: "easeInOut"
                  }}
                >
                  {item.icon}
                </motion.div>
              ))}

              {/* Glowing Orbs */}
              {[...Array(5)].map((_, index) => (
                <motion.div
                  key={`orb-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${Math.random() * 90 + 5}%`,
                    top: `${Math.random() * 90 + 5}%`,
                    width: `${Math.random() * 20 + 10}px`,
                    height: `${Math.random() * 20 + 10}px`,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 70%)`,
                    boxShadow: '0 0 15px rgba(255,255,255,0.7)',
                  }}
                  animate={{
                    x: [0, Math.random() * 40 - 20, 0],
                    y: [0, Math.random() * 40 - 20, 0],
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: Math.random() * 4 + 3,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </Box>

            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h2"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    mb: 3,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    position: 'relative',
                    display: 'inline-block',
                    background: 'linear-gradient(90deg, #fff, #a5f3fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Ready to Transform Your Healthcare?
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute',
                      width: '60px',
                      height: '60px',
                      right: { xs: '-20px', sm: '-30px', md: '-40px' },
                      top: { xs: '-15px', sm: '-20px', md: '-25px' },
                      background: 'url("/sparkle.svg")',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      display: { xs: 'none', sm: 'block' },
                      animation: 'sparkle 2s ease-in-out infinite',
                      '@keyframes sparkle': {
                        '0%': { transform: 'scale(1) rotate(0deg)', opacity: 0.7 },
                        '50%': { transform: 'scale(1.2) rotate(15deg)', opacity: 1 },
                        '100%': { transform: 'scale(1) rotate(0deg)', opacity: 0.7 },
                      }
                    }}
                  />
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Typography
                  variant="h5"
                  sx={{ mb: 5, maxWidth: 700, mx: 'auto', opacity: 0.9, fontWeight: 400 }}
                >
                  Join thousands of healthcare professionals who are revolutionizing patient care with SoulSpace
                </Typography>
              </motion.div>

              {/* Benefits */}
              <Box sx={{ mb: 5 }}>
                <Grid container spacing={2} justifyContent="center">
                  {[
                    { icon: <MonitorHeart />, text: "Real-time health monitoring" },
                    { icon: <Security />, text: "HIPAA compliant security" },
                    { icon: <Speed />, text: "Fast implementation" },
                    { icon: <Psychology />, text: "AI-powered insights" }
                  ].map((benefit, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(5px)',
                            borderRadius: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              bgcolor: 'rgba(255, 255, 255, 0.15)',
                            }
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              mb: 1
                            }}
                          >
                            {React.cloneElement(benefit.icon, { sx: { fontSize: 24 } })}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {benefit.text}
                          </Typography>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.8
                  }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: 'rgba(79, 70, 229, 0.2)',
                        ml: 1
                      }}>
                        <ArrowForward sx={{ fontSize: 18 }} />
                      </Box>
                    }
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
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        animation: 'shine 3s infinite',
                      },
                      '@keyframes shine': {
                        '0%': { left: '-100%' },
                        '20%': { left: '100%' },
                        '100%': { left: '100%' },
                      },
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => navigate('/register')}
                  >
                    Start Your Free Trial Today
                  </Button>
                </motion.div>
              )}

              {/* Countdown Timer */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Paper
                  elevation={0}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    p: 1,
                    px: 2,
                    borderRadius: 5,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(5px)',
                  }}
                >
                  <Typography variant="body2" sx={{ mr: 1, opacity: 0.9 }}>
                    Limited time offer:
                  </Typography>
                  {['14', '23', '59', '42'].map((num, index) => (
                    <React.Fragment key={index}>
                      <Box
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          mx: 0.5,
                          minWidth: 30,
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {num}
                        </Typography>
                      </Box>
                      {index < 3 && (
                        <Typography variant="body2" sx={{ mx: 0.5, fontWeight: 700 }}>
                          {index === 0 ? 'd' : index === 1 ? 'h' : 'm'}
                        </Typography>
                      )}
                    </React.Fragment>
                  ))}
                  <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 700 }}>
                    s
                  </Typography>
                </Paper>
              </Box>
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
