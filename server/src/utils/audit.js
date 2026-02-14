const AuditLog = require('../models/AuditLog');

const logAction = async ({
  actionType,
  userId,
  entityType,
  entityId,
  oldValue,
  newValue
}) => {
  try {
    await AuditLog.create({
      actionType,
      userId,
      entityType,
      entityId,
      oldValue,
      newValue
    });
  } catch (err) {
    // Logging should not break main flow
  }
};

module.exports = { logAction };
