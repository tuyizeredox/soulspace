const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const PatientAssignment = require('../models/PatientAssignment');
const mongoose = require('mongoose');

exports.createPatient = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            dateOfBirth,
            gender,
            address,
            medicalHistory,
            emergencyContact,
            insuranceProvider,
            insuranceNumber,
            assignedDoctor
        } = req.body;

        // Check if patient with this email already exists
        const existingPatient = await User.findOne({ email, role: 'patient' });
        if (existingPatient) {
            return res.status(400).json({ message: 'A patient with this email already exists' });
        }

        // Create new patient as a User with role 'patient'
        const patient = new User({
            name,
            email,
            phone,
            role: 'patient',
            hospitalId: req.user.hospitalId,
            status: 'active',
            profile: {
                dateOfBirth,
                gender,
                address,
                medicalHistory,
                emergencyContact,
                insuranceProvider,
                insuranceNumber
            }
        });

        await patient.save();

        // If doctor is assigned, create patient assignment
        if (assignedDoctor) {
            const assignment = new PatientAssignment({
                patient: patient._id,
                doctors: [assignedDoctor],
                primaryDoctor: assignedDoctor,
                hospital: req.user.hospitalId,
                active: true
            });

            await assignment.save();
        }

        // Return the created patient with populated fields
        const populatedPatient = await User.findById(patient._id)
            .select('-password')
            .populate({
                path: 'hospitalId',
                select: 'name location'
            });

        res.status(201).json(populatedPatient);
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({ message: 'Error creating patient', error: error.message });
    }
};

exports.getPatients = async (req, res) => {
    try {
        // Get all patients (for super admin)
        const patients = await User.find({ role: 'patient' })
            .select('-password')
            .populate({
                path: 'hospitalId',
                select: 'name location'
            });

        res.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Error fetching patients', error: error.message });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const patientId = req.params.id;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ message: 'Invalid patient ID format' });
        }

        // Get patient details
        const patient = await User.findOne({ _id: patientId, role: 'patient' })
            .select('-password')
            .populate({
                path: 'hospitalId',
                select: 'name location'
            });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Get patient's assignment (doctors)
        const assignment = await PatientAssignment.findOne({
            patient: patientId,
            hospital: req.user.hospitalId,
            active: true
        })
        .populate({
            path: 'doctors',
            select: 'name email profile.specialization'
        })
        .populate({
            path: 'primaryDoctor',
            select: 'name email profile.specialization'
        });

        // Get patient's appointments
        const appointments = await Appointment.find({
            patient: patientId,
            hospital: req.user.hospitalId
        })
        .sort({ date: -1 })
        .limit(5)
        .populate({
            path: 'doctor',
            select: 'name profile.specialization'
        });

        // Combine all data
        const patientData = {
            ...patient.toObject(),
            assignment: assignment || null,
            appointments: appointments || []
        };

        res.json(patientData);
    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({ message: 'Error fetching patient details', error: error.message });
    }
};

exports.getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.params.id || req.user.id;

        const appointments = await Appointment.find({ patient: patientId })
            .sort({ date: -1 })
            .populate({
                path: 'doctor',
                select: 'name email profile.specialization'
            })
            .populate({
                path: 'hospital',
                select: 'name location'
            });

        res.json(appointments);
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({ message: 'Error fetching patient appointments', error: error.message });
    }
};

