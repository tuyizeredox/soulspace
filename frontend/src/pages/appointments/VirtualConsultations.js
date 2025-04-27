import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  VideoCall,
  CalendarMonth,
  AccessTime,
  Search,
  FilterList,
  Star,
  CheckCircle,
  ArrowForward,
  LocalHospital,
  Person,
  MedicalServices,
  Favorite,
  HealthAndSafety,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Sample data for doctors
const doctors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    hospital: 'Metro General Hospital',
    rating: 4.9,
    reviews: 124,
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    availableDates: [
      { date: '2023-06-15', slots: ['09:00 AM', '11:30 AM', '2:00 PM'] },
      { date: '2023-06-16', slots: ['10:00 AM', '1:30 PM', '4:00 PM'] },
      { date: '2023-06-17', slots: ['09:30 AM', '12:00 PM', '3:30 PM'] },
    ],
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'Neurologist',
    hospital: 'City Medical Center',
    rating: 4.8,
    reviews: 98,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    availableDates: [
      { date: '2023-06-15', slots: ['10:00 AM', '1:00 PM', '3:30 PM'] },
      { date: '2023-06-16', slots: ['09:30 AM', '12:30 PM', '4:30 PM'] },
      { date: '2023-06-18', slots: ['11:00 AM', '2:30 PM', '5:00 PM'] },
    ],
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatologist',
    hospital: 'Westside Health Center',
    rating: 4.7,
    reviews: 87,
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
    availableDates: [
      { date: '2023-06-16', slots: ['09:00 AM', '11:00 AM', '2:30 PM'] },
      { date: '2023-06-17', slots: ['10:30 AM', '1:30 PM', '4:00 PM'] },
      { date: '2023-06-19', slots: ['09:30 AM', '12:00 PM', '3:00 PM'] },
    ],
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    specialty: 'Orthopedic Surgeon',
    hospital: 'Metro General Hospital',
    rating: 4.9,
    reviews: 156,
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    availableDates: [
      { date: '2023-06-15', slots: ['08:30 AM', '11:00 AM', '3:30 PM'] },
      { date: '2023-06-17', slots: ['09:00 AM', '1:00 PM', '4:30 PM'] },
      { date: '2023-06-18', slots: ['10:30 AM', '2:00 PM', '5:00 PM'] },
    ],
  },
];

// Specialties list
const specialties = [
  'All Specialties',
  'Cardiology',
  'Neurology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Gynecology',
  'Ophthalmology',
  'Urology',
];

const VirtualConsultations = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('All Specialties');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Filter doctors based on search and specialty
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = specialty === 'All Specialties' || 
                            doctor.specialty.toLowerCase().includes(specialty.toLowerCase());
    
    return matchesSearch && matchesSpecialty;
  });

  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setActiveStep(1);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    setActiveStep(2);
  };

  // Handle booking another appointment
  const handleBookAnother = () => {
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime('');
    setActiveStep(0);
  };

  // Render doctor selection step
  const renderDoctorSelection = () => (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search doctors by name, specialty, or hospital"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
              <InputLabel>Specialty</InputLabel>
              <Select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                label="Specialty"
                startAdornment={<FilterList sx={{ color: 'text.secondary', mr: 1 }} />}
              >
                {specialties.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          {filteredDoctors.map((doctor) => (
            <Grid item xs={12} md={6} key={doctor.id}>
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.shadows[10],
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={doctor.image}
                      alt={doctor.name}
                      sx={{ width: 64, height: 64, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {doctor.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doctor.specialty}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <LocalHospital sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {doctor.hospital}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ color: '#FFB400', mr: 0.5 }} />
                      <Typography variant="body2" fontWeight={500}>
                        {doctor.rating} ({doctor.reviews} reviews)
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForward />}
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      Book Consultation
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Box>
  );

  // Render date and time selection step
  const renderDateTimeSelection = () => (
    <Box>
      <Button
        variant="text"
        color="primary"
        onClick={() => setActiveStep(0)}
        sx={{ mb: 2 }}
      >
        ← Back to Doctor Selection
      </Button>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={selectedDoctor?.image}
            alt={selectedDoctor?.name}
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <Box>
            <Typography variant="h6" gutterBottom>
              {selectedDoctor?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedDoctor?.specialty}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <LocalHospital sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {selectedDoctor?.hospital}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Select Date
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={selectedDate}
                onChange={handleDateSelect}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Select Time
            </Typography>
            {selectedDate ? (
              <Grid container spacing={2}>
                {['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'].map((time) => (
                  <Grid item xs={6} sm={4} key={time}>
                    <Button
                      variant={selectedTime === time ? 'contained' : 'outlined'}
                      color="primary"
                      fullWidth
                      onClick={() => handleTimeSelect(time)}
                      startIcon={<AccessTime />}
                      sx={{ py: 1 }}
                    >
                      {time}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">
                Please select a date first
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          endIcon={<ArrowForward />}
          disabled={!selectedDate || !selectedTime}
          onClick={handleConfirmBooking}
          sx={{ px: 4, py: 1.5 }}
        >
          Confirm Booking
        </Button>
      </Box>
    </Box>
  );

  // Render confirmation step
  const renderConfirmation = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Avatar
          sx={{
            bgcolor: theme.palette.success.main,
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 3,
          }}
        >
          <CheckCircle sx={{ fontSize: 40 }} />
        </Avatar>
      </motion.div>
      <Typography variant="h4" gutterBottom>
        Virtual Consultation Booked!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
        Your virtual consultation with {selectedDoctor?.name} has been scheduled for {selectedDate?.toDateString()} at {selectedTime}.
        You will receive a confirmation email with details and a link to join the video call.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          maxWidth: 500,
          mx: 'auto',
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={selectedDoctor?.image}
            alt={selectedDoctor?.name}
            sx={{ width: 48, height: 48, mr: 2 }}
          />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h6">
              {selectedDoctor?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedDoctor?.specialty}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarMonth sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedDate?.toDateString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedTime}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={handleBookAnother}
          sx={{ px: 4, py: 1.5 }}
        >
          Book Another Consultation
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          endIcon={<VideoCall />}
          onClick={() => {}}
          sx={{ px: 4, py: 1.5 }}
        >
          View My Consultations
        </Button>
      </Box>
    </Box>
  );

  // Render content based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderDoctorSelection();
      case 1:
        return renderDateTimeSelection();
      case 2:
        return renderConfirmation();
      default:
        return renderDoctorSelection();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Virtual Consultations
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Connect with healthcare professionals from the comfort of your home
          </Typography>
        </motion.div>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            mb: 4,
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            <Step>
              <StepLabel>Select Doctor</StepLabel>
            </Step>
            <Step>
              <StepLabel>Choose Date & Time</StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirmation</StepLabel>
            </Step>
          </Stepper>
        </Paper>

        {renderStepContent()}
      </Box>
    </Container>
  );
};

export default VirtualConsultations;
