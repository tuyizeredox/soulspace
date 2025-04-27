import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Policy as PolicyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CalendarToday as CalendarTodayIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const CompliancePolicies = ({ policies, onRefresh }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'hipaa',
    status: 'active'
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      title: '',
      description: '',
      category: 'hipaa',
      status: 'active'
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (policy) => {
    setDialogMode('edit');
    setSelectedPolicy(policy);
    setFormData({
      title: policy.title,
      description: policy.description,
      category: policy.category,
      status: policy.status
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
    // Here you would typically save the policy to your backend
    console.log('Saving policy:', formData);
    
    // Close the dialog
    setOpenDialog(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
      case 'pending':
        return <WarningIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />;
      case 'inactive':
        return <ErrorIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
      default:
        return <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
    }
  };

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

  // Filter policies based on search term
  const filteredPolicies = policies.filter((policy) => {
    return (
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Card
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Compliance Policies
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Add Policy
            </Button>
            <Tooltip title="Refresh Policies">
              <IconButton
                size="small"
                onClick={onRefresh}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Search */}
        <TextField
          placeholder="Search policies..."
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Policies List */}
        <List sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 2 }}>
          {filteredPolicies.map((policy, index) => (
            <React.Fragment key={policy.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                component={motion.div}
                variants={itemVariants}
                sx={{
                  py: 2,
                  px: 3,
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }}
                  >
                    <PolicyIcon sx={{ color: theme.palette.primary.main }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {policy.title}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(policy.status)}
                        label={policy.status}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(policy.status), 0.1),
                          color: getStatusColor(policy.status),
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {policy.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            Last updated: {policy.lastUpdated}
                          </Typography>
                        </Box>
                        <Chip
                          label={policy.category}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main,
                            fontWeight: 500,
                            textTransform: 'capitalize'
                          }}
                        />
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit Policy">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditDialog(policy)}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Policy">
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.2),
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
          {filteredPolicies.length === 0 && (
            <ListItem sx={{ py: 4, justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No policies found matching your search
              </Typography>
            </ListItem>
          )}
        </List>
      </CardContent>

      {/* Add/Edit Policy Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Policy' : 'Edit Policy'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              name="title"
              label="Policy Title"
              value={formData.title}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              required
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  label="Category"
                >
                  <MenuItem value="hipaa">HIPAA</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                  <MenuItem value="privacy">Privacy</MenuItem>
                  <MenuItem value="data">Data Protection</MenuItem>
                  <MenuItem value="access">Access Control</MenuItem>
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
            {dialogMode === 'add' ? 'Add Policy' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CompliancePolicies;
