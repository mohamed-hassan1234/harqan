const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');

const getDateRange = (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getMonthRange = (month, year) => {
  const y = Number(year);
  const m = Number(month) - 1;
  const start = new Date(y, m, 1, 0, 0, 0, 0);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const dailyReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    const { start, end } = getDateRange(date);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      isDeleted: false
    });

    const orderIds = orders.map((o) => o._id);
    const payments = await Payment.find({
      orderId: { $in: orderIds },
      isDeleted: false
    });

    const totalFinal = orders.reduce((sum, o) => sum + o.finalTotal, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const remaining = Math.max(totalFinal - totalPaid, 0);

    res.json({
      date: start.toISOString().slice(0, 10),
      totalOrders: orders.length,
      totalFinal,
      totalPaid,
      remaining
    });
  } catch (err) {
    next(err);
  }
};

const monthlyReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'month and year are required' });
    }

    const { start, end } = getMonthRange(month, year);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      isDeleted: false
    });

    const orderIds = orders.map((o) => o._id);
    const payments = await Payment.find({
      orderId: { $in: orderIds },
      isDeleted: false
    });

    const totalFinal = orders.reduce((sum, o) => sum + o.finalTotal, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const remaining = Math.max(totalFinal - totalPaid, 0);

    res.json({
      month: Number(month),
      year: Number(year),
      totalOrders: orders.length,
      totalFinal,
      totalPaid,
      remaining
    });
  } catch (err) {
    next(err);
  }
};

const employeeReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const start = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
    const end = to ? new Date(to) : new Date();

    const orders = await Order.find({
      status: 'Delivered',
      deliveredAt: { $gte: start, $lte: end },
      isDeleted: false
    });

    const stats = {};
    orders.forEach((order) => {
      if (!order.assignedTo) return;
      const key = String(order.assignedTo);
      if (!stats[key]) {
        stats[key] = { completedOrders: 0, totalMs: 0 };
      }
      stats[key].completedOrders += 1;
      const delta = order.deliveredAt ? (order.deliveredAt - order.createdAt) : 0;
      stats[key].totalMs += delta;
    });

    const users = await User.find({ _id: { $in: Object.keys(stats) } })
      .select('fullName role');

    const results = users.map((user) => {
      const stat = stats[String(user._id)];
      const avgMs = stat.completedOrders ? Math.round(stat.totalMs / stat.completedOrders) : 0;
      return {
        userId: user._id,
        fullName: user.fullName,
        role: user.role,
        completedOrders: stat.completedOrders,
        averageCompletionMs: avgMs
      };
    });

    res.json({ from: start, to: end, results });
  } catch (err) {
    next(err);
  }
};

module.exports = { dailyReport, monthlyReport, employeeReport };
