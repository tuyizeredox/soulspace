import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import axios from '../../../utils/axiosConfig';

const DoctorScheduleManagement = ({ doctors, onRefresh, onSuccess, onError }) => {
  const theme = useTheme();
  const { token } = useSelector((state) => state.userAuth);
  
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctorSchedules, setDoctorSchedules] = useState({});
  const [loading, setLoading] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [viewScheduleDialog, setViewScheduleDialog] = useState(false);
  const [selectedScheduleRequest, setSelectedScheduleRequest] = useState(null);
  const [deleteScheduleDialog, setDeleteScheduleDialog] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState(false);

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

  // Fetch doctor schedules
  const fetchDoctorSchedules = async (doctorId) => {
    if (!doctorId) return;
    
    try {
      setLoading(true);
      console.log('Fetching schedules for doctor ID:', doctorId);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`/api/doctors/${doctorId}/schedules`, config);
      console.log('Schedule response:', response.data);
      setDoctorSchedules(prev => ({
        ...prev,
        [doctorId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching schedules:', error);
      console.error('Error details:', error.response?.data);
      onError('Failed to fetch doctor schedules');
    } finally {
      setLoading(false);
    }
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctorId) => {
    console.log('Doctor selected:', doctorId);
    console.log('Available doctors:', doctors);
    setSelectedDoctor(doctorId);
    if (doctorId) {
      fetchDoctorSchedules(doctorId);
    }
  };

  // Handle schedule slot changes
  const handleSlotChange = (index, field, value) => {
    setScheduleForm(prev => ({
      ...prev,
      scheduleSlots: prev.scheduleSlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  // Add new schedule slot
  const addScheduleSlot = () => {
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

  // Remove schedule slot
  const removeScheduleSlot = (index) => {
    if (scheduleForm.scheduleSlots.length > 1) {
      setScheduleForm(prev => ({
        ...prev,
        scheduleSlots: prev.scheduleSlots.filter((_, i) => i !== index)
      }));
    }
  };

  // Submit schedule request
  const handleScheduleSubmit = async () => {
    if (!selectedDoctor || !scheduleForm.effectiveDate) {
      onError('Please select doctor and effective date');
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const payload = {
        doctorId: selectedDoctor,
        ...scheduleForm
      };

      if (editingSchedule) {
        await axios.put(`/api/doctors/schedule-requests/${editingSchedule._id}`, payload, config);
        onSuccess('Schedule request updated successfully');
      } else {
        await axios.post('/api/doctors/schedule-requests', payload, config);
        onSuccess('Schedule request submitted for approval');
      }

      setScheduleDialog(false);
      resetScheduleForm();
      fetchDoctorSchedules(selectedDoctor);
      onRefresh();
    } catch (error) {
      console.error('Error submitting schedule:', error);
      onError(error.response?.data?.message || 'Failed to submit schedule request');
    } finally {
      setLoading(false);
    }
  };

  // Reset schedule form
  const resetScheduleForm = () => {
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
    setEditingSchedule(null);
  };

  // Delete doctor's current schedule
  const handleDeleteSchedule = async () => {
    if (!selectedDoctor) {
      onError('No doctor selected');
      return;
    }

    try {
      setDeletingSchedule(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/doctors/${selectedDoctor}/schedule`, config);
      
      onSuccess('Doctor schedule deleted successfully');
      setDeleteScheduleDialog(false);
      fetchDoctorSchedules(selectedDoctor);
      onRefresh();
      
    } catch (error) {
      console.error('Error deleting schedule:', error);
      onError(error.response?.data?.message || 'Failed to delete doctor schedule');
    } finally {
      setDeletingSchedule(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteScheduleDialog = () => {
    setDeleteScheduleDialog(true);
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
      case 'expired':
        return 'default';
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

  const selectedDoctorData = doctors.find(doc => (doc.id || doc._id) === selectedDoctor);
  const scheduleData = doctorSchedules[selectedDoctor] || { current: [], requests: [] };

  return (
    <Box>
      {/* Doctor Selection */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Doctor</InputLabel>
                <Select
                  value={selectedDoctor}
                  onChange={(e) => handleDoctorSelect(e.target.value)}
                  label="Select Doctor"
                >
                  {doctors.map(doctor => (
                    <MenuItem key={doctor.id || doctor._id} value={doctor.id || doctor._id}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <PersonIcon color="action" />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {doctor.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {doctor.specialization}
                          </Typography>
                        </Box>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setScheduleDialog(true)}
                  disabled={!selectedDoctor}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Create Schedule Request
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Schedule Content */}
      {selectedDoctor && (
        <Grid container spacing={3}>
          {/* Current Schedule */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ borderRadius: 2, height: 'fit-content' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckIcon color="success" />
                    <Typography variant="h6" fontWeight="bold">
                      Current Approved Schedule
                    </Typography>
                  </Stack>
                  {scheduleData.current && scheduleData.current.length > 0 && (
                    <Tooltip title="Delete current schedule">
                      <IconButton
                        color="error"
                        onClick={openDeleteScheduleDialog}
                        size="small"
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1)
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : scheduleData.current && scheduleData.current.length > 0 ? (
                  <Stack spacing={2}>
                    {scheduleData.current.map((slot, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: alpha(theme.palette.success.main, 0.3),
                          background: alpha(theme.palette.success.main, 0.05)
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {slot.day}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
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
                          <Grid item xs={12} sm={2}>
                            <Chip
                              label={slot.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              color={slot.isActive ? 'success' : 'default'}
                            />
                          </Grid>
                          {slot.breakStartTime && slot.breakEndTime && (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary">
                                Break: {slot.breakStartTime} - {slot.breakEndTime}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      No approved schedule found. Create a schedule request to get started.
                    </Alert>
                    {/* Debug info */}
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="caption">
                        Debug: Selected Doctor: {selectedDoctor}<br/>
                        Schedule Data: {JSON.stringify(scheduleData, null, 2)}
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Schedule Requests */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ borderRadius: 2, height: 'fit-content' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <PendingIcon color="warning" />
                  <Typography variant="h6" fontWeight="bold">
                    Schedule Requests
                  </Typography>
                  {scheduleData.requests.filter(req => req.status === 'pending').length > 0 && (
                    <Badge
                      badgeContent={scheduleData.requests.filter(req => req.status === 'pending').length}
                      color="error"
                    />
                  )}
                </Stack>

                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : scheduleData.requests.length > 0 ? (
                  <Stack spacing={2}>
                    {scheduleData.requests.map((request) => (
                      <Paper
                        key={request._id}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: alpha(theme.palette[getStatusColor(request.status)].main, 0.3),
                          background: alpha(theme.palette[getStatusColor(request.status)].main, 0.05)
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                              {getStatusIcon(request.status)}
                              <Chip
                                label={request.status.toUpperCase()}
                                size="small"
                                color={getStatusColor(request.status)}
                              />
                            </Stack>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Effective Date: {format(parseISO(request.effectiveDate), 'MMM dd, yyyy')}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Requested: {format(parseISO(request.requestedDate), 'MMM dd, yyyy')}
                            </Typography>
                            
                            <Typography variant="caption" color="text.secondary">
                              {request.scheduleSlots.length} schedule slots
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
                                  setSelectedScheduleRequest(request);
                                  setViewScheduleDialog(true);
                                }}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {request.status === 'pending' && (
                              <Tooltip title="Edit Request">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingSchedule(request);
                                    setScheduleForm({
                                      effectiveDate: request.effectiveDate,
                                      scheduleSlots: request.scheduleSlots
                                    });
                                    setScheduleDialog(true);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      No schedule requests found.
                    </Alert>
                    {/* Debug info */}
                    <Alert severity="info">
                      <Typography variant="caption">
                        Debug: Requests Length: {scheduleData.requests?.length || 0}<br/>
                        Requests Data: {JSON.stringify(scheduleData.requests, null, 2)}
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* No Doctor Selected */}
      {!selectedDoctor && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a Doctor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a doctor from the dropdown above to view and manage their schedules.
          </Typography>
        </Paper>
      )}

      {/* Schedule Request Dialog */}
      <Dialog
        open={scheduleDialog}
        onClose={() => setScheduleDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {editingSchedule ? 'Edit Schedule Request' : 'Create Schedule Request'}
          </Typography>
          {selectedDoctorData && (
            <Typography variant="body2" color="text.secondary">
              for Dr. {selectedDoctorData.name} ({selectedDoctorData.specialization})
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ py: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Effective Date"
                type="date"
                value={scheduleForm.effectiveDate}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                required
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Schedule Slots
          </Typography>

          {scheduleForm.scheduleSlots.map((slot, index) => (
            <Accordion key={index} sx={{ mb: 2, borderRadius: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {slot.day}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {slot.startTime} - {slot.endTime}
                  </Typography>
                  <Chip
                    label={slot.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={slot.isActive ? 'success' : 'default'}
                  />
                  {scheduleForm.scheduleSlots.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeScheduleSlot(index);
                      }}
                      color="error"
                      sx={{ ml: 'auto' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
              </AccordionSummary>
              
              <AccordionDetails>
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
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Start Time"
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="End Time"
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Max Patients"
                      type="number"
                      value={slot.maxPatients}
                      onChange={(e) => handleSlotChange(index, 'maxPatients', parseInt(e.target.value) || 10)}
                      inputProps={{ min: 1, max: 50 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Slot Duration (min)"
                      type="number"
                      value={slot.slotDuration}
                      onChange={(e) => handleSlotChange(index, 'slotDuration', parseInt(e.target.value) || 30)}
                      inputProps={{ min: 15, max: 120, step: 15 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Break Start"
                      type="time"
                      value={slot.breakStartTime}
                      onChange={(e) => handleSlotChange(index, 'breakStartTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Break End"
                      type="time"
                      value={slot.breakEndTime}
                      onChange={(e) => handleSlotChange(index, 'breakEndTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={slot.isActive}
                        onChange={(e) => handleSlotChange(index, 'isActive', e.target.value)}
                        label="Status"
                      >
                        <MenuItem value={true}>Active</MenuItem>
                        <MenuItem value={false}>Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addScheduleSlot}
            sx={{ mt: 2 }}
          >
            Add Schedule Slot
          </Button>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setScheduleDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleScheduleSubmit}
            variant="contained"
            disabled={loading || !scheduleForm.effectiveDate}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Submitting...' : (editingSchedule ? 'Update Request' : 'Submit Request')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Schedule Request Dialog */}
      <Dialog
        open={viewScheduleDialog}
        onClose={() => setViewScheduleDialog(false)}
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
          {selectedScheduleRequest && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Status:</strong>
                  </Typography>
                  <Chip
                    label={selectedScheduleRequest.status.toUpperCase()}
                    color={getStatusColor(selectedScheduleRequest.status)}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Effective Date:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {format(parseISO(selectedScheduleRequest.effectiveDate), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Schedule Slots
              </Typography>
              
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Max Patients</TableCell>
                      <TableCell>Slot Duration</TableCell>
                      <TableCell>Break Time</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedScheduleRequest.scheduleSlots.map((slot, index) => (
                      <TableRow key={index}>
                        <TableCell>{slot.day}</TableCell>
                        <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                        <TableCell>{slot.maxPatients}</TableCell>
                        <TableCell>{slot.slotDuration} min</TableCell>
                        <TableCell>
                          {slot.breakStartTime && slot.breakEndTime 
                            ? `${slot.breakStartTime} - ${slot.breakEndTime}`
                            : 'No break'
                          }
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={slot.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={slot.isActive ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedScheduleRequest.adminComments && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Admin Comments:</strong> {selectedScheduleRequest.adminComments}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setViewScheduleDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Schedule Confirmation Dialog */}
      <Dialog
        open={deleteScheduleDialog}
        onClose={() => setDeleteScheduleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DeleteIcon color="error" />
            <Typography variant="h6" fontWeight="bold">
              Delete Doctor Schedule
            </Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action cannot be undone. The doctor's current schedule will be permanently deleted.
            </Typography>
          </Alert>
          
          {selectedDoctorData && (
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Doctor Information:
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {selectedDoctorData.name}
              </Typography>
              <Typography variant="body2">
                <strong>Specialization:</strong> {selectedDoctorData.specialization || 'General'}
              </Typography>
              <Typography variant="body2">
                <strong>Department:</strong> {selectedDoctorData.department || 'General'}
              </Typography>
            </Box>
          )}
          
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this doctor's current schedule? This will:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2, mt: 1 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              Remove all current schedule slots
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Cancel any upcoming appointments based on this schedule
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Notify the doctor about the schedule deletion
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Require the doctor to submit a new schedule request
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setDeleteScheduleDialog(false)}
            disabled={deletingSchedule}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSchedule}
            disabled={deletingSchedule}
            startIcon={deletingSchedule ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deletingSchedule ? 'Deleting...' : 'Delete Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorScheduleManagement;