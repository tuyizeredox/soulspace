const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const PatientAssignment = require('../models/PatientAssignment');

// Get recent medical records for the logged-in doctor
exports.getRecentMedicalRecords = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const records = await MedicalRecord.find({
      doctor: doctorId
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('patient', 'name');

    // Format records
    const formattedRecords = records.map(record => ({
      id: record._id,
      patientName: record.patient ? record.patient.name : 'Unknown Patient',
      patientId: record.patient ? record.patient._id : null,
      diagnosis: record.diagnosis,
      date: record.createdAt,
      notes: record.notes
    }));

    res.json(formattedRecords);
  } catch (error) {
    console.error('Error fetching recent medical records:', error);
    res.status(500).json({ message: 'Error fetching medical records', error: error.message });
  }
};

// Get all medical records for a patient
exports.getPatientMedicalRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;

    // Ensure the doctor has access to this patient's records
    const records = await MedicalRecord.find({
      patient: patientId,
      doctor: doctorId
    })
    .sort({ createdAt: -1 })
    .populate('patient', 'name')
    .populate('doctor', 'name');

    // Format records
    const formattedRecords = records.map(record => ({
      id: record._id,
      patientName: record.patient ? record.patient.name : 'Unknown Patient',
      doctorName: record.doctor ? record.doctor.name : 'Unknown Doctor',
      diagnosis: record.diagnosis,
      date: record.createdAt,
      notes: record.notes,
      medications: record.medications,
      vitals: record.vitals,
      followUp: record.followUp
    }));

    res.json(formattedRecords);
  } catch (error) {
    console.error('Error fetching patient medical records:', error);
    res.status(500).json({ message: 'Error fetching medical records', error: error.message });
  }
};

// Create a new medical record
exports.createMedicalRecord = async (req, res) => {
  try {
    const {
      patientId,
      diagnosis,
      notes,
      medications,
      vitals,
      followUp,
      attachments
    } = req.body;

    const doctorId = req.user.id;
    const hospitalId = req.user.hospitalId;

    // Validate required fields
    if (!patientId || !diagnosis) {
      return res.status(400).json({ message: 'Patient ID and diagnosis are required' });
    }

    // Create new medical record
    const medicalRecord = new MedicalRecord({
      patient: patientId,
      doctor: doctorId,
      hospital: hospitalId,
      diagnosis,
      notes,
      medications,
      vitals,
      followUp,
      attachments
    });

    await medicalRecord.save();

    // Return the created record
    res.status(201).json(medicalRecord);
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({ message: 'Error creating medical record', error: error.message });
  }
};

// Update a medical record
exports.updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      diagnosis,
      notes,
      medications,
      vitals,
      followUp,
      attachments
    } = req.body;

    const doctorId = req.user.id;

    // Find the record and ensure it belongs to this doctor
    const record = await MedicalRecord.findOne({
      _id: id,
      doctor: doctorId
    });

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Update fields
    if (diagnosis) record.diagnosis = diagnosis;
    if (notes) record.notes = notes;
    if (medications) record.medications = medications;
    if (vitals) record.vitals = vitals;
    if (followUp) record.followUp = followUp;
    if (attachments) record.attachments = attachments;

    await record.save();

    // Return the updated record
    res.json(record);
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({ message: 'Error updating medical record', error: error.message });
  }
};

// Get medical records for the logged-in patient
exports.getMyMedicalRecords = async (req, res) => {
  try {
    const patientId = req.user.id;

    // Find the patient's assignment to get their doctor
    const assignment = await PatientAssignment.findOne({
      patient: patientId,
      assigned: true
    });

    if (!assignment) {
      return res.status(404).json({ message: 'No doctor assignment found' });
    }

    // Get all medical records for this patient
    const records = await MedicalRecord.find({
      patient: patientId
    })
    .sort({ createdAt: -1 })
    .populate('doctor', 'name')
    .populate('hospital', 'name');

    // Format records
    const formattedRecords = records.map(record => ({
      id: record._id,
      doctorName: record.doctor ? record.doctor.name : 'Unknown Doctor',
      hospitalName: record.hospital ? record.hospital.name : 'Unknown Hospital',
      diagnosis: record.diagnosis,
      date: record.createdAt,
      notes: record.notes,
      medications: record.medications,
      vitals: record.vitals,
      followUp: record.followUp,
      attachments: record.attachments
    }));

    res.json(formattedRecords);
  } catch (error) {
    console.error('Error fetching patient medical records:', error);
    res.status(500).json({ message: 'Error fetching medical records', error: error.message });
  }
};