const express = require('express');
const { body } = require('express-validator');
const auth = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roles');
const validate = require('../middlewares/validate');
const {
  listOrders,
  createOrder,
  getOrder,
  updateOrder,
  updateOrderStatus,
  assignOrder,
  deleteOrder
} = require('../controllers/orderController');

const router = express.Router();

router.get('/', auth, listOrders);

router.post(
  '/',
  auth,
  authorizeRoles('Admin', 'Manager'),
  [
    body('customerId').notEmpty(),
    body('garmentType').notEmpty(),
    body('deliveryDate').notEmpty(),
    body('priceTotal').isNumeric()
  ],
  validate,
  createOrder
);

router.get('/:id', auth, getOrder);

router.put('/:id', auth, authorizeRoles('Admin', 'Manager'), updateOrder);

router.put(
  '/:id/status',
  auth,
  authorizeRoles('Admin', 'Manager', 'Tailor'),
  [
    body('status').notEmpty()
  ],
  validate,
  updateOrderStatus
);

router.put('/:id/assign', auth, authorizeRoles('Admin', 'Manager'), assignOrder);

router.delete('/:id', auth, authorizeRoles('Admin', 'Manager'), deleteOrder);

module.exports = router;
