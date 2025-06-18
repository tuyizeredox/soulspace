import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import axios from '../../../utils/axiosConfig';

const DoctorScheduleManager = ({ onScheduleUpdate, currentSchedule, loading }) => {
  const theme = useTheme();
  const { token } = useSelector((state) => state.userAuth);
  
  const [scheduleRequests, setScheduleRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null); // Track which request is being deleted
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [scheduleForm, setScheduleForm] = useState({
    effectiveDate: '',
    scheduleSlots: [{
      day: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      maxPatients: 10,
      slotDuration: 30,
      breakStartTime: '12:00',
      breakEndTime: '13:00',
      isActive: true
    }]
  });

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Fetch schedule requests
  const fetchScheduleRequests = async () => {
    try {
      setRequestsLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/doctors/my-schedules', config);
      setScheduleRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching schedule requests:', error);
      setError('Failed to fetch schedule requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleRequests();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitLoading(true);
      setError('');
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.post('/api/doctors/schedule-requests', scheduleForm, config);
      setSuccess('Schedule request submitted successfully');
      setCreateDialog(false);
      resetForm();
      fetchScheduleRequests();
      if (onScheduleUpdate) onScheduleUpdate();
      
    } catch (error) {
      console.error('Error creating schedule request:', error);
      setError(error.response?.data?.message || 'Failed to create schedule request');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setScheduleForm({
      effectiveDate: '',
      scheduleSlots: [{
        day: 'Monday',
        startTime: '09:00',
        endTime: '17:00',
        maxPatients: 10,
        slotDuration: 30,
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        isActive: true
      }]
    });
  };

  // Handle slot changes
  const handleSlotChange = (index, field, value) => {
    setScheduleForm(prev => ({
      ...prev,
      scheduleSlots: prev.scheduleSlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  // Add new slot
  const addSlot = () => {
    setScheduleForm(prev => ({
      ...prev,
      scheduleSlots: [...prev.scheduleSlots, {
        day: 'Monday',
        startTime: '09:00',
        endTime: '17:00',
        maxPatients: 10,
        slotDuration: 30,
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        isActive: true
      }]
    }));
  };

  // Remove slot
  const removeSlot = (index) => {
    if (scheduleForm.scheduleSlots.length > 1) {
      setScheduleForm(prev => ({
        ...prev,
        scheduleSlots: prev.scheduleSlots.filter((_, i) => i !== index)
      }));
    }
  };

  // Delete schedule request
  const handleDeleteRequest = async (requestId) => {
    console.log('Delete button clicked for request:', requestId);
    
    try {
      setDeleteLoading(requestId); // Set loading state for this specific request
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('Sending delete request to:', `/api/doctors/schedule-requests/${requestId}`);
      await axios.delete(`/api/doctors/schedule-requests/${requestId}`, config);
      
      // Clear any existing messages
      setError('');
      setSuccess('Schedule request deleted successfully');
      
      // Refresh the schedule requests list
      await fetchScheduleRequests();
      
      // Notify parent component to refresh
      if (onScheduleUpdate) onScheduleUpdate();
      
      console.log('Schedule request deleted and UI refreshed');
      
    } catch (error) {
      console.error('Error deleting schedule request:', error);
      setSuccess('');
      setError(error.response?.data?.message || 'Failed to delete schedule request');
    } finally {
      setDeleteLoading(null); // Clear loading state
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'primary';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckIcon />;
      case 'rejected':
        return <CancelIcon />;
      case 'pending':
        return <PendingIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        height: 'fit-content'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Schedule Requests
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
            sx={{
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            New Request
          </Button>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Schedule Requests List */}
        {requestsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : scheduleRequests.length > 0 ? (
          <Stack spacing={2}>
            {scheduleRequests.map((request) => (
              <Paper
                key={request._id}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: alpha(theme.palette.divider, 0.5),
                  borderRadius: 2,
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Chip
                        icon={getStatusIcon(request.status)}
                        label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        size="small"
                        color={getStatusColor(request.status)}
                        variant="filled"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {request.scheduleSlots.length} schedule slots
                      </Typography>
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Effective Date: {format(parseISO(request.effectiveDate), 'MMM dd, yyyy')}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Requested: {format(parseISO(request.requestedDate || request.createdAt), 'MMM dd, yyyy')}
                    </Typography>

                    {request.adminComments && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        <Typography variant="caption">
                          <strong>Admin Comments:</strong> {request.adminComments}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                  
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedRequest(request);
                          setViewDialog(true);
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {/* Show delete button for all requests (temporarily for testing) */}
                    <Tooltip title={`Delete Request (Status: ${request.status})`}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteRequest(request._id)}
                          disabled={request.status === 'approved' || deleteLoading === request._id}
                        >
                          {deleteLoading === request._id ? (
                            <CircularProgress size={16} color="error" />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Alert severity="info">
            No schedule requests found. Create your first schedule request to get started.
          </Alert>
        )}
      </CardContent>

      {/* Create Schedule Request Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Create Schedule Request
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Submit a new schedule for admin approval
          </Typography>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Effective Date"
                  type="date"
                  value={scheduleForm.effectiveDate}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Schedule Slots
                </Typography>
                
                {scheduleForm.scheduleSlots.map((slot, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                          <InputLabel>Day</InputLabel>
                          <Select
                            value={slot.day}
                            onChange={(e) => handleSlotChange(index, 'day', e.target.value)}
                            label="Day"
                          >
                            {daysOfWeek.map(day => (
                              <MenuItem key={day} value={day}>{day}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={6} sm={3} md={2}>
                        <TextField
                          fullWidth
                          label="Start Time"
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={6} sm={3} md={2}>
                        <TextField
                          fullWidth
                          label="End Time"
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={6} sm={6} md={2}>
                        <TextField
                          fullWidth
                          label="Max Patients"
                          type="number"
                          value={slot.maxPatients}
                          onChange={(e) => handleSlotChange(index, 'maxPatients', parseInt(e.target.value))}
                          inputProps={{ min: 1, max: 50 }}
                        />
                      </Grid>
                      
                      <Grid item xs={6} sm={6} md={3}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => removeSlot(index)}
                            disabled={scheduleForm.scheduleSlots.length === 1}
                          >
                            Remove
                          </Button>
                        </Stack>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="Break Start"
                          type="time"
                          value={slot.breakStartTime}
                          onChange={(e) => handleSlotChange(index, 'breakStartTime', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="Break End"
                          type="time"
                          value={slot.breakEndTime}
                          onChange={(e) => handleSlotChange(index, 'breakEndTime', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addSlot}
                  sx={{ mt: 1 }}
                >
                  Add Schedule Slot
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setCreateDialog(false)} disabled={submitLoading}>
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={submitLoading}
              startIcon={submitLoading ? <CircularProgress size={20} /> : null}
            >
              Submit Request
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Schedule Request Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Schedule Request Details
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    icon={getStatusIcon(selectedRequest.status)}
                    label={selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    color={getStatusColor(selectedRequest.status)}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Effective Date</Typography>
                  <Typography variant="body1">
                    {format(parseISO(selectedRequest.effectiveDate), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Schedule Slots
              </Typography>
              
              <Stack spacing={2}>
                {selectedRequest.scheduleSlots.map((slot, index) => (
                  <Paper key={index} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={2}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {slot.day}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <TimeIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {slot.startTime} - {slot.endTime}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Max: {slot.maxPatients} patients
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        {slot.breakStartTime && slot.breakEndTime && (
                          <Typography variant="caption" color="text.secondary">
                            Break: {slot.breakStartTime} - {slot.breakEndTime}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Stack>

              {selectedRequest.adminComments && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Admin Comments:</strong> {selectedRequest.adminComments}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default DoctorScheduleManager;