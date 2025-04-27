const PatientAssignment = require('../models/PatientAssignment');
const mongoose = require('mongoose');

exports.getHospitalAssignments = async (req, res) => {
  try {
    const assignments = await PatientAssignment.find({ hospital: req.user.hospitalId })
      .populate('patient', 'name email')
      .populate('doctors', 'name email')
      .populate('primaryDoctor', 'name email')
      .sort('-createdAt');

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { patient, doctors, primaryDoctor } = req.body;

    // Check if patient already has an active assignment
    const existingAssignment = await PatientAssignment.findOne({
      patient,
      hospital: req.user.hospitalId,
      active: true
    });

    if (existingAssignment) {
      return res.status(400).json({ message: 'Patient already has an active assignment' });
    }

    const assignment = new PatientAssignment({
      patient,
      doctors,
      primaryDoctor,
      hospital: req.user.hospitalId
    });

    await assignment.save();

    const populatedAssignment = await PatientAssignment.findById(assignment._id)
      .populate('patient', 'name email')
      .populate('doctors', 'name email')
      .populate('primaryDoctor', 'name email');

    res.status(201).json(populatedAssignment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating assignment', error: error.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { patient, doctors, primaryDoctor } = req.body;
    const assignment = await PatientAssignment.findByIdAndUpdate(
      req.params.id,
      {
        patient,
        doctors,
        primaryDoctor
      },
      { new: true }
    )
    .populate('patient', 'name email')
    .populate('doctors', 'name email')
    .populate('primaryDoctor', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating assignment', error: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await PatientAssignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting assignment', error: error.message });
  }
};

// Get the current patient's assignment
exports.getMyAssignment = async (req, res) => {
  try {
    // Ensure the user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can access their assignments' });
    }

    // Find the active assignment for this patient
    const assignment = await PatientAssignment.findOne({
      patient: req.user.id,
      active: true
    })
      .populate('hospital', 'name location address city state zipCode phone email')
      .populate('doctors', 'name email profile.specialization profile.phone')
      .populate('primaryDoctor', 'name email profile.specialization profile.phone');

    if (!assignment) {
      return res.status(404).json({ message: 'No active assignment found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Error fetching patient assignment:', error);
    res.status(500).json({ message: 'Error fetching assignment', error: error.message });
  }
};