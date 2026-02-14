const mongoose = require('mongoose');

const statusEnum = ['Pending', 'Assigned', 'InProgress', 'Ready', 'Delivered', 'Cancelled'];
const priorityEnum = ['Low', 'Medium', 'High'];
const paymentStatusEnum = ['Unpaid', 'Partial', 'Paid'];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    garmentType: { type: String, required: true, trim: true },
    fabricType: { type: String, trim: true },
    color: { type: String, trim: true },
    styleNotes: { type: String, trim: true },
    measurementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Measurement' },
    measurementSnapshot: { type: Object, default: {} },
    deliveryDate: { type: Date, required: true },
    status: { type: String, enum: statusEnum, default: 'Pending' },
    priority: { type: String, enum: priorityEnum, default: 'Medium' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priceTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalTotal: { type: Number, required: true },
    paymentStatus: { type: String, enum: paymentStatusEnum, default: 'Unpaid' },
    progressNotes: [
      {
        note: { type: String, trim: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    statusHistory: [
      {
        status: { type: String, enum: statusEnum },
        note: { type: String, trim: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now }
      }
    ],
    deliveredAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
