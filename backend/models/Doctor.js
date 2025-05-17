const mongoose = require('mongoose');

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
  hospital: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hospital' 
  },
  availability: [{
    day: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    available: { type: Boolean, default: true }
  }],
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }]
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
