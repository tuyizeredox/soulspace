import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';

// Import components
import HospitalStats from '../../components/hospitals/HospitalStats';
import HospitalFilters from '../../components/hospitals/HospitalFilters';
import HospitalTable from '../../components/hospitals/HospitalTable';
import HospitalForm from '../../components/hospitals/HospitalForm';

// Default stats (will be replaced with real data from API)
const defaultStats = {
  totalHospitals: 0,
  activeDoctors: 0,
  registeredPatients: 0,
  appointmentsToday: 0,
  hospitalAdmins: 0,
  hospitalsByType: [],
  hospitalsByRegion: [],
  recentAdmins: [],
  adminStats: {
    totalAdmins: 0,
    activeToday: 0,
    avgHospitalsPerAdmin: 0,
    adminsByExperience: []
  },
  growthRates: {
    hospitals: '+0%',
    doctors: '+0%',
    patients: '+0%',
    appointments: '+0%',
    admins: '+0%'
  }
};

const Hospitals = () => {
  const theme = useTheme();

  // Get user data from both auth systems
  const { user: oldUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: newUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = newUser || oldUser;
  const token = newToken || oldToken;

  console.log('Hospitals: User data', {
    role: user?.role,
    name: user?.name,
    hasToken: !!token
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [stats, setStats] = useState(defaultStats);
  const [openHospitalForm, setOpenHospitalForm] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [formMode, setFormMode] = useState('add');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [filters, setFilters] = useState({
    type: '',
    region: '',
    status: '',
    capacity: [0, 1000],
    adminFilter: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

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

  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      console.log('Hospitals: Fetching hospitals with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const response = await axios.get('/api/hospitals', config);
      console.log('Hospitals: Fetched hospitals successfully:', response.data.length);

      const formattedHospitals = response.data.map(hospital => ({
        id: hospital._id || hospital.id,
        ...hospital,
        status: hospital.status || 'active', // Default status if not provided
        type: hospital.type || 'general', // Default type if not provided
        beds: hospital.beds || 0,
        doctors: hospital.doctors || 0,
        rating: hospital.rating || 0,
        // Ensure admin phone is included
        adminPhone: hospital.adminPhone || (hospital.admin && hospital.admin.phone) || '',
        // Ensure additionalAdmins is always an array
        additionalAdmins: hospital.additionalAdmins || [],
      }));
      setHospitals(formattedHospitals);
      setFilteredHospitals(formattedHospitals);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setError('Error fetching hospitals: ' + (error.response?.data?.message || error.message));
      setLoading(false);

      // Use mock data for development if API fails
      const mockHospitals = [
        {
          id: 'hosp_123456789',
          name: 'General Hospital',
          location: 'New York, NY',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          phone: '+1 (555) 123-4567',
          email: 'info@generalhospital.com',
          website: 'www.generalhospital.com',
          type: 'general',
          beds: 450,
          doctors: 120,
          status: 'active',
          rating: 4.5,
          logo: null,
          adminName: 'Dr. John Smith',
          adminEmail: 'john.smith@generalhospital.com',
          adminPhone: '+1 (555) 987-6543',
          additionalAdmins: [
            {
              id: 'admin_123',
              name: 'Dr. Emily Johnson',
              email: 'emily.johnson@generalhospital.com',
              phone: '+1 (555) 234-5678'
            },
            {
              id: 'admin_124',
              name: 'Dr. Michael Chen',
              email: 'michael.chen@generalhospital.com',
              phone: '+1 (555) 345-6789'
            }
          ],
        },
        {
          id: 'hosp_234567890',
          name: 'Medical Center',
          location: 'Boston, MA',
          address: '456 Health Ave',
          city: 'Boston',
          state: 'MA',
          zipCode: '02108',
          phone: '+1 (555) 234-5678',
          email: 'info@medicalcenter.com',
          website: 'www.medicalcenter.com',
          type: 'teaching',
          beds: 650,
          doctors: 180,
          status: 'active',
          rating: 4.8,
          logo: null,
          adminName: 'Dr. Sarah Johnson',
          adminEmail: 'sarah.johnson@medicalcenter.com',
          adminPhone: '+1 (555) 765-4321',
          additionalAdmins: [
            {
              id: 'admin_223',
              name: 'Dr. Robert Williams',
              email: 'robert.williams@medicalcenter.com',
              phone: '+1 (555) 456-7890'
            }
          ],
        },
        // Add more mock hospitals as needed
      ];
      setHospitals(mockHospitals);
      setFilteredHospitals(mockHospitals);
      setLoading(false);
    }
  };

  // Fetch system stats
  const fetchSystemStats = async () => {
    try {
      setStatsLoading(true);
      console.log('Hospitals: Fetching system stats with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const response = await axios.get('/api/hospitals/system-stats', config);
      console.log('System stats:', response.data);
      setStats(response.data);
      setStatsLoading(false);
    } catch (error) {
      console.error('Error fetching system stats:', error);
      setStatsLoading(false);
      // Keep using default stats if API fails
    }
  };

  useEffect(() => {
    fetchHospitals();
    fetchSystemStats();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...hospitals];

    // Apply type filter
    if (filters.type) {
      result = result.filter(hospital => hospital.type === filters.type);
    }

    // Apply region filter
    if (filters.region) {
      result = result.filter(hospital => {
        const state = hospital.state?.toLowerCase();
        const region = filters.region.toLowerCase();

        // Map states to regions (simplified for example)
        const regionMapping = {
          northeast: ['ny', 'ma', 'ct', 'ri', 'nh', 'vt', 'me', 'pa', 'nj'],
          southeast: ['fl', 'ga', 'sc', 'nc', 'va', 'wv', 'ky', 'tn', 'al', 'ms', 'ar', 'la'],
          midwest: ['oh', 'in', 'il', 'mi', 'wi', 'mn', 'ia', 'mo', 'nd', 'sd', 'ne', 'ks'],
          southwest: ['tx', 'ok', 'nm', 'az'],
          west: ['ca', 'nv', 'ut', 'co', 'wy', 'mt', 'id', 'wa', 'or', 'ak', 'hi'],
        };

        return regionMapping[region]?.includes(state);
      });
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter(hospital => hospital.status === filters.status);
    }

    // Apply capacity filter
    if (filters.capacity && filters.capacity.length === 2) {
      result = result.filter(hospital =>
        hospital.beds >= filters.capacity[0] && hospital.beds <= filters.capacity[1]
      );
    }

    // Apply admin filter
    if (filters.adminFilter) {
      if (filters.adminFilter === 'has_admin') {
        result = result.filter(hospital =>
          hospital.adminName && hospital.adminName !== 'No admin assigned'
        );
      } else if (filters.adminFilter === 'no_admin') {
        result = result.filter(hospital =>
          !hospital.adminName || hospital.adminName === 'No admin assigned'
        );
      }
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        hospital =>
          hospital.name?.toLowerCase().includes(term) ||
          hospital.location?.toLowerCase().includes(term) ||
          hospital.id?.toLowerCase().includes(term) ||
          hospital.adminName?.toLowerCase().includes(term) ||
          hospital.adminEmail?.toLowerCase().includes(term) ||
          hospital.adminPhone?.toLowerCase().includes(term) ||
          hospital.email?.toLowerCase().includes(term) ||
          hospital.phone?.toLowerCase().includes(term)
      );
    }

    setFilteredHospitals(result);
  }, [filters, searchTerm, hospitals]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddHospital = () => {
    setSelectedHospital(null);
    setFormMode('add');
    setOpenHospitalForm(true);
  };

  const handleEditHospital = (hospital) => {
    setSelectedHospital(hospital);
    setFormMode('edit');
    setOpenHospitalForm(true);
  };

  const handleViewHospitalDetails = (hospital) => {
    // The details are now shown in a popup dialog directly from the HospitalTable component
    console.log('View hospital details:', hospital);
  };

  const handleDeleteHospital = async (hospitalId) => {
    try {
      setLoading(true);
      console.log('Hospitals: Deleting hospital with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      await axios.delete(`/api/hospitals/${hospitalId}`, config);
      fetchHospitals();
      setSnackbar({
        open: true,
        message: 'Hospital deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting hospital:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting hospital: ' + (error.response?.data?.message || error.message),
        severity: 'error',
      });
      setLoading(false);
    }
  };

  const handleChangeHospitalStatus = async (hospitalId, status) => {
    try {
      setLoading(true);
      console.log('Hospitals: Changing hospital status with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      await axios.put(`/api/hospitals/${hospitalId}/status`, { status }, config);
      fetchHospitals();
      setSnackbar({
        open: true,
        message: `Hospital status changed to ${status}`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error changing hospital status:', error);
      setSnackbar({
        open: true,
        message: 'Error changing hospital status: ' + (error.response?.data?.message || error.message),
        severity: 'error',
      });
      setLoading(false);
    }
  };

  const handleHospitalFormSubmit = async (formData) => {
    try {
      setLoading(true);
      console.log('Hospitals: Submitting hospital form data with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      console.log('Submitting hospital form data:', formData);

      if (formMode === 'add') {
        const response = await axios.post('/api/hospitals', formData, config);
        console.log('Hospital created successfully:', response.data);
        setSnackbar({
          open: true,
          message: 'Hospital created successfully',
          severity: 'success',
        });
      } else {
        // Make sure primaryAdminUpdate is properly structured
        if (formData.primaryAdminUpdate && Object.keys(formData.primaryAdminUpdate).length === 0) {
          // If empty, set to null to avoid backend issues
          formData.primaryAdminUpdate = null;
        }

        // Make sure adminsToRemove is an array
        if (!Array.isArray(formData.adminsToRemove)) {
          formData.adminsToRemove = [];
        }

        const response = await axios.put(`/api/hospitals/${selectedHospital.id}`, formData, config);
        console.log('Hospital updated successfully:', response.data);

        // Get detailed information about added admins
        const addedAdminsCount = response.data.addedAdminsCount || {
          total: response.data.addedAdmins?.length || 0,
          successful: response.data.addedAdmins?.length || 0,
          failed: 0
        };

        // Create appropriate message based on the results
        let message = 'Hospital updated successfully';

        if (addedAdminsCount.total > 0) {
          if (addedAdminsCount.failed > 0) {
            // Some admins failed to be added
            message = `Hospital updated with ${addedAdminsCount.successful} admin${addedAdminsCount.successful !== 1 ? 's' : ''} added. ${addedAdminsCount.failed} failed.`;
          } else {
            // All admins were added successfully
            message = `Hospital updated successfully with ${addedAdminsCount.successful} new admin${addedAdminsCount.successful !== 1 ? 's' : ''} added`;
          }
        }

        // If there are failed admins, log them for debugging
        if (addedAdminsCount.failed > 0) {
          const failedAdmins = response.data.addedAdmins.filter(admin => admin.error);
          console.warn('Failed to add some admins:', failedAdmins);
        }

        setSnackbar({
          open: true,
          message: message,
          severity: addedAdminsCount.failed > 0 ? 'warning' : 'success',
        });
      }

      // Refresh the hospitals list
      await fetchHospitals();
      setOpenHospitalForm(false);
    } catch (error) {
      console.error('Error submitting hospital form:', error);
      const errorMessage = error.response?.data?.error ||
        (formMode === 'add' ? 'Error creating hospital' : 'Error updating hospital');

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <Box
          component={motion.div}
          variants={headerVariants}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            mb: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
              gutterBottom
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                mb: { xs: 0.5, sm: 1 }
              }}
            >
              Hospital Management
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Manage all hospitals and healthcare facilities across the SoulSpace platform
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            gap: { xs: 1, sm: 2 },
            mt: { xs: 2, md: 0 },
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'space-between', md: 'flex-end' }
          }}>
            <Button
              variant="outlined"
              startIcon={<CloudDownloadIcon />}
              size="small"
              sx={{
                borderRadius: 2,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              size="small"
              sx={{
                borderRadius: 2,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              Import
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddHospital}
              size="small"
              sx={{
                borderRadius: 2,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                py: { xs: 1, sm: 1.2 },
                flex: { xs: 1, md: 'none' },
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
            >
              Add Hospital
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: { xs: 2, sm: 3 },
              borderRadius: 2,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Hospital Stats */}
        <HospitalStats
          stats={stats}
          loading={statsLoading}
          onRefresh={fetchSystemStats}
        />

        {/* Filters */}
        <HospitalFilters onFilterChange={handleFilterChange} onSearch={handleSearch} />

        {/* Hospital Table */}
        <HospitalTable
          hospitals={filteredHospitals}
          onEdit={handleEditHospital}
          onDelete={handleDeleteHospital}
          onViewDetails={handleViewHospitalDetails}
          onChangeStatus={handleChangeHospitalStatus}
        />

        {/* Hospital Form Dialog */}
        <HospitalForm
          open={openHospitalForm}
          onClose={() => setOpenHospitalForm(false)}
          onSubmit={handleHospitalFormSubmit}
          hospital={selectedHospital}
          mode={formMode}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
            '@media (min-width: 600px)': {
              horizontal: 'right'
            }
          }}
          sx={{
            width: { xs: '90%', sm: 'auto' },
            bottom: { xs: 16, sm: 24 }
          }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: '100%',
              borderRadius: 2,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              py: { xs: 0.5, sm: 1 }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Loading backdrop */}
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
          open={loading}
        >
          <CircularProgress color="inherit" size={40} />
          <Typography variant="body2" color="white" sx={{ fontWeight: 500 }}>
            Loading...
          </Typography>
        </Backdrop>
      </Box>
    </Container>
  );
};

export default Hospitals;