const express = require('express');
const { body } = require('express-validator');
const auth = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roles');
const validate = require('../middlewares/validate');
const {
  listCustomers,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

const router = express.Router();

router.get('/', auth, listCustomers);

router.post(
  '/',
  auth,
  authorizeRoles('Admin', 'Manager'),
  [
    body('fullName').notEmpty(),
    body('phone').notEmpty()
  ],
  validate,
  createCustomer
);

router.get('/:id', auth, getCustomer);

router.put(
  '/:id',
  auth,
  authorizeRoles('Admin', 'Manager'),
  validate,
  updateCustomer
);

router.delete('/:id', auth, authorizeRoles('Admin', 'Manager'), deleteCustomer);

module.exports = router;
