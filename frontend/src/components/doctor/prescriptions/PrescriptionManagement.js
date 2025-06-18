import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
  LinearProgress,
  useTheme,
  useMediaQuery,
  alpha,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Send as SendIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocalPharmacy as PharmacyIcon,
  Medication as MedicationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import axios from '../../../utils/axiosConfig';
import { isAuthenticated, ensureValidToken, getStoredToken, getStoredUserId } from '../../../utils/tokenManager';

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  try {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    if (isNaN(birthDate.getTime())) return null;
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : null;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
};

const PrescriptionManagement = ({ isActive = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        console.warn('User not authenticated, redirecting to login');
        window.location.href = '/login?expired=true';
        return;
      }

      const token = getStoredToken();
      if (!token) {
        console.warn('No token found, redirecting to login');
        window.location.href = '/login?expired=true';
        return;
      }

      // Fix missing userId if needed
      let userId = getStoredUserId();
      if (!userId) {
        console.warn('No userId found, attempting to extract from user data');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData._id || userData.id) {
          userId = userData._id || userData.id;
          localStorage.setItem('userId', userId);

        } else {
          console.error('Could not find user ID anywhere, user may need to re-login');
        }
      }


    };

    checkAuth();
  }, []);

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('create'); // create, edit, view
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);

  // Form state for prescription creation/editing
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    patientName: '',
    diagnosis: '',
    medications: [
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: ''
      }
    ],
    notes: '',
    followUpDate: null,
    priority: 'normal',
    status: 'active'
  });

  // API service functions
  const fetchPrescriptions = async () => {
    try {
      // Check authentication before making API call
      if (!isAuthenticated()) {
        console.warn('User not authenticated, redirecting to login');
        window.location.href = '/login?expired=true';
        return [];
      }

      // Ensure token is valid
      const isValidToken = await ensureValidToken();
      if (!isValidToken) {
        console.warn('Invalid token, redirecting to login');
        window.location.href = '/login?expired=true';
        return [];
      }

      // Get doctor's prescriptions - use doctor-specific endpoint
      const doctorId = getStoredUserId();
      if (!doctorId) {
        console.warn('No doctor ID found');
        return [];
      }
      const response = await axios.get(`/api/prescriptions/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      
      // Handle authentication errors specifically
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setSnackbar({
          open: true,
          message: 'Session expired. Please login again.',
          severity: 'error'
        });
        setTimeout(() => {
          window.location.href = '/login?expired=true';
        }, 2000);
        return [];
      }
      
      setSnackbar({
        open: true,
        message: 'Failed to fetch prescriptions',
        severity: 'error'
      });
      return [];
    }
  };

  const fetchPatients = async () => {
    try {
      // Check authentication before making API call
      if (!isAuthenticated()) {
        console.warn('User not authenticated for patients fetch');
        return [];
      }

      // Get doctor's assigned patients
      const doctorId = getStoredUserId();
      if (!doctorId) {
        console.warn('No doctor ID found for patients fetch');
        return [];
      }
      const response = await axios.get(`/api/patient-assignments/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      
      // Handle authentication errors specifically
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setSnackbar({
          open: true,
          message: 'Session expired. Please login again.',
          severity: 'error'
        });
        setTimeout(() => {
          window.location.href = '/login?expired=true';
        }, 2000);
        return [];
      }
      
      setSnackbar({
        open: true,
        message: 'Failed to fetch patients',
        severity: 'error'
      });
      return [];
    }
  };

  const fetchMedications = async () => {
    try {
      // Check authentication before making API call
      if (!isAuthenticated()) {
        console.warn('User not authenticated for medications fetch');
        return [];
      }

      const response = await axios.get('/api/medications');
      return response.data;
    } catch (error) {
      console.error('Error fetching medications:', error);
      
      // Handle authentication errors specifically
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.warn('Authentication error fetching medications');
        return [];
      }
      
      return [];
    }
  };
  
  // Fetch patient details including medical history
  const fetchPatientDetails = async (patientId) => {
    try {
      if (!patientId || !isAuthenticated()) {
        return null;
      }
      
      const response = await axios.get(`/api/patients/${patientId}`);
      
      // Also fetch medical records for this patient
      let medicalRecords = [];
      try {
        const recordsResponse = await axios.get(`/api/medical-records/patient/${patientId}`);
        medicalRecords = recordsResponse.data;
      } catch (recordsError) {
        console.error('Error fetching patient medical records:', recordsError);
      }
      
      // Also fetch previous prescriptions for this patient
      let previousPrescriptions = [];
      try {
        const prescriptionsResponse = await axios.get(`/api/prescriptions/patient/${patientId}`);
        previousPrescriptions = prescriptionsResponse.data;
      } catch (prescriptionsError) {
        console.error('Error fetching patient previous prescriptions:', prescriptionsError);
      }
      
      return {
        ...response.data,
        medicalRecords,
        previousPrescriptions
      };
    } catch (error) {
      console.error('Error fetching patient details:', error);
      return null;
    }
  };

  const createPrescription = async (prescriptionData) => {
    try {
      // Create the prescription
      const response = await axios.post('/api/prescriptions', prescriptionData);
      const newPrescription = response.data;
      
      // Send notification to the patient
      try {
        const patientName = patients.find(p => p.id === prescriptionData.patientId)?.name || 'Patient';
        const doctorName = JSON.parse(localStorage.getItem('userData') || '{}').name || 'Your doctor';
        
        await axios.post('/api/notifications', {
          userId: prescriptionData.patientId,
          title: 'New Prescription Created',
          message: `Dr. ${doctorName} has created a new prescription for you. Please check your prescriptions for details.`,
          type: 'info',
          priority: prescriptionData.priority === 'high' ? 'high' : 'medium',
          actionLink: '/prescriptions',
          metadata: {
            prescriptionId: newPrescription._id || newPrescription.id,
            diagnosis: prescriptionData.diagnosis,
            medicationCount: prescriptionData.medications.length
          }
        });
        
        console.log('Notification sent to patient:', prescriptionData.patientId);
      } catch (notificationError) {
        console.error('Error sending notification to patient:', notificationError);
        // Continue even if notification fails
      }
      
      return newPrescription;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  };

  const updatePrescription = async (id, prescriptionData) => {
    try {
      const response = await axios.put(`/api/prescriptions/${id}`, prescriptionData);
      return response.data;
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  };

  const deletePrescription = async (id) => {
    try {
      await axios.delete(`/api/prescriptions/${id}`);
    } catch (error) {
      console.error('Error deleting prescription:', error);
      throw error;
    }
  };

  // Common medication list for autocomplete
  const commonMedications = [
    { name: 'Lisinopril', category: 'ACE Inhibitor', commonDosages: ['5mg', '10mg', '20mg'] },
    { name: 'Metformin', category: 'Antidiabetic', commonDosages: ['500mg', '850mg', '1000mg'] },
    { name: 'Amoxicillin', category: 'Antibiotic', commonDosages: ['250mg', '500mg', '875mg'] },
    { name: 'Hydrochlorothiazide', category: 'Diuretic', commonDosages: ['12.5mg', '25mg', '50mg'] },
    { name: 'Atorvastatin', category: 'Statin', commonDosages: ['10mg', '20mg', '40mg', '80mg'] },
    { name: 'Omeprazole', category: 'Proton Pump Inhibitor', commonDosages: ['10mg', '20mg', '40mg'] },
    { name: 'Amlodipine', category: 'Calcium Channel Blocker', commonDosages: ['2.5mg', '5mg', '10mg'] },
    { name: 'Sertraline', category: 'SSRI', commonDosages: ['25mg', '50mg', '100mg'] },
    { name: 'Albuterol', category: 'Bronchodilator', commonDosages: ['90mcg/puff'] },
    { name: 'Levothyroxine', category: 'Thyroid Hormone', commonDosages: ['25mcg', '50mcg', '75mcg', '100mcg'] }
  ];

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Fetch data from API
        const [prescriptionsData, patientsData, medicationsData] = await Promise.all([
          fetchPrescriptions(),
          fetchPatients(),
          fetchMedications()
        ]);

        if (prescriptionsData.length === 0) {
          setSnackbar({
            open: true,
            message: 'No prescriptions found. Create your first prescription.',
            severity: 'info'
          });
        } else {
          setPrescriptions(prescriptionsData);
        }
        
        // Process patient assignments data
        if (patientsData.length === 0) {
          setSnackbar({
            open: true,
            message: 'No patients assigned to you. Please contact admin for patient assignments.',
            severity: 'warning'
          });
        } else {
          // Extract patient from assignment and ensure complete data
          const processedPatients = patientsData.map(assignment => {
            const patient = assignment.patient;
            
            // Calculate age if not provided
            let age = patient.age;
            if (!age && patient.dateOfBirth) {
              age = calculateAge(patient.dateOfBirth);
            }
            
            return {
              id: patient._id || patient.id,
              name: patient.name || 'Unknown Patient',
              age: age || 'N/A',
              phone: patient.phone || patient.contactNumber || 'No phone',
              email: patient.email || 'No email',
              avatar: patient.profile?.avatar || patient.avatar || null,
              dateOfBirth: patient.dateOfBirth,
              gender: patient.gender || 'Not specified',
              bloodType: patient.bloodType || 'Not specified',
              allergies: patient.allergies || [],
              address: patient.address || 'No address',
              emergencyContact: patient.emergencyContact || 'No emergency contact',
              medicalHistory: patient.medicalHistory || [],
              currentMedications: patient.currentMedications || [],
              // Additional fields that might be useful
              occupation: patient.occupation,
              maritalStatus: patient.maritalStatus,
              insuranceInfo: patient.insuranceInfo
            };
          });
          
          console.log('Processed patients:', processedPatients); // Debug log
          setPatients(processedPatients);
        }
        
        // Set medications from API or use common medications list
        setMedications(medicationsData.length > 0 ? medicationsData : commonMedications);
        
      } catch (error) {
        console.error('Error loading data:', error);
        
        setSnackbar({
          open: true,
          message: 'Error loading data. Please try again later.',
          severity: 'error'
        });
        
        // Set empty data instead of mock data
        setPrescriptions([]);
        setPatients([]);
        setMedications(commonMedications);
      } finally {
        setLoading(false);
      }
    };

    // Helper function to calculate age from date of birth
    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return 'Unknown';
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    initializeData();
  }, []);

  // Filter prescriptions based on search and status
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle prescription form changes
  const handleFormChange = (field, value) => {
    setPrescriptionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle medication changes
  const handleMedicationChange = (index, field, value) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  // Add new medication to form
  const addMedication = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
          quantity: ''
        }
      ]
    }));
  };

  // Remove medication from form
  const removeMedication = (index) => {
    if (prescriptionForm.medications.length > 1) {
      setPrescriptionForm(prev => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index)
      }));
    }
  };

  // Handle dialog operations
  const openDialog = (type, prescription = null) => {
    setDialogType(type);
    if (prescription) {
      setSelectedPrescription(prescription);
      if (type === 'edit') {
        setPrescriptionForm({
          patientId: prescription.patient.id,
          patientName: prescription.patient.name,
          diagnosis: prescription.diagnosis,
          medications: prescription.medications,
          notes: prescription.notes,
          followUpDate: prescription.followUpDate,
          priority: prescription.priority,
          status: prescription.status
        });
      }
    } else {
      // Reset form for new prescription
      setPrescriptionForm({
        patientId: '',
        patientName: '',
        diagnosis: '',
        medications: [
          {
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: '',
            quantity: ''
          }
        ],
        notes: '',
        followUpDate: null,
        priority: 'normal',
        status: 'active'
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedPrescription(null);
  };

  // Handle prescription save
  const handleSavePrescription = async () => {
    try {
      // Validate form data
      if (!prescriptionForm.patientId) {
        setSnackbar({
          open: true,
          message: 'Please select a patient',
          severity: 'error'
        });
        return;
      }

      if (!prescriptionForm.diagnosis) {
        setSnackbar({
          open: true,
          message: 'Please enter a diagnosis',
          severity: 'error'
        });
        return;
      }

      // Validate medications
      const invalidMedications = prescriptionForm.medications.filter(
        med => !med.name || !med.dosage || !med.frequency || !med.duration || !med.quantity
      );
      
      if (invalidMedications.length > 0) {
        setSnackbar({
          open: true,
          message: 'Please complete all required medication fields',
          severity: 'error'
        });
        return;
      }

      setLoading(true);
      
      if (dialogType === 'create') {
        // Create new prescription via API
        const prescriptionData = {
          patient: prescriptionForm.patientId,
          doctor: getStoredUserId(),
          diagnosis: prescriptionForm.diagnosis,
          medications: prescriptionForm.medications.map(med => ({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            notes: med.instructions,
            quantity: med.quantity
          })),
          deliveryOption: 'pickup', // Default delivery option
          status: 'pending', // Initial status
          paymentStatus: 'pending', // Initial payment status
          insuranceDetails: {
            verified: false
          }
        };

        try {
          const newPrescription = await createPrescription(prescriptionData);
          
          // Format the prescription for display
          const formattedPrescription = {
            id: newPrescription._id,
            prescriptionNumber: newPrescription._id.substring(0, 6).toUpperCase(),
            patient: patients.find(p => p.id === prescriptionForm.patientId),
            diagnosis: prescriptionForm.diagnosis,
            medications: prescriptionForm.medications,
            status: 'active',
            priority: prescriptionForm.priority || 'normal',
            createdDate: new Date(),
            followUpDate: prescriptionForm.followUpDate,
            notes: prescriptionForm.notes,
            pharmacyStatus: 'pending',
            refillsRemaining: 0
          };
          
          setPrescriptions(prev => [formattedPrescription, ...prev]);
          
          setSnackbar({
            open: true,
            message: 'Prescription created successfully and sent to patient',
            severity: 'success'
          });
          
          // Refresh prescriptions after a short delay
          setTimeout(() => {
            fetchPrescriptions().then(data => {
              if (data.length > 0) {
                setPrescriptions(data);
              }
            });
          }, 2000);
          
        } catch (apiError) {
          console.error('API Error creating prescription:', apiError);
          setSnackbar({
            open: true,
            message: `Error creating prescription: ${apiError.response?.data?.message || apiError.message}`,
            severity: 'error'
          });
          return;
        }
      } else if (dialogType === 'edit') {
        // Update existing prescription via API
        const prescriptionData = {
          patient: prescriptionForm.patientId,
          doctor: getStoredUserId(),
          diagnosis: prescriptionForm.diagnosis,
          medications: prescriptionForm.medications.map(med => ({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            notes: med.instructions,
            quantity: med.quantity
          })),
          status: prescriptionForm.status || 'pending',
          priority: prescriptionForm.priority || 'normal',
          notes: prescriptionForm.notes
        };

        try {
          const updatedPrescription = await updatePrescription(selectedPrescription.id, prescriptionData);
          
          // Format the updated prescription for display
          const formattedPrescription = {
            ...selectedPrescription,
            diagnosis: prescriptionForm.diagnosis,
            medications: prescriptionForm.medications,
            status: prescriptionForm.status || 'active',
            priority: prescriptionForm.priority || 'normal',
            followUpDate: prescriptionForm.followUpDate,
            notes: prescriptionForm.notes,
            patient: patients.find(p => p.id === prescriptionForm.patientId)
          };
          
          setPrescriptions(prev => prev.map(p => 
            p.id === selectedPrescription.id ? formattedPrescription : p
          ));
          
          setSnackbar({
            open: true,
            message: 'Prescription updated successfully',
            severity: 'success'
          });
          
          // Refresh prescriptions after a short delay
          setTimeout(() => {
            fetchPrescriptions().then(data => {
              if (data.length > 0) {
                setPrescriptions(data);
              }
            });
          }, 2000);
          
        } catch (apiError) {
          console.error('API Error updating prescription:', apiError);
          setSnackbar({
            open: true,
            message: `Error updating prescription: ${apiError.response?.data?.message || apiError.message}`,
            severity: 'error'
          });
          return;
        }
      }
      closeDialog();
    } catch (error) {
      console.error('Error saving prescription:', error);
      setSnackbar({
        open: true,
        message: `Error saving prescription: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle prescription deletion
  const handleDeletePrescription = async (prescriptionId) => {
    try {
      setLoading(true);
      
      try {
        await deletePrescription(prescriptionId);
        setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
        
        setSnackbar({
          open: true,
          message: 'Prescription deleted successfully',
          severity: 'success'
        });
        
        // Refresh prescriptions after a short delay
        setTimeout(() => {
          fetchPrescriptions().then(data => {
            if (data.length > 0) {
              setPrescriptions(data);
            }
          });
        }, 2000);
        
      } catch (apiError) {
        console.error('API Error deleting prescription:', apiError);
        setSnackbar({
          open: true,
          message: `Error deleting prescription: ${apiError.response?.data?.message || apiError.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      setSnackbar({
        open: true,
        message: `Error deleting prescription: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'normal': return 'default';
      default: return 'default';
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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



  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box sx={{ p: isMobile ? 1 : 3 }}>
          
          {/* Header */}
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                borderRadius: 3
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      Prescription Management
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Create, manage, and track patient prescriptions
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openDialog('create')}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    New Prescription
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="primary.main">
                          {prescriptions.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Prescriptions
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                        <MedicationIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {prescriptions.filter(p => p.status === 'active').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Prescriptions
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                        <CheckCircleIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                          {prescriptions.filter(p => p.pharmacyStatus === 'pending').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pending Pharmacy
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
                        <ScheduleIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="info.main">
                          {patients.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Patients
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                        <PersonIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>

          {/* Search and Filter */}
          <motion.div variants={itemVariants}>
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Search prescriptions, patients, or diagnosis..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Status Filter</InputLabel>
                      <Select
                        value={filterStatus}
                        label="Status Filter"
                        onChange={(e) => setFilterStatus(e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="expired">Expired</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => window.location.reload()}
                        sx={{ borderRadius: 2 }}
                      >
                        Refresh
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        Export
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>

          {/* Prescriptions List */}
          <motion.div variants={itemVariants}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Prescription #</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Diagnosis</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Medications</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPrescriptions.map((prescription) => (
                        <TableRow key={prescription.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} color="primary.main">
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
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {prescription.patient.age && prescription.patient.age !== 'N/A' 
                                    ? `Age: ${prescription.patient.age}` 
                                    : 'Age: N/A'
                                  }
                                  {prescription.patient.gender && prescription.patient.gender !== 'Not specified' 
                                    && ` • ${prescription.patient.gender}`
                                  }
                                </Typography>
                                {prescription.patient.bloodType && prescription.patient.bloodType !== 'Not specified' && (
                                  <Typography variant="caption" color="text.secondary">
                                    Blood: {prescription.patient.bloodType}
                                  </Typography>
                                )}
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
                              label={prescription.status}
                              color={getStatusColor(prescription.status)}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={prescription.priority}
                              color={getPriorityColor(prescription.priority)}
                              size="small"
                              variant="outlined"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {prescription.createdDate && new Date(prescription.createdDate).getTime() 
                                ? format(new Date(prescription.createdDate), 'MMM dd, yyyy')
                                : 'N/A'
                              }
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="View">
                                <IconButton
                                  size="small"
                                  onClick={() => openDialog('view', prescription)}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => openDialog('edit', prescription)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Print">
                                <IconButton 
                                  size="small"
                                  onClick={() => {
                                    // Open print dialog or generate PDF
                                    setSnackbar({
                                      open: true,
                                      message: 'Preparing prescription for printing...',
                                      severity: 'info'
                                    });
                                    
                                    // In a real implementation, this would generate a PDF or open a print view
                                    setTimeout(() => {
                                      window.print();
                                    }, 500);
                                  }}
                                >
                                  <PrintIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="More">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    setSelectedPrescription(prescription);
                                    setAnchorEl(e.currentTarget);
                                  }}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Prescription Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={closeDialog}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                {dialogType === 'create' ? 'Create New Prescription' :
                 dialogType === 'edit' ? 'Edit Prescription' : 'View Prescription'}
              </Typography>
              <IconButton onClick={closeDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {dialogType === 'view' && selectedPrescription ? (
              // View Mode
              <Box sx={{ py: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Prescription Number
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                      {selectedPrescription.prescriptionNumber}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Patient Information
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar src={selectedPrescription.patient.avatar}>
                        {selectedPrescription.patient.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedPrescription.patient.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Age: {selectedPrescription.patient.age} | {selectedPrescription.patient.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Diagnosis
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedPrescription.diagnosis}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Status & Priority
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={selectedPrescription.status}
                        color={getStatusColor(selectedPrescription.status)}
                        size="small"
                      />
                      <Chip
                        label={selectedPrescription.priority}
                        color={getPriorityColor(selectedPrescription.priority)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Medications
                </Typography>
                {selectedPrescription.medications.map((medication, index) => (
                  <Card key={index} sx={{ mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Medication
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {medication.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Dosage & Frequency
                          </Typography>
                          <Typography variant="body1">
                            {medication.dosage} - {medication.frequency}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Duration & Quantity
                          </Typography>
                          <Typography variant="body1">
                            {medication.duration} ({medication.quantity})
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Instructions
                          </Typography>
                          <Typography variant="body1">
                            {medication.instructions}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
                
                {selectedPrescription.notes && (
                  <>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                      Notes
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedPrescription.notes}
                    </Typography>
                  </>
                )}
                
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                  Dates
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created Date
                    </Typography>
                    <Typography variant="body1">
                      {selectedPrescription.createdDate && new Date(selectedPrescription.createdDate).getTime() 
                        ? format(new Date(selectedPrescription.createdDate), 'MMMM dd, yyyy')
                        : 'N/A'
                      }
                    </Typography>
                  </Grid>
                  {selectedPrescription.followUpDate && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Follow-up Date
                      </Typography>
                      <Typography variant="body1">
                        {selectedPrescription.followUpDate && new Date(selectedPrescription.followUpDate).getTime() 
                          ? format(new Date(selectedPrescription.followUpDate), 'MMMM dd, yyyy')
                          : 'N/A'
                        }
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ) : (
              // Create/Edit Mode
              <Box sx={{ py: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={patients}
                      getOptionLabel={(option) => option.name}
                      value={patients.find(p => p.id === prescriptionForm.patientId) || null}
                      onChange={async (event, newValue) => {
                        handleFormChange('patientId', newValue?.id || '');
                        handleFormChange('patientName', newValue?.name || '');
                        
                        // Fetch patient details when a patient is selected
                        if (newValue?.id) {
                          setLoading(true);
                          const patientDetails = await fetchPatientDetails(newValue.id);
                          setSelectedPatientDetails(patientDetails);
                          setLoading(false);
                        } else {
                          setSelectedPatientDetails(null);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Patient"
                          required
                          fullWidth
                          helperText="Select a patient to create a prescription"
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Avatar 
                            src={option.avatar} 
                            sx={{ mr: 2, width: 40, height: 40 }}
                          >
                            {option.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {option.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {option.gender && `${option.gender} | `}
                              {option.age !== 'N/A' ? `Age: ${option.age}` : option.dateOfBirth && new Date(option.dateOfBirth).getTime() ? `DOB: ${new Date(option.dateOfBirth).toLocaleDateString()}` : 'No age info'} 
                              {option.bloodType && option.bloodType !== 'Not specified' && ` | ${option.bloodType}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {option.phone && option.phone !== 'No phone' && `📞 ${option.phone}`}
                              {option.email && option.email !== 'No email' && ` | 📧 ${option.email}`}
                            </Typography>
                            {option.allergies && option.allergies.length > 0 && (
                              <Typography variant="caption" color="error.main" sx={{ display: 'block', fontWeight: 600 }}>
                                ⚠️ Allergies: {option.allergies.slice(0, 3).join(', ')}{option.allergies.length > 3 && '...'}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Diagnosis"
                      value={prescriptionForm.diagnosis}
                      onChange={(e) => handleFormChange('diagnosis', e.target.value)}
                      required
                    />
                  </Grid>
                </Grid>
                
                {/* Patient Information Card */}
                {selectedPatientDetails && (
                  <Card sx={{ mt: 3, mb: 3, borderRadius: 2, boxShadow: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={selectedPatientDetails.profile?.avatar} 
                            sx={{ width: 64, height: 64 }}
                          >
                            {selectedPatientDetails.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {selectedPatientDetails.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {selectedPatientDetails.gender && selectedPatientDetails.gender !== 'Not specified' && `${selectedPatientDetails.gender} | `}
                              {selectedPatientDetails.age && selectedPatientDetails.age !== 'N/A' ? `Age: ${selectedPatientDetails.age}` : 
                               selectedPatientDetails.dateOfBirth && new Date(selectedPatientDetails.dateOfBirth).getTime() ? `DOB: ${new Date(selectedPatientDetails.dateOfBirth).toLocaleDateString()}` : 'No age info'}
                              {selectedPatientDetails.bloodType && selectedPatientDetails.bloodType !== 'Not specified' && ` | Blood: ${selectedPatientDetails.bloodType}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedPatientDetails.phone && selectedPatientDetails.phone !== 'No phone' && `📞 ${selectedPatientDetails.phone}`}
                              {selectedPatientDetails.email && selectedPatientDetails.email !== 'No email' && ` | 📧 ${selectedPatientDetails.email}`}
                            </Typography>
                            {selectedPatientDetails.allergies && selectedPatientDetails.allergies.length > 0 && (
                              <Typography variant="body2" color="error.main" sx={{ fontWeight: 600, mt: 0.5 }}>
                                ⚠️ Allergies: {selectedPatientDetails.allergies.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {selectedPatientDetails.bloodType && selectedPatientDetails.bloodType !== 'Not specified' && (
                            <Chip 
                              label={`Blood: ${selectedPatientDetails.bloodType}`} 
                              color="error"
                              variant="outlined"
                              size="small"
                            />
                          )}
                          {selectedPatientDetails.currentMedications && selectedPatientDetails.currentMedications.length > 0 && (
                            <Chip 
                              label={`${selectedPatientDetails.currentMedications.length} Current Meds`} 
                              color="info"
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Grid container spacing={2}>
                        {/* Allergies */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Allergies
                          </Typography>
                          {selectedPatientDetails.allergies && selectedPatientDetails.allergies.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {selectedPatientDetails.allergies.map((allergy, index) => (
                                <Chip 
                                  key={index} 
                                  label={allergy} 
                                  size="small" 
                                  color="warning" 
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2">No known allergies</Typography>
                          )}
                        </Grid>
                        
                        {/* Current Medications */}
                        {selectedPatientDetails.currentMedications && selectedPatientDetails.currentMedications.length > 0 && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Current Medications
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {selectedPatientDetails.currentMedications.slice(0, 4).map((med, index) => (
                                <Chip 
                                  key={index} 
                                  label={typeof med === 'string' ? med : `${med.name} ${med.dosage || ''}`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              ))}
                              {selectedPatientDetails.currentMedications.length > 4 && (
                                <Typography variant="caption" color="text.secondary">
                                  +{selectedPatientDetails.currentMedications.length - 4} more
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        )}
                        
                        {/* Previous Medications */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Previous Medications
                          </Typography>
                          {selectedPatientDetails.previousPrescriptions && selectedPatientDetails.previousPrescriptions.length > 0 ? (
                            <Box>
                              {selectedPatientDetails.previousPrescriptions.slice(0, 3).flatMap(prescription => 
                                prescription.medications.slice(0, 2).map((med, idx) => (
                                  <Chip 
                                    key={`${prescription._id}-${idx}`} 
                                    label={`${med.name} ${med.dosage}`} 
                                    size="small" 
                                    color="info" 
                                    variant="outlined"
                                    sx={{ mr: 1, mb: 1 }}
                                  />
                                ))
                              )}
                              {selectedPatientDetails.previousPrescriptions.length > 3 && (
                                <Typography variant="caption" color="text.secondary">
                                  + more medications in history
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2">No previous medications</Typography>
                          )}
                        </Grid>
                        
                        {/* Medical Records Summary */}
                        {selectedPatientDetails.medicalRecords && selectedPatientDetails.medicalRecords.length > 0 && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Recent Medical History
                            </Typography>
                            <Box sx={{ maxHeight: 100, overflow: 'auto', bgcolor: alpha(theme.palette.background.default, 0.5), p: 1, borderRadius: 1 }}>
                              {selectedPatientDetails.medicalRecords.slice(0, 3).map((record, index) => (
                                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>{new Date(record.date).toLocaleDateString()}</strong>: {record.diagnosis || record.notes}
                                </Typography>
                              ))}
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                )}
                
                <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
                  Medications
                </Typography>
                
                {prescriptionForm.medications.map((medication, index) => (
                  <Card key={index} sx={{ mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Medication {index + 1}
                        </Typography>
                        {prescriptionForm.medications.length > 1 && (
                          <IconButton
                            size="small"
                            onClick={() => removeMedication(index)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Autocomplete
                            freeSolo
                            options={medications}
                            getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                            value={medication.name || ''}
                            onChange={(event, newValue) => {
                              const medicationName = typeof newValue === 'string' ? newValue : newValue?.name || '';
                              handleMedicationChange(index, 'name', medicationName);
                            }}
                            onInputChange={(event, newInputValue) => {
                              handleMedicationChange(index, 'name', newInputValue);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Medication Name"
                                required
                                fullWidth
                                helperText="Type to search or enter custom medication name"
                              />
                            )}
                            renderOption={(props, option) => (
                              <Box component="li" {...props}>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {typeof option === 'string' ? option : option.name}
                                  </Typography>
                                  {typeof option === 'object' && option.category && (
                                    <Typography variant="caption" color="text.secondary">
                                      {option.category} {option.commonDosages && `• Common: ${option.commonDosages.slice(0, 3).join(', ')}`}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Dosage"
                            value={medication.dosage}
                            onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                            placeholder="e.g., 10mg, 500mg"
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth required>
                            <InputLabel>Frequency</InputLabel>
                            <Select
                              value={medication.frequency}
                              label="Frequency"
                              onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            >
                              <MenuItem value="Once daily">Once daily</MenuItem>
                              <MenuItem value="Twice daily">Twice daily</MenuItem>
                              <MenuItem value="Three times daily">Three times daily</MenuItem>
                              <MenuItem value="Four times daily">Four times daily</MenuItem>
                              <MenuItem value="Every 4 hours">Every 4 hours</MenuItem>
                              <MenuItem value="Every 6 hours">Every 6 hours</MenuItem>
                              <MenuItem value="Every 8 hours">Every 8 hours</MenuItem>
                              <MenuItem value="Every 12 hours">Every 12 hours</MenuItem>
                              <MenuItem value="As needed">As needed</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Duration"
                            value={medication.duration}
                            onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                            placeholder="e.g., 7 days, 30 days"
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Quantity"
                            value={medication.quantity}
                            onChange={(e) => handleMedicationChange(index, 'quantity', e.target.value)}
                            placeholder="e.g., 30 tablets, 100ml"
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Special Instructions"
                            value={medication.instructions}
                            onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                            placeholder="e.g., Take with food, Take before meals"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addMedication}
                  sx={{ mb: 3 }}
                >
                  Add Another Medication
                </Button>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={prescriptionForm.priority}
                        label="Priority"
                        onChange={(e) => handleFormChange('priority', e.target.value)}
                      >
                        <MenuItem value="normal">Normal</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Follow-up Date"
                      value={prescriptionForm.followUpDate}
                      onChange={(newValue) => handleFormChange('followUpDate', newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Notes"
                      value={prescriptionForm.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      multiline
                      rows={3}
                      placeholder="Any additional instructions or notes..."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            {dialogType === 'view' ? (
              <>
                <Button onClick={closeDialog}>Close</Button>
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  sx={{ ml: 1 }}
                >
                  Print
                </Button>
              </>
            ) : (
              <>
                <Button onClick={closeDialog}>Cancel</Button>
                <Button
                  variant="contained"
                  onClick={handleSavePrescription}
                  startIcon={<SaveIcon />}
                  sx={{ ml: 1 }}
                >
                  {dialogType === 'create' ? 'Create Prescription' : 'Update Prescription'}
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem 
            onClick={() => {
              const prescription = prescriptions.find(p => p.id === selectedPrescription?.id);
              if (prescription) {
                // Send notification to pharmacy
                try {
                  axios.post('/api/notifications', {
                    userId: prescription.pharmacist?._id || 'pharmacy', // Use a general pharmacy ID if no specific pharmacist
                    title: 'New Prescription Ready',
                    message: `A new prescription for ${prescription.patient.name} is ready for processing.`,
                    type: 'info',
                    priority: prescription.priority === 'high' ? 'high' : 'medium',
                    actionLink: '/pharmacy/prescriptions',
                    metadata: {
                      prescriptionId: prescription.id,
                      patientName: prescription.patient.name,
                      diagnosis: prescription.diagnosis
                    }
                  });
                  
                  setSnackbar({
                    open: true,
                    message: 'Prescription sent to pharmacy',
                    severity: 'success'
                  });
                } catch (error) {
                  console.error('Error sending to pharmacy:', error);
                  setSnackbar({
                    open: true,
                    message: 'Error sending to pharmacy',
                    severity: 'error'
                  });
                }
              }
              setAnchorEl(null);
            }}
          >
            <SendIcon sx={{ mr: 1 }} fontSize="small" />
            Send to Pharmacy
          </MenuItem>
          <MenuItem 
            onClick={() => {
              const prescription = prescriptions.find(p => p.id === selectedPrescription?.id);
              if (prescription) {
                openDialog('view', prescription);
              }
              setAnchorEl(null);
            }}
          >
            <HistoryIcon sx={{ mr: 1 }} fontSize="small" />
            View Details
          </MenuItem>
          <MenuItem 
            onClick={() => {
              const prescription = prescriptions.find(p => p.id === selectedPrescription?.id);
              if (prescription) {
                setPrescriptionToDelete(prescription);
                setConfirmDialogOpen(true);
              }
              setAnchorEl(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete
          </MenuItem>
        </Menu>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        
        {/* Confirmation Dialog for Deletion */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this prescription? This action cannot be undone.
            </Typography>
            {prescriptionToDelete && (
              <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Prescription: {prescriptionToDelete.prescriptionNumber}
                </Typography>
                <Typography variant="body2">
                  Patient: {prescriptionToDelete.patient?.name}
                </Typography>
                <Typography variant="body2">
                  Diagnosis: {prescriptionToDelete.diagnosis}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button 
              color="error" 
              variant="contained"
              onClick={() => {
                if (prescriptionToDelete) {
                  handleDeletePrescription(prescriptionToDelete.id);
                  setConfirmDialogOpen(false);
                  setPrescriptionToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </LocalizationProvider>
  );
};

export default PrescriptionManagement;