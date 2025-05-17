import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  alpha,
  Avatar,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  MonitorHeart,
  Medication,
  Security,
  Psychology,
  LocalHospital,
  HealthAndSafety,
  MedicalServices,
  Bloodtype,
  WbSunny,
  Favorite,
  ArrowForward,
  DevicesOther,
  SupportAgent,
  School,
  Healing,
  PersonAdd,
  EventAvailable,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ icon, title, description, color, index }) => {
  const theme = useTheme();

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
          border: `1px solid ${alpha(color, 0.2)}`,
          boxShadow: `0 10px 30px ${alpha(color, 0.1)}`,
          overflow: 'hidden',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-12px)',
            boxShadow: `0 15px 35px ${alpha(color, 0.2)}`,
            '& .service-icon': {
              transform: 'scale(1.1) rotate(5deg)',
            },
            '& .service-title': {
              color: color,
            },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: color,
          },
        }}
      >
        <CardContent sx={{ p: 3, zIndex: 1, position: 'relative', flexGrow: 1 }}>
          <Box
            className="service-icon"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.5,
              borderRadius: '16px',
              background: alpha(color, 0.1),
              mb: 2,
              transition: 'transform 0.3s ease',
            }}
          >
            {React.cloneElement(icon, {
              sx: {
                fontSize: 40,
                color: color,
                filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.2))',
              }
            })}
          </Box>
          <Typography
            variant="h5"
            gutterBottom
            className="service-title"
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
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.7,
              mb: 3,
            }}
          >
            {description}
          </Typography>
          <Button
            variant="outlined"
            endIcon={<ArrowForward />}
            sx={{
              mt: 'auto',
              borderColor: color,
              color: color,
              '&:hover': {
                borderColor: color,
                backgroundColor: alpha(color, 0.1),
              },
              alignSelf: 'flex-start',
            }}
          >
            Learn More
          </Button>
        </CardContent>
      </Card>
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

