const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

exports.createPatient = async (req, res) => {
    const { name, email, phone, medicalHistory, assignedDoctor, hospitalId } = req.body;
    const patient = new Patient({ name, email, phone, medicalHistory, assignedDoctor, hospitalId });
    await patient.save();
    res.status(201).json({ patient });
};

exports.getPatients = async (req, res) => {
    const patients = await Patient.find().populate('assignedDoctor').populate('hospitalId');
    res.json(patients);
};

exports.getPatientById = async (req, res) => {
    const patient = await Patient.findById(req.params.id).populate('assignedDoctor').populate('hospitalId');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
};

exports.getPatientAppointments = async (req, res) => {
    const appointments = await Appointment.find({ patientId: req.user.id }).populate('doctorId').populate('hospitalId');
    res.json(appointments);
};

exports.getHospitalPatients = async (req, res) => {
    try {
        const patients = await Patient.find({ hospitalId: req.user.hospitalId })
            .populate('assignedDoctor')
            .populate('hospitalId');
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hospital patients', error: error.message });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const { name, email, phone, medicalHistory, assignedDoctor } = req.body;
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, medicalHistory, assignedDoctor },
            { new: true }
        ).populate('assignedDoctor').populate('hospitalId');
        
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error updating patient', error: error.message });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting patient', error: error.message });
    }
};