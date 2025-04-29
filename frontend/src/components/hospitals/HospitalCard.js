import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Rating,
  Button,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import {
  LocationOn,
  LocalHospital,
  Phone,
  Email,
  Language,
  ArrowForward
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HospitalCard = ({ hospital, compact = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Get hospital type label
  const getHospitalTypeLabel = (type) => {
    const types = {
      'general': 'General Hospital',
      'specialty': 'Specialty Hospital',
      'teaching': 'Teaching Hospital',
      'clinic': 'Clinic',
      'rehabilitation': 'Rehabilitation Center',
      'psychiatric': 'Psychiatric Hospital'
    };
    return types[type] || 'Hospital';
  };

  // Get hospital type color
  const getHospitalTypeColor = (type) => {
    const colors = {
      'general': theme.palette.primary.main,
      'specialty': theme.palette.secondary.main,
      'teaching': theme.palette.info.main,
      'clinic': theme.palette.success.main,
      'rehabilitation': theme.palette.warning.main,
      'psychiatric': theme.palette.error.main
    };
    return colors[type] || theme.palette.primary.main;
  };

  // Generate a placeholder image based on hospital name
  const getPlaceholderImage = (name) => {
    const colors = [
      '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return `https://via.placeholder.com/400x200/${colors[colorIndex].substring(1)}/FFFFFF?text=${encodeURIComponent(name)}`;
  };

  // Handle booking appointment
  const handleBookAppointment = () => {
    navigate('/dashboard', { state: { selectedHospital: hospital.id } });
  };

  // Handle view details
  const handleViewDetails = () => {
    navigate(`/hospitals/${hospital.id}`);
  };

  if (compact) {
    return (
      <Card 
        component={motion.div}
        whileHover={{ 
          y: -5,
          boxShadow: theme.shadows[10],
          transition: { duration: 0.3 }
        }}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: theme.shadows[2],
          transition: 'all 0.3s ease'
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="140"
            image={hospital.logo || getPlaceholderImage(hospital.name)}
            alt={hospital.name}
          />
          <Chip
            label={getHospitalTypeLabel(hospital.type)}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: alpha(getHospitalTypeColor(hospital.type), 0.9),
              color: '#fff',
              fontWeight: 500
            }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="h6" component="div" gutterBottom noWrap>
            {hospital.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {hospital.location || hospital.address || hospital.city}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating 
              value={parseFloat(hospital.rating) || 4.5} 
              precision={0.5} 
              size="small" 
              readOnly 
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              ({hospital.rating || '4.5'})
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalHospital fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {hospital.distance || 'Nearby'}
            </Typography>
          </Box>
        </CardContent>
        <Divider />
        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            size="small" 
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button 
            size="small" 
            variant="contained" 
            color="primary"
            onClick={handleBookAppointment}
            sx={{ 
              borderRadius: 4,
              px: 2
            }}
          >
            Book
          </Button>
        </Box>
      </Card>
    );
  }

  return (
    <Card 
      component={motion.div}
      whileHover={{ 
        y: -5,
        boxShadow: theme.shadows[10],
        transition: { duration: 0.3 }
      }}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: theme.shadows[2],
        transition: 'all 0.3s ease'
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={hospital.logo || getPlaceholderImage(hospital.name)}
          alt={hospital.name}
        />
        <Chip
          label={getHospitalTypeLabel(hospital.type)}
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: alpha(getHospitalTypeColor(hospital.type), 0.9),
            color: '#fff',
            fontWeight: 500,
            px: 1.5,
            py: 0.75
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" component="div" gutterBottom fontWeight={600}>
          {hospital.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating 
            value={parseFloat(hospital.rating) || 4.5} 
            precision={0.5} 
            readOnly 
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({hospital.rating || '4.5'})
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
          <LocationOn sx={{ color: theme.palette.text.secondary, mr: 1, mt: 0.5 }} />
          <Typography variant="body1" color="text.secondary">
            {hospital.address || hospital.location}
            {hospital.city && `, ${hospital.city}`}
            {hospital.state && `, ${hospital.state}`}
            {hospital.zipCode && ` ${hospital.zipCode}`}
          </Typography>
        </Box>
        
        {hospital.distance && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <LocalHospital sx={{ color: theme.palette.text.secondary, mr: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {hospital.distance} from your location
            </Typography>
          </Box>
        )}
        
        {hospital.phone && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Phone sx={{ color: theme.palette.text.secondary, mr: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {hospital.phone}
            </Typography>
          </Box>
        )}
        
        {hospital.email && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Email sx={{ color: theme.palette.text.secondary, mr: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {hospital.email}
            </Typography>
          </Box>
        )}
        
        {hospital.website && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Language sx={{ color: theme.palette.text.secondary, mr: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {hospital.website}
            </Typography>
          </Box>
        )}
        
        {hospital.beds && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <LocalHospital sx={{ color: theme.palette.text.secondary, mr: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {hospital.beds} beds available
            </Typography>
          </Box>
        )}
      </CardContent>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          onClick={handleViewDetails}
          startIcon={<LocalHospital />}
        >
          View Details
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleBookAppointment}
          endIcon={<ArrowForward />}
          sx={{ 
            borderRadius: 6,
            px: 3
          }}
        >
          Book Appointment
        </Button>
      </Box>
    </Card>
  );
};

export default HospitalCard;
