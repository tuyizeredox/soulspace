const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Get all nurses for a hospital
exports.getHospitalNurses = async (req, res) => {
  try {
    const nurses = await User.find({
      role: 'nurse',
      hospitalId: req.user.hospitalId
    }).select('-password');

    // Get all doctors in this hospital for reference
    const doctors = await User.find({
      role: 'doctor',
      hospitalId: req.user.hospitalId
    }).select('-password');

    // Create a map of doctor IDs to doctor details for quick lookup
    const doctorMap = {};
    doctors.forEach(doctor => {
      doctorMap[doctor._id.toString()] = {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.profile?.specialization || 'General',
        department: doctor.profile?.department || 'General',
        phone: doctor.profile?.phone || 'Not provided'
      };
    });

    const formattedNurses = await Promise.all(nurses.map(async nurse => {
      // Get assigned doctor details
      const assignedDoctorIds = nurse.profile?.assignedDoctors || [];
      const assignedDoctorDetails = assignedDoctorIds.map(doctorId => {
        const doctorIdStr = doctorId.toString();
        return doctorMap[doctorIdStr] || { id: doctorId, name: 'Unknown Doctor', specialization: 'Unknown', department: 'Unknown' };
      });

      return {
        id: nurse._id,
        name: nurse.name,
        email: nurse.email,
        phone: nurse.profile?.phone || 'Not provided',
        department: nurse.profile?.department || 'General',
        licenseNumber: nurse.profile?.licenseNumber || 'Not provided',
        assignedDoctors: assignedDoctorIds,
        assignedDoctorDetails: assignedDoctorDetails,
        status: nurse.status || 'active'
      };
    }));

    res.json(formattedNurses);
  } catch (error) {
    console.error('Error fetching nurses:', error);
    res.status(500).json({ message: 'Error fetching nurses', error: error.message });
  }
};

// Create a new nurse
exports.createNurse = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      licenseNumber,
      assignedDoctors,
      password
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new nurse
    const nurse = new User({
      name,
      email,
      password: hashedPassword,
      role: 'nurse',
      hospitalId: req.user.hospitalId,
      status: 'active',
      profile: {
        phone,
        department,
        licenseNumber,
        assignedDoctors: assignedDoctors || []
      }
    });

    await nurse.save();

    res.status(201).json({
      id: nurse._id,
      name: nurse.name,
      email: nurse.email,
      phone: nurse.profile.phone,
      department: nurse.profile.department,
      licenseNumber: nurse.profile.licenseNumber,
      assignedDoctors: nurse.profile.assignedDoctors,
      status: nurse.status
    });
  } catch (error) {
    console.error('Error creating nurse:', error);
    res.status(500).json({ message: 'Error creating nurse', error: error.message });
  }
};

// Update a nurse
exports.updateNurse = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      licenseNumber,
      assignedDoctors,
      status
    } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid nurse ID format' });
    }

    // Find the nurse
    const nurse = await User.findOne({
      _id: req.params.id,
      role: 'nurse',
      hospitalId: req.user.hospitalId
    });

    if (!nurse) {
      return res.status(404).json({ message: 'Nurse not found' });
    }

    // Check if email is being changed and if it's already in use
    if (email !== nurse.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update nurse
    const updatedNurse = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        status,
        'profile.phone': phone,
        'profile.department': department,
        'profile.licenseNumber': licenseNumber,
        'profile.assignedDoctors': assignedDoctors || nurse.profile.assignedDoctors || []
      },
      { new: true }
    ).select('-password');

    if (!updatedNurse) {
      return res.status(404).json({ message: 'Nurse not found' });
    }

    res.json({
      id: updatedNurse._id,
      name: updatedNurse.name,
      email: updatedNurse.email,
      phone: updatedNurse.profile.phone,
      department: updatedNurse.profile.department,
      licenseNumber: updatedNurse.profile.licenseNumber,
      assignedDoctors: updatedNurse.profile.assignedDoctors,
      status: updatedNurse.status
    });
  } catch (error) {
    console.error('Error updating nurse:', error);
    res.status(500).json({ message: 'Error updating nurse', error: error.message });
  }
};

