import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Forum,
  Home,
  HelpCenter,
  ArrowBack,
  Check,
  Close,
  Warning,
  Info,
  Gavel,
  Security,
  VerifiedUser,
  Report,
  Block,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

const CommunityGuidelines = () => {
  const theme = useTheme();

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
          <Typography color="text.primary">
            Community Guidelines
          </Typography>
        </Breadcrumbs>

        <Button
          component={RouterLink}
          to="/community"
          startIcon={<ArrowBack />}
          sx={{ mb: 3 }}
        >
          Back to Community
        </Button>

        {/* Header */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
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
            <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
              Community Guidelines
            </Typography>
            <Typography variant="h6">
              Our community is a place for respectful discussion, support, and sharing of experiences.
              These guidelines help ensure a positive environment for all members.
            </Typography>
          </Box>
        </Paper>

        {/* Introduction */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: '16px',
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Introduction
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" paragraph>
            The SoulSpace Community Forum is designed to be a safe, supportive space where users can connect,
            share experiences, and learn from each other. Our goal is to foster meaningful discussions about
            health and wellness while respecting everyone's privacy and dignity.
          </Typography>
          <Typography variant="body1" paragraph>
            By participating in our community, you agree to follow these guidelines. Failure to comply may
            result in content removal, temporary restrictions, or in severe cases, permanent account suspension.
          </Typography>
          <Typography variant="body1">
            Remember that while our community offers valuable peer support and information sharing, it is not
            a substitute for professional medical advice, diagnosis, or treatment.
          </Typography>
        </Paper>

        {/* Do's and Don'ts */}
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{ mb: 4 }}
        >
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Community Do's and Don'ts
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Do's */}
            <Paper
              sx={{
                p: 3,
                borderRadius: '16px',
                flex: 1,
                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                bgcolor: alpha(theme.palette.success.main, 0.05),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Check sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="h6" fontWeight={600} color="success.main">
                  Do's
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {[
                  'Be respectful and supportive of other community members',
                  'Share general experiences that might help others',
                  'Provide factual information with credible sources when possible',
                  'Respect diverse perspectives and experiences',
                  'Use appropriate and inclusive language',
                  'Report content that violates these guidelines',
                  'Protect your privacy and personal information',
                  'Stay on topic in discussions and threads',
                ].map((item, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36, color: theme.palette.success.main }}>
                      <Check fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Don'ts */}
            <Paper
              sx={{
                p: 3,
                borderRadius: '16px',
                flex: 1,
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                bgcolor: alpha(theme.palette.error.main, 0.05),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Close sx={{ color: theme.palette.error.main, mr: 1 }} />
                <Typography variant="h6" fontWeight={600} color="error.main">
                  Don'ts
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {[
                  'Share specific personal medical information or details',
                  'Provide medical advice or diagnoses to other users',
                  'Engage in harassment, bullying, or discriminatory behavior',
                  'Post promotional content, advertisements, or spam',
                  'Share misinformation or unverified medical claims',
                  'Use offensive, vulgar, or inflammatory language',
                  "Share content that violates others' privacy",
                  'Create multiple accounts or impersonate others',
                ].map((item, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36, color: theme.palette.error.main }}>
                      <Close fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>

        {/* Medical Information Disclaimer */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: '16px',
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Warning sx={{ color: theme.palette.warning.main, mr: 1 }} />
            <Typography variant="h5" gutterBottom fontWeight={600} color="warning.dark">
              Medical Information Disclaimer
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" paragraph>
            The SoulSpace Community Forum is not a substitute for professional medical advice, diagnosis, or treatment.
            Always seek the advice of your physician or other qualified health provider with any questions you may have
            regarding a medical condition.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Never disregard professional medical advice</strong> or delay in seeking it because of something
            you have read on this community forum. If you think you may have a medical emergency, call your doctor
            or emergency services immediately.
          </Typography>
          <Typography variant="body1">
            SoulSpace does not recommend or endorse any specific tests, physicians, products, procedures, opinions,
            or other information that may be mentioned on the community forum. Reliance on any information provided
            by community members is solely at your own risk.
          </Typography>
        </Paper>

        {/* Privacy Guidelines */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: '16px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Security sx={{ color: theme.palette.primary.main, mr: 1 }} />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Privacy Guidelines
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" paragraph>
            Protecting your privacy and the privacy of others is essential in our community. Please follow these
            privacy guidelines:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <VerifiedUser sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary="Protect Your Personal Information"
                secondary="Avoid sharing personally identifiable information such as full name, address, phone number, email, or any other information that could identify you personally."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Security sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary="Respect Others' Privacy"
                secondary="Do not share information about others without their explicit consent, including photos, personal stories, or medical information."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Info sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary="Be Mindful of Shared Information"
                secondary="When sharing experiences, focus on general information rather than specific details that might compromise your privacy or others."
              />
            </ListItem>
          </List>
        </Paper>

        {/* Moderation and Enforcement */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: '16px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Gavel sx={{ color: theme.palette.primary.main, mr: 1 }} />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Moderation and Enforcement
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" paragraph>
            Our community is actively moderated to ensure these guidelines are followed. Moderators may take the
            following actions to maintain a positive environment:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Report sx={{ color: theme.palette.warning.main }} />
              </ListItemIcon>
              <ListItemText
                primary="Content Removal"
                secondary="Posts or comments that violate our guidelines will be removed without notice."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning sx={{ color: theme.palette.warning.main }} />
              </ListItemIcon>
              <ListItemText
                primary="Warnings"
                secondary="Users who violate guidelines may receive warnings explaining the violation and requesting compliance."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Block sx={{ color: theme.palette.error.main }} />
              </ListItemIcon>
              <ListItemText
                primary="Account Restrictions"
                secondary="Repeated or severe violations may result in temporary or permanent restrictions on posting or accessing the community."
              />
            </ListItem>
          </List>
          <Typography variant="body1" paragraph>
            Decisions made by moderators are final, but if you believe there has been an error, you can contact
            our support team for review.
          </Typography>
        </Paper>

        {/* Reporting Violations */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: '16px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Report sx={{ color: theme.palette.primary.main, mr: 1 }} />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Reporting Violations
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" paragraph>
            If you see content that violates these guidelines, please report it immediately. Your reports help us
            maintain a safe and supportive community.
          </Typography>
          <Typography variant="body1" paragraph>
            To report a violation:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Check sx={{ color: theme.palette.success.main }} />
              </ListItemIcon>
              <ListItemText primary="Click the 'Report' button on the post or comment" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Check sx={{ color: theme.palette.success.main }} />
              </ListItemIcon>
              <ListItemText primary="Select the reason for reporting" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Check sx={{ color: theme.palette.success.main }} />
              </ListItemIcon>
              <ListItemText primary="Provide any additional information that might help our moderators" />
            </ListItem>
          </List>
          <Typography variant="body1">
            All reports are confidential and will be reviewed by our moderation team as soon as possible.
          </Typography>
        </Paper>

        {/* Conclusion */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            p: 4,
            borderRadius: '16px',
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Thank You for Being Part of Our Community
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" paragraph>
            By following these guidelines, you help create a valuable resource for everyone. We appreciate your
            contributions and commitment to maintaining a respectful, supportive, and informative community.
          </Typography>
          <Typography variant="body1" paragraph>
            These guidelines may be updated periodically. We encourage you to review them regularly to stay informed
            about our community standards.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/community"
            >
              Return to Community Forum
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CommunityGuidelines;
