const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actionType: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    oldValue: { type: Object },
    newValue: { type: Object },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
