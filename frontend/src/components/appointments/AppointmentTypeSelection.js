import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Avatar,
  useTheme,
  Divider,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  MeetingRoom,
  VideoCall,
  Info,
  LocalHospital,
  MonitorHeart,
  LocalShipping,
  Devices,
  HealthAndSafety,
  LocalPharmacy
} from '@mui/icons-material';

const AppointmentTypeSelection = ({ appointmentType, onChange }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Appointment Type
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Choose between an in-person visit or an online consultation. Our doctors can recommend switching between these options based on your medical needs.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Doctors may recommend switching your appointment type based on your medical condition:
        </Typography>
        <ul style={{ marginTop: 8, marginBottom: 0 }}>
          <li>In-person appointments may be converted to online if your condition requires continuous monitoring</li>
          <li>Online consultations may be converted to in-person if your condition is determined to be serious</li>
        </ul>
      </Alert>

      <RadioGroup
        value={appointmentType}
        onChange={(e) => onChange(e.target.value)}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Paper
                elevation={appointmentType === 'in-person' ? 8 : 1}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: appointmentType === 'in-person'
                    ? `2px solid ${theme.palette.primary.main}`
                    : '2px solid transparent',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={() => onChange('in-person')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 56,
                      height: 56,
                      mr: 2
                    }}
                  >
                    <MeetingRoom />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">In-Person Visit</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Visit the hospital for a face-to-face consultation
                    </Typography>
                  </Box>
                  <FormControlLabel
                    value="in-person"
                    control={<Radio />}
                    label=""
                    sx={{ ml: 'auto' }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" paragraph>
                    Choose this option if you prefer a traditional in-person appointment at the hospital or clinic.
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocalHospital fontSize="small" color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Direct physical examination by healthcare professionals
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MonitorHeart fontSize="small" color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Access to immediate diagnostic tests if needed
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HealthAndSafety fontSize="small" color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Option to purchase recommended wearable devices on-site
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', p: 2, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Info fontSize="small" color="info" sx={{ mr: 1, mt: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Your doctor may recommend switching to online follow-ups for conditions that require continuous monitoring.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Paper
                elevation={appointmentType === 'online' ? 8 : 1}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: appointmentType === 'online'
                    ? `2px solid ${theme.palette.secondary.main}`
                    : '2px solid transparent',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={() => onChange('online')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      width: 56,
                      height: 56,
                      mr: 2
                    }}
                  >
                    <VideoCall />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Online Consultation</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Video call with a doctor from your home
                    </Typography>
                  </Box>
                  <FormControlLabel
                    value="online"
                    control={<Radio />}
                    label=""
                    sx={{ ml: 'auto' }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" paragraph>
                    Choose this option for a convenient video consultation with a doctor without leaving your home.
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <VideoCall fontSize="small" color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Convenient access to healthcare from anywhere
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MonitorHeart fontSize="small" color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Integration with wearable devices for real-time monitoring
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocalPharmacy fontSize="small" color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Option for medication delivery from partner pharmacies
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Devices fontSize="small" color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Purchase wearable health devices through our platform
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', p: 2, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Info fontSize="small" color="info" sx={{ mr: 1, mt: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Your doctor may recommend switching to an in-person visit if your condition is determined to be serious.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </RadioGroup>
    </Box>
  );
};

export default AppointmentTypeSelection;
