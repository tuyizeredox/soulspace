import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  alpha
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  Visibility as ViewIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  Medication as MedicationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, subMonths, isWithinInterval } from 'date-fns';
import { motion } from 'framer-motion';
import axios from '../../../utils/axiosConfig';
import { isAuthenticated, ensureValidToken, getStoredUserId } from '../../../utils/tokenManager';

const PrescriptionHistory = ({ isActive = false }) => {
  const theme = useTheme();
  
  // Safe color getter with fallbacks
  const getThemeColor = (colorPath, fallback) => {
    try {
      if (!theme || !theme.palette) {
        console.warn('Theme or theme.palette is not available, using fallback color');
        return fallback;
      }
      const colors = colorPath.split('.');
      let color = theme.palette;
      for (const c of colors) {
        color = color?.[c];
      }
      return color || fallback;
    } catch (error) {
      console.warn(`Error accessing theme color ${colorPath}:`, error);
      return fallback;
    }
  };

  // Safe alpha function with fallback
  const safeAlpha = (color, opacity) => {
    try {
      return alpha(color, opacity);
    } catch {
      // Fallback: convert hex to rgba manually
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  };
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [viewDialog, setViewDialog] = useState({ open: false, prescription: null });
  const [timelineDialog, setTimelineDialog] = useState({ open: false, patient: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API function to fetch prescription history
  const fetchPrescriptionHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      // Ensure token is valid
      const isValidToken = await ensureValidToken();
      if (!isValidToken) {
        throw new Error('Invalid authentication token');
      }

      // Get doctor's ID
      const doctorId = getStoredUserId();
      if (!doctorId) {
        throw new Error('Doctor ID not found');
      }

      // Fetch prescription history from API
      // Note: This endpoint should return all prescriptions created by this doctor
      console.log('Fetching prescription history for doctor:', doctorId);
      const response = await axios.get(`/api/prescriptions/doctor/${doctorId}`);
      const prescriptionsData = response.data || [];
      console.log('Received prescription data:', prescriptionsData.length, 'prescriptions');

      // Transform API data to match component structure
      const transformedPrescriptions = prescriptionsData.map(prescription => {
        // Safely extract patient information
        const patientData = prescription.patient || {};
        const patientId = patientData._id || patientData.id || prescription.patientId;
        const patientName = patientData.name || prescription.patientName || 'Unknown Patient';
        
        // Safely parse dates
        const createdDate = prescription.createdDate || prescription.createdAt;
        const parsedCreatedDate = createdDate ? new Date(createdDate) : new Date();
        
        const completedDate = prescription.completedDate;
        const parsedCompletedDate = completedDate ? new Date(completedDate) : null;
        
        // Ensure medications is an array
        const medications = Array.isArray(prescription.medications) ? prescription.medications : [];
        
        return {
          id: prescription._id || prescription.id || Math.random().toString(36).substr(2, 9),
          prescriptionNumber: prescription.prescriptionNumber || `RX-${(prescription._id || prescription.id)?.slice(-6) || 'UNKNOWN'}`,
          patient: {
            id: patientId,
            name: patientName,
            age: patientData.age || 'N/A',
            avatar: patientData.avatar || patientData.profileImage || null
          },
          diagnosis: prescription.diagnosis || 'No diagnosis specified',
          medications: medications,
          status: prescription.status || 'active',
          createdDate: parsedCreatedDate,
          completedDate: parsedCompletedDate,
          prescribedBy: prescription.prescribedBy || prescription.doctor?.name || 'Dr. Unknown',
          pharmacyFilled: prescription.pharmacyFilled || prescription.pharmacy || 'Not specified',
          refillsUsed: prescription.refillsUsed || 0,
          totalRefills: prescription.totalRefills || 0,
          notes: prescription.notes || '',
          priority: prescription.priority || 'normal'
        };
      });

      // Sort by creation date (newest first)
      const sortedPrescriptions = transformedPrescriptions.sort((a, b) => b.createdDate - a.createdDate);

      setPrescriptions(sortedPrescriptions);
      setFilteredPrescriptions(sortedPrescriptions);
      
      console.log('Successfully loaded', sortedPrescriptions.length, 'prescriptions');

    } catch (error) {
      console.error('Error fetching prescription history:', error);
      setError(error.message || 'Failed to fetch prescription history');
      
      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.location.href = '/login?expired=true';
        return;
      }
      
      // Set empty data on error
      setPrescriptions([]);
      setFilteredPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock prescription history data (fallback for development)
  const mockPrescriptions = [
    {
      id: 1,
      prescriptionNumber: 'RX-2024-001',
      patient: {
        id: 1,
        name: 'John Smith',
        age: 45,
        avatar: null
      },
      diagnosis: 'Hypertension',
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
        { name: 'Hydrochlorothiazide', dosage: '25mg', frequency: 'Once daily' }
      ],
      status: 'completed',
      createdDate: new Date('2024-01-15'),
      completedDate: new Date('2024-02-15'),
      prescribedBy: 'Dr. Johnson',
      pharmacyFilled: 'CVS Pharmacy',
      refillsUsed: 1,
      totalRefills: 3
    },
    {
      id: 2,
      prescriptionNumber: 'RX-2024-002',
      patient: {
        id: 2,
        name: 'Sarah Johnson',
        age: 32,
        avatar: null
      },
      diagnosis: 'Type 2 Diabetes',
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
      ],
      status: 'active',
      createdDate: new Date('2024-01-10'),
      completedDate: null,
      prescribedBy: 'Dr. Johnson',
      pharmacyFilled: 'Walgreens',
      refillsUsed: 0,
      totalRefills: 5
    },
    {
      id: 3,
      prescriptionNumber: 'RX-2024-003',
      patient: {
        id: 3,
        name: 'Michael Brown',
        age: 28,
        avatar: null
      },
      diagnosis: 'Acute Bronchitis',
      medications: [
        { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily' }
      ],
      status: 'completed',
      createdDate: new Date('2024-01-05'),
      completedDate: new Date('2024-01-12'),
      prescribedBy: 'Dr. Johnson',
      pharmacyFilled: 'Rite Aid',
      refillsUsed: 0,
      totalRefills: 0
    },
    {
      id: 4,
      prescriptionNumber: 'RX-2023-045',
      patient: {
        id: 1,
        name: 'John Smith',
        age: 45,
        avatar: null
      },
      diagnosis: 'Hypertension',
      medications: [
        { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' }
      ],
      status: 'discontinued',
      createdDate: new Date('2023-12-01'),
      completedDate: new Date('2023-12-31'),
      prescribedBy: 'Dr. Johnson',
      pharmacyFilled: 'CVS Pharmacy',
      refillsUsed: 2,
      totalRefills: 3
    },
    {
      id: 5,
      prescriptionNumber: 'RX-2023-038',
      patient: {
        id: 2,
        name: 'Sarah Johnson',
        age: 32,
        avatar: null
      },
      diagnosis: 'Anxiety',
      medications: [
        { name: 'Sertraline', dosage: '25mg', frequency: 'Once daily' }
      ],
      status: 'completed',
      createdDate: new Date('2023-11-15'),
      completedDate: new Date('2024-01-15'),
      prescribedBy: 'Dr. Johnson',
      pharmacyFilled: 'Walgreens',
      refillsUsed: 3,
      totalRefills: 3
    }
  ];

  useEffect(() => {
    fetchPrescriptionHistory();
  }, []);

  // Refetch data when component becomes active
  useEffect(() => {
    if (isActive && prescriptions.length === 0 && !loading) {
      console.log('History tab became active, refreshing data...');
      fetchPrescriptionHistory();
    }
  }, [isActive]);

  // Filter prescriptions based on search, status, date range, and patient
  useEffect(() => {
    let filtered = prescriptions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(prescription =>
        prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medications.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(prescription => prescription.status === statusFilter);
    }

    // Patient filter
    if (selectedPatient !== 'all') {
      filtered = filtered.filter(prescription => prescription.patient.id.toString() === selectedPatient);
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(prescription =>
        isWithinInterval(prescription.createdDate, {
          start: dateRange.start,
          end: dateRange.end
        })
      );
    }

    setFilteredPrescriptions(filtered);
  }, [prescriptions, searchTerm, statusFilter, selectedPatient, dateRange]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'discontinued': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'active': return safeAlpha(getThemeColor('success.main', '#2e7d32'), 0.12);
      case 'completed': return safeAlpha(getThemeColor('primary.main', '#1976d2'), 0.12);
      case 'discontinued': return safeAlpha(getThemeColor('warning.main', '#ed6c02'), 0.12);
      case 'cancelled': return safeAlpha(getThemeColor('error.main', '#d32f2f'), 0.12);
      default: return safeAlpha('#666666', 0.12);
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'active': return getThemeColor('success.main', '#2e7d32');
      case 'completed': return getThemeColor('primary.main', '#1976d2');
      case 'discontinued': return getThemeColor('warning.main', '#ed6c02');
      case 'cancelled': return getThemeColor('error.main', '#d32f2f');
      default: return '#666666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <ScheduleIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'discontinued': return <CancelIcon />;
      case 'cancelled': return <CancelIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const openViewDialog = (prescription) => {
    setViewDialog({ open: true, prescription });
  };

  const closeViewDialog = () => {
    setViewDialog({ open: false, prescription: null });
  };

  const openTimelineDialog = (patient) => {
    setTimelineDialog({ open: true, patient });
  };

  const closeTimelineDialog = () => {
    setTimelineDialog({ open: false, patient: null });
  };

  const getPatientPrescriptions = (patientId) => {
    return prescriptions
      .filter(p => p.patient.id === patientId)
      .sort((a, b) => b.createdDate - a.createdDate);
  };

  const uniquePatients = prescriptions.reduce((acc, prescription) => {
    if (!acc.find(p => p.id === prescription.patient.id)) {
      acc.push(prescription.patient);
    }
    return acc;
  }, []);

  const stats = {
    total: prescriptions.length,
    active: prescriptions.filter(p => p.status === 'active').length,
    completed: prescriptions.filter(p => p.status === 'completed').length,
    thisMonth: prescriptions.filter(p => 
      p.createdDate >= subMonths(new Date(), 1)
    ).length
  };

  // Loading state
  if (loading) {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
            Prescription History
          </Typography>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Loading prescription history...</Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Fetching data from server...
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </LocalizationProvider>
    );
  }

  // Error state
  if (error) {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
            Prescription History
          </Typography>
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: getThemeColor('error.main', '#d32f2f') }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CancelIcon sx={{ color: getThemeColor('error.main', '#d32f2f'), mr: 1 }} />
                <Typography variant="h6" sx={{ color: getThemeColor('error.main', '#d32f2f') }}>
                  Error Loading Prescription History
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {error}
              </Typography>
              <Button
                variant="contained"
                onClick={fetchPrescriptionHistory}
                startIcon={<SearchIcon />}
                sx={{
                  bgcolor: getThemeColor('primary.main', '#1976d2'),
                  color: 'white',
                  '&:hover': {
                    bgcolor: getThemeColor('primary.dark', '#1565c0')
                  }
                }}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </Box>
      </LocalizationProvider>
    );
  }

  try {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Prescription History
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              View and manage all prescription records {loading && '(Refreshing...)'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={fetchPrescriptionHistory}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
            >
              Print
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: getThemeColor('primary.main', '#1976d2') }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Prescriptions
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: safeAlpha(getThemeColor('primary.main', '#1976d2'), 0.1), 
                    color: getThemeColor('primary.main', '#1976d2')
                  }}>
                    <MedicationIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: getThemeColor('success.main', '#2e7d32') }}>
                      {stats.active}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: safeAlpha(getThemeColor('success.main', '#2e7d32'), 0.1), 
                    color: getThemeColor('success.main', '#2e7d32')
                  }}>
                    <CheckCircleIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: getThemeColor('info.main', '#0288d1') }}>
                      {stats.completed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: safeAlpha(getThemeColor('info.main', '#0288d1'), 0.1), 
                    color: getThemeColor('info.main', '#0288d1')
                  }}>
                    <HistoryIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: getThemeColor('warning.main', '#ed6c02') }}>
                      {stats.thisMonth}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Month
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: safeAlpha(getThemeColor('warning.main', '#ed6c02'), 0.1), 
                    color: getThemeColor('warning.main', '#ed6c02')
                  }}>
                    <TrendingUpIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="discontinued">Discontinued</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Patient</InputLabel>
                  <Select
                    value={selectedPatient}
                    label="Patient"
                    onChange={(e) => setSelectedPatient(e.target.value)}
                  >
                    <MenuItem value="all">All Patients</MenuItem>
                    {uniquePatients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id.toString()}>
                        {patient.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={(newValue) => setDateRange(prev => ({ ...prev, start: newValue }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <DatePicker
                  label="End Date"
                  value={dateRange.end}
                  onChange={(newValue) => setDateRange(prev => ({ ...prev, end: newValue }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setSelectedPatient('all');
                    setDateRange({ start: null, end: null });
                  }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Prescription History Table */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            {filteredPrescriptions.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: safeAlpha(getThemeColor('primary.main', '#1976d2'), 0.05) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Prescription #</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Diagnosis</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Medications</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date Created</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Pharmacy</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPrescriptions.map((prescription) => (
                    <TableRow key={prescription.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} sx={{ color: getThemeColor('primary.main', '#1976d2') }}>
                          {prescription.prescriptionNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={prescription.patient.avatar}
                            sx={{ width: 32, height: 32 }}
                          >
                            {prescription.patient.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {prescription.patient.name}
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => openTimelineDialog(prescription.patient)}
                              sx={{ p: 0, minWidth: 'auto', fontSize: '0.75rem' }}
                            >
                              View History
                            </Button>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {prescription.diagnosis}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {prescription.medications.slice(0, 2).map((med, index) => (
                            <Typography key={index} variant="caption" sx={{ display: 'block' }}>
                              {med.name} - {med.dosage}
                            </Typography>
                          ))}
                          {prescription.medications.length > 2 && (
                            <Typography variant="caption" color="text.secondary">
                              +{prescription.medications.length - 2} more
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(prescription.status)}
                          label={prescription.status}
                          size="small"
                          sx={{ 
                            textTransform: 'capitalize',
                            bgcolor: getStatusBgColor(prescription.status),
                            color: getStatusTextColor(prescription.status),
                            '& .MuiChip-icon': {
                              color: getStatusTextColor(prescription.status)
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(prescription.createdDate, 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {prescription.pharmacyFilled}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => openViewDialog(prescription)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print">
                            <IconButton size="small">
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <MedicationIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Prescription History Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {searchTerm || statusFilter !== 'all' || selectedPatient !== 'all' || dateRange.start
                    ? 'No prescriptions match your current filters. Try adjusting your search criteria.'
                    : 'You haven\'t created any prescriptions yet. Start by creating your first prescription.'
                  }
                </Typography>
                {(!searchTerm && statusFilter === 'all' && selectedPatient === 'all' && !dateRange.start) && (
                  <Button
                    variant="contained"
                    startIcon={<MedicationIcon />}
                    onClick={() => window.location.href = '/doctor/prescriptions'}
                  >
                    Create First Prescription
                  </Button>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* View Prescription Dialog */}
        <Dialog
          open={viewDialog.open}
          onClose={closeViewDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                Prescription Details
              </Typography>
              <IconButton onClick={closeViewDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {viewDialog.prescription && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Prescription Number
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                      {viewDialog.prescription.prescriptionNumber}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Patient
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar src={viewDialog.prescription.patient.avatar}>
                        {viewDialog.prescription.patient.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {viewDialog.prescription.patient.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Age: {viewDialog.prescription.patient.age}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Chip
                      icon={getStatusIcon(viewDialog.prescription.status)}
                      label={viewDialog.prescription.status}
                      sx={{ 
                        mb: 2, 
                        textTransform: 'capitalize',
                        bgcolor: getStatusBgColor(viewDialog.prescription.status),
                        color: getStatusTextColor(viewDialog.prescription.status),
                        '& .MuiChip-icon': {
                          color: getStatusTextColor(viewDialog.prescription.status)
                        }
                      }}
                    />
                    
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Diagnosis
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {viewDialog.prescription.diagnosis}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Medications
                </Typography>
                {viewDialog.prescription.medications.map((medication, index) => (
                  <Card key={index} sx={{ mb: 2, bgcolor: safeAlpha(getThemeColor('primary.main', '#1976d2'), 0.02) }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {medication.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {medication.dosage} - {medication.frequency}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
                
                <Divider sx={{ my: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Prescribed By
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {viewDialog.prescription.prescribedBy}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Pharmacy
                    </Typography>
                    <Typography variant="body1">
                      {viewDialog.prescription.pharmacyFilled}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Date Created
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {format(viewDialog.prescription.createdDate, 'MMMM dd, yyyy')}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Refills Used
                    </Typography>
                    <Typography variant="body1">
                      {viewDialog.prescription.refillsUsed} of {viewDialog.prescription.totalRefills}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeViewDialog}>Close</Button>
            <Button variant="contained" startIcon={<PrintIcon />}>
              Print
            </Button>
          </DialogActions>
        </Dialog>

        {/* Patient Timeline Dialog */}
        <Dialog
          open={timelineDialog.open}
          onClose={closeTimelineDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                Prescription History - {timelineDialog.patient?.name}
              </Typography>
              <IconButton onClick={closeTimelineDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {timelineDialog.patient && (
              <Timeline>
                {getPatientPrescriptions(timelineDialog.patient.id).map((prescription, index) => (
                  <TimelineItem key={prescription.id}>
                    <TimelineSeparator>
                      <TimelineDot color={getStatusColor(prescription.status)}>
                        {getStatusIcon(prescription.status)}
                      </TimelineDot>
                      {index < getPatientPrescriptions(timelineDialog.patient.id).length - 1 && (
                        <TimelineConnector />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Card sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {prescription.prescriptionNumber}
                            </Typography>
                            <Chip
                              label={prescription.status}
                              color={getStatusColor(prescription.status)}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {prescription.diagnosis}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {prescription.medications.map(med => med.name).join(', ')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(prescription.createdDate, 'MMMM dd, yyyy')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeTimelineDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
  } catch (renderError) {
    console.error('Error rendering PrescriptionHistory:', renderError);
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Component Render Error
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          There was an error displaying the prescription history. Please try refreshing the page.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ bgcolor: '#1976d2', color: 'white' }}
        >
          Refresh Page
        </Button>
      </Box>
    );
  }
};

export default PrescriptionHistory;