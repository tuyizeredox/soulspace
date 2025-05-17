import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import { AccessTime, ArrowForward } from '@mui/icons-material';

const Blog = () => {
  const theme = useTheme();

  const blogPosts = [
    {
      title: 'From S4 to S6: Our SoulSpace Journey',
      excerpt: 'Tuyizere Dieudonne and Aristote share their journey developing the SoulSpace concept from their initial idea in Senior 4 to their current progress in Senior 6.',
      image: 'https://images.unsplash.com/photo-1575908539614-ff89490f4a78?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2533&q=80',
      category: 'Development',
      date: 'May 15, 2023',
      readTime: '8 min read',
    },
    {
      title: 'The Future of AI in Healthcare',
      excerpt: 'Discover how artificial intelligence will revolutionize patient care and medical diagnosis through our upcoming SoulSpace platform and wearable device.',
      image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
      category: 'Technology',
      date: 'Apr 20, 2025',
      readTime: '5 min read',
    },
    {
      title: 'Designing the SoulSpace Wearable Experience',
      excerpt: 'Our UX team shares insights into the design process for our upcoming proprietary wearable device, focusing on usability and patient engagement.',
      image: 'https://images.unsplash.com/photo-1559447646-f0c8e342d6b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80',
      category: 'Design',
      date: 'Mar 18, 2025',
      readTime: '6 min read',
    },
    {
      title: 'Security First: Building the SoulSpace Platform',
      excerpt: 'Our approach to ensuring data security and patient privacy in the development of our healthcare platform and upcoming wearable device.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
      category: 'Security',
      date: 'Mar 05, 2025',
      readTime: '7 min read',
    },
    {
      title: 'Digital Transformation in Healthcare',
      excerpt: 'How SoulSpace aims to lead the digital revolution in healthcare management following our founding in 2025.',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      category: 'Innovation',
      date: 'Feb 20, 2025',
      readTime: '7 min read',
    },
    {
      title: 'Meet the Founders: Tuyizere Dieudonne and Aristote',
      excerpt: 'Learn about the two visionary high school students behind SoulSpace Health. From a school project in Senior 4 to a comprehensive healthcare solution being developed in Senior 6.',
      image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80',
      category: 'Founders',
      date: 'Jan 30, 2023',
      readTime: '9 min read',
    },
  ];

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : alpha(theme.palette.primary.light, 0.1),
          py: { xs: 8, md: 12 },
          mb: 8,
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h1"
              component="h1"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 3,
                background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SoulSpace Health Blog
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}
            >
              Stay updated with the latest trends, insights, and best practices in healthcare management and our proprietary SoulSpace wearable technology
            </Typography>

            {/* Featured Categories */}
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mt: 4 }}>
              {['All', 'Product', 'Technology', 'Research', 'Security', 'Innovation', 'Company'].map((category, index) => (
                <Chip
                  key={index}
                  label={category}
                  clickable
                  color={index === 0 ? 'primary' : 'default'}
                  sx={{
                    px: 1,
                    fontWeight: 500,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                />
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg">

        {/* Featured Post */}
        {blogPosts.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <Box sx={{ width: { xs: '100%', md: '50%' }, position: 'relative' }}>
                  <CardMedia
                    component="img"
                    sx={{
                      height: { xs: 240, md: 400 },
                      objectFit: 'cover',
                    }}
                    image={blogPosts[0].image}
                    alt={blogPosts[0].title}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      bgcolor: alpha(theme.palette.primary.main, 0.9),
                      color: 'white',
                      py: 0.5,
                      px: 2,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    Featured
                  </Box>
                </Box>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: { xs: '100%', md: '50%' },
                  p: { xs: 3, md: 4 },
                }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      label={blogPosts[0].category}
                      size="small"
                      sx={{
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    />
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ color: 'text.secondary' }}
                    >
                      <AccessTime sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{blogPosts[0].readTime}</Typography>
                    </Stack>
                  </Stack>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                    {blogPosts[0].title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3, flexGrow: 1 }}>
                    {blogPosts[0].excerpt}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {blogPosts[0].date}
                    </Typography>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
                        boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
                        '&:hover': {
                          boxShadow: '0 6px 15px rgba(79, 70, 229, 0.4)',
                        },
                      }}
                    >
                      Read Article
                    </Button>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Box>
        )}

        {/* Blog Posts Grid */}
        <Grid container spacing={4}>
          {blogPosts.slice(1).map((post, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 12px 25px rgba(0, 0, 0, 0.12)',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.image}
                      alt={post.title}
                      sx={{
                        transition: 'transform 0.5s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: alpha(theme.palette.primary.main, 0.9),
                        color: 'white',
                        py: 0.5,
                        px: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {post.category}
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                      {post.readTime} • {post.date}
                    </Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.3, mb: 1.5 }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {post.excerpt}
                    </Typography>
                    <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                      <Button
                        endIcon={<ArrowForward />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          }
                        }}
                      >
                        Read More
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Load More Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Button
            variant="outlined"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: theme.palette.primary.dark,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              }
            }}
          >
            Load More Articles
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Blog;
