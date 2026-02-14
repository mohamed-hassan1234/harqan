const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { generateReceiptNumber } = require('../utils/receiptNumber');
const { recalcOrderPayment } = require('../utils/paymentStatus');
const { logAction } = require('../utils/audit');

const addPayment = async (req, res, next) => {
  try {
    const { orderId, amountPaid, method, transactionRef, paidAt } = req.body;
    const order = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const amount = Number(amountPaid) || 0;
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    let receiptNumber = generateReceiptNumber();
    while (await Payment.findOne({ receiptNumber })) {
      receiptNumber = generateReceiptNumber();
    }

    const payment = await Payment.create({
      orderId,
      amountPaid: amount,
      method,
      transactionRef,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
      receivedBy: req.user?._id,
      receiptNumber
    });

    const recalculated = await recalcOrderPayment(order._id);

    await logAction({
      actionType: 'UPDATE_PAYMENT',
      userId: req.user?._id,
      entityType: 'Payment',
      entityId: payment._id,
      newValue: payment.toObject()
    });

    res.status(201).json({ payment, ...recalculated });
  } catch (err) {
    next(err);
  }
};

const getPaymentsByOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const payments = await Payment.find({ orderId, isDeleted: false }).sort({ paidAt: -1 });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, isDeleted: false });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.isDeleted = true;
    payment.deletedAt = new Date();
    await payment.save();

    const recalculated = await recalcOrderPayment(payment.orderId);

    await logAction({
      actionType: 'DELETE_PAYMENT',
      userId: req.user?._id,
      entityType: 'Payment',
      entityId: payment._id
    });

    res.json({ message: 'Payment deleted', ...recalculated });
  } catch (err) {
    next(err);
  }
};

module.exports = { addPayment, getPaymentsByOrder, deletePayment };
