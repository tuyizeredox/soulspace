const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: null }, // Profile picture URL
    role: {
        type: String,
        enum: ['super_admin', 'hospital_admin', 'doctor', 'patient', 'pharmacist', 'insurance_provider', 'emergency_responder'],
        default: 'patient'
    },
    permissions: { type: [String], default: [] },
    profile: {
        phone: { type: String },
        dateOfBirth: { type: Date },
        address: { type: String },
        emergencyContact: { type: String },
        bloodType: { type: String },
        allergies: { type: String },
        chronicConditions: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' } // Reference to associated hospital for admins
}, {
    timestamps: true
});

// Add index for email
userSchema.index({ email: 1 }, { unique: true });

// Add middleware to update profile.updatedAt on save
userSchema.pre('save', function(next) {
    if (this.isModified('profile')) {
        this.profile.updatedAt = new Date();
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;