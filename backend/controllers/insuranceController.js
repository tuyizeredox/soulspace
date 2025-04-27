const InsuranceClaim = require('../models/InsuranceClaim');

exports.createClaim = async (req, res) => {
    const { patientId, insuranceProviderId, amount } = req.body;
    const claim = new InsuranceClaim({ patientId, insuranceProviderId, amount });
    await claim.save();
    res.status(201).json({ claim });
};

exports.getClaims = async (req, res) => {
    const claims = await InsuranceClaim.find().populate('patientId').populate('insuranceProviderId');
    res.json(claims);
}; 