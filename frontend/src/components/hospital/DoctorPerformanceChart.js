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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';

const DoctorPerformanceChart = ({ doctorId, performanceData }) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = React.useState('month');

  // Sample data - replace with actual data from API
  const patientData = [
    { month: 'Jan', patients: 45, target: 40 },
    { month: 'Feb', patients: 52, target: 40 },
    { month: 'Mar', patients: 48, target: 40 },
    { month: 'Apr', patients: 61, target: 40 },
    { month: 'May', patients: 55, target: 40 },
    { month: 'Jun', patients: 67, target: 40 },
    { month: 'Jul', patients: 52, target: 40 },
    { month: 'Aug', patients: 58, target: 40 },
    { month: 'Sep', patients: 63, target: 40 },
    { month: 'Oct', patients: 59, target: 40 },
    { month: 'Nov', patients: 71, target: 40 },
    { month: 'Dec', patients: 65, target: 40 },
  ];

  const ratingData = [
    { month: 'Jan', rating: 4.2 },
    { month: 'Feb', rating: 4.3 },
    { month: 'Mar', rating: 4.1 },
    { month: 'Apr', rating: 4.4 },
    { month: 'May', rating: 4.5 },
    { month: 'Jun', rating: 4.6 },
    { month: 'Jul', rating: 4.7 },
    { month: 'Aug', rating: 4.5 },
    { month: 'Sep', rating: 4.8 },
    { month: 'Oct', rating: 4.7 },
    { month: 'Nov', rating: 4.9 },
    { month: 'Dec', rating: 4.8 },
  ];

  const patientTypeData = [
    { name: 'New Patients', value: 35 },
    { name: 'Returning Patients', value: 45 },
    { name: 'Referrals', value: 20 },
  ];

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
  ];

  // Filter data based on time range
  const getFilteredData = (data) => {
    if (timeRange === 'month') {
      return data.slice(-1);
    } else if (timeRange === 'quarter') {
      return data.slice(-3);
    } else if (timeRange === 'halfYear') {
      return data.slice(-6);
    } else {
      return data;
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
          Performance Metrics
        </Typography>
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range"
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
            <MenuItem value="halfYear">Last 6 Months</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Patient Count Chart */}
        <Grid item xs={12} md={8} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Patient Count
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeRange === 'year' ? patientData : getFilteredData(patientData)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        borderRadius: 8,
                        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="patients"
                      name="Patients Seen"
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="target"
                      name="Target"
                      fill={alpha(theme.palette.primary.main, 0.3)}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Patient Type Distribution */}
        <Grid item xs={12} md={4} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Patient Distribution
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={patientTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {patientTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} patients`, 'Count']}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        borderRadius: 8,
                        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Rating Trend */}
        <Grid item xs={12} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Patient Satisfaction Rating
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timeRange === 'year' ? ratingData : getFilteredData(ratingData)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        borderRadius: 8,
                        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      name="Rating (out of 5)"
                      stroke={theme.palette.secondary.main}
                      strokeWidth={3}
                      dot={{ r: 6, strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorPerformanceChart;
