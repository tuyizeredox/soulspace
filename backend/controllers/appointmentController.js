const Appointment = require('../models/Appointment');
const User = require('../models/User');
const PatientAssignment = require('../models/PatientAssignment');
const Hospital = require('../models/Hospital');
const { createNotificationForUser } = require('./notificationController');

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, doctorId, notes, rejectionReason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate('doctor')
      .populate('hospital');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const previousStatus = appointment.status;
    const hospitalName = appointment.hospital ? appointment.hospital.name : 'the hospital';
    const doctorName = appointment.doctor ? appointment.doctor.name : 'your doctor';

    // If accepting the appointment
    if (status === 'confirmed') {
      // If patient is new to the hospital
      if (!appointment.patient.hospitalId) {
        console.log(`Confirming appointment for new patient: ${appointment.patient._id}`);

        // Create patient record for the hospital
        await User.findByIdAndUpdate(appointment.patient._id, {
          hospitalId: req.user.hospitalId,
          status: 'active'
        });

        // Send notification to patient about being added to hospital
        await createNotificationForUser({
          userId: appointment.patient._id,
          title: 'Welcome to Our Hospital',
          message: `You have been registered as a patient at ${hospitalName}. Your appointment has been confirmed.`,
          type: 'success',
          priority: 'high',
          actionLink: '/dashboard',
          metadata: {
            appointmentId: appointment._id,
            hospitalId: req.user.hospitalId
          }
        });
      }

      // Always create or update patient assignment when appointment is confirmed
      // Use the doctor from the appointment or the doctorId from the request
      const doctorToAssign = doctorId || appointment.doctor._id;

      // Check if patient already has an assignment
      const existingAssignment = await PatientAssignment.findOne({
        patient: appointment.patient._id,
        hospital: req.user.hospitalId,
        active: true
      });

      if (existingAssignment) {
        // Update existing assignment if needed
        if (!existingAssignment.doctors.includes(doctorToAssign)) {
          existingAssignment.doctors.push(doctorToAssign);
        }
        existingAssignment.primaryDoctor = doctorToAssign;
        await existingAssignment.save();
        console.log(`Updated patient assignment: ${existingAssignment._id}`);
      } else {
        // Create new assignment
        const assignment = new PatientAssignment({
          patient: appointment.patient._id,
          doctors: [doctorToAssign],
          primaryDoctor: doctorToAssign,
          hospital: req.user.hospitalId,
          active: true
        });
        await assignment.save();
        console.log(`Created patient assignment: ${assignment._id}`);
      }
    }

    // Update appointment status
    appointment.status = status;

    // Add notes or rejection reason
    if (status === 'cancelled' && rejectionReason) {
      appointment.notes = rejectionReason;
    } else if (notes) {
      appointment.notes = notes;
    }

    await appointment.save();

    // Send appropriate notification based on status change
    if (status === 'confirmed' && previousStatus === 'pending') {
      // Appointment approved notification
      await createNotificationForUser({
        userId: appointment.patient._id,
        title: 'Appointment Confirmed',
        message: `Your appointment with ${doctorName} on ${new Date(appointment.date).toLocaleDateString()} at ${new Date(appointment.date).toLocaleTimeString()} has been confirmed.`,
        type: 'appointment',
        priority: 'high',
        actionLink: '/appointments',
        metadata: {
          appointmentId: appointment._id,
          status: 'confirmed'
        }
      });
    } else if (status === 'cancelled') {
      // Appointment rejected notification
      await createNotificationForUser({
        userId: appointment.patient._id,
        title: 'Appointment Cancelled',
        message: `Your appointment at ${hospitalName} has been cancelled. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
        type: 'warning',
        priority: 'high',
        actionLink: '/appointments',
        metadata: {
          appointmentId: appointment._id,
          status: 'cancelled'
        }
      });
    } else if (status === 'completed') {
      // Appointment completed notification
      await createNotificationForUser({
        userId: appointment.patient._id,
        title: 'Appointment Completed',
        message: `Your appointment with ${doctorName} has been marked as completed. Thank you for visiting ${hospitalName}.`,
        type: 'info',
        priority: 'normal',
        actionLink: '/appointments',
        metadata: {
          appointmentId: appointment._id,
          status: 'completed'
        }
      });
    }

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient')
      .populate('doctor')
      .populate('hospital');

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

exports.createAppointment = async (req, res) => {
    try {
        const { patient, doctor, date, type, reason, notes } = req.body;

        // Validate required fields
        if (!patient || !doctor || !date || !type || !reason) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create new appointment
        const appointment = new Appointment({
            patient: patient,
            doctor: doctor,
            hospital: req.user.hospitalId,
            date: new Date(date),
            type,
            reason,
            notes,
            status: 'pending'
        });

        await appointment.save();

        // Fetch the populated appointment to return
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patient', 'name email')
            .populate('doctor', 'name')
            .populate('hospital', 'name');

        // Send notification to the patient
        const patientUser = await User.findById(patient);
        if (patientUser) {
            const doctorUser = await User.findById(doctor);
            const doctorName = doctorUser ? doctorUser.name : 'the doctor';
            const hospital = await Hospital.findById(req.user.hospitalId);
            const hospitalName = hospital ? hospital.name : 'our hospital';

            await createNotificationForUser({
                userId: patient,
                title: 'New Appointment Created',
                message: `Your appointment with ${doctorName} at ${hospitalName} has been scheduled for ${new Date(date).toLocaleDateString()} at ${new Date(date).toLocaleTimeString()}.`,
                type: 'appointment',
                priority: 'normal',
                actionLink: '/appointments',
                metadata: {
                    appointmentId: appointment._id,
                    status: 'pending'
                }
            });
        }

        res.status(201).json(populatedAppointment);
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Error creating appointment', error: error.message });
    }
};

// Function for patients to create appointments
exports.createPatientAppointment = async (req, res) => {
    try {
        const { patient: patientFromBody, doctor, hospital, date, time, type, reason, isOnline, wearableDevice, pharmacy, insuranceInfo } = req.body;

        // Get patient ID from authenticated user or request body
        const patientId = patientFromBody || req.user.id;

        console.log('Creating appointment for patient ID:', patientId);
        console.log('Patient ID from token:', req.user.id);
        console.log('Patient ID from request body:', patientFromBody);
        console.log('User info from token:', req.user);
        console.log('Appointment data:', { doctor, hospital, date, time, type, reason });

        // Ensure we have a valid patient ID
        if (!patientId) {
            return res.status(400).json({ message: 'No patient ID provided' });
        }

        // Convert string ID to ObjectId if needed
        const mongoose = require('mongoose');
        let patient;

        try {
            patient = new mongoose.Types.ObjectId(patientId);
        } catch (err) {
            console.error('Invalid patient ID format:', patientId);
            return res.status(400).json({ message: 'Invalid patient ID format' });
        }

        console.log('Using patient ObjectId:', patient);

        // Validate required fields
        if (!patient || !doctor || !hospital || !date || !type || !reason) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate insurance information
        if (!insuranceInfo) {
            return res.status(400).json({ message: 'Insurance information is required' });
        }

        // Convert doctor and hospital IDs to ObjectId
        let doctorObjectId, hospitalObjectId;

        try {
            doctorObjectId = new mongoose.Types.ObjectId(doctor);
        } catch (err) {
            console.error('Invalid doctor ID format:', doctor);
            return res.status(400).json({ message: 'Invalid doctor ID format' });
        }

        try {
            hospitalObjectId = new mongoose.Types.ObjectId(hospital);
        } catch (err) {
            console.error('Invalid hospital ID format:', hospital);
            return res.status(400).json({ message: 'Invalid hospital ID format' });
        }

        console.log('Using doctor ObjectId:', doctorObjectId);
        console.log('Using hospital ObjectId:', hospitalObjectId);

        // Create appointment date by combining date and time
        let appointmentDate = new Date(date);
        if (time) {
            const [hours, minutes] = time.split(':');
            appointmentDate.setHours(parseInt(hours, 10));
            appointmentDate.setMinutes(parseInt(minutes, 10));
        }

        // Create new appointment
        const appointment = new Appointment({
            patient: patient,
            doctor: doctorObjectId,
            hospital: hospitalObjectId,
            date: appointmentDate,
            type,
            reason,
            notes: JSON.stringify({
                isOnline,
                wearableDevice,
                pharmacy,
                insuranceInfo
            }),
            status: 'pending'
        });

        console.log('Saving appointment with patient ID:', patient);
        await appointment.save();
        console.log('Appointment saved with ID:', appointment._id);

        // Fetch the populated appointment to return
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patient', 'name email')
            .populate('doctor', 'name')
            .populate('hospital', 'name');

        console.log('Populated appointment:', {
            id: populatedAppointment._id,
            patient: populatedAppointment.patient?._id || 'No patient ID',
            patientName: populatedAppointment.patient?.name || 'No patient name',
            status: populatedAppointment.status
        });

        // Get doctor and hospital information for notification
        const doctorUser = await User.findById(doctor);
        const doctorName = doctorUser ? doctorUser.name : 'the doctor';

        const hospitalDoc = await Hospital.findById(hospital);
        const hospitalName = hospitalDoc ? hospitalDoc.name : 'the hospital';

        // Send notification to the patient
        await createNotificationForUser({
            userId: patient,
            title: 'Appointment Booked Successfully',
            message: `Your appointment with ${doctorName} at ${hospitalName} has been scheduled for ${new Date(appointmentDate).toLocaleDateString()} at ${new Date(appointmentDate).toLocaleTimeString()}.`,
            type: 'appointment',
            priority: 'normal',
            actionLink: '/appointments',
            metadata: {
                appointmentId: appointment._id,
                status: 'pending'
            }
        });

        // Send notification to the hospital admin
        if (hospitalDoc && hospitalDoc.adminId) {
            await createNotificationForUser({
                userId: hospitalDoc.adminId,
                title: 'New Appointment Request',
                message: `A new appointment has been requested with ${doctorName} for ${new Date(appointmentDate).toLocaleDateString()} at ${new Date(appointmentDate).toLocaleTimeString()}.`,
                type: 'appointment',
                priority: 'high',
                actionLink: '/hospital/appointments',
                metadata: {
                    appointmentId: appointment._id,
                    status: 'pending'
                }
            });
        }

        res.status(201).json(populatedAppointment);
    } catch (error) {
        console.error('Error creating patient appointment:', error);
        res.status(500).json({ message: 'Error booking appointment', error: error.message });
    }
};

exports.getHospitalAppointments = async (req, res) => {
    try {
        // Get query parameters for filtering
        const { status, startDate, endDate, doctorId, search } = req.query;

        // Build query
        const query = { hospital: req.user.hospitalId };

        // Add filters if provided
        if (status && status !== 'all') {
            query.status = status;
        }

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate) {
            query.date = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.date = { $lte: new Date(endDate) };
        }

        if (doctorId) {
            query.doctor = doctorId;
        }

        // Fetch appointments with populated references
        let appointmentsQuery = Appointment.find(query)
            .populate('patient', 'name email phone')
            .populate('doctor', 'name profile.specialization')
            .populate('hospital', 'name')
            .sort({ date: 1 }); // Sort by date ascending

        // Execute query
        const appointments = await appointmentsQuery;

        // If search parameter is provided, filter results in memory
        // This is a simple implementation - for production, consider using MongoDB text search
        let filteredAppointments = appointments;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredAppointments = appointments.filter(apt =>
                (apt.patient?.name && apt.patient.name.toLowerCase().includes(searchLower)) ||
                (apt.doctor?.name && apt.doctor.name.toLowerCase().includes(searchLower)) ||
                (apt.type && apt.type.toLowerCase().includes(searchLower)) ||
                (apt.reason && apt.reason.toLowerCase().includes(searchLower))
            );
        }

        // Transform data for frontend
        const formattedAppointments = filteredAppointments.map(apt => ({
            id: apt._id,
            patient: apt.patient,
            doctor: apt.doctor,
            patientName: apt.patient?.name || 'Unknown Patient',
            doctorName: apt.doctor?.name || 'Unknown Doctor',
            date: apt.date,
            type: apt.type,
            reason: apt.reason,
            notes: apt.notes,
            status: apt.status,
            createdAt: apt.createdAt
        }));

        res.json(formattedAppointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};

exports.manageAppointment = async (req, res) => {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
};

// Get appointments for the authenticated patient
exports.getPatientAppointments = async (req, res) => {
    try {
        // Get patient ID from query parameter or from authenticated user
        const patientId = req.query.patientId || req.user.id;

        console.log('Getting appointments for patient ID:', patientId);
        console.log('User info from token:', req.user);
        console.log('Patient ID from query:', req.query.patientId);

        // Ensure we have a valid patient ID
        if (!patientId) {
            return res.status(400).json({ message: 'No patient ID provided' });
        }

        // Convert string ID to ObjectId if needed
        const mongoose = require('mongoose');
        let patientObjectId;

        try {
            patientObjectId = new mongoose.Types.ObjectId(patientId);
        } catch (err) {
            console.error('Invalid patient ID format:', patientId);
            return res.status(400).json({ message: 'Invalid patient ID format' });
        }

        console.log('Using patient ObjectId:', patientObjectId);

        // Fetch appointments for the patient
        const appointments = await Appointment.find({ patient: patientObjectId })
            .sort({ date: -1 }) // Sort by date descending (newest first)
            .populate('doctor', 'name email profile.specialization')
            .populate('hospital', 'name location');

        console.log('Found appointments:', appointments.length);

        // Format appointments for frontend
        const formattedAppointments = appointments.map(apt => {
            // Parse additional data from notes if available
            let additionalData = {};
            try {
                if (apt.notes && typeof apt.notes === 'string' && apt.notes.startsWith('{')) {
                    additionalData = JSON.parse(apt.notes);
                }
            } catch (e) {
                console.error('Error parsing appointment notes:', e);
            }

            return {
                id: apt._id,
                doctor: apt.doctor,
                hospital: apt.hospital,
                doctorName: apt.doctor?.name || 'Unknown Doctor',
                hospitalName: apt.hospital?.name || 'Unknown Hospital',
                date: apt.date,
                type: apt.type,
                reason: apt.reason,
                status: apt.status,
                isOnline: additionalData.isOnline || false,
                wearableDevice: additionalData.wearableDevice || null,
                pharmacy: additionalData.pharmacy || null,
                insuranceInfo: additionalData.insuranceInfo || null,
                createdAt: apt.createdAt
            };
        });

        res.json(formattedAppointments);
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        // First find the appointment to get patient info for notification
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'name')
            .populate('doctor', 'name')
            .populate('hospital', 'name');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Store patient ID for notification
        const patientId = appointment.patient?._id;
        const appointmentDate = new Date(appointment.date).toLocaleDateString();
        const appointmentTime = new Date(appointment.date).toLocaleTimeString();
        const doctorName = appointment.doctor?.name || 'the doctor';
        const hospitalName = appointment.hospital?.name || 'our hospital';

        // Delete the appointment
        await Appointment.findByIdAndDelete(req.params.id);

        // Send notification to patient about deletion
        if (patientId) {
            await createNotificationForUser({
                userId: patientId,
                title: 'Appointment Cancelled',
                message: `Your appointment with ${doctorName} at ${hospitalName} scheduled for ${appointmentDate} at ${appointmentTime} has been cancelled.`,
                type: 'warning',
                priority: 'high',
                actionLink: '/appointments',
                metadata: {
                    status: 'deleted'
                }
            });
        }

        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ message: 'Error deleting appointment', error: error.message });
    }
};