import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Typography,
  Button,
  Divider,
  useTheme
} from '@mui/material';
import {
  Clear as ClearIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const AppointmentFilters = ({ onFilterChange }) => {
  const theme = useTheme();
  const [filters, setFilters] = useState({
    appointmentType: '',
    patientAge: '',
    priority: '',
    dateRange: {
      start: null,
      end: null
    },
    patientGender: '',
    department: '',
    followUpRequired: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (key, value) => {
    const newDateRange = { ...filters.dateRange, [key]: value };
    const newFilters = { ...filters, dateRange: newDateRange };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      appointmentType: '',
      patientAge: '',
      priority: '',
      dateRange: {
        start: null,
        end: null
      },
      patientGender: '',
      department: '',
      followUpRequired: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'dateRange') {
        if (value.start || value.end) count++;
      } else if (value) {
        count++;
      }
    });
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ mt: 2, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Advanced Filters
              </Typography>
              {activeFiltersCount > 0 && (
                <Chip
                  label={`${activeFiltersCount} active`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            {activeFiltersCount > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearAllFilters}
                sx={{ textTransform: 'none' }}
              >
                Clear All
              </Button>
            )}
          </Box>

          <Grid container spacing={2}>
            {/* Appointment Type */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Appointment Type</InputLabel>
                <Select
                  value={filters.appointmentType}
                  label="Appointment Type"
                  onChange={(e) => handleFilterChange('appointmentType', e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="consultation">Consultation</MenuItem>
                  <MenuItem value="follow-up">Follow-up</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                  <MenuItem value="routine">Routine Checkup</MenuItem>
                  <MenuItem value="specialist">Specialist Visit</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Patient Age Range */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Patient Age</InputLabel>
                <Select
                  value={filters.patientAge}
                  label="Patient Age"
                  onChange={(e) => handleFilterChange('patientAge', e.target.value)}
                >
                  <MenuItem value="">All Ages</MenuItem>
                  <MenuItem value="0-18">Children (0-18)</MenuItem>
                  <MenuItem value="19-35">Young Adults (19-35)</MenuItem>
                  <MenuItem value="36-55">Adults (36-55)</MenuItem>
                  <MenuItem value="56-70">Seniors (56-70)</MenuItem>
                  <MenuItem value="70+">Elderly (70+)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Priority */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  label="Priority"
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Patient Gender */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Patient Gender</InputLabel>
                <Select
                  value={filters.patientGender}
                  label="Patient Gender"
                  onChange={(e) => handleFilterChange('patientGender', e.target.value)}
                >
                  <MenuItem value="">All Genders</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Department */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={filters.department}
                  label="Department"
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  <MenuItem value="cardiology">Cardiology</MenuItem>
                  <MenuItem value="neurology">Neurology</MenuItem>
                  <MenuItem value="orthopedics">Orthopedics</MenuItem>
                  <MenuItem value="pediatrics">Pediatrics</MenuItem>
                  <MenuItem value="dermatology">Dermatology</MenuItem>
                  <MenuItem value="general">General Medicine</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Follow-up Required */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Follow-up Required</InputLabel>
                <Select
                  value={filters.followUpRequired}
                  label="Follow-up Required"
                  onChange={(e) => handleFilterChange('followUpRequired', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date Range */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Date Range
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date"
                    value={filters.dateRange.start}
                    onChange={(value) => handleDateRangeChange('start', value)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={filters.dateRange.end}
                    onChange={(value) => handleDateRangeChange('end', value)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Active Filters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(filters).map(([key, value]) => {
                  if (key === 'dateRange') {
                    if (value.start || value.end) {
                      const dateRangeText = `${value.start ? value.start.toLocaleDateString() : 'Start'} - ${value.end ? value.end.toLocaleDateString() : 'End'}`;
                      return (
                        <Chip
                          key={key}
                          label={`Date: ${dateRangeText}`}
                          onDelete={() => handleDateRangeChange('start', null) && handleDateRangeChange('end', null)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      );
                    }
                  } else if (value) {
                    return (
                      <Chip
                        key={key}
                        label={`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`}
                        onDelete={() => handleFilterChange(key, '')}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    );
                  }
                  return null;
                })}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default AppointmentFilters;