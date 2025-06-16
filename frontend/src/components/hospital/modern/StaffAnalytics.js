import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  Stack,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import axios from '../../../utils/axiosConfig';

const StaffAnalytics = () => {
  const theme = useTheme();
  const { user, token } = useSelector((state) => state.userAuth);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState({});
  const [timeframe, setTimeframe] = useState('30d');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Chart colors
  const chartColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe, selectedDepartment]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // In a real app, this would call actual analytics endpoints
      // For now, we'll simulate with the staff data
      const staffResponse = await axios.get('/api/staff/hospital', config);
      const staff = staffResponse.data || [];
      
      // Process data for analytics
      const processedData = processStaffAnalytics(staff);
      setAnalyticsData(processedData);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processStaffAnalytics = (staff) => {
    // Department performance metrics
    const departmentMetrics = {};
    staff.forEach(member => {
      const dept = member.department || 'Unassigned';
      if (!departmentMetrics[dept]) {
        departmentMetrics[dept] = {
          name: dept,
          totalStaff: 0,
          activeStaff: 0,
          efficiency: Math.floor(Math.random() * 30) + 70, // Simulated
          satisfaction: Math.floor(Math.random() * 20) + 80, // Simulated
          retention: Math.floor(Math.random() * 15) + 85, // Simulated
        };
      }
      departmentMetrics[dept].totalStaff++;
      if (member.status === 'active') {
        departmentMetrics[dept].activeStaff++;
      }
    });

    // Role distribution
    const roleDistribution = {};
    staff.forEach(member => {
      const role = member.role || 'Unknown';
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });

    // Weekly attendance simulation
    const weekDays = eachDayOfInterval({
      start: startOfWeek(new Date()),
      end: endOfWeek(new Date())
    });
    
    const attendanceData = weekDays.map(day => ({
      day: format(day, 'EEEE'),
      present: Math.floor(Math.random() * 20) + staff.length * 0.8,
      absent: Math.floor(Math.random() * 10) + 5,
      late: Math.floor(Math.random() * 15) + 5
    }));

    // Performance trends (simulated monthly data)
    const performanceTrends = Array.from({ length: 6 }, (_, i) => ({
      month: format(subDays(new Date(), i * 30), 'MMM'),
      productivity: Math.floor(Math.random() * 20) + 75,
      satisfaction: Math.floor(Math.random() * 15) + 80,
      retention: Math.floor(Math.random() * 10) + 85
    })).reverse();

    // Top performers (simulated)
    const topPerformers = staff.slice(0, 5).map(member => ({
      ...member,
      score: Math.floor(Math.random() * 20) + 80,
      improvement: Math.floor(Math.random() * 10) + 5
    }));

    // Workload distribution
    const workloadData = Object.values(departmentMetrics).map(dept => ({
      department: dept.name,
      capacity: 100,
      current: Math.floor(Math.random() * 30) + 60,
      optimal: 80
    }));

    return {
      departmentMetrics: Object.values(departmentMetrics),
      roleDistribution: Object.entries(roleDistribution).map(([role, count]) => ({
        role,
        count,
        percentage: ((count / staff.length) * 100).toFixed(1)
      })),
      attendanceData,
      performanceTrends,
      topPerformers,
      workloadData,
      totalStaff: staff.length,
      activeStaff: staff.filter(s => s.status === 'active').length,
      avgEfficiency: Math.floor(Math.random() * 15) + 80,
      avgSatisfaction: Math.floor(Math.random() * 10) + 85
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading analytics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Staff Analytics Dashboard
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              label="Timeframe"
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 3 months</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchAnalyticsData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Stack>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {analyticsData.totalStaff}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Staff
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption">+5% from last month</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {analyticsData.avgEfficiency}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Avg Efficiency
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption">+3% improvement</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {analyticsData.avgSatisfaction}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Satisfaction
                  </Typography>
                </Box>
                <StarIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption">Stable</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    92%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Attendance Rate
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingDownIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption">-1% this week</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Department Performance */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader title="Department Performance Metrics" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.departmentMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="efficiency" fill={chartColors[0]} name="Efficiency %" />
                  <Bar dataKey="satisfaction" fill={chartColors[1]} name="Satisfaction %" />
                  <Bar dataKey="retention" fill={chartColors[2]} name="Retention %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Role Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader title="Staff by Role" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.roleDistribution}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ role, percentage }) => `${role}: ${percentage}%`}
                  >
                    {analyticsData.roleDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Attendance */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="Weekly Attendance Pattern" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="present" stackId="1" stroke={chartColors[0]} fill={chartColors[0]} />
                  <Area type="monotone" dataKey="late" stackId="1" stroke={chartColors[1]} fill={chartColors[1]} />
                  <Area type="monotone" dataKey="absent" stackId="1" stroke={chartColors[2]} fill={chartColors[2]} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Trends */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="Performance Trends" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="productivity" stroke={chartColors[0]} strokeWidth={3} />
                  <Line type="monotone" dataKey="satisfaction" stroke={chartColors[1]} strokeWidth={3} />
                  <Line type="monotone" dataKey="retention" stroke={chartColors[2]} strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="Top Performers" />
            <CardContent>
              <Stack spacing={2}>
                {analyticsData.topPerformers?.map((performer, index) => (
                  <Box key={performer.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: chartColors[index % chartColors.length] }}>
                      {performer.name?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2">{performer.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {performer.department} • {performer.role}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={performer.score} 
                        sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    <Chip 
                      label={`${performer.score}%`} 
                      size="small" 
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Workload Distribution */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="Department Workload" />
            <CardContent>
              <Stack spacing={2}>
                {analyticsData.workloadData?.map((dept, index) => (
                  <Box key={dept.department}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{dept.department}</Typography>
                      <Typography variant="caption">{dept.current}% capacity</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={dept.current} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: dept.current > 90 ? theme.palette.error.main :
                                  dept.current > 80 ? theme.palette.warning.main :
                                  theme.palette.success.main
                        }
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffAnalytics;