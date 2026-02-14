const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Measurement = require('../models/Measurement');
const Payment = require('../models/Payment');
const { generateOrderNumber } = require('../utils/orderNumber');
const { computePaymentStatus, recalcOrderPayment } = require('../utils/paymentStatus');
const { buildPagination } = require('../utils/pagination');
const { logAction } = require('../utils/audit');

const statusFlow = {
  Pending: ['Assigned'],
  Assigned: ['InProgress'],
  InProgress: ['Ready'],
  Ready: ['Delivered'],
  Delivered: [],
  Cancelled: []
};

const canCancel = (role, current) => {
  return ['Admin', 'Manager'].includes(role) && ['Pending', 'Assigned', 'InProgress'].includes(current);
};

const isValidTransition = (current, next, role) => {
  if (current === next) return true;
  if (next === 'Cancelled') return canCancel(role, current);
  return statusFlow[current]?.includes(next);
};

const ensureDeliveryDate = (deliveryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deliveryDate);
  target.setHours(0, 0, 0, 0);
  return target >= today;
};

const normalizeSnapshot = (snapshot) => {
  if (!snapshot || typeof snapshot !== 'object') return {};
  const fields = ['shoulder', 'sleeve', 'length', 'chest', 'waist', 'hip', 'leg'];
  const normalized = {};
  fields.forEach((field) => {
    if (snapshot[field] !== undefined && snapshot[field] !== '') {
      const value = Number(snapshot[field]);
      if (!Number.isNaN(value)) normalized[field] = value;
    }
  });
  if (snapshot.extraFields && typeof snapshot.extraFields === 'object') {
    normalized.extraFields = snapshot.extraFields;
  }
  return normalized;
};

