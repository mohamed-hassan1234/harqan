const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { buildPagination } = require('../utils/pagination');
const { logAction } = require('../utils/audit');

const listCustomers = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const { skip, limit: safeLimit, page: safePage } = buildPagination(page, limit);

    const query = { isDeleted: false };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      Customer.countDocuments(query)
    ]);

    res.json({
      items,
      total,
      page: safePage,
      limit: safeLimit
    });
  } catch (err) {
    next(err);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { fullName, phone, address, notes } = req.body;
    const existing = await Customer.findOne({ phone, isDeleted: false });
    if (existing) {
      return res.status(400).json({ message: 'Phone already exists' });
    }

    const customer = await Customer.create({
      fullName,
      phone,
      address,
      notes,
      createdBy: req.user?._id
    });

    await logAction({
      actionType: 'CREATE_CUSTOMER',
      userId: req.user?._id,
      entityType: 'Customer',
      entityId: customer._id,
      newValue: { fullName, phone }
    });

    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
};

const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, isDeleted: false });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, isDeleted: false });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const oldValue = customer.toObject();

    if (req.body.phone && req.body.phone !== customer.phone) {
      const existing = await Customer.findOne({ phone: req.body.phone, isDeleted: false });
      if (existing) {
        return res.status(400).json({ message: 'Phone already exists' });
      }
    }

    const fields = ['fullName', 'phone', 'address', 'notes'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) customer[field] = req.body[field];
    });

    await customer.save();

    await logAction({
      actionType: 'UPDATE_CUSTOMER',
      userId: req.user?._id,
      entityType: 'Customer',
      entityId: customer._id,
      oldValue,
      newValue: customer.toObject()
    });

    res.json(customer);
  } catch (err) {
    next(err);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, isDeleted: false });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const activeOrders = await Order.countDocuments({
      customerId: customer._id,
      isDeleted: false,
      status: { $nin: ['Delivered', 'Cancelled'] }
    });

    if (activeOrders > 0 && req.user.role !== 'Admin') {
      return res.status(400).json({ message: 'Customer has active orders. Admin confirmation required.' });
    }

    if (activeOrders > 0 && req.user.role === 'Admin' && req.query.force !== 'true') {
      return res.status(400).json({ message: 'Set force=true to confirm deletion.' });
    }

    customer.isDeleted = true;
    customer.deletedAt = new Date();
    await customer.save();

    await logAction({
      actionType: 'DELETE_CUSTOMER',
      userId: req.user?._id,
      entityType: 'Customer',
      entityId: customer._id
    });

    res.json({ message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCustomers,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer
};
