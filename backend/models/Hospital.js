const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  website: { type: String },
  type: {
    type: String,
    enum: ['general', 'specialty', 'teaching', 'clinic', 'rehabilitation', 'psychiatric'],
    default: 'general'
  },
  beds: { type: Number, default: 0 },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Primary admin
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // All admins including primary
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'maintenance'],
    default: 'active'
  },
  logo: { type: String }
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;