const express = require('express');
const { body } = require('express-validator');
const auth = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roles');
const validate = require('../middlewares/validate');
const { listEmployees, createEmployee, updateEmployee } = require('../controllers/employeeController');

const router = express.Router();

router.get('/', auth, authorizeRoles('Admin', 'Manager'), listEmployees);

router.post(
  '/',
  auth,
  authorizeRoles('Admin'),
  [
    body('fullName').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['Admin', 'Manager', 'Tailor', 'Cashier'])
  ],
  validate,
  createEmployee
);

router.put('/:id', auth, authorizeRoles('Admin'), updateEmployee);

module.exports = router;
