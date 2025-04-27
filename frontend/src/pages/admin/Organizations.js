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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  VerifiedUser as VerifiedUserIcon,
  LocalHospital as LocalHospitalIcon,
  School as SchoolIcon,
  Apartment as ApartmentIcon,
  Store as StoreIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import axios from '../../utils/axios';
import { motion } from 'framer-motion';
import { DataGrid } from '@mui/x-data-grid';

const Organizations = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [organizations, setOrganizations] = useState([
    {
      id: 1,
      name: 'SoulSpace Medical Center',
      type: 'hospital',
      email: 'info@soulspacemedical.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      status: 'active',
      adminName: 'John Smith',
      adminEmail: 'john.smith@soulspacemedical.com',
      memberCount: 125,
      createdAt: '2023-01-15',
      updatedAt: '2023-06-20'
    },
    {
      id: 2,
      name: 'Wellness Partners Inc.',
      type: 'insurance',
      email: 'contact@wellnesspartners.com',
      phone: '+1 (555) 234-5678',
      location: 'Boston, MA',
      status: 'active',
      adminName: 'Sarah Johnson',
      adminEmail: 'sarah.j@wellnesspartners.com',
      memberCount: 42,
      createdAt: '2023-02-10',
      updatedAt: '2023-05-15'
    },
    {
      id: 3,
      name: 'MediTech Research',
      type: 'research',
      email: 'research@meditech.org',
      phone: '+1 (555) 345-6789',
      location: 'San Francisco, CA',
      status: 'active',
      adminName: 'Robert Chen',
      adminEmail: 'r.chen@meditech.org',
      memberCount: 78,
      createdAt: '2023-03-05',
      updatedAt: '2023-07-01'
    },
    {
      id: 4,
      name: 'HealthFirst University',
      type: 'education',
      email: 'admin@healthfirstu.edu',
      phone: '+1 (555) 456-7890',
      location: 'Chicago, IL',
      status: 'active',
      adminName: 'Emily Davis',
      adminEmail: 'e.davis@healthfirstu.edu',
      memberCount: 210,
      createdAt: '2023-01-20',
      updatedAt: '2023-04-12'
    },
    {
      id: 5,
      name: 'PharmaCare Solutions',
      type: 'pharmacy',
      email: 'info@pharmacare.com',
      phone: '+1 (555) 567-8901',
      location: 'Miami, FL',
      status: 'inactive',
      adminName: 'Michael Brown',
      adminEmail: 'm.brown@pharmacare.com',
      memberCount: 35,
      createdAt: '2023-02-25',
      updatedAt: '2023-06-10'
    },
    {
      id: 6,
      name: 'Community Health Network',
      type: 'nonprofit',
      email: 'contact@commhealth.org',
      phone: '+1 (555) 678-9012',
      location: 'Denver, CO',
      status: 'active',
      adminName: 'Jessica Wilson',
      adminEmail: 'j.wilson@commhealth.org',
      memberCount: 92,
      createdAt: '2023-03-15',
      updatedAt: '2023-05-28'
    },
    {
      id: 7,
      name: 'MedEquip Suppliers',
      type: 'supplier',
      email: 'sales@medequip.com',
      phone: '+1 (555) 789-0123',
      location: 'Seattle, WA',
      status: 'active',
      adminName: 'David Miller',
      adminEmail: 'd.miller@medequip.com',
      memberCount: 48,
      createdAt: '2023-04-05',
      updatedAt: '2023-07-10'
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    email: '',
    phone: '',
    location: '',
    status: 'active',
    adminName: '',
    adminEmail: ''
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
    // Simulate fetching organizations data
    setLoading(true);
    setTimeout(() => {
      // In a real app, you would fetch data from the server here
      setLoading(false);
    }, 1000);
  }, []);

  const handleOpenDialog = (mode, organization = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && organization) {
      setSelectedOrganization(organization);
      setFormData({
        name: organization.name,
        type: organization.type,
        email: organization.email,
        phone: organization.phone,
        location: organization.location,
        status: organization.status,
        adminName: organization.adminName,
        adminEmail: organization.adminEmail
      });
    } else {
      setSelectedOrganization(null);
      setFormData({
        name: '',
        type: '',
        email: '',
        phone: '',
        location: '',
        status: 'active',
        adminName: '',
        adminEmail: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrganization(null);
    setFormData({
      name: '',
      type: '',
      email: '',
      phone: '',
      location: '',
      status: 'active',
      adminName: '',
      adminEmail: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.type || !formData.email || !formData.phone || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    // In a real app, you would save to the server here
    if (dialogMode === 'add') {
      const newOrganization = {
        id: organizations.length + 1,
        ...formData,
        memberCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setOrganizations([...organizations, newOrganization]);
      setSuccess('Organization created successfully');
    } else {
      const updatedOrganizations = organizations.map(org => 
        org.id === selectedOrganization.id ? {
          ...org,
          ...formData,
          updatedAt: new Date().toISOString().split('T')[0]
        } : org
      );
      setOrganizations(updatedOrganizations);
      setSuccess('Organization updated successfully');
    }

    handleCloseDialog();
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const handleDelete = (orgId) => {
    // In a real app, you would delete from the server here
    const updatedOrganizations = organizations.filter(org => org.id !== orgId);
    setOrganizations(updatedOrganizations);
    setSuccess('Organization deleted successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const getOrganizationTypeIcon = (type) => {
    switch (type) {
      case 'hospital':
        return <LocalHospitalIcon sx={{ color: theme.palette.primary.main }} />;
      case 'insurance':
        return <VerifiedUserIcon sx={{ color: theme.palette.info.main }} />;
      case 'research':
        return <SchoolIcon sx={{ color: theme.palette.secondary.main }} />;
      case 'education':
        return <SchoolIcon sx={{ color: theme.palette.warning.main }} />;
      case 'pharmacy':
        return <LocalHospitalIcon sx={{ color: theme.palette.success.main }} />;
      case 'nonprofit':
        return <AccountBalanceIcon sx={{ color: theme.palette.error.main }} />;
      case 'supplier':
        return <StoreIcon sx={{ color: theme.palette.info.dark }} />;
      default:
        return <BusinessIcon sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  const getOrganizationTypeName = (type) => {
    const typeMap = {
      'hospital': 'Hospital',
      'insurance': 'Insurance Provider',
      'research': 'Research Institution',
      'education': 'Educational Institution',
      'pharmacy': 'Pharmacy',
      'nonprofit': 'Non-Profit Organization',
      'supplier': 'Medical Supplier'
    };
    return typeMap[type] || 'Organization';
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Organization',
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: 40,
              height: 40,
              mr: 2
            }}
          >
            {getOrganizationTypeIcon(params.row.type)}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight={600}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getOrganizationTypeName(params.row.type)}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'adminName',
      headerName: 'Admin',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'memberCount',
      headerName: 'Members',
      flex: 0.7,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            fontWeight: 600
          }}
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value === 'active' ? 'Active' : 'Inactive'}
          color={params.value === 'active' ? 'success' : 'error'}
          size="small"
          icon={params.value === 'active' ? <CheckCircleIcon /> : <CancelIcon />}
          sx={{ fontWeight: 500 }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit Organization">
            <IconButton
              color="primary"
              onClick={() => handleOpenDialog('edit', params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Organization">
            <IconButton
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

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
            <BusinessIcon
              sx={{
                fontSize: 40,
                mr: 2,
                color: theme.palette.primary.main
              }}
            />
            <Typography variant="h4" component="h1" fontWeight={700}>
              Organization Management
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
            Add New Organization
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

        {/* Organizations DataGrid */}
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
          <DataGrid
            rows={organizations}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            autoHeight
            disableSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2
              },
              '& .MuiDataGrid-cell': {
                py: 1.5
              }
            }}
          />
        </Paper>

        {/* Organization Types Overview */}
        <Grid container spacing={3} component={motion.div} variants={itemVariants}>
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Organization Types
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Below is an overview of all organization types in the system. Each type has specific features and permissions.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mr: 2
                    }}
                  >
                    <LocalHospitalIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Hospitals & Clinics
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Healthcare facilities providing medical services to patients. Includes hospitals, clinics, and specialized care centers.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Patient management" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Appointment scheduling" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Medical records access" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      mr: 2
                    }}
                  >
                    <VerifiedUserIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Insurance Providers
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Organizations providing health insurance coverage and managing claims for patients.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Claims processing" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Coverage verification" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Policy management" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      mr: 2
                    }}
                  >
                    <LocalHospitalIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Pharmacies
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Organizations that dispense medications and provide pharmaceutical services to patients.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Prescription management" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Medication inventory" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Delivery services" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Add/Edit Organization Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Organization' : 'Edit Organization'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Organization Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Organization Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Organization Type"
                >
                  <MenuItem value="hospital">Hospital</MenuItem>
                  <MenuItem value="insurance">Insurance Provider</MenuItem>
                  <MenuItem value="research">Research Institution</MenuItem>
                  <MenuItem value="education">Educational Institution</MenuItem>
                  <MenuItem value="pharmacy">Pharmacy</MenuItem>
                  <MenuItem value="nonprofit">Non-Profit Organization</MenuItem>
                  <MenuItem value="supplier">Medical Supplier</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                type="email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Administrator Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Admin Name"
                name="adminName"
                value={formData.adminName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Admin Email"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleInputChange}
                required
                type="email"
              />
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
            {dialogMode === 'add' ? 'Create Organization' : 'Update Organization'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Organizations;
