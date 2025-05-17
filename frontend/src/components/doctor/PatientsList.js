import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  IconButton,
  Divider,
  Tooltip,
  Skeleton,
  useTheme,
  alpha,
  TextField,
  InputAdornment,
  Chip,
  Pagination
} from '@mui/material';
import {
  Chat as ChatIcon,
  Visibility as VisibilityIcon,
  PersonSearch as PersonSearchIcon,
  Search as SearchIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const PatientsList = ({
  patients,
  loading,
  onChatWithPatient,
  onViewPatient,
  onViewAll,
  showAll = false,
  title = "My Patients"
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const patientsPerPage = showAll ? 10 : 5;

  // Animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Helper function to get patient avatar
  const getPatientAvatar = (patient) => {
    if (patient.avatar || patient.profileImage) {
      return patient.avatar || patient.profileImage;
    }

    // If no avatar, use first letter of name
    return patient.name ? patient.name.charAt(0).toUpperCase() : 'P';
  };

  // Filter patients based on search term
  const filteredPatients = patients?.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.gender?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Paginate patients
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const displayedPatients = filteredPatients.slice(
    (page - 1) * patientsPerPage,
    page * patientsPerPage
  );

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card
        component={motion.div}
        variants={itemVariants}
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            <Skeleton width={80} height={36} />
          </Box>

          {showAll && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={56}
              sx={{ borderRadius: 2, mb: 2 }}
            />
          )}

          <List>
            {[1, 2, 3].map((_, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Skeleton variant="circular" width={40} height={40} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Skeleton width="60%" />}
                    secondary={
                      <>
                        <Skeleton width="40%" />
                        <Skeleton width="30%" />
                      </>
                    }
                  />
                  <Skeleton width={80} height={36} />
                </ListItem>
                {index < 2 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>

          {showAll && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Skeleton width={200} height={36} />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      component={motion.div}
      variants={itemVariants}
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          {!showAll && (
            <Button
              variant="text"
              color="primary"
              onClick={onViewAll}
            >
              View All
            </Button>
          )}
        </Box>

        {showAll && (
          <TextField
            fullWidth
            placeholder="Search patients by name, email, or phone..."
            variant="outlined"
            size="medium"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        )}

        {patients && patients.length > 0 ? (
          <>
            <List>
              {displayedPatients.map((patient, index) => (
                <React.Fragment key={patient._id || patient.id || index}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                      borderRadius: 1,
                      py: 1.5
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={patient.avatar || patient.profileImage}
                        alt={patient.name}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {getPatientAvatar(patient)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {patient.name}
                          </Typography>
                          {patient.gender && (
                            <Chip
                              icon={patient.gender.toLowerCase() === 'male' ? <MaleIcon /> : <FemaleIcon />}
                              label={patient.gender}
                              size="small"
                              sx={{
                                height: 24,
                                bgcolor: patient.gender.toLowerCase() === 'male' ?
                                  alpha(theme.palette.info.main, 0.1) :
                                  alpha(theme.palette.secondary.main, 0.1),
                                color: patient.gender.toLowerCase() === 'male' ?
                                  theme.palette.info.main :
                                  theme.palette.secondary.main
                              }}
                            />
                          )}
                          {patient.age && (
                            <Typography variant="body2" color="text.secondary">
                              {patient.age} years
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          {patient.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <EmailIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem', color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" component="span">
                                {patient.email}
                              </Typography>
                            </Box>
                          )}
                          {patient.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <PhoneIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem', color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" component="span">
                                {patient.phone}
                              </Typography>
                            </Box>
                          )}
                          {patient.lastVisit && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              Last visit: {typeof patient.lastVisit === 'string' ? patient.lastVisit : new Date(patient.lastVisit).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Patient Details">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => onViewPatient(patient._id || patient.id)}
                          sx={{
                            minWidth: 0,
                            p: 1,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.2)
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chat with Patient">
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => onChatWithPatient(patient._id || patient.id)}
                          sx={{
                            minWidth: 0,
                            p: 1,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.success.main, 0.2)
                            }
                          }}
                        >
                          <ChatIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                  {index < displayedPatients.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>

            {showAll && totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {searchTerm ? 'No patients match your search' : 'No patients assigned yet'}
            </Typography>
          </Box>
        )}

        {!showAll && (
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<PersonSearchIcon />}
            onClick={onViewAll}
            sx={{
              mt: 2,
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            Find Patient
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientsList;
