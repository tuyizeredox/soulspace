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
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        mb: 3,
        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: { xs: 2, md: 3 },
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: { xs: 1, sm: 0 }
            }}
          >
            Advanced Analytics
          </Typography>
          <Button
            endIcon={<KeyboardArrowRightIcon />}
            onClick={onViewMore}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            View All
          </Button>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minWidth: { xs: 'auto', md: 150 },
              mx: { xs: 0.5, md: 1 },
              fontSize: { xs: '0.8rem', md: '0.9rem' },
              py: { xs: 1, md: 1.5 },
              px: { xs: 1, md: 2 },
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                color: theme.palette.primary.main,
              },
            },
            '& .Mui-selected': {
              fontWeight: 700,
              color: `${theme.palette.primary.main} !important`,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 1.5,
              backgroundColor: theme.palette.primary.main,
            },
            '& .MuiTabScrollButton-root': {
              color: theme.palette.primary.main,
              '&.Mui-disabled': {
                opacity: 0.3,
              },
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
          <Box
            sx={{
              height: { xs: 300, sm: 350, md: 400 },
              mt: { xs: 1, md: 2 },
              transition: 'all 0.3s ease',
              borderRadius: 2,
              p: 1,
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentPerformanceData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <YAxis
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 8,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                    padding: '10px 14px',
                  }}
                  cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 10 }}
                  iconType="circle"
                />
                <Bar
                  dataKey="patients"
                  name="Patients"
                  fill={theme.palette.primary.main}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                  animationDuration={1500}
                />
                <Bar
                  dataKey="appointments"
                  name="Appointments"
                  fill={theme.palette.secondary.main}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                  animationDuration={1500}
                  animationBegin={300}
                />
                <Bar
                  dataKey="satisfaction"
                  name="Satisfaction %"
                  fill={theme.palette.success.main}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                  animationDuration={1500}
                  animationBegin={600}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Appointment Trends Tab */}
        {activeTab === 1 && (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} lg={8}>
              <Box
                sx={{
                  height: { xs: 250, sm: 300, md: 350 },
                  mt: { xs: 1, md: 2 },
                  transition: 'all 0.3s ease',
                  borderRadius: 2,
                  p: 1,
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={appointmentTrendData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                      tickLine={{ stroke: theme.palette.divider }}
                      axisLine={{ stroke: theme.palette.divider }}
                    />
                    <YAxis
                      tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                      tickLine={{ stroke: theme.palette.divider }}
                      axisLine={{ stroke: theme.palette.divider }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 8,
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                        padding: '10px 14px',
                      }}
                      cursor={{ stroke: alpha(theme.palette.info.main, 0.3), strokeWidth: 1 }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: 10 }}
                      iconType="circle"
                    />
                    <defs>
                      <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.info.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.info.main} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorInPerson" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="online"
                      name="Online Appointments"
                      stackId="1"
                      stroke={theme.palette.info.main}
                      fillOpacity={1}
                      fill="url(#colorOnline)"
                      animationDuration={1500}
                    />
                    <Area
                      type="monotone"
                      dataKey="inPerson"
                      name="In-Person Appointments"
                      stackId="1"
                      stroke={theme.palette.primary.main}
                      fillOpacity={1}
                      fill="url(#colorInPerson)"
                      animationDuration={1500}
                      animationBegin={300}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Box
                sx={{
                  height: { xs: 250, sm: 300, md: 350 },
                  mt: { xs: 1, md: 2 },
                  transition: 'all 0.3s ease',
                  borderRadius: 2,
                  p: 1,
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        window.innerWidth < 500
                          ? `${(percent * 100).toFixed(0)}%`
                          : `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={({ xs: 70, sm: 80, md: 90 })}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={1500}
                      animationBegin={300}
                    >
                      {appointmentTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke={theme.palette.background.paper}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 8,
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                        padding: '10px 14px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: 10 }}
                      iconType="circle"
                      layout={window.innerWidth < 500 ? "horizontal" : "vertical"}
                      verticalAlign={window.innerWidth < 500 ? "bottom" : "middle"}
                      align={window.innerWidth < 500 ? "center" : "right"}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Patient Demographics Tab */}
        {activeTab === 2 && (
          <Box
            sx={{
              height: { xs: 300, sm: 350, md: 400 },
              mt: { xs: 1, md: 2 },
              transition: 'all 0.3s ease',
              borderRadius: 2,
              p: 1,
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={patientDemographicsData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <YAxis
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 8,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                    padding: '10px 14px',
                  }}
                  cursor={{ fill: alpha(theme.palette.secondary.main, 0.05) }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 10 }}
                  iconType="circle"
                />
                <Bar
                  dataKey="male"
                  name="Male"
                  fill={theme.palette.info.main}
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                  animationDuration={1500}
                />
                <Bar
                  dataKey="female"
                  name="Female"
                  fill={theme.palette.secondary.main}
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                  animationDuration={1500}
                  animationBegin={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Doctor Performance Tab */}
        {activeTab === 3 && (
          <Box
            sx={{
              height: { xs: 300, sm: 350, md: 400 },
              mt: { xs: 1, md: 2 },
              transition: 'all 0.3s ease',
              borderRadius: 2,
              p: 1,
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={doctorPerformanceData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis
                  type="number"
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 8,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                    padding: '10px 14px',
                  }}
                  cursor={{ fill: alpha(theme.palette.success.main, 0.05) }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 10 }}
                  iconType="circle"
                />
                <Bar
                  dataKey="patients"
                  name="Patients"
                  fill={theme.palette.primary.main}
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  animationDuration={1500}
                />
                <Bar
                  dataKey="satisfaction"
                  name="Satisfaction %"
                  fill={theme.palette.success.main}
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  animationDuration={1500}
                  animationBegin={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedAnalytics;
