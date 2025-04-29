import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Divider,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp as TrendIcon } from '@mui/icons-material';

const TrendsChart = ({ data, timeRange }) => {
  const theme = useTheme();
  const [metric, setMetric] = React.useState('patients');

  // Generate sample data if real data is not available
  const generateSampleData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const isCurrentMonth = index === currentMonth;
      const isBeforeCurrent = index < currentMonth;
      
      // Generate realistic looking data with an upward trend
      const basePatients = 50 + index * 5;
      const baseAppointments = 80 + index * 8;
      const baseTreatments = 30 + index * 3;
      
      // Add some randomness
      const randomFactor = isBeforeCurrent ? Math.random() * 20 - 10 : 0;
      
      return {
        name: month,
        patients: Math.round(basePatients + randomFactor),
        appointments: Math.round(baseAppointments + randomFactor * 1.5),
        treatments: Math.round(baseTreatments + randomFactor * 0.8),
        // Highlight current month
        current: isCurrentMonth
      };
    });
  };

  // Use real data if available, otherwise use sample data
  const chartData = data?.length > 0 ? data : generateSampleData();

  // Handle metric change
  const handleMetricChange = (event) => {
    setMetric(event.target.value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: theme.shadows[3]
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: entry.color,
                  borderRadius: '50%',
                  mr: 1
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {entry.name}: {entry.value}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  // Get color for each metric
  const getMetricColor = (metricName) => {
    switch (metricName) {
      case 'patients':
        return theme.palette.primary.main;
      case 'appointments':
        return theme.palette.secondary.main;
      case 'treatments':
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
    }
  };

  // Calculate growth rate
  const calculateGrowth = () => {
    if (chartData.length < 2) return 0;
    
    const currentValue = chartData[chartData.length - 1][metric];
    const previousValue = chartData[chartData.length - 2][metric];
    
    if (previousValue === 0) return 100;
    
    return Math.round(((currentValue - previousValue) / previousValue) * 100);
  };

  const growth = calculateGrowth();

  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: theme.shadows[2] }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendIcon 
              sx={{ 
                color: theme.palette.primary.main, 
                mr: 1, 
                fontSize: 28,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                padding: 0.5,
                borderRadius: '50%'
              }} 
            />
            <Typography variant="h6" fontWeight={600}>
              Growth Trends
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
              <InputLabel id="metric-select-label">Metric</InputLabel>
              <Select
                labelId="metric-select-label"
                id="metric-select"
                value={metric}
                label="Metric"
                onChange={handleMetricChange}
              >
                <MenuItem value="patients">Patients</MenuItem>
                <MenuItem value="appointments">Appointments</MenuItem>
                <MenuItem value="treatments">Treatments</MenuItem>
              </Select>
            </FormControl>
            <Chip
              label={timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
              size="small"
              color="primary"
              sx={{ fontWeight: 500, height: 24 }}
            />
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </Typography>
            <Typography variant="h5" fontWeight={600} color={getMetricColor(metric)}>
              {chartData[chartData.length - 1]?.[metric] || 0}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Growth Rate
            </Typography>
            <Typography 
              variant="h5" 
              fontWeight={600} 
              color={growth > 0 ? 'success.main' : growth < 0 ? 'error.main' : 'text.secondary'}
            >
              {growth > 0 ? '+' : ''}{growth}%
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: theme.palette.text.secondary }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis 
                tick={{ fill: theme.palette.text.secondary }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey={metric}
                name={metric.charAt(0).toUpperCase() + metric.slice(1)}
                stroke={getMetricColor(metric)}
                activeDot={{ r: 8 }}
                strokeWidth={2}
                dot={{ stroke: getMetricColor(metric), strokeWidth: 2, r: 4, fill: theme.palette.background.paper }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrendsChart;
