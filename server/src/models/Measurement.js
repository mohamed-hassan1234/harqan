const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    garmentType: { type: String, required: true, trim: true },
    shoulder: { type: Number },
    sleeve: { type: Number },
    length: { type: Number },
    chest: { type: Number },
    waist: { type: Number },
    hip: { type: Number },
    leg: { type: Number },
    extraFields: { type: Object, default: {} },
    isDefault: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Measurement', measurementSchema);
