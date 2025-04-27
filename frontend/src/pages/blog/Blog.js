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
      title: 'The Future of AI in Healthcare',
      excerpt: 'Discover how artificial intelligence is revolutionizing patient care and medical diagnosis.',
      image: '/blog/ai-healthcare.jpg',
      category: 'Technology',
      date: 'Feb 20, 2025',
      readTime: '5 min read',
    },
    {
      title: 'Improving Patient Engagement',
      excerpt: 'Learn effective strategies for better patient engagement and satisfaction in healthcare.',
      image: '/blog/patient-engagement.jpg',
      category: 'Patient Care',
      date: 'Feb 18, 2025',
      readTime: '4 min read',
    },
    {
      title: 'Healthcare Data Security',
      excerpt: 'Best practices for protecting sensitive patient data in the digital age.',
      image: '/blog/data-security.jpg',
      category: 'Security',
      date: 'Feb 15, 2025',
      readTime: '6 min read',
    },
    {
      title: 'Digital Transformation in Healthcare',
      excerpt: 'How digital solutions are reshaping the healthcare industry.',
      image: '/blog/digital-health.jpg',
      category: 'Innovation',
      date: 'Feb 12, 2025',
      readTime: '7 min read',
    },
  ];

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
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
            Healthcare Insights
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
          >
            Stay updated with the latest trends, insights, and best practices in healthcare management
          </Typography>
        </motion.div>

        {/* Blog Posts Grid */}
        <Grid container spacing={4}>
          {blogPosts.map((post, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="240"
                    image={post.image}
                    alt={post.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={post.category}
                        size="small"
                        color="primary"
                        sx={{ borderRadius: 1 }}
                      />
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ color: 'text.secondary' }}
                      >
                        <AccessTime sx={{ fontSize: 16 }} />
                        <Typography variant="caption">{post.readTime}</Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {post.title}
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      {post.excerpt}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        endIcon={<ArrowForward />}
                        sx={{ textTransform: 'none' }}
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
      </Container>
    </Box>
  );
};

export default Blog;
