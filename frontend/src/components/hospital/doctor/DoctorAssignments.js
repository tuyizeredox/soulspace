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
  Stack,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalHospital as HospitalIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import axios from '../../../utils/axiosConfig';

const DoctorAssignments = ({ doctors, onRefresh, onSuccess, onError }) => {
  const theme = useTheme();
  const { token } = useSelector((state) => state.userAuth);
  
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [assignmentType, setAssignmentType] = useState('primary');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Fetch assignments and patients
  useEffect(() => {
    fetchAssignments();
    fetchPatients();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/patient-assignments/hospital', config);
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      onError('Failed to fetch doctor assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/patients/hospital', config);
      setPatients(response.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  // Handle assignment submission
  const handleAssignmentSubmit = async () => {
    if (!selectedDoctor || !selectedPatient) {
      onError('Please select both doctor and patient');
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const payload = {
        doctorId: selectedDoctor,
        patientId: selectedPatient,
        assignmentType,
        notes: assignmentNotes.trim()
      };

      if (editingAssignment) {
        await axios.put(`/api/patient-assignments/${editingAssignment._id}`, payload, config);
        onSuccess('Assignment updated successfully');
      } else {
        await axios.post('/api/patient-assignments', payload, config);
        onSuccess('Patient assigned to doctor successfully');
      }

      setAssignmentDialog(false);
      resetForm();
      fetchAssignments();
      onRefresh();
    } catch (error) {
      console.error('Error saving assignment:', error);
      onError(error.response?.data?.message || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete assignment
  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return;

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/patient-assignments/${assignmentId}`, config);
      onSuccess('Assignment removed successfully');
      fetchAssignments();
      onRefresh();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      onError('Failed to remove assignment');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedDoctor('');
    setSelectedPatient('');
    setAssignmentType('primary');
    setAssignmentNotes('');
    setEditingAssignment(null);
  };

  // Open edit dialog
  const openEditDialog = (assignment) => {
    setEditingAssignment(assignment);
    setSelectedDoctor(assignment.doctor?._id || '');
    setSelectedPatient(assignment.patient?._id || '');
    setAssignmentType(assignment.assignmentType || 'primary');
    setAssignmentNotes(assignment.notes || '');
    setAssignmentDialog(true);
  };

  // Get assignment type color
  const getAssignmentTypeColor = (type) => {
    switch (type) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'consultant':
        return 'info';
      case 'emergency':
        return 'error';
      default:
        return 'default';
    }
  };

  // Group assignments by doctor
  const assignmentsByDoctor = assignments.reduce((acc, assignment) => {
    const doctorId = assignment.doctor?._id;
    if (!acc[doctorId]) {
      acc[doctorId] = {
        doctor: assignment.doctor,
        assignments: []
      };
    }
    acc[doctorId].assignments.push(assignment);
    return acc;
  }, {});

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

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Doctor-Patient Assignments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage patient assignments to doctors
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAssignmentDialog(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none'
          }}
        >
          New Assignment
        </Button>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }}
                >
                  <AssignmentIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {assignments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Assignments
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main
                  }}
                >
                  <PersonIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {Object.keys(assignmentsByDoctor).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned Doctors
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main
                  }}
                >
                  <HospitalIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {assignments.filter(a => a.assignmentType === 'primary').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Primary Assignments
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main
                  }}
                >
                  <ScheduleIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {assignments.filter(a => a.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Assignments
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assignments by Doctor */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          <AnimatePresence>
            {Object.values(assignmentsByDoctor).map((doctorData) => (
              <Grid item xs={12} key={doctorData.doctor?._id}>
                <motion.div
                  variants={cardVariants}
                  layout
                >
                  <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
                    <CardContent>
                      {/* Doctor Header */}
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                        <Avatar
                          src={doctorData.doctor?.profileImage}
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: theme.palette.primary.main
                          }}
                        >
                          {doctorData.doctor?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            Dr. {doctorData.doctor?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doctorData.doctor?.specialization} • {doctorData.assignments.length} patient{doctorData.assignments.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${doctorData.assignments.length} Assignments`}
                          color="primary"
                          variant="outlined"
                        />
                      </Stack>

                      {/* Assignments Table */}
                      <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Patient</TableCell>
                              <TableCell>Assignment Type</TableCell>
                              <TableCell>Assigned Date</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Notes</TableCell>
                              <TableCell align="center">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {doctorData.assignments.map((assignment) => (
                              <TableRow key={assignment._id}>
                                <TableCell>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Avatar
                                      sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}
                                    >
                                      {assignment.patient?.name?.charAt(0)?.toUpperCase()}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold">
                                        {assignment.patient?.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {assignment.patient?.email}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={assignment.assignmentType}
                                    size="small"
                                    color={getAssignmentTypeColor(assignment.assignmentType)}
                                    sx={{ textTransform: 'capitalize' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {format(parseISO(assignment.assignedDate || assignment.createdAt), 'MMM dd, yyyy')}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={assignment.status || 'active'}
                                    size="small"
                                    color={assignment.status === 'active' ? 'success' : 'default'}
                                    sx={{ textTransform: 'capitalize' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ maxWidth: 150 }} noWrap>
                                    {assignment.notes || 'No notes'}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Stack direction="row" spacing={0.5} justifyContent="center">
                                    <Tooltip title="Edit Assignment">
                                      <IconButton
                                        size="small"
                                        onClick={() => openEditDialog(assignment)}
                                        color="primary"
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Remove Assignment">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDeleteAssignment(assignment._id)}
                                        color="error"
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      </motion.div>

      {/* No assignments */}
      {assignments.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Assignments Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start by creating patient-doctor assignments to manage care efficiently.
          </Typography>
        </Paper>
      )}

      {/* Loading */}
      {loading && assignments.length === 0 && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Assignment Dialog */}
      <Dialog
        open={assignmentDialog}
        onClose={() => setAssignmentDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {editingAssignment ? 'Edit Assignment' : 'New Patient Assignment'}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ py: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Doctor</InputLabel>
                <Select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  label="Select Doctor"
                >
                  {doctors.map(doctor => (
                    <MenuItem key={doctor._id} value={doctor._id}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}
                        >
                          {doctor.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            Dr. {doctor.name}
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
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Patient</InputLabel>
                <Select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  label="Select Patient"
                >
                  {patients.map(patient => (
                    <MenuItem key={patient._id} value={patient._id}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}
                        >
                          {patient.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {patient.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {patient.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assignment Type</InputLabel>
                <Select
                  value={assignmentType}
                  onChange={(e) => setAssignmentType(e.target.value)}
                  label="Assignment Type"
                >
                  <MenuItem value="primary">Primary Care Doctor</MenuItem>
                  <MenuItem value="secondary">Secondary Care</MenuItem>
                  <MenuItem value="consultant">Consultant</MenuItem>
                  <MenuItem value="emergency">Emergency Care</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assignment Notes"
                multiline
                rows={3}
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                placeholder="Add any relevant notes about this assignment..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAssignmentDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignmentSubmit}
            variant="contained"
            disabled={loading || !selectedDoctor || !selectedPatient}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Saving...' : (editingAssignment ? 'Update Assignment' : 'Create Assignment')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorAssignments;