const mongoose = require('mongoose');

const methods = ['Cash', 'Mobile Money', 'Bank'];

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    amountPaid: { type: Number, required: true },
    method: { type: String, enum: methods, required: true },
    transactionRef: { type: String, trim: true },
    paidAt: { type: Date, default: Date.now },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiptNumber: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
