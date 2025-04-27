import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePosts } from '../../context/PostContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material';
import {
  Forum,
  Home,
  HelpCenter,
  ArrowBack,
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Share,
  Bookmark,
  BookmarkBorder,
  MoreVert,
  Send,
  Report,
  Edit,
  Delete,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

// Add this helper function at the top of your file
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown date';

  try {
    // If timestamp is already a Date object
    if (timestamp instanceof Date) {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    }

    // If timestamp is a string or number, convert to Date
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

const formatJoinDate = (date) => {
  if (!date) return 'Unknown';
  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    return 'Unknown';
  }
};

// Sample post data (in a real app, this would come from an API)
const postData = {
  id: 1,
  title: 'Tips for managing stress during the pandemic',
  author: {
    id: 101,
    name: 'Sarah Johnson',
    avatar: '/images/avatars/avatar1.jpg',
    role: 'Member',
    joinDate: new Date(2021, 5, 15),
    posts: 42,
  },
  category: 'Health Tips',
  content: `
    <p>I've been practicing mindfulness meditation for the past month and it's made a huge difference in my stress levels. Anyone else tried this?</p>

    <p>Here are some techniques that have worked for me:</p>

    <ul>
      <li><strong>Morning meditation:</strong> Just 10 minutes after waking up helps set the tone for the day</li>
      <li><strong>Breathing exercises:</strong> 4-7-8 breathing technique (inhale for 4, hold for 7, exhale for 8) is great for anxiety</li>
      <li><strong>Mindful walking:</strong> Taking a walk without your phone and just being present in the moment</li>
      <li><strong>Gratitude journaling:</strong> Writing down 3 things you're grateful for each day</li>
    </ul>

    <p>I've also found that limiting news consumption and social media has helped tremendously. It's easy to get overwhelmed with all the negative information.</p>

    <p>What stress management techniques have worked for you during these challenging times?</p>
  `,
  likes: 42,
  comments: [
    {
      id: 1,
      author: {
        id: 102,
        name: 'Michael Chen',
        avatar: '/images/avatars/avatar2.jpg',
      },
      content: "Thanks for sharing these tips! I've been trying meditation too but struggle with consistency. How do you stay motivated to do it daily?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20), // 20 hours ago
      likes: 8,
    },
    {
      id: 2,
      author: {
        id: 101,
        name: 'Sarah Johnson',
        avatar: '/images/avatars/avatar1.jpg',
      },
      content: "I use a meditation app that sends me reminders, and I've made it part of my morning routine right after brushing my teeth. Linking it to an existing habit helps a lot!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 19), // 19 hours ago
      likes: 5,
    },
    {
      id: 3,
      author: {
        id: 103,
        name: 'Emily Rodriguez',
        avatar: '/images/avatars/avatar4.jpg',
      },
      content: "I've found that yoga combined with meditation works wonders for me. The physical movement helps me settle into the meditation practice more easily.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      likes: 12,
    },
    {
      id: 4,
      author: {
        id: 104,
        name: 'Robert Williams',
        avatar: '/images/avatars/avatar3.jpg',
      },
      content: "Has anyone tried the Wim Hof breathing method? It's been a game-changer for my stress levels and energy.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      likes: 3,
    },
  ],
  views: 230,
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  pinned: true,
  tags: ['stress management', 'meditation', 'mental health', 'wellness'],
};

// Related posts
const relatedPosts = [
  {
    id: 2,
    title: 'How to improve your sleep quality',
    author: {
      name: 'Michael Chen',
      avatar: '/images/avatars/avatar2.jpg',
    },
    category: 'Health Tips',
    comments: 15,
    views: 187,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  },
  {
    id: 3,
    title: 'Nutrition tips for boosting immunity',
    author: {
      name: 'Emily Rodriguez',
      avatar: '/images/avatars/avatar4.jpg',
    },
    category: 'Health Tips',
    comments: 23,
    views: 215,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
  },
  {
    id: 4,
    title: 'Home workout routines with no equipment',
    author: {
      name: 'Robert Williams',
      avatar: '/images/avatars/avatar3.jpg',
    },
    category: 'Health Tips',
    comments: 19,
    views: 198,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4 days ago
  },
];

const CommunityPost = () => {
  const theme = useTheme();
  const { postId } = useParams();
  const navigate = useNavigate();
  const { getPostById, likePost, addComment } = usePosts();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likedComments, setLikedComments] = useState([]);

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

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        // Don't parse postId as integer - MongoDB IDs are strings
        const foundPost = await getPostById(postId);

        if (foundPost) {
          // Ensure timestamp is a proper Date object
          setPost({
            ...foundPost,
            timestamp: new Date(foundPost.timestamp || foundPost.createdAt),
            comments: (foundPost.comments || []).map(comment => ({
              ...comment,
              timestamp: new Date(comment.timestamp || comment.createdAt)
            }))
          });
        } else {
          // Use sample data with proper Date objects
          const sampleDataWithDates = {
            ...postData,
            timestamp: new Date(),
            comments: postData.comments.map(comment => ({
              ...comment,
              timestamp: new Date(comment.timestamp)
            }))
          };
          setPost(sampleDataWithDates);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, getPostById]);

  const handleCommentChange = (event) => {
    setCommentText(event.target.value);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      // Use the actual API call from the context
      const newComment = await addComment(postId, { content: commentText });

      // Update the post with the new comment
      setPost(prevPost => ({
        ...prevPost,
        comments: [...(prevPost.comments || []), {
          ...newComment,
          timestamp: new Date(newComment.timestamp || newComment.createdAt)
        }]
      }));

      // Clear the comment field
      setCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    }
  };

  const handleLikePost = async () => {
    try {
      // Use the actual API call from the context
      await likePost(postId);
      setLiked(true);
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post. Please try again.');
    }
  };

  const handleBookmarkPost = () => {
    setBookmarked(!bookmarked);
    // In a real app, this would be an API call to bookmark/unbookmark the post
  };

  const handleLikeComment = (commentId) => {
    if (likedComments.includes(commentId)) {
      setLikedComments(likedComments.filter(id => id !== commentId));
    } else {
      setLikedComments([...likedComments, commentId]);
    }
    // In a real app, this would be an API call to like/unlike the comment
  };

  const handleSharePost = () => {
    // In a real app, this would open a share dialog
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            Post not found
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/community')}
            sx={{ mt: 2 }}
          >
            Back to Community
          </Button>
        </Box>
      </Container>
    );
  }

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
          <Link component={RouterLink} to="/community" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <Forum fontSize="small" sx={{ mr: 0.5 }} />
            Community Forum
          </Link>
          <Typography color="text.primary" noWrap sx={{ maxWidth: 200 }}>
            {post.title}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Post */}
            <Card
              component={motion.div}
              variants={itemVariants}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                mb: 4,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Post Header */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Button
                      startIcon={<ArrowBack />}
                      component={RouterLink}
                      to="/community"
                      sx={{ mb: 2 }}
                    >
                      Back to Community
                    </Button>

                    <Box>
                      {post.pinned && (
                        <Chip
                          label="Pinned"
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 600, mr: 1 }}
                        />
                      )}
                      <Chip
                        label={post.category}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                    {post.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={post.author.avatar}
                        alt={post.author.name}
                        sx={{ width: 40, height: 40, mr: 1 }}
                      >
                        {post.author.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          component={RouterLink}
                          to={`/community/user/${post.author.id}`}
                          sx={{
                            textDecoration: 'none',
                            color: 'text.primary',
                            '&:hover': { color: theme.palette.primary.main },
                          }}
                        >
                          {post.author.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Posted {formatTimestamp(post.timestamp)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        onClick={handleLikePost}
                        color={liked ? 'primary' : 'default'}
                        size="small"
                      >
                        {liked ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        {(Array.isArray(post.likes) ? post.likes.length : 0) + (liked ? 1 : 0)}
                      </Typography>

                      <IconButton
                        onClick={handleBookmarkPost}
                        color={bookmarked ? 'primary' : 'default'}
                        size="small"
                      >
                        {bookmarked ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
                      </IconButton>

                      <IconButton onClick={handleSharePost} size="small">
                        <Share fontSize="small" />
                      </IconButton>

                      <IconButton size="small">
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {post.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={`#${tag}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: '4px',
                          height: 24,
                          fontSize: '0.75rem',
                        }}
                        component={RouterLink}
                        to={`/community/tag/${tag}`}
                        clickable
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Post Content */}
                <Box
                  sx={{ mb: 3 }}
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <Divider sx={{ mb: 3 }} />

                {/* Post Actions */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant={liked ? 'contained' : 'outlined'}
                      startIcon={liked ? <ThumbUp /> : <ThumbUpOutlined />}
                      onClick={handleLikePost}
                    >
                      {liked ? 'Liked' : 'Like'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Comment />}
                      href="#comments"
                    >
                      Comment
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={handleSharePost}
                    >
                      Share
                    </Button>
                  </Box>

                  <Button
                    variant={bookmarked ? 'contained' : 'outlined'}
                    startIcon={bookmarked ? <Bookmark /> : <BookmarkBorder />}
                    onClick={handleBookmarkPost}
                    color={bookmarked ? 'primary' : 'inherit'}
                  >
                    {bookmarked ? 'Saved' : 'Save'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Comments */}
            <Box component={motion.div} variants={itemVariants} id="comments">
              <Card
                sx={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  mb: 4,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Comments ({post.comments.length})
                  </Typography>

                  <Divider sx={{ mb: 3 }} />

                  {/* Add Comment */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        // This would be the current user's avatar in a real app
                        src="/images/avatars/user.jpg"
                        sx={{ width: 40, height: 40 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={handleCommentChange}
                          sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            endIcon={<Send />}
                            onClick={handleSubmitComment}
                            disabled={!commentText.trim()}
                          >
                            Post Comment
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Comments List */}
                  <List>
                    {post.comments.map((comment, index) => (
                      <React.Fragment key={comment._id || comment.id || index}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            px: 0,
                            py: 2,
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              src={comment.author?.avatar}
                              alt={comment.author?.name || 'User'}
                            >
                              {comment.author?.name ? comment.author.name.charAt(0) : 'U'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    component={RouterLink}
                                    to={`/community/user/${comment.author?._id || comment.author?.id || 'unknown'}`}
                                    sx={{
                                      textDecoration: 'none',
                                      color: 'text.primary',
                                      '&:hover': { color: theme.palette.primary.main },
                                    }}
                                  >
                                    {comment.author?.name || 'Anonymous User'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    {formatTimestamp(comment.timestamp)}
                                  </Typography>
                                </Box>
                                <IconButton size="small">
                                  <MoreVert fontSize="small" />
                                </IconButton>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                  sx={{ mt: 1, mb: 1 }}
                                >
                                  {comment.content}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleLikeComment(comment._id || comment.id)}
                                      color={likedComments.includes(comment._id || comment.id) ? 'primary' : 'default'}
                                    >
                                      {likedComments.includes(comment._id || comment.id) ? (
                                        <Favorite fontSize="small" />
                                      ) : (
                                        <FavoriteBorder fontSize="small" />
                                      )}
                                    </IconButton>
                                    <Typography variant="body2" color="text.secondary">
                                      {(comment.likes?.length || 0) + (likedComments.includes(comment._id || comment.id) ? 1 : 0)}
                                    </Typography>
                                  </Box>
                                  <Button size="small">Reply</Button>
                                  <Button size="small" startIcon={<Report fontSize="small" />}>
                                    Report
                                  </Button>
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Author Info */}
            <Card
              component={motion.div}
              variants={itemVariants}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                mb: 4,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  About the Author
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={post.author.avatar}
                    alt={post.author.name}
                    sx={{ width: 64, height: 64, mr: 2 }}
                  >
                    {post.author.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      component={RouterLink}
                      to={`/community/user/${post.author.id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'text.primary',
                        '&:hover': { color: theme.palette.primary.main },
                        fontWeight: 600,
                      }}
                    >
                      {post.author.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.author.role}
                    </Typography>
                  </Box>
                </Box>
                <List dense disablePadding>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Member since"
                      secondary={formatJoinDate(post.author?.joinDate)}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Posts"
                      secondary={post.author?.posts || 0}
                    />
                  </ListItem>
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  component={RouterLink}
                  to={`/community/user/${post.author.id}`}
                  sx={{ mt: 2 }}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Related Posts */}
            <Card
              component={motion.div}
              variants={itemVariants}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                mb: 4,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Related Posts
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  {relatedPosts.map((relatedPost) => (
                    <ListItem
                      key={relatedPost.id}
                      component={RouterLink}
                      to={`/community/post/${relatedPost.id}`}
                      sx={{
                        px: 0,
                        py: 1.5,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: 'text.primary',
                              '&:hover': { color: theme.palette.primary.main },
                              fontWeight: 500,
                            }}
                          >
                            {relatedPost.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              By {relatedPost.author.name}
                            </Typography>
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                bgcolor: 'text.disabled',
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatTimestamp(relatedPost.timestamp)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  component={RouterLink}
                  to="/community"
                  sx={{ mt: 2 }}
                >
                  View More
                </Button>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card
              component={motion.div}
              variants={itemVariants}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CommunityPost;



