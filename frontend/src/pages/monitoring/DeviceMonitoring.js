import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  FavoriteOutlined,
  DirectionsWalk,
  LocalHospital,
  Notifications,
  Message,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

const DeviceMonitoring = () => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  // Simulated real-time data updates
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/patient/monitoring-data');
        setPatientData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
        setLoading(false);
      }
    };

    fetchData();
    // Simulate real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const heartRateData = {
    labels: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25'],
    datasets: [
      {
        label: 'Heart Rate',
        data: [72, 75, 73, 78, 74, 76],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Status Overview */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Device connected and monitoring active
            </Alert>
          </Grid>

          {/* Vital Signs Cards */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FavoriteOutlined color="error" />
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        Heart Rate
                      </Typography>
                    </Box>
                    <Typography variant="h4">75 BPM</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={75}
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DirectionsWalk color="primary" />
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        Activity Level
                      </Typography>
                    </Box>
                    <Typography variant="h4">2,543 steps</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={60}
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Heart Rate Chart */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Heart Rate Trend
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <Line data={heartRateData} options={options} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Alerts and Notifications */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Alerts
                </Typography>
                <Timeline>
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="warning">
                        <Notifications />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2">
                        Elevated Heart Rate
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        10 minutes ago
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>

                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="success">
                        <LocalHospital />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2">
                        Medication Reminder
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        30 minutes ago
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>

                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="info">
                        <Message />
                      </TimelineDot>
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2">
                        Message from Doctor
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        1 hour ago
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                </Timeline>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Contact Healthcare Provider
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DeviceMonitoring;
