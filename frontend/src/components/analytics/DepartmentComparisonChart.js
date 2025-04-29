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
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { CompareArrows as CompareIcon } from '@mui/icons-material';

const DepartmentComparisonChart = ({ data, timeRange }) => {
  const theme = useTheme();
  const [metric, setMetric] = React.useState('patients');

  // Handle metric change
  const handleMetricChange = (event) => {
    setMetric(event.target.value);
  };

  // Sort departments by the selected metric
  const sortedDepartments = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    return [...data].sort((a, b) => b[metric] - a[metric]);
  }, [data, metric]);

  // Calculate the maximum value for the selected metric
  const maxValue = React.useMemo(() => {
    if (!sortedDepartments.length) return 100;
    return Math.max(...sortedDepartments.map(dept => dept[metric]));
  }, [sortedDepartments, metric]);

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

  // Get color for the bar based on department index
  const getBarColor = (index) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main
    ];
    return colors[index % colors.length];
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: theme.shadows[2] }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CompareIcon 
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
              Department Comparison
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
                <MenuItem value="doctors">Doctors</MenuItem>
                <MenuItem value="appointments">Appointments</MenuItem>
                <MenuItem value="satisfaction">Satisfaction</MenuItem>
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
        
        {sortedDepartments.length > 0 ? (
          <>
            <Box sx={{ height: 300, mb: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedDepartments}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                  <XAxis type="number" tick={{ fill: theme.palette.text.secondary }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fill: theme.palette.text.secondary }}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey={metric} 
                    name={metric.charAt(0).toUpperCase() + metric.slice(1)} 
                    radius={[0, 4, 4, 0]}
                  >
                    {sortedDepartments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
            
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Doctors</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Patients</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>{metric.charAt(0).toUpperCase() + metric.slice(1)}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedDepartments.map((dept, index) => (
                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: getBarColor(index),
                              mr: 1
                            }}
                          />
                          {dept.name}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{dept.doctors}</TableCell>
                      <TableCell align="center">{dept.patients}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(dept[metric] / maxValue) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: alpha(getBarColor(index), 0.2),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getBarColor(index),
                                  borderRadius: 4
                                }
                              }}
                            />
                          </Box>
                          <Typography variant="body2" fontWeight={500}>
                            {metric === 'satisfaction' ? `${dept[metric]}%` : dept[metric]}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No department data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentComparisonChart;
