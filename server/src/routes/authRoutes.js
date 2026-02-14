const express = require('express');
const { body } = require('express-validator');
const { login, register, me } = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roles');
const validate = require('../middlewares/validate');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  validate,
  login
);

router.post(
  '/register',
  [
    body('fullName').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['Admin', 'Manager', 'Tailor', 'Cashier'])
  ],
  validate,
  register
);

router.get('/me', auth, me);

module.exports = router;
