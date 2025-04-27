import React, { useState } from 'react';
import { usePosts } from '../../context/PostContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tab,
  Tabs,
  InputAdornment,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Forum,
  Search,
  ThumbUp,
  Comment,
  Visibility,
  Add,
  FilterList,
  Sort,
  Home,
  HelpCenter,
  ArrowForward,
  BookmarkBorder,
  Person,
  QuestionAnswer,
  Announcement,
  Lightbulb,
  MedicalServices,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

// Helper function to safely format dates
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown date';

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

// Add this helper function at the top of your file
const stripHtmlTags = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Sample forum categories
const forumCategories = [
  { id: 1, name: 'General Discussion', icon: <Forum />, count: 156 },
  { id: 2, name: 'Health Tips', icon: <Lightbulb />, count: 89 },
  { id: 3, name: 'Medical Advice', icon: <MedicalServices />, count: 124 },
  { id: 4, name: 'App Support', icon: <QuestionAnswer />, count: 67 },
  { id: 5, name: 'Announcements', icon: <Announcement />, count: 23 },
];

// Forum posts are now managed through the PostContext

// Sample trending topics
const trendingTopics = [
  { id: 1, title: 'COVID-19 booster shots', posts: 87 },
  { id: 2, title: 'Mental health awareness', posts: 64 },
  { id: 3, title: 'Wearable device accuracy', posts: 52 },
  { id: 4, title: 'Meditation techniques', posts: 43 },
  { id: 5, title: 'Healthy meal prep', posts: 38 },
];

const CommunityForum = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { posts } = usePosts(); // Get posts from context

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
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
          <Link component={RouterLink} to="/help" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpCenter fontSize="small" sx={{ mr: 0.5 }} />
            Help Center
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <Forum fontSize="small" sx={{ mr: 0.5 }} />
            Community Forum
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{
            textAlign: 'center',
            mb: 4,
            position: 'relative',
            py: 4,
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
              Community Forum
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                maxWidth: '800px',
                mx: 'auto',
                opacity: 0.9,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Connect with other users, share experiences, and get answers to your questions
            </Typography>

            {/* Search Box */}
            <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search the forum..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: theme.palette.primary.main }} />
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

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Box component={motion.div} variants={itemVariants}>
              {/* Tabs and Actions */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                mb: 2
              }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      minWidth: 'auto',
                      px: { xs: 1, sm: 2 },
                      py: 1,
                    }
                  }}
                >
                  <Tab label="All Posts" />
                  <Tab label="Popular" />
                  <Tab label="Recent" />
                  <Tab label="Unanswered" />
                </Tabs>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    size="small"
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                  >
                    Filter
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Sort />}
                    size="small"
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                  >
                    Sort
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={RouterLink}
                    to="/community/create-post"
                  >
                    New Post
                  </Button>
                </Box>
              </Box>

              {/* Forum Posts */}
              <List sx={{ mb: 4 }}>
                {posts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No posts found
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      component={RouterLink}
                      to="/community/create-post"
                      sx={{ mt: 2 }}
                    >
                      Create the first post
                    </Button>
                  </Box>
                ) : (
                  posts.map((post) => (
                  <ListItem
                    key={post.id}
                    component={motion.div}
                    variants={itemVariants}
                    disablePadding
                    sx={{ mb: 2 }}
                  >
                    <Card
                      sx={{
                        width: '100%',
                        borderRadius: '12px',
                        boxShadow: post.pinned
                          ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`
                          : '0 2px 10px rgba(0,0,0,0.05)',
                        border: post.pinned ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                        }
                      }}
                    >
                      {post.pinned && (
                        <Chip
                          label="Pinned"
                          color="primary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -10,
                            right: 16,
                            fontWeight: 600,
                          }}
                        />
                      )}
                      <CardHeader
                        avatar={
                          <Avatar
                            src={post.author.avatar}
                            alt={post.author.name}
                            sx={{ width: 40, height: 40 }}
                          >
                            {post.author.name.charAt(0)}
                          </Avatar>
                        }
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Typography
                              variant="subtitle1"
                              component={RouterLink}
                              to={`/community/post/${post._id}`}
                              sx={{
                                fontWeight: 600,
                                textDecoration: 'none',
                                color: 'text.primary',
                                '&:hover': { color: theme.palette.primary.main }
                              }}
                            >
                              {post.title}
                            </Typography>
                            <Chip
                              label={post.category}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                              }}
                            />
                          </Box>
                        }
                        subheader={
                          <Typography variant="caption" color="text.secondary">
                            Posted by {post.author.name} • {formatTimestamp(post.timestamp)}
                          </Typography>
                        }
                        action={
                          <IconButton size="small">
                            <BookmarkBorder fontSize="small" />
                          </IconButton>
                        }
                      />
                      <CardContent sx={{ pt: 0 }}>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {(() => {
                            const plainText = stripHtmlTags(post.content);
                            return plainText.length > 150
                              ? `${plainText.substring(0, 150)}...`
                              : plainText;
                          })()}
                        </Typography>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton size="small">
                                <FavoriteBorder fontSize="small" />
                              </IconButton>
                              <Typography variant="caption" color="text.secondary">
                                {Array.isArray(post.likes) ? post.likes.length : 0}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton size="small">
                                <Comment fontSize="small" />
                              </IconButton>
                              <Typography variant="caption" color="text.secondary">
                                {Array.isArray(post.comments) ? post.comments.length : 0}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Visibility fontSize="small" sx={{ mr: 0.5, color: 'text.disabled', fontSize: '1rem' }} />
                              <Typography variant="caption" color="text.secondary">
                                {post.views}
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            size="small"
                            endIcon={<ArrowForward />}
                            component={RouterLink}
                            to={`/community/post/${post._id}`}
                          >
                            Read More
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </ListItem>
                )))}
              </List>

              {/* Load More Button */}
              <Box sx={{ textAlign: 'center', mt: 2, mb: 4 }}>
                <Button variant="outlined">
                  Load More
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Categories */}
            <Paper
              component={motion.div}
              variants={itemVariants}
              sx={{
                p: 3,
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                mb: 4
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Categories
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {forumCategories.map((category) => (
                  <ListItem
                    key={category.id}
                    component={RouterLink}
                    to={`/community/category/${category.id}`}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: '8px',
                      mb: 1,
                      textDecoration: 'none',
                      color: 'text.primary',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Box sx={{ color: theme.palette.primary.main }}>
                        {category.icon}
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={category.name}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                    <Chip
                      label={category.count}
                      size="small"
                      sx={{
                        height: 24,
                        minWidth: 30,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Trending Topics */}
            <Paper
              component={motion.div}
              variants={itemVariants}
              sx={{
                p: 3,
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                mb: 4
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Trending Topics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {trendingTopics.map((topic) => (
                  <ListItem
                    key={topic.id}
                    component={RouterLink}
                    to={`/community/topic/${topic.id}`}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: '8px',
                      mb: 1,
                      textDecoration: 'none',
                      color: 'text.primary',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }
                    }}
                  >
                    <ListItemText
                      primary={`#${topic.title}`}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {topic.posts} posts
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Community Guidelines */}
            <Paper
              component={motion.div}
              variants={itemVariants}
              sx={{
                p: 3,
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Community Guidelines
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                Our community is a place for respectful discussion and support. Please follow these guidelines:
              </Typography>
              <List dense disablePadding>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Be respectful and supportive of others"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Do not share personal medical information"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="This is not a substitute for professional medical advice"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Report inappropriate content to moderators"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                component={RouterLink}
                to="/community/guidelines"
              >
                Read Full Guidelines
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CommunityForum;



