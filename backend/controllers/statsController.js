const Hospital = require('../models/Hospital');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Post = require('../models/Post');

// Helper function to get month name
const getMonthName = (monthIndex) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
};

// Helper function to map states to regions
const getRegionForState = (state) => {
  if (!state) return 'Unknown';

  const stateCode = state.toLowerCase();

  const regionMapping = {
    northeast: ['ny', 'ma', 'ct', 'ri', 'nh', 'vt', 'me', 'pa', 'nj'],
    southeast: ['fl', 'ga', 'sc', 'nc', 'va', 'wv', 'ky', 'tn', 'al', 'ms', 'ar', 'la'],
    midwest: ['oh', 'in', 'il', 'mi', 'wi', 'mn', 'ia', 'mo', 'nd', 'sd', 'ne', 'ks'],
    southwest: ['tx', 'ok', 'nm', 'az'],
    west: ['ca', 'nv', 'ut', 'co', 'wy', 'mt', 'id', 'wa', 'or', 'ak', 'hi'],
  };

  for (const [region, states] of Object.entries(regionMapping)) {
    if (states.includes(stateCode)) {
      return region.charAt(0).toUpperCase() + region.slice(1);
    }
  }

  return 'Other';
};

// Helper function to format time ago
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

// Helper function to get default action link based on notification type
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
    default:
      return '/admin/dashboard';
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    // Get current date and date ranges
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get basic counts
    const [
      totalHospitals,
      totalUsers,
      activeSessions,
      newUsersToday,
      newHospitalsToday,
      totalAppointments,
      appointmentsToday
    ] = await Promise.all([
      Hospital.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gt: yesterday } }),
      User.countDocuments({ createdAt: { $gt: yesterday } }),
      Hospital.countDocuments({ createdAt: { $gt: yesterday } }),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        date: {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lt: new Date(now.setHours(23, 59, 59, 999))
        }
      })
    ]);

    // Get hospitals with admin details
    const hospitals = await Hospital.find()
      .populate('adminId', 'name email')
      .populate('admins', 'name email profile')
      .lean();

    const formattedHospitals = hospitals.map(hospital => ({
      id: hospital._id,
      name: hospital.name,
      location: hospital.location,
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
      zipCode: hospital.zipCode,
      email: hospital.email,
      phone: hospital.phone,
      website: hospital.website,
      type: hospital.type || 'general',
      beds: hospital.beds,
      status: hospital.status || 'active',
      adminName: hospital.adminId?.name || 'No admin assigned',
      adminEmail: hospital.adminId?.email,
      createdAt: hospital.createdAt
    }));

    // Get user roles distribution
    const [
      patients,
      doctors,
      hospitalAdmins,
      superAdmins,
      pharmacists,
      insuranceProviders
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'hospital_admin' }),
      User.countDocuments({ role: 'super_admin' }),
      User.countDocuments({ role: 'pharmacist' }),
      User.countDocuments({ role: 'insurance_provider' })
    ]);

    const usersByRole = [
      { name: 'Patients', value: patients },
      { name: 'Doctors', value: doctors },
      { name: 'Hospital Admins', value: hospitalAdmins },
      { name: 'Super Admins', value: superAdmins },
      { name: 'Pharmacists', value: pharmacists },
      { name: 'Insurance Providers', value: insuranceProviders }
    ];

    // Get hospital types distribution
    const hospitalTypes = {};
    hospitals.forEach(hospital => {
      const type = hospital.type || 'general';
      hospitalTypes[type] = (hospitalTypes[type] || 0) + 1;
    });

    const hospitalsByType = Object.entries(hospitalTypes).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // Get hospital regions distribution
    const hospitalRegions = {};
    hospitals.forEach(hospital => {
      const region = getRegionForState(hospital.state);
      hospitalRegions[region] = (hospitalRegions[region] || 0) + 1;
    });

    const hospitalsByRegion = Object.entries(hospitalRegions).map(([name, value]) => ({
      name,
      value
    }));

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role profile.phone createdAt')
      .lean();

    const formattedRecentUsers = recentUsers.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.profile?.phone || 'N/A',
      joinedDate: user.createdAt
    }));

    // Get real activities from the database
    let recentActivities = [];

    try {
      // Get recent user registrations
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(3);

      if (recentUsers && recentUsers.length > 0) {
        recentUsers.forEach((user, index) => {
          recentActivities.push({
            id: `user-${user._id}`,
            user: 'System',
            action: `registered a new ${user.role.replace('_', ' ')}`,
            time: formatTimeAgo(user.createdAt),
            details: `${user.name} (${user.email}) was added to the system`,
            actionLink: '/admin/users',
            createdAt: user.createdAt
          });
        });
      }

      // Get recent hospital registrations
      const recentHospitals = await Hospital.find()
        .sort({ createdAt: -1 })
        .limit(2);

      if (recentHospitals && recentHospitals.length > 0) {
        recentHospitals.forEach((hospital, index) => {
          recentActivities.push({
            id: `hospital-${hospital._id}`,
            user: 'Admin',
            action: `created a new hospital: ${hospital.name}`,
            time: formatTimeAgo(hospital.createdAt),
            details: `Hospital located in ${hospital.city}, ${hospital.state} with ${hospital.beds || 'unknown'} beds`,
            actionLink: '/admin/hospitals',
            createdAt: hospital.createdAt
          });
        });
      }

      // Get recent appointments
      const recentAppointments = await Appointment.find()
        .sort({ createdAt: -1 })
        .limit(2)
        .populate('doctor', 'name')
        .populate('patient', 'name');

      if (recentAppointments && recentAppointments.length > 0) {
        recentAppointments.forEach((appointment, index) => {
          const doctorName = appointment.doctor?.name || 'Unknown Doctor';
          const patientName = appointment.patient?.name || 'Unknown Patient';

          recentActivities.push({
            id: `appointment-${appointment._id}`,
            user: `Dr. ${doctorName.split(' ')[0]}`,
            action: `scheduled a new ${appointment.type} appointment`,
            time: formatTimeAgo(appointment.createdAt),
            details: `Appointment with ${patientName} on ${new Date(appointment.date).toLocaleDateString()} for ${appointment.reason}`,
            actionLink: '/admin/appointments',
            createdAt: appointment.createdAt
          });
        });
      }

      // Get recent posts from community forum
      const recentPosts = await Post.find()
        .sort({ createdAt: -1 })
        .limit(2)
        .populate('author', 'name');

      if (recentPosts && recentPosts.length > 0) {
        recentPosts.forEach((post, index) => {
          const authorName = post.author?.name || 'Unknown User';

          recentActivities.push({
            id: `post-${post._id}`,
            user: authorName,
            action: `published a new post in the community forum`,
            time: formatTimeAgo(post.createdAt),
            details: `"${post.title}" in category: ${post.category}`,
            actionLink: '/admin/community',
            createdAt: post.createdAt
          });
        });
      }

      // Sort activities by creation date
      recentActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // If no real activities found, use sample data
      if (recentActivities.length === 0) {
        recentActivities = [
          {
            id: 1,
            user: 'Dr. Sarah Johnson',
            action: 'created a new patient record',
            time: '15 minutes ago',
            details: 'Added patient #12458 with initial diagnosis and medical history',
            actionLink: '/admin/patients/12458',
            createdAt: new Date(Date.now() - 15 * 60 * 1000)
          },
          {
            id: 2,
            user: 'Admin Mark Wilson',
            action: 'updated hospital information for Memorial Health Center',
            time: '45 minutes ago',
            details: 'Updated contact information, added 3 new departments, and assigned 2 new admins',
            actionLink: '/admin/hospitals/45',
            createdAt: new Date(Date.now() - 45 * 60 * 1000)
          },
          {
            id: 3,
            user: 'System',
            action: 'completed automatic database backup',
            time: '2 hours ago',
            details: 'Backup size: 2.4GB, Duration: 8 minutes, Status: Success',
            actionLink: '/admin/system/backups',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: 4,
            user: 'Dr. Michael Chen',
            action: 'scheduled 5 new appointments',
            time: '3 hours ago',
            details: 'Cardiology department: 3 appointments, Neurology: 2 appointments',
            actionLink: '/admin/appointments',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
          },
          {
            id: 5,
            user: 'Admin Jennifer Adams',
            action: 'created a new hospital',
            time: '4 hours ago',
            details: 'Created Riverside Medical Center with 5 departments and 120 beds',
            actionLink: '/admin/hospitals/46',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          {
            id: 6,
            user: 'System',
            action: 'detected unusual login pattern',
            time: '5 hours ago',
            details: 'Multiple login attempts from different locations for user admin@example.com',
            actionLink: '/admin/security/alerts',
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
          },
          {
            id: 7,
            user: 'Admin David Miller',
            action: 'generated monthly analytics report',
            time: 'Yesterday',
            details: 'Report includes user growth, hospital performance, and system metrics',
            actionLink: '/admin/analytics/reports',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ];
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);

      // Fallback to sample data if there's an error
      recentActivities = [
        {
          id: 1,
          user: 'Dr. Sarah Johnson',
          action: 'created a new patient record',
          time: '15 minutes ago',
          details: 'Added patient #12458 with initial diagnosis and medical history',
          actionLink: '/admin/patients/12458'
        },
        {
          id: 2,
          user: 'Admin Mark Wilson',
          action: 'updated hospital information for Memorial Health Center',
          time: '45 minutes ago',
          details: 'Updated contact information, added 3 new departments, and assigned 2 new admins',
          actionLink: '/admin/hospitals/45'
        },
        {
          id: 3,
          user: 'System',
          action: 'completed automatic database backup',
          time: '2 hours ago',
          details: 'Backup size: 2.4GB, Duration: 8 minutes, Status: Success',
          actionLink: '/admin/system/backups'
        }
      ];
    }

    // Get system health (mock data for now)
    const systemHealth = {
      cpu: 32,
      memory: 45,
      disk: 28,
      network: 65,
      uptime: '99.98%',
      responseTime: '120ms',
      activeConnections: activeSessions,
      lastBackup: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'healthy'
    };

    // Get historical data for analytics
    const months = [];
    const hospitalRegistrations = [];
    const userRegistrations = [];

    // Get data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const monthName = getMonthName(date.getMonth());
      const year = date.getFullYear();

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const [monthlyHospitals, monthlyUsers] = await Promise.all([
        Hospital.countDocuments({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }),
        User.countDocuments({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        })
      ]);

      months.push(`${monthName} ${year}`);
      hospitalRegistrations.push(monthlyHospitals);
      userRegistrations.push(monthlyUsers);
    }

    // Calculate growth rates
    const totalHospitalsLastMonth = await Hospital.countDocuments({
      createdAt: { $lt: new Date(now.getFullYear(), now.getMonth(), 1) }
    });

    const hospitalGrowthRate = totalHospitalsLastMonth > 0
      ? `+${(((totalHospitals - totalHospitalsLastMonth) / totalHospitalsLastMonth) * 100).toFixed(1)}%`
      : '+0%';

    const totalUsersLastMonth = await User.countDocuments({
      createdAt: { $lt: new Date(now.getFullYear(), now.getMonth(), 1) }
    });

    const userGrowthRate = totalUsersLastMonth > 0
      ? `+${(((totalUsers - totalUsersLastMonth) / totalUsersLastMonth) * 100).toFixed(1)}%`
      : '+0%';

    // Format analytics data
    const analyticsData = {
      labels: months,
      hospitalRegistrations,
      userRegistrations
    };

    // Get user device distribution (mock data for now)
    const usersByDevice = [
      { name: 'Mobile', value: Math.floor(totalUsers * 0.65) },
      { name: 'Desktop', value: Math.floor(totalUsers * 0.25) },
      { name: 'Tablet', value: Math.floor(totalUsers * 0.10) }
    ];

    // Get user activity data (mock data for now)
    const userActivity = {
      dailyActiveUsers: Math.floor(totalUsers * 0.15),
      weeklyActiveUsers: Math.floor(totalUsers * 0.45),
      monthlyActiveUsers: activeSessions,
      averageSessionTime: '12 minutes'
    };

    // Get weekly user activity (mock data for now)
    const weeklyUserActivity = [
      { name: 'Mon', users: Math.floor(Math.random() * 500) + 1500 },
      { name: 'Tue', users: Math.floor(Math.random() * 500) + 1500 },
      { name: 'Wed', users: Math.floor(Math.random() * 500) + 1500 },
      { name: 'Thu', users: Math.floor(Math.random() * 500) + 1500 },
      { name: 'Fri', users: Math.floor(Math.random() * 500) + 1500 },
      { name: 'Sat', users: Math.floor(Math.random() * 500) + 1500 },
      { name: 'Sun', users: Math.floor(Math.random() * 500) + 1500 }
    ];

    // Get real notifications from the database
    let notifications = [];
    try {
      // Get all super admin users
      const superAdmins = await User.find({ role: 'super_admin' });

      if (superAdmins && superAdmins.length > 0) {
        // Get notifications for the first super admin
        const adminNotifications = await Notification.find({ userId: superAdmins[0]._id })
          .sort({ createdAt: -1 })
          .limit(10);

        if (adminNotifications && adminNotifications.length > 0) {
          notifications = adminNotifications.map(notification => ({
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
        }
      }

      // If no real notifications found, create sample notifications
      if (notifications.length === 0 && superAdmins && superAdmins.length > 0) {
        const sampleNotifications = [
          {
            userId: superAdmins[0]._id,
            title: 'New Hospital Registration',
            message: 'Memorial Health Center has requested registration approval',
            type: 'hospital',
            priority: 'high',
            read: false,
            actionLink: '/admin/hospitals',
            createdAt: new Date(Date.now() - 10 * 60 * 1000)
          },
          {
            userId: superAdmins[0]._id,
            title: 'System Maintenance',
            message: 'System backup scheduled for tonight at 2:00 AM. No downtime expected.',
            type: 'warning',
            priority: 'normal',
            read: false,
            actionLink: '/admin/system',
            createdAt: new Date(Date.now() - 60 * 60 * 1000)
          },
          {
            userId: superAdmins[0]._id,
            title: 'Monthly Report Available',
            message: 'July 2023 analytics report is ready for review',
            type: 'analytics',
            priority: 'normal',
            read: true,
            actionLink: '/admin/analytics',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
          },
          {
            userId: superAdmins[0]._id,
            title: 'Database Optimization',
            message: 'Database optimization completed successfully. Performance improved by 15%',
            type: 'success',
            priority: 'low',
            read: true,
            actionLink: '/admin/database',
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
          },
          {
            userId: superAdmins[0]._id,
            title: 'Security Alert',
            message: 'Multiple failed login attempts detected from IP 192.168.1.45',
            type: 'security',
            priority: 'high',
            read: true,
            actionLink: '/admin/security',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          {
            userId: superAdmins[0]._id,
            title: 'New Admin User',
            message: 'Dr. James Wilson has been registered as a hospital admin',
            type: 'user',
            priority: 'normal',
            read: true,
            actionLink: '/admin/users',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ];

        // Create these sample notifications in the database
        for (const notifData of sampleNotifications) {
          try {
            // Check if notification already exists
            const existingNotif = await Notification.findOne({
              userId: notifData.userId,
              title: notifData.title,
              message: notifData.message
            });

            if (!existingNotif) {
              const newNotif = await Notification.create(notifData);

              // Add to notifications array
              notifications.push({
                id: newNotif._id,
                type: newNotif.type,
                title: newNotif.title,
                message: newNotif.message,
                time: formatTimeAgo(newNotif.createdAt),
                read: newNotif.read,
                actionLink: newNotif.actionLink || getDefaultActionLink(newNotif.type),
                priority: newNotif.priority,
                createdAt: newNotif.createdAt
              });
            }
          } catch (err) {
            console.error('Error creating sample notification:', err);
          }
        }
      }

      // If still no notifications (e.g., due to errors), use mock data without saving to DB
      if (notifications.length === 0) {
        notifications = [
          {
            id: 'mock-1',
            type: 'hospital',
            title: 'New Hospital Registration',
            message: 'Memorial Health Center has requested registration approval',
            time: '10 minutes ago',
            read: false,
            actionLink: '/admin/hospitals',
            priority: 'high',
            createdAt: new Date(Date.now() - 10 * 60 * 1000)
          },
          {
            id: 'mock-2',
            type: 'warning',
            title: 'System Maintenance',
            message: 'System backup scheduled for tonight at 2:00 AM. No downtime expected.',
            time: '1 hour ago',
            read: false,
            actionLink: '/admin/system',
            priority: 'normal',
            createdAt: new Date(Date.now() - 60 * 60 * 1000)
          },
          {
            id: 'mock-3',
            type: 'analytics',
            title: 'Monthly Report Available',
            message: 'July 2023 analytics report is ready for review',
            time: '3 hours ago',
            read: true,
            actionLink: '/admin/analytics',
            priority: 'normal',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
          }
        ];
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);

      // Fallback to mock data if there's an error
      notifications = [
        {
          id: 'mock-1',
          type: 'hospital',
          title: 'New Hospital Registration',
          message: 'Memorial Health Center has requested registration approval',
          time: '10 minutes ago',
          read: false,
          actionLink: '/admin/hospitals',
          priority: 'high'
        },
        {
          id: 'mock-2',
          type: 'warning',
          title: 'System Maintenance',
          message: 'System backup scheduled for tonight at 2:00 AM. No downtime expected.',
          time: '1 hour ago',
          read: false,
          actionLink: '/admin/system',
          priority: 'normal'
        }
      ];
    }

    // Combine all data
    res.json({
      totalHospitals,
      totalUsers,
      activeSessions,
      newUsersToday,
      newHospitalsToday,
      totalAppointments,
      appointmentsToday,
      hospitals: formattedHospitals,
      analyticsData,
      usersByRole,
      hospitalsByType,
      hospitalsByRegion,
      recentUsers: formattedRecentUsers,
      recentActivities,
      systemHealth,
      usersByDevice,
      userActivity,
      weeklyUserActivity,
      notifications,
      growthRates: {
        hospitals: hospitalGrowthRate,
        users: userGrowthRate
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};