import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';

const AppointmentDetails = ({ appointment }) => {
  const [openNotes, setOpenNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddNotes = async () => {
    setLoading(true);
    try {
      const appointmentId = appointment.id || appointment._id;
      await axios.post(`/api/appointments/${appointmentId}/notes`, { notes });
      setOpenNotes(false);
    } catch (error) {
      console.error('Error adding notes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Appointment Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(appointment.date), 'PPpp')}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={appointment.status}
                    color={
                      appointment.status === 'confirmed'
                        ? 'success'
                        : appointment.status === 'pending'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Patient
                  </Typography>
                  <Typography variant="body1">
                    {appointment.patient?.name ||
                     (appointment.patient?.firstName && `${appointment.patient.firstName} ${appointment.patient.lastName}`) ||
                     'Unknown Patient'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Doctor
                  </Typography>
                  <Typography variant="body1">
                    {appointment.doctor?.name ||
                     (appointment.doctor?.firstName && `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`) ||
                     'Unknown Doctor'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1">{appointment.type}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Reason
                  </Typography>
                  <Typography variant="body1">{appointment.reason}</Typography>
                </Grid>

                {appointment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {typeof appointment.notes === 'string' && appointment.notes.startsWith('{')
                        ? (() => {
                            try {
                              const parsedNotes = JSON.parse(appointment.notes);
                              return (
                                <Box>
                                  {/* Appointment Type */}
                                  {parsedNotes.isOnline !== undefined && (
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                      <strong>Appointment Type:</strong> {parsedNotes.isOnline ? 'Online' : 'In-Person'}
                                    </Typography>
                                  )}

                                  {/* Insurance Information - Enhanced Display */}
                                  {parsedNotes.insuranceInfo && (
                                    <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                      <Typography variant="subtitle2" color="primary" gutterBottom>
                                        Insurance Information
                                      </Typography>

                                      <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                          <Chip
                                            label={parsedNotes.insuranceInfo.provider === 'Self-Pay' ? 'Self-Pay Patient' : 'Insured Patient'}
                                            color={parsedNotes.insuranceInfo.provider === 'Self-Pay' ? 'warning' : 'success'}
                                            size="small"
                                            sx={{ mb: 1 }}
                                          />
                                        </Grid>

                                        {parsedNotes.insuranceInfo.provider !== 'Self-Pay' && (
                                          <>
                                            <Grid item xs={12} sm={6}>
                                              <Typography variant="body2">
                                                <strong>Provider:</strong> {parsedNotes.insuranceInfo.provider}
                                              </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                              <Typography variant="body2">
                                                <strong>Policy Number:</strong> {parsedNotes.insuranceInfo.policyNumber || 'Not provided'}
                                              </Typography>
                                            </Grid>
                                            {parsedNotes.insuranceInfo.additionalInfo && (
                                              <Grid item xs={12}>
                                                <Typography variant="body2">
                                                  <strong>Additional Info:</strong> {parsedNotes.insuranceInfo.additionalInfo}
                                                </Typography>
                                              </Grid>
                                            )}
                                          </>
                                        )}

                                        {parsedNotes.insuranceInfo.provider === 'Self-Pay' && (
                                          <Grid item xs={12}>
                                            <Typography variant="body2">
                                              <strong>Payment Status:</strong> <Chip size="small" label="Pending" color="warning" />
                                            </Typography>
                                          </Grid>
                                        )}
                                      </Grid>
                                    </Box>
                                  )}

                                  {/* Wearable Device - Enhanced Display */}
                                  {parsedNotes.wearableDevice && (
                                    <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                      <Typography variant="subtitle2" color="primary" gutterBottom>
                                        Wearable Device
                                      </Typography>

                                      <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                          <Typography variant="body2">
                                            <strong>Device:</strong> {parsedNotes.wearableDevice.name || 'Not specified'}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                          <Typography variant="body2">
                                            <strong>Status:</strong> {' '}
                                            <Chip
                                              size="small"
                                              label={parsedNotes.wearableDevice.alreadyOwned ? 'Already Owned' : 'Requested from Hospital'}
                                              color={parsedNotes.wearableDevice.alreadyOwned ? 'success' : 'info'}
                                            />
                                          </Typography>
                                        </Grid>
                                        {parsedNotes.wearableDevice.model && (
                                          <Grid item xs={12}>
                                            <Typography variant="body2">
                                              <strong>Model:</strong> {parsedNotes.wearableDevice.model}
                                            </Typography>
                                          </Grid>
                                        )}
                                      </Grid>
                                    </Box>
                                  )}

                                  {/* Pharmacy Information */}
                                  {parsedNotes.pharmacy && (
                                    <Box sx={{ mb: 1, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                      <Typography variant="subtitle2" color="primary" gutterBottom>
                                        Pharmacy
                                      </Typography>
                                      <Typography variant="body2">
                                        <strong>Name:</strong> {parsedNotes.pharmacy.name || 'Not specified'}
                                      </Typography>
                                      {parsedNotes.pharmacy.address && (
                                        <Typography variant="body2">
                                          <strong>Address:</strong> {parsedNotes.pharmacy.address}
                                        </Typography>
                                      )}
                                    </Box>
                                  )}
                                </Box>
                              );
                            } catch (e) {
                              return appointment.notes;
                            }
                          })()
                        : appointment.notes
                      }
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setOpenNotes(true)}
                    >
                      Add Notes
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Notes Dialog */}
      <Dialog open={openNotes} onClose={() => setOpenNotes(false)}>
        <DialogTitle>Add Notes</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNotes(false)}>Cancel</Button>
          <Button onClick={handleAddNotes} disabled={loading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentDetails;
