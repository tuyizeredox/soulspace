const Appointment = require('../models/Appointment');
const User = require('../models/User');
const PatientAssignment = require('../models/PatientAssignment');

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, doctorId, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate('doctor');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // If accepting the appointment and patient is new
    if (status === 'confirmed' && !appointment.patient.hospitalId) {
      // Create patient record for the hospital
      await User.findByIdAndUpdate(appointment.patient._id, {
        hospitalId: req.user.hospitalId,
        status: 'active'
      });

      // Create patient assignment
      const assignment = new PatientAssignment({
        patient: appointment.patient._id,
        doctors: [doctorId],
        primaryDoctor: doctorId,
        hospital: req.user.hospitalId,
        active: true
      });

      await assignment.save();
    }

    appointment.status = status;
    appointment.notes = notes;
    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient')
      .populate('doctor');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

exports.createAppointment = async (req, res) => {
    const { patientId, doctorId, hospitalId, date, type } = req.body;
    const appointment = new Appointment({ patientId, doctorId, hospitalId, date, type });
    await appointment.save();
    res.status(201).json({ appointment });
};

exports.getHospitalAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ hospitalId: req.user.hospitalId })
            .populate('patient')
            .populate('doctor');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};

exports.manageAppointment = async (req, res) => {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
};

exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting appointment', error: error.message });
    }
};