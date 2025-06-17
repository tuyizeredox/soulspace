import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Stack,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import axios from '../../../utils/axiosConfig';

const ScheduleApprovalQueue = ({ pendingSchedules, onRefresh, onSuccess, onError }) => {
  const theme = useTheme();
  const { token } = useSelector((state) => state.userAuth);
  
  const [loading, setLoading] = useState(false);
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [adminComments, setAdminComments] = useState('');
  const [viewDialog, setViewDialog] = useState(false);

  // Handle approve/reject action
  const handleScheduleAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const payload = {
        status: actionType === 'approve' ? 'approved' : 'rejected',
        adminComments: adminComments.trim()
      };

      await axios.put(`/api/doctors/schedule-requests/${selectedRequest._id}/status`, payload, config);
      
      onSuccess(`Schedule request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setActionDialog(false);
      resetDialog();
      onRefresh();
      
    } catch (error) {
      console.error('Error updating schedule request:', error);
      onError(error.response?.data?.message || 'Failed to update schedule request');
    } finally {
      setLoading(false);
    }
  };

  // Reset dialog state
  const resetDialog = () => {
    setSelectedRequest(null);
    setActionType('');
    setAdminComments('');
  };

  // Open action dialog
  const openActionDialog = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setActionDialog(true);
  };

  // Open view dialog
  const openViewDialog = (request) => {
    setSelectedRequest(request);
    setViewDialog(true);
  };

  // Calculate total time slots
  const calculateTotalSlots = (scheduleSlots) => {
    return scheduleSlots.reduce((total, slot) => {
      if (!slot.isActive) return total;
      
      const startTime = new Date(`2000-01-01T${slot.startTime}:00`);
      const endTime = new Date(`2000-01-01T${slot.endTime}:00`);
      const totalMinutes = (endTime - startTime) / (1000 * 60);
      
      // Subtract break time if present
      let breakMinutes = 0;
      if (slot.breakStartTime && slot.breakEndTime) {
        const breakStart = new Date(`2000-01-01T${slot.breakStartTime}:00`);
        const breakEnd = new Date(`2000-01-01T${slot.breakEndTime}:00`);
        breakMinutes = (breakEnd - breakStart) / (1000 * 60);
      }
      
      const workingMinutes = totalMinutes - breakMinutes;
      const slotsPerDay = Math.floor(workingMinutes / (slot.slotDuration || 30));
      
      return total + slotsPerDay;
    }, 0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (pendingSchedules.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Pending Schedule Requests
        </Typography>
        <Typography variant="body2" color="text.secondary">
          All schedule requests have been processed. New requests will appear here for approval.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          <AnimatePresence>
            {pendingSchedules.map((request) => (
              <Grid item xs={12} lg={6} key={request._id}>
                <motion.div
                  variants={cardVariants}
                  layout
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 2,
                      boxShadow: theme.shadows[2],
                      border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                        transform: 'translateY(-4px)',
                        border: `2px solid ${alpha(theme.palette.warning.main, 0.5)}`
                      }
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      {/* Header */}
                      <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
                        <Avatar
                          src={request.doctor?.profileImage}
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: theme.palette.primary.main,
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {request.doctor?.name?.charAt(0)?.toUpperCase() || 'D'}
                        </Avatar>
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" fontWeight="bold" noWrap>
                            Dr. {request.doctor?.name || 'Unknown Doctor'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {request.doctor?.specialization || 'General Medicine'}
                          </Typography>
                          <Chip
                            label="PENDING APPROVAL"
                            size="small"
                            color="warning"
                            sx={{ mt: 0.5, fontWeight: 'bold' }}
                          />
                        </Box>
                      </Stack>

                      {/* Request Details */}
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Effective Date
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {format(parseISO(request.effectiveDate), 'MMM dd, yyyy')}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ScheduleIcon fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Schedule Slots
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {request.scheduleSlots?.length || 0} days
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <TimeIcon fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Total Slots/Week
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                ~{calculateTotalSlots(request.scheduleSlots || [])}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PersonIcon fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Requested
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {format(parseISO(request.requestedDate || request.createdAt), 'MMM dd')}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>

                      {/* Schedule Preview */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Schedule Preview:
                        </Typography>
                        <Stack spacing={1}>
                          {(request.scheduleSlots || []).slice(0, 3).map((slot, index) => (
                            <Paper
                              key={index}
                              sx={{
                                p: 1.5,
                                bgcolor: alpha(theme.palette.info.main, 0.05),
                                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                              }}
                            >
                              <Grid container alignItems="center" spacing={1}>
                                <Grid item xs={3}>
                                  <Typography variant="caption" fontWeight="bold">
                                    {slot.day}
                                  </Typography>
                                </Grid>
                                <Grid item xs={5}>
                                  <Typography variant="caption">
                                    {slot.startTime} - {slot.endTime}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography variant="caption" color="text.secondary">
                                    Max: {slot.maxPatients}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Paper>
                          ))}
                          {(request.scheduleSlots || []).length > 3 && (
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                              +{request.scheduleSlots.length - 3} more days
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      <Divider sx={{ my: 2 }} />
                    </CardContent>

                    {/* Actions */}
                    <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => openViewDialog(request)}
                        sx={{ textTransform: 'none' }}
                      >
                        View Details
                      </Button>
                      
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<RejectIcon />}
                          onClick={() => openActionDialog(request, 'reject')}
                          sx={{ textTransform: 'none' }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<ApproveIcon />}
                          onClick={() => openActionDialog(request, 'approve')}
                          sx={{ textTransform: 'none' }}
                        >
                          Approve
                        </Button>
                      </Stack>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      </motion.div>

      {/* Action Dialog (Approve/Reject) */}
      <Dialog
        open={actionDialog}
        onClose={() => setActionDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            {actionType === 'approve' ? (
              <ApproveIcon color="success" />
            ) : (
              <RejectIcon color="error" />
            )}
            <Typography variant="h6" fontWeight="bold">
              {actionType === 'approve' ? 'Approve' : 'Reject'} Schedule Request
            </Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Alert severity={actionType === 'approve' ? 'success' : 'warning'} sx={{ mb: 2 }}>
                {actionType === 'approve' 
                  ? 'This schedule will be activated and replace any existing schedule for this doctor.'
                  : 'This schedule request will be rejected and the doctor will be notified.'
                }
              </Alert>
              
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar
                  src={selectedRequest.doctor?.profileImage}
                  sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main }}
                >
                  {selectedRequest.doctor?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Dr. {selectedRequest.doctor?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRequest.doctor?.specialization}
                  </Typography>
                </Box>
              </Stack>
              
              <TextField
                fullWidth
                label="Admin Comments"
                multiline
                rows={3}
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                placeholder={`Add ${actionType === 'approve' ? 'approval' : 'rejection'} notes (optional)...`}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setActionDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleScheduleAction}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Processing...' : `${actionType === 'approve' ? 'Approve' : 'Reject'} Request`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
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
              {/* Doctor Info */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Avatar
                  src={selectedRequest.doctor?.profileImage}
                  sx={{ width: 56, height: 56, bgcolor: theme.palette.primary.main }}
                >
                  {selectedRequest.doctor?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Dr. {selectedRequest.doctor?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRequest.doctor?.specialization} • {selectedRequest.doctor?.department}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Experience: {selectedRequest.doctor?.experience || 0} years
                  </Typography>
                </Box>
              </Stack>

              {/* Request Details */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Effective Date:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {format(parseISO(selectedRequest.effectiveDate), 'EEEE, MMM dd, yyyy')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Requested Date:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {format(parseISO(selectedRequest.requestedDate || selectedRequest.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
              </Grid>

              {/* Schedule Details */}
              <Typography variant="h6" gutterBottom>
                Proposed Schedule
              </Typography>
              
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Day</strong></TableCell>
                      <TableCell><strong>Working Hours</strong></TableCell>
                      <TableCell><strong>Break Time</strong></TableCell>
                      <TableCell><strong>Max Patients</strong></TableCell>
                      <TableCell><strong>Slot Duration</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedRequest.scheduleSlots || []).map((slot, index) => (
                      <TableRow key={index}>
                        <TableCell>{slot.day}</TableCell>
                        <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                        <TableCell>
                          {slot.breakStartTime && slot.breakEndTime 
                            ? `${slot.breakStartTime} - ${slot.breakEndTime}`
                            : 'No break'
                          }
                        </TableCell>
                        <TableCell>{slot.maxPatients}</TableCell>
                        <TableCell>{slot.slotDuration} minutes</TableCell>
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
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setViewDialog(false)}>
            Close
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            onClick={() => {
              setViewDialog(false);
              openActionDialog(selectedRequest, 'reject');
            }}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            onClick={() => {
              setViewDialog(false);
              openActionDialog(selectedRequest, 'approve');
            }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleApprovalQueue;