const Prescription = require('../models/Prescription');
const PatientAssignment = require('../models/PatientAssignment');
const User = require('../models/User');
const { createNotificationForUser } = require('../utils/notificationHelper');

/**
 * Create a new prescription
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createPrescription = async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create prescriptions' });
    }

    // Verify doctor is assigned to patient
    const assignment = await PatientAssignment.findOne({
      doctors: req.user._id,
      patient: req.body.patient,
      active: true
    });

    if (!assignment) {
      return res.status(403).json({ message: 'Not authorized to prescribe for this patient' });
    }

    const prescription = new Prescription({
      ...req.body,
      doctor: req.user._id,
      hospital: assignment.hospital
    });

    await prescription.save();

    // Send notification to patient
    try {
      const patient = await User.findById(req.body.patient);
      if (patient) {
        await createNotificationForUser({
          userId: patient._id,
          title: 'New Prescription Created',
          message: `Dr. ${req.user.name} has created a new prescription for you. Please check your prescriptions for details.`,
          type: 'info',
          priority: req.body.priority === 'high' ? 'high' : 'medium',
          actionLink: '/prescriptions',
          metadata: {
            prescriptionId: prescription._id,
            diagnosis: req.body.diagnosis,
            medicationCount: req.body.medications.length
          }
        });
      }
    } catch (notificationError) {
      console.error('Error sending notification to patient:', notificationError);
      // Continue even if notification fails
    }

    res.status(201).json(prescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get prescriptions for the logged-in patient
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getMyPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.id;

    // Find prescriptions for this patient
    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('doctor', 'name email specialization')
      .populate('pharmacist', 'name email')
      .populate('hospital', 'name location')
      .sort('-createdAt');

    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
};

/**
 * Get prescriptions for a patient
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getPatientPrescriptions = async (req, res) => {
  try {
    // Check if user is authorized to view this patient's prescriptions
    if (req.user.role !== 'doctor' && req.user.role !== 'admin' && req.user.role !== 'pharmacist') {
      // If not a doctor/admin/pharmacist, check if user is the patient
      if (req.user._id.toString() !== req.params.patientId) {
        return res.status(403).json({ message: 'Not authorized to view these prescriptions' });
      }
    }

    const prescriptions = await Prescription.find({ patient: req.params.patientId })
      .populate('doctor', 'name email specialization')
      .populate('pharmacist', 'name email')
      .populate('hospital', 'name location')
      .sort('-createdAt');

    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get prescriptions created by a doctor
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    // Check if user is authorized to view these prescriptions
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.doctorId) {
      return res.status(403).json({ message: 'Not authorized to view these prescriptions' });
    }

    const prescriptions = await Prescription.find({ doctor: req.params.doctorId })
      .populate('patient', 'name email profile')
      .populate('pharmacist', 'name email')
      .populate('hospital', 'name location')
      .sort('-createdAt');

    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching doctor prescriptions:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update prescription status (for pharmacists)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    if (req.user.role !== 'pharmacist') {
      return res.status(403).json({ message: 'Only pharmacists can update prescription status' });
    }

    const { status } = req.body;
    const prescription = await Prescription.findById(req.params.prescriptionId);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.status = status;
    prescription.pharmacist = req.user._id;
    await prescription.save();

    // Send notification to patient about status update
    try {
      await createNotificationForUser({
        userId: prescription.patient,
        title: 'Prescription Status Updated',
        message: `Your prescription status has been updated to: ${status}`,
        type: 'info',
        priority: 'medium',
        actionLink: '/prescriptions',
        metadata: {
          prescriptionId: prescription._id,
          status
        }
      });
    } catch (notificationError) {
      console.error('Error sending notification to patient:', notificationError);
      // Continue even if notification fails
    }

    res.json(prescription);
  } catch (error) {
    console.error('Error updating prescription status:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update prescription
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updatePrescription = async (req, res) => {
  try {
    // Only doctors who created the prescription can update it
    const prescription = await Prescription.findById(req.params.prescriptionId);
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    if (req.user.role !== 'doctor' || prescription.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this prescription' });
    }
    
    // Update only allowed fields
    const allowedUpdates = ['diagnosis', 'medications', 'notes', 'status'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.prescriptionId,
      updates,
      { new: true, runValidators: true }
    )
    .populate('doctor', 'name email specialization')
    .populate('patient', 'name email profile')
    .populate('hospital', 'name location');
    
    // Send notification to patient about prescription update
    try {
      await createNotificationForUser({
        userId: prescription.patient,
        title: 'Prescription Updated',
        message: `Dr. ${req.user.name} has updated your prescription.`,
        type: 'info',
        priority: 'medium',
        actionLink: '/prescriptions',
        metadata: {
          prescriptionId: prescription._id
        }
      });
    } catch (notificationError) {
      console.error('Error sending notification to patient:', notificationError);
      // Continue even if notification fails
    }
    
    res.json(updatedPrescription);
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete prescription
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.prescriptionId);
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Only doctors who created the prescription or admins can delete it
    if (req.user.role !== 'admin' && 
        (req.user.role !== 'doctor' || prescription.doctor.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to delete this prescription' });
    }
    
    await Prescription.findByIdAndDelete(req.params.prescriptionId);
    
    // Send notification to patient about prescription deletion
    try {
      await createNotificationForUser({
        userId: prescription.patient,
        title: 'Prescription Cancelled',
        message: `Your prescription has been cancelled by Dr. ${req.user.name}.`,
        type: 'warning',
        priority: 'medium',
        actionLink: '/prescriptions',
        metadata: {
          prescriptionId: prescription._id
        }
      });
    } catch (notificationError) {
      console.error('Error sending notification to patient:', notificationError);
      // Continue even if notification fails
    }
    
    res.status(200).json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ message: error.message });
  }
};