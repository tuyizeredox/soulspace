import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Divider,
  Menu,
  MenuItem,
  Link,
  Stack,
  LinearProgress,
} from '@mui/material';
import { getAvatarUrl, getInitials } from '../../utils/avatarUtils';
import {
  LocalHospital,
  People,
  Security,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp,
  CheckCircle,
  Warning,
  Error,
  Refresh,
  NotificationsActive,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  CloudSync as CloudSyncIcon,
  Notifications as NotificationsIcon,
  Forum as ForumIcon,
  Feedback as FeedbackIcon,
  BugReport as BugReportIcon,
  Code as CodeIcon,
  Payment as PaymentIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  Language as LanguageIcon,
  School as SchoolIcon,
  Campaign as CampaignIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Business as BusinessIcon,
  VerifiedUser as VerifiedUserIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Analytics as AnalyticsIcon,
  MonetizationOn as MonetizationOnIcon,
  Speed as SpeedIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  MedicalServices as MedicalServicesIcon,
  Healing as HealingIcon,
  Medication as MedicationIcon,
  Insights as InsightsIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowForward as ArrowForwardIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Chat as ChatIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../../utils/axiosConfig';
import HospitalForm from '../../components/hospitals/HospitalForm';
import HospitalRegistrationForm from './HospitalRegistrationForm';
import StatCard from '../../components/dashboard/StatCard';
import DashboardChart from '../../components/dashboard/DashboardChart';
import SystemHealthMonitor from '../../components/admin/SystemHealthMonitor';
import UserActivityMonitor from '../../components/admin/UserActivityMonitor';
import NotificationsPanel from '../../components/admin/NotificationsPanel';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SimpleSuperAdminChat from '../../components/admin/chat/SimpleSuperAdminChat';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SuperAdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Get user data from both auth systems
  const { user: oldUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: newUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = newUser || oldUser;
  const token = newToken || oldToken;

  console.log('SuperAdminDashboard: User data', {
    role: user?.role,
    name: user?.name,
    hasToken: !!token
  });
  const [tabValue, setTabValue] = useState(0);
  const [hospitals, setHospitals] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openHospitalForm, setOpenHospitalForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedHospital, setSelectedHospital] = useState(null);

  // New state variables for enhanced features
  const [systemHealth, setSystemHealth] = useState({
    cpu: 32,
    memory: 45,
    disk: 28,
    network: 65,
    uptime: '99.98%',
    responseTime: '120ms',
    activeConnections: 1243,
    lastBackup: '2023-07-15 03:00 AM',
    status: 'healthy' // 'healthy', 'warning', 'critical'
  });

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', message: 'New hospital registration request', time: '10 minutes ago', read: false },
    { id: 2, type: 'warning', message: 'System backup scheduled for tonight', time: '1 hour ago', read: false },
    { id: 3, type: 'info', message: 'Monthly analytics report is ready', time: '3 hours ago', read: true },
    { id: 4, type: 'success', message: 'Database optimization completed', time: '5 hours ago', read: true },
    { id: 5, type: 'error', message: 'Failed login attempts detected', time: 'Yesterday', read: true }
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, user: 'Dr. Sarah Johnson', action: 'Created new patient record', time: '15 minutes ago' },
    { id: 2, user: 'Admin Mark Wilson', action: 'Updated hospital information', time: '45 minutes ago' },
    { id: 3, user: 'System', action: 'Automatic backup completed', time: '2 hours ago' },
    { id: 4, user: 'Dr. Michael Chen', action: 'Scheduled 5 new appointments', time: '3 hours ago' },
    { id: 5, user: 'Nurse Emily Davis', action: 'Updated patient vitals', time: '4 hours ago' }
  ]);

  const [userStats, setUserStats] = useState({
    totalUsers: 5842,
    activeUsers: 3219,
    newUsersToday: 47,
    usersByRole: [
      { name: 'Patients', value: 4200 },
      { name: 'Doctors', value: 850 },
      { name: 'Nurses', value: 420 },
      { name: 'Admins', value: 120 },
      { name: 'Other', value: 252 }
    ],
    usersByDevice: [
      { name: 'Mobile', value: 65 },
      { name: 'Desktop', value: 25 },
      { name: 'Tablet', value: 10 }
    ],
    userActivity: [
      { name: 'Mon', users: 2100 },
      { name: 'Tue', users: 2400 },
      { name: 'Wed', users: 2200 },
      { name: 'Thu', users: 2800 },
      { name: 'Fri', users: 3200 },
      { name: 'Sat', users: 2900 },
      { name: 'Sun', users: 2300 }
    ]
  });

  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: '$1,245,890',
    monthlyRevenue: '$142,500',
    revenueGrowth: '+12.5%',
    revenueByService: [
      { name: 'Consultations', value: 450000 },
      { name: 'Procedures', value: 320000 },
      { name: 'Medications', value: 180000 },
      { name: 'Lab Tests', value: 150000 },
      { name: 'Other', value: 145890 }
    ],
    revenueByMonth: [
      { name: 'Jan', revenue: 95000 },
      { name: 'Feb', revenue: 102000 },
      { name: 'Mar', revenue: 108000 },
      { name: 'Apr', revenue: 115000 },
      { name: 'May', revenue: 125000 },
      { name: 'Jun', revenue: 132000 },
      { name: 'Jul', revenue: 142500 },
      { name: 'Aug', revenue: 0 },
      { name: 'Sep', revenue: 0 },
      { name: 'Oct', revenue: 0 },
      { name: 'Nov', revenue: 0 },
      { name: 'Dec', revenue: 0 }
    ]
  });

  // New state for hospital analytics
  const [hospitalAnalytics, setHospitalAnalytics] = useState({
    totalAppointments: 12458,
    appointmentsToday: 245,
    appointmentsTrend: '+8.2%',
    patientSatisfaction: 92,
    patientSatisfactionTrend: '+2.4%',
    doctorPerformance: 87,
    doctorPerformanceTrend: '+1.8%',
    appointmentsByType: [
      { name: 'Regular Checkup', value: 45 },
      { name: 'Specialist Consultation', value: 30 },
      { name: 'Emergency', value: 15 },
      { name: 'Follow-up', value: 10 }
    ],
    appointmentsByDepartment: [
      { name: 'Cardiology', value: 25 },
      { name: 'Orthopedics', value: 20 },
      { name: 'Neurology', value: 15 },
      { name: 'Pediatrics', value: 15 },
      { name: 'General Medicine', value: 10 },
      { name: 'Other', value: 15 }
    ],
    patientDemographics: [
      { name: '0-18', value: 15 },
      { name: '19-35', value: 25 },
      { name: '36-50', value: 30 },
      { name: '51-65', value: 20 },
      { name: '65+', value: 10 }
    ],
    weeklyAppointments: [
      { name: 'Mon', appointments: 210 },
      { name: 'Tue', appointments: 240 },
      { name: 'Wed', appointments: 220 },
      { name: 'Thu', appointments: 280 },
      { name: 'Fri', appointments: 320 },
      { name: 'Sat', appointments: 290 },
      { name: 'Sun', appointments: 185 }
    ]
  });

  // New state for medication analytics
  const [medicationAnalytics, setMedicationAnalytics] = useState({
    totalPrescriptions: 8745,
    activePrescriptions: 3210,
    prescriptionsTrend: '+5.7%',
    medicationsByType: [
      { name: 'Antibiotics', value: 30 },
      { name: 'Pain Relief', value: 25 },
      { name: 'Cardiovascular', value: 15 },
      { name: 'Respiratory', value: 10 },
      { name: 'Other', value: 20 }
    ],
    medicationAdherence: 78,
    medicationAdherenceTrend: '+3.2%'
  });

  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [dateRange, setDateRange] = useState('This Month');
  const [refreshing, setRefreshing] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Colors for charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.grey[500]
  ];

  const hospitalColumns = [
    {
      field: 'name',
      headerName: 'Hospital Name',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: 35,
              height: 35
            }}
            src={params.row.avatar ? getAvatarUrl({avatar: params.row.avatar}) : null}
            slotProps={{
              img: {
                onError: (e) => {
                  console.error('Hospital Avatar: Error loading avatar image:', e.target.src);
                  // Hide the image and show initials instead
                  e.target.style.display = 'none';
                }
              }
            }}
          >
            {getInitials(params.value)}
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    { field: 'location', headerName: 'Location', flex: 1 },
    { field: 'adminName', headerName: 'Admin', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      renderCell: (params) => {
        let color = 'success';
        let icon = <CheckCircle fontSize="small" />;

        if (params.value === 'inactive') {
          color = 'error';
          icon = <Error fontSize="small" />;
        } else if (params.value === 'pending') {
          color = 'warning';
          icon = <Warning fontSize="small" />;
        }

        return (
          <Chip
            icon={icon}
            label={params.value || 'active'}
            size="small"
            color={color}
            sx={{ textTransform: 'capitalize' }}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.7,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton color="primary" onClick={() => handleEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  const adminColumns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              color: theme.palette.secondary.main,
              width: 35,
              height: 35
            }}
            src={params.row.avatar ? getAvatarUrl({avatar: params.row.avatar}) : null}
            slotProps={{
              img: {
                onError: (e) => {
                  console.error('Admin Avatar: Error loading avatar image:', e.target.src);
                  // Hide the image and show initials instead
                  e.target.style.display = 'none';
                }
              }
            }}
          >
            {getInitials(params.value || '')}
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {params.value || 'Unknown'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: theme.palette.info.main }}>
          {params.value}
        </Typography>
      )
    },
    { field: 'hospital', headerName: 'Hospital', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.7,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton color="primary" onClick={() => handleEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  // Refresh dashboard data with loading animation and success message
  const refreshDashboardData = useCallback(async () => {
    console.log('SuperAdminDashboard: Refreshing dashboard data...');
    setRefreshing(true);
    await fetchDashboardData();
    // Add a slight delay to show the refresh animation
    setTimeout(() => {
      setRefreshing(false);
      // Show success message
      setSuccess('Dashboard data refreshed successfully');
      console.log('SuperAdminDashboard: Dashboard data refreshed successfully');
    }, 800);
  }, []);

  // Handle menu open/close
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle filter menu
  const handleFilterOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle date range selection
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setFilterAnchorEl(null);
  };

  useEffect(() => {
    // Use a flag to prevent duplicate data fetching
    let isMounted = true;

    // Fetch data only if component is mounted
    if (isMounted) {
      fetchDashboardData();
    }

    // Simulate real-time updates for system health with less frequent updates
    const healthInterval = setInterval(() => {
      if (isMounted) {
        setSystemHealth(prev => ({
          ...prev,
          cpu: Math.floor(Math.random() * 40) + 20,
          memory: Math.floor(Math.random() * 30) + 30,
          disk: Math.floor(Math.random() * 20) + 20,
          network: Math.floor(Math.random() * 30) + 50,
          activeConnections: Math.floor(Math.random() * 500) + 1000
        }));
      }
    }, 10000); // Reduced frequency to 10 seconds

    // Simulate real-time updates for hospital analytics with less frequent updates
    const analyticsInterval = setInterval(() => {
      if (isMounted) {
        setHospitalAnalytics(prev => ({
          ...prev,
          appointmentsToday: Math.floor(Math.random() * 20) + 240,
          patientSatisfaction: Math.min(100, prev.patientSatisfaction + (Math.random() > 0.5 ? 1 : -1)),
          doctorPerformance: Math.min(100, prev.doctorPerformance + (Math.random() > 0.5 ? 1 : -1))
        }));

        setMedicationAnalytics(prev => ({
          ...prev,
          activePrescriptions: prev.activePrescriptions + (Math.random() > 0.5 ? 5 : -3),
          medicationAdherence: Math.min(100, prev.medicationAdherence + (Math.random() > 0.6 ? 1 : -1))
        }));
      }
    }, 15000); // Reduced frequency to 15 seconds

    // Fetch real notifications every 30 seconds
    const notificationsInterval = setInterval(async () => {
      try {
        const notificationsRes = await axios.get('/api/notifications?limit=10');

        if (notificationsRes.data && notificationsRes.data.notifications) {
          const formattedNotifications = notificationsRes.data.notifications.map(notification => ({
            id: notification._id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            time: formatTimeAgo(notification.createdAt),
            read: notification.read,
            actionLink: notification.actionLink || getDefaultActionLink(notification.type),
            priority: notification.priority,
            createdAt: notification.createdAt
          }));
          setNotifications(formattedNotifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }, 30000);

    return () => {
      // Set isMounted to false to prevent state updates after unmounting
      isMounted = false;

      // Clear all intervals to prevent memory leaks
      clearInterval(healthInterval);
      clearInterval(analyticsInterval);
      clearInterval(notificationsInterval);

      console.log('SuperAdminDashboard: Cleaned up intervals');
    };
  }, []);

  const fetchDashboardData = async () => {
    // Only show loading indicator on initial load, not on refresh
    if (!hospitals.length) {
      setLoading(true);
    }

    // Use AbortController to cancel requests if component unmounts
    const controller = new AbortController();
    const signal = controller.signal;

    // Set a timeout to prevent hanging requests
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      console.log('SuperAdminDashboard: Fetching dashboard data...');

      // Use Promise.allSettled to handle partial failures
      console.log('SuperAdminDashboard: Making API requests with token:', !!token);

      const config = {
        signal,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const results = await Promise.allSettled([
        axios.get('/api/hospitals', config),
        axios.get('/api/users?role=hospital_admin', config),
        axios.get('/api/stats/admin', config),
        axios.get('/api/notifications?limit=10', config)
      ]);

      // Clear the timeout since requests completed
      clearTimeout(timeoutId);

      // Process results
      const [hospitalsRes, adminsRes, statsRes, notificationsRes] = results.map(result =>
        result.status === 'fulfilled' ? result.value : { data: null }
      );

      // Make sure each hospital has an id - handle null data
      if (hospitalsRes && hospitalsRes.data && Array.isArray(hospitalsRes.data)) {
        setHospitals(hospitalsRes.data.map(hospital => ({
          id: hospital._id || hospital.id,
          ...hospital
        })));
      }

      // Handle admin data - handle null data
      if (adminsRes && adminsRes.data && Array.isArray(adminsRes.data)) {
        setAdmins(adminsRes.data.map(admin => ({
          id: admin._id || admin.id,
          ...admin
        })));
      }

      // Process the stats data
      const statsData = statsRes.data;
      console.log('Dashboard stats data:', statsData);

      // Format analytics data properly
      const analyticsData = {
        labels: statsData.analyticsData?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Hospital Registrations',
            data: statsData.analyticsData?.hospitalRegistrations || [5, 8, 12, 15, 20, 25, 30],
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            tension: 0.4,
            fill: true,
          },
          {
            label: 'User Registrations',
            data: statsData.analyticsData?.userRegistrations || [20, 45, 75, 120, 180, 220, 280],
            borderColor: theme.palette.secondary.main,
            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
            tension: 0.4,
            fill: true,
          }
        ]
      };

      // Update system health with real data
      setSystemHealth({
        cpu: statsData.systemHealth?.cpu || 32,
        memory: statsData.systemHealth?.memory || 45,
        disk: statsData.systemHealth?.disk || 28,
        network: statsData.systemHealth?.network || 65,
        uptime: statsData.systemHealth?.uptime || '99.98%',
        responseTime: statsData.systemHealth?.responseTime || '120ms',
        activeConnections: statsData.systemHealth?.activeConnections || 1243,
        lastBackup: statsData.systemHealth?.lastBackup || '2023-07-15 03:00 AM',
        status: statsData.systemHealth?.status || 'healthy'
      });

      // Update user stats with real data
      setUserStats({
        totalUsers: statsData.totalUsers || 5842,
        activeUsers: statsData.activeSessions || 3219,
        newUsersToday: statsData.newUsersToday || 47,
        usersByRole: statsData.usersByRole || [
          { name: 'Patients', value: 4200 },
          { name: 'Doctors', value: 850 },
          { name: 'Nurses', value: 420 },
          { name: 'Admins', value: 120 },
          { name: 'Other', value: 252 }
        ],
        usersByDevice: statsData.usersByDevice || [
          { name: 'Mobile', value: 65 },
          { name: 'Desktop', value: 25 },
          { name: 'Tablet', value: 10 }
        ],
        userActivity: statsData.weeklyUserActivity || [
          { name: 'Mon', users: 2100 },
          { name: 'Tue', users: 2400 },
          { name: 'Wed', users: 2200 },
          { name: 'Thu', users: 2800 },
          { name: 'Fri', users: 3200 },
          { name: 'Sat', users: 2900 },
          { name: 'Sun', users: 2300 }
        ]
      });

      // Update hospital analytics with real data
      setHospitalAnalytics({
        totalAppointments: statsData.totalAppointments || 12458,
        appointmentsToday: statsData.appointmentsToday || 245,
        appointmentsTrend: statsData.growthRates?.appointments || '+8.2%',
        patientSatisfaction: 92,
        patientSatisfactionTrend: '+2.4%',
        doctorPerformance: 87,
        doctorPerformanceTrend: '+1.8%',
        appointmentsByType: [
          { name: 'Regular Checkup', value: 45 },
          { name: 'Specialist Consultation', value: 30 },
          { name: 'Emergency', value: 15 },
          { name: 'Follow-up', value: 10 }
        ],
        appointmentsByDepartment: [
          { name: 'Cardiology', value: 25 },
          { name: 'Orthopedics', value: 20 },
          { name: 'Neurology', value: 15 },
          { name: 'Pediatrics', value: 15 },
          { name: 'General Medicine', value: 10 },
          { name: 'Other', value: 15 }
        ],
        patientDemographics: [
          { name: '0-18', value: 15 },
          { name: '19-35', value: 25 },
          { name: '36-50', value: 30 },
          { name: '51-65', value: 20 },
          { name: '65+', value: 10 }
        ],
        weeklyAppointments: [
          { name: 'Mon', appointments: 210 },
          { name: 'Tue', appointments: 240 },
          { name: 'Wed', appointments: 220 },
          { name: 'Thu', appointments: 280 },
          { name: 'Fri', appointments: 320 },
          { name: 'Sat', appointments: 290 },
          { name: 'Sun', appointments: 185 }
        ]
      });

      // Process notifications from direct API call
      if (notificationsRes.data && notificationsRes.data.notifications) {
        const formattedNotifications = notificationsRes.data.notifications.map(notification => ({
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          time: formatTimeAgo(notification.createdAt),
          read: notification.read,
          actionLink: notification.actionLink || getDefaultActionLink(notification.type),
          priority: notification.priority,
          createdAt: notification.createdAt
        }));
        setNotifications(formattedNotifications);
      }
      // Fallback to stats API notifications if direct API call fails
      else if (statsData.notifications && statsData.notifications.length > 0) {
        setNotifications(statsData.notifications);
      }

      // Update recent activities with real data if available
      if (statsData.recentActivities && statsData.recentActivities.length > 0) {
        setRecentActivities(statsData.recentActivities);
      }

      // Update main stats
      setStats({
        totalHospitals: statsData.totalHospitals || 42,
        totalUsers: statsData.totalUsers || 5842,
        activeSessions: statsData.activeSessions || 1243,
        newUsersToday: statsData.newUsersToday || 47,
        newHospitalsToday: statsData.newHospitalsToday || 3,
        analyticsData: analyticsData,
        hospitalsByType: statsData.hospitalsByType || [],
        hospitalsByRegion: statsData.hospitalsByRegion || [],
        growthRates: statsData.growthRates || {
          hospitals: '+5%',
          users: '+12%'
        }
      });

      setLoading(false);
    } catch (error) {
      // Clear the timeout in case of error
      clearTimeout(timeoutId);

      console.error('Dashboard data error:', error);

      // Don't show error for aborted requests (e.g., when component unmounts)
      if (error.name !== 'AbortError') {
        if (error.isNetworkError) {
          // Handle network errors specially
          setError('Network error. Please check your connection and try again.');
        } else if (error.response) {
          // Server responded with an error
          setError(error.response.data?.message || `Server error: ${error.response.status}`);
        } else {
          // Other errors
          setError('Error fetching dashboard data. Please try again later.');
        }

        // Log detailed error for debugging
        console.error('Detailed error:', {
          message: error.message,
          isNetworkError: error.isNetworkError,
          status: error.response?.status,
          data: error.response?.data
        });
      }

      setLoading(false);
    }
  };

  // Handle notification menu
  const handleNotificationMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle notification drawer
  const toggleNotificationDrawer = () => {
    setNotificationDrawerOpen(!notificationDrawerOpen);
  };

  // Handle settings drawer
  const toggleSettingsDrawer = () => {
    setSettingsDrawerOpen(!settingsDrawerOpen);
  };

  // Mark notification as read
  const markNotificationAsRead = async (id) => {
    try {
      // Update UI immediately for better UX
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );

      // Send request to backend to update notification
      if (id && id.toString().startsWith('mock')) {
        console.log('Mock notification, not sending to backend');
        return;
      }

      await axios.put(`/api/notifications/${id}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      // Update UI immediately for better UX
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );

      // Send request to backend
      await axios.put('/api/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
    }
  };

  // Get unread notification count
  const getUnreadNotificationCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  // Delete notification
  const handleDeleteNotification = async (id) => {
    try {
      // Update UI immediately for better UX
      setNotifications(prev => prev.filter(notification => notification.id !== id));

      // Send request to backend to delete notification
      if (id && id.toString().startsWith('mock')) {
        console.log('Mock notification, not sending to backend');
        return;
      }

      await axios.delete(`/api/notifications/${id}`);
      setSuccess('Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Failed to delete notification');

      // Refresh notifications to restore state
      fetchDashboardData();
    }
  };

  // Handle settings tab change
  const handleSettingsTabChange = (event, newValue) => {
    setActiveSettingsTab(newValue);
  };

  // Get system health status color
  const getSystemHealthColor = (value) => {
    if (value < 50) return theme.palette.success.main;
    if (value < 80) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  // Format time ago for notifications
  const formatTimeAgo = (date) => {
    if (!date) return '';

    const now = new Date();
    const diff = now - new Date(date);

    // Convert milliseconds to seconds
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) {
      return 'Just now';
    }

    // Convert seconds to minutes
    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Convert minutes to hours
    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Convert hours to days
    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }

    // Convert days to weeks
    const weeks = Math.floor(days / 7);

    if (weeks < 4) {
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }

    // Convert weeks to months
    const months = Math.floor(days / 30);

    if (months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }

    // Convert months to years
    const years = Math.floor(days / 365);

    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  };

  // Get default action link based on notification type
  const getDefaultActionLink = (type) => {
    switch (type) {
      case 'hospital':
        return '/admin/hospitals';
      case 'appointment':
        return '/admin/appointments';
      case 'message':
        return '/admin/messages';
      case 'prescription':
        return '/admin/prescriptions';
      case 'lab_result':
        return '/admin/lab-results';
      case 'system':
        return '/admin/system';
      case 'reminder':
        return '/admin/calendar';
      case 'user':
        return '/admin/users';
      case 'analytics':
        return '/admin/analytics';
      case 'security':
        return '/admin/security';
      case 'warning':
        return '/admin/system';
      case 'success':
        return '/admin/dashboard';
      case 'error':
        return '/admin/system';
      case 'info':
        return '/admin/dashboard';
      default:
        return '/admin/dashboard';
    }
  };
  // Handle hospital form
  const handleOpenHospitalForm = () => {
    setFormMode('add');
    setSelectedHospital(null);
    setOpenHospitalForm(true);
  };

  const handleCloseHospitalForm = () => {
    setOpenHospitalForm(false);
  };

  const handleHospitalSubmit = async (formData) => {
    try {
      console.log('SuperAdminDashboard: Submitting hospital form with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      if (formMode === 'add') {
        // Create new hospital
        await axios.post('/api/hospitals', formData, config);
        setSuccess('Hospital created successfully');
      } else {
        // Update existing hospital
        await axios.put(`/api/hospitals/${selectedHospital.id}`, formData, config);
        setSuccess('Hospital updated successfully');
      }

      // Refresh data
      fetchDashboardData();
      handleCloseHospitalForm();
    } catch (error) {
      console.error('Error submitting hospital:', error);
      setError(error.response?.data?.message || 'Error processing hospital');
    }
  };

  const handleEdit = (item) => {
    console.log('Editing:', item);
    setSelectedHospital(item);
    setFormMode('edit');
    setOpenHospitalForm(true);
  };
  const handleDelete = async (id) => {
    try {
      console.log('SuperAdminDashboard: Deleting hospital with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      await axios.delete(`/api/hospitals/${id}`, config);
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting hospital:', error);
      setError('Error deleting hospital: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle hospital registration with the legacy form
  const handleHospitalRegistration = async (values) => {
    try {
      setLoading(true);
      console.log('SuperAdminDashboard: Registering hospital with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const response = await axios.post('/api/hospitals/register', values, config);

      setHospitals(prevHospitals => [...prevHospitals, {
        ...response.data.hospital,
        id: response.data.hospital._id,
        adminName: response.data.admin.name
      }]);

      setOpenForm(false);
      setError('');
      setSuccess('Hospital registered successfully');
    } catch (error) {
      console.error('Error registering hospital:', error);
      setError(error.response?.data?.message || 'Error registering hospital');
    } finally {
      setLoading(false);
    }
  };
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  // Show loading state only on initial load
  if (loading && !hospitals.length) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => {
              setError('');
              refreshDashboardData();
            }}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Dashboard data could not be loaded
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            There was a problem loading the dashboard data. This could be due to network issues or the server might be unavailable.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => {
              setError('');
              refreshDashboardData();
            }}
          >
            Refresh Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  // Log that we're rendering the dashboard
  console.log('SuperAdminDashboard: Rendering dashboard content');

  return (
    <Box
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)} 0%, ${alpha(theme.palette.grey[900], 0.9)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
        pt: 3,
        pb: 6
      }}
    >
      {/* Success message */}
      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            mx: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '& .MuiAlert-icon': { fontSize: '1.2rem' }
          }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      <Container maxWidth="xl">
        {/* Dashboard Header */}
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Super Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Welcome back! Here's what's happening with your healthcare network today.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Date Range Filter */}
            <Paper
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
              }}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
            >
              <FilterListIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
              <Typography variant="body2" fontWeight={500}>
                {dateRange}
              </Typography>
            </Paper>

            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={() => setFilterAnchorEl(null)}
              PaperProps={{
                sx: { borderRadius: 2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }
              }}
            >
              {['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'].map((range) => (
                <MenuItem
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  selected={dateRange === range}
                  sx={{
                    minWidth: 150,
                    '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                  }}
                >
                  {range}
                </MenuItem>
              ))}
            </Menu>

            {/* Actions Menu */}
            <Tooltip title="More Actions">
              <IconButton
                onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                sx={{
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.2) }
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={() => setMenuAnchorEl(null)}
              PaperProps={{
                sx: { borderRadius: 2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }
              }}
            >
              <MenuItem onClick={() => setMenuAnchorEl(null)}>
                <DownloadIcon sx={{ mr: 1, fontSize: 20 }} />
                Export Data
              </MenuItem>
              <MenuItem onClick={() => setMenuAnchorEl(null)}>
                <PrintIcon sx={{ mr: 1, fontSize: 20 }} />
                Print Report
              </MenuItem>
              <MenuItem onClick={() => setMenuAnchorEl(null)}>
                <ShareIcon sx={{ mr: 1, fontSize: 20 }} />
                Share Dashboard
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => setMenuAnchorEl(null)}>
                <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                Settings
              </MenuItem>
            </Menu>

            {/* Refresh Button */}
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={() => refreshDashboardData()}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                {refreshing ? (
                  <CircularProgress size={24} color="primary" />
                ) : (
                  <Refresh />
                )}
              </IconButton>
            </Tooltip>

            {/* Register Hospital Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenHospitalForm}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Register New Hospital
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Quick Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3} lg={2} component={motion.div} variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      width: 48,
                      height: 48
                    }}
                  >
                    <LocalHospital />
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Chip
                      label="+12%"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">vs last month</Typography>
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                  {stats.totalHospitals || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Hospitals
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 4,
                  width: '100%',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.3)})`
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3} lg={2} component={motion.div} variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main,
                      width: 48,
                      height: 48
                    }}
                  >
                    <People />
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Chip
                      label="+8%"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">vs last month</Typography>
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                  {stats.totalUsers || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 4,
                  width: '100%',
                  background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${alpha(theme.palette.secondary.main, 0.3)})`
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3} lg={2} component={motion.div} variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      width: 48,
                      height: 48
                    }}
                  >
                    <Security />
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Chip
                      label="+15%"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">vs last month</Typography>
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                  {stats.activeSessions || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Sessions
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 4,
                  width: '100%',
                  background: `linear-gradient(90deg, ${theme.palette.info.main}, ${alpha(theme.palette.info.main, 0.3)})`
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3} lg={2} component={motion.div} variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      width: 48,
                      height: 48
                    }}
                  >
                    <HealthAndSafetyIcon />
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Chip
                      label="Excellent"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">System Status</Typography>
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                  99.9%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  System Uptime
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 4,
                  width: '100%',
                  background: `linear-gradient(90deg, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.3)})`
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3} lg={2} component={motion.div} variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                      width: 48,
                      height: 48
                    }}
                  >
                    <MedicalServicesIcon />
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Chip
                      label="+5%"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">vs last month</Typography>
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                  12.4K
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Appointments
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 4,
                  width: '100%',
                  background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${alpha(theme.palette.warning.main, 0.3)})`
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3} lg={2} component={motion.div} variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      width: 48,
                      height: 48
                    }}
                  >
                    <MonetizationOnIcon />
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Chip
                      label="+18%"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">vs last month</Typography>
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                  $1.24M
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 4,
                  width: '100%',
                  background: `linear-gradient(90deg, ${theme.palette.error.main}, ${alpha(theme.palette.error.main, 0.3)})`
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* System Health and Notifications */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <SystemHealthMonitor
              systemHealth={systemHealth}
              onRefresh={() => {
                setSystemHealth(prev => ({
                  ...prev,
                  cpu: Math.floor(Math.random() * 40) + 20,
                  memory: Math.floor(Math.random() * 30) + 30,
                  disk: Math.floor(Math.random() * 20) + 20,
                  network: Math.floor(Math.random() * 30) + 50,
                  activeConnections: Math.floor(Math.random() * 500) + 1000
                }));
              }}
            />
          </Grid>

          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <NotificationsPanel
              notifications={notifications}
              recentActivities={recentActivities}
              onMarkAllRead={markAllNotificationsAsRead}
              onMarkAsRead={markNotificationAsRead}
              onDeleteNotification={handleDeleteNotification}
            />
          </Grid>
        </Grid>

        {/* User Activity Monitor */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} component={motion.div} variants={itemVariants}>
            <UserActivityMonitor userStats={userStats} />
          </Grid>
        </Grid>

        {/* Admin Communication Center Preview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} component={motion.div} variants={itemVariants}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                Hospital Admin Communication Center
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ChatIcon />}
                onClick={() => navigate('/admin/chat')}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Open Full Chat
              </Button>
            </Box>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.15)})`,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 3
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Real-time Communication Hub
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Connect with hospital administrators, manage group conversations, and coordinate across your healthcare network.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ChatIcon />}
                    onClick={() => navigate('/admin/chat')}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Start Chatting
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<GroupIcon />}
                    onClick={() => navigate('/admin/chat')}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Connect with Admins
                  </Button>
                </Box>
              </Box>
              <Box
                component="img"
                src="/assets/images/chat-illustration.svg"
                alt="Chat"
                sx={{
                  width: { xs: '100%', md: '40%' },
                  maxWidth: 300,
                  height: 'auto'
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Card
          component={motion.div}
          variants={itemVariants}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            mb: 4
          }}
        >
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 3,
              pt: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  px: 3,
                  py: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem'
                }
              }}
            >
              <Tab label="Hospitals" icon={<LocalHospital />} iconPosition="start" />
              <Tab label="Administrators" icon={<People />} iconPosition="start" />
              <Tab label="Analytics" icon={<TrendingUp />} iconPosition="start" />
            </Tabs>

            <Box sx={{ display: 'flex', gap: 1, p: 1 }}>
              <Tooltip title="Export Data">
                <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Print">
                <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
                  <PrintIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filter">
                <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
                  <FilterListIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <CardContent sx={{ p: 3 }}>
            <Box>
              {tabValue === 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Registered Hospitals
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleOpenHospitalForm}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                      }}
                    >
                      Add Hospital
                    </Button>
                  </Box>
                  <DataGrid
                    rows={hospitals}
                    columns={hospitalColumns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    autoHeight
                    disableSelectionOnClick
                    sx={{
                      border: 'none',
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2
                      },
                      '& .MuiDataGrid-cell': {
                        py: 1.5
                      }
                    }}
                  />
                </>
              )}
              {tabValue === 1 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Hospital Administrators
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.2)}`,
                        bgcolor: theme.palette.secondary.main
                      }}
                    >
                      Add Administrator
                    </Button>
                  </Box>
                  <DataGrid
                    rows={admins}
                    columns={adminColumns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    autoHeight
                    disableSelectionOnClick
                    sx={{
                      border: 'none',
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                        borderRadius: 2
                      },
                      '& .MuiDataGrid-cell': {
                        py: 1.5
                      }
                    }}
                  />
                </>
              )}
              {tabValue === 2 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      System Analytics
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Monthly
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Quarterly
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Yearly
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ p: 2, height: 400 }}>
                    <DashboardChart data={stats.analyticsData || {}} />
                  </Box>
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Quick Actions Section */}
        <Card
          component={motion.div}
          variants={itemVariants}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            mb: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Quick Actions
              </Typography>
              <Button
                variant="text"
                endIcon={<KeyboardArrowRightIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: theme.palette.primary.main
                }}
              >
                View All Actions
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  component={motion.div}
                  whileHover={{ y: -5 }}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                      borderColor: theme.palette.primary.main
                    }
                  }}
                  onClick={handleOpenHospitalForm}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        width: 40,
                        height: 40,
                        mr: 1.5,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                      }}
                    >
                      <AddIcon />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Register Hospital
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 6.5 }}>
                    Add a new hospital to the network
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mt: 1,
                    opacity: 0.7,
                    '& .MuiSvgIcon-root': {
                      fontSize: '1rem',
                      transition: 'transform 0.2s',
                    },
                    '&:hover .MuiSvgIcon-root': {
                      transform: 'translateX(3px)',
                    }
                  }}>
                    <KeyboardArrowRightIcon color="primary" />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  component={motion.div}
                  whileHover={{ y: -5 }}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.15)}`,
                      borderColor: theme.palette.secondary.main
                    }
                  }}
                  onClick={() => navigate('/admin/users')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                        width: 40,
                        height: 40,
                        mr: 1.5,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.2)}`
                      }}
                    >
                      <People />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Manage Users
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 6.5 }}>
                    View and manage system users
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mt: 1,
                    opacity: 0.7,
                    '& .MuiSvgIcon-root': {
                      fontSize: '1rem',
                      transition: 'transform 0.2s',
                    },
                    '&:hover .MuiSvgIcon-root': {
                      transform: 'translateX(3px)',
                    }
                  }}>
                    <KeyboardArrowRightIcon color="secondary" />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  component={motion.div}
                  whileHover={{ y: -5 }}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.15)}`,
                      borderColor: theme.palette.info.main
                    }
                  }}
                  onClick={() => navigate('/admin/analytics')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        width: 40,
                        height: 40,
                        mr: 1.5,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.2)}`
                      }}
                    >
                      <TrendingUp />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Analytics
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 6.5 }}>
                    View detailed system analytics
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mt: 1,
                    opacity: 0.7,
                    '& .MuiSvgIcon-root': {
                      fontSize: '1rem',
                      transition: 'transform 0.2s',
                    },
                    '&:hover .MuiSvgIcon-root': {
                      transform: 'translateX(3px)',
                    }
                  }}>
                    <KeyboardArrowRightIcon color="info" />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  component={motion.div}
                  whileHover={{ y: -5 }}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.15)}`,
                      borderColor: theme.palette.error.main
                    }
                  }}
                  onClick={() => navigate('/admin/security')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                        width: 40,
                        height: 40,
                        mr: 1.5,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`
                      }}
                    >
                      <Security />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Security
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 6.5 }}>
                    Manage system security settings
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mt: 1,
                    opacity: 0.7,
                    '& .MuiSvgIcon-root': {
                      fontSize: '1rem',
                      transition: 'transform 0.2s',
                    },
                    '&:hover .MuiSvgIcon-root': {
                      transform: 'translateX(3px)',
                    }
                  }}>
                    <KeyboardArrowRightIcon color="error" />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

      {/* Hospital Form */}
      <HospitalForm
        open={openHospitalForm}
        onClose={handleCloseHospitalForm}
        onSubmit={handleHospitalSubmit}
        hospital={selectedHospital}
        mode={formMode}
      />

      {/* Legacy Hospital Registration Form - will be removed */}
      <HospitalRegistrationForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleHospitalRegistration}
      />
    </Box>
  );
};

export default SuperAdminDashboard;