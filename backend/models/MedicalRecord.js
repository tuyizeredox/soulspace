const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  vitals: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number
  },
  followUp: {
    required: Boolean,
    date: Date,
    notes: String
  }
}, { timestamps: true });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;