// Delete a nurse
exports.deleteNurse = async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid nurse ID format' });
    }

    // Find the nurse
    const nurse = await User.findOne({
      _id: req.params.id,
      role: 'nurse',
      hospitalId: req.user.hospitalId
    });

    if (!nurse) {
      return res.status(404).json({ message: 'Nurse not found' });
    }

    // Option 1: Hard delete - completely remove the nurse
    // await User.findByIdAndDelete(req.params.id);

    // Option 2: Soft delete - mark as inactive (preferred approach)
    nurse.status = 'inactive';
    await nurse.save();

    res.json({ message: 'Nurse removed successfully' });
  } catch (error) {
    console.error('Error deleting nurse:', error);
    res.status(500).json({ message: 'Error deleting nurse', error: error.message });
  }
};

// Assign doctors to a nurse
exports.assignDoctors = async (req, res) => {
  try {
    const { doctorIds } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid nurse ID format' });
    }

    // Find the nurse
    const nurse = await User.findOne({
      _id: req.params.id,
      role: 'nurse',
      hospitalId: req.user.hospitalId
    });

    if (!nurse) {
      return res.status(404).json({ message: 'Nurse not found' });
    }

    // Validate doctor IDs
    if (!Array.isArray(doctorIds)) {
      return res.status(400).json({ message: 'doctorIds must be an array' });
    }

    // Verify all doctors exist and belong to the same hospital
    const validatedDoctors = [];
    for (const doctorId of doctorIds) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: `Invalid doctor ID format: ${doctorId}` });
      }

      const doctor = await User.findOne({
        _id: doctorId,
        role: 'doctor',
        hospitalId: req.user.hospitalId
      });

      if (!doctor) {
        return res.status(404).json({ message: `Doctor not found with ID: ${doctorId}` });
      }

      validatedDoctors.push({
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.profile?.specialization || 'General',
        department: doctor.profile?.department || 'General'
      });
    }

    // Update nurse with assigned doctors
    nurse.profile.assignedDoctors = doctorIds;
    await nurse.save();

    // Create notification for the nurse
    if (doctorIds.length > 0) {
      try {
        const { createNotificationForUser } = require('../utils/notificationHelper');
        await createNotificationForUser({
          userId: nurse._id,
          title: 'Doctor Assignment Updated',
          message: `You have been assigned to ${validatedDoctors.length} doctor(s)`,
          type: 'info',
          priority: 'medium',
          actionLink: '/dashboard',
          metadata: {
            nurseId: nurse._id,
            doctorIds: doctorIds
          }
        });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Continue execution even if notification fails
      }
    }

    res.json({
      id: nurse._id,
      name: nurse.name,
      assignedDoctors: doctorIds,
      assignedDoctorDetails: validatedDoctors
    });
  } catch (error) {
    console.error('Error assigning doctors to nurse:', error);
    res.status(500).json({ message: 'Error assigning doctors to nurse', error: error.message });
  }
};

// Get nurses assigned to a specific doctor
exports.getNursesByDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }

    // Find the doctor
    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor',
      hospitalId: req.user.hospitalId
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Find nurses assigned to this doctor
    const nurses = await User.find({
      role: 'nurse',
      hospitalId: req.user.hospitalId,
      'profile.assignedDoctors': doctorId,
      status: 'active'
    }).select('-password');

    const formattedNurses = nurses.map(nurse => ({
      id: nurse._id,
      name: nurse.name,
      email: nurse.email,
      phone: nurse.profile?.phone,
      department: nurse.profile?.department,
      licenseNumber: nurse.profile?.licenseNumber
    }));

    res.json(formattedNurses);
  } catch (error) {
    console.error('Error fetching nurses by doctor:', error);
    res.status(500).json({ message: 'Error fetching nurses by doctor', error: error.message });
  }
};
