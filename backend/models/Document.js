const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'prescription',
      'medical_report',
      'lab_orders',
      'test_results',
      'follow_up_instructions',
      'medication_plan',
      'sick_note',
      'visit_summary'
    ]
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  isEncrypted: {
    type: Boolean,
    default: true
  },
  encryptionKey: {
    type: String,
    select: false // Don't include in queries by default
  },
  signature: {
    doctorSignature: String,
    signedAt: Date,
    signatureMethod: {
      type: String,
      enum: ['digital', 'drawn', 'uploaded'],
      default: 'digital'
    }
  },
  metadata: {
    aiGenerated: {
      type: Boolean,
      default: false
    },
    aiSummary: String,
    images: [{
      url: String,
      type: String,
      description: String
    }],
    qrCode: String,
    tags: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'downloaded'],
    default: 'draft'
  },
  sentAt: Date,
  viewedAt: Date,
  downloadedAt: Date,
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
documentSchema.index({ patientId: 1, type: 1, createdAt: -1 });
documentSchema.index({ doctorId: 1, createdAt: -1 });
documentSchema.index({ hospitalId: 1, type: 1 });
documentSchema.index({ status: 1, expiresAt: 1 });

// Virtual for patient population
documentSchema.virtual('patient', {
  ref: 'Patient',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

// Virtual for doctor population
documentSchema.virtual('doctor', {
  ref: 'Doctor',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});

// Virtual for hospital population
documentSchema.virtual('hospital', {
  ref: 'Hospital',
  localField: 'hospitalId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
documentSchema.set('toJSON', { virtuals: true });
documentSchema.set('toObject', { virtuals: true });

// Pre-save middleware to set expiration for certain document types
documentSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiration based on document type
    const expirationDays = {
      'prescription': 30,
      'lab_orders': 7,
      'sick_note': 90,
      'test_results': 365,
      'medical_report': 365,
      'follow_up_instructions': 60,
      'medication_plan': 90,
      'visit_summary': 365
    };
    
    const days = expirationDays[this.type] || 365;
    this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema);