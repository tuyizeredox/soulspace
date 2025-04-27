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

const UserFilters = ({ onFilterChange, onSearch }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    dateRange: [0, 30], // days
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

  const handleDateRangeChange = (event, newValue) => {
    setFilters({
      ...filters,
      dateRange: newValue,
    });

    // Update active filters
    const dateRangeLabel = `Last ${newValue[1]} days`;
    if (!activeFilters.some(filter => filter.field === 'dateRange')) {
      setActiveFilters([...activeFilters, { field: 'dateRange', value: dateRangeLabel }]);
    } else {
      setActiveFilters(activeFilters.map(filter => 
        filter.field === 'dateRange' ? { ...filter, value: dateRangeLabel } : filter
      ));
    }

    // Notify parent component
    onFilterChange({
      ...filters,
      dateRange: newValue,
    });
  };

  const handleRemoveFilter = (field) => {
    // Remove from active filters
    setActiveFilters(activeFilters.filter(filter => filter.field !== field));

    // Reset the filter value
    setFilters({
      ...filters,
      [field]: field === 'dateRange' ? [0, 30] : '',
    });

    // Notify parent component
    onFilterChange({
      ...filters,
      [field]: field === 'dateRange' ? [0, 30] : '',
    });
  };

  const handleClearAll = () => {
    setSearchTerm('');
    setFilters({
      role: '',
      status: '',
      dateRange: [0, 30],
    });
    setActiveFilters([]);
    onFilterChange({
      role: '',
      status: '',
      dateRange: [0, 30],
    });
    onSearch('');
  };

  const getFilterLabel = (filter) => {
    switch (filter.field) {
      case 'role':
        return `Role: ${filter.value}`;
      case 'status':
        return `Status: ${filter.value}`;
      case 'dateRange':
        return filter.value;
      default:
        return `${filter.field}: ${filter.value}`;
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search users by name, email, or ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              sx={{ 
                borderRadius: 2,
                px: 3,
                whiteSpace: 'nowrap',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
            >
              Search
            </Button>
            <Button
              variant={expanded ? "contained" : "outlined"}
              color="secondary"
              onClick={() => setExpanded(!expanded)}
              startIcon={expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              sx={{ 
                borderRadius: 2,
                whiteSpace: 'nowrap',
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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {activeFilters.map((filter, index) => (
              <Chip
                key={index}
                label={getFilterLabel(filter)}
                onDelete={() => handleRemoveFilter(filter.field)}
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            ))}
            <Chip
              label="Clear All"
              onClick={handleClearAll}
              color="error"
              variant="outlined"
              deleteIcon={<ClearIcon />}
              onDelete={handleClearAll}
              sx={{ borderRadius: 2 }}
            />
          </Box>
        )}

        {/* Advanced filters */}
        <Collapse in={expanded}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="role-filter-label">Role</InputLabel>
                <Select
                  labelId="role-filter-label"
                  id="role-filter"
                  value={filters.role}
                  label="Role"
                  onChange={handleFilterChange('role')}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                  <MenuItem value="hospital_admin">Hospital Admin</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="pharmacist">Pharmacist</MenuItem>
                  <MenuItem value="insurance_provider">Insurance Provider</MenuItem>
                  <MenuItem value="emergency_responder">Emergency Responder</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={filters.status}
                  label="Status"
                  onChange={handleFilterChange('status')}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Registration Date Range</Typography>
              <Slider
                value={filters.dateRange}
                onChange={handleDateRangeChange}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value} days`}
                min={0}
                max={365}
                sx={{
                  '& .MuiSlider-thumb': {
                    height: 24,
                    width: 24,
                    backgroundColor: '#fff',
                    border: `2px solid ${theme.palette.primary.main}`,
                    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                      boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                    },
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Last {filters.dateRange[0]} days</Typography>
                <Typography variant="caption" color="text.secondary">Last {filters.dateRange[1]} days</Typography>
              </Box>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>
    </motion.div>
  );
};

export default UserFilters;
