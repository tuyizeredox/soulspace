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
  Avatar,
  InputAdornment,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../../utils/axios';
import { motion } from 'framer-motion';

const Admins = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'hospital_admin',
    hospital: '',
    status: 'active'
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

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

  // Mock data for admins
  const mockAdmins = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@hospital.com',
      phone: '(555) 123-4567',
      role: 'hospital_admin',
      hospital: 'General Hospital',
      status: 'active',
      lastLogin: '2023-07-15 14:32:45',
      createdAt: '2023-01-10'
    },
    {
      id: 2,
      name: 'Dr. Michael Lee',
      email: 'michael.lee@hospital.com',
      phone: '(555) 234-5678',
      role: 'hospital_admin',
      hospital: 'City Medical Center',
      status: 'active',
      lastLogin: '2023-07-14 09:15:22',
      createdAt: '2023-02-15'
    },
    {
      id: 3,
      name: 'Dr. Emily Chen',
      email: 'emily.chen@hospital.com',
      phone: '(555) 345-6789',
      role: 'hospital_admin',
      hospital: 'Community Health Center',
      status: 'inactive',
      lastLogin: '2023-06-30 11:05:17',
      createdAt: '2023-03-20'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      email: 'james.wilson@hospital.com',
      phone: '(555) 456-7890',
      role: 'hospital_admin',
      hospital: 'University Hospital',
      status: 'active',
      lastLogin: '2023-07-15 10:42:31',
      createdAt: '2023-04-05'
    },
    {
      id: 5,
      name: 'Dr. Lisa Brown',
      email: 'lisa.brown@hospital.com',
      phone: '(555) 567-8901',
      role: 'hospital_admin',
      hospital: 'Children\'s Hospital',
      status: 'pending',
      lastLogin: 'Never',
      createdAt: '2023-07-10'
    }
  ];

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: alpha(theme.palette.primary.main, 0.8),
              mr: 1
            }}
          >
            {params.row.name.charAt(0)}
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {params.row.name}
          </Typography>
        </Box>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
          <Typography variant="body2">{params.row.email}</Typography>
        </Box>
      )
    },
    {
      field: 'hospital',
      headerName: 'Hospital',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
          <Typography variant="body2">{params.row.hospital}</Typography>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      renderCell: (params) => {
        const getStatusColor = (status) => {
          switch (status) {
            case 'active':
              return theme.palette.success.main;
            case 'pending':
              return theme.palette.warning.main;
            case 'inactive':
              return theme.palette.error.main;
            default:
              return theme.palette.info.main;
          }
        };

        const getStatusIcon = (status) => {
          switch (status) {
            case 'active':
              return <CheckCircleIcon fontSize="small" />;
            case 'pending':
              return <WarningIcon fontSize="small" />;
            case 'inactive':
              return <ErrorIcon fontSize="small" />;
            default:
              return null;
          }
        };

        return (
          <Chip
            icon={getStatusIcon(params.row.status)}
            label={params.row.status.charAt(0).toUpperCase() + params.row.status.slice(1)}
            size="small"
            sx={{
              bgcolor: alpha(getStatusColor(params.row.status), 0.1),
              color: getStatusColor(params.row.status),
              fontWeight: 500,
              textTransform: 'capitalize'
            }}
          />
        );
      }
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      flex: 0.8,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.lastLogin}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.7,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton size="small" color="primary">
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      hospital: admin.hospital,
      status: admin.status
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    // In a real app, you would call an API to delete the admin
    setAdmins(admins.filter(admin => admin.id !== id));
    setSuccess('Administrator deleted successfully');
  };

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'hospital_admin',
      hospital: '',
      status: 'active'
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.email || !formData.hospital) {
      setError('Please fill in all required fields');
      return;
    }

    // In a real app, you would save to the server here
    if (dialogMode === 'add') {
      const newAdmin = {
        id: admins.length + 1,
        ...formData,
        lastLogin: 'Never',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAdmins([...admins, newAdmin]);
      setSuccess('Administrator added successfully');
    } else {
      const updatedAdmins = admins.map(admin => 
        admin.id === selectedAdmin.id ? {
          ...admin,
          ...formData
        } : admin
      );
      setAdmins(updatedAdmins);
      setSuccess('Administrator updated successfully');
    }
    
    setOpenDialog(false);
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch from an API
      // const response = await axios.get('/api/admins');
      // setAdmins(response.data);
      
      // Using mock data for now
      setAdmins(mockAdmins);
      setLoading(false);
    } catch (error) {
      setError('Error fetching administrators');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter admins based on search term
  const filteredAdmins = admins.filter(admin => {
    return (
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.hospital.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Container maxWidth="xl">
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component={RouterLink}
            to="/admin/dashboard"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 0.5 }} />
            Administrators
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Administrator Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage hospital administrators and their access permissions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            Add Administrator
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

        {/* Search and Filter */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <TextField
            placeholder="Search administrators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, minWidth: '200px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAdmins}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Refresh
          </Button>
        </Paper>

        {/* Administrators DataGrid */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
            height: 'calc(100vh - 300px)',
            minHeight: 400
          }}
        >
          <DataGrid
            rows={filteredAdmins}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            disableSelectionOnClick
            loading={loading}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 0
              },
              '& .MuiDataGrid-cell': {
                py: 1.5
              }
            }}
          />
        </Paper>

        {/* Add/Edit Administrator Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogMode === 'add' ? 'Add New Administrator' : 'Edit Administrator'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
                type="email"
              />
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                name="hospital"
                label="Hospital"
                value={formData.hospital}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    label="Role"
                  >
                    <MenuItem value="hospital_admin">Hospital Admin</MenuItem>
                    <MenuItem value="super_admin">Super Admin</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained">
              {dialogMode === 'add' ? 'Add Administrator' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Admins;
