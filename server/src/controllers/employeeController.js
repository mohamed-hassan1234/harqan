const User = require('../models/User');
const { logAction } = require('../utils/audit');

const listEmployees = async (req, res, next) => {
  try {
    const users = await User.find({ isDeleted: false }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    const existing = await User.findOne({ email: email?.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      password,
      role
    });

    await logAction({
      actionType: 'CREATE_EMPLOYEE',
      userId: req.user?._id,
      entityType: 'User',
      entityId: user._id,
      newValue: { fullName: user.fullName, email: user.email, role: user.role }
    });

    res.status(201).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      active: user.active
    });
  } catch (err) {
    next(err);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) return res.status(404).json({ message: 'Employee not found' });

    const oldValue = user.toObject();

    const fields = ['fullName', 'email', 'phone', 'role', 'active'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    if (req.body.email) {
      user.email = req.body.email.toLowerCase();
    }

    await user.save();

    await logAction({
      actionType: 'UPDATE_EMPLOYEE',
      userId: req.user?._id,
      entityType: 'User',
      entityId: user._id,
      oldValue,
      newValue: user.toObject()
    });

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      active: user.active
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listEmployees, createEmployee, updateEmployee };
