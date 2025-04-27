const Prescription = require('../models/Prescription');

exports.createPrescription = async (req, res) => {
    const { patientId, doctorId, medication, dosage } = req.body;
    const prescription = new Prescription({ patientId, doctorId, medication, dosage });
    await prescription.save();
    res.status(201).json({ prescription });
};

exports.getPrescriptions = async (req, res) => {
    const prescriptions = await Prescription.find().populate('patientId').populate('doctorId');
    res.json(prescriptions);
};
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getHospitalPharmacists = async (req, res) => {
  try {
    const pharmacists = await User.find({
      role: 'pharmacist',
      hospitalId: req.user.hospitalId
    }).select('-password');

    const formattedPharmacists = pharmacists.map(pharmacist => ({
      id: pharmacist._id,
      name: pharmacist.name,
      email: pharmacist.email,
      phone: pharmacist.profile?.phone,
      licenseNumber: pharmacist.profile?.licenseNumber,
      status: pharmacist.status || 'Active'
    }));

    res.json(formattedPharmacists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pharmacists', error: error.message });
  }
};

exports.createPharmacist = async (req, res) => {
  try {
    const { name, email, phone, licenseNumber, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const pharmacist = new User({
      name,
      email,
      password: hashedPassword,
      role: 'pharmacist',
      hospitalId: req.user.hospitalId,
      profile: {
        phone,
        licenseNumber
      }
    });

    await pharmacist.save();
    res.status(201).json({
      id: pharmacist._id,
      name: pharmacist.name,
      email: pharmacist.email,
      phone: pharmacist.profile.phone,
      licenseNumber: pharmacist.profile.licenseNumber
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating pharmacist', error: error.message });
  }
};

exports.updatePharmacist = async (req, res) => {
  try {
    const { name, email, phone, licenseNumber } = req.body;
    const pharmacist = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        'profile.phone': phone,
        'profile.licenseNumber': licenseNumber
      },
      { new: true }
    ).select('-password');

    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    res.json({
      id: pharmacist._id,
      name: pharmacist.name,
      email: pharmacist.email,
      phone: pharmacist.profile.phone,
      licenseNumber: pharmacist.profile.licenseNumber
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating pharmacist', error: error.message });
  }
};

exports.deletePharmacist = async (req, res) => {
  try {
    const pharmacist = await User.findByIdAndDelete(req.params.id);
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    res.status(200).json({ message: 'Pharmacist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting pharmacist', error: error.message });
  }
};