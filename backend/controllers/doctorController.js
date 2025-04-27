const User = require('../models/User');
const Patient = require('../models/Patient');
const bcrypt = require('bcryptjs');

exports.getHospitalDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: 'doctor',
      hospitalId: req.user.hospitalId
    }).select('-password');

    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.profile?.specialization,
      status: doctor.status || 'Active'
    }));

    res.json(formattedDoctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const { name, email, phone, specialization, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = new User({
      name,
      email,
      password: hashedPassword,
      role: 'doctor',
      hospitalId: req.user.hospitalId,
      profile: {
        phone,
        specialization
      }
    });

    await doctor.save();
    res.status(201).json({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.profile.phone,
      specialization: doctor.profile.specialization
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating doctor', error: error.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { name, email, phone, specialization } = req.body;
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        'profile.phone': phone,
        'profile.specialization': specialization
      },
      { new: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.profile.phone,
      specialization: doctor.profile.specialization
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating doctor', error: error.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await User.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor', error: error.message });
  }
};

exports.getPatientsForDoctor = async (req, res) => {
    const patients = await Patient.find({ assignedDoctor: req.user.id }).populate('assignedDoctor').populate('hospitalId');
    res.json(patients);
};

exports.updatePatientTreatment = async (req, res) => {
    const { patientId, treatmentPlan } = req.body;
    const patient = await Patient.findByIdAndUpdate(patientId, { treatmentPlan }, { new: true });
    res.json(patient);
};