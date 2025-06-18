const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
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
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    quantity: { type: String, required: true },
    notes: String
  }],
  diagnosis: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'medium', 'high'],
    default: 'normal'
  },
  followUpDate: {
    type: Date
  },
  insuranceDetails: {
    provider: String,
    policyNumber: String,
    coverage: String,
    verified: { type: Boolean, default: false }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processed', 'completed'],
    default: 'pending'
  },
  deliveryOption: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'dispensed', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  pharmacist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  refillsRemaining: {
    type: Number,
    default: 0,
    min: 0
  },
  refillHistory: [{
    date: Date,
    pharmacist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);