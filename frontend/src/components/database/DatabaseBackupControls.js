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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const DatabaseBackupControls = () => {
  const theme = useTheme();
  const [openBackupDialog, setOpenBackupDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupType, setBackupType] = useState('full');
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');

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

  // Mock backup history data
  const backupHistory = [
    {
      id: 1,
      name: 'Full Backup',
      date: '2023-06-15 08:00:12',
      size: '42.8 GB',
      type: 'Automatic',
      status: 'Completed',
      retention: '30 days',
    },
    {
      id: 2,
      name: 'Incremental Backup',
      date: '2023-06-14 08:00:08',
      size: '5.2 GB',
      type: 'Automatic',
      status: 'Completed',
      retention: '30 days',
    },
    {
      id: 3,
      name: 'Full Backup',
      date: '2023-06-13 14:32:45',
      size: '41.5 GB',
      type: 'Manual',
      status: 'Completed',
      retention: '30 days',
    },
    {
      id: 4,
      name: 'Incremental Backup',
      date: '2023-06-13 08:00:11',
      size: '4.8 GB',
      type: 'Automatic',
      status: 'Completed',
      retention: '30 days',
    },
    {
      id: 5,
      name: 'Incremental Backup',
      date: '2023-06-12 08:00:09',
      size: '3.9 GB',
      type: 'Automatic',
      status: 'Completed',
      retention: '30 days',
    },
  ];

  // Mock backup schedule data
  const backupSchedule = [
    {
      type: 'Full Backup',
      frequency: 'Weekly',
      day: 'Sunday',
      time: '02:00 AM',
      retention: '30 days',
      lastRun: '2023-06-11 02:00:05',
      nextRun: '2023-06-18 02:00:00',
    },
    {
      type: 'Incremental Backup',
      frequency: 'Daily',
      day: 'Every day',
      time: '08:00 AM',
      retention: '7 days',
      lastRun: '2023-06-15 08:00:12',
      nextRun: '2023-06-16 08:00:00',
    },
  ];

  // Handle dialog open/close
  const handleOpenBackupDialog = () => {
    setOpenBackupDialog(true);
  };

  const handleCloseBackupDialog = () => {
    setOpenBackupDialog(false);
  };

  const handleOpenRestoreDialog = (backup) => {
    setSelectedBackup(backup);
    setOpenRestoreDialog(true);
  };

  const handleCloseRestoreDialog = () => {
    setOpenRestoreDialog(false);
    setSelectedBackup(null);
  };

  const handleOpenScheduleDialog = () => {
    setOpenScheduleDialog(true);
  };

  const handleCloseScheduleDialog = () => {
    setOpenScheduleDialog(false);
  };

  // Handle form changes
  const handleBackupTypeChange = (event) => {
    setBackupType(event.target.value);
  };

  const handleScheduleFrequencyChange = (event) => {
    setScheduleFrequency(event.target.value);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return theme.palette.success.main;
      case 'In Progress':
        return theme.palette.warning.main;
      case 'Failed':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
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
          Database Backup & Recovery
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage database backups, schedules, and restoration
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Backup Controls */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Backup Controls
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last backup: 4 hours ago
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  onClick={handleOpenScheduleDialog}
                  sx={{ borderRadius: 2 }}
                >
                  Schedule
                </Button>
                <Button
                  variant="contained"
                  startIcon={<BackupIcon />}
                  onClick={handleOpenBackupDialog}
                  sx={{ borderRadius: 2 }}
                >
                  Create Backup
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Backup Schedule */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Backup Schedule
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                <Table sx={{ minWidth: 650 }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Frequency</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Day</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Retention</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Last Run</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Next Run</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {backupSchedule.map((schedule, index) => (
                      <TableRow
                        key={index}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>{schedule.type}</TableCell>
                        <TableCell>{schedule.frequency}</TableCell>
                        <TableCell>{schedule.day}</TableCell>
                        <TableCell>{schedule.time}</TableCell>
                        <TableCell>{schedule.retention}</TableCell>
                        <TableCell>{schedule.lastRun}</TableCell>
                        <TableCell>{schedule.nextRun}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>

          {/* Backup History */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Backup History
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                <Table sx={{ minWidth: 650 }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Retention</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {backupHistory.map((backup) => (
                      <TableRow
                        key={backup.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>{backup.name}</TableCell>
                        <TableCell>{backup.date}</TableCell>
                        <TableCell>{backup.size}</TableCell>
                        <TableCell>
                          <Chip
                            label={backup.type}
                            size="small"
                            color={backup.type === 'Automatic' ? 'info' : 'primary'}
                            sx={{ fontWeight: 500, height: 24 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(backup.status),
                                mr: 1,
                              }}
                            />
                            {backup.status}
                          </Box>
                        </TableCell>
                        <TableCell>{backup.retention}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex' }}>
                            <Tooltip title="Restore">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenRestoreDialog(backup)}
                              >
                                <RestoreIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton size="small">
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small">
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
        </Grid>

        {/* Create Backup Dialog */}
        <Dialog open={openBackupDialog} onClose={handleCloseBackupDialog}>
          <DialogTitle>Create New Backup</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Create a new database backup. This process may take several minutes depending on the database size.
            </DialogContentText>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="backup-type-label">Backup Type</InputLabel>
              <Select
                labelId="backup-type-label"
                id="backup-type"
                value={backupType}
                label="Backup Type"
                onChange={handleBackupTypeChange}
              >
                <MenuItem value="full">Full Backup</MenuItem>
                <MenuItem value="incremental">Incremental Backup</MenuItem>
              </Select>
            </FormControl>
            <TextField
              autoFocus
              margin="dense"
              id="backup-name"
              label="Backup Name"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={`${backupType === 'full' ? 'Full' : 'Incremental'} Backup - ${new Date().toISOString().split('T')[0]}`}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBackupDialog}>Cancel</Button>
            <Button onClick={handleCloseBackupDialog} variant="contained">
              Start Backup
            </Button>
          </DialogActions>
        </Dialog>

        {/* Restore Backup Dialog */}
        <Dialog open={openRestoreDialog} onClose={handleCloseRestoreDialog}>
          <DialogTitle>Restore Database</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Are you sure you want to restore the database from the following backup? This action cannot be undone and will replace the current database.
            </DialogContentText>
            {selectedBackup && (
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Backup Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedBackup.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {selectedBackup.date}
                </Typography>
                <Typography variant="body2">
                  <strong>Size:</strong> {selectedBackup.size}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.warning.main }}>
              <InfoIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="caption" color="warning.main">
                Warning: All data changes since this backup was created will be lost.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRestoreDialog}>Cancel</Button>
            <Button onClick={handleCloseRestoreDialog} variant="contained" color="warning">
              Restore Database
            </Button>
          </DialogActions>
        </Dialog>

        {/* Schedule Backup Dialog */}
        <Dialog open={openScheduleDialog} onClose={handleCloseScheduleDialog}>
          <DialogTitle>Schedule Backup</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Configure automated database backup schedule.
            </DialogContentText>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="schedule-backup-type-label">Backup Type</InputLabel>
              <Select
                labelId="schedule-backup-type-label"
                id="schedule-backup-type"
                value={backupType}
                label="Backup Type"
                onChange={handleBackupTypeChange}
              >
                <MenuItem value="full">Full Backup</MenuItem>
                <MenuItem value="incremental">Incremental Backup</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="schedule-frequency-label">Frequency</InputLabel>
              <Select
                labelId="schedule-frequency-label"
                id="schedule-frequency"
                value={scheduleFrequency}
                label="Frequency"
                onChange={handleScheduleFrequencyChange}
              >
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            {scheduleFrequency === 'weekly' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="schedule-day-label">Day of Week</InputLabel>
                <Select
                  labelId="schedule-day-label"
                  id="schedule-day"
                  label="Day of Week"
                  defaultValue="sunday"
                >
                  <MenuItem value="sunday">Sunday</MenuItem>
                  <MenuItem value="monday">Monday</MenuItem>
                  <MenuItem value="tuesday">Tuesday</MenuItem>
                  <MenuItem value="wednesday">Wednesday</MenuItem>
                  <MenuItem value="thursday">Thursday</MenuItem>
                  <MenuItem value="friday">Friday</MenuItem>
                  <MenuItem value="saturday">Saturday</MenuItem>
                </Select>
              </FormControl>
            )}
            <TextField
              margin="dense"
              id="schedule-time"
              label="Time"
              type="time"
              fullWidth
              variant="outlined"
              defaultValue="02:00"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel id="retention-period-label">Retention Period</InputLabel>
              <Select
                labelId="retention-period-label"
                id="retention-period"
                label="Retention Period"
                defaultValue="30"
              >
                <MenuItem value="7">7 days</MenuItem>
                <MenuItem value="14">14 days</MenuItem>
                <MenuItem value="30">30 days</MenuItem>
                <MenuItem value="60">60 days</MenuItem>
                <MenuItem value="90">90 days</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseScheduleDialog}>Cancel</Button>
            <Button onClick={handleCloseScheduleDialog} variant="contained">
              Save Schedule
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DatabaseBackupControls;
