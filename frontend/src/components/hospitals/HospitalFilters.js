import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Collapse,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const HospitalFilters = ({ onFilterChange, onSearch }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    region: '',
    status: '',
    capacity: [0, 1000], // beds
    adminFilter: '', // Filter by admin presence
  });
  const [activeFilters, setActiveFilters] = useState([]);

  // Animation variants
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (field) => (e) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      [field]: value,
    });

    // Add to active filters if not empty
    if (value && !activeFilters.some(filter => filter.field === field)) {
      setActiveFilters([...activeFilters, { field, value }]);
    } else if (!value) {
      setActiveFilters(activeFilters.filter(filter => filter.field !== field));
    } else {
      setActiveFilters(activeFilters.map(filter =>
        filter.field === field ? { ...filter, value } : filter
      ));
    }

    // Notify parent component
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleCapacityChange = (event, newValue) => {
    setFilters({
      ...filters,
      capacity: newValue,
    });

    // Update active filters
    const capacityLabel = `${newValue[0]} - ${newValue[1]} beds`;
    if (!activeFilters.some(filter => filter.field === 'capacity')) {
      setActiveFilters([...activeFilters, { field: 'capacity', value: capacityLabel }]);
    } else {
      setActiveFilters(activeFilters.map(filter =>
        filter.field === 'capacity' ? { ...filter, value: capacityLabel } : filter
      ));
    }

    // Notify parent component
    onFilterChange({
      ...filters,
      capacity: newValue,
    });
  };

  const handleRemoveFilter = (field) => {
    // Remove from active filters
    setActiveFilters(activeFilters.filter(filter => filter.field !== field));

    // Reset the filter value
    setFilters({
      ...filters,
      [field]: field === 'capacity' ? [0, 1000] : '',
    });

    // Notify parent component
    onFilterChange({
      ...filters,
      [field]: field === 'capacity' ? [0, 1000] : '',
    });
  };

  const handleClearAll = () => {
    setSearchTerm('');
    setFilters({
      type: '',
      region: '',
      status: '',
      capacity: [0, 1000],
      adminFilter: '',
    });
    setActiveFilters([]);
    onFilterChange({
      type: '',
      region: '',
      status: '',
      capacity: [0, 1000],
      adminFilter: '',
    });
    onSearch('');
  };

  const getFilterLabel = (filter) => {
    switch (filter.field) {
      case 'type':
        return `Type: ${filter.value}`;
      case 'region':
        return `Region: ${filter.value}`;
      case 'status':
        return `Status: ${filter.value}`;
      case 'capacity':
        return `Capacity: ${filter.value}`;
      case 'adminFilter':
        return `Admin: ${filter.value === 'has_admin' ? 'Has Admin' : 'No Admin'}`;
      default:
        return `${filter.field}: ${filter.value}`;
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'column', md: 'row' },
          gap: { xs: 1, sm: 2 },
          mb: 2
        }}>
          <TextField
            fullWidth
            placeholder="Search hospitals by name, admin, email..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          />
          <Box sx={{
            display: 'flex',
            gap: 1,
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'space-between', md: 'flex-start' }
          }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              size="small"
              sx={{
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.2 },
                whiteSpace: 'nowrap',
                flex: { xs: 1, md: 'none' },
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              Search
            </Button>
            <Button
              variant={expanded ? "contained" : "outlined"}
              color="secondary"
              onClick={() => setExpanded(!expanded)}
              startIcon={expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              size="small"
              sx={{
                borderRadius: 2,
                whiteSpace: 'nowrap',
                flex: { xs: 1, md: 'none' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                py: { xs: 1, sm: 1.2 },
                ...(expanded && {
                  background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                })
              }}
            >
              Filters
            </Button>
          </Box>
        </Box>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 0.5, sm: 1 },
            mb: 2
          }}>
            {activeFilters.map((filter, index) => (
              <Chip
                key={index}
                label={getFilterLabel(filter)}
                onDelete={() => handleRemoveFilter(filter.field)}
                color="primary"
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 2,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  height: { xs: 24, sm: 32 },
                  '& .MuiChip-label': {
                    px: { xs: 1, sm: 1.5 }
                  }
                }}
              />
            ))}
            <Chip
              label="Clear All"
              onClick={handleClearAll}
              color="error"
              variant="outlined"
              deleteIcon={<ClearIcon fontSize="small" />}
              onDelete={handleClearAll}
              size="small"
              sx={{
                borderRadius: 2,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: 24, sm: 32 },
                '& .MuiChip-label': {
                  px: { xs: 1, sm: 1.5 }
                }
              }}
            />
          </Box>
        )}

        {/* Advanced filters */}
        <Collapse in={expanded}>
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mt: { xs: 0.5, sm: 1 } }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="type-filter-label">Hospital Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  id="type-filter"
                  value={filters.type}
                  label="Hospital Type"
                  onChange={handleFilterChange('type')}
                  sx={{
                    borderRadius: 2,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="general">General Hospital</MenuItem>
                  <MenuItem value="specialty">Specialty Hospital</MenuItem>
                  <MenuItem value="teaching">Teaching Hospital</MenuItem>
                  <MenuItem value="clinic">Clinic</MenuItem>
                  <MenuItem value="rehabilitation">Rehabilitation Center</MenuItem>
                  <MenuItem value="psychiatric">Psychiatric Hospital</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="region-filter-label">Region</InputLabel>
                <Select
                  labelId="region-filter-label"
                  id="region-filter"
                  value={filters.region}
                  label="Region"
                  onChange={handleFilterChange('region')}
                  sx={{
                    borderRadius: 2,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  <MenuItem value="">All Regions</MenuItem>
                  <MenuItem value="northeast">Northeast</MenuItem>
                  <MenuItem value="southeast">Southeast</MenuItem>
                  <MenuItem value="midwest">Midwest</MenuItem>
                  <MenuItem value="southwest">Southwest</MenuItem>
                  <MenuItem value="west">West</MenuItem>
                  <MenuItem value="international">International</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={filters.status}
                  label="Status"
                  onChange={handleFilterChange('status')}
                  sx={{
                    borderRadius: 2,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending Approval</MenuItem>
                  <MenuItem value="maintenance">Under Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="admin-filter-label">Admin Status</InputLabel>
                <Select
                  labelId="admin-filter-label"
                  id="admin-filter"
                  value={filters.adminFilter}
                  label="Admin Status"
                  onChange={handleFilterChange('adminFilter')}
                  sx={{
                    borderRadius: 2,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  <MenuItem value="">All Hospitals</MenuItem>
                  <MenuItem value="has_admin">Has Admin</MenuItem>
                  <MenuItem value="no_admin">No Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Bed Capacity Range
              </Typography>
              <Slider
                value={filters.capacity}
                onChange={handleCapacityChange}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
                sx={{
                  mt: { xs: 1, sm: 2 },
                  '& .MuiSlider-thumb': {
                    height: { xs: 16, sm: 24 },
                    width: { xs: 16, sm: 24 },
                    backgroundColor: '#fff',
                    border: `2px solid ${theme.palette.primary.main}`,
                    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                      boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                    },
                  },
                  '& .MuiSlider-rail': {
                    height: { xs: 4, sm: 6 }
                  },
                  '& .MuiSlider-track': {
                    height: { xs: 4, sm: 6 }
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  {filters.capacity[0]} beds
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  {filters.capacity[1]} beds
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>
    </motion.div>
  );
};

export default HospitalFilters;
