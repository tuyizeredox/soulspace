import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Divider,
  useTheme,
  alpha,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  MedicalServices as MedicalIcon,
  Chat as ChatIcon,
  VideoCall as VideoCallIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axiosConfig';
import PatientSidebar from '../../components/patient/PatientSidebar';
import { motion } from 'framer-motion';

const PatientDoctorsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State variables
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [error, setError] = useState('');

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

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');

      // Get token for authorization
      const token = localStorage.getItem('token') ||
                   localStorage.getItem('userToken') ||
                   localStorage.getItem('patientToken') ||
                   localStorage.getItem('persistentToken');

      if (!token) {
        console.error('No authentication token found');
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Fetch doctors
      const response = await axios.get('/api/doctors');

      if (response.data) {
        console.log('Doctors data received:', response.data);
        setDoctors(response.data);

        // Extract unique specialties
        const uniqueSpecialties = [...new Set(response.data
          .filter(doc => doc.profile?.specialization)
          .map(doc => doc.profile.specialization))];

        setSpecialties(uniqueSpecialties);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Error loading doctors. Please try again later.');

      // Use mock data as fallback
      const mockDoctors = [
        {
          _id: '1',
          name: 'Dr. John Smith',
          email: 'john.smith@example.com',
          profile: {
            specialization: 'Cardiology',
            experience: 10,
            bio: 'Experienced cardiologist with focus on preventive care.'
          },
          hospitalId: '1',
          hospital: { name: 'General Hospital' },
          rating: 4.8
        },
        {
          _id: '2',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@example.com',
          profile: {
            specialization: 'Pediatrics',
            experience: 8,
            bio: 'Dedicated pediatrician with a gentle approach to children.'
          },
          hospitalId: '1',
          hospital: { name: 'General Hospital' },
          rating: 4.9
        },
        {
          _id: '3',
          name: 'Dr. Michael Chen',
          email: 'michael.chen@example.com',
          profile: {
            specialization: 'Neurology',
            experience: 12,
            bio: 'Specialized in neurological disorders and treatments.'
          },
          hospitalId: '2',
          hospital: { name: 'City Medical Center' },
          rating: 4.7
        }
      ];

      setDoctors(mockDoctors);

      // Extract unique specialties from mock data
      const uniqueSpecialties = [...new Set(mockDoctors
        .filter(doc => doc.profile?.specialization)
        .map(doc => doc.profile.specialization))];

      setSpecialties(uniqueSpecialties);
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search term and specialty
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchTerm === '' ||
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.profile?.specialization && doctor.profile.specialization.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecialty = specialtyFilter === '' ||
      (doctor.profile?.specialization && doctor.profile.specialization === specialtyFilter);

    return matchesSearch && matchesSpecialty;
  });

  // Handle chat with doctor
  const handleChatWithDoctor = (doctorId) => {
    navigate(`/patient/chat/${doctorId}`);
  };

  // Handle video call with doctor
  const handleVideoCallWithDoctor = (doctorId) => {
    navigate(`/patient/call/${doctorId}`);
  };

  // Handle book appointment with doctor
  const handleBookAppointment = (doctor) => {
    navigate('/patient/appointments/book', { state: { selectedDoctor: doctor } });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <PatientSidebar />

      {/* Main Content */}
      <Box sx={{
        flexGrow: 1,
        p: 3,
        bgcolor: alpha(theme.palette.background.default, 0.8)
      }}>
        <Container maxWidth="lg">
          {/* Page Title */}
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Find a Doctor
          </Typography>

          {/* Filters */}
          <Paper
            component={motion.div}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: theme.shadows[2] }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search doctors by name or specialty"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Specialty</InputLabel>
                  <Select
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    label="Specialty"
                  >
                    <MenuItem value="">All Specialties</MenuItem>
                    {specialties.map((specialty) => (
                      <MenuItem key={specialty} value={specialty}>
                        {specialty}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Doctors List */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
              <Typography color="error">{error}</Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={fetchDoctors}
              >
                Retry
              </Button>
            </Paper>
          ) : filteredDoctors.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
              <Typography>No doctors found matching your criteria.</Typography>
            </Paper>
          ) : (
            <Grid
              container
              spacing={3}
              component={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredDoctors.map((doctor) => (
                <Grid item xs={12} md={6} lg={4} key={doctor._id}>
                  <Card
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                      borderRadius: 3,
                      boxShadow: theme.shadows[2],
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8]
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={doctor.profileImage}
                          alt={doctor.name}
                          sx={{
                            width: 64,
                            height: 64,
                            mr: 2,
                            bgcolor: theme.palette.primary.main
                          }}
                        >
                          {doctor.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {doctor.name}
                          </Typography>
                          {doctor.profile?.specialization && (
                            <Chip
                              icon={<MedicalIcon fontSize="small" />}
                              label={doctor.profile.specialization}
                              size="small"
                              sx={{ mb: 0.5 }}
                            />
                          )}
                          {doctor.rating && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <StarIcon sx={{ color: theme.palette.warning.main, fontSize: 18, mr: 0.5 }} />
                              <Typography variant="body2">
                                {doctor.rating} / 5
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {doctor.hospital && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {doctor.hospital.name}
                          </Typography>
                        </Box>
                      )}

                      {doctor.profile?.experience && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Experience: {doctor.profile.experience} years
                        </Typography>
                      )}

                      {doctor.profile?.bio && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {doctor.profile.bio.length > 100
                            ? `${doctor.profile.bio.substring(0, 100)}...`
                            : doctor.profile.bio}
                        </Typography>
                      )}

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<ChatIcon />}
                          onClick={() => handleChatWithDoctor(doctor._id)}
                          sx={{ flex: 1, borderRadius: 2 }}
                        >
                          Chat
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<VideoCallIcon />}
                          onClick={() => handleVideoCallWithDoctor(doctor._id)}
                          sx={{ flex: 1, borderRadius: 2 }}
                        >
                          Call
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default PatientDoctorsPage;
