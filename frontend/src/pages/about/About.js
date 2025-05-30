import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  Stack,
  useTheme,
  alpha,
  Button,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import SEOMetaTags from '../../components/seo/SEOMetaTags';
import { motion } from 'framer-motion';
import {
  MonitorHeart,
  Security,
  Psychology,
  Speed,
  Groups,
  HealthAndSafety,
  Favorite,
  AccessTime,
  LocationOn,
  CheckCircle,
  ArrowForward,
  Timeline,
  Diversity3,
  Handshake,
  Lightbulb,
  Verified,
  MedicalServices,
  Healing,
  Biotech,
  VerifiedUser,
  PersonAdd,
  EventAvailable,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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

const About = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: 'Tuyizere Dieudonne',
      role: 'Chief Executive Officer & Co-Founder',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80',
      bio: 'Visionary leader who conceived the idea for SoulSpace Health during Senior 4 (S4). Currently in Senior 6 (S6), Tuyizere is driving the development of the SoulSpace wearable device while completing his education.',
      expertise: ['Healthcare Innovation', 'Business Strategy', 'Product Vision'],
    },
    {
      name: 'Aristote',
      role: 'President & Co-Founder',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80',
      bio: 'Co-creator of the SoulSpace concept during Senior 4 (S4). Now in Senior 6 (S6), Aristote is focused on developing the business model and strategic partnerships that will bring the SoulSpace vision to reality.',
      expertise: ['Strategic Planning', 'Partnership Development', 'Healthcare Systems'],
    }
  ];

  const coreValues = [
    {
      icon: <HealthAndSafety />,
      title: 'Patient-Centered Care',
      description: 'We put patients at the center of everything we do, ensuring their needs, preferences, and values guide all clinical decisions.',
      color: '#4f46e5',
    },
    {
      icon: <Security />,
      title: 'Data Security & Privacy',
      description: 'We maintain the highest standards of data protection, ensuring patient information is secure, private, and HIPAA-compliant.',
      color: '#ef4444',
    },
    {
      icon: <Psychology />,
      title: 'Innovation & Intelligence',
      description: 'We leverage cutting-edge AI and technology to continuously improve healthcare delivery and patient outcomes.',
      color: '#8b5cf6',
    },
    {
      icon: <Diversity3 />,
      title: 'Inclusivity & Accessibility',
      description: 'We design our solutions to be accessible to all patients regardless of background, ability, or technical expertise.',
      color: '#10b981',
    },
    {
      icon: <Handshake />,
      title: 'Collaborative Approach',
      description: 'We work closely with healthcare providers, patients, and partners to create integrated solutions that benefit everyone.',
      color: '#f59e0b',
    },
    {
      icon: <VerifiedUser />,
      title: 'Quality & Excellence',
      description: 'We are committed to the highest standards of quality in everything we do, from software development to customer support.',
      color: '#06b6d4',
    },
  ];

  return (
    <Box sx={{ pb: 8 }}>
      <SEOMetaTags 
        title="About SoulSpace Health"
        description="Learn about SoulSpace Health's mission, values, and team. We're dedicated to transforming healthcare through innovative technology solutions."
        keywords="healthcare mission, medical technology, healthcare values, SoulSpace team, healthcare innovation, medical solutions"
        canonicalUrl="/about"
        ogImage="/favicons/favicon-512x512.png"
      />
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
                  About SoulSpace Health
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.6 }}
                >
                  We're on a mission to transform healthcare management through innovative technology,
                  compassionate care, and a commitment to improving patient outcomes worldwide.
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
                  Join Our Journey
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
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="About SoulSpace Health"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    mx: 'auto',
                    display: 'block',
                    objectFit: 'cover',
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Our Story Section */}
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
            Our Story
          </Typography>
          <Typography
            variant="h5"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
          >
            From a simple idea to a comprehensive healthcare platform
          </Typography>
        </ScrollReveal>

        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <ScrollReveal>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80"
                alt="Our Story"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  objectFit: 'cover',
                  aspectRatio: '16/9',
                }}
              />
            </ScrollReveal>
          </Grid>
          <Grid item xs={12} md={6}>
            <ScrollReveal delay={0.2}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                The SoulSpace Health Story
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
                SoulSpace Health began as a visionary idea in 2023 when our CEO, Tuyizere Dieudonne, and President, Aristote, were still in Senior 4 (S4). Witnessing the challenges in healthcare delivery in their community, they dreamed of creating a solution that would bridge the gaps between patients and healthcare providers through technology.
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
                The breakthrough moment came during a school project when Tuyizere and Aristote conceptualized a wearable device that could continuously monitor vital health metrics and seamlessly integrate with a comprehensive healthcare management platform. This vision of connected healthcare—where patients, providers, and data work together in harmony—became the foundation of SoulSpace Health.
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
                Now in Senior 6 (S6), Tuyizere and Aristote are actively developing their concept with the support of mentors and technology advisors. While still in school, they're laying the groundwork for what will become the SoulSpace wearable device—a revolutionary health monitoring technology designed to provide clinical-grade accuracy in a comfortable, user-friendly form factor. Their goal is to officially launch the company in 2025 after completing their education.
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                While still in the conceptual and early development stages, their vision is clear: to create a healthcare system where technology enhances the human connection between patients and providers, where data flows securely and meaningfully, and where everyone has access to personalized, proactive healthcare. The SoulSpace wearable device, expected to launch in 2027, will be the cornerstone of this vision, representing the journey from a high school idea to a revolutionary healthcare solution.
              </Typography>

              {/* Key Milestones */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  Key Milestones
                </Typography>
                <Stack spacing={2}>
                  {[
                    { year: '2023', event: 'Concept for SoulSpace Health originated during Senior 4 (S4)' },
                    { year: '2025', event: 'Planned official founding after completion of Senior 6 (S6)' },
                    { year: '2026', event: 'Planning to launch our first hospital management system with 10 partner hospitals' },
                    { year: '2027', event: 'Expected release of our proprietary SoulSpace wearable device and AI-powered patient assistance' },
                    { year: '2028', event: 'Projected expansion to 100+ healthcare facilities across 15 countries' }
                  ].map((milestone, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Chip
                        label={milestone.year}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          mr: 2,
                          minWidth: 70,
                        }}
                      />
                      <Typography variant="body1">{milestone.event}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </ScrollReveal>
          </Grid>
        </Grid>
      </Container>

      {/* Core Values Section */}
      <Box sx={{
        py: { xs: 8, md: 12 },
        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.light, 0.05),
      }}>
        <Container maxWidth="lg">
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
              Our Core Values
            </Typography>
            <Typography
              variant="h5"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
            >
              The principles that guide everything we do
            </Typography>
          </ScrollReveal>

          <Grid container spacing={4}>
            {coreValues.map((value, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ScrollReveal delay={index * 0.1}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      borderRadius: 4,
                      transition: 'all 0.3s ease',
                      border: `1px solid ${alpha(value.color, 0.2)}`,
                      boxShadow: `0 10px 30px ${alpha(value.color, 0.1)}`,
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 15px 35px ${alpha(value.color, 0.2)}`,
                      },
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: value.color,
                      },
                    }}
                  >
                    <Box sx={{ color: value.color, mb: 2 }}>
                      {React.cloneElement(value.icon, { sx: { fontSize: 40 } })}
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: value.color }}>
                      {value.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {value.description}
                    </Typography>
                  </Paper>
                </ScrollReveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
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
            Meet Our Team
          </Typography>
          <Typography
            variant="h5"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
          >
            The passionate experts behind SoulSpace Health
          </Typography>
        </ScrollReveal>

        <Grid container spacing={4}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ScrollReveal delay={index * 0.1}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                      '& .member-avatar': {
                        transform: 'scale(1.05)',
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      pt: '75%', // 4:3 aspect ratio
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      overflow: 'hidden',
                    }}
                  >
                    <Avatar
                      src={member.image}
                      className="member-avatar"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: 0,
                        transition: 'transform 0.5s ease',
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                      {member.name}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {member.bio}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {member.expertise.map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={skill}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : alpha(theme.palette.primary.light, 0.1),
        py: 8,
      }}>
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
              Join Our Healthcare Revolution
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
              Be part of the future of healthcare management and patient care
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

export default About;
