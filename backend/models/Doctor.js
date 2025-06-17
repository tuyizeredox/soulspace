const mongoose = require('mongoose');

const scheduleSlotSchema = new mongoose.Schema({
  day: { 
    type: String, 
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: { 
    type: String, 
    required: true 
  },
  endTime: { 
    type: String, 
    required: true 
  },
  maxPatients: { 
    type: Number, 
    default: 10 
  },
  slotDuration: { 
    type: Number, 
    default: 30 // in minutes
  },
  breakStartTime: { 
    type: String 
  },
  breakEndTime: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { _id: true });

const scheduleRequestSchema = new mongoose.Schema({
  scheduleSlots: [scheduleSlotSchema],
  requestedDate: { 
    type: Date, 
    default: Date.now 
  },
  effectiveDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  adminComments: { 
    type: String 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approvedAt: { 
    type: Date 
  },
  rejectedAt: { 
    type: Date 
  }
}, { timestamps: true });

const doctorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  specialization: { 
    type: String, 
    default: 'General' 
  },
  department: { 
    type: String, 
    default: 'General' 
  },
  qualifications: { 
    type: String 
  },
  experience: { 
    type: Number, 
    default: 0 
  },
  licenseNumber: {
    type: String
  },
  bio: {
    type: String
  },
  consultationFee: {
    type: Number,
    default: 0
  },
  hospital: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hospital' 
  },
  // Current approved schedule
  currentSchedule: [scheduleSlotSchema],
  // Schedule change requests
  scheduleRequests: [scheduleRequestSchema],
  // Legacy availability (for backward compatibility)
  availability: [{
    day: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    available: { type: Boolean, default: true }
  }],
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }],
  isAvailableForAppointments: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String
  },
  languages: [{
    type: String
  }],
  awards: [{
    title: String,
    year: Number,
    description: String
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date
  }]
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
