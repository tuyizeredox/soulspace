const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const prescriptionController = require('../controllers/prescriptionController');

// Create new prescription
router.post('/', auth, prescriptionController.createPrescription);

// Get prescriptions for the logged-in patient
router.get('/my-prescriptions', verifyToken, authorizeRoles('patient'), prescriptionController.getMyPrescriptions);

// Get prescriptions for a patient
router.get('/patient/:patientId', auth, prescriptionController.getPatientPrescriptions);

// Get prescriptions created by a doctor
router.get('/doctor/:doctorId', auth, prescriptionController.getDoctorPrescriptions);

// Update prescription status (for pharmacists)
router.put('/:prescriptionId/status', auth, prescriptionController.updatePrescriptionStatus);

// Update prescription
router.put('/:prescriptionId', auth, prescriptionController.updatePrescription);

// Delete prescription
router.delete('/:prescriptionId', auth, prescriptionController.deletePrescription);

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