const listOrders = async (req, res, next) => {
  try {
    const { status, dateFrom, dateTo, assignedTo, paymentStatus, customerId, page, limit } = req.query;
    const { skip, limit: safeLimit, page: safePage } = buildPagination(page, limit);

    const query = { isDeleted: false };
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (customerId) query.customerId = customerId;
    if (assignedTo) query.assignedTo = assignedTo;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        query.createdAt.$gte = from;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    if (req.user.role === 'Tailor') {
      query.assignedTo = req.user._id;
    }

    const [items, total] = await Promise.all([
      Order.find(query)
        .populate('customerId', 'fullName phone')
        .populate('assignedTo', 'fullName role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit),
      Order.countDocuments(query)
    ]);

    res.json({ items, total, page: safePage, limit: safeLimit });
  } catch (err) {
    next(err);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const {
      customerId,
      garmentType,
      fabricType,
      color,
      styleNotes,
      measurementId,
      measurementSnapshot,
      deliveryDate,
      priority,
      assignedTo,
      priceTotal,
      discount
    } = req.body;

    const customer = await Customer.findOne({ _id: customerId, isDeleted: false });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    if (!ensureDeliveryDate(deliveryDate)) {
      return res.status(400).json({ message: 'Delivery date must be today or later' });
    }

    let snapshot = normalizeSnapshot(measurementSnapshot);
    let measurementDoc = null;
    if (measurementId) {
      measurementDoc = await Measurement.findById(measurementId);
      if (!measurementDoc) {
        return res.status(404).json({ message: 'Measurement not found' });
      }
      snapshot = {
        garmentType: measurementDoc.garmentType,
        shoulder: measurementDoc.shoulder,
        sleeve: measurementDoc.sleeve,
        length: measurementDoc.length,
        chest: measurementDoc.chest,
        waist: measurementDoc.waist,
        hip: measurementDoc.hip,
        leg: measurementDoc.leg,
        extraFields: measurementDoc.extraFields
      };
    }

    if (!measurementId && Object.keys(snapshot).length === 0) {
      return res.status(400).json({ message: 'Measurement snapshot is required if no measurement set is selected' });
    }

    if (Object.keys(snapshot).length && !snapshot.garmentType) {
      snapshot.garmentType = garmentType;
    }

    const price = Number(priceTotal) || 0;
    const disc = Number(discount) || 0;
    const finalTotal = Math.max(price - disc, 0);

    let orderNumber = generateOrderNumber();
    while (await Order.findOne({ orderNumber })) {
      orderNumber = generateOrderNumber();
    }

    const orderStatus = assignedTo ? 'Assigned' : 'Pending';

    const order = await Order.create({
      orderNumber,
      customerId,
      garmentType,
      fabricType,
      color,
      styleNotes,
      measurementId: measurementDoc?._id,
      measurementSnapshot: snapshot,
      deliveryDate,
      status: orderStatus,
      priority,
      assignedTo: assignedTo || null,
      priceTotal: price,
      discount: disc,
      finalTotal,
      paymentStatus: computePaymentStatus(finalTotal, 0),
      createdBy: req.user?._id,
      statusHistory: [
        { status: orderStatus, userId: req.user?._id }
      ]
    });

    await logAction({
      actionType: 'CREATE_ORDER',
      userId: req.user?._id,
      entityType: 'Order',
      entityId: order._id,
      newValue: order.toObject()
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, isDeleted: false })
      .populate('customerId')
      .populate('assignedTo', 'fullName role')
      .populate('measurementId');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role === 'Tailor' && String(order.assignedTo?._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const payments = await Payment.find({ orderId: order._id, isDeleted: false });

    res.json({ order, payments });
  } catch (err) {
    next(err);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, isDeleted: false });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role === 'Tailor') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.body.deliveryDate && !ensureDeliveryDate(req.body.deliveryDate)) {
      return res.status(400).json({ message: 'Delivery date must be today or later' });
    }

    const oldValue = order.toObject();

    const fields = [
      'garmentType',
      'fabricType',
      'color',
      'styleNotes',
      'deliveryDate',
      'priority',
      'assignedTo',
      'priceTotal',
      'discount'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        order[field] = req.body[field];
      }
    });

    const price = Number(order.priceTotal) || 0;
    const disc = Number(order.discount) || 0;
    order.finalTotal = Math.max(price - disc, 0);

    await order.save();
    await recalcOrderPayment(order._id);

    await logAction({
      actionType: 'UPDATE_ORDER',
      userId: req.user?._id,
      entityType: 'Order',
      entityId: order._id,
      oldValue,
      newValue: order.toObject()
    });

    res.json(order);
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findOne({ _id: req.params.id, isDeleted: false });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role === 'Tailor' && String(order.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!isValidTransition(order.status, status, req.user.role)) {
      return res.status(400).json({ message: 'Invalid status transition' });
    }

    const oldStatus = order.status;
    order.status = status;
    order.statusHistory.push({ status, note, userId: req.user?._id, at: new Date() });

    if (note) {
      order.progressNotes.push({ note, userId: req.user?._id, createdAt: new Date() });
    }

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    await logAction({
      actionType: 'UPDATE_ORDER_STATUS',
      userId: req.user?._id,
      entityType: 'Order',
      entityId: order._id,
      oldValue: { status: oldStatus },
      newValue: { status }
    });

    res.json(order);
  } catch (err) {
    next(err);
  }
};

const assignOrder = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const order = await Order.findOne({ _id: req.params.id, isDeleted: false });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const oldValue = order.toObject();

    order.assignedTo = assignedTo;
    if (order.status === 'Pending') {
      order.status = 'Assigned';
      order.statusHistory.push({ status: 'Assigned', userId: req.user?._id, at: new Date() });
    }

    await order.save();

    await logAction({
      actionType: 'ASSIGN_ORDER',
      userId: req.user?._id,
      entityType: 'Order',
      entityId: order._id,
      oldValue,
      newValue: order.toObject()
    });

    res.json(order);
  } catch (err) {
    next(err);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, isDeleted: false });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isDeleted = true;
    order.deletedAt = new Date();
    await order.save();

    await logAction({
      actionType: 'DELETE_ORDER',
      userId: req.user?._id,
      entityType: 'Order',
      entityId: order._id
    });

    res.json({ message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listOrders,
  createOrder,
  getOrder,
  updateOrder,
  updateOrderStatus,
  assignOrder,
  deleteOrder
};
