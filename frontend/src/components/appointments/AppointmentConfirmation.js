import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Avatar,
  Alert,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Event,
  AccessTime,
  Person,
  LocalHospital,
  MeetingRoom,
  VideoCall,
  MonitorHeart,
  LocalPharmacy,
  HealthAndSafety,
  LocalShipping,
  Devices,
  Info,
  Security
} from '@mui/icons-material';
import { format } from 'date-fns';

const AppointmentConfirmation = ({ formData, success }) => {
  const theme = useTheme();

  // Format date if it exists
  const formattedDate = formData.date
    ? format(new Date(formData.date), 'EEEE, MMMM d, yyyy')
    : 'Not selected';

  return (
    <Box>
      {success ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.success.main,
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2
              }}
            >
              <CheckCircle sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" gutterBottom>
              Appointment Booked Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your appointment has been confirmed. You will receive a confirmation email with all the details.
            </Typography>
            {formData.wearableDevice?.required && (
              <Typography variant="body1" color="primary.main" sx={{ fontWeight: 500 }}>
                Your wearable device selection has been saved and will be available for purchase after your appointment.
              </Typography>
            )}
            {formData.pharmacy?.required && (
              <Typography variant="body1" color="secondary.main" sx={{ fontWeight: 500, mt: 1 }}>
                Your medication delivery preferences have been saved for your doctor's reference.
              </Typography>
            )}
          </Box>
        </motion.div>
      ) : (
        <Typography variant="h5" gutterBottom>
          Review Your Appointment
        </Typography>
      )}

      <Typography variant="body1" color="text.secondary" paragraph>
        Please review the details of your appointment before confirming.
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Appointment Type */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {formData.appointmentType === 'online' ? (
                <VideoCall color="secondary" sx={{ mr: 1, fontSize: 28 }} />
              ) : (
                <MeetingRoom color="primary" sx={{ mr: 1, fontSize: 28 }} />
              )}
              <Typography variant="h6">
                {formData.appointmentType === 'online' ? 'Online Consultation' : 'In-Person Visit'}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
              {formData.appointmentType === 'online'
                ? 'You will receive a link to join the video consultation before your appointment time.'
                : 'Please arrive at the hospital 15 minutes before your scheduled appointment time.'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Hospital & Doctor */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <LocalHospital color="primary" sx={{ mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Hospital
                </Typography>
                <Typography variant="body1">
                  {formData.hospital || 'Not selected'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Person color="primary" sx={{ mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Doctor
                </Typography>
                <Typography variant="body1">
                  {formData.doctor || 'Not selected'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Date & Time */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Event color="primary" sx={{ mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {formattedDate}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <AccessTime color="primary" sx={{ mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="body1">
                  {formData.time || 'Not selected'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Reason for Visit */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <HealthAndSafety color="primary" sx={{ mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Reason for Visit
                </Typography>
                <Typography variant="body1">
                  {formData.reason || 'Not provided'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Additional Options - Wearable Device */}
          {formData.wearableDevice?.required && (
            <>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <MonitorHeart color="primary" sx={{ mr: 1, mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Wearable Health Monitoring Device
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {formData.wearableDevice.purchaseOption === 'platform'
                        ? 'Purchase through SoulSpace platform (delivery)'
                        : 'Purchase directly from hospital'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      <Chip
                        size="small"
                        color="primary"
                        icon={<MonitorHeart fontSize="small" />}
                        label="Real-time monitoring"
                      />
                      <Chip
                        size="small"
                        color="primary"
                        icon={<Devices fontSize="small" />}
                        label="Health tracking"
                      />
                      <Chip
                        size="small"
                        color="primary"
                        icon={<Security fontSize="small" />}
                        label="Data security"
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </>
          )}

          {/* Additional Options - Pharmacy */}
          {formData.pharmacy?.required && (
            <>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LocalPharmacy color="primary" sx={{ mr: 1, mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Pharmacy & Medication
                    </Typography>
                    <Typography variant="body1">
                      {formData.pharmacy.preferredPharmacy || 'Not selected'} -
                      {formData.pharmacy.deliveryOption === 'delivery'
                        ? ' Home Delivery'
                        : ' Pickup from Pharmacy'}
                    </Typography>
                    {formData.pharmacy.deliveryOption === 'delivery' && formData.pharmacy.deliveryAddress && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Delivery Address: {formData.pharmacy.deliveryAddress}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      <Chip
                        size="small"
                        color="secondary"
                        icon={<LocalPharmacy fontSize="small" />}
                        label="Prescription delivery"
                      />
                      <Chip
                        size="small"
                        color="secondary"
                        icon={<LocalShipping fontSize="small" />}
                        label="Contactless delivery"
                      />
                      <Chip
                        size="small"
                        color="secondary"
                        icon={<Info fontSize="small" />}
                        label="Medication info"
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {!success && (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              By confirming this appointment, you agree to the cancellation policy. You can cancel or reschedule your appointment up to 24 hours before the scheduled time without any charges.
            </Typography>
          </Alert>

          {formData.wearableDevice?.required && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Wearable Device Benefits:
              </Typography>
              <Typography variant="body2">
                Your selected wearable device will help monitor your health metrics in real-time, providing valuable data to your healthcare provider for better care.
              </Typography>
            </Alert>
          )}

          {formData.pharmacy?.required && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Medication Delivery Benefits:
              </Typography>
              <Typography variant="body2">
                Your medication will be delivered directly to your doorstep, saving you time and ensuring you receive your prescribed medications promptly.
              </Typography>
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default AppointmentConfirmation;
