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
} from '@mui/material';
import { motion } from 'framer-motion';
import { MonitorHeart, Security, Psychology, Speed, Groups } from '@mui/icons-material';

const About = () => {
  const theme = useTheme();

  const teamMembers = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      image: '/team/sarah.jpg',
      bio: 'Leading healthcare innovation with 15+ years of experience',
    },
    {
      name: 'Michael Chen',
      role: 'Tech Lead',
      image: '/team/michael.jpg',
      bio: 'Expert in healthcare software development',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Operations',
      image: '/team/emily.jpg',
      bio: 'Streamlining healthcare processes for optimal efficiency',
    },
  ];

  const missions = [
    {
      icon: <MonitorHeart />,
      title: 'Innovative Care',
      description: 'Revolutionizing healthcare through technology',
    },
    {
      icon: <Security />,
      title: 'Patient Security',
      description: 'Ensuring data protection and privacy',
    },
    {
      icon: <Psychology />,
      title: 'Smart Solutions',
      description: 'AI-powered healthcare management',
    },
  ];

  return (
    <Box sx={{ py: 8 }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            About SoulSpace
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
          >
            Transforming healthcare management through innovative technology and compassionate care
          </Typography>
        </motion.div>

        {/* Mission Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {missions.map((mission, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.light, 0.1),
                    borderRadius: 2,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>
                    {React.cloneElement(mission.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {mission.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {mission.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Team Section */}
        <Typography variant="h3" align="center" sx={{ mb: 6, fontWeight: 700 }}>
          Our Team
        </Typography>
        <Grid container spacing={4}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.light, 0.1),
                    borderRadius: 2,
                  }}
                >
                  <Avatar
                    src={member.image}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      border: `4px solid ${theme.palette.primary.main}`,
                    }}
                  />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {member.name}
                  </Typography>
                  <Typography color="primary" gutterBottom>
                    {member.role}
                  </Typography>
                  <Typography color="text.secondary">
                    {member.bio}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
