import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Button,
  Grid,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useTheme,
  alpha,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  LocalHospital as HospitalIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import axios from '../../../utils/axiosConfig';

const DoctorList = ({ doctors, loading, onEdit, onRefresh, onSuccess, onError }) => {
  const theme = useTheme();
  const { token } = useSelector((state) => state.userAuth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Get unique values for filters
  const uniqueSpecializations = useMemo(() => {
    const specs = doctors.map(doc => doc.specialization || 'General').filter(Boolean);
    return [...new Set(specs)].sort();
  }, [doctors]);

  const uniqueDepartments = useMemo(() => {
    const depts = doctors.map(doc => doc.department || 'General').filter(Boolean);
    return [...new Set(depts)].sort();
  }, [doctors]);

  // Filter doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = !searchQuery || 
        doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.department?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || doctor.status === statusFilter;
      const matchesSpecialization = specializationFilter === 'all' || doctor.specialization === specializationFilter;
      const matchesDepartment = departmentFilter === 'all' || doctor.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesSpecialization && matchesDepartment;
    });
  }, [doctors, searchQuery, statusFilter, specializationFilter, departmentFilter]);

  // Handle delete doctor
  const handleDelete = async () => {
    if (!doctorToDelete) return;
    
    try {
      setDeleteLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.delete(`/api/doctors/${doctorToDelete._id || doctorToDelete.id}`, config);
      onSuccess('Doctor deleted successfully');
      setDeleteDialog(false);
      setDoctorToDelete(null);
      onRefresh();
      
    } catch (error) {
      console.error('Error deleting doctor:', error);
      onError(error.response?.data?.message || 'Failed to delete doctor');
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSpecializationFilter('all');
    setDepartmentFilter('all');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'primary';
    }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Specialization</InputLabel>
                <Select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  label="Specialization"
                >
                  <MenuItem value="all">All Specializations</MenuItem>
                  {uniqueSpecializations.map(spec => (
                    <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Department"
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {uniqueDepartments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Grid>
          <Grid item xs={12} md={2}>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                disabled={!searchQuery && statusFilter === 'all' && specializationFilter === 'all' && departmentFilter === 'all'}
              >
                Clear
              </Button>
            </Stack>
          </Grid>
        </Grid>
        
        {/* Results count */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </Typography>
        </Box>
      </Paper>

      {/* Doctors Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          <AnimatePresence>
            {filteredDoctors.map((doctor) => (
              <Grid item xs={12} sm={6} lg={4} key={doctor._id || doctor.id}>
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
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Header */}
                      <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
                        <Avatar
                          src={doctor.profileImage}
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: theme.palette.primary.main,
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {doctor.name?.charAt(0)?.toUpperCase() || 'D'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography variant="h6" fontWeight="bold" noWrap>
                              {doctor.name}
                            </Typography>
                            {doctor.isVerified && (
                              <VerifiedIcon color="primary" fontSize="small" />
                            )}
                          </Stack>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {doctor.specialization || 'General Medicine'}
                          </Typography>
                          <Chip
                            label={doctor.status || 'active'}
                            size="small"
                            color={getStatusColor(doctor.status)}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Stack>

                      {/* Info */}
                      <Stack spacing={1.5} sx={{ mb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <HospitalIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {doctor.department || 'General'}
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {doctor.email}
                          </Typography>
                        </Stack>
                        
                        {doctor.phone && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {doctor.phone}
                            </Typography>
                          </Stack>
                        )}
                        
                        {doctor.experience && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <StarIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {doctor.experience} years experience
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      {/* Actions */}
                      <Stack direction="row" spacing={1} justifyContent="space-between">
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setViewDialog(true);
                              }}
                              sx={{
                                color: theme.palette.info.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.info.main, 0.1)
                                }
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Edit Doctor">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(doctor)}
                              sx={{
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete Doctor">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setDoctorToDelete(doctor);
                                setDeleteDialog(true);
                              }}
                              sx={{
                                color: theme.palette.error.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.error.main, 0.1)
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            icon={<ScheduleIcon />}
                            label={doctor.currentSchedule?.length || 0}
                            size="small"
                            variant="outlined"
                            title="Active Schedules"
                          />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      </motion.div>

      {/* No results */}
      {filteredDoctors.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <HospitalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No doctors found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {doctors.length === 0 
              ? "No doctors have been added yet. Click 'Add Doctor' to get started."
              : "Try adjusting your search filters to find doctors."
            }
          </Typography>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Doctor</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete Dr. {doctorToDelete?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : null}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Doctor Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              src={selectedDoctor?.profileImage}
              sx={{
                width: 48,
                height: 48,
                bgcolor: theme.palette.primary.main
              }}
            >
              {selectedDoctor?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">Dr. {selectedDoctor?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDoctor?.specialization}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedDoctor && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Contact Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedDoctor.email}
                  </Typography>
                  {selectedDoctor.phone && (
                    <Typography variant="body2">
                      <strong>Phone:</strong> {selectedDoctor.phone}
                    </Typography>
                  )}
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Professional Details
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Department:</strong> {selectedDoctor.department || 'General'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Experience:</strong> {selectedDoctor.experience || 0} years
                  </Typography>
                  {selectedDoctor.licenseNumber && (
                    <Typography variant="body2">
                      <strong>License:</strong> {selectedDoctor.licenseNumber}
                    </Typography>
                  )}
                </Stack>
              </Grid>
              
              {selectedDoctor.qualifications && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Qualifications
                  </Typography>
                  <Typography variant="body2">
                    {selectedDoctor.qualifications}
                  </Typography>
                </Grid>
              )}
              
              {selectedDoctor.bio && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Biography
                  </Typography>
                  <Typography variant="body2">
                    {selectedDoctor.bio}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setViewDialog(false);
              onEdit(selectedDoctor);
            }}
            startIcon={<EditIcon />}
          >
            Edit Doctor
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorList;