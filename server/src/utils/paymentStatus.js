const Order = require('../models/Order');
const Payment = require('../models/Payment');

const computePaymentStatus = (finalTotal, paidSum) => {
  if (paidSum <= 0) return 'Unpaid';
  if (paidSum >= finalTotal) return 'Paid';
  return 'Partial';
};

const recalcOrderPayment = async (orderId) => {
  const [order, payments] = await Promise.all([
    Order.findById(orderId),
    Payment.find({ orderId, isDeleted: false })
  ]);

  if (!order) return null;

  const paidSum = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const finalTotal = order.finalTotal;
  const remaining = Math.max(finalTotal - paidSum, 0);
  order.paymentStatus = computePaymentStatus(finalTotal, paidSum);
  await order.save();

  return { order, paidSum, remaining };
};

module.exports = { computePaymentStatus, recalcOrderPayment };
