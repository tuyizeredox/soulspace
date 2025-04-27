import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  alpha,
  Divider,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const DataRetentionSettings = () => {
  const theme = useTheme();
  const [openPolicyDialog, setOpenPolicyDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [editMode, setEditMode] = useState(false);

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

  // Mock data retention policies
  const retentionPolicies = [
    {
      id: 1,
      name: 'Audit Logs',
      dataType: 'Logs',
      retention: '90 days',
      archiving: 'Yes (S3)',
      status: 'Active',
      lastRun: '2023-06-14',
      description: 'System audit logs for security and compliance',
    },
    {
      id: 2,
      name: 'User Session Data',
      dataType: 'Sessions',
      retention: '30 days',
      archiving: 'No',
      status: 'Active',
      lastRun: '2023-06-15',
      description: 'User login and session information',
    },
    {
      id: 3,
      name: 'Temporary Files',
      dataType: 'Files',
      retention: '7 days',
      archiving: 'No',
      status: 'Active',
      lastRun: '2023-06-15',
      description: 'Temporary files and uploads',
    },
    {
      id: 4,
      name: 'System Metrics',
      dataType: 'Metrics',
      retention: '365 days',
      archiving: 'Yes (S3)',
      status: 'Active',
      lastRun: '2023-06-14',
      description: 'Performance and usage metrics',
    },
    {
      id: 5,
      name: 'Deleted User Data',
      dataType: 'User Data',
      retention: '180 days',
      archiving: 'Yes (S3)',
      status: 'Active',
      lastRun: '2023-06-14',
      description: 'Data from deleted user accounts',
    },
  ];

  // Mock compliance settings
  const complianceSettings = {
    hipaaCompliance: true,
    gdprCompliance: true,
    ccpaCompliance: true,
    dataEncryption: true,
    auditTrail: true,
    automaticDeletion: true,
  };

  // Handle dialog open/close
  const handleOpenPolicyDialog = (policy = null) => {
    setSelectedPolicy(policy);
    setEditMode(!!policy);
    setOpenPolicyDialog(true);
  };

  const handleClosePolicyDialog = () => {
    setOpenPolicyDialog(false);
    setSelectedPolicy(null);
    setEditMode(false);
  };

  const handleOpenDeleteDialog = (policy) => {
    setSelectedPolicy(policy);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedPolicy(null);
  };

  // Handle compliance setting change
  const handleComplianceChange = (setting) => (event) => {
    // In a real app, this would update the state
    console.log(`Changed ${setting} to ${event.target.checked}`);
  };

  return (
    <Card
      component={motion.div}
      variants={itemVariants}
      sx={{
        mb: 3,
        borderRadius: 2,
        boxShadow: theme.shadows[3],
        background: `linear-gradient(to right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Data Retention & Compliance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage data retention policies and compliance settings
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Data Retention Policies */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Data Retention Policies
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenPolicyDialog()}
                  sx={{ borderRadius: 2 }}
                >
                  Add Policy
                </Button>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                <Table sx={{ minWidth: 650 }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Policy Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Data Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Retention Period</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Archiving</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Last Run</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {retentionPolicies.map((policy) => (
                      <TableRow
                        key={policy.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                            <Typography variant="body2" fontWeight={500}>
                              {policy.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{policy.dataType}</TableCell>
                        <TableCell>{policy.retention}</TableCell>
                        <TableCell>{policy.archiving}</TableCell>
                        <TableCell>
                          <Chip
                            label={policy.status}
                            size="small"
                            color={policy.status === 'Active' ? 'success' : 'default'}
                            sx={{ fontWeight: 500, height: 24 }}
                          />
                        </TableCell>
                        <TableCell>{policy.lastRun}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex' }}>
                            <Tooltip title="Edit Policy">
                              <IconButton size="small" onClick={() => handleOpenPolicyDialog(policy)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Policy">
                              <IconButton size="small" onClick={() => handleOpenDeleteDialog(policy)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>

          {/* Compliance Settings */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Compliance Settings
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Save Changes
                </Button>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Regulatory Compliance
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={complianceSettings.hipaaCompliance}
                          onChange={handleComplianceChange('hipaaCompliance')}
                          color="primary"
                        />
                      }
                      label="HIPAA Compliance"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={complianceSettings.gdprCompliance}
                          onChange={handleComplianceChange('gdprCompliance')}
                          color="primary"
                        />
                      }
                      label="GDPR Compliance"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={complianceSettings.ccpaCompliance}
                          onChange={handleComplianceChange('ccpaCompliance')}
                          color="primary"
                        />
                      }
                      label="CCPA Compliance"
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Data Protection
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={complianceSettings.dataEncryption}
                          onChange={handleComplianceChange('dataEncryption')}
                          color="info"
                        />
                      }
                      label="Data Encryption"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={complianceSettings.auditTrail}
                          onChange={handleComplianceChange('auditTrail')}
                          color="info"
                        />
                      }
                      label="Audit Trail"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={complianceSettings.automaticDeletion}
                          onChange={handleComplianceChange('automaticDeletion')}
                          color="info"
                        />
                      }
                      label="Automatic Deletion"
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Alert
                    severity="info"
                    icon={<InfoIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      Compliance Information
                    </Typography>
                    <Typography variant="body2">
                      Enabling these settings will enforce data retention policies in accordance with regulatory requirements. Make sure to review your data handling practices to ensure full compliance.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {/* Add/Edit Policy Dialog */}
        <Dialog open={openPolicyDialog} onClose={handleClosePolicyDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editMode ? 'Edit Policy' : 'Add New Policy'}</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {editMode
                ? 'Edit the data retention policy details below.'
                : 'Configure a new data retention policy to automatically manage data lifecycle.'}
            </DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="policy-name"
                  label="Policy Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  defaultValue={selectedPolicy?.name || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  margin="dense"
                  id="data-type"
                  label="Data Type"
                  fullWidth
                  variant="outlined"
                  defaultValue={selectedPolicy?.dataType || 'Logs'}
                >
                  <MenuItem value="Logs">Logs</MenuItem>
                  <MenuItem value="Sessions">Sessions</MenuItem>
                  <MenuItem value="Files">Files</MenuItem>
                  <MenuItem value="Metrics">Metrics</MenuItem>
                  <MenuItem value="User Data">User Data</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  margin="dense"
                  id="retention-period"
                  label="Retention Period"
                  fullWidth
                  variant="outlined"
                  defaultValue={selectedPolicy?.retention || '30 days'}
                >
                  <MenuItem value="7 days">7 days</MenuItem>
                  <MenuItem value="30 days">30 days</MenuItem>
                  <MenuItem value="90 days">90 days</MenuItem>
                  <MenuItem value="180 days">180 days</MenuItem>
                  <MenuItem value="365 days">365 days</MenuItem>
                  <MenuItem value="Forever">Forever</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      defaultChecked={selectedPolicy?.archiving === 'Yes (S3)'}
                      color="primary"
                    />
                  }
                  label="Enable Archiving"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  id="policy-description"
                  label="Description"
                  type="text"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  defaultValue={selectedPolicy?.description || ''}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePolicyDialog}>Cancel</Button>
            <Button onClick={handleClosePolicyDialog} variant="contained" color="primary">
              {editMode ? 'Save Changes' : 'Create Policy'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Policy Dialog */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Delete Policy</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the "{selectedPolicy?.name}" policy? This action cannot be undone.
            </DialogContentText>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Deleting this policy will not delete any data that has already been retained. It will only stop future retention operations.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button onClick={handleCloseDeleteDialog} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DataRetentionSettings;
