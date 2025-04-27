const mongoose = require('mongoose');

const insuranceClaimSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    insuranceProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
});

const InsuranceClaim = mongoose.model('InsuranceClaim', insuranceClaimSchema);

module.exports = InsuranceClaim; 