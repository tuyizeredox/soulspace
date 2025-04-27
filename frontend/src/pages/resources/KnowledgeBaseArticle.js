import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import {
  School,
  Home,
  HelpCenter,
  ArrowBack,
  AccessTime,
  Visibility,
  ThumbUp,
  ThumbUpOutlined,
  Bookmark,
  BookmarkBorder,
  Share,
  Print,
  Download,
  ContentCopy,
  Check,
  Info,
  Warning,
  MonitorHeart,
  Healing,
  LocalHospital,
  MedicalServices,
  HealthAndSafety,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

// Sample article data (in a real app, this would come from an API)
const articleData = {
  id: 301,
  title: 'Complete Guide to Preventive Health Monitoring',
  category: 'Health Monitoring',
  summary: 'Learn how to use SoulSpace to monitor your health proactively and prevent potential health issues before they become serious.',
  content: [
    {
      type: 'paragraph',
      content: 'Preventive health monitoring is one of the most powerful tools for maintaining long-term wellness. By tracking key health metrics regularly, you can identify potential issues before they become serious problems, make informed lifestyle adjustments, and work more effectively with your healthcare providers.'
    },
    {
      type: 'heading',
      content: 'Why Preventive Health Monitoring Matters'
    },
    {
      type: 'paragraph',
      content: 'Preventive health monitoring allows you to track key health metrics over time, identify trends, and take action before small issues become serious problems. Regular monitoring can help you maintain optimal health and potentially avoid costly medical interventions down the road.'
    },
    {
      type: 'paragraph',
      content: 'Studies have shown that people who actively monitor their health tend to have better outcomes across a range of conditions. For example, regular blood pressure monitoring can reduce the risk of heart disease and stroke, while tracking blood glucose can help prevent or manage diabetes.'
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'Did You Know?',
      content: 'According to the CDC, 7 out of 10 deaths in the United States are caused by chronic diseases, many of which can be prevented or managed through early detection and lifestyle modifications.'
    },
    {
      type: 'heading',
      content: 'Key Health Metrics to Track'
    },
    {
      type: 'paragraph',
      content: 'SoulSpace makes it easy to monitor these essential health metrics through connected wearable devices or manual entry. Here are the most important metrics to track regularly:'
    },
    {
      type: 'table',
      headers: ['Metric', 'Recommended Frequency', 'Normal Range', 'Why It Matters'],
      rows: [
        ['Blood Pressure', 'Weekly', '120/80 mmHg or lower', 'High blood pressure is a major risk factor for heart disease and stroke'],
        ['Heart Rate', 'Daily', '60-100 bpm at rest', 'Abnormal heart rates can indicate cardiovascular issues or stress'],
        ['Sleep Quality', 'Daily', '7-9 hours per night', 'Poor sleep is linked to numerous health problems including obesity and depression'],
        ['Activity Level', 'Daily', '150+ min/week moderate activity', 'Regular physical activity reduces risk of chronic disease'],
        ['Weight', 'Weekly', 'BMI 18.5-24.9', 'Maintaining healthy weight reduces risk of many conditions'],
        ['Stress Levels', 'Daily', 'Subjective measurement', 'Chronic stress contributes to numerous health problems']
      ]
    },
    {
      type: 'paragraph',
      content: 'For those with specific health concerns, additional metrics might include blood glucose, oxygen saturation, cholesterol levels, or specialized measurements related to existing conditions.'
    },
    {
      type: 'heading',
      content: 'Setting Up Health Goals'
    },
    {
      type: 'paragraph',
      content: 'Establish personalized health goals based on your current metrics and recommendations from healthcare providers. SoulSpace allows you to set targets for each metric and tracks your progress over time.'
    },
    {
      type: 'paragraph',
      content: 'When setting goals, follow these principles:'
    },
    {
      type: 'list',
      items: [
        'Make goals specific and measurable (e.g., "Walk 8,000 steps daily" rather than "Be more active")',
        'Set realistic targets based on your current health status',
        'Create both short-term and long-term goals',
        'Adjust goals as needed based on progress and feedback from healthcare providers',
        'Celebrate achievements to maintain motivation'
      ]
    },
    {
      type: 'callout',
      variant: 'warning',
      title: 'Important Note',
      content: 'Always consult with your healthcare provider before making significant changes to your health goals, especially if you have existing medical conditions.'
    },
    {
      type: 'heading',
      content: 'Understanding Your Health Trends'
    },
    {
      type: 'paragraph',
      content: 'The SoulSpace dashboard provides visual representations of your health data, making it easy to spot trends and patterns. Learn how to interpret these trends and when to share concerning changes with your healthcare provider.'
    },
    {
      type: 'paragraph',
      content: 'When reviewing your health data, look for:'
    },
    {
      type: 'list',
      items: [
        'Consistent changes in any metric over time',
        'Correlations between different metrics (e.g., stress levels and sleep quality)',
        'Patterns related to specific activities, foods, or medications',
        'Values that fall outside recommended ranges',
        'Sudden or dramatic changes in any metric'
      ]
    },
    {
      type: 'paragraph',
      content: "The SoulSpace AI assistant can help identify these patterns and provide personalized insights based on your data. However, it's important to discuss significant findings with your healthcare provider."
    },
    {
      type: 'heading',
      content: 'Sharing Data with Healthcare Providers'
    },
    {
      type: 'paragraph',
      content: 'SoulSpace makes it easy to share your health data with healthcare providers, ensuring they have a comprehensive view of your health between appointments.'
    },
    {
      type: 'paragraph',
      content: 'To share your data:'
    },
    {
      type: 'list',
      items: [
        'Go to the "Health Data" section of your profile',
        'Select "Share Data" and choose which metrics to include',
        'Choose your healthcare provider from your contacts or enter their email',
        'Set an expiration date for access (optional)',
        'Add any notes or questions for your provider'
      ]
    },
    {
      type: 'paragraph',
      content: 'Regular sharing of health data can lead to more productive appointments and better-informed treatment decisions.'
    },
    {
      type: 'heading',
      content: 'Conclusion'
    },
    {
      type: 'paragraph',
      content: 'Preventive health monitoring is a powerful tool for maintaining and improving your health. By consistently tracking key metrics, setting appropriate goals, and sharing data with healthcare providers, you can take a proactive approach to your wellness journey.'
    },
    {
      type: 'paragraph',
      content: "Remember that the goal of health monitoring isn't perfection, but awareness and gradual improvement. Small, consistent changes based on your health data can lead to significant long-term benefits."
    }
  ],
  author: {
    name: 'Dr. Jennifer Martinez',
    title: 'Chief Medical Officer',
    avatar: '/images/avatars/doctor1.jpg'
  },
  publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 days ago
  lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  readTime: '12 min',
  views: 15600,
  likes: 943,
  tags: ['preventive health', 'health monitoring', 'wearable devices', 'health metrics', 'wellness'],
  relatedArticles: [
    {
      id: 302,
      title: 'Understanding Your Blood Pressure Readings',
      category: 'Health Monitoring',
      views: 12400,
      path: '/resources/knowledge-base/blood-pressure-readings',
    },
    {
      id: 303,
      title: 'How to Improve Sleep Quality with SoulSpace',
      category: 'Health Monitoring',
      views: 10800,
      path: '/resources/knowledge-base/improve-sleep-quality',
    },
    {
      id: 304,
      title: 'Setting Realistic Health Goals',
      category: 'Wellness',
      views: 9500,
      path: '/resources/knowledge-base/realistic-health-goals',
    }
  ]
};

const KnowledgeBaseArticle = () => {
  const theme = useTheme();
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Fetch article data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchArticle = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setArticle(articleData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching article:', error);
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const handleLikeArticle = () => {
    setLiked(!liked);
    // In a real app, this would be an API call to like/unlike the article
  };

  const handleBookmarkArticle = () => {
    setBookmarked(!bookmarked);
    // In a real app, this would be an API call to bookmark/unbookmark the article
  };

  const handleShareArticle = () => {
    // In a real app, this would open a share dialog
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintArticle = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    alert('PDF download functionality would be implemented here.');
  };

  // Render content based on type
  const renderContent = (item, index) => {
    switch (item.type) {
      case 'paragraph':
        return (
          <Typography key={index} variant="body1" paragraph>
            {item.content}
          </Typography>
        );
      case 'heading':
        return (
          <Typography key={index} variant="h5" component="h2" fontWeight={600} gutterBottom sx={{ mt: 4, mb: 2 }}>
            {item.content}
          </Typography>
        );
      case 'list':
        return (
          <List key={index} sx={{ pl: 2, mb: 2 }}>
            {item.items.map((listItem, listIndex) => (
              <ListItem key={listIndex} sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Check color="primary" />
                </ListItemIcon>
                <ListItemText primary={listItem} />
              </ListItem>
            ))}
          </List>
        );
      case 'callout':
        return (
          <Paper
            key={index}
            sx={{
              p: 2,
              my: 3,
              borderRadius: '8px',
              bgcolor: item.variant === 'warning'
                ? alpha(theme.palette.warning.main, 0.1)
                : alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${item.variant === 'warning'
                ? alpha(theme.palette.warning.main, 0.3)
                : alpha(theme.palette.info.main, 0.3)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {item.variant === 'warning'
                ? <Warning sx={{ color: theme.palette.warning.main, mr: 1 }} />
                : <Info sx={{ color: theme.palette.info.main, mr: 1 }} />
              }
              <Typography variant="subtitle1" fontWeight={600} color={item.variant === 'warning' ? 'warning.main' : 'info.main'}>
                {item.title}
              </Typography>
            </Box>
            <Typography variant="body2">
              {item.content}
            </Typography>
          </Paper>
        );
      case 'table':
        return (
          <TableContainer key={index} component={Paper} sx={{ my: 3, borderRadius: '8px', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableRow>
                  {item.headers.map((header, headerIndex) => (
                    <TableCell key={headerIndex} sx={{ fontWeight: 600 }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {item.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} sx={{ '&:nth-of-type(even)': { bgcolor: alpha(theme.palette.primary.main, 0.03) } }}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      default:
        return null;
    }
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

  if (!article) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            Article not found
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/resources/knowledge-base')}
            sx={{ mt: 2 }}
          >
            Back to Knowledge Base
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
          <Link component={RouterLink} to="/resources/knowledge-base" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <School fontSize="small" sx={{ mr: 0.5 }} />
            Knowledge Base
          </Link>
          <Typography color="text.primary" noWrap sx={{ maxWidth: 200 }}>
            {article.title}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Article */}
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
                {/* Article Header */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Button
                      startIcon={<ArrowBack />}
                      component={RouterLink}
                      to="/resources/knowledge-base"
                      sx={{ mb: 2 }}
                    >
                      Back to Knowledge Base
                    </Button>

                    <Chip
                      label={article.category}
                      size="small"
                      icon={<MonitorHeart fontSize="small" />}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    />
                  </Box>

                  <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                    {article.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {article.readTime} read
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Visibility fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {article.views.toLocaleString()} views
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Published {formatDistanceToNow(article.publishedDate, { addSuffix: true })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updated {formatDistanceToNow(article.lastUpdated, { addSuffix: true })}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" color="text.secondary" paragraph>
                    {article.summary}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {article.tags.map((tag, index) => (
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
                        to={`/resources/knowledge-base/tag/${tag}`}
                        clickable
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Article Content */}
                <Box sx={{ mb: 3 }}>
                  {article.content.map((item, index) => renderContent(item, index))}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Article Footer */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant={liked ? 'contained' : 'outlined'}
                      startIcon={liked ? <ThumbUp /> : <ThumbUpOutlined />}
                      onClick={handleLikeArticle}
                    >
                      {liked ? 'Liked' : 'Like'} ({article.likes + (liked ? 1 : 0)})
                    </Button>
                    <Button
                      variant={bookmarked ? 'contained' : 'outlined'}
                      startIcon={bookmarked ? <Bookmark /> : <BookmarkBorder />}
                      onClick={handleBookmarkArticle}
                      color={bookmarked ? 'primary' : 'inherit'}
                    >
                      {bookmarked ? 'Saved' : 'Save'}
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={handleShareArticle}
                    >
                      Share
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Print />}
                      onClick={handlePrintArticle}
                    >
                      Print
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={handleDownloadPDF}
                    >
                      PDF
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
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
                  <Box
                    component="img"
                    src={article.author.avatar}
                    alt={article.author.name}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      mr: 2,
                      objectFit: 'cover',
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {article.author.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {article.author.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Table of Contents */}
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
                  Table of Contents
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  {article.content
                    .filter(item => item.type === 'heading')
                    .map((heading, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          px: 0,
                          py: 1,
                          borderBottom: index < article.content.filter(item => item.type === 'heading').length - 1
                            ? `1px solid ${theme.palette.divider}`
                            : 'none',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.primary.main,
                                fontWeight: 500,
                              }}
                            >
                              {heading.content}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>

            {/* Related Articles */}
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
                  Related Articles
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  {article.relatedArticles.map((relatedArticle, index) => (
                    <ListItem
                      key={index}
                      component={RouterLink}
                      to={relatedArticle.path}
                      sx={{
                        px: 0,
                        py: 1.5,
                        borderBottom: index < article.relatedArticles.length - 1
                          ? `1px solid ${theme.palette.divider}`
                          : 'none',
                        textDecoration: 'none',
                        color: 'inherit',
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
                            {relatedArticle.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {relatedArticle.category}
                            </Typography>
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                bgcolor: 'text.disabled',
                                mx: 1,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {relatedArticle.views.toLocaleString()} views
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
                  to="/resources/knowledge-base"
                  sx={{ mt: 2 }}
                >
                  View More Articles
                </Button>
              </CardContent>
            </Card>

            {/* Article Link */}
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
                  Share This Article
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={window.location.href}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton onClick={handleCopyLink} size="small">
                          {copied ? <Check color="success" /> : <ContentCopy />}
                        </IconButton>
                      ),
                    }}
                    sx={{ mr: 1 }}
                  />
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Share />}
                  onClick={handleShareArticle}
                >
                  Share Article
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default KnowledgeBaseArticle;
