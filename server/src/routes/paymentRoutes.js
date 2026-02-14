const express = require('express');
const { body } = require('express-validator');
const auth = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roles');
const validate = require('../middlewares/validate');
const {
  addPayment,
  getPaymentsByOrder,
  deletePayment
} = require('../controllers/paymentController');

const router = express.Router();

router.post(
  '/',
  auth,
  authorizeRoles('Admin', 'Manager', 'Cashier'),
  [
    body('orderId').notEmpty(),
    body('amountPaid').isNumeric(),
    body('method').isIn(['Cash', 'Mobile Money', 'Bank'])
  ],
  validate,
  addPayment
);

router.get('/order/:orderId', auth, getPaymentsByOrder);

router.delete('/:id', auth, authorizeRoles('Admin', 'Manager'), deletePayment);

module.exports = router;
