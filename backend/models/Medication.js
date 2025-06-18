const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  commonDosages: [{
    type: String,
    trim: true
  }],
  sideEffects: [{
    type: String,
    trim: true
  }],
  contraindications: [{
    type: String,
    trim: true
  }],
  interactions: [{
    type: String,
    trim: true
  }],
  requiresPrescription: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Medication', medicationSchema);