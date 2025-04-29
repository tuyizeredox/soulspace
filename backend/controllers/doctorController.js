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
      status: doctor.status || 'Active',
      phone: doctor.profile?.phone || 'Not provided',
      specialization: doctor.profile?.specialization || 'General',
      department: doctor.profile?.department || 'General',
      qualifications: doctor.profile?.qualifications || '',
      experience: doctor.profile?.experience || 0,
      bio: doctor.profile?.bio || '',
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    }));

    res.json(formattedDoctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const { name, email, password, status, profile } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Extract profile fields or use empty object if not provided
    const {
      phone,
      specialization,
      department,
      qualifications,
      experience,
      bio
    } = profile || {};

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new doctor
    const doctor = new User({
      name,
      email,
      password: hashedPassword,
      role: 'doctor',
      hospitalId: req.user.hospitalId,
      status: status || 'Active',
      profile: {
        phone: phone || '',
        specialization: specialization || 'General',
        department: department || 'General',
        qualifications: qualifications || '',
        experience: experience || 0,
        bio: bio || ''
      }
    });

    await doctor.save();

    // Return comprehensive doctor data
    res.status(201).json({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      status: doctor.status,
      phone: doctor.profile.phone,
      specialization: doctor.profile.specialization,
      department: doctor.profile.department,
      qualifications: doctor.profile.qualifications,
      experience: doctor.profile.experience,
      bio: doctor.profile.bio,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: 'Error creating doctor', error: error.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      status,
      profile
    } = req.body;

    // Extract profile fields or use empty object if not provided
    const {
      phone,
      specialization,
      department,
      qualifications,
      experience,
      bio
    } = profile || {};

    // Check if doctor exists and belongs to the hospital
    const existingDoctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor',
      hospitalId: req.user.hospitalId
    });

    if (!existingDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Create update object
    const updateData = {
      name,
      email,
      status: status || existingDoctor.status || 'Active',
    };

    // Add profile fields to update - always include phone number
    updateData['profile.phone'] = phone || existingDoctor.profile?.phone || '';
    if (specialization) updateData['profile.specialization'] = specialization;
    if (department) updateData['profile.department'] = department;
    if (qualifications) updateData['profile.qualifications'] = qualifications;
    if (experience !== undefined) updateData['profile.experience'] = experience;
    if (bio) updateData['profile.bio'] = bio;

    // Update doctor
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Log the updated doctor data for debugging
    console.log('Updated doctor data:', doctor);
    console.log('Updated doctor phone:', doctor.profile?.phone);

    // Return comprehensive doctor data
    res.json({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      status: doctor.status || 'Active',
      phone: doctor.profile?.phone || 'Not provided',
      specialization: doctor.profile?.specialization || 'General',
      department: doctor.profile?.department || 'General',
      qualifications: doctor.profile?.qualifications || '',
      experience: doctor.profile?.experience || 0,
      bio: doctor.profile?.bio || '',
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
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