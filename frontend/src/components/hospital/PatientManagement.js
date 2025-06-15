import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  CalendarMonth as CalendarMonthIcon,
  LocalHospital as LocalHospitalIcon,
  Medication as MedicationIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PatientManagement = ({ patientData = [], onViewMore }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // If no patient data is provided, use mock data
  const patients = patientData.length > 0 ? patientData : [
    {
      id: 1,
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      condition: 'Hypertension',
      status: 'stable',
      avatar: null,
      doctor: 'Dr. Smith',
      nextAppointment: '2023-07-15',
      treatments: 2,
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 32,
      gender: 'Female',
      condition: 'Diabetes',
      status: 'improving',
      avatar: null,
      doctor: 'Dr. Johnson',
      nextAppointment: '2023-07-18',
      treatments: 1,
    },
    {
      id: 3,
      name: 'Robert Brown',
      age: 58,
      gender: 'Male',
      condition: 'Arthritis',
      status: 'stable',
      avatar: null,
      doctor: 'Dr. Williams',
      nextAppointment: '2023-07-20',
      treatments: 3,
    },
    {
      id: 4,
      name: 'Emily Davis',
      age: 27,
      gender: 'Female',
      condition: 'Asthma',
      status: 'critical',
      avatar: null,
      doctor: 'Dr. Brown',
      nextAppointment: '2023-07-12',
      treatments: 2,
    },
    {
      id: 5,
      name: 'Michael Wilson',
      age: 41,
      gender: 'Male',
      condition: 'Migraine',
      status: 'improving',
      avatar: null,
      doctor: 'Dr. Davis',
      nextAppointment: '2023-07-25',
      treatments: 1,
    },
  ];

  // Get status color and label
  const getStatusInfo = (status) => {
    switch (status) {
      case 'stable':
        return {
          color: theme.palette.info.main,
          label: 'Stable',
        };
      case 'improving':
        return {
          color: theme.palette.success.main,
          label: 'Improving',
        };
      case 'critical':
        return {
          color: theme.palette.error.main,
          label: 'Critical',
        };
      case 'worsening':
        return {
          color: theme.palette.warning.main,
          label: 'Worsening',
        };
      default:
        return {
          color: theme.palette.info.main,
          label: 'Unknown',
        };
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Patient Management
          </Typography>
          <Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SearchIcon />}
              onClick={() => navigate('/hospital/patients')}
              sx={{ mr: 1, borderRadius: 2, textTransform: 'none' }}
            >
              Search
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('/hospital/patients/add')}
              sx={{ mr: 1, borderRadius: 2, textTransform: 'none' }}
            >
              Add Patient
            </Button>
            <Button
              endIcon={<KeyboardArrowRightIcon />}
              onClick={onViewMore || (() => navigate('/hospital/patients'))}
              sx={{ textTransform: 'none' }}
            >
              View All
            </Button>
          </Box>
        </Box>

        {error && (
          <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}
        
        <List sx={{ width: '100%', position: 'relative' }}>
          {loading && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.7)',
                zIndex: 1
              }}
            >
              <CircularProgress size={40} />
            </Box>
          )}
          
          {patients.map((patient, index) => {
            const statusInfo = getStatusInfo(patient.status);
            return (
              <React.Fragment key={patient.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/hospital/patients/${patient.id}`)}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Tooltip title={statusInfo.label}>
                          <Avatar
                            sx={{
                              width: 16,
                              height: 16,
                              bgcolor: statusInfo.color,
                              border: `2px solid ${theme.palette.background.paper}`,
                            }}
                          />
                        </Tooltip>
                      }
                    >
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                        src={patient.avatar}
                      >
                        {getInitials(patient.name)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={500}>
                        {patient.name}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {patient.age} years, {patient.gender}
                        </Typography>
                        {" — "}
                        <Typography component="span" variant="body2" color="text.secondary">
                          {patient.condition}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Chip
                            icon={<LocalHospitalIcon fontSize="small" />}
                            label={patient.doctor}
                            size="small"
                            sx={{
                              mr: 1,
                              height: 24,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              '& .MuiChip-icon': {
                                fontSize: '1rem',
                              },
                            }}
                          />
                          <Chip
                            icon={<MedicationIcon fontSize="small" />}
                            label={`${patient.treatments} treatments`}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                              '& .MuiChip-icon': {
                                fontSize: '1rem',
                              },
                            }}
                          />
                        </Box>
                      </React.Fragment>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 2, textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <CalendarMonthIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {formatDate(patient.nextAppointment)}
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<AssignmentIcon fontSize="small" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/hospital/patients/${patient.id}/records`);
                          }}
                          sx={{ mt: 0.5, textTransform: 'none', fontSize: '0.75rem' }}
                        >
                          View Records
                        </Button>
                      </Box>
                      <IconButton 
                        edge="end" 
                        aria-label="more options"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle more options click
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < patients.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default PatientManagement;
