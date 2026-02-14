const express = require('express');
const { body } = require('express-validator');
const auth = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roles');
const validate = require('../middlewares/validate');
const {
  createMeasurement,
  getMeasurementsByCustomer,
  updateMeasurement
} = require('../controllers/measurementController');

const router = express.Router();

router.post(
  '/',
  auth,
  authorizeRoles('Admin', 'Manager'),
  [
    body('customerId').notEmpty(),
    body('garmentType').notEmpty()
  ],
  validate,
  createMeasurement
);

router.get('/customer/:customerId', auth, getMeasurementsByCustomer);

router.put('/:id', auth, authorizeRoles('Admin', 'Manager'), updateMeasurement);

module.exports = router;
