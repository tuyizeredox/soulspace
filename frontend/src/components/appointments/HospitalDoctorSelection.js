import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  CircularProgress,
  Autocomplete,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Button,
  useTheme
} from '@mui/material';
import { Search, LocationOn, Star, MedicalServices } from '@mui/icons-material';
import axios from '../../utils/axios';

const HospitalDoctorSelection = ({ hospital, doctor, onHospitalChange, onDoctorChange }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [error, setError] = useState('');

  // Fetch hospitals on component mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  // Fetch doctors when hospital changes
  useEffect(() => {
    if (hospital) {
      fetchDoctorsByHospital(hospital);
    } else {
      setDoctors([]);
      setFilteredDoctors([]);
      setSpecialties([]);
    }
  }, [hospital]);

  // Filter doctors when search term or specialty changes
  useEffect(() => {
    let filtered = [...doctors];

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.specialization && doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedSpecialty) {
      filtered = filtered.filter(doc => doc.specialization === selectedSpecialty);
    }

    setFilteredDoctors(filtered);
  }, [searchTerm, selectedSpecialty, doctors]);

  // Fetch hospitals from API
  const fetchHospitals = async () => {
    setHospitalLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/hospitals/nearby');

      if (response.data && Array.isArray(response.data)) {
        setHospitals(response.data);
      } else {
        setError('No hospitals found or invalid data format');
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setError('Error fetching hospitals. Please try again.');

      // Use mock data as fallback
      const mockHospitals = [
        { id: '1', name: 'Metro General Hospital', location: 'New York, NY' },
        { id: '2', name: 'City Medical Center', location: 'Boston, MA' },
        { id: '3', name: 'Westside Health Center', location: 'Los Angeles, CA' },
        { id: '4', name: 'Community Hospital', location: 'Chicago, IL' }
      ];

      setHospitals(mockHospitals);
    } finally {
      setHospitalLoading(false);
    }
  };

  // Fetch doctors by hospital ID
  const fetchDoctorsByHospital = async (hospitalId) => {
    setDoctorLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/hospitals/${hospitalId}/doctors`);

      if (response.data && Array.isArray(response.data)) {
        setDoctors(response.data);
        setFilteredDoctors(response.data);

        // Extract unique specialties
        const uniqueSpecialties = [...new Set(response.data
          .map(doc => doc.specialization)
          .filter(Boolean))]; // Filter out null/undefined values

        setSpecialties(uniqueSpecialties);
      } else {
        setError('No doctors found for this hospital');
        setDoctors([]);
        setFilteredDoctors([]);
        setSpecialties([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Error fetching doctors. Please try again.');

      // Use mock data as fallback
      const mockDoctors = [
        {
          id: '101',
          name: 'Dr. John Smith',
          specialization: 'Cardiology',
          experience: '15 years',
          rating: 4.8,
          reviewCount: 42
        },
        {
          id: '102',
          name: 'Dr. Sarah Johnson',
          specialization: 'Neurology',
          experience: '12 years',
          rating: 4.7,
          reviewCount: 38
        },
        {
          id: '103',
          name: 'Dr. Michael Brown',
          specialization: 'Orthopedics',
          experience: '10 years',
          rating: 4.5,
          reviewCount: 31
        }
      ];

      setDoctors(mockDoctors);
      setFilteredDoctors(mockDoctors);

      // Extract unique specialties
      const uniqueSpecialties = [...new Set(mockDoctors.map(doc => doc.specialization))];
      setSpecialties(uniqueSpecialties);
    } finally {
      setDoctorLoading(false);
    }
  };

  const handleHospitalChange = (event) => {
    const selectedHospitalId = event.target.value;

    // Find the selected hospital to pass the full object to the parent
    const selectedHospital = hospitals.find(hosp => hosp.id === selectedHospitalId);

    onHospitalChange(selectedHospitalId, selectedHospital);

    // Reset doctor selection when hospital changes
    onDoctorChange('');
  };

  const handleDoctorSelect = (doctorId) => {
    // Find the selected doctor to pass the full object to the parent
    const selectedDoctor = doctors.find(doc => doc.id === doctorId);
    onDoctorChange(doctorId, selectedDoctor);
  };

  const handleSpecialtyChange = (event) => {
    setSelectedSpecialty(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Hospital & Doctor
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Choose your preferred hospital and healthcare provider for your appointment.
      </Typography>

      {error && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1, color: 'error.dark' }}>
          <Typography variant="body1">{error}</Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Hospital Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Hospital
            </Typography>

            {hospitalLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Hospital</InputLabel>
                <Select
                  value={hospital}
                  onChange={handleHospitalChange}
                  label="Hospital"
                >
                  <MenuItem value="">Select a hospital</MenuItem>
                  {hospitals.map((hosp) => (
                    <MenuItem key={hosp.id} value={hosp.id}>
                      {hosp.name} {hosp.location && `- ${hosp.location}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Paper>
        </Grid>

        {/* Doctor Selection - Only show if hospital is selected */}
        {hospital && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Select Doctor
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search doctors by name or specialty"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                    disabled={doctorLoading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={doctorLoading || specialties.length === 0}>
                    <InputLabel>Filter by Specialty</InputLabel>
                    <Select
                      value={selectedSpecialty}
                      onChange={handleSpecialtyChange}
                      label="Filter by Specialty"
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

              {doctorLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredDoctors.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No doctors found for this hospital. Please select a different hospital.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredDoctors.map((doc) => (
                    <Grid item xs={12} md={6} lg={4} key={doc.id}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          border: doctor === doc.id ? `2px solid ${theme.palette.primary.main}` : 'none',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: 6
                          }
                        }}
                        onClick={() => handleDoctorSelect(doc.id)}
                      >
                        <Box sx={{ display: 'flex', p: 2 }}>
                          <Avatar
                            src={doc.profileImage}
                            alt={doc.name}
                            sx={{
                              width: 80,
                              height: 80,
                              mr: 2,
                              bgcolor: theme.palette.primary.main
                            }}
                          >
                            {doc.name ? doc.name.charAt(0) : 'D'}
                          </Avatar>
                          <Box>
                            <Typography variant="h6">{doc.name}</Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {doc.specialization || 'General Medicine'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Rating value={doc.rating || 4.5} precision={0.5} size="small" readOnly />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                ({doc.reviewCount || 24} reviews)
                              </Typography>
                            </Box>
                            <Chip
                              icon={<MedicalServices fontSize="small" />}
                              label={doc.experience || '10+ years experience'}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        )}

        {/* Message when no hospital is selected */}
        {!hospital && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center', bgcolor: 'info.light' }}>
              <Typography variant="h6" color="info.dark" gutterBottom>
                Please select a hospital first
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Once you select a hospital, you'll be able to choose from the doctors available at that location.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default HospitalDoctorSelection;
