const express = require('express');
const auth = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roles');
const { dailyReport, monthlyReport, employeeReport } = require('../controllers/reportController');

const router = express.Router();

router.get('/daily', auth, authorizeRoles('Admin', 'Manager'), dailyReport);
router.get('/monthly', auth, authorizeRoles('Admin', 'Manager'), monthlyReport);
router.get('/employees', auth, authorizeRoles('Admin', 'Manager'), employeeReport);

module.exports = router;
