const Hospital = require('../models/Hospital');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const PatientAssignment = require('../models/PatientAssignment');

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

// Get system-wide hospital statistics for super admin dashboard
exports.getSystemStats = async (req, res) => {
  try {
    // Get total counts
    const [
      totalHospitals,
      activeDoctors,
      registeredPatients,
      appointmentsToday,
      hospitalAdmins
    ] = await Promise.all([
      Hospital.countDocuments({}),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'patient' }),
      Appointment.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      User.countDocuments({ role: 'hospital_admin' })
    ]);

    // Get hospitals by type
    const hospitals = await Hospital.find({}, 'type state');

    // Count hospitals by type
    const typeCount = {};
    hospitals.forEach(hospital => {
      const type = hospital.type || 'general';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    // Format hospital types for frontend
    const hospitalsByType = Object.entries(typeCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // Count hospitals by region
    const regionCount = {};
    hospitals.forEach(hospital => {
      const region = getRegionForState(hospital.state);
      regionCount[region] = (regionCount[region] || 0) + 1;
    });

    // Format regions for frontend
    const hospitalsByRegion = Object.entries(regionCount).map(([name, value]) => ({
      name,
      value
    }));

    // Calculate growth rates (mock data for now, could be calculated from historical data)
    const growthRates = {
      hospitals: '+5%',
      doctors: '+12%',
      patients: '+8%',
      appointments: '+15%',
      admins: '+7%'
    };

    // Get recent hospital admins (last 5 added)
    const recentAdmins = await User.find({ role: 'hospital_admin' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email profile.phone hospitalId createdAt')
      .populate('hospitalId', 'name');

    // Format recent admins for frontend
    const formattedRecentAdmins = recentAdmins.map(admin => ({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.profile?.phone || 'N/A',
      hospital: admin.hospitalId?.name || 'Unassigned',
      joinedDate: admin.createdAt
    }));

    // Get admin activity stats
    const adminActivityStats = {
      totalAdmins: hospitalAdmins,
      activeToday: Math.floor(hospitalAdmins * 0.65), // Mock data - could be calculated from login records
      avgHospitalsPerAdmin: totalHospitals > 0 && hospitalAdmins > 0 ? (totalHospitals / hospitalAdmins).toFixed(1) : 0,
      adminsByExperience: [
        { name: '< 1 month', value: Math.floor(hospitalAdmins * 0.2) },
        { name: '1-3 months', value: Math.floor(hospitalAdmins * 0.3) },
        { name: '3-6 months', value: Math.floor(hospitalAdmins * 0.25) },
        { name: '> 6 months', value: Math.floor(hospitalAdmins * 0.25) }
      ]
    };

    res.json({
      totalHospitals,
      activeDoctors,
      registeredPatients,
      appointmentsToday,
      hospitalAdmins,
      hospitalsByType,
      hospitalsByRegion,
      growthRates,
      recentAdmins: formattedRecentAdmins,
      adminStats: adminActivityStats
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ message: 'Error fetching system stats', error: error.message });
  }
};

// Get stats for a specific hospital
exports.getHospitalStats = async (req, res) => {
  try {
    const hospitalId = req.params.hospitalId;

    // If hospitalId is not valid, return mock data
    if (!hospitalId || hospitalId === 'undefined') {
      console.log('Warning: Invalid hospital ID, using default data');
      return res.json({
        totalPatients: 120,
        totalDoctors: 15,
        pendingAppointments: 25,
        activeTreatments: 45,
        analyticsData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'New Patients',
              data: [12, 19, 15, 25, 22, 30],
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            },
            {
              label: 'Appointments',
              data: [20, 25, 18, 30, 28, 35],
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1
            }
          ]
        }
      });
    }

    // Log the hospital ID to debug
    console.log('Fetching stats for hospital ID:', hospitalId);

    const [
      totalPatients,
      totalDoctors,
      pendingAppointments,
      activeTreatments,
      totalNurses,
      totalPharmacists,
      totalStaff,
      confirmedAppointments
    ] = await Promise.all([
      User.countDocuments({ role: 'patient', hospitalId }),
      User.countDocuments({ role: 'doctor', hospitalId }),
      Appointment.countDocuments({ hospitalId, status: 'pending' }),
      PatientAssignment.countDocuments({ hospital: hospitalId, active: true }),
      User.countDocuments({ role: 'nurse', hospitalId }),
      User.countDocuments({ role: 'pharmacist', hospitalId }),
      User.countDocuments({
        hospitalId,
        role: { $in: ['staff', 'receptionist', 'lab_technician'] }
      }),
      Appointment.countDocuments({ hospitalId, status: 'confirmed' })
    ]);

    // Get monthly stats for analytics
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Promise.all(
      Array.from({ length: 6 }, async (_, i) => {
        const month = new Date().getMonth() - i;
        const startDate = new Date(currentYear, month, 1);
        const endDate = new Date(currentYear, month + 1, 0);

        const [patients, appointments] = await Promise.all([
          User.countDocuments({
            role: 'patient',
            hospitalId,
            createdAt: { $gte: startDate, $lte: endDate }
          }),
          Appointment.countDocuments({
            hospitalId,
            createdAt: { $gte: startDate, $lte: endDate }
          })
        ]);

        return { patients, appointments };
      })
    );

    const analyticsData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'New Patients',
          data: monthlyStats.map(stat => stat.patients).reverse(),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Appointments',
          data: monthlyStats.map(stat => stat.appointments).reverse(),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }
      ]
    };

    res.json({
      totalPatients,
      totalDoctors,
      pendingAppointments,
      activeTreatments,
      totalNurses,
      totalPharmacists,
      totalStaff,
      confirmedAppointments,
      totalAppointments: pendingAppointments + confirmedAppointments,
      totalMedicalStaff: totalDoctors + totalNurses + totalPharmacists,
      analyticsData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospital stats', error: error.message });
  }
};