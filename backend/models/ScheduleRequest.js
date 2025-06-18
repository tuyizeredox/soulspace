const mongoose = require('mongoose');

const scheduleRequestSchema = new mongoose.Schema({
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
  requestType: {
    type: String,
    enum: ['new_schedule', 'schedule_change', 'time_off', 'shift_swap'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  shiftType: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night', 'full-day'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String
  },
  // For schedule changes - reference to existing schedule
  originalSchedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  },
  // For shift swaps - reference to other doctor
  swapWithDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ScheduleRequest', scheduleRequestSchema);