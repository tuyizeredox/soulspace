const User = require('../models/User');
const Appointment = require('../models/Appointment');
const PatientAssignment = require('../models/PatientAssignment');
const MedicalRecord = require('../models/MedicalRecord');

// Get statistics for the logged-in doctor
exports.getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const hospitalId = req.user.hospitalId;

    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID not found in token' });
    }

    console.log(`Fetching stats for doctor ${doctorId} from hospital ${hospitalId}`);

    // Get patient count
    const patientAssignments = await PatientAssignment.find({
      $or: [
        { doctors: doctorId },
        { primaryDoctor: doctorId }
      ],
      active: true
    });

    const patientCount = patientAssignments.length;

    // Get appointment stats
    const appointments = await Appointment.find({
      doctor: doctorId
    });

    // Calculate appointment stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && aptDate < tomorrow;
    });

    const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
    const completedAppointments = appointments.filter(apt => apt.status === 'completed');
    const onlineConsultations = appointments.filter(apt => apt.type === 'online');
    const inPersonVisits = appointments.filter(apt => apt.type === 'in-person');

    // Get recent medical records
    const recentMedicalRecords = await MedicalRecord.find({
      doctor: doctorId
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('patient', 'name');

    // Format medical records
    const formattedMedicalRecords = recentMedicalRecords.map(record => ({
      id: record._id,
      patientName: record.patient ? record.patient.name : 'Unknown Patient',
      patientId: record.patient ? record.patient._id : null,
      diagnosis: record.diagnosis || 'General checkup',
      date: record.createdAt,
      notes: record.notes
    }));

    // Calculate patient demographics (mock data for now)
    // In a real system, this would come from actual patient data
    const patientDemographics = [
      { name: 'Male', value: Math.floor(patientCount * 0.48) },
      { name: 'Female', value: Math.floor(patientCount * 0.52) }
    ];

    // Calculate appointment trends (mock data for now)
    // In a real system, this would come from actual appointment data
    const appointmentTrends = [
      { name: 'Mon', appointments: Math.floor(Math.random() * 10) + 1 },
      { name: 'Tue', appointments: Math.floor(Math.random() * 10) + 1 },
      { name: 'Wed', appointments: Math.floor(Math.random() * 10) + 1 },
      { name: 'Thu', appointments: Math.floor(Math.random() * 10) + 1 },
      { name: 'Fri', appointments: Math.floor(Math.random() * 10) + 1 },
      { name: 'Sat', appointments: Math.floor(Math.random() * 5) },
      { name: 'Sun', appointments: Math.floor(Math.random() * 3) }
    ];

    // Calculate patient satisfaction (mock data for now)
    // In a real system, this would come from patient ratings
    const patientSatisfaction = Math.floor(Math.random() * 15) + 80; // Random between 80-95
    const averageRating = (4 + Math.random()).toFixed(1); // Random between 4.0-5.0

    // Return all stats
    res.json({
      totalPatients: patientCount,
      todayAppointments: todayAppointments.length,
      pendingAppointments: pendingAppointments.length,
      completedAppointments: completedAppointments.length,
      onlineConsultations: onlineConsultations.length,
      inPersonVisits: inPersonVisits.length,
      patientSatisfaction,
      averageRating: parseFloat(averageRating),
      recentMedicalRecords: formattedMedicalRecords,
      patientDemographics,
      appointmentTrends
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ message: 'Error fetching doctor stats', error: error.message });
  }
};

// Get doctor's shifts
exports.getDoctorShifts = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    // In a real system, this would come from a shifts collection
    // For now, return mock data
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const shifts = [
      {
        id: '1',
        date: today.toISOString().split('T')[0],
        startTime: '08:00 AM',
        endTime: '04:00 PM',
        department: 'General'
      },
      {
        id: '2',
        date: tomorrow.toISOString().split('T')[0],
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        department: 'General'
      }
    ];
    
    res.json(shifts);
  } catch (error) {
    console.error('Error fetching doctor shifts:', error);
    res.status(500).json({ message: 'Error fetching doctor shifts', error: error.message });
  }
};

// Get doctor's appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const appointments = await Appointment.find({
      doctor: doctorId
    })
    .populate('patient', 'name email profile')
    .sort({ date: 1 });
    
    // Format appointments
    const formattedAppointments = appointments.map(apt => ({
      _id: apt._id,
      patient: apt.patient ? {
        _id: apt.patient._id,
        name: apt.patient.name,
        email: apt.patient.email,
        phone: apt.patient?.profile?.phone || 'Not provided',
        avatar: apt.patient?.profile?.avatar || null
      } : null,
      date: apt.date,
      time: new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: apt.type,
      status: apt.status,
      reason: apt.reason,
      notes: apt.notes,
      duration: apt.duration || 30 // Default duration if not specified
    }));
    
    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Error fetching doctor appointments', error: error.message });
  }
};
