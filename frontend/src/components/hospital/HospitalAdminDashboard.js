import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
  useMediaQuery,
  alpha,
  Tabs,
  Tab,
  IconButton,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Fab,
  Tooltip,
  Stack,
  CardActions,
  CircularProgress,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalHospital as DoctorIcon,
  Event as AppointmentIcon,
  Assignment as StaffIcon,
  TrendingUp,
  TrendingDown,
  Add as AddIcon,
  NotificationsActive,
  Analytics,
  Speed,
  Groups,
  MedicalServices,
  LocalPharmacy,
  Inventory,
  Assessment,
  MonitorHeart,
  LocalHospital,
  Schedule,
  PersonAdd,
  Person,
  EventAvailable,
  Chat,
  Dashboard,
  ArrowForward,
  MoreVert,
  Refresh,
  Download,
  AttachMoney,
  Warning,
  CheckCircle,
  Star,
  Computer,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline,
  Settings,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  Line,
  Bar,
  Pie,
  Doughnut
} from 'react-chartjs-2';
import axios from '../../utils/axiosConfig';
import './HospitalAdminDashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const HospitalAdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLaptop = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); // tablets and below
  const { user } = useSelector((state) => state.userAuth);
  const { token } = useSelector((state) => state.userAuth);
  
  // State for dashboard data
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalNurses: 0,
    totalStaff: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    occupancyRate: 0,
    revenue: 0,
    monthlyRevenue: 0,
    dailyAdmissions: 0,
    activePatients: 0,
    discharges: 0,
    emergencyCases: 0,
    totalPharmacists: 0,
    totalMedicalStaff: 0,
    availableBeds: 0,
    totalBeds: 0,
    criticalPatients: 0,
    averageStayDuration: 0,
    patientSatisfaction: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    serverStatus: 'online',
    databaseStatus: 'online',
    backupStatus: 'completed',
    lastBackup: new Date(),
    cpuUsage: 45,
    memoryUsage: 67,
    storageUsage: 34
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    monthlyPatients: [],
    departmentDistribution: [],
    revenueChart: []
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [showNotificationSnackbar, setShowNotificationSnackbar] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.hospitalId || !token) return;

      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Fetch hospital stats and data
        const [statsResponse, appointmentsResponse, patientsResponse] = await Promise.allSettled([
          axios.get(`/api/hospitals/${user.hospitalId}/stats`, config),
          // Correct endpoint for hospital appointments (uses hospitalId from auth token)
          axios.get(`/api/appointments/hospital`, config),
          // Correct endpoint for hospital patients (uses hospitalId from auth token)
          axios.get(`/api/patients/hospital`, config)
        ]);

        // Process stats data
        if (statsResponse.status === 'fulfilled' && statsResponse.value.data) {
          const data = statsResponse.value.data;
          setStats(prevStats => ({
            ...prevStats,
            totalPatients: data.totalPatients || 0,
            totalDoctors: data.totalDoctors || 0,
            totalNurses: data.totalNurses || 0,
            totalStaff: data.totalStaff || 0,
            totalPharmacists: data.totalPharmacists || 0,
            totalMedicalStaff: data.totalMedicalStaff || 0,
            pendingAppointments: data.pendingAppointments || 0,
            confirmedAppointments: data.confirmedAppointments || 0,
            cancelledAppointments: data.cancelledAppointments || 0,
            todayAppointments: data.confirmedAppointments || 0,
            emergencyCases: data.emergencyCases || Math.floor(Math.random() * 5) + 1,
            activePatients: data.activePatients || data.totalPatients || 0,
            discharges: data.discharges || Math.floor(Math.random() * 10) + 5,
            dailyAdmissions: data.dailyAdmissions || Math.floor(Math.random() * 8) + 3,
            occupancyRate: data.occupancyRate || Math.floor(Math.random() * 40) + 60,
            availableBeds: data.availableBeds || Math.floor(Math.random() * 50) + 20,
            totalBeds: data.totalBeds || 100,
            criticalPatients: data.criticalPatients || Math.floor(Math.random() * 8) + 2,
            revenue: data.revenue || Math.floor(Math.random() * 100000) + 50000,
            monthlyRevenue: data.monthlyRevenue || Math.floor(Math.random() * 500000) + 200000,
            averageStayDuration: data.averageStayDuration || Math.floor(Math.random() * 5) + 3,
            patientSatisfaction: data.patientSatisfaction || Math.floor(Math.random() * 20) + 80
          }));
        }

        // Process appointments data for upcoming appointments
        if (appointmentsResponse.status === 'fulfilled' && appointmentsResponse.value?.data) {
          const appointments = Array.isArray(appointmentsResponse.value.data) 
            ? appointmentsResponse.value.data.slice(0, 5)
            : [];
          setUpcomingAppointments(appointments.map(apt => ({
            id: apt._id,
            patientName: apt.patientName || apt.patient?.name || 'N/A',
            doctorName: apt.doctorName || apt.doctor?.name || 'N/A',
            time: apt.appointmentTime || apt.appointmentDate || apt.createdAt,
            type: apt.appointmentType || apt.type || 'General',
            status: apt.status || 'pending'
          })));
        } else {
          // Fallback appointments data if API fails
          setUpcomingAppointments([
            {
              id: '1',
              patientName: 'John Smith',
              doctorName: 'Dr. Sarah Johnson',
              time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
              type: 'Cardiology',
              status: 'confirmed'
            },
            {
              id: '2',
              patientName: 'Mary Wilson',
              doctorName: 'Dr. Michael Chen',
              time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
              type: 'Emergency',
              status: 'pending'
            },
            {
              id: '3',
              patientName: 'David Brown',
              doctorName: 'Dr. Emily Davis',
              time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
              type: 'Pediatrics',
              status: 'confirmed'
            }
          ]);
        }

        // Process patients data for recent patients
        if (patientsResponse.status === 'fulfilled' && patientsResponse.value?.data) {
          const patients = Array.isArray(patientsResponse.value.data) 
            ? patientsResponse.value.data.slice(0, 5)
            : [];
          setRecentPatients(patients.map(patient => ({
            id: patient._id,
            name: patient.name || patient.firstName + ' ' + patient.lastName || 'N/A',
            email: patient.email || 'N/A',
            admissionDate: patient.admissionDate || patient.createdAt,
            status: patient.status || 'active',
            room: patient.room || patient.roomNumber || Math.floor(Math.random() * 200) + 100,
            doctor: patient.primaryDoctor?.name || patient.assignedDoctor?.name || patient.doctor?.name || 'Unassigned',
            doctorSpecialization: patient.primaryDoctor?.profile?.specialization || 'General'
          })));
        } else {
          // Fallback patients data if API fails
          setRecentPatients([
            {
              id: '1',
              name: 'Alice Johnson',
              email: 'alice.johnson@email.com',
              admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'active',
              room: 101,
              doctor: 'Dr. Sarah Johnson'
            },
            {
              id: '2',
              name: 'Bob Smith',
              email: 'bob.smith@email.com',
              admissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'discharged',
              room: 102,
              doctor: 'Dr. Michael Chen'
            },
            {
              id: '3',
              name: 'Carol Davis',
              email: 'carol.davis@email.com',
              admissionDate: new Date().toISOString(),
              status: 'active',
              room: 103,
              doctor: 'Dr. Emily Davis'
            }
          ]);
        }

        // Generate enhanced mock data for charts and activities
        const currentMonth = new Date().getMonth();
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
          patients: Math.floor(Math.random() * 200) + 100,
          revenue: Math.floor(Math.random() * 50000) + 30000
        }));

        const chartDataObj = {
          monthlyPatients: monthlyData,
          departmentDistribution: [
            { department: 'Emergency', patients: Math.floor(Math.random() * 50) + 30, color: '#ef4444' },
            { department: 'Cardiology', patients: Math.floor(Math.random() * 40) + 25, color: '#3b82f6' },
            { department: 'Orthopedics', patients: Math.floor(Math.random() * 35) + 20, color: '#10b981' },
            { department: 'Pediatrics', patients: Math.floor(Math.random() * 30) + 15, color: '#f59e0b' },
            { department: 'General Medicine', patients: Math.floor(Math.random() * 45) + 35, color: '#8b5cf6' },
            { department: 'Surgery', patients: Math.floor(Math.random() * 25) + 10, color: '#ec4899' }
          ],
          revenueChart: monthlyData
        };

        console.log('Chart data loaded:', chartDataObj);
        setChartData(chartDataObj);

        // Log API responses for debugging
        console.log('API Response Status:', {
          stats: statsResponse.status === 'fulfilled' ? 'Success' : `Failed: ${statsResponse.reason?.message}`,
          appointments: appointmentsResponse.status === 'fulfilled' ? 'Success' : `Failed: ${appointmentsResponse.reason?.message}`,
          patients: patientsResponse.status === 'fulfilled' ? 'Success' : `Failed: ${patientsResponse.reason?.message}`
        });

        // Log detailed response information
        if (appointmentsResponse.status === 'fulfilled') {
          console.log('Appointments API Response:', appointmentsResponse.value?.data);
        } else {
          console.error('Appointments API Error:', appointmentsResponse.reason?.response?.status, appointmentsResponse.reason?.response?.data);
        }

        if (patientsResponse.status === 'fulfilled') {
          console.log('Patients API Response:', patientsResponse.value?.data);
        } else {
          console.error('Patients API Error:', patientsResponse.reason?.response?.status, patientsResponse.reason?.response?.data);
        }

        // Set department stats
        setDepartmentStats([
          { name: 'Emergency', patients: 45, staff: 12, occupancy: '78%', status: 'high' },
          { name: 'Cardiology', patients: 32, staff: 8, occupancy: '65%', status: 'medium' },
          { name: 'Orthopedics', patients: 28, staff: 6, occupancy: '70%', status: 'medium' },
          { name: 'Pediatrics', patients: 22, staff: 10, occupancy: '55%', status: 'low' },
          { name: 'General Medicine', patients: 51, staff: 15, occupancy: '85%', status: 'high' }
        ]);

        // Set staff performance
        setStaffPerformance([
          { name: 'Dr. Sarah Johnson', department: 'Cardiology', rating: 4.8, patients: 156, satisfaction: '96%' },
          { name: 'Dr. Michael Chen', department: 'Emergency', rating: 4.7, patients: 203, satisfaction: '94%' },
          { name: 'Dr. Emily Davis', department: 'Pediatrics', rating: 4.9, patients: 134, satisfaction: '98%' },
          { name: 'Dr. Robert Wilson', department: 'Orthopedics', rating: 4.6, patients: 98, satisfaction: '92%' },
          { name: 'Dr. Lisa Anderson', department: 'General Medicine', rating: 4.8, patients: 178, satisfaction: '95%' }
        ]);

        // Enhanced recent activities
        setRecentActivities([
          { 
            id: 'activity-1',
            action: 'New patient admitted to Emergency ward',
            type: 'patient', 
            message: 'New patient admitted to Emergency ward', 
            time: '2 minutes ago',
            timestamp: '2 minutes ago', 
            avatar: 'P',
            priority: 'high',
            department: 'Emergency'
          },
          { 
            id: 'activity-2',
            action: 'Dr. Smith scheduled 3 new appointments',
            type: 'appointment', 
            message: 'Dr. Smith scheduled 3 new appointments', 
            time: '5 minutes ago',
            timestamp: '5 minutes ago', 
            avatar: 'A',
            priority: 'medium',
            department: 'Cardiology'
          },
          { 
            id: 'activity-3',
            action: 'New nurse Maria Garcia joined ICU team',
            type: 'staff', 
            message: 'New nurse Maria Garcia joined ICU team', 
            time: '10 minutes ago',
            timestamp: '10 minutes ago', 
            avatar: 'S',
            priority: 'low',
            department: 'ICU'
          },
          { 
            id: 'activity-4',
            action: 'Critical patient transferred to OR',
            type: 'emergency', 
            message: 'Critical patient transferred to OR', 
            time: '15 minutes ago',
            timestamp: '15 minutes ago', 
            avatar: 'E',
            priority: 'critical',
            department: 'Surgery'
          },
          { 
            id: 'activity-5',
            action: '5 patients discharged successfully',
            type: 'discharge', 
            message: '5 patients discharged successfully', 
            time: '20 minutes ago',
            timestamp: '20 minutes ago', 
            avatar: 'D',
            priority: 'low',
            department: 'General'
          }
        ]);

        // Set notifications
        setNotifications([
          { type: 'warning', message: 'Low inventory: Surgical masks', time: '1 hour ago' },
          { type: 'info', message: 'Monthly report is ready for review', time: '2 hours ago' },
          { type: 'success', message: 'System backup completed successfully', time: '3 hours ago' },
          { type: 'error', message: 'Equipment maintenance required in OR-2', time: '4 hours ago' }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Show user-friendly error notification
        if (error.response?.status === 404) {
          console.warn('Some API endpoints not found, using fallback data');
        } else if (error.response?.status === 401) {
          console.error('Authentication failed, please login again');
        } else {
          console.error('Network error occurred, please check your connection');
        }
        
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Auto-refresh every 5 minutes if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user?.hospitalId, token, autoRefresh]);

  // Handle appointment status update
  const handleAppointmentStatusUpdate = async (appointmentId, newStatus, doctorId = null) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const updateData = {
        status: newStatus
      };

      // If confirming appointment and doctor is specified, include doctorId
      if (newStatus === 'confirmed' && doctorId) {
        updateData.doctorId = doctorId;
      }

      console.log(`Updating appointment ${appointmentId} to status: ${newStatus}`);
      
      const response = await axios.put(
        `/api/appointments/${appointmentId}/status`, 
        updateData, 
        config
      );

      if (response.status === 200) {
        console.log('Appointment updated successfully:', response.data);
        console.log('Patient assignment should be updated automatically');
        
        // Update the appointments list locally to reflect changes immediately
        setUpcomingAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: newStatus }
              : apt
          )
        );

        // Also refresh patient data to show updated assignments
        setTimeout(() => {
          // Re-fetch data to get updated patient assignments
          const fetchUpdatedData = async () => {
            try {
              const patientsResponse = await axios.get('/api/patients/hospital', config);
              if (patientsResponse.data) {
                const patients = Array.isArray(patientsResponse.data) 
                  ? patientsResponse.data.slice(0, 5)
                  : [];
                setRecentPatients(patients.map(patient => ({
                  id: patient._id,
                  name: patient.name || 'N/A',
                  email: patient.email || 'N/A',
                  admissionDate: patient.admissionDate || patient.createdAt,
                  status: patient.status || 'active',
                  room: patient.room || patient.roomNumber || Math.floor(Math.random() * 200) + 100,
                  doctor: patient.primaryDoctor?.name || patient.assignedDoctor?.name || 'Unassigned',
                  doctorSpecialization: patient.primaryDoctor?.profile?.specialization || 'General'
                })));
              }
            } catch (error) {
              console.error('Error refreshing patient data:', error);
            }
          };
          fetchUpdatedData();
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update appointment status. Please try again.');
    }
  };

  // Quick stats cards data
  const quickStats = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      subtitle: `${stats.activePatients} active`,
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      trend: '+12%',
      trendUp: true,
      path: '/hospital/patients',
      bgGradient: true
    },
    {
      title: 'Medical Staff',
      value: stats.totalDoctors + stats.totalNurses,
      subtitle: `${stats.totalDoctors} doctors, ${stats.totalNurses} nurses`,
      icon: <Groups />,
      color: theme.palette.success.main,
      trend: '+5%',
      trendUp: true,
      path: '/hospital/staff',
      bgGradient: true
    },
    {
      title: 'Today\'s Appointments',
      value: stats.todayAppointments,
      subtitle: `${stats.pendingAppointments} pending`,
      icon: <Schedule />,
      color: theme.palette.info.main,
      trend: '+8%',
      trendUp: true,
      path: '/hospital/appointments',
      bgGradient: true
    },
    {
      title: 'Bed Occupancy',
      value: `${stats.occupancyRate}%`,
      subtitle: `${stats.availableBeds}/${stats.totalBeds} available`,
      icon: <MonitorHeart />,
      color: stats.occupancyRate > 80 ? theme.palette.error.main : theme.palette.warning.main,
      trend: '+3%',
      trendUp: true,
      path: '/hospital/analytics',
      bgGradient: true
    },
    {
      title: 'Emergency Cases',
      value: stats.emergencyCases,
      subtitle: 'Active emergencies',
      icon: <LocalHospital />,
      color: theme.palette.error.main,
      trend: '-2%',
      trendUp: false,
      path: '/hospital/emergency',
      bgGradient: true
    },
    {
      title: 'Monthly Revenue',
      value: `$${(stats.monthlyRevenue / 1000).toFixed(0)}K`,
      subtitle: `$${(stats.revenue / 1000).toFixed(0)}K today`,
      icon: <AttachMoney />,
      color: theme.palette.secondary.main,
      trend: '+15%',
      trendUp: true,
      path: '/hospital/billing',
      bgGradient: true
    },
    {
      title: 'Critical Patients',
      value: stats.criticalPatients,
      subtitle: 'Require attention',
      icon: <Warning />,
      color: theme.palette.warning.main,
      trend: '-5%',
      trendUp: false,
      path: '/hospital/patients',
      bgGradient: true
    },
    {
      title: 'Patient Satisfaction',
      value: `${stats.patientSatisfaction}%`,
      subtitle: 'Average rating',
      icon: <Star />,
      color: theme.palette.success.main,
      trend: '+2%',
      trendUp: true,
      path: '/hospital/analytics',
      bgGradient: true
    }
  ];

  // Quick actions data
  const quickActions = [
    {
      id: 'action-1',
      title: 'Add Patient',
      description: 'Register new patient',
      icon: <PersonAdd />,
      color: theme.palette.primary.main,
      path: '/hospital/patients'
    },
    {
      id: 'action-2',
      title: 'Schedule Appointment',
      description: 'Book new appointment',
      icon: <EventAvailable />,
      color: theme.palette.success.main,
      path: '/hospital/appointments'
    },
    {
      id: 'action-3',
      title: 'Staff Management',
      description: 'Manage hospital staff',
      icon: <Groups />,
      color: theme.palette.info.main,
      path: '/hospital/staff'
    },
    {
      id: 'action-4',
      title: 'View Analytics',
      description: 'Hospital performance',
      icon: <Analytics />,
      color: theme.palette.secondary.main,
      path: '/hospital/analytics'
    }
  ];

  const StatCard = ({ stat }) => (
    <Card
      component={motion.div}
      variants={itemVariants}
      whileHover={{ y: -8, scale: 1.02 }}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        borderRadius: 4,
        height: '100%',
        background: stat.bgGradient 
          ? `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 50%, transparent 100%)`
          : theme.palette.background.paper,
        border: `1px solid ${alpha(stat.color, 0.1)}`,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        '&:hover': {
          borderColor: alpha(stat.color, 0.4),
          boxShadow: `0 20px 40px ${alpha(stat.color, 0.2)}`,
          '&::before': {
            transform: 'translateX(0)',
          },
          '& .stat-icon': {
            transform: 'scale(1.1) rotate(5deg)',
          },
          '& .stat-value': {
            transform: 'scale(1.05)',
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${stat.color}, ${alpha(stat.color, 0.6)})`,
          transform: 'translateX(-100%)',
          transition: 'transform 0.4s ease',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60px',
          height: '60px',
          background: `radial-gradient(circle, ${alpha(stat.color, 0.1)} 0%, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translate(20px, -20px)',
        }
      }}
      onClick={() => navigate(stat.path)}
    >
      <CardContent sx={{ 
        p: isMobile ? 2 : 3, 
        position: 'relative', 
        zIndex: 1 
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between', 
          mb: isMobile ? 1.5 : 2,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0
        }}>
          <Box
            className="stat-icon"
            sx={{
              p: isMobile ? 1.5 : 2,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.8)})`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 16px ${alpha(stat.color, 0.3)}`,
              transition: 'all 0.3s ease',
              fontSize: isMobile ? '1.25rem' : '1.5rem',
              minWidth: isMobile ? 40 : 48,
              minHeight: isMobile ? 40 : 48
            }}
          >
            {stat.icon}
          </Box>
          <Box sx={{ 
            textAlign: isMobile ? 'left' : 'right',
            alignSelf: isMobile ? 'flex-start' : 'auto'
          }}>
            <Chip
              label={stat.trend}
              size="small"
              icon={stat.trendUp ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
              sx={{
                backgroundColor: stat.trendUp ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                color: stat.trendUp ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 700,
                fontSize: isMobile ? '0.7rem' : '0.75rem',
                border: `1px solid ${stat.trendUp ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.error.main, 0.2)}`
              }}
            />
          </Box>
        </Box>
        <Typography 
          variant={isMobile ? "h4" : "h3"}
          className="stat-value"
          sx={{ 
            fontWeight: 800, 
            color: 'text.primary', 
            mb: 1,
            transition: 'all 0.3s ease',
            background: `linear-gradient(135deg, ${stat.color}, ${theme.palette.text.primary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {stat.value}
        </Typography>
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          color="text.primary" 
          fontWeight={600} 
          gutterBottom
        >
          {stat.title}
        </Typography>
        {stat.subtitle && (
          <Typography 
            variant={isMobile ? "caption" : "body2"} 
            color="text.secondary" 
            fontWeight={500}
          >
            {stat.subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ action }) => (
    <Card
      component={motion.div}
      variants={itemVariants}
      whileHover={{ scale: 1.05, y: -4 }}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(action.color, 0.05)} 0%, transparent 100%)`,
        border: `1px solid ${alpha(action.color, 0.1)}`,
        '&:hover': {
          boxShadow: `0 12px 24px ${alpha(action.color, 0.2)}`,
          borderColor: alpha(action.color, 0.3),
          '& .action-icon': {
            transform: 'scale(1.1)',
            background: `linear-gradient(135deg, ${action.color}, ${alpha(action.color, 0.8)})`,
            color: 'white',
          }
        }
      }}
      onClick={() => navigate(action.path)}
    >
      <CardContent sx={{ 
        p: isMobile ? 2 : 3, 
        textAlign: 'center' 
      }}>
        <Box
          className="action-icon"
          sx={{
            width: isMobile ? 48 : 64,
            height: isMobile ? 48 : 64,
            borderRadius: 3,
            bgcolor: alpha(action.color, 0.1),
            color: action.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: isMobile ? 1.5 : 2,
            transition: 'all 0.3s ease',
            fontSize: isMobile ? '1.4rem' : '1.8rem'
          }}
        >
          {action.icon}
        </Box>
        <Typography 
          variant={isMobile ? "subtitle2" : "h6"} 
          fontWeight={700} 
          gutterBottom
        >
          {action.title}
        </Typography>
        <Typography 
          variant={isMobile ? "caption" : "body2"} 
          color="text.secondary"
        >
          {action.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ 
        justifyContent: 'center', 
        pb: isMobile ? 1 : 2 
      }}>
        <Button
          endIcon={<ArrowForward fontSize={isMobile ? "small" : "medium"} />}
          size={isMobile ? "small" : "medium"}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 600,
            color: action.color,
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            '&:hover': {
              backgroundColor: alpha(action.color, 0.1)
            }
          }}
        >
          Open
        </Button>
      </CardActions>
    </Card>
  );

  // Enhanced Chart Components with Chart.js
  const PatientChart = () => {
    const monthlyData = chartData.monthlyPatients.slice(-6);
    console.log('PatientChart rendering with data:', monthlyData);
    
    const data = {
      labels: monthlyData.map(item => item.month),
      datasets: [
        {
          label: 'Patient Admissions',
          data: monthlyData.map(item => item.patients),
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          fill: true,
          tension: 0.4,
          pointBackgroundColor: theme.palette.primary.main,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#ddd',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: true,
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: '#666',
            font: {
              size: isMobile ? 10 : 12,
            }
          }
        },
        y: {
          display: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: '#666',
            font: {
              size: isMobile ? 10 : 12,
            }
          }
        }
      }
    };
    
    return (
      <Box sx={{ height: isMobile ? 280 : 320, p: isMobile ? 1 : 2 }}>
        <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} gutterBottom>
          Monthly Patient Admissions
        </Typography>
        <Box sx={{ 
          width: '100%', 
          height: isMobile ? 200 : 240,
          backgroundColor: '#fff',
          borderRadius: 1,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {chartData.monthlyPatients.length > 0 ? (
            <Line data={data} options={options} />
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading chart data...
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const DepartmentChart = () => {
    const departmentData = chartData.departmentDistribution;
    console.log('DepartmentChart rendering with data:', departmentData);
    
    const data = {
      labels: departmentData.map(dept => dept.department),
      datasets: [
        {
          data: departmentData.map(dept => dept.patients),
          backgroundColor: departmentData.map(dept => dept.color),
          borderColor: departmentData.map(dept => dept.color),
          borderWidth: 2,
          hoverOffset: 10,
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // We'll create a custom legend
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#ddd',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} patients (${percentage}%)`;
            }
          }
        }
      }
    };
    
    return (
      <Box sx={{ height: isMobile ? 320 : 370, p: isMobile ? 1 : 2 }}>
        <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} gutterBottom>
          Department Distribution
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          alignItems: 'center'
        }}>
          {/* Pie Chart */}
          <Box sx={{ 
            width: isMobile ? '100%' : '50%',
            height: isMobile ? 180 : 220,
            backgroundColor: '#fff',
            borderRadius: 1,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {chartData.departmentDistribution.length > 0 ? (
              <Doughnut data={data} options={options} />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading departments...
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Custom Legend */}
          <Box sx={{ 
            flex: 1,
            minWidth: isMobile ? '100%' : 160
          }}>
            <Stack spacing={1}>
              {departmentData.map((dept, index) => {
                const total = departmentData.reduce((sum, item) => sum + item.patients, 0);
                const percentage = total > 0 ? (dept.patients / total) * 100 : 0;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha(dept.color, 0.05),
                      border: `1px solid ${alpha(dept.color, 0.15)}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(dept.color, 0.1),
                        transform: 'translateX(4px)',
                        boxShadow: `0 2px 8px ${alpha(dept.color, 0.2)}`
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 14, 
                            height: 14, 
                            borderRadius: '50%', 
                            backgroundColor: dept.color,
                            boxShadow: `0 2px 4px ${alpha(dept.color, 0.3)}`,
                            border: `2px solid ${theme.palette.background.paper}`
                          }} 
                        />
                        <Typography variant="body2" fontWeight={500} color="text.primary">
                          {dept.department}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {dept.patients}
                        </Typography>
                        <Chip 
                          label={`${percentage.toFixed(1)}%`}
                          size="small"
                          sx={{
                            backgroundColor: alpha(dept.color, 0.2),
                            color: dept.color,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                      </Stack>
                    </Box>
                  </motion.div>
                );
              })}
            </Stack>
          </Box>
        </Box>
      </Box>
    );
  };

  const RevenueChart = () => {
    const revenueData = chartData.revenueChart.slice(-6);
    const maxRevenue = Math.max(...revenueData.map(item => item.revenue));
    const avgRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0) / revenueData.length;
    console.log('RevenueChart rendering with data:', revenueData);
    
    const data = {
      labels: revenueData.map(item => item.month),
      datasets: [
        {
          label: 'Revenue',
          data: revenueData.map(item => item.revenue),
          backgroundColor: alpha(theme.palette.secondary.main, 0.6),
          borderColor: theme.palette.secondary.main,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#ddd',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `Revenue: $${(context.parsed.y / 1000).toFixed(1)}K`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: '#666',
            font: {
              size: isMobile ? 10 : 12,
            }
          }
        },
        y: {
          display: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: '#666',
            font: {
              size: isMobile ? 10 : 12,
            },
            callback: function(value) {
              return `$${(value / 1000).toFixed(0)}K`;
            }
          }
        }
      }
    };
    
    return (
      <Box sx={{ height: isMobile ? 280 : 320, p: isMobile ? 1 : 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
            Revenue Trends
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip 
              label={`Peak: $${(maxRevenue / 1000).toFixed(0)}K`}
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={`Avg: $${(avgRevenue / 1000).toFixed(0)}K`}
              size="small"
              color="info"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label="6 Months"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Box>
        
        <Box sx={{ 
          width: '100%', 
          height: isMobile ? 180 : 220,
          backgroundColor: '#fff',
          borderRadius: 1,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {chartData.revenueChart.length > 0 ? (
            <Bar data={data} options={options} />
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading revenue data...
              </Typography>
            </Box>
          )}
        </Box>

        {/* Revenue Statistics */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          mt: 2,
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Total Revenue
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              ${(revenueData.reduce((sum, item) => sum + item.revenue, 0) / 1000).toFixed(0)}K
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Growth Rate
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">
              +12.5%
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // Department Overview Component
  const DepartmentOverview = () => (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardHeader 
        title="Department Overview" 
        action={
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVert />
          </IconButton>
        }
        titleTypographyProps={{ fontWeight: 700 }}
      />
      <CardContent>
        <List>
          {departmentStats.map((dept, index) => (
            <ListItem key={index} sx={{ px: 0, py: 1 }}>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: dept.status === 'high' ? theme.palette.error.light :
                            dept.status === 'medium' ? theme.palette.warning.light :
                            theme.palette.success.light,
                    color: dept.status === 'high' ? theme.palette.error.dark :
                           dept.status === 'medium' ? theme.palette.warning.dark :
                           theme.palette.success.dark
                  }}
                >
                  <MedicalServices />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={dept.name}
                secondary={`${dept.patients} patients • ${dept.staff} staff`}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight={600}>
                  {dept.occupancy}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Occupancy
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  // System Health Component
  const SystemHealthCard = () => (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardHeader 
        title="System Health" 
        avatar={<Computer color="primary" />}
        titleTypographyProps={{ fontWeight: 700 }}
      />
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">CPU Usage</Typography>
              <Typography variant="body2" fontWeight={600}>{systemHealth.cpuUsage}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={systemHealth.cpuUsage} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Memory Usage</Typography>
              <Typography variant="body2" fontWeight={600}>{systemHealth.memoryUsage}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={systemHealth.memoryUsage} 
              color="warning"
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Storage Usage</Typography>
              <Typography variant="body2" fontWeight={600}>{systemHealth.storageUsage}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={systemHealth.storageUsage} 
              color="success"
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Divider />
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Database</Typography>
              <Chip 
                label={systemHealth.databaseStatus} 
                color="success" 
                size="small"
                icon={<CheckCircle />}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Last Backup</Typography>
              <Typography variant="caption" color="text.secondary">
                {systemHealth.lastBackup.toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: isSmallScreen ? 2 : 3, px: isSmallScreen ? 1 : 2 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: isSmallScreen ? 250 : 350,
          gap: 3
        }}>
          <CircularProgress 
            size={isSmallScreen ? 40 : 60} 
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
          <Typography 
            variant={isSmallScreen ? "body1" : "h6"} 
            color="text.secondary"
            textAlign="center"
          >
            Loading Hospital Dashboard...
          </Typography>
          <LinearProgress 
            sx={{ 
              width: isSmallScreen ? 200 : 300,
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }
            }} 
          />
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: isSmallScreen ? 2 : 3,
        px: isSmallScreen ? 1 : 2
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={0}
            sx={{
              p: isSmallScreen ? 2 : 3,
              mb: isSmallScreen ? 2 : 3,
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: isSmallScreen ? 'flex-start' : 'center',
              flexDirection: isSmallScreen ? 'column' : 'row',
              gap: isSmallScreen ? 2 : 0
            }}>
              <Box>
                <Typography 
                  variant={isSmallScreen ? "h5" : "h3"} 
                  fontWeight={800} 
                  color="primary.main" 
                  gutterBottom
                >
                  Hospital Dashboard
                </Typography>
                <Typography 
                  variant={isSmallScreen ? "body1" : "h6"} 
                  color="text.secondary" 
                  sx={{ mb: 1 }}
                >
                  Welcome back, <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{user?.name}</Box>
                </Typography>
                <Typography variant={isSmallScreen ? "body2" : "body1"} color="text.secondary">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: isSmallScreen ? 'short' : 'long', 
                    year: 'numeric', 
                    month: isSmallScreen ? 'short' : 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                gap: isSmallScreen ? 1 : 2,
                alignSelf: isSmallScreen ? 'flex-end' : 'auto'
              }}>
                <Tooltip title="Notifications">
                  <IconButton
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                      width: isSmallScreen ? 40 : 48,
                      height: isSmallScreen ? 40 : 48
                    }}
                  >
                    <Badge badgeContent={4} color="error">
                      <NotificationsActive fontSize={isSmallScreen ? "small" : "medium"} />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh Data">
                  <IconButton
                    onClick={() => window.location.reload()}
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) },
                      width: isSmallScreen ? 40 : 48,
                      height: isSmallScreen ? 40 : 48
                    }}
                  >
                    <Refresh fontSize={isSmallScreen ? "small" : "medium"} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Quick Stats Cards */}
        <Grid container spacing={isSmallScreen ? 2 : 3} sx={{ mb: 4 }}>
          {quickStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={index}>
              <StatCard stat={stat} />
            </Grid>
          ))}
        </Grid>

        {/* Main Dashboard Content */}
        <Grid container spacing={isSmallScreen ? 2 : 3}>
          
          {/* Left Column - Analytics & Charts */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={isSmallScreen ? 2 : 3}>
              
              {/* Top Row - Key Analytics */}
              <Grid item xs={12}>
                <Grid container spacing={isSmallScreen ? 2 : 3}>
                  <Grid item xs={12} lg={6}>
                    <motion.div variants={itemVariants}>
                      <Card sx={{ 
                        borderRadius: 3, 
                        height: isSmallScreen ? 280 : 320,
                        boxShadow: theme.shadows[2],
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s ease'
                        }
                      }}>
                        <CardHeader 
                          title={isSmallScreen ? "Patient Admissions" : "Monthly Patient Admissions"}
                          avatar={<BarChartIcon color="primary" />}
                          titleTypographyProps={{ 
                            fontWeight: 700,
                            fontSize: isSmallScreen ? '0.95rem' : '1.1rem'
                          }}
                        />
                        <CardContent sx={{ p: 0, height: 'calc(100% - 80px)' }}>
                          {/* Patient Chart */}
                          <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {chartData.monthlyPatients.length > 0 ? (
                              <Line
                                data={{
                                  labels: chartData.monthlyPatients.map(item => item.month),
                                  datasets: [{
                                    label: 'Monthly Patients',
                                    data: chartData.monthlyPatients.map(item => item.patients),
                                    borderColor: theme.palette.primary.main,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    tension: 0.4,
                                    fill: true
                                  }]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      display: false
                                    }
                                  },
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      grid: {
                                        color: alpha(theme.palette.divider, 0.1)
                                      }
                                    },
                                    x: {
                                      grid: {
                                        display: false
                                      }
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <CircularProgress size={40} />
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <motion.div variants={itemVariants}>
                      <Card sx={{ 
                        borderRadius: 3, 
                        height: isSmallScreen ? 280 : 320,
                        boxShadow: theme.shadows[2],
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s ease'
                        }
                      }}>
                        <CardHeader 
                          title="Department Distribution" 
                          avatar={<PieChartIcon color="secondary" />}
                          titleTypographyProps={{ 
                            fontWeight: 700,
                            fontSize: isSmallScreen ? '0.95rem' : '1.1rem'
                          }}
                        />
                        <CardContent sx={{ p: 0, height: 'calc(100% - 80px)' }}>
                          {/* Department Chart */}
                          <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {chartData.departmentDistribution.length > 0 ? (
                              <Doughnut
                                data={{
                                  labels: chartData.departmentDistribution.map(item => item.department),
                                  datasets: [{
                                    data: chartData.departmentDistribution.map(item => item.patients),
                                    backgroundColor: chartData.departmentDistribution.map(item => item.color),
                                    borderWidth: 2,
                                    borderColor: theme.palette.background.paper
                                  }]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: 'bottom',
                                      labels: {
                                        fontSize: 12,
                                        padding: 10
                                      }
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <CircularProgress size={40} />
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                </Grid>
              </Grid>

              {/* Revenue Chart - Full Width */}
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <Card sx={{ 
                    borderRadius: 3,
                    height: 350,
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardHeader 
                      title="Revenue Analytics" 
                      avatar={<Timeline color="secondary" />}
                      action={
                        !isMobile && (
                          <Button startIcon={<Download />} size="small">
                            Export
                          </Button>
                        )
                      }
                      titleTypographyProps={{ 
                        fontWeight: 700,
                        fontSize: isMobile ? '1rem' : '1.25rem'
                      }}
                    />
                    <CardContent sx={{ p: 0, height: 'calc(100% - 80px)' }}>
                      {/* Revenue Chart */}
                      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {chartData.revenueChart.length > 0 ? (
                          <Bar
                            data={{
                              labels: chartData.revenueChart.map(item => item.month),
                              datasets: [{
                                label: 'Revenue ($)',
                                data: chartData.revenueChart.map(item => item.revenue),
                                backgroundColor: alpha(theme.palette.secondary.main, 0.8),
                                borderColor: theme.palette.secondary.main,
                                borderWidth: 1,
                                borderRadius: 4
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  grid: {
                                    color: alpha(theme.palette.divider, 0.1)
                                  }
                                },
                                x: {
                                  grid: {
                                    display: false
                                  }
                                }
                              }
                            }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <CircularProgress size={40} />
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </Grid>



          {/* Right Sidebar */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={isSmallScreen ? 2 : 3}>
              
              {/* Quick Actions - Responsive */}
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <Card sx={{ 
                    borderRadius: 3,
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardHeader 
                      title="Quick Actions" 
                      avatar={<Speed color="primary" />}
                      titleTypographyProps={{ 
                        fontWeight: 700,
                        fontSize: isSmallScreen ? '0.95rem' : '1.1rem'
                      }}
                    />
                    <CardContent>
                      <Grid container spacing={isSmallScreen ? 1 : 2}>
                        {quickActions.slice(0, 4).map((action, index) => (
                          <Grid item xs={isSmallScreen ? 6 : 6} sm={6} key={action.id || action.title || `action-${index}`}>
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={action.icon}
                              onClick={() => navigate(action.path)}
                              sx={{
                                minHeight: isSmallScreen ? 50 : 70,
                                borderRadius: 2,
                                textTransform: 'none',
                                flexDirection: 'column',
                                gap: 0.5,
                                borderColor: alpha(action.color, 0.3),
                                color: action.color,
                                backgroundColor: alpha(action.color, 0.02),
                                '&:hover': {
                                  borderColor: action.color,
                                  backgroundColor: alpha(action.color, 0.08),
                                  transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <Typography variant="caption" fontWeight={600} fontSize={isMobile ? '0.7rem' : '0.75rem'}>
                                {action.title}
                              </Typography>
                              {!isMobile && (
                                <Typography variant="caption" color="text.secondary" fontSize="0.6rem">
                                  {action.description}
                                </Typography>
                              )}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Department Overview */}
              <Grid item xs={12} sm={6} md={6} lg={12}>
                <motion.div variants={itemVariants}>
                  <Card sx={{ 
                    borderRadius: 3,
                    boxShadow: theme.shadows[2],
                    height: isSmallScreen ? 'auto' : 350,
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    {/* Department Overview Content */}
                    <CardHeader 
                      title="Department Overview" 
                      avatar={<LocalHospital color="success" />}
                      titleTypographyProps={{ 
                        fontWeight: 700,
                        fontSize: isSmallScreen ? '0.95rem' : '1.1rem'
                      }}
                    />
                    <CardContent sx={{ maxHeight: isSmallScreen ? 'none' : 280, overflow: 'auto' }}>
                      <List sx={{ p: 0 }}>
                        {departmentStats.map((dept, index) => (
                          <ListItem key={dept.name} sx={{ px: 0, py: isSmallScreen ? 1 : 1.5 }}>
                            <ListItemAvatar>
                              <Avatar 
                                sx={{ 
                                  bgcolor: 
                                    dept.status === 'high' ? theme.palette.error.light :
                                    dept.status === 'medium' ? theme.palette.warning.light :
                                    theme.palette.success.light,
                                  width: 32,
                                  height: 32
                                }}
                              >
                                <LocalHospital fontSize="small" />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={dept.name}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    👥 {dept.patients} patients • 👨‍⚕️ {dept.staff} staff
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    🏥 Occupancy: {dept.occupancy}
                                  </Typography>
                                </Box>
                              }
                              primaryTypographyProps={{ 
                                fontWeight: 600,
                                fontSize: '0.875rem'
                              }}
                            />
                            <Chip 
                              label={dept.status} 
                              size="small"
                              color={
                                dept.status === 'high' ? 'error' :
                                dept.status === 'medium' ? 'warning' :
                                'success'
                              }
                              variant="outlined"
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* System Health */}
              <Grid item xs={12} sm={6} md={6} lg={12}>
                <motion.div variants={itemVariants}>
                  <Card sx={{ 
                    borderRadius: 3,
                    boxShadow: theme.shadows[2],
                    height: isSmallScreen ? 'auto' : 350,
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    {/* System Health Content */}
                    <CardHeader 
                      title="System Health" 
                      avatar={<Computer color="info" />}
                      titleTypographyProps={{ 
                        fontWeight: 700,
                        fontSize: isSmallScreen ? '0.95rem' : '1.1rem'
                      }}
                    />
                    <CardContent sx={{ maxHeight: isSmallScreen ? 'none' : 280, overflow: 'auto' }}>
                      <Box sx={{ mb: isSmallScreen ? 1.5 : 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant={isSmallScreen ? "caption" : "body2"} fontWeight={600}>
                            Server Status
                          </Typography>
                          <Chip 
                            label={systemHealth.serverStatus} 
                            size="small"
                            color={systemHealth.serverStatus === 'online' ? 'success' : 'error'}
                            variant="filled"
                            sx={{ fontSize: isSmallScreen ? '0.7rem' : '0.75rem' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant={isSmallScreen ? "caption" : "body2"} fontWeight={600}>
                            Database
                          </Typography>
                          <Chip 
                            label={systemHealth.databaseStatus} 
                            size="small"
                            color={systemHealth.databaseStatus === 'online' ? 'success' : 'error'}
                            variant="filled"
                            sx={{ fontSize: isSmallScreen ? '0.7rem' : '0.75rem' }}
                          />
                        </Box>

                        <Box sx={{ mb: isSmallScreen ? 1.5 : 2 }}>
                          <Typography variant={isSmallScreen ? "caption" : "body2"} fontWeight={600} sx={{ mb: 0.5 }}>
                            CPU Usage: {systemHealth.cpuUsage}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={systemHealth.cpuUsage} 
                            color={systemHealth.cpuUsage > 80 ? 'error' : systemHealth.cpuUsage > 60 ? 'warning' : 'success'}
                            sx={{ 
                              borderRadius: 1,
                              height: isSmallScreen ? 6 : 8
                            }}
                          />
                        </Box>

                        <Box sx={{ mb: isSmallScreen ? 1.5 : 2 }}>
                          <Typography variant={isSmallScreen ? "caption" : "body2"} fontWeight={600} sx={{ mb: 0.5 }}>
                            Memory Usage: {systemHealth.memoryUsage}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={systemHealth.memoryUsage} 
                            color={systemHealth.memoryUsage > 80 ? 'error' : systemHealth.memoryUsage > 60 ? 'warning' : 'success'}
                            sx={{ 
                              borderRadius: 1,
                              height: isSmallScreen ? 6 : 8
                            }}
                          />
                        </Box>

                        <Box sx={{ mb: isSmallScreen ? 1.5 : 2 }}>
                          <Typography variant={isSmallScreen ? "caption" : "body2"} fontWeight={600} sx={{ mb: 0.5 }}>
                            Storage Usage: {systemHealth.storageUsage}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={systemHealth.storageUsage} 
                            color={systemHealth.storageUsage > 80 ? 'error' : systemHealth.storageUsage > 60 ? 'warning' : 'success'}
                            sx={{ 
                              borderRadius: 1,
                              height: isSmallScreen ? 6 : 8
                            }}
                          />
                        </Box>
                      </Box>

                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: isSmallScreen ? '0.7rem' : '0.75rem' }}
                      >
                        Last backup: {systemHealth.lastBackup.toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Bottom Section - Activity & Management */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ mb: 3 }}>
            Management & Activity Overview
          </Typography>
          
          <Grid container spacing={isSmallScreen ? 2 : 3}>
            
            {/* Appointment Management Section */}
            <Grid item xs={12} lg={8}>
              <Grid container spacing={isSmallScreen ? 2 : 3}>
                
                {/* Pending Appointments */}
                <Grid item xs={12} md={6}>
                  <motion.div variants={itemVariants}>
                    <Card sx={{ 
                      borderRadius: 3,
                      height: 400,
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease'
                      }
                    }}>
                      <CardHeader 
                        title="Pending Appointments" 
                        avatar={<Schedule color="warning" />}
                        action={
                          <Button 
                            size="small" 
                            onClick={() => navigate('/hospital/appointments')}
                            endIcon={<ArrowForward />}
                          >
                            View All
                          </Button>
                        }
                        titleTypographyProps={{ 
                          fontWeight: 700,
                          fontSize: isSmallScreen ? '0.9rem' : '1.1rem'
                        }}
                      />
                      <CardContent sx={{ maxHeight: 320, overflow: 'auto' }}>
                        {upcomingAppointments.filter(apt => apt.status === 'pending').length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Schedule sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                              No pending appointments
                            </Typography>
                          </Box>
                        ) : (
                          <List sx={{ p: 0 }}>
                            {upcomingAppointments.filter(apt => apt.status === 'pending').slice(0, 3).map((appointment, index) => (
                              <motion.div
                                key={appointment.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <ListItem sx={{ 
                                  px: 0, 
                                  py: 1.5,
                                  borderRadius: 2,
                                  mb: 1,
                                  backgroundColor: alpha(theme.palette.warning.main, 0.02),
                                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.warning.main, 0.05),
                                  }
                                }}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: theme.palette.warning.light, width: 32, height: 32 }}>
                                      <Person fontSize="small" />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={appointment.patientName}
                                    secondary={
                                      <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                          {appointment.doctorName} • {appointment.type}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {new Date(appointment.time).toLocaleDateString()}
                                        </Typography>
                                      </Box>
                                    }
                                    primaryTypographyProps={{ 
                                      fontWeight: 600,
                                      fontSize: '0.875rem'
                                    }}
                                  />
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      onClick={() => handleAppointmentStatusUpdate(appointment.id, 'confirmed')}
                                      sx={{ minWidth: 60, fontSize: '0.7rem' }}
                                    >
                                      Confirm
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      onClick={() => handleAppointmentStatusUpdate(appointment.id, 'cancelled')}
                                      sx={{ minWidth: 60, fontSize: '0.7rem' }}
                                    >
                                      Cancel
                                    </Button>
                                  </Box>
                                </ListItem>
                              </motion.div>
                            ))}
                          </List>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* Confirmed Appointments */}
                <Grid item xs={12} md={6}>
                  <motion.div variants={itemVariants}>
                    <Card sx={{ 
                      borderRadius: 3,
                      height: 400,
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease'
                      }
                    }}>
                      <CardHeader 
                        title="Confirmed Appointments" 
                        avatar={<CheckCircle color="success" />}
                        action={
                          <Chip 
                            label={`${upcomingAppointments.filter(apt => apt.status === 'confirmed').length} confirmed`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        }
                        titleTypographyProps={{ 
                          fontWeight: 700,
                          fontSize: isMobile ? '0.9rem' : '1.1rem'
                        }}
                      />
                      <CardContent sx={{ maxHeight: 320, overflow: 'auto' }}>
                        {upcomingAppointments.filter(apt => apt.status === 'confirmed').length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CheckCircle sx={{ fontSize: 48, color: 'success.light', mb: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                              No confirmed appointments
                            </Typography>
                          </Box>
                        ) : (
                          <List sx={{ p: 0 }}>
                            {upcomingAppointments.filter(apt => apt.status === 'confirmed').slice(0, 3).map((appointment, index) => (
                              <motion.div
                                key={appointment.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <ListItem sx={{ 
                                  px: 0, 
                                  py: 1.5,
                                  borderRadius: 2,
                                  mb: 1,
                                  backgroundColor: alpha(theme.palette.success.main, 0.02),
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                                  }
                                }}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: theme.palette.success.light, width: 32, height: 32 }}>
                                      <CheckCircle fontSize="small" />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={appointment.patientName}
                                    secondary={
                                      <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                          📋 {appointment.doctorName} • {appointment.type}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          🕒 {new Date(appointment.time).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="success.main" sx={{ fontWeight: 600, mt: 0.5 }}>
                                          ✅ Patient assigned to doctor
                                        </Typography>
                                      </Box>
                                    }
                                    primaryTypographyProps={{ 
                                      fontWeight: 600,
                                      fontSize: '0.875rem'
                                    }}
                                  />
                                  <Chip 
                                    label="Confirmed" 
                                    size="small"
                                    color="success"
                                    variant="filled"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                </ListItem>
                              </motion.div>
                            ))}
                          </List>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column - Activities & Patients */}
            <Grid item xs={12} lg={4}>
              <Grid container spacing={isMobile ? 2 : 3}>
                
                {/* Recent Activities - Compact */}
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <Card sx={{ 
                      borderRadius: 3, 
                      height: 400,
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease'
                      }
                    }}>
                      <CardHeader 
                        title="Recent Activities" 
                        avatar={<Assessment color="primary" />}
                        action={
                          <Chip 
                            label={`${recentActivities.length} activities`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        }
                        titleTypographyProps={{ 
                          fontWeight: 700,
                          fontSize: isMobile ? '0.9rem' : '1.1rem'
                        }}
                      />
                      <CardContent sx={{ maxHeight: 320, overflow: 'auto' }}>
                        {recentActivities.length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Assessment sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                              No recent activities
                            </Typography>
                          </Box>
                        ) : (
                          <List sx={{ p: 0 }}>
                            {recentActivities.slice(0, 5).map((activity, index) => (
                              <motion.div
                                key={activity.id || `activity-${index}-${activity.action}-${activity.timestamp}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <ListItem sx={{ 
                                  px: 0, 
                                  py: 1,
                                  borderRadius: 2,
                                  mb: 0.5,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                  }
                                }}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ 
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                      color: theme.palette.primary.main,
                                      width: 32,
                                      height: 32
                                    }}>
                                      <Assessment fontSize="small" />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={activity.action}
                                    secondary={
                                      <Typography variant="caption" color="text.secondary">
                                        {activity.timestamp}
                                      </Typography>
                                    }
                                    primaryTypographyProps={{ 
                                      fontSize: '0.8rem',
                                      fontWeight: 500
                                    }}
                                  />
                                </ListItem>
                              </motion.div>
                            ))}
                          </List>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {/* Auto-refresh toggle - Hidden on mobile, shown as compact on tablet+ */}
        {!isMobile && (
          <Box sx={{ 
            position: 'fixed', 
            bottom: 90, 
            right: 24, 
            zIndex: 1000
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  color="primary"
                  size={isTablet ? "small" : "medium"}
                />
              }
              label="Auto-refresh"
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(12px)',
                borderRadius: 2,
                px: isTablet ? 1.5 : 2,
                py: 0.5,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: theme.shadows[4],
                '& .MuiFormControlLabel-label': {
                  fontSize: isTablet ? '0.875rem' : '1rem'
                }
              }}
            />
          </Box>
        )}

        {/* Mobile settings menu */}
        {isMobile && (
          <Box sx={{
            position: 'fixed',
            bottom: 80,
            left: 16,
            zIndex: 1000
          }}>
            <Tooltip title="Settings">
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.95),
                  backdropFilter: 'blur(12px)',
                  boxShadow: theme.shadows[4],
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <Settings />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Floating Action Button */}
        <Fab
          color="primary"
          size={isMobile ? "medium" : "large"}
          sx={{
            position: 'fixed',
            bottom: isMobile ? 16 : 24,
            right: isMobile ? 16 : 24,
            zIndex: 1000,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
          }}
          onClick={() => navigate('/hospital/chat')}
        >
          <Chat fontSize={isMobile ? "medium" : "large"} />
        </Fab>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.1)}`,
            }
          }}
        >
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/hospital/analytics'); }}>
            <ListItemIcon><Analytics /></ListItemIcon>
            <ListItemText>Detailed Analytics</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); /* Export functionality */ }}>
            <ListItemIcon><Download /></ListItemIcon>
            <ListItemText>Export Data</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/hospital/settings'); }}>
            <ListItemIcon><Settings /></ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications Snackbar */}
        <Snackbar
          open={showNotificationSnackbar}
          autoHideDuration={6000}
          onClose={() => setShowNotificationSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setShowNotificationSnackbar(false)} 
            severity="info" 
            variant="filled"
            sx={{ borderRadius: 2 }}
          >
            New dashboard data has been loaded!
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

export default HospitalAdminDashboard;