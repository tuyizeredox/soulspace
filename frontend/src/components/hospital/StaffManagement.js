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
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Psychology as PsychologyIcon,
  Healing as HealingIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const StaffManagement = ({ staffData = [], onViewMore }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // If no staff data is provided, use mock data
  const staff = staffData.length > 0 ? staffData : [
    {
      id: 1,
      name: 'Dr. John Smith',
      role: 'doctor',
      department: 'Cardiology',
      status: 'available',
      avatar: null,
      patients: 12,
      appointments: 5,
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      role: 'doctor',
      department: 'Neurology',
      status: 'busy',
      avatar: null,
      patients: 8,
      appointments: 3,
    },
    {
      id: 3,
      name: 'Dr. Michael Brown',
      role: 'doctor',
      department: 'Orthopedics',
      status: 'away',
      avatar: null,
      patients: 10,
      appointments: 0,
    },
    {
      id: 4,
      name: 'Jane Wilson',
      role: 'nurse',
      department: 'General',
      status: 'available',
      avatar: null,
      patients: 15,
      appointments: 0,
    },
    {
      id: 5,
      name: 'Robert Davis',
      role: 'pharmacist',
      department: 'Pharmacy',
      status: 'available',
      avatar: null,
      patients: 0,
      appointments: 0,
    },
  ];

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor':
        return <LocalHospitalIcon />;
      case 'nurse':
        return <MedicalServicesIcon />;
      case 'pharmacist':
        return <LocalPharmacyIcon />;
      case 'therapist':
        return <PsychologyIcon />;
      default:
        return <HealingIcon />;
    }
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'available':
        return {
          icon: <CheckCircleIcon fontSize="small" />,
          color: theme.palette.success.main,
          label: 'Available',
        };
      case 'busy':
        return {
          icon: <AccessTimeIcon fontSize="small" />,
          color: theme.palette.warning.main,
          label: 'Busy',
        };
      case 'away':
        return {
          icon: <CancelIcon fontSize="small" />,
          color: theme.palette.error.main,
          label: 'Away',
        };
      default:
        return {
          icon: <AccessTimeIcon fontSize="small" />,
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
            Staff Management
          </Typography>
          <Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => navigate('/hospital/staff/add')}
              sx={{ mr: 1, borderRadius: 2, textTransform: 'none' }}
            >
              Add Staff
            </Button>
            <Button
              endIcon={<KeyboardArrowRightIcon />}
              onClick={onViewMore || (() => navigate('/hospital/staff'))}
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
          
          {staff.map((member, index) => {
            const statusInfo = getStatusInfo(member.status);
            return (
              <React.Fragment key={member.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/hospital/staff/${member.id}`)}
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
                          >
                            {statusInfo.icon}
                          </Avatar>
                        </Tooltip>
                      }
                    >
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                        src={member.avatar}
                      >
                        {getInitials(member.name)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={500}>
                        {member.name}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Chip
                            icon={getRoleIcon(member.role)}
                            label={member.role.charAt(0).toUpperCase() + member.role.slice(1)}
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
                            label={member.department}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                            }}
                          />
                        </Box>
                      </React.Fragment>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {member.role === 'doctor' && (
                        <Box sx={{ mr: 2, textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            Patients: {member.patients}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Appointments: {member.appointments}
                          </Typography>
                        </Box>
                      )}
                      <IconButton edge="end" aria-label="more options">
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < staff.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default StaffManagement;
