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
import axios from 'axios';

const HospitalDoctorSelection = ({ hospital, doctor, onHospitalChange, onDoctorChange }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  // Fetch hospitals and doctors on component mount
  useEffect(() => {
    fetchHospitalsAndDoctors();
  }, []);

  // Filter doctors when hospital changes
  useEffect(() => {
    if (hospital) {
      const filtered = doctors.filter(doc => doc.hospital === hospital || doc.hospitals.includes(hospital));
      setFilteredDoctors(filtered);
      
      // Extract unique specialties
      const uniqueSpecialties = [...new Set(filtered.map(doc => doc.specialty))];
      setSpecialties(uniqueSpecialties);
    } else {
      setFilteredDoctors(doctors);
      
      // Extract unique specialties from all doctors
      const uniqueSpecialties = [...new Set(doctors.map(doc => doc.specialty))];
      setSpecialties(uniqueSpecialties);
    }
  }, [hospital, doctors]);

  // Filter doctors when search term or specialty changes
  useEffect(() => {
    let filtered = hospital 
      ? doctors.filter(doc => doc.hospital === hospital || doc.hospitals.includes(hospital))
      : doctors;
    
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedSpecialty) {
      filtered = filtered.filter(doc => doc.specialty === selectedSpecialty);
    }
    
    setFilteredDoctors(filtered);
  }, [searchTerm, selectedSpecialty, hospital, doctors]);

  const fetchHospitalsAndDoctors = async () => {
    setLoading(true);
    try {
      const [hospitalsRes, doctorsRes] = await Promise.all([
        axios.get('/api/hospitals'),
        axios.get('/api/doctors')
      ]);
      
      setHospitals(hospitalsRes.data);
      setDoctors(doctorsRes.data);
      setFilteredDoctors(doctorsRes.data);
      
      // Extract unique specialties
      const uniqueSpecialties = [...new Set(doctorsRes.data.map(doc => doc.specialty))];
      setSpecialties(uniqueSpecialties);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalChange = (event) => {
    const selectedHospital = event.target.value;
    onHospitalChange(selectedHospital);
    
    // Reset doctor selection when hospital changes
    onDoctorChange('');
  };

  const handleDoctorSelect = (doctorId) => {
    onDoctorChange(doctorId);
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

      <Grid container spacing={3}>
        {/* Hospital Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Hospital
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Hospital</InputLabel>
              <Select
                value={hospital}
                onChange={handleHospitalChange}
                label="Hospital"
              >
                {hospitals.map((hosp) => (
                  <MenuItem key={hosp.id} value={hosp.id}>
                    {hosp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Doctor Selection */}
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
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
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
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredDoctors.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No doctors found matching your criteria. Please adjust your filters.
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
                          sx={{ width: 80, height: 80, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="h6">{doc.name}</Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {doc.specialty}
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
      </Grid>
    </Box>
  );
};

export default HospitalDoctorSelection;
