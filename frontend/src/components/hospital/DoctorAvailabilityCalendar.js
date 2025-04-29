import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Today as TodayIcon,
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const timeSlots = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
  '06:00 PM - 08:00 PM',
];

const DoctorAvailabilityCalendar = ({ doctorId, initialSchedule = {} }) => {
  const theme = useTheme();
  const [schedule, setSchedule] = useState(initialSchedule);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  const handleOpenDialog = (day, isEdit = false, slot = null) => {
    setSelectedDay(day);
    setIsEditing(isEdit);
    
    if (isEdit && slot) {
      setEditingSlot(slot);
      setSelectedTimeSlot(slot);
    } else {
      setSelectedTimeSlot('');
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDay('');
    setSelectedTimeSlot('');
    setIsEditing(false);
    setEditingSlot(null);
  };

  const handleAddTimeSlot = () => {
    if (selectedDay && selectedTimeSlot) {
      const updatedSchedule = { ...schedule };
      
      if (!updatedSchedule[selectedDay]) {
        updatedSchedule[selectedDay] = [];
      }
      
      if (isEditing) {
        // Replace the edited slot
        const index = updatedSchedule[selectedDay].indexOf(editingSlot);
        if (index !== -1) {
          updatedSchedule[selectedDay][index] = selectedTimeSlot;
        }
      } else {
        // Add new slot if it doesn't already exist
        if (!updatedSchedule[selectedDay].includes(selectedTimeSlot)) {
          updatedSchedule[selectedDay].push(selectedTimeSlot);
        }
      }
      
      setSchedule(updatedSchedule);
      handleCloseDialog();
    }
  };

  const handleDeleteTimeSlot = (day, slot) => {
    const updatedSchedule = { ...schedule };
    
    if (updatedSchedule[day]) {
      updatedSchedule[day] = updatedSchedule[day].filter(
        (timeSlot) => timeSlot !== slot
      );
      
      // Remove the day if no slots remain
      if (updatedSchedule[day].length === 0) {
        delete updatedSchedule[day];
      }
      
      setSchedule(updatedSchedule);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Doctor Availability Schedule
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {weekDays.map((day) => (
          <Grid item xs={12} md={6} lg={4} key={day}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TodayIcon
                        color="primary"
                        sx={{ mr: 1, fontSize: 20 }}
                      />
                      <Typography variant="h6" fontWeight={600}>
                        {day}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog(day)}
                      sx={{
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                        },
                      }}
                    >
                      Add Slot
                    </Button>
                  </Box>

                  <Box sx={{ minHeight: 120 }}>
                    {schedule[day] && schedule[day].length > 0 ? (
                      schedule[day].map((slot, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            mb: 1,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            border: `1px solid ${alpha(
                              theme.palette.primary.main,
                              0.1
                            )}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon
                              fontSize="small"
                              color="action"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2">{slot}</Typography>
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(day, true, slot)}
                              sx={{ mr: 0.5 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTimeSlot(day, slot)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center"
                        >
                          No time slots available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Time Slot Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">
            {isEditing ? 'Edit Time Slot' : 'Add Time Slot'} - {selectedDay}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="time-slot-label">Time Slot</InputLabel>
            <Select
              labelId="time-slot-label"
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              label="Time Slot"
            >
              {timeSlots.map((slot) => (
                <MenuItem key={slot} value={slot}>
                  {slot}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddTimeSlot}
            disabled={!selectedTimeSlot}
          >
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorAvailabilityCalendar;
