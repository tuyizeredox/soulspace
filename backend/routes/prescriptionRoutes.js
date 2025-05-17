const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const Prescription = require('../models/Prescription');
const PatientAssignment = require('../models/PatientAssignment');

// Create new prescription
router.post('/', auth, async (req, res) => {
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

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get prescriptions for the logged-in patient
router.get('/my-prescriptions', verifyToken, authorizeRoles('patient'), async (req, res) => {
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
});

// Get prescriptions for a patient
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.params.patientId })
      .populate('doctor', 'name email specialization')
      .populate('pharmacist', 'name email')
      .populate('hospital', 'name location')
      .sort('-createdAt');

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get prescriptions created by a doctor
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.params.doctorId })
      .populate('patient', 'name email profile')
      .populate('pharmacist', 'name email')
      .populate('hospital', 'name location')
      .sort('-createdAt');

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update prescription status (for pharmacists)
router.put('/:prescriptionId/status', auth, async (req, res) => {
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

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify insurance and update payment status
router.put('/:prescriptionId/insurance', auth, async (req, res) => {
  try {
    if (!['hospital_admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to verify insurance' });
    }

    const { insuranceDetails, paymentStatus } = req.body;
    const prescription = await Prescription.findById(req.params.prescriptionId);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.insuranceDetails = {
      ...prescription.insuranceDetails,
      ...insuranceDetails,
      verified: true
    };
    prescription.paymentStatus = paymentStatus;
    await prescription.save();

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update delivery status
router.put('/:prescriptionId/delivery', auth, async (req, res) => {
  try {
    if (req.user.role !== 'pharmacist') {
      return res.status(403).json({ message: 'Only pharmacists can update delivery status' });
    }

    const { deliveryOption, deliveryAddress } = req.body;
    const prescription = await Prescription.findById(req.params.prescriptionId);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.deliveryOption = deliveryOption;
    if (deliveryOption === 'delivery') {
      prescription.deliveryAddress = deliveryAddress;
    }
    await prescription.save();

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
