import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  VerifiedUser as VerifiedUserIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Psychology as PsychologyIcon,
  Healing as HealingIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  EventNote as EventNoteIcon,
  ContactPhone as ContactPhoneIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import StaffForm from '../../components/hospital/StaffForm';

const StaffDetail = () => {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.userAuth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [staff, setStaff] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Fetch staff data
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        setError('');

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get(`/api/staff/${id}`, config);
        setStaff(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching staff data:', error);
        setError('Failed to fetch staff data. Please try again.');
        setLoading(false);
      }
    };

    if (id) {
      fetchStaffData();
    }
  }, [id, token]);

  // Handle edit staff
  const handleEditStaff = async (staffData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.put(`/api/staff/${id}`, staffData, config);
      setStaff(response.data);
      setSuccess('Staff member updated successfully');
      setOpenEditDialog(false);
      setLoading(false);
    } catch (error) {
      console.error('Error updating staff:', error);
      setError(error.response?.data?.message || 'Failed to update staff member. Please try again.');
      setLoading(false);
    }
  };

  // Handle delete staff
  const handleDeleteStaff = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/staff/${id}`, config);
      setSuccess('Staff member deleted successfully');
      setOpenDeleteDialog(false);
      
      // Navigate back to staff list after a short delay
      setTimeout(() => {
        navigate('/hospital/staff');
      }, 1500);
    } catch (error) {
      console.error('Error deleting staff:', error);
      setError(error.response?.data?.message || 'Failed to delete staff member. Please try again.');
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor':
        return <LocalHospitalIcon />;
      case 'nurse':
        return <MedicalServicesIcon />;
      case 'pharmacist':
        return <LocalPharmacyIcon />;
      case 'receptionist':
        return <PersonIcon />;
      case 'lab_technician':
        return <HealingIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor':
        return theme.palette.primary.main;
      case 'nurse':
        return theme.palette.info.main;
      case 'pharmacist':
        return theme.palette.success.main;
      case 'receptionist':
        return theme.palette.warning.main;
      case 'lab_technician':
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[700];
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon />;
      case 'inactive':
        return <CancelIcon />;
      case 'on_leave':
        return <AccessTimeIcon />;
      case 'suspended':
        return <CancelIcon />;
      default:
        return <CheckCircleIcon />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'inactive':
        return theme.palette.error.main;
      case 'on_leave':
        return theme.palette.warning.main;
      case 'suspended':
        return theme.palette.error.main;
      default:
        return theme.palette.success.main;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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

  if (loading && !staff) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !staff) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/hospital/staff')}
        >
          Back to Staff List
        </Button>
      </Box>
    );
  }

  if (!staff) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Staff member not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/hospital/staff')}
        >
          Back to Staff List
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Page Header */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/hospital/staff')}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Back to Staff List
        </Button>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setOpenEditDialog(true)}
            sx={{ mr: 1, borderRadius: 2, textTransform: 'none' }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setOpenDeleteDialog(true)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Staff Profile */}
      <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        {/* Profile Header */}
        <Grid item xs={12}>
          <Card
            component={motion.div}
            variants={itemVariants}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: `0 4px 20px ${alpha(getRoleColor(staff.role), 0.15)}`,
            }}
          >
            <Box
              sx={{
                height: 120,
                background: `linear-gradient(45deg, ${alpha(getRoleColor(staff.role), 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
              }}
            />
            <CardContent sx={{ position: 'relative', pt: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'center', sm: 'flex-end' },
                  mt: { xs: -6, sm: -8 },
                }}
              >
                <Avatar
                  src={staff.avatar}
                  sx={{
                    width: { xs: 100, sm: 120 },
                    height: { xs: 100, sm: 120 },
                    border: '4px solid white',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    bgcolor: alpha(getRoleColor(staff.role), 0.1),
                    color: getRoleColor(staff.role),
                    fontSize: '2.5rem',
                  }}
                >
                  {getInitials(staff.name)}
                </Avatar>
                <Box
                  sx={{
                    ml: { xs: 0, sm: 3 },
                    mt: { xs: 2, sm: 0 },
                    mb: { xs: 2, sm: 1 },
                    textAlign: { xs: 'center', sm: 'left' },
                  }}
                >
                  <Typography variant="h4" fontWeight={700}>
                    {staff.name}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                    <Chip
                      icon={getRoleIcon(staff.role)}
                      label={staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                      sx={{
                        bgcolor: alpha(getRoleColor(staff.role), 0.1),
                        color: getRoleColor(staff.role),
                        fontWeight: 500,
                        '& .MuiChip-icon': {
                          color: getRoleColor(staff.role),
                        }
                      }}
                    />
                    {staff.department && (
                      <Chip
                        label={staff.department}
                        sx={{
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main,
                          fontWeight: 500,
                        }}
                      />
                    )}
                    <Chip
                      icon={getStatusIcon(staff.status)}
                      label={staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                      sx={{
                        bgcolor: alpha(getStatusColor(staff.status), 0.1),
                        color: getStatusColor(staff.status),
                        fontWeight: 500,
                        '& .MuiChip-icon': {
                          color: getStatusColor(staff.status),
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabs */}
        <Grid item xs={12}>
          <Paper
            component={motion.div}
            variants={itemVariants}
            sx={{ borderRadius: 3, overflow: 'hidden' }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 120
                }
              }}
            >
              <Tab label="Basic Information" />
              <Tab label="Professional Details" />
              <Tab label="Contact Information" />
            </Tabs>
          </Paper>
        </Grid>

        {/* Tab Content */}
        {tabValue === 0 && (
          <>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Card
                component={motion.div}
                variants={itemVariants}
                sx={{ borderRadius: 3, height: '100%' }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Basic Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={staff.email}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Phone"
                        secondary={staff.phone || 'Not provided'}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <EventNoteIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Join Date"
                        secondary={formatDate(staff.joinDate)}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <VerifiedUserIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Status"
                        secondary={
                          <Chip
                            size="small"
                            icon={getStatusIcon(staff.status)}
                            label={staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                            sx={{
                              bgcolor: alpha(getStatusColor(staff.status), 0.1),
                              color: getStatusColor(staff.status),
                              fontWeight: 500,
                              '& .MuiChip-icon': {
                                color: getStatusColor(staff.status),
                              }
                            }}
                          />
                        }
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Role Information */}
            <Grid item xs={12} md={6}>
              <Card
                component={motion.div}
                variants={itemVariants}
                sx={{ borderRadius: 3, height: '100%' }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Role Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        {getRoleIcon(staff.role)}
                      </ListItemIcon>
                      <ListItemText
                        primary="Role"
                        secondary={
                          <Chip
                            size="small"
                            icon={getRoleIcon(staff.role)}
                            label={staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                            sx={{
                              bgcolor: alpha(getRoleColor(staff.role), 0.1),
                              color: getRoleColor(staff.role),
                              fontWeight: 500,
                              '& .MuiChip-icon': {
                                color: getRoleColor(staff.role),
                              }
                            }}
                          />
                        }
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <LocalHospitalIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Department"
                        secondary={staff.department || 'Not assigned'}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                    {staff.role === 'doctor' && (
                      <>
                        <Divider component="li" />
                        <ListItem>
                          <ListItemIcon>
                            <MedicalServicesIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Specialization"
                            secondary={staff.specialization || 'Not specified'}
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                          />
                        </ListItem>
                      </>
                    )}
                    {['doctor', 'nurse', 'pharmacist'].includes(staff.role) && (
                      <>
                        <Divider component="li" />
                        <ListItem>
                          <ListItemIcon>
                            <VerifiedUserIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="License Number"
                            secondary={staff.licenseNumber || 'Not provided'}
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                          />
                        </ListItem>
                      </>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {tabValue === 1 && (
          <>
            {/* Professional Details */}
            <Grid item xs={12} md={6}>
              <Card
                component={motion.div}
                variants={itemVariants}
                sx={{ borderRadius: 3, height: '100%' }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Education & Experience
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <SchoolIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Education"
                        secondary={staff.education || 'Not provided'}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <WorkIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Experience"
                        secondary={staff.experience ? `${staff.experience} years` : 'Not provided'}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <VerifiedUserIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Certifications"
                        secondary={staff.certifications || 'Not provided'}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Schedule & Assignments */}
            <Grid item xs={12} md={6}>
              <Card
                component={motion.div}
                variants={itemVariants}
                sx={{ borderRadius: 3, height: '100%' }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Schedule & Assignments
                  </Typography>
                  <List>
                    {staff.role === 'doctor' && (
                      <>
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Assigned Patients"
                            secondary={staff.assignedPatients?.length || 0}
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                          />
                        </ListItem>
                        <Divider component="li" />
                      </>
                    )}
                    {staff.role === 'nurse' && (
                      <>
                        <ListItem>
                          <ListItemIcon>
                            <LocalHospitalIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Assigned Doctors"
                            secondary={staff.assignedDoctors?.length || 0}
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                          />
                        </ListItem>
                        <Divider component="li" />
                      </>
                    )}
                    <ListItem>
                      <ListItemIcon>
                        <EventNoteIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Schedule"
                        secondary={staff.schedule || 'Regular hours'}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <AssignmentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Appointments"
                        secondary={staff.appointments || 0}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {tabValue === 2 && (
          <>
            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Card
                component={motion.div}
                variants={itemVariants}
                sx={{ borderRadius: 3, height: '100%' }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Contact Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={staff.email}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Phone"
                        secondary={staff.phone || 'Not provided'}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <LocationOnIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Address"
                        secondary={staff.address || 'Not provided'}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12} md={6}>
              <Card
                component={motion.div}
                variants={itemVariants}
                sx={{ borderRadius: 3, height: '100%' }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Emergency Contact
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <ContactPhoneIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Emergency Contact"
                        secondary={staff.emergencyContact || 'Not provided'}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Edit Staff Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Staff Member</DialogTitle>
        <DialogContent dividers>
          <StaffForm onSubmit={handleEditStaff} initialData={staff} isEdit />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {staff.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteStaff} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffDetail;
