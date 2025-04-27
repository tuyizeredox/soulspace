import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  Medication as MedicationIcon,
  VerifiedUser as VerifiedUserIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from '../../utils/axios';
import { motion } from 'framer-motion';

const Roles = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Super Admin',
      key: 'super_admin',
      description: 'Full system access with all permissions',
      usersCount: 3,
      permissions: ['all'],
      createdAt: '2023-01-15',
      updatedAt: '2023-06-20'
    },
    {
      id: 2,
      name: 'Hospital Admin',
      key: 'hospital_admin',
      description: 'Manages hospital operations and staff',
      usersCount: 12,
      permissions: ['hospital_management', 'staff_management', 'patient_view', 'appointment_management'],
      createdAt: '2023-01-15',
      updatedAt: '2023-05-10'
    },
    {
      id: 3,
      name: 'Doctor',
      key: 'doctor',
      description: 'Medical professional providing healthcare services',
      usersCount: 45,
      permissions: ['patient_view', 'patient_edit', 'appointment_view', 'appointment_edit', 'prescription_management'],
      createdAt: '2023-01-15',
      updatedAt: '2023-04-05'
    },
    {
      id: 4,
      name: 'Patient',
      key: 'patient',
      description: 'Healthcare service recipient',
      usersCount: 1250,
      permissions: ['own_profile_view', 'own_profile_edit', 'appointment_book', 'medical_records_view'],
      createdAt: '2023-01-15',
      updatedAt: '2023-03-22'
    },
    {
      id: 5,
      name: 'Pharmacist',
      key: 'pharmacist',
      description: 'Manages medications and prescriptions',
      usersCount: 18,
      permissions: ['prescription_view', 'prescription_fulfill', 'medication_management'],
      createdAt: '2023-01-15',
      updatedAt: '2023-02-18'
    },
    {
      id: 6,
      name: 'Insurance Provider',
      key: 'insurance_provider',
      description: 'Manages insurance claims and coverage',
      usersCount: 8,
      permissions: ['claim_management', 'coverage_management', 'billing_view'],
      createdAt: '2023-01-15',
      updatedAt: '2023-07-01'
    },
    {
      id: 7,
      name: 'Emergency Responder',
      key: 'emergency_responder',
      description: 'First responders for emergency situations',
      usersCount: 22,
      permissions: ['emergency_access', 'patient_critical_info', 'location_tracking'],
      createdAt: '2023-01-15',
      updatedAt: '2023-06-12'
    }
  ]);

  const [permissions, setPermissions] = useState([
    { id: 1, name: 'Hospital Management', key: 'hospital_management', category: 'Administration' },
    { id: 2, name: 'Staff Management', key: 'staff_management', category: 'Administration' },
    { id: 3, name: 'Patient View', key: 'patient_view', category: 'Patient Care' },
    { id: 4, name: 'Patient Edit', key: 'patient_edit', category: 'Patient Care' },
    { id: 5, name: 'Appointment View', key: 'appointment_view', category: 'Appointments' },
    { id: 6, name: 'Appointment Edit', key: 'appointment_edit', category: 'Appointments' },
    { id: 7, name: 'Appointment Book', key: 'appointment_book', category: 'Appointments' },
    { id: 8, name: 'Prescription Management', key: 'prescription_management', category: 'Medications' },
    { id: 9, name: 'Prescription View', key: 'prescription_view', category: 'Medications' },
    { id: 10, name: 'Prescription Fulfill', key: 'prescription_fulfill', category: 'Medications' },
    { id: 11, name: 'Medication Management', key: 'medication_management', category: 'Medications' },
    { id: 12, name: 'Own Profile View', key: 'own_profile_view', category: 'User' },
    { id: 13, name: 'Own Profile Edit', key: 'own_profile_edit', category: 'User' },
    { id: 14, name: 'Medical Records View', key: 'medical_records_view', category: 'Records' },
    { id: 15, name: 'Claim Management', key: 'claim_management', category: 'Insurance' },
    { id: 16, name: 'Coverage Management', key: 'coverage_management', category: 'Insurance' },
    { id: 17, name: 'Billing View', key: 'billing_view', category: 'Billing' },
    { id: 18, name: 'Emergency Access', key: 'emergency_access', category: 'Emergency' },
    { id: 19, name: 'Patient Critical Info', key: 'patient_critical_info', category: 'Emergency' },
    { id: 20, name: 'Location Tracking', key: 'location_tracking', category: 'Emergency' }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    permissions: []
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  useEffect(() => {
    // Simulate fetching roles data
    setLoading(true);
    setTimeout(() => {
      // In a real app, you would fetch data from the server here
      setLoading(false);
    }, 1000);
  }, []);

  const handleOpenDialog = (mode, role = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && role) {
      setSelectedRole(role);
      setFormData({
        name: role.name,
        key: role.key,
        description: role.description,
        permissions: role.permissions
      });
    } else {
      setSelectedRole(null);
      setFormData({
        name: '',
        key: '',
        description: '',
        permissions: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRole(null);
    setFormData({
      name: '',
      key: '',
      description: '',
      permissions: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permissionKey) => {
    setFormData(prev => {
      const permissions = [...prev.permissions];
      if (permissions.includes(permissionKey)) {
        return {
          ...prev,
          permissions: permissions.filter(p => p !== permissionKey)
        };
      } else {
        return {
          ...prev,
          permissions: [...permissions, permissionKey]
        };
      }
    });
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.key || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    // In a real app, you would save to the server here
    if (dialogMode === 'add') {
      const newRole = {
        id: roles.length + 1,
        ...formData,
        usersCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setRoles([...roles, newRole]);
      setSuccess('Role created successfully');
    } else {
      const updatedRoles = roles.map(role => 
        role.id === selectedRole.id ? {
          ...role,
          ...formData,
          updatedAt: new Date().toISOString().split('T')[0]
        } : role
      );
      setRoles(updatedRoles);
      setSuccess('Role updated successfully');
    }

    handleCloseDialog();
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const handleDelete = (roleId) => {
    // In a real app, you would delete from the server here
    const updatedRoles = roles.filter(role => role.id !== roleId);
    setRoles(updatedRoles);
    setSuccess('Role deleted successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const getRoleIcon = (roleKey) => {
    switch (roleKey) {
      case 'super_admin':
        return <AdminPanelSettingsIcon sx={{ color: theme.palette.error.main }} />;
      case 'hospital_admin':
        return <LocalHospitalIcon sx={{ color: theme.palette.primary.main }} />;
      case 'doctor':
        return <MedicalServicesIcon sx={{ color: theme.palette.info.main }} />;
      case 'patient':
        return <PersonIcon sx={{ color: theme.palette.success.main }} />;
      case 'pharmacist':
        return <MedicationIcon sx={{ color: theme.palette.warning.main }} />;
      case 'insurance_provider':
        return <VerifiedUserIcon sx={{ color: theme.palette.secondary.main }} />;
      case 'emergency_responder':
        return <SecurityIcon sx={{ color: theme.palette.error.light }} />;
      default:
        return <PersonIcon />;
    }
  };

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{ mt: 4, mb: 4 }}
      >
        {/* Page Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4
          }}
          component={motion.div}
          variants={itemVariants}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AdminPanelSettingsIcon
              sx={{
                fontSize: 40,
                mr: 2,
                color: theme.palette.primary.main
              }}
            />
            <Typography variant="h4" component="h1" fontWeight={700}>
              Role Management
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`
            }}
          >
            Add New Role
          </Button>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Roles Table */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
            mb: 4
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Users</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getRoleIcon(role.key)}
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="body1" fontWeight={600}>
                            {role.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {role.key}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={role.usersCount}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {role.permissions.includes('all') ? (
                        <Chip
                          label="All Permissions"
                          size="small"
                          color="error"
                          sx={{ fontWeight: 500 }}
                        />
                      ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {role.permissions.slice(0, 2).map((perm) => (
                            <Chip
                              key={perm}
                              label={permissions.find(p => p.key === perm)?.name || perm}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main,
                                fontWeight: 500
                              }}
                            />
                          ))}
                          {role.permissions.length > 2 && (
                            <Chip
                              label={`+${role.permissions.length - 2} more`}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                color: theme.palette.secondary.main,
                                fontWeight: 500
                              }}
                            />
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{role.updatedAt}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit Role">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog('edit', role)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {role.key !== 'super_admin' && role.key !== 'patient' && (
                        <Tooltip title="Delete Role">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(role.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Role Permissions Overview */}
        <Grid container spacing={3} component={motion.div} variants={itemVariants}>
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Permission Categories
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Below is an overview of all permission categories in the system. Each role can be assigned specific permissions from these categories.
            </Typography>
          </Grid>
          
          {Object.entries(permissionsByCategory).map(([category, perms]) => (
            <Grid item xs={12} md={6} lg={4} key={category}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {category}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List dense>
                    {perms.map((permission) => (
                      <ListItem key={permission.id}>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={permission.name}
                          secondary={permission.key}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Add/Edit Role Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Role' : 'Edit Role'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role Key"
                name="key"
                value={formData.key}
                onChange={handleInputChange}
                required
                disabled={dialogMode === 'edit'}
                helperText={dialogMode === 'edit' ? "Role key cannot be changed" : "Unique identifier for the role (e.g., 'doctor')"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Permissions
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.permissions.includes('all')}
                    onChange={() => handlePermissionChange('all')}
                    disabled={dialogMode === 'edit' && selectedRole?.key === 'super_admin'}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight={600}>
                      All Permissions
                    </Typography>
                    <Chip
                      label="Super Admin Only"
                      size="small"
                      color="error"
                      sx={{ ml: 1, fontWeight: 500 }}
                    />
                  </Box>
                }
              />
              
              <Divider sx={{ my: 2 }} />
              
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {category}
                  </Typography>
                  <Grid container spacing={1}>
                    {perms.map((permission) => (
                      <Grid item xs={12} sm={6} md={4} key={permission.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.permissions.includes(permission.key) || formData.permissions.includes('all')}
                              onChange={() => handlePermissionChange(permission.key)}
                              disabled={formData.permissions.includes('all')}
                            />
                          }
                          label={permission.name}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            color="primary"
          >
            {dialogMode === 'add' ? 'Create Role' : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Roles;
