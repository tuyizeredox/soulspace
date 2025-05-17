import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  CircularProgress,
  useTheme,
  alpha,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  MonitorHeart as HeartIcon,
  LocalHospital as HospitalIcon,
  Watch as WatchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const WearableDevicesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [wearableDevices, setWearableDevices] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fetch wearable devices
  useEffect(() => {
    const fetchWearableDevices = async () => {
      try {
        setLoading(true);
        
        // Mock data for wearable devices
        setTimeout(() => {
          const mockDevices = [
            {
              id: 'soulwatch-pro',
              name: 'SoulWatch Pro',
              price: 299.99,
              description: 'Our flagship wearable device with comprehensive health monitoring capabilities.',
              features: [
                'Continuous heart rate monitoring',
                'Blood pressure tracking',
                'ECG functionality',
                'Blood oxygen level monitoring',
                'Sleep quality analysis'
              ],
              image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=1000',
              inStock: true
            },
            {
              id: 'soulwatch-lite',
              name: 'SoulWatch Lite',
              price: 199.99,
              description: 'Essential health monitoring in a lightweight, affordable package.',
              features: [
                'Heart rate monitoring',
                'Blood pressure estimation',
                'Sleep tracking',
                'Step counting',
                'Calorie tracking'
              ],
              image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=1000',
              inStock: true
            },
            {
              id: 'soulband-fitness',
              name: 'SoulBand Fitness',
              price: 149.99,
              description: 'Focused on fitness tracking with essential health monitoring features.',
              features: [
                'Heart rate monitoring during workouts',
                'Step and distance tracking',
                'Calorie burn calculation',
                'Workout recognition',
                'Sleep tracking'
              ],
              image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=1000',
              inStock: true
            }
          ];
          
          setWearableDevices(mockDevices);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching wearable devices:', error);
        setLoading(false);
      }
    };
    
    fetchWearableDevices();
  }, []);
  
  // Add to cart
  const handleAddToCart = (device) => {
    // In a real app, this would add to a cart state or API
    setSnackbar({
      open: true,
      message: `${device.name} added to cart!`,
      severity: 'success'
    });
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Buy now
  const handleBuyNow = (device) => {
    // In a real app, this would navigate to checkout with the device
    setSnackbar({
      open: true,
      message: `Proceeding to checkout for ${device.name}...`,
      severity: 'info'
    });
    
    // Simulate navigation to checkout
    setTimeout(() => {
      navigate('/patient/dashboard');
    }, 2000);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          SoulSpace Wearable Devices
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Advanced health monitoring technology to help you take control of your well-being
        </Typography>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            borderRadius: 3, 
            bgcolor: alpha(theme.palette.primary.light, 0.1),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            mb: 4
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HospitalIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Why Choose SoulSpace Wearables?
                </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                Our wearable devices are designed in collaboration with medical professionals to provide accurate, 
                reliable health data that integrates seamlessly with your SoulSpace patient account.
              </Typography>
              <Typography variant="body2" paragraph>
                All devices automatically sync with your patient dashboard, allowing your healthcare 
                providers to monitor your health metrics in real-time.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box 
                component="img"
                src="https://images.unsplash.com/photo-1610438235354-a6ae5528385c?auto=format&fit=crop&q=80&w=600"
                alt="SoulSpace Wearable Device"
                sx={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      {/* Wearable Devices Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {wearableDevices.map((device) => (
            <Grid item xs={12} md={4} key={device.id}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={device.image}
                  alt={device.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom fontWeight={600}>
                    {device.name}
                  </Typography>
                  
                  <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
                    ${device.price.toFixed(2)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {device.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Features:
                    </Typography>
                    <List dense disablePadding>
                      {device.features.map((feature, index) => (
                        <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature} 
                            primaryTypographyProps={{ 
                              variant: 'body2',
                              color: 'text.secondary'
                            }} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  
                  <Chip 
                    icon={<WatchIcon />}
                    label="Compatible with SoulSpace App" 
                    color="primary" 
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleBuyNow(device)}
                    sx={{ 
                      borderRadius: 2, 
                      textTransform: 'none',
                      mb: 1
                    }}
                  >
                    Buy Now
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleAddToCart(device)}
                    sx={{ 
                      borderRadius: 2, 
                      textTransform: 'none'
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Additional Information */}
      <Box sx={{ mt: 6 }}>
        <Paper
          elevation={0}
          sx={{ 
            p: 3, 
            borderRadius: 3, 
            bgcolor: alpha(theme.palette.secondary.light, 0.1),
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight={600}>
            How It Works
          </Typography>
          <Typography variant="body1" paragraph>
            1. Choose and purchase your SoulSpace wearable device
          </Typography>
          <Typography variant="body1" paragraph>
            2. Connect it to your SoulSpace account using the mobile app
          </Typography>
          <Typography variant="body1" paragraph>
            3. Your health data will automatically appear in your patient dashboard
          </Typography>
          <Typography variant="body1" paragraph>
            4. Your healthcare provider can monitor your metrics in real-time
          </Typography>
          
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/patient/health-metrics')}
            sx={{ 
              mt: 2,
              borderRadius: 2, 
              textTransform: 'none'
            }}
          >
            Learn More About Health Monitoring
          </Button>
        </Paper>
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WearableDevicesPage;