exports.getHospitalPatients = async (req, res) => {
    try {
        // Get query parameters for filtering
        const { search, status, doctorId, sort = 'name', order = 'asc' } = req.query;

        // Build query
        const query = {
            role: 'patient',
            hospitalId: req.user.hospitalId
        };

        // Add status filter if provided
        if (status && status !== 'all') {
            query.status = status;
        }

        // Get all patients for this hospital
        let patients = await User.find(query)
            .select('-password')
            .sort({ [sort]: order === 'asc' ? 1 : -1 });

        // If search parameter is provided, filter results
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            patients = patients.filter(patient =>
                searchRegex.test(patient.name) ||
                searchRegex.test(patient.email) ||
                searchRegex.test(patient.phone)
            );
        }

        // If doctorId is provided, filter by assigned doctor
        if (doctorId) {
            // Get all assignments for this doctor
            const assignments = await PatientAssignment.find({
                doctors: doctorId,
                hospital: req.user.hospitalId,
                active: true
            });

            // Filter patients by these assignments
            const patientIds = assignments.map(a => a.patient.toString());
            patients = patients.filter(p => patientIds.includes(p._id.toString()));
        }

        // Get assignments for all patients to include doctor information
        const patientIds = patients.map(p => p._id);
        const assignments = await PatientAssignment.find({
            patient: { $in: patientIds },
            hospital: req.user.hospitalId,
            active: true
        })
        .populate({
            path: 'primaryDoctor',
            select: 'name profile.specialization'
        });

        // Create a map of patient ID to assignment for quick lookup
        const assignmentMap = {};
        assignments.forEach(assignment => {
            assignmentMap[assignment.patient.toString()] = assignment;
        });

        // Enhance patient data with assignment information
        const enhancedPatients = patients.map(patient => {
            const patientObj = patient.toObject();
            const assignment = assignmentMap[patient._id.toString()];

            return {
                ...patientObj,
                primaryDoctor: assignment?.primaryDoctor || null,
                assignmentId: assignment?._id || null
            };
        });

        res.json(enhancedPatients);
    } catch (error) {
        console.error('Error fetching hospital patients:', error);
        res.status(500).json({ message: 'Error fetching hospital patients', error: error.message });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const patientId = req.params.id;
        const {
            name,
            email,
            phone,
            dateOfBirth,
            gender,
            address,
            medicalHistory,
            emergencyContact,
            insuranceProvider,
            insuranceNumber,
            status,
            assignedDoctor
        } = req.body;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ message: 'Invalid patient ID format' });
        }

        // Find the patient
        const patient = await User.findOne({
            _id: patientId,
            role: 'patient',
            hospitalId: req.user.hospitalId
        });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Check if email is being changed and if it's already in use
        if (email !== patient.email) {
            const existingPatient = await User.findOne({ email, role: 'patient', _id: { $ne: patientId } });
            if (existingPatient) {
                return res.status(400).json({ message: 'A patient with this email already exists' });
            }
        }

        // Update basic patient information
        patient.name = name || patient.name;
        patient.email = email || patient.email;
        patient.phone = phone || patient.phone;
        patient.status = status || patient.status;

        // Update profile information
        patient.profile = {
            ...patient.profile,
            dateOfBirth: dateOfBirth || patient.profile?.dateOfBirth,
            gender: gender || patient.profile?.gender,
            address: address || patient.profile?.address,
            medicalHistory: medicalHistory || patient.profile?.medicalHistory,
            emergencyContact: emergencyContact || patient.profile?.emergencyContact,
            insuranceProvider: insuranceProvider || patient.profile?.insuranceProvider,
            insuranceNumber: insuranceNumber || patient.profile?.insuranceNumber,
            updatedAt: new Date()
        };

        await patient.save();

        // Handle doctor assignment if provided
        if (assignedDoctor) {
            // Check if patient already has an assignment
            let assignment = await PatientAssignment.findOne({
                patient: patientId,
                hospital: req.user.hospitalId,
                active: true
            });

            if (assignment) {
                // Update existing assignment
                if (!assignment.doctors.includes(assignedDoctor)) {
                    assignment.doctors.push(assignedDoctor);
                }
                assignment.primaryDoctor = assignedDoctor;
                await assignment.save();
            } else {
                // Create new assignment
                assignment = new PatientAssignment({
                    patient: patientId,
                    doctors: [assignedDoctor],
                    primaryDoctor: assignedDoctor,
                    hospital: req.user.hospitalId,
                    active: true
                });
                await assignment.save();
            }
        }

        // Return updated patient with populated fields
        const updatedPatient = await User.findById(patientId)
            .select('-password')
            .populate({
                path: 'hospitalId',
                select: 'name location'
            });

        // Get assignment information
        const assignment = await PatientAssignment.findOne({
            patient: patientId,
            hospital: req.user.hospitalId,
            active: true
        })
        .populate({
            path: 'primaryDoctor',
            select: 'name email profile.specialization'
        });

        // Combine data
        const responseData = {
            ...updatedPatient.toObject(),
            primaryDoctor: assignment?.primaryDoctor || null,
            assignmentId: assignment?._id || null
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ message: 'Error updating patient', error: error.message });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const patientId = req.params.id;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ message: 'Invalid patient ID format' });
        }

        // Find the patient
        const patient = await User.findOne({
            _id: patientId,
            role: 'patient',
            hospitalId: req.user.hospitalId
        });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Option 1: Hard delete - completely remove the patient
        // await User.findByIdAndDelete(patientId);

        // Option 2: Soft delete - mark as inactive (preferred approach)
        patient.status = 'inactive';
        await patient.save();

        // Remove any active assignments
        await PatientAssignment.updateMany(
            { patient: patientId, hospital: req.user.hospitalId },
            { active: false }
        );

        res.json({ message: 'Patient removed successfully' });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ message: 'Error deleting patient', error: error.message });
    }
};