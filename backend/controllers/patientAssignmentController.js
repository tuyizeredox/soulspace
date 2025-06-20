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
    // Check both req.user.id and req.user._id to handle different ID formats
    const patientId = req.user.id || req.user._id;
    
    console.log(`Looking for assignment for patient ID: ${patientId}`);
    
    const assignment = await PatientAssignment.findOne({
      patient: patientId,
      active: true
    })
      .populate('hospital', 'name location address city state zipCode phone email')
      .populate('doctors', 'name email profile.specialization profile.phone')
      .populate('primaryDoctor', 'name email profile.specialization profile.phone');

    if (!assignment) {
      console.log(`No active assignment found for patient ID: ${patientId}`);
      // Return 200 status with assigned: false to make it easier for frontend to handle
      return res.status(200).json({ 
        assigned: false,
        message: 'No active assignment found' 
      });
    }

    // Add the assigned field to the response
    const response = assignment.toObject();
    response.assigned = true;
    
    console.log(`Found assignment for patient ID: ${patientId}`, {
      assignmentId: response._id,
      hasHospital: !!response.hospital,
      hasPrimaryDoctor: !!response.primaryDoctor
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching patient assignment:', error);
    res.status(500).json({ 
      assigned: false,
      message: 'Error fetching assignment', 
      error: error.message 
    });
  }
};

// Get all patients assigned to a doctor
exports.getDoctorAssignments = async (req, res) => {
  try {
    // Get doctor ID from params or from authenticated user
    const doctorId = req.params.doctorId || req.user.id || req.user._id;
    
    console.log(`Looking for assignments for doctor ID: ${doctorId}`);
    
    // Find all active assignments where this doctor is either a primary doctor or in the doctors array
    const assignments = await PatientAssignment.find({
      $or: [
        { primaryDoctor: doctorId },
        { doctors: doctorId }
      ],
      active: true
    })
      .populate({
        path: 'patient',
        select: 'name email profile gender dateOfBirth phone address allergies bloodType',
        populate: {
          path: 'profile',
          select: 'avatar'
        }
      })
      .populate('hospital', 'name location')
      .sort('-updatedAt');

    if (!assignments || assignments.length === 0) {
      console.log(`No active assignments found for doctor ID: ${doctorId}`);
      return res.json([]);
    }
    
    console.log(`Found ${assignments.length} assignments for doctor ID: ${doctorId}`);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching doctor assignments:', error);
    res.status(500).json({ 
      message: 'Error fetching doctor assignments', 
      error: error.message 
    });
  }
};