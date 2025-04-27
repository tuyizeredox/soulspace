import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  useTheme,
  Chip,
  Divider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { addDays, format, isWeekend, isSameDay } from 'date-fns';
import { 
  AccessTime, 
  Event, 
  CheckCircle, 
  HealthAndSafety 
} from '@mui/icons-material';

const DateTimeSelection = ({ date, time, reason, onDateChange, onTimeChange, onReasonChange }) => {
  const theme = useTheme();
  const [availableTimes, setAvailableTimes] = useState([
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM'
  ]);

  // Generate next 14 available days (excluding weekends)
  const generateAvailableDates = () => {
    const dates = [];
    let currentDate = new Date();
    
    while (dates.length < 14) {
      currentDate = addDays(currentDate, 1);
      if (!isWeekend(currentDate)) {
        dates.push(currentDate);
      }
    }
    
    return dates;
  };

  const availableDates = generateAvailableDates();

  // Check if a date is disabled
  const isDateDisabled = (date) => {
    return isWeekend(date) || !availableDates.some(d => isSameDay(d, date));
  };

  // Handle time selection
  const handleTimeSelect = (selectedTime) => {
    onTimeChange(selectedTime);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Choose Date & Time
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Select your preferred appointment date and time, and provide a reason for your visit.
      </Typography>

      <Grid container spacing={3}>
        {/* Date Selection */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Event color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Select Date
              </Typography>
            </Box>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Appointment Date"
                value={date}
                onChange={onDateChange}
                shouldDisableDate={isDateDisabled}
                minDate={new Date()}
                renderInput={(params) => <TextField {...params} fullWidth />}
                sx={{ mb: 3 }}
              />
            </LocalizationProvider>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Available dates are shown in the calendar. Weekends are not available for appointments.
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Select:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableDates.slice(0, 5).map((availableDate, index) => (
                  <Chip
                    key={index}
                    label={format(availableDate, 'EEE, MMM d')}
                    onClick={() => onDateChange(availableDate)}
                    color={date && isSameDay(date, availableDate) ? 'primary' : 'default'}
                    variant={date && isSameDay(date, availableDate) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Time Selection */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTime color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Select Time
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Select your preferred appointment time from the available slots.
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {availableTimes.map((availableTime, index) => (
                <Button
                  key={index}
                  variant={time === availableTime ? 'contained' : 'outlined'}
                  color={time === availableTime ? 'primary' : 'inherit'}
                  onClick={() => handleTimeSelect(availableTime)}
                  sx={{ minWidth: '90px', mb: 1 }}
                >
                  {availableTime}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>
        
        {/* Reason for Visit */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HealthAndSafety color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Reason for Visit
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Please provide a brief description of your symptoms or reason for the appointment.
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Describe your symptoms or reason"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="E.g., I've been experiencing headaches for the past week, accompanied by dizziness..."
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Providing detailed information helps the doctor prepare for your appointment.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DateTimeSelection;
