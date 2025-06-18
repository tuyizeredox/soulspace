import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from '../../../utils/axiosConfig';

const AvailabilityScheduler = ({ onScheduleRequest }) => {
  const theme = useTheme();
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleRequests, setScheduleRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    date: null,
    startTime: null,
    endTime: null,
    breakStartTime: null,
    breakEndTime: null,
    maxPatients: 8,
    notes: '',
    type: 'regular'
  });

  // Handle schedule creation
  const handleCreateSchedule = async () => {
    try {
      setLoading(true);
      
      if (!newSchedule.date || !newSchedule.startTime || !newSchedule.endTime) {
        alert('Please fill in all required fields');
        return;
      }

      const scheduleData = {
        date: newSchedule.date.toISOString(),
        startTime: newSchedule.startTime.toTimeString().slice(0, 5),
        endTime: newSchedule.endTime.toTimeString().slice(0, 5),
        breakStartTime: newSchedule.breakStartTime?.toTimeString().slice(0, 5),
        breakEndTime: newSchedule.breakEndTime?.toTimeString().slice(0, 5),
        maxPatients: newSchedule.maxPatients,
        notes: newSchedule.notes,
        type: newSchedule.type,
        status: 'pending'
      };

      const response = await axios.post('/api/doctors/schedule-requests', scheduleData);
      
      const newRequest = {
        ...response.data,
        id: Date.now().toString(),
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      
      setScheduleRequests(prev => [...prev, newRequest]);
      
      if (onScheduleRequest) {
        onScheduleRequest(newRequest);
      }
      
      // Reset form
      setNewSchedule({
        date: null,
        startTime: null,
        endTime: null,
        breakStartTime: null,
        breakEndTime: null,
        maxPatients: 8,
        notes: '',
        type: 'regular'
      });
      
      setShowScheduleDialog(false);
    } catch (error) {
      console.error('Error creating schedule request:', error);
      alert('Failed to create schedule request');
    } finally {
      setLoading(false);
    }
  };

  // Handle schedule deletion
  const handleDeleteSchedule = (scheduleId) => {
    setScheduleRequests(prev => prev.filter(schedule => schedule.id !== scheduleId));
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return theme.palette.success.main;
      case 'rejected':
        return theme.palette.error.main;
      case 'pending':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Schedule Availability
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Request schedule changes and manage your availability
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowScheduleDialog(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Request Schedule
            </Button>
          </Box>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
                onClick={() => {
                  setNewSchedule(prev => ({ ...prev, type: 'regular' }));
                  setShowScheduleDialog(true);
                }}
              >
                <ScheduleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Regular Schedule
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Standard working hours
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
                onClick={() => {
                  setNewSchedule(prev => ({ ...prev, type: 'extended' }));
                  setShowScheduleDialog(true);
                }}
              >
                <AccessTimeIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Extended Hours
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Longer working day
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
                onClick={() => {
                  setNewSchedule(prev => ({ ...prev, type: 'emergency' }));
                  setShowScheduleDialog(true);
                }}
              >
                <CalendarTodayIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Emergency Shift
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  On-call availability
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
                onClick={() => {
                  setNewSchedule(prev => ({ ...prev, type: 'time-off' }));
                  setShowScheduleDialog(true);
                }}
              >
                <CalendarTodayIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Time Off
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Request leave
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Pending Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Schedule Requests
              </Typography>
              
              {scheduleRequests.length > 0 ? (
                <List>
                  {scheduleRequests.map((request, index) => (
                    <ListItem key={request.id} divider={index < scheduleRequests.length - 1}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={500}>
                              {request.type?.charAt(0).toUpperCase() + request.type?.slice(1)} Schedule
                            </Typography>
                            <Chip
                              label={request.status}
                              size="small"
                              sx={{
                                bgcolor: alpha(getStatusColor(request.status), 0.1),
                                color: getStatusColor(request.status),
                                fontWeight: 500
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Date: {new Date(request.date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Time: {request.startTime} - {request.endTime}
                            </Typography>
                            {request.notes && (
                              <Typography variant="body2" color="text.secondary">
                                Notes: {request.notes}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteSchedule(request.id)}
                          disabled={request.status === 'approved'}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ScheduleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Schedule Requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create your first schedule request to get started
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Schedule Request Dialog */}
        <Dialog
          open={showScheduleDialog}
          onClose={() => setShowScheduleDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={600}>
                Request Schedule Change
              </Typography>
              <IconButton onClick={() => setShowScheduleDialog(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Schedule Type */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Schedule Type</InputLabel>
                  <Select
                    value={newSchedule.type}
                    label="Schedule Type"
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <MenuItem value="regular">Regular Schedule</MenuItem>
                    <MenuItem value="extended">Extended Hours</MenuItem>
                    <MenuItem value="emergency">Emergency Shift</MenuItem>
                    <MenuItem value="time-off">Time Off Request</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Date */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date"
                  value={newSchedule.date}
                  onChange={(value) => setNewSchedule(prev => ({ ...prev, date: value }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={new Date()}
                />
              </Grid>

              {/* Max Patients */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Patients"
                  type="number"
                  value={newSchedule.maxPatients}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, maxPatients: parseInt(e.target.value) }))}
                  inputProps={{ min: 1, max: 20 }}
                />
              </Grid>

              {newSchedule.type !== 'time-off' && (
                <>
                  {/* Working Hours */}
                  <Grid item xs={12} md={6}>
                    <TimePicker
                      label="Start Time"
                      value={newSchedule.startTime}
                      onChange={(value) => setNewSchedule(prev => ({ ...prev, startTime: value }))}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TimePicker
                      label="End Time"
                      value={newSchedule.endTime}
                      onChange={(value) => setNewSchedule(prev => ({ ...prev, endTime: value }))}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>

                  {/* Break Times */}
                  <Grid item xs={12} md={6}>
                    <TimePicker
                      label="Break Start (Optional)"
                      value={newSchedule.breakStartTime}
                      onChange={(value) => setNewSchedule(prev => ({ ...prev, breakStartTime: value }))}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TimePicker
                      label="Break End (Optional)"
                      value={newSchedule.breakEndTime}
                      onChange={(value) => setNewSchedule(prev => ({ ...prev, breakEndTime: value }))}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </>
              )}

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={newSchedule.notes}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes or special requirements..."
                />
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 2 }}>
              Schedule requests require approval from hospital administration. You will be notified once your request is reviewed.
            </Alert>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => setShowScheduleDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSchedule}
              variant="contained"
              startIcon={<SendIcon />}
              disabled={loading || !newSchedule.date}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AvailabilityScheduler;