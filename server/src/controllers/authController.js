const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logAction } = require('../utils/audit');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase(), isDeleted: false });

    if (!user || !user.active) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await user.comparePassword(password || '');
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        active: user.active
      }
    });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    const existing = await User.findOne({ email: email?.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      password,
      role
    });

    await logAction({
      actionType: 'CREATE_USER',
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

const me = async (req, res) => {
  res.json(req.user);
};

module.exports = { login, register, me };
