const mongoose = require('mongoose');

const healthTipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Nutrition', 'Exercise', 'Mental Health', 'Sleep', 'Preventive Care', 'Chronic Conditions', 'General Wellness'],
    default: 'General Wellness'
  },
  tags: {
    type: [String],
    default: []
  },
  iconName: {
    type: String,
    default: 'TipsAndUpdates'
  },
  color: {
    type: String,
    default: '#4caf50'
  },
  isGeneral: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    default: 'SoulSpace Health'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
healthTipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const HealthTip = mongoose.model('HealthTip', healthTipSchema);

module.exports = HealthTip;
