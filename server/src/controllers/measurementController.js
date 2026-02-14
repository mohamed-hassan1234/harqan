const Measurement = require('../models/Measurement');
const Customer = require('../models/Customer');
const { logAction } = require('../utils/audit');

const createMeasurement = async (req, res, next) => {
  try {
    const { customerId, garmentType, isDefault } = req.body;

    const customer = await Customer.findOne({ _id: customerId, isDeleted: false });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    if (isDefault) {
      await Measurement.updateMany(
        { customerId, garmentType },
        { $set: { isDefault: false } }
      );
    }

    const measurement = await Measurement.create({
      ...req.body,
      createdBy: req.user?._id
    });

    await logAction({
      actionType: 'CREATE_MEASUREMENT',
      userId: req.user?._id,
      entityType: 'Measurement',
      entityId: measurement._id,
      newValue: measurement.toObject()
    });

    res.status(201).json(measurement);
  } catch (err) {
    next(err);
  }
};

const getMeasurementsByCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const items = await Measurement.find({ customerId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

const updateMeasurement = async (req, res, next) => {
  try {
    const existing = await Measurement.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Measurement not found' });

    const payload = {
      ...existing.toObject(),
      ...req.body,
      _id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      createdBy: req.user?._id
    };

    if (payload.isDefault) {
      await Measurement.updateMany(
        { customerId: existing.customerId, garmentType: existing.garmentType },
        { $set: { isDefault: false } }
      );
    }

    const newVersion = await Measurement.create(payload);

    await logAction({
      actionType: 'UPDATE_MEASUREMENT',
      userId: req.user?._id,
      entityType: 'Measurement',
      entityId: newVersion._id,
      oldValue: existing.toObject(),
      newValue: newVersion.toObject()
    });

    res.json(newVersion);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMeasurement,
  getMeasurementsByCustomer,
  updateMeasurement
};
