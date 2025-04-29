import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Card,
  CardContent,
  Divider,
  Chip,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocationOn as LocationIcon,
  ViewList as ListIcon,
  Map as MapIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import HospitalCard from '../../components/hospitals/HospitalCard';

const HospitalDirectory = () => {
  const theme = useTheme();
  
  // State for hospitals and loading
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // State for pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Unique locations and types for filters
  const [locations, setLocations] = useState([]);
  const [types, setTypes] = useState([]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };
  
  // Fetch hospitals
  const fetchHospitals = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError('');
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };
      
      // Fetch hospitals from API
      const response = await axios.get('/api/hospitals/nearby', config);
      
      // If we have data, process it
      if (response.data && Array.isArray(response.data)) {
        setHospitals(response.data);
        setFilteredHospitals(response.data);
        
        // Extract unique locations and types for filters
        const uniqueLocations = [...new Set(response.data.map(hospital => 
          hospital.city || hospital.state || extractLocationFromAddress(hospital.location || hospital.address)
        ))].filter(Boolean);
        
        const uniqueTypes = [...new Set(response.data.map(hospital => hospital.type))].filter(Boolean);
        
        setLocations(uniqueLocations);
        setTypes(uniqueTypes);
      } else {
        // If no data or invalid format, set error
        setError('No hospitals found or invalid data format');
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setError('Error fetching hospitals. Please try again.');
      
      // Use mock data as fallback
      const mockHospitals = [
        {
          id: '1',
          name: 'Metro General Hospital',
          location: '123 Health Street, New York, NY',
          city: 'New York',
          state: 'NY',
          type: 'general',
          rating: '4.5',
          distance: '2.3 miles',
          phone: '(212) 555-1234',
          email: 'info@metrogeneral.com',
          website: 'www.metrogeneral.com',
          beds: 250
        },
        {
          id: '2',
          name: 'City Medical Center',
          location: '456 Wellness Avenue, Boston, MA',
          city: 'Boston',
          state: 'MA',
          type: 'teaching',
          rating: '4.8',
          distance: '3.7 miles',
          phone: '(617) 555-5678',
          email: 'contact@citymedical.com',
          website: 'www.citymedical.com',
          beds: 350
        },
        {
          id: '3',
          name: 'Westside Health Center',
          location: '789 Recovery Boulevard, Los Angeles, CA',
          city: 'Los Angeles',
          state: 'CA',
          type: 'specialty',
          rating: '4.2',
          distance: '5.1 miles',
          phone: '(310) 555-9012',
          email: 'info@westsidehealth.com',
          website: 'www.westsidehealth.com',
          beds: 150
        },
        {
          id: '4',
          name: 'Community Hospital',
          location: '321 Care Lane, Chicago, IL',
          city: 'Chicago',
          state: 'IL',
          type: 'general',
          rating: '4.6',
          distance: '6.5 miles',
          phone: '(312) 555-3456',
          email: 'info@communityhospital.com',
          website: 'www.communityhospital.com',
          beds: 200
        },
        {
          id: '5',
          name: 'Rehabilitation Center',
          location: '654 Therapy Road, Miami, FL',
          city: 'Miami',
          state: 'FL',
          type: 'rehabilitation',
          rating: '4.4',
          distance: '4.2 miles',
          phone: '(305) 555-7890',
          email: 'info@rehabcenter.com',
          website: 'www.rehabcenter.com',
          beds: 100
        },
        {
          id: '6',
          name: 'Children\'s Medical Center',
          location: '987 Pediatric Way, Seattle, WA',
          city: 'Seattle',
          state: 'WA',
          type: 'specialty',
          rating: '4.9',
          distance: '7.8 miles',
          phone: '(206) 555-2345',
          email: 'info@childrensmedical.com',
          website: 'www.childrensmedical.com',
          beds: 180
        },
        {
          id: '7',
          name: 'Mental Health Institute',
          location: '246 Wellness Street, Denver, CO',
          city: 'Denver',
          state: 'CO',
          type: 'psychiatric',
          rating: '4.3',
          distance: '3.9 miles',
          phone: '(303) 555-6789',
          email: 'info@mentalhealthinstitute.com',
          website: 'www.mentalhealthinstitute.com',
          beds: 120
        },
        {
          id: '8',
          name: 'Urgent Care Clinic',
          location: '135 Emergency Road, Atlanta, GA',
          city: 'Atlanta',
          state: 'GA',
          type: 'clinic',
          rating: '4.1',
          distance: '1.5 miles',
          phone: '(404) 555-0123',
          email: 'info@urgentcareclinic.com',
          website: 'www.urgentcareclinic.com',
          beds: 50
        }
      ];
      
      setHospitals(mockHospitals);
      setFilteredHospitals(mockHospitals);
      
      // Extract unique locations and types for filters
      const uniqueLocations = [...new Set(mockHospitals.map(hospital => hospital.city || hospital.state))].filter(Boolean);
      const uniqueTypes = [...new Set(mockHospitals.map(hospital => hospital.type))].filter(Boolean);
      
      setLocations(uniqueLocations);
      setTypes(uniqueTypes);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  // Extract location from address string
  const extractLocationFromAddress = (address) => {
    if (!address) return '';
    
    // Try to extract city or state from address
    const parts = address.split(',');
    if (parts.length > 1) {
      return parts[1].trim();
    }
    
    return address;
  };
  
  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...hospitals];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(hospital => 
        hospital.name.toLowerCase().includes(query) ||
        (hospital.location && hospital.location.toLowerCase().includes(query)) ||
        (hospital.address && hospital.address.toLowerCase().includes(query)) ||
        (hospital.city && hospital.city.toLowerCase().includes(query)) ||
        (hospital.state && hospital.state.toLowerCase().includes(query))
      );
    }
    
    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter(hospital => 
        (hospital.city && hospital.city === locationFilter) ||
        (hospital.state && hospital.state === locationFilter) ||
        (hospital.location && hospital.location.includes(locationFilter)) ||
        (hospital.address && hospital.address.includes(locationFilter))
      );
    }
    
    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(hospital => hospital.type === typeFilter);
    }
    
    setFilteredHospitals(filtered);
    setPage(1); // Reset to first page when filters change
  }, [hospitals, searchQuery, locationFilter, typeFilter]);
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setLocationFilter('');
    setTypeFilter('');
    setFilteredHospitals(hospitals);
    setPage(1);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchHospitals(true);
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle view mode change
  const handleViewModeChange = (event, newValue) => {
    if (newValue !== null) {
      setViewMode(newValue);
    }
  };
  
  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);
  
  // Fetch hospitals on component mount
  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);
  
  // Calculate pagination
  const paginatedHospitals = filteredHospitals.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const pageCount = Math.ceil(filteredHospitals.length / itemsPerPage);
  
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
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          Hospital Directory
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ 
            mb: 3,
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          Find the perfect hospital for your healthcare needs
        </Typography>
      </Box>
      
      {/* Filters */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: 'blur(10px)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Hospitals"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              placeholder="Search by name, location..."
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="location-filter-label">Location</InputLabel>
              <Select
                labelId="location-filter-label"
                id="location-filter"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                label="Location"
                startAdornment={
                  <InputAdornment position="start">
                    <LocationIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Locations</MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="type-filter-label">Hospital Type</InputLabel>
              <Select
                labelId="type-filter-label"
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Hospital Type"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Types</MenuItem>
                {types.map((type) => (
                  <MenuItem key={type} value={type}>
                    {getHospitalTypeLabel(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={clearFilters}
                disabled={!searchQuery && !locationFilter && !typeFilter}
                startIcon={<ClearIcon />}
              >
                Clear
              </Button>
              <IconButton 
                color="primary" 
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* View mode selector and results count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {filteredHospitals.length} {filteredHospitals.length === 1 ? 'hospital' : 'hospitals'} found
        </Typography>
        
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          aria-label="view mode"
          sx={{
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 2
            }
          }}
        >
          <Tab 
            icon={<ListIcon />} 
            label="List" 
            value="list" 
            iconPosition="start"
          />
          <Tab 
            icon={<MapIcon />} 
            label="Grid" 
            value="grid" 
            iconPosition="start"
          />
        </Tabs>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Hospital list */}
      {!loading && filteredHospitals.length === 0 && (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            borderRadius: 2
          }}
        >
          <Typography variant="h5" gutterBottom>
            No hospitals found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search criteria or clear filters
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </Box>
      )}
      
      {!loading && filteredHospitals.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <Grid 
              container 
              spacing={3}
              component={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {paginatedHospitals.map((hospital) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  lg={3} 
                  key={hospital.id}
                  component={motion.div}
                  variants={itemVariants}
                >
                  <HospitalCard hospital={hospital} compact />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box 
              component={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {paginatedHospitals.map((hospital) => (
                <Box 
                  key={hospital.id} 
                  sx={{ mb: 3 }}
                  component={motion.div}
                  variants={itemVariants}
                >
                  <HospitalCard hospital={hospital} />
                </Box>
              ))}
            </Box>
          )}
          
          {/* Pagination */}
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={pageCount} 
                page={page} 
                onChange={handlePageChange} 
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default HospitalDirectory;
