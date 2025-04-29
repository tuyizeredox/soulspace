import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarMonth as CalendarIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  VerifiedUser as VerifiedUserIcon,
  LocalHospital as LocalHospitalIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const DoctorProfileCard = ({ doctor, onEdit, onDelete, onClose }) => {
  const theme = useTheme();

  // Generate random rating for demo purposes
  const rating = doctor.rating || Math.floor(Math.random() * 5) + 1;

  // Status color mapping
  const statusColors = {
    active: 'success',
    inactive: 'error',
    onLeave: 'warning',
    pending: 'info',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
          position: 'relative',
          overflow: 'visible',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 100,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          },
        }}
      >
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'background.paper',
            zIndex: 1,
            boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.1)}`,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.light, 0.1),
            },
          }}
          size="small"
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <CardContent sx={{ pt: 7, pb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Avatar
              src={doctor.avatar}
              alt={doctor.name}
              sx={{
                width: 120,
                height: 120,
                border: `4px solid ${theme.palette.background.paper}`,
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                mb: 2,
              }}
            >
              {doctor.name.charAt(0)}
            </Avatar>

            <Typography variant="h5" fontWeight={700} align="center">
              {doctor.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, mb: 1 }}>
              <LocalHospitalIcon
                fontSize="small"
                color="primary"
                sx={{ mr: 0.5 }}
              />
              <Typography variant="subtitle1" color="text.secondary">
                {doctor.specialization}
              </Typography>
            </Box>

            <Chip
              label={doctor.status || 'Active'}
              color={statusColors[doctor.status] || 'success'}
              size="small"
              icon={
                doctor.status === 'active' ? (
                  <VerifiedUserIcon fontSize="small" />
                ) : doctor.status === 'onLeave' ? (
                  <AccessTimeIcon fontSize="small" />
                ) : (
                  <VerifiedUserIcon fontSize="small" />
                )
              }
              sx={{ fontWeight: 500 }}
            />

            <Box sx={{ display: 'flex', mt: 2 }}>
              {[...Array(5)].map((_, index) => (
                index < rating ? (
                  <StarIcon key={index} color="warning" />
                ) : (
                  <StarBorderIcon key={index} color="warning" />
                )
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <EmailIcon color="action" sx={{ mr: 1.5 }} />
                <Typography variant="body1">{doctor.email}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <PhoneIcon color="action" sx={{ mr: 1.5 }} />
                <Typography variant="body1">{doctor.phone}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <CalendarIcon color="action" sx={{ mr: 1.5 }} />
                <Typography variant="body1">
                  Joined: {doctor.joinDate || 'Not available'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              mt: 2,
              mb: 3,
            }}
          >
            {doctor.expertise && doctor.expertise.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                }}
              />
            ))}
            {!doctor.expertise && (
              <>
                <Chip
                  label="General Medicine"
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                  }}
                />
                <Chip
                  label="Patient Care"
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                  }}
                />
              </>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 3,
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => onEdit(doctor)}
              sx={{ borderRadius: 2, flex: 1, mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(doctor.id)}
              sx={{ borderRadius: 2, flex: 1, ml: 1 }}
            >
              Delete
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DoctorProfileCard;
