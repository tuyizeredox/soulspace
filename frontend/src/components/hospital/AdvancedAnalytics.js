import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  alpha,
  Divider,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { motion } from 'framer-motion';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const AdvancedAnalytics = ({ 
  departmentStats = [], 
  patientData = [], 
  appointmentData = [],
  doctorPerformance = [],
  onViewMore
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Generate colors for pie chart
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  // Create appointment trend data
  const appointmentTrendData = [
    { name: 'Jan', online: 65, inPerson: 120 },
    { name: 'Feb', online: 78, inPerson: 110 },
    { name: 'Mar', online: 90, inPerson: 105 },
    { name: 'Apr', online: 81, inPerson: 90 },
    { name: 'May', online: 95, inPerson: 85 },
    { name: 'Jun', online: 110, inPerson: 80 },
  ];

  // Create patient demographics data
  const patientDemographicsData = [
    { name: '0-18', male: 25, female: 30 },
    { name: '19-35', male: 40, female: 45 },
    { name: '36-50', male: 35, female: 40 },
    { name: '51-65', male: 30, female: 35 },
    { name: '65+', male: 20, female: 25 },
  ];

  // Create department performance data if not provided
  const departmentPerformanceData = departmentStats.length > 0 ? departmentStats : [
    { name: 'Cardiology', patients: 120, appointments: 85, satisfaction: 90 },
    { name: 'Neurology', patients: 95, appointments: 72, satisfaction: 88 },
    { name: 'Orthopedics', patients: 110, appointments: 92, satisfaction: 93 },
    { name: 'Pediatrics', patients: 150, appointments: 105, satisfaction: 91 },
    { name: 'General Medicine', patients: 200, appointments: 145, satisfaction: 89 },
  ];

  // Create doctor performance data if not provided
  const doctorPerformanceData = doctorPerformance.length > 0 ? doctorPerformance : [
    { name: 'Dr. Smith', patients: 45, satisfaction: 92, department: 'Cardiology' },
    { name: 'Dr. Johnson', patients: 38, satisfaction: 88, department: 'Neurology' },
    { name: 'Dr. Williams', patients: 52, satisfaction: 95, department: 'Orthopedics' },
    { name: 'Dr. Brown', patients: 31, satisfaction: 87, department: 'Pediatrics' },
    { name: 'Dr. Davis', patients: 42, satisfaction: 91, department: 'General Medicine' },
  ];

  // Create appointment type data
  const appointmentTypeData = [
    { name: 'Regular Checkup', value: 45 },
    { name: 'Specialist Consultation', value: 30 },
    { name: 'Emergency', value: 15 },
    { name: 'Follow-up', value: 10 },
  ];

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Advanced Analytics
          </Typography>
          <Button
            endIcon={<KeyboardArrowRightIcon />}
            onClick={onViewMore}
            sx={{ textTransform: 'none' }}
          >
            View All
          </Button>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minWidth: 'auto',
              mx: 1,
            },
            '& .Mui-selected': {
              fontWeight: 700,
              color: theme.palette.primary.main,
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 1.5,
            },
          }}
        >
          <Tab label="Department Performance" />
          <Tab label="Appointment Trends" />
          <Tab label="Patient Demographics" />
          <Tab label="Doctor Performance" />
        </Tabs>

        {/* Department Performance Tab */}
        {activeTab === 0 && (
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentPerformanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 8,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                  }}
                />
                <Legend />
                <Bar dataKey="patients" name="Patients" fill={theme.palette.primary.main} />
                <Bar dataKey="appointments" name="Appointments" fill={theme.palette.secondary.main} />
                <Bar dataKey="satisfaction" name="Satisfaction %" fill={theme.palette.success.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Appointment Trends Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={appointmentTrendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 8,
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="online"
                      name="Online Appointments"
                      stackId="1"
                      stroke={theme.palette.info.main}
                      fill={alpha(theme.palette.info.main, 0.6)}
                    />
                    <Area
                      type="monotone"
                      dataKey="inPerson"
                      name="In-Person Appointments"
                      stackId="1"
                      stroke={theme.palette.primary.main}
                      fill={alpha(theme.palette.primary.main, 0.6)}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {appointmentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 8,
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Patient Demographics Tab */}
        {activeTab === 2 && (
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={patientDemographicsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 8,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                  }}
                />
                <Legend />
                <Bar dataKey="male" name="Male" fill={theme.palette.info.main} />
                <Bar dataKey="female" name="Female" fill={theme.palette.secondary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Doctor Performance Tab */}
        {activeTab === 3 && (
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={doctorPerformanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 8,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                  }}
                />
                <Legend />
                <Bar dataKey="patients" name="Patients" fill={theme.palette.primary.main} />
                <Bar dataKey="satisfaction" name="Satisfaction %" fill={theme.palette.success.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedAnalytics;
