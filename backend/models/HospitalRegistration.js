const mongoose = require('mongoose');

const hospitalRegistrationSchema = new mongoose.Schema({
    hospital: {
        name: { type: String, required: true },
        location: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        license: { type: String, required: true },
        facilities: [String],
        departments: [String],
        status: { 
            type: String, 
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    },
    admin: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        qualifications: { type: String },
        experience: { type: Number }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('HospitalRegistration', hospitalRegistrationSchema);
