const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'appointment',
      'message',
      'prescription',
      'lab_result',
      'system',
      'reminder',
      'hospital',
      'user',
      'analytics',
      'security',
      'warning',
      'info',
      'success',
      'error',
      'alert'
    ],
    default: 'system'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  read: {
    type: Boolean,
    default: false
  },
  actionLink: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