const Services = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const mainServices = [
    {
      icon: <MonitorHeart />,
      title: "SoulSpace Health Monitoring",
      description: "Currently in development: Our proprietary SoulSpace wearable device will provide real-time monitoring of vital signs with clinical-grade accuracy. Track heart rate, blood pressure, oxygen levels, and more. Expected launch in 2027.",
      color: "#4f46e5"
    },
    {
      icon: <LocalHospital />,
      title: "Hospital Management",
      description: "Comprehensive hospital management system that streamlines operations, patient care, and administrative tasks for healthcare facilities of all sizes.",
      color: "#ec4899"
    },
    {
      icon: <Medication />,
      title: "Medication Management",
      description: "Digital prescription system with automated refill reminders, drug interaction checks, and medication adherence tracking for better health outcomes.",
      color: "#10b981"
    },
    {
      icon: <Security />,
      title: "Secure Health Records",
      description: "HIPAA-compliant secure storage and sharing of patient medical records with end-to-end encryption and advanced access controls.",
      color: "#f59e0b"
    },
    {
      icon: <Psychology />,
      title: "AI Health Assistant",
      description: "24/7 AI-powered health assistant that provides personalized health insights, answers medical questions, and helps manage your healthcare journey.",
      color: "#8b5cf6"
    },
    {
      icon: <MedicalServices />,
      title: "Telehealth Services",
      description: "Virtual consultations with healthcare providers from the comfort of your home. Connect with doctors, specialists, and therapists via secure video calls.",
      color: "#ef4444"
    }
  ];

  const additionalServices = [
    {
      icon: <DevicesOther />,
      title: "SoulSpace Wearable Device",
      description: "Currently in development: Our proprietary SoulSpace wearable device will provide clinical-grade health monitoring with secure data transmission and extended battery life. Will be available exclusively to our patients upon launch in 2027."
    },
    {
      icon: <SupportAgent />,
      title: "24/7 Support",
      description: "Round-the-clock technical and medical support from our team of healthcare professionals and IT specialists."
    },
    {
      icon: <School />,
      title: "Health Education",
      description: "Access to a vast library of educational resources, webinars, and personalized health tips based on your health data."
    },
    {
      icon: <Healing />,
      title: "Wellness Programs",
      description: "Customized wellness programs designed by healthcare professionals to help you achieve your health and fitness goals."
    }
  ];

  return (
    <Box sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : alpha(theme.palette.primary.light, 0.1),
          py: 10,
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
                  Our Healthcare Services
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.6 }}
                >
                  Comprehensive healthcare solutions designed to improve patient outcomes, streamline operations, and enhance the healthcare experience for all.
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
                  Get Started
                </Button>
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
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80"
                  alt="Healthcare Services"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    mx: 'auto',
                    display: 'block',
                    objectFit: 'cover',
                    aspectRatio: '4/3',
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Services Section */}
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
            Our Core Services
          </Typography>
          <Typography
            variant="h5"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
          >
            Comprehensive healthcare solutions powered by cutting-edge technology
          </Typography>
        </ScrollReveal>

        <Grid container spacing={4}>
          {mainServices.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ServiceCard {...service} index={index} />
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
              How Our Services Work
            </Typography>
            <Typography
              variant="h5"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
            >
              A seamless healthcare experience from start to finish
            </Typography>
          </ScrollReveal>

          <Grid container spacing={6}>
            {[
              {
                number: "01",
                title: "Sign Up & Create Profile",
                description: "Create your account and set up your health profile with medical history, allergies, and current medications.",
                icon: <PersonAdd />,
                color: theme.palette.primary.main
              },
              {
                number: "02",
                title: "Future: SoulSpace Device",
                description: "Coming in 2027: Our proprietary SoulSpace wearable device will connect directly to our platform for real-time health monitoring with clinical-grade accuracy.",
                icon: <DevicesOther />,
                color: theme.palette.secondary.main
              },
              {
                number: "03",
                title: "Book Appointments",
                description: "Schedule appointments with healthcare providers at your preferred hospital, either in-person or virtual.",
                icon: <EventAvailable />,
                color: theme.palette.success.main
              },
              {
                number: "04",
                title: "Receive Care & Monitor Progress",
                description: "Get personalized care from healthcare professionals and track your health progress over time.",
                icon: <Healing />,
                color: theme.palette.info.main
              }
            ].map((step, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      p: 4,
                      height: '100%',
                      borderRadius: 4,
                      bgcolor: theme.palette.mode === 'dark' ? alpha(step.color, 0.1) : alpha(step.color, 0.05),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 30px ${alpha(step.color, 0.2)}`,
                      }
                    }}
                  >
                    <Typography
                      variant="h1"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 20,
                        fontSize: '5rem',
                        fontWeight: 900,
                        opacity: 0.1,
                        color: step.color,
                      }}
                    >
                      {step.number}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 3,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: alpha(step.color, 0.2),
                          color: step.color,
                          width: 56,
                          height: 56,
                          mr: 2,
                        }}
                      >
                        {React.cloneElement(step.icon, { sx: { fontSize: 30 } })}
                      </Avatar>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: step.color }}>
                        {step.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Additional Services */}
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
            Additional Services
          </Typography>
          <Typography
            variant="h5"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
          >
            Enhancing your healthcare experience with complementary offerings
          </Typography>
        </ScrollReveal>

        <Grid container spacing={4}>
          {additionalServices.map((service, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    p: 3,
                    borderRadius: 4,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.light, 0.1),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      width: 64,
                      height: 64,
                      mr: 3,
                    }}
                  >
                    {React.cloneElement(service.icon, { sx: { fontSize: 32 } })}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {service.description}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'dark'
            ? 'background.paper'
            : alpha(theme.palette.primary.light, 0.1),
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: 'center',
              p: 4,
              borderRadius: 4,
              bgcolor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.background.paper, 0.9),
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Ready to Transform Your Healthcare Experience?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
              Join thousands of users who are already benefiting from our comprehensive healthcare services
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
              Get Started Today
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Services;
