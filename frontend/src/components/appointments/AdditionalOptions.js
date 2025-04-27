import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  TextField,
  Divider,
  Collapse,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  useTheme,
  Alert
} from '@mui/material';
import {
  Devices,
  LocalShipping,
  Store,
  LocalPharmacy,
  DirectionsBike,
  Info,
  MonitorHeart,
  HealthAndSafety
} from '@mui/icons-material';
import axios from 'axios';

const AdditionalOptions = ({
  appointmentType,
  wearableDevice,
  pharmacy,
  onWearableChange,
  onPharmacyChange
}) => {
  const theme = useTheme();
  const [pharmacies, setPharmacies] = useState([]);
  const [wearableDevices, setWearableDevices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch pharmacies and wearable devices on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real app, these would be API calls
      // For now, we'll use mock data
      setPharmacies([
        { id: 'pharm1', name: 'MediCare Pharmacy', address: '123 Health St', partnerHospitals: ['hosp1', 'hosp2'] },
        { id: 'pharm2', name: 'LifeCare Pharmacy', address: '456 Wellness Ave', partnerHospitals: ['hosp1', 'hosp3'] },
        { id: 'pharm3', name: 'QuickMeds', address: '789 Recovery Blvd', partnerHospitals: ['hosp2', 'hosp4'] }
      ]);

      setWearableDevices([
        {
          id: 'dev1',
          name: 'HealthTrack Pro',
          price: 149.99,
          features: ['Heart rate monitoring', 'Blood pressure tracking', 'Sleep analysis', 'Activity tracking'],
          image: '/assets/wearable1.jpg'
        },
        {
          id: 'dev2',
          name: 'VitalSense',
          price: 199.99,
          features: ['ECG monitoring', 'Blood oxygen levels', 'Stress tracking', 'Temperature monitoring'],
          image: '/assets/wearable2.jpg'
        },
        {
          id: 'dev3',
          name: 'MediWatch',
          price: 129.99,
          features: ['Medication reminders', 'Heart rate monitoring', 'Step counting', 'Water resistance'],
          image: '/assets/wearable3.jpg'
        }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle wearable device toggle
  const handleWearableToggle = (event) => {
    onWearableChange('required', event.target.checked);
  };

  // Handle wearable purchase option change
  const handlePurchaseOptionChange = (event) => {
    onWearableChange('purchaseOption', event.target.value);
  };

  // Handle pharmacy toggle
  const handlePharmacyToggle = (event) => {
    onPharmacyChange('required', event.target.checked);
  };

  // Handle preferred pharmacy change
  const handlePreferredPharmacyChange = (event) => {
    onPharmacyChange('preferredPharmacy', event.target.value);
  };

  // Handle delivery option change
  const handleDeliveryOptionChange = (event) => {
    onPharmacyChange('deliveryOption', event.target.value);
  };

  // Handle delivery address change
  const handleDeliveryAddressChange = (event) => {
    onPharmacyChange('deliveryAddress', event.target.value);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Additional Options
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Enhance your healthcare experience with these optional services.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> These options are completely optional but can greatly enhance your healthcare experience.
          You can purchase wearable devices to track your health metrics in real-time and set up medication delivery for convenience.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Wearable Device Options */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MonitorHeart color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Wearable Health Monitoring Devices
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              Wearable devices can help monitor your health metrics in real-time and provide valuable data to your healthcare provider.
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={wearableDevice.required}
                  onChange={handleWearableToggle}
                  color="primary"
                />
              }
              label="I'm interested in using a wearable health monitoring device"
            />

            <Collapse in={wearableDevice.required} sx={{ mt: 2 }}>
              <Box sx={{ pl: 3, borderLeft: `2px solid ${theme.palette.primary.main}` }}>
                <Typography variant="subtitle1" gutterBottom>
                  Purchase Options
                </Typography>

                <RadioGroup
                  value={wearableDevice.purchaseOption}
                  onChange={handlePurchaseOptionChange}
                >
                  <FormControlLabel
                    value="platform"
                    control={<Radio />}
                    label="Purchase through SoulSpace platform (delivered to your address)"
                  />
                  <FormControlLabel
                    value="hospital"
                    control={<Radio />}
                    label="Purchase directly from the hospital during your visit"
                  />
                </RadioGroup>

                {wearableDevice.purchaseOption === 'platform' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Available Devices
                    </Typography>

                    <Grid container spacing={2}>
                      {wearableDevices.map((device) => (
                        <Grid item xs={12} md={4} key={device.id}>
                          <Card
                            sx={{
                              borderRadius: 2,
                              transition: 'transform 0.3s, box-shadow 0.3s',
                              '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            <CardMedia
                              component="img"
                              height="160"
                              image={device.image || 'https://via.placeholder.com/300x160?text=Wearable+Device'}
                              alt={device.name}
                              sx={{ objectFit: 'cover' }}
                            />
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                {device.name}
                              </Typography>
                              <Typography
                                variant="h5"
                                color="primary.main"
                                gutterBottom
                                sx={{ fontWeight: 'bold' }}
                              >
                                ${device.price}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                {device.features.map((feature, index) => (
                                  <Chip
                                    key={index}
                                    label={feature}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                              <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 2 }}
                              >
                                Select Device
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    <Box sx={{ mt: 2, p: 2, bgcolor: theme.palette.primary.light, color: 'white', borderRadius: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Benefits of Wearable Health Devices:
                      </Typography>
                      <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                        <li>Real-time health monitoring for better care</li>
                        <li>Early detection of potential health issues</li>
                        <li>Share vital data directly with your doctor</li>
                        <li>Track your progress and health improvements</li>
                      </ul>
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                        Device selection and payment will be finalized after your appointment is confirmed.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        </Grid>

        {/* Pharmacy Options - Only show for online appointments */}
        {appointmentType === 'online' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalPharmacy color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Pharmacy & Medication Delivery
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                For online consultations, you can have your prescribed medications delivered from partner pharmacies.
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={pharmacy.required}
                    onChange={handlePharmacyToggle}
                    color="primary"
                  />
                }
                label="I'm interested in medication delivery services"
              />

              <Collapse in={pharmacy.required} sx={{ mt: 2 }}>
                <Box sx={{ pl: 3, borderLeft: `2px solid ${theme.palette.primary.main}` }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Preferred Pharmacy
                  </Typography>

                  <RadioGroup
                    value={pharmacy.preferredPharmacy}
                    onChange={handlePreferredPharmacyChange}
                  >
                    {pharmacies.map((pharm) => (
                      <FormControlLabel
                        key={pharm.id}
                        value={pharm.id}
                        control={<Radio />}
                        label={`${pharm.name} - ${pharm.address}`}
                      />
                    ))}
                  </RadioGroup>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    Delivery Options
                  </Typography>

                  <RadioGroup
                    value={pharmacy.deliveryOption}
                    onChange={handleDeliveryOptionChange}
                  >
                    <FormControlLabel
                      value="delivery"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocalShipping sx={{ mr: 1 }} />
                          <span>Home Delivery</span>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="pickup"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Store sx={{ mr: 1 }} />
                          <span>Pickup from Pharmacy</span>
                        </Box>
                      }
                    />
                  </RadioGroup>

                  {pharmacy.deliveryOption === 'delivery' && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Delivery Address"
                        multiline
                        rows={3}
                        value={pharmacy.deliveryAddress || ''}
                        onChange={handleDeliveryAddressChange}
                        placeholder="Enter your complete delivery address"
                      />
                    </Box>
                  )}

                  <Box sx={{ mt: 2, p: 2, bgcolor: theme.palette.secondary.light, color: 'white', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Medication Delivery Benefits:
                    </Typography>
                    <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                      <li>Convenient delivery of prescribed medications to your doorstep</li>
                      <li>No need to travel to pick up prescriptions</li>
                      <li>Automatic refill reminders</li>
                      <li>Secure and contactless delivery options</li>
                    </ul>
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      After your consultation, the doctor will send your prescription to your chosen pharmacy.
                      You'll receive a notification when your medication is ready for pickup or delivery.
                    </Typography>
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          </Grid>
        )}

        {/* Insurance Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HealthAndSafety color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Insurance Information
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              Provide your insurance details if applicable. This is optional and you can proceed without insurance.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Insurance Provider"
                  placeholder="e.g., Blue Cross, Aetna, etc."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Policy Number"
                  placeholder="Your insurance policy number"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Insurance Information"
                  multiline
                  rows={2}
                  placeholder="Any additional details about your coverage"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.05)', borderRadius: 2, border: '1px dashed rgba(0, 0, 0, 0.2)' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Info fontSize="small" color="warning" sx={{ mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.primary" gutterBottom>
                    Important Insurance Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Insurance information is required to proceed with booking. If you don't have insurance,
                    please contact our support team for assistance with alternative payment options.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdditionalOptions;
