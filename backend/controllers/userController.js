const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

exports.getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the user
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // If the user is a hospital admin, get hospital information
        let hospitalInfo = null;
        let isPrimaryAdmin = false;

        if (user.role === 'hospital_admin') {
            // First, check if the user has a hospitalId
            if (user.hospitalId) {
                const hospital = await Hospital.findById(user.hospitalId)
                    .select('name city state adminId phone email');

                if (hospital) {
                    hospitalInfo = {
                        _id: hospital._id,
                        name: hospital.name,
                        city: hospital.city,
                        state: hospital.state,
                        phone: hospital.phone,
                        email: hospital.email
                    };

                    // Check if this user is the primary admin
                    isPrimaryAdmin = hospital.adminId &&
                                    hospital.adminId.toString() === userId;
                }
            }

            // If no hospital found by hospitalId, try to find a hospital where this user is an admin
            if (!hospitalInfo) {
                const hospital = await Hospital.findOne({
                    $or: [
                        { adminId: userId },
                        { admins: userId }
                    ]
                }).select('name city state adminId phone email');

                if (hospital) {
                    hospitalInfo = {
                        _id: hospital._id,
                        name: hospital.name,
                        city: hospital.city,
                        state: hospital.state,
                        phone: hospital.phone,
                        email: hospital.email
                    };

                    // Check if this user is the primary admin
                    isPrimaryAdmin = hospital.adminId &&
                                    hospital.adminId.toString() === userId;
                }
            }
        }

        // Return user data with hospital info
        const userData = user.toObject();

        res.json({
            ...userData,
            hospital: hospitalInfo,
            isPrimaryAdmin
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Error fetching user details', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get user statistics for the dashboard
exports.getUserStats = async (req, res) => {
  try {
    // Get current date and date 24 hours ago
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total counts
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      patients,
      doctors,
      hospitalAdmins,
      superAdmins,
      pharmacists,
      insuranceProviders,
      recentUsers
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ lastActive: { $gt: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gt: yesterday } }),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'hospital_admin' }),
      User.countDocuments({ role: 'super_admin' }),
      User.countDocuments({ role: 'pharmacist' }),
      User.countDocuments({ role: 'insurance_provider' }),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role profile.phone createdAt')
    ]);

    // Format recent users
    const formattedRecentUsers = recentUsers.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.profile?.phone || 'N/A',
      joinedDate: user.createdAt
    }));

    // Calculate user roles distribution
    const usersByRole = [
      { name: 'Patients', value: patients },
      { name: 'Doctors', value: doctors },
      { name: 'Hospital Admins', value: hospitalAdmins },
      { name: 'Super Admins', value: superAdmins },
      { name: 'Pharmacists', value: pharmacists },
      { name: 'Insurance Providers', value: insuranceProviders }
    ];

    // Get user activity data (mock data for now)
    const userActivity = {
      dailyActiveUsers: Math.floor(totalUsers * 0.15),
      weeklyActiveUsers: Math.floor(totalUsers * 0.45),
      monthlyActiveUsers: activeUsers,
      averageSessionTime: '12 minutes'
    };

    // Get user device distribution (mock data for now)
    const usersByDevice = [
      { name: 'Mobile', value: Math.floor(totalUsers * 0.65) },
      { name: 'Desktop', value: Math.floor(totalUsers * 0.25) },
      { name: 'Tablet', value: Math.floor(totalUsers * 0.10) }
    ];

    // Get user growth data for the last 6 months
    const months = [];
    const userGrowth = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const usersCount = await User.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      months.push(`${month} ${year}`);
      userGrowth.push(usersCount);
    }

    // Calculate growth rates
    const totalUsersLastMonth = await User.countDocuments({
      createdAt: { $lt: new Date(now.getFullYear(), now.getMonth(), 1) }
    });

    const userGrowthRate = totalUsersLastMonth > 0
      ? `+${(((totalUsers - totalUsersLastMonth) / totalUsersLastMonth) * 100).toFixed(1)}%`
      : '+0%';

    const activeUsersLastMonth = await User.countDocuments({
      lastActive: {
        $gt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        $lt: thirtyDaysAgo
      }
    });

    const activeUsersGrowthRate = activeUsersLastMonth > 0
      ? `+${(((activeUsers - activeUsersLastMonth) / activeUsersLastMonth) * 100).toFixed(1)}%`
      : '+0%';

    const newUsersTwoDaysAgo = await User.countDocuments({
      createdAt: {
        $gt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        $lt: yesterday
      }
    });

    const newUsersGrowthRate = newUsersTwoDaysAgo > 0
      ? `+${(((newUsersToday - newUsersTwoDaysAgo) / newUsersTwoDaysAgo) * 100).toFixed(1)}%`
      : '+0%';

    // Combine all growth rates
    const growthRates = {
      totalUsers: userGrowthRate,
      activeUsers: activeUsersGrowthRate,
      newUsers: newUsersGrowthRate
    };

    res.json({
      totalUsers,
      activeUsers,
      newUsersToday,
      usersByRole,
      usersByDevice,
      userActivity,
      recentUsers: formattedRecentUsers,
      growthData: {
        months,
        userGrowth
      },
      growthRates
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
};